// dev-compute: starts functions and compute-service as local Node processes
// with env vars pointing to Docker or pgpm-local infrastructure.
//
// The compute-service discovers functions from the database (platform_function_definitions)
// instead of relying on a static manifest. Functions still run as local Node processes.
//
// Secrets loading pipeline:
//   1. Read .env file
//   2. Query DB for configured values (platform_secrets + platform_config)
//   3. Merge with priority: .env > DB > hardcoded defaults
//   4. Resolve per-function requirements
//   5. Inject ONLY needed env vars into each function's child process
//   6. Fail fast on missing required secrets, warn on optional ones
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
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    envVars[key] = val;
  }
  return envVars;
}

// --- Query DB for configured secret values ---

function loadDbSecretValues(dbName: string): Record<string, string> {
  const vars: Record<string, string> = {};
  const dbId = '00000000-0000-0000-0000-000000000000';

  // Load secrets from constructive_store_private.platform_secrets
  try {
    const sql = `SELECT name, convert_from(value, 'UTF8') AS val FROM constructive_store_private.platform_secrets WHERE database_id = '${dbId}' AND value IS NOT NULL`;
    const output = execSync(
      `psql -d "${dbName}" -t -A -F '|' -c "${sql}"`,
      { encoding: 'utf-8', timeout: 5000 }
    ).trim();
    if (output) {
      for (const line of output.split('\n')) {
        const [name, value] = line.split('|');
        if (name && value) vars[name] = value;
      }
    }
  } catch {
    console.log('  (platform_secrets not available yet)');
  }

  // Load configs from constructive_store_public.platform_config
  try {
    const sql = `SELECT name, value FROM constructive_store_public.platform_config WHERE value IS NOT NULL AND value != ''`;
    const output = execSync(
      `psql -d "${dbName}" -t -A -F '|' -c "${sql}"`,
      { encoding: 'utf-8', timeout: 5000 }
    ).trim();
    if (output) {
      for (const line of output.split('\n')) {
        const [name, value] = line.split('|');
        if (name && value) vars[name] = value;
      }
    }
  } catch {
    console.log('  (platform_config not available yet)');
  }

  return vars;
}

// --- Query DB for function secret/config requirements (with required flag) ---

interface FnRequirement {
  fnName: string;
  secrets: Array<{ name: string; required: boolean }>;
  configs: Array<{ name: string; required: boolean }>;
}

