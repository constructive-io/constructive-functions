/**
 * Shared setup/teardown for the files_store_public schema used by
 * process-file and delete-s3-object e2e tests.
 *
 * Creates the schema, enum, table, and triggers once. Multiple test
 * suites can safely call setup() concurrently — CREATE IF NOT EXISTS
 * prevents duplication. Teardown only drops if explicitly requested
 * (e.g., from a global teardown hook).
 */
import { Client as PgClient } from 'pg';

const SCHEMA = 'files_store_public';
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

export async function setupFilesStoreSchema(pg: PgClient): Promise<void> {
  await pg.query('CREATE EXTENSION IF NOT EXISTS pgcrypto');
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
      origin_id       uuid,
      mime_type       text,
      created_at      timestamptz   NOT NULL DEFAULT now(),
      updated_at      timestamptz   NOT NULL DEFAULT now(),
      CONSTRAINT files_store_files_pkey PRIMARY KEY (id, database_id)
    )
  `);

  // Ensure new columns exist on pre-existing tables (CREATE TABLE IF NOT EXISTS
  // does not add missing columns to an already-existing table)
  await pg.query(`ALTER TABLE ${SCHEMA}.${TABLE} ADD COLUMN IF NOT EXISTS origin_id uuid`);
  await pg.query(`ALTER TABLE ${SCHEMA}.${TABLE} ADD COLUMN IF NOT EXISTS mime_type text`);

  // Self-referential FK (version -> origin)
  await pg.query(`
    DO $$ BEGIN
      ALTER TABLE ${SCHEMA}.${TABLE}
        ADD CONSTRAINT files_origin_fk
        FOREIGN KEY (origin_id, database_id)
        REFERENCES ${SCHEMA}.${TABLE} (id, database_id)
        ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$
  `);

  // Index for version lookups
  await pg.query(`
    CREATE INDEX IF NOT EXISTS files_origin_id_idx
      ON ${SCHEMA}.${TABLE} (origin_id, database_id)
      WHERE origin_id IS NOT NULL
  `);

  await pg.query(`
    CREATE OR REPLACE FUNCTION ${SCHEMA}.populate_file_back_reference()
    RETURNS trigger AS $fn$
    DECLARE
      col_name text := TG_ARGV[0];
      table_name text := TG_ARGV[1];
      new_val jsonb;
      old_val jsonb;
      new_key text;
      old_key text;
      db_id integer;
      origin_file_id uuid;
      old_origin_file_id uuid;
      versions_json json;
    BEGIN
      db_id := current_setting('app.database_id')::integer;

      EXECUTE format('SELECT ($1).%I::jsonb', col_name) INTO new_val USING NEW;
      EXECUTE format('SELECT ($1).%I::jsonb', col_name) INTO old_val USING OLD;

      new_key := new_val ->> 'key';
      old_key := old_val ->> 'key';

      IF new_key IS NOT DISTINCT FROM old_key THEN
        RETURN NEW;
      END IF;

      IF old_key IS NOT NULL AND old_key <> '' THEN
        SELECT id INTO old_origin_file_id
        FROM ${SCHEMA}.${TABLE}
        WHERE key = old_key AND database_id = db_id;

        IF old_origin_file_id IS NOT NULL THEN
          UPDATE ${SCHEMA}.${TABLE}
          SET status = 'deleting', status_reason = 'replaced by new file'
          WHERE id = old_origin_file_id AND database_id = db_id
            AND status NOT IN ('deleting');

          UPDATE ${SCHEMA}.${TABLE}
          SET status = 'deleting', status_reason = 'replaced by new file'
          WHERE origin_id = old_origin_file_id AND database_id = db_id
            AND status NOT IN ('deleting');
        END IF;
      END IF;

      IF new_key IS NOT NULL AND new_key <> '' THEN
        SELECT id INTO origin_file_id
        FROM ${SCHEMA}.${TABLE}
        WHERE key = new_key AND database_id = db_id;

        IF origin_file_id IS NOT NULL THEN
          UPDATE ${SCHEMA}.${TABLE}
          SET source_table = table_name, source_column = col_name, source_id = NEW.id
          WHERE id = origin_file_id AND database_id = db_id;

          UPDATE ${SCHEMA}.${TABLE}
          SET source_table = table_name, source_column = col_name, source_id = NEW.id
          WHERE origin_id = origin_file_id AND database_id = db_id;

          SELECT json_agg(json_build_object(
            'key', f.key,
            'mime', COALESCE(f.mime_type, 'image/jpeg'),
            'width', 0,
            'height', 0
          ))
          INTO versions_json
          FROM ${SCHEMA}.${TABLE} f
          WHERE f.origin_id = origin_file_id
            AND f.database_id = db_id
            AND f.status = 'ready';

          IF versions_json IS NOT NULL THEN
            EXECUTE format(
              'UPDATE %s SET %I = jsonb_set(COALESCE(%I, ''{}''::jsonb), ''{versions}'', $1::jsonb) WHERE id = $2',
              table_name, col_name, col_name
            ) USING versions_json, NEW.id;
          END IF;
        END IF;
      END IF;

      RETURN NEW;
    END;
    $fn$ LANGUAGE plpgsql
  `);

  await pg.query(`
    CREATE OR REPLACE FUNCTION ${SCHEMA}.mark_files_deleting_on_source_delete()
    RETURNS trigger AS $fn$
    DECLARE
      col_name text := TG_ARGV[0];
      table_name text := TG_ARGV[1];
      db_id integer;
    BEGIN
      db_id := current_setting('app.database_id')::integer;

      UPDATE ${SCHEMA}.${TABLE}
      SET status = 'deleting', status_reason = 'source row deleted'
      WHERE database_id = db_id
        AND source_table = table_name
        AND source_column = col_name
        AND source_id = OLD.id
        AND status <> 'deleting';

      RETURN OLD;
    END;
    $fn$ LANGUAGE plpgsql
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

  // Propagate deleting status from origin to version rows
  await pg.query(`
    CREATE OR REPLACE FUNCTION ${SCHEMA}.files_propagate_deleting_to_versions()
    RETURNS trigger AS $fn$
    BEGIN
      UPDATE ${SCHEMA}.${TABLE}
      SET status = 'deleting', status_reason = COALESCE(NEW.status_reason, 'origin marked deleting')
      WHERE origin_id = NEW.id
        AND database_id = NEW.database_id
        AND status NOT IN ('deleting');
      RETURN NEW;
    END;
    $fn$ LANGUAGE plpgsql
  `);

  await pg.query(`
    DROP TRIGGER IF EXISTS files_after_update_propagate_deleting ON ${SCHEMA}.${TABLE};
    CREATE TRIGGER files_after_update_propagate_deleting
      AFTER UPDATE ON ${SCHEMA}.${TABLE}
      FOR EACH ROW
      WHEN (NEW.status = 'deleting' AND OLD.status <> 'deleting' AND NEW.origin_id IS NULL)
      EXECUTE FUNCTION ${SCHEMA}.files_propagate_deleting_to_versions()
  `);
}

export async function teardownFilesStoreSchema(pg: PgClient): Promise<void> {
  await pg.query(`DROP TABLE IF EXISTS ${SCHEMA}.${TABLE} CASCADE`);
  await pg.query(`DROP FUNCTION IF EXISTS ${SCHEMA}.files_propagate_deleting_to_versions CASCADE`);
  await pg.query(`DROP FUNCTION IF EXISTS ${SCHEMA}.mark_files_deleting_on_source_delete CASCADE`);
  await pg.query(`DROP FUNCTION IF EXISTS ${SCHEMA}.populate_file_back_reference CASCADE`);
  await pg.query(`DROP FUNCTION IF EXISTS ${SCHEMA}.files_before_update_timestamp CASCADE`);
  await pg.query(`DROP TYPE IF EXISTS ${SCHEMA}.file_status CASCADE`);
  await pg.query(`DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE`);
}

export async function cleanFilesStoreRows(pg: PgClient): Promise<void> {
  await pg.query(`DELETE FROM ${SCHEMA}.${TABLE}`);
}
