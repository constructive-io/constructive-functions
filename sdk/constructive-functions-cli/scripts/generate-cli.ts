import {
  generateMulti,
  expandSchemaDirToMultiTarget,
} from '@constructive-io/graphql-codegen';

const SCHEMA_DIR = '../constructive-functions-schema/schemas';

async function main() {
  console.log('Generating CLI from schema files...');
  console.log(`Schema directory: ${SCHEMA_DIR}`);

  const baseConfig = {
    schemaDir: SCHEMA_DIR,
    output: './src',
    orm: true,
    cli: {
      toolName: 'constructive-functions',
      entryPoint: true,
    },
    docs: { skills: true, agents: false },
    verbose: true,
  };

  const expanded = expandSchemaDirToMultiTarget(baseConfig);
  if (!expanded) {
    console.error('No .graphql files found in schema directory.');
    console.error('Run "pnpm run generate" in constructive-functions-schema first.');
    process.exit(1);
  }

  console.log(`Found targets: ${Object.keys(expanded).join(', ')}`);

  const { results, hasError } = await generateMulti({
    configs: expanded,
    cleanStaleTargets: true,
    unifiedCli: {
      toolName: 'constructive-functions',
      entryPoint: true,
    },
  });

  let realError = false;

  for (const { name, result } of results) {
    if (result.success) {
      console.log(`[${name}] ${result.message}`);
      if (result.tables?.length) {
        console.log(`  Tables: ${result.tables.join(', ')}`);
      }
    } else if (result.message?.includes('No tables found')) {
      console.log(`[${name}] SKIP: no tables (empty schema)`);
    } else {
      console.error(`[${name}] ERROR: ${result.message}`);
      realError = true;
    }
  }

  if (realError) {
    console.error('\nCLI generation failed for one or more targets');
    process.exit(1);
  }

  console.log('\nCLI generation completed successfully!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
