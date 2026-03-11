/**
 * Shared setup/teardown for the object_store_public schema used by
 * process-file and delete-s3-object e2e tests.
 *
 * Creates the schema, enum, table, and triggers once. Multiple test
 * suites can safely call setup() concurrently — CREATE IF NOT EXISTS
 * prevents duplication. Teardown only drops if explicitly requested
 * (e.g., from a global teardown hook).
 */
import { Client as PgClient } from 'pg';

const SCHEMA = 'object_store_public';
const TABLE = 'files';

export function makePgClient(): PgClient {
  return new PgClient({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'password',
    database: 'constructive',
  });
}

export async function setupObjectStoreSchema(pg: PgClient): Promise<void> {
  await pg.query(`CREATE SCHEMA IF NOT EXISTS ${SCHEMA}`);

  await pg.query(`
    DO $$ BEGIN
      CREATE TYPE ${SCHEMA}.file_status AS ENUM (
        'pending', 'processing', 'ready', 'error', 'deleting'
      );
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);

  await pg.query(`
    CREATE TABLE IF NOT EXISTS ${SCHEMA}.${TABLE} (
      id              uuid          NOT NULL DEFAULT gen_random_uuid(),
      database_id     integer       NOT NULL,
      bucket_key      text          NOT NULL DEFAULT 'default',
      key             text          NOT NULL,
      status          ${SCHEMA}.file_status NOT NULL DEFAULT 'pending',
      status_reason   text,
      etag            text,
      source_table    text,
      source_column   text,
      source_id       uuid,
      processing_started_at timestamptz,
      created_by      uuid,
      created_at      timestamptz   NOT NULL DEFAULT now(),
      updated_at      timestamptz   NOT NULL DEFAULT now(),
      CONSTRAINT object_store_files_pkey PRIMARY KEY (id, database_id)
    )
  `);

  // State machine trigger
  await pg.query(`
    CREATE OR REPLACE FUNCTION ${SCHEMA}.files_before_update_timestamp()
    RETURNS trigger AS $fn$
    BEGIN
      NEW.updated_at := now();
      IF OLD.status IS DISTINCT FROM NEW.status THEN
        IF NOT (
          (OLD.status = 'pending'    AND NEW.status IN ('processing', 'error'))
          OR (OLD.status = 'processing' AND NEW.status IN ('ready', 'error', 'deleting'))
          OR (OLD.status = 'ready'      AND NEW.status = 'deleting')
          OR (OLD.status = 'error'      AND NEW.status IN ('deleting', 'pending'))
        ) THEN
          RAISE EXCEPTION 'Invalid status transition from % to %', OLD.status, NEW.status;
        END IF;
        IF NEW.status = 'processing' THEN
          NEW.processing_started_at := now();
        ELSIF OLD.status = 'processing' AND NEW.status <> 'processing' THEN
          NEW.processing_started_at := NULL;
        END IF;
      END IF;
      RETURN NEW;
    END;
    $fn$ LANGUAGE plpgsql
  `);

  await pg.query(`
    DROP TRIGGER IF EXISTS files_before_update_timestamp ON ${SCHEMA}.${TABLE};
    CREATE TRIGGER files_before_update_timestamp
      BEFORE UPDATE ON ${SCHEMA}.${TABLE}
      FOR EACH ROW
      EXECUTE FUNCTION ${SCHEMA}.files_before_update_timestamp()
  `);
}

export async function teardownObjectStoreSchema(pg: PgClient): Promise<void> {
  await pg.query(`DROP TABLE IF EXISTS ${SCHEMA}.${TABLE} CASCADE`);
  await pg.query(`DROP FUNCTION IF EXISTS ${SCHEMA}.files_before_update_timestamp CASCADE`);
  await pg.query(`DROP TYPE IF EXISTS ${SCHEMA}.file_status CASCADE`);
  await pg.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
}

export async function cleanObjectStoreRows(pg: PgClient): Promise<void> {
  await pg.query(`DELETE FROM ${SCHEMA}.${TABLE}`);
}
