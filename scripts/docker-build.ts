// docker-build: builds per-function Docker images from generated Dockerfiles.
//
// Expects `pnpm generate` to have been run first, which produces
// generated/<name>/Dockerfile from the template with placeholders resolved.
//
// Usage:
//   node --experimental-strip-types scripts/docker-build.ts --all
//   node --experimental-strip-types scripts/docker-build.ts --only=send-email-link
//   node --experimental-strip-types scripts/docker-build.ts --only=simple-email --tag=abc1234

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');
const { execSync } = require('child_process') as typeof import('child_process');

const ROOT: string = process.cwd();
const FUNCTIONS_DIR: string = path.resolve(ROOT, 'functions');
const GENERATED_DIR: string = path.resolve(ROOT, 'generated');

const DEFAULT_REGISTRY = 'ghcr.io/constructive-io';

interface FunctionManifest {
  name: string;
  version: string;
  description?: string;
  type?: string;
  dependencies?: Record<string, string>;
}

// --- CLI args ---

const args = process.argv.slice(2);
const buildAll = args.includes('--all');
const onlyArg = args.find((a: string) => a.startsWith('--only='));
const onlyName: string | undefined = onlyArg?.split('=')[1];
const tagArg = args.find((a: string) => a.startsWith('--tag='));
const tag: string = tagArg?.split('=')[1] || 'local';
const registryArg = args.find((a: string) => a.startsWith('--registry='));
const registry: string = registryArg?.split('=')[1] || DEFAULT_REGISTRY;

if (!buildAll && !onlyName) {
  console.log('Usage:');
  console.log('  pnpm docker:build              # build all functions');
  console.log('  pnpm docker:build -- --only=<name>  # build specific function');
  console.log('  pnpm docker:build -- --tag=v1.0     # custom tag (default: local)');
  process.exit(1);
}

// --- Discovery ---

function findFunctions(): string[] {
  if (!fs.existsSync(FUNCTIONS_DIR)) {
    console.error('No functions/ directory found.');
    process.exit(1);
  }

  return fs
    .readdirSync(FUNCTIONS_DIR)
    .filter((name: string) => {
      const handlerJson = path.join(FUNCTIONS_DIR, name, 'handler.json');
      return fs.existsSync(handlerJson);
    })
    .filter((name: string) => !onlyName || name === onlyName);
}

function readManifest(fnDir: string): FunctionManifest {
  const manifestPath = path.join(fnDir, 'handler.json');
  const raw = fs.readFileSync(manifestPath, 'utf-8');
  return JSON.parse(raw);
}

// --- Docker build ---

function buildDockerImage(fnName: string, manifest: FunctionManifest): void {
  const dockerfilePath = path.join(GENERATED_DIR, fnName, 'Dockerfile');

  if (!fs.existsSync(dockerfilePath)) {
    console.error(`No Dockerfile found at ${dockerfilePath}. Run "pnpm generate" first.`);
    process.exit(1);
  }

  const imageName = `${registry}/${manifest.name}-fn`;

  console.log(`\nBuilding ${imageName}:${tag}...`);
  execSync(
    `docker build -t ${imageName}:${tag} -f ${dockerfilePath} .`,
    { cwd: ROOT, stdio: 'inherit' }
  );
  console.log(`Built ${imageName}:${tag}`);
}

// --- Main ---

const functions = findFunctions();

if (functions.length === 0) {
  console.error(onlyName ? `Function "${onlyName}" not found.` : 'No functions found.');
  process.exit(1);
}

console.log(`Building Docker images for: ${functions.join(', ')}`);
console.log(`Tag: ${tag}, Registry: ${registry}`);

for (const fnName of functions) {
  const fnDir = path.join(FUNCTIONS_DIR, fnName);
  const manifest = readManifest(fnDir);
  buildDockerImage(fnName, manifest);
}

console.log('\nAll images built successfully.');
