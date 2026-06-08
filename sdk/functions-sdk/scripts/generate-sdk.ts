import {
  expandSchemaDirToMultiTarget,
  generateMulti,
} from '@constructive-io/graphql-codegen';
import * as fs from 'fs';
import * as path from 'path';

const SCHEMA_DIR = '../functions-schema/schemas';
const SRC_DIR = path.resolve(__dirname, '../src');

// Targets that exist only as internal schemas and should not get an ORM client.
const EXCLUDE_TARGETS: string[] = [];

async function main() {
  console.log('Generating SDK from schema files...');
  console.log(`Schema directory: ${SCHEMA_DIR}`);

  const baseConfig = {
    schemaDir: SCHEMA_DIR,
    output: './src',
    orm: true,
    docs: { skills: true, agents: false },
    verbose: true,
  };

  const expanded = expandSchemaDirToMultiTarget(baseConfig);
  if (!expanded) {
    console.error('No .graphql files found in schema directory.');
    console.error(
      'Run "pnpm run generate" in @constructive-io/functions-schema first.',
    );
    process.exit(1);
  }

  for (const target of EXCLUDE_TARGETS) {
    if (target in expanded) {
      delete expanded[target];
      console.log(`Excluding target: ${target}`);
    }
  }

  console.log(`Found targets: ${Object.keys(expanded).join(', ')}`);

  const { results, hasError } = await generateMulti({
    configs: expanded,
    cleanStaleTargets: true,
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

  if (realError || hasError) {
    console.error('\nSDK generation failed for one or more targets');
    process.exit(1);
  }

  // generateMulti only writes the root barrel (src/index.ts) when there are
  // 2+ targets. We have a single target today, so write the barrel ourselves so
  // the package always has a stable entry point that re-exports every target.
  const targets = results
    .filter((r) => r.result.success && r.result.tables?.length)
    .map((r) => r.name)
    .sort();

  for (const target of targets) {
    stubMissingCompositeInputs(target);
  }

  writeRootBarrel(targets);

  console.log('\nSDK generation completed successfully!');
}

/**
 * PostGraphile exposes PostgreSQL composite types (e.g. `function_requirement`)
 * as both an object type (`FunctionRequirement`) and an input type
 * (`FunctionRequirementInput`). The ORM codegen stubs the object form as
 * `export type FunctionRequirement = unknown;` but does not emit the `*Input`
 * counterpart, leaving dangling references that break `tsc`.
 *
 * This appends `export type <Name>Input = unknown;` for any input type that is
 * referenced in the generated code but never declared, mirroring how codegen
 * already treats the object form. It is derived from the exported SDL so it
 * stays in sync as the schema evolves.
 */
function stubMissingCompositeInputs(target: string) {
  const targetDir = path.join(SRC_DIR, target);
  // SCHEMA_DIR is relative to the package root (cwd), matching how
  // expandSchemaDirToMultiTarget resolves it.
  const sdlPath = path.resolve(process.cwd(), SCHEMA_DIR, `${target}.graphql`);
  if (!fs.existsSync(sdlPath)) return;

  const sdl = fs.readFileSync(sdlPath, 'utf-8');
  const inputNames = new Set<string>();
  // Only match real GraphQL input type definitions (`input Name {`), not the
  // word "input" appearing inside description strings.
  const inputRe = /(?:^|\n)\s*input\s+(\w+)\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = inputRe.exec(sdl)) !== null) inputNames.add(m[1]);

  const files = listTsFiles(targetDir);
  const sources = files.map((f) => fs.readFileSync(f, 'utf-8'));
  const combined = sources.join('\n');

  const declared = new Set<string>();
  const declRe = /export\s+(?:type|interface|enum|const)\s+(\w+)/g;
  while ((m = declRe.exec(combined)) !== null) declared.add(m[1]);

  const missing = [...inputNames].filter(
    (name) =>
      !declared.has(name) &&
      new RegExp(`\\b${name}\\b`).test(combined),
  );
  if (missing.length === 0) return;

  const inputTypesPath = path.join(targetDir, 'orm', 'input-types.ts');
  if (!fs.existsSync(inputTypesPath)) return;

  const banner =
    '\n// Composite input types stubbed by scripts/generate-sdk.ts ' +
    '(codegen emits the object form as `unknown` but omits these).\n';
  const stubs = missing
    .sort()
    .map((name) => `export type ${name} = unknown;`)
    .join('\n');
  fs.appendFileSync(inputTypesPath, banner + stubs + '\n', 'utf-8');
  console.log(
    `[${target}] Stubbed ${missing.length} composite input type(s): ${missing
      .sort()
      .join(', ')}`,
  );
}

function listTsFiles(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listTsFiles(full));
    else if (entry.isFile() && full.endsWith('.ts')) out.push(full);
  }
  return out;
}

function writeRootBarrel(targets: string[]) {
  const lines = [
    '/**',
    ' * @constructive-io/functions-sdk',
    ' *',
    ' * Auto-generated GraphQL types and ORM client.',
    ' * Run `pnpm run generate` to populate this package from the schema files.',
    ' *',
    ' * @generated by scripts/generate-sdk.ts',
    ' */',
    ...targets.map((t) => `export * as ${t} from './${t}';`),
    '',
  ];
  fs.writeFileSync(path.join(SRC_DIR, 'index.ts'), lines.join('\n'), 'utf-8');
  console.log(`Wrote root barrel: src/index.ts (${targets.join(', ')})`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
