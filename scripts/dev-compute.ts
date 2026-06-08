// dev-compute: starts functions and compute-service as local Node processes
// with env vars pointing to Docker or pgpm-local infrastructure.
//
// The compute-service discovers functions from the database (platform_function_definitions)
// instead of relying on a static manifest. Functions still run as local Node processes.
//
// Usage:
//   node --experimental-strip-types scripts/dev-compute.ts
//   node --experimental-strip-types scripts/dev-compute.ts --only=send-verification-link

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');
const { spawn } = require('child_process') as typeof import('child_process');

const ROOT: string = process.cwd();

// --- Load function manifest (produced by pnpm generate) ---

interface FunctionEntry {
  name: string;
  dir: string;
  port: number;
  type?: string;
  taskIdentifier?: string;
}

interface FunctionsManifest {
  functions: FunctionEntry[];
}

function loadManifest(): FunctionsManifest {
  const manifestPath = path.resolve(ROOT, 'generated/functions-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('generated/functions-manifest.json not found. Run `pnpm generate` first.');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
}

const manifest = loadManifest();

// --- Shared env vars for all processes ---

const sharedEnv: Record<string, string> = {
  ...process.env as Record<string, string>,
  NODE_ENV: 'development',
  LOG_LEVEL: 'info',
  // Postgres (matches docker-compose or pgpm-local)
  PGHOST: process.env.PGHOST || 'localhost',
  PGPORT: process.env.PGPORT || '5432',
  PGUSER: process.env.PGUSER || 'postgres',
  PGPASSWORD: process.env.PGPASSWORD || 'password',
  PGDATABASE: process.env.PGDATABASE || 'constructive-functions-db1',
  // GraphQL (optional — only if graphql-server is running)
  GRAPHQL_URL: process.env.GRAPHQL_URL || 'http://localhost:3002/graphql',
  META_GRAPHQL_URL: process.env.META_GRAPHQL_URL || 'http://localhost:3002/graphql',
  GRAPHQL_API_NAME: 'private',
  DEFAULT_DATABASE_ID: 'dbe',
  // Mailpit SMTP
  MAILGUN_API_KEY: 'test-key',
  MAILGUN_KEY: 'test-key',
  MAILGUN_DOMAIN: 'mg.constructive.io',
  MAILGUN_FROM: 'no-reply@mg.constructive.io',
  MAILGUN_REPLY: 'info@mg.constructive.io',
  SMTP_HOST: process.env.SMTP_HOST || 'localhost',
  SMTP_PORT: process.env.SMTP_PORT || '1025',
  LOCAL_APP_PORT: '3000',
  SEND_VERIFICATION_LINK_DRY_RUN: process.env.SEND_VERIFICATION_LINK_DRY_RUN || 'true',
  SEND_EMAIL_DRY_RUN: process.env.SEND_EMAIL_DRY_RUN || 'true',
  EMAIL_SEND_USE_SMTP: process.env.EMAIL_SEND_USE_SMTP || '',
  SMTP_FROM: process.env.SMTP_FROM || 'test@localhost',
};

// --- Process definitions (built from manifest) ---

interface ProcessDef {
  name: string;
  script: string;
  port: number;
  extraEnv?: Record<string, string>;
}

// Only start Node-based functions (skip python, etc.)
const nodeFunctions = manifest.functions.filter(
  (fn) => !fn.type || fn.type === 'node-graphql'
);

function buildComputeServiceEnv(): Record<string, string> {
  const taskId = (fn: FunctionEntry): string => fn.taskIdentifier ?? fn.name;
  const gatewayMap: Record<string, string> = {};
  for (const fn of nodeFunctions) {
    gatewayMap[taskId(fn)] = `http://localhost:${fn.port}`;
  }

  return {
    COMPUTE_JOBS_ENABLED: 'true',
    JOBS_SCHEMA: 'app_jobs',
    JOBS_SUPPORT_ANY: 'true',
    HOSTNAME: 'compute-service-local',
    INTERNAL_JOBS_CALLBACK_PORT: '8080',
    INTERNAL_JOBS_CALLBACK_URL: 'http://localhost:8080/callback',
    COMPUTE_CALLBACK_URL: 'http://localhost:8080/callback',
    JOBS_CALLBACK_HOST: 'localhost',
    COMPUTE_GATEWAY_URL: `http://localhost:${nodeFunctions[0]?.port || 8081}`,
    INTERNAL_GATEWAY_DEVELOPMENT_MAP: JSON.stringify(gatewayMap),
    INTERNAL_GATEWAY_URL: `http://localhost:${nodeFunctions[0]?.port || 8081}`,
  };
}

const allProcesses: ProcessDef[] = [
  {
    name: 'compute-service',
    script: path.resolve(ROOT, 'job/compute-service/dist/run.js'),
    port: 8080,
    extraEnv: buildComputeServiceEnv(),
  },
  ...nodeFunctions.map((fn) => ({
    name: fn.name,
    script: path.resolve(ROOT, `generated/${fn.dir}/dist/index.js`),
    port: fn.port,
  })),
];

// --- CLI args ---

const args = process.argv.slice(2);
const onlyArg = args.find((a: string) => a.startsWith('--only='));
const onlyName: string | undefined = onlyArg?.split('=')[1];

// --- Main ---

const children: ReturnType<typeof spawn>[] = [];

function startProcess(def: ProcessDef): void {
  const env = { ...sharedEnv, ...(def.extraEnv || {}), PORT: String(def.port) };

  console.log(`Starting ${def.name} on port ${def.port}...`);

  const child = spawn('node', [def.script], {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: ROOT,
  });

  child.stdout?.on('data', (data: Buffer) => {
    for (const line of data.toString().trimEnd().split('\n')) {
      console.log(`[${def.name}] ${line}`);
    }
  });

  child.stderr?.on('data', (data: Buffer) => {
    for (const line of data.toString().trimEnd().split('\n')) {
      console.error(`[${def.name}] ${line}`);
    }
  });

  child.on('exit', (code: number | null) => {
    console.log(`[${def.name}] exited with code ${code}`);
  });

  children.push(child);
}

function shutdown(): void {
  console.log('\nShutting down...');
  for (const child of children) {
    child.kill('SIGTERM');
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const processes = onlyName
  ? allProcesses.filter((p) => p.name === onlyName)
  : allProcesses;

if (processes.length === 0) {
  console.error(onlyName ? `Unknown process "${onlyName}".` : 'No processes to start.');
  console.log('Available:', allProcesses.map((p) => p.name).join(', '));
  process.exit(1);
}

// Print a clear port summary
console.log('');
console.log('════════════════════════════════════════════════════════════');
console.log('  Services:');
for (const p of processes) {
  const label = p.name === 'compute-service' ? `${p.name} (job dispatcher)` : p.name;
  console.log(`    ${label.padEnd(40)} http://localhost:${p.port}`);
}
console.log('');
console.log(`  Database: ${sharedEnv.PGDATABASE}`);
if (sharedEnv.EMAIL_SEND_USE_SMTP === 'true') {
  console.log(`  Mailpit UI:                                http://localhost:8025`);
}
console.log('════════════════════════════════════════════════════════════');
console.log('');

for (const def of processes) {
  startProcess(def);
}
