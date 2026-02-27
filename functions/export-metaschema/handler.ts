import type { PgpmFunctionContext, PgpmFunctionHandler } from '@constructive-io/fn-pgpm-runtime';
import { DEFAULT_DATABASE_NAME } from '@constructive-io/fn-core';
import { exportMigrations } from '@pgpmjs/core';
import { getPgPool } from 'pg-cache';
import { resolve } from 'path';

type ExportMetaschemaParams = {
  dbname?: string;
  databaseName?: string;
  author?: string;
  extensionName?: string;
  metaExtensionName?: string;
  schema_names?: string[];
  outdir?: string;
  skipSchemaRenaming?: boolean;
};

const handler: PgpmFunctionHandler<ExportMetaschemaParams> = async (
  params: ExportMetaschemaParams,
  context: PgpmFunctionContext
) => {
  const { project, options, log, env } = context;

  // Resolve database name: params > PGDATABASE env > default
  const dbname = params.dbname || env.PGDATABASE || DEFAULT_DATABASE_NAME;

  log.info('[export-metaschema] Connecting to database', { dbname });

  const pgPool = getPgPool({ database: dbname });

  // Discover database_id and name from metaschema
  const dbsResult = await pgPool.query(
    'SELECT id, name FROM metaschema_public.database'
  );

  if (!dbsResult.rows.length) {
    throw new Error(`No databases found in metaschema_public.database on ${dbname}`);
  }

  const targetRow = params.databaseName
    ? dbsResult.rows.find((r: any) => r.name === params.databaseName)
    : dbsResult.rows[0];

  if (!targetRow) {
    throw new Error(`Database '${params.databaseName}' not found in metaschema_public.database`);
  }

  const databaseName = targetRow.name;
  const database_ids = [targetRow.id];

  // Discover schemas if not provided
  let schema_names = params.schema_names;
  if (!schema_names?.length) {
    const schemasResult = await pgPool.query(
      'SELECT schema_name FROM metaschema_public.schema WHERE database_id = $1',
      [database_ids[0]]
    );
    schema_names = schemasResult.rows.map((r: any) => r.schema_name);
  }

  if (!schema_names?.length) {
    throw new Error(`No schemas found for database '${databaseName}'`);
  }

  const author = params.author || 'Constructive <developers@constructive.io>';
  const extensionName = params.extensionName || databaseName;
  const metaExtensionName = params.metaExtensionName || `${databaseName}-service`;

  log.info('[export-metaschema] Starting export', {
    dbname,
    databaseName,
    database_ids,
    extensionName,
    schema_names
  });

  project.ensureWorkspace();
  project.resetCwd(project.workspacePath);

  const outdir = params.outdir ?? resolve(project.workspacePath, 'packages/');

  await exportMigrations({
    project,
    options,
    dbInfo: {
      dbname,
      databaseName,
      database_ids
    },
    author,
    outdir,
    schema_names,
    extensionName,
    metaExtensionName,
    skipSchemaRenaming: params.skipSchemaRenaming
  });

  log.info('[export-metaschema] Export complete');

  return { complete: true };
};

export default handler;