function loadFunctionRequirements(dbName: string): FnRequirement[] {
  try {
    const sql = `
      SELECT
        name,
        COALESCE(array_to_string(
          ARRAY(SELECT (r).name || ':' || CASE WHEN (r).required THEN 't' ELSE 'f' END FROM unnest(required_secrets) AS r), ','
        ), '') AS secrets,
        COALESCE(array_to_string(
          ARRAY(SELECT (r).name || ':' || CASE WHEN (r).required THEN 't' ELSE 'f' END FROM unnest(required_configs) AS r), ','
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
      const [fnName, secretsRaw, configsRaw] = line.split('|');
      const parseReqs = (raw: string): Array<{ name: string; required: boolean }> => {
        if (!raw) return [];
        return raw.split(',').map((item) => {
          const [name, flag] = item.split(':');
          return { name, required: flag === 't' };
        });
      };
      return {
        fnName,
        secrets: parseReqs(secretsRaw),
        configs: parseReqs(configsRaw),
      };
    });
  } catch {
    return [];
  }
}

const dotEnv = loadDotEnv();
const dbName = process.env.PGDATABASE || 'constructive-functions-db1';
const dbSecrets = loadDbSecretValues(dbName);
const fnReqs = loadFunctionRequirements(dbName);

// --- Merge with priority: .env > DB > hardcoded defaults ---

const DEFAULTS: Record<string, string> = {
  MAILGUN_API_KEY: 'test-key',
  MAILGUN_KEY: 'test-key',
  MAILGUN_DOMAIN: 'mg.constructive.io',
  MAILGUN_FROM: 'no-reply@mg.constructive.io',
  MAILGUN_REPLY: 'info@mg.constructive.io',
  LOCAL_APP_PORT: '3000',
};

const mergedSecrets: Record<string, string> = {
  ...DEFAULTS,
  ...dbSecrets,
  ...dotEnv,
};

// System env vars (always injected into every process)
const systemEnv: Record<string, string> = {
  NODE_ENV: 'development',
  LOG_LEVEL: 'info',
  PGHOST: mergedSecrets.PGHOST || process.env.PGHOST || 'localhost',
  PGPORT: mergedSecrets.PGPORT || process.env.PGPORT || '5432',
  PGUSER: mergedSecrets.PGUSER || process.env.PGUSER || 'postgres',
  PGPASSWORD: mergedSecrets.PGPASSWORD || process.env.PGPASSWORD || 'password',
  PGDATABASE: mergedSecrets.PGDATABASE || process.env.PGDATABASE || dbName,
  GRAPHQL_URL: mergedSecrets.GRAPHQL_URL || process.env.GRAPHQL_URL || 'http://localhost:3002/graphql',
  META_GRAPHQL_URL: mergedSecrets.META_GRAPHQL_URL || process.env.META_GRAPHQL_URL || 'http://localhost:3002/graphql',
  GRAPHQL_API_NAME: 'private',
  DEFAULT_DATABASE_ID: 'dbe',
  SMTP_HOST: mergedSecrets.SMTP_HOST || process.env.SMTP_HOST || 'localhost',
  SMTP_PORT: mergedSecrets.SMTP_PORT || process.env.SMTP_PORT || '1025',
  SMTP_FROM: mergedSecrets.SMTP_FROM || process.env.SMTP_FROM || 'test@localhost',
  SEND_VERIFICATION_LINK_DRY_RUN: mergedSecrets.SEND_VERIFICATION_LINK_DRY_RUN || process.env.SEND_VERIFICATION_LINK_DRY_RUN || 'true',
  SEND_EMAIL_DRY_RUN: mergedSecrets.SEND_EMAIL_DRY_RUN || process.env.SEND_EMAIL_DRY_RUN || 'true',
  EMAIL_SEND_USE_SMTP: mergedSecrets.EMAIL_SEND_USE_SMTP || process.env.EMAIL_SEND_USE_SMTP || '',
  PATH: process.env.PATH || '',
  HOME: process.env.HOME || '',
};

// --- Build per-function env: system + only the needed secrets/configs ---

function buildFunctionEnv(fnName: string): Record<string, string> {
  const req = fnReqs.find((r) => r.fnName === fnName);
  const env: Record<string, string> = { ...systemEnv };

  if (!req) return { ...env, ...mergedSecrets };

  const allReqs = [...req.secrets, ...req.configs];
  for (const { name } of allReqs) {
    const val = mergedSecrets[name] || process.env[name] || '';
    if (val) env[name] = val;
  }

  return env;
}

// --- Validate per-function requirements (fail fast on required, warn optional) ---

function validateRequirements(): boolean {
  let hasFatal = false;

  for (const req of fnReqs) {
    const allReqs = [...req.secrets, ...req.configs];
    const missingRequired: string[] = [];
    const missingOptional: string[] = [];

    for (const { name, required } of allReqs) {
      const val = mergedSecrets[name] || process.env[name] || '';
      if (!val) {
        if (required) {
          missingRequired.push(name);
        } else {
          missingOptional.push(name);
        }
      }
    }

    if (missingRequired.length > 0) {
      console.error(`  FATAL: ${req.fnName} missing REQUIRED secrets: ${missingRequired.join(', ')}`);
      hasFatal = true;
    }
    if (missingOptional.length > 0) {
      console.log(`  WARN:  ${req.fnName} missing optional secrets: ${missingOptional.join(', ')}`);
    }
  }

  return hasFatal;
}

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
  const fnEnv = def.name === 'compute-service'
    ? { ...systemEnv, ...mergedSecrets, ...(def.extraEnv || {}), PORT: String(def.port) }
    : { ...buildFunctionEnv(def.name), ...(def.extraEnv || {}), PORT: String(def.port) };

  console.log(`Starting ${def.name} on port ${def.port}...`);

  const child = spawn('node', [def.script], {
    env: fnEnv,
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
console.log(`  Database: ${systemEnv.PGDATABASE}`);
if (systemEnv.EMAIL_SEND_USE_SMTP === 'true') {
  console.log(`  Mailpit UI:                                http://localhost:8025`);
}

// Report secret/config coverage with required/optional distinction
if (fnReqs.length > 0) {
  console.log('');
  console.log('  Secrets/Configs (priority: .env > DB > defaults):');
  for (const req of fnReqs) {
    const allReqs = [...req.secrets, ...req.configs];
    const missing = allReqs.filter((r) => {
      const val = mergedSecrets[r.name] || process.env[r.name] || '';
      return !val;
    });
    const set = allReqs.length - missing.length;
    if (missing.length > 0) {
      const requiredMissing = missing.filter((m) => m.required);
      const optionalMissing = missing.filter((m) => !m.required);
      let detail = `${set}/${allReqs.length} set`;
      if (requiredMissing.length > 0) detail += `, ${requiredMissing.length} REQUIRED missing`;
      if (optionalMissing.length > 0) detail += `, ${optionalMissing.length} optional missing`;
      console.log(`    ${requiredMissing.length > 0 ? '✗' : '●'} ${req.fnName}: ${detail}`);
    } else {
      console.log(`    ✓ ${req.fnName}: all ${set} secrets/configs set`);
    }
  }
}

const envSources: string[] = [];
if (Object.keys(dotEnv).length > 0) envSources.push(`.env (${Object.keys(dotEnv).length} vars)`);
if (Object.keys(dbSecrets).length > 0) envSources.push(`DB (${Object.keys(dbSecrets).length} vars)`);
envSources.push(`defaults (${Object.keys(DEFAULTS).length} vars)`);
console.log(`  Sources: ${envSources.join(' > ')}`);

console.log('════════════════════════════════════════════════════════════');
console.log('');

// Validate requirements — fail fast on missing required secrets
const hasFatal = validateRequirements();
if (hasFatal) {
  console.error('');
  console.error('Cannot start: required secrets are missing.');
  console.error('Configure them via:');
  console.error('  1. Add to .env file');
  console.error('  2. Set in Platform UI → Secrets tab → Sync to DB');
  console.error("  3. Run 'make check-env' for a full report");
  process.exit(1);
}

for (const def of processes) {
  startProcess(def);
}
