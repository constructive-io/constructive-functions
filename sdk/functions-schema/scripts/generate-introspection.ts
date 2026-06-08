import { PgpmPackage } from '@pgpmjs/core';
import fs from 'fs';
import { buildIntrospectionJSON } from 'graphile-schema';
import path from 'path';
import { createEphemeralDb } from 'pgsql-client';
import { deployPgpm } from 'pgsql-seed';

const MODULE_PATH = path.resolve(__dirname, '../../../pgpm/constructive-infra');
const INTROSPECTION_DIR = path.resolve(__dirname, '../introspection');

const ALL_PUBLIC_SCHEMAS = ['constructive_infra_public'] as const;

async function main() {
  console.log('Generating introspection JSON...');
  console.log(`Module: ${MODULE_PATH}`);

  const pkg = new PgpmPackage(MODULE_PATH);
  if (!pkg.isInModule()) {
    console.error(`Not a valid PGPM module: ${MODULE_PATH}`);
    process.exit(1);
  }

  console.log('Creating ephemeral database...');
  const { config: dbConfig, teardown } = createEphemeralDb({
    prefix: 'codegen_introspection_',
    verbose: false,
  });
  console.log(`Database: ${dbConfig.database}`);

  try {
    console.log('Deploying PGPM module...');
    await deployPgpm(dbConfig, MODULE_PATH, false);
    console.log('PGPM deployment complete.');

    fs.mkdirSync(INTROSPECTION_DIR, { recursive: true });

    console.log(`Schemas: ${ALL_PUBLIC_SCHEMAS.join(', ')}`);
    console.log('Building introspection metadata...');

    const tables = await buildIntrospectionJSON({
      database: dbConfig.database!,
      schemas: [...ALL_PUBLIC_SCHEMAS],
    });

    const outPath = path.join(INTROSPECTION_DIR, 'introspection.json');
    fs.writeFileSync(outPath, JSON.stringify(tables, null, 2), 'utf-8');
    console.log(`Written: ${outPath} (${tables.length} tables)`);

    console.log('\nIntrospection JSON generated successfully!');
  } finally {
    teardown({ keepDb: false });
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
