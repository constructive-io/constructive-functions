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
const { spawn, execSync } = require('child_process') as typeof import('child_process');

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

// --- Load .env file if present ---

function loadDotEnv(): Record<string, string> {
  const envVars: Record<string, string> = {};
  const envPath = path.resolve(ROOT, '.env');
  if (!fs.existsSync(envPath)) return envVars;

  const content = fs.readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[key] = val;
  }
  return envVars;
}

// --- Query DB for function secret/config requirements ---

interface FnRequirement {
  fnName: string;
  secrets: string[];
  configs: string[];
}

function loadFunctionRequirements(dbName: string): FnRequirement[] {
  try {
    const sql = `
      SELECT
        name,
        COALESCE(array_to_string(
          ARRAY(SELECT (r).name FROM unnest(required_secrets) AS r), ','
        ), '') AS secrets,
        COALESCE(array_to_string(
          ARRAY(SELECT (r).name FROM unnest(required_configs) AS r), ','
        ), '') AS configs
      FROM constructive_infra_public.platform_function_definitions
      WHERE is_invocable = true
      ORDER BY name
    `;
    const output = execSync(
      `psql -d "${dbName}" -t -A -F '|' -c "${sql.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`,
      { encoding: 'utf-8', timeout: 5000 }
    ).trim();

    if (!output) return [];
    return output.split('\n').map((line: string) => {
      const [fnName, secrets, configs] = line.split('|');
      return {
        fnName,
        secrets: secrets ? secrets.split(',') : [],
        configs: configs ? configs.split(',') : [],
      };
    });
  } catch {
    return [];
  }
}

const dotEnv = loadDotEnv();
const dbName = process.env.PGDATABASE || 'constructive-functions-db1';
const fnReqs = loadFunctionRequirements(dbName);

// Merge: process.env (lowest) → .env file → hardcoded defaults (for known dev values)
const DEFAULTS: Record<string, string> = {
  MAILGUN_API_KEY: 'test-key',
  MAILGUN_KEY: 'test-key',
  MAILGUN_DOMAIN: 'mg.constructive.io',
  MAILGUN_FROM: 'no-reply@mg.constructive.io',
  MAILGUN_REPLY: 'info@mg.constructive.io',
  LOCAL_APP_PORT: '3000',
};

// --- Shared env vars for all processes ---

const sharedEnv: Record<string, string> = {
  ...process.env as Record<string, string>,
  ...DEFAULTS,
  ...dotEnv,
  NODE_ENV: 'development',
  LOG_LEVEL: 'info',
  PGHOST: dotEnv.PGHOST || process.env.PGHOST || 'localhost',
  PGPORT: dotEnv.PGPORT || process.env.PGPORT || '5432',
  PGUSER: dotEnv.PGUSER || process.env.PGUSER || 'postgres',
  PGPASSWORD: dotEnv.PGPASSWORD || process.env.PGPASSWORD || 'password',
  PGDATABASE: dotEnv.PGDATABASE || process.env.PGDATABASE || dbName,
  GRAPHQL_URL: dotEnv.GRAPHQL_URL || process.env.GRAPHQL_URL || 'http://localhost:3002/graphql',
  META_GRAPHQL_URL: dotEnv.META_GRAPHQL_URL || process.env.META_GRAPHQL_URL || 'http://localhost:3002/graphql',
  GRAPHQL_API_NAME: 'private',
  DEFAULT_DATABASE_ID: 'dbe',
  SMTP_HOST: dotEnv.SMTP_HOST || process.env.SMTP_HOST || 'localhost',
  SMTP_PORT: dotEnv.SMTP_PORT || process.env.SMTP_PORT || '1025',
  SMTP_FROM: dotEnv.SMTP_FROM || process.env.SMTP_FROM || 'test@localhost',
  SEND_VERIFICATION_LINK_DRY_RUN: dotEnv.SEND_VERIFICATION_LINK_DRY_RUN || process.env.SEND_VERIFICATION_LINK_DRY_RUN || 'true',
  SEND_EMAIL_DRY_RUN: dotEnv.SEND_EMAIL_DRY_RUN || process.env.SEND_EMAIL_DRY_RUN || 'true',
  EMAIL_SEND_USE_SMTP: dotEnv.EMAIL_SEND_USE_SMTP || process.env.EMAIL_SEND_USE_SMTP || '',
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

// Report secret/config coverage
if (fnReqs.length > 0) {
  console.log('');
  console.log('  Secrets/Configs:');
  let totalMissing = 0;
  for (const req of fnReqs) {
    const allKeys = [...req.secrets, ...req.configs];
    const missing = allKeys.filter((k) => !sharedEnv[k]);
    const set = allKeys.length - missing.length;
    if (missing.length > 0) {
      console.log(`    ● ${req.fnName}: ${set}/${allKeys.length} set (${missing.length} missing)`);
      totalMissing += missing.length;
    } else {
      console.log(`    ✓ ${req.fnName}: all ${set} secrets/configs set`);
    }
  }
  if (totalMissing > 0) {
    console.log(`  ⚠ ${totalMissing} missing — create .env or run 'make check-env' for details`);
  }
}

if (Object.keys(dotEnv).length > 0) {
  console.log(`  .env: loaded ${Object.keys(dotEnv).length} variable(s)`);
} else {
  console.log('  .env: not found (using defaults)');
}

console.log('════════════════════════════════════════════════════════════');
console.log('');

for (const def of processes) {
  startProcess(def);
}
