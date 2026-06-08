import { PgpmPackage } from '@pgpmjs/core';
import fs from 'fs';
import { buildSchemaSDL } from 'graphile-schema';
import path from 'path';
import { createEphemeralDb } from 'pgsql-client';
import { deployPgpm } from 'pgsql-seed';

// The pgpm module that owns the infra schemas. Deployed to an ephemeral DB so we
// can introspect a real PostGraphile schema from the live catalog.
const MODULE_PATH = path.resolve(__dirname, '../../../pgpm/constructive-infra');
const SCHEMAS_DIR = path.resolve(__dirname, '../schemas');
const INDEX_PATH = path.resolve(__dirname, '../src/index.ts');

// ==========================================================================
// API target -> Postgres schema mapping
// ==========================================================================
// Each key becomes a generated `<key>.graphql` file and, downstream, a separate
// ORM target. constructive_infra_public holds the platform function registry:
// platform_function_definitions / _invocations / _execution_logs /
// _secret_definitions / platform_namespaces / platform_namespace_events.
const API_SCHEMA_MAP: Record<string, readonly string[]> = {
  infra: ['constructive_infra_public'],
};

async function main() {
  const apiNames = Object.keys(API_SCHEMA_MAP);
  console.log('Generating schemas for all APIs...');
  console.log(`APIs: ${apiNames.join(', ')}`);
  console.log(`Module: ${MODULE_PATH}`);

  const pkg = new PgpmPackage(MODULE_PATH);
  if (!pkg.isInModule()) {
    console.error(`Not a valid PGPM module: ${MODULE_PATH}`);
    process.exit(1);
  }

  console.log('Creating ephemeral database...');
  const { config: dbConfig, teardown } = createEphemeralDb({
    prefix: 'codegen_schema_export_',
    verbose: false,
  });
  console.log(`Database: ${dbConfig.database}`);

  try {
    console.log('Deploying PGPM module...');
    await deployPgpm(dbConfig, MODULE_PATH, false);
    console.log('PGPM deployment complete.');

    fs.mkdirSync(SCHEMAS_DIR, { recursive: true });

    let hasError = false;

    for (const apiName of apiNames) {
      const schemas = [...API_SCHEMA_MAP[apiName]];
      console.log(`\n[${apiName}] Schemas: ${schemas.join(', ')}`);

      try {
        console.log(`[${apiName}] Building SDL...`);
        const sdl = await buildSchemaSDL({
          database: dbConfig.database!,
          schemas,
        });

        if (!sdl.trim()) {
          console.error(`[${apiName}] ERROR: Empty schema returned`);
          hasError = true;
          continue;
        }

        const outPath = path.join(SCHEMAS_DIR, `${apiName}.graphql`);
        fs.writeFileSync(outPath, sdl, 'utf-8');
        console.log(`[${apiName}] Written: ${outPath} (${sdl.length} bytes)`);
      } catch (err) {
        console.error(
          `[${apiName}] ERROR: ${err instanceof Error ? err.message : String(err)}`,
        );
        hasError = true;
      }
    }

    if (hasError) {
      console.error('\nSchema generation failed for one or more APIs');
      process.exit(1);
    }

    // Auto-generate src/index.ts from API_SCHEMA_MAP keys
    const indexContent = [
      `export const API_NAMES = ${JSON.stringify(apiNames)} as const;`,
      '',
      'export type ApiName = (typeof API_NAMES)[number];',
      '',
    ].join('\n');
    fs.mkdirSync(path.dirname(INDEX_PATH), { recursive: true });
    fs.writeFileSync(INDEX_PATH, indexContent, 'utf-8');
    console.log(`\nWrote ${INDEX_PATH}`);

    console.log('\nSchema generation completed successfully!');
  } finally {
    teardown({ keepDb: false });
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
