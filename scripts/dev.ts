// dev: starts functions and job-service as local Node processes
// with env vars pointing to Docker infrastructure services.
//
// Usage:
//   node --experimental-strip-types scripts/dev.ts
//   node --experimental-strip-types scripts/dev.ts --only=send-email-link

const path = require('path') as typeof import('path');
const { spawn } = require('child_process') as typeof import('child_process');
const { ChildProcess } = require('child_process') as typeof import('child_process');

const ROOT: string = process.cwd();

// --- Shared env vars for all processes ---

const sharedEnv: Record<string, string> = {
  ...process.env as Record<string, string>,
  NODE_ENV: 'development',
  LOG_LEVEL: 'info',
  // Postgres (matches docker-compose postgres service)
  PGHOST: 'localhost',
  PGPORT: '5432',
  PGUSER: 'postgres',
  PGPASSWORD: 'password',
  PGDATABASE: 'constructive',
  // GraphQL (matches docker-compose graphql-server on port 3002)
  GRAPHQL_URL: 'http://localhost:3002/graphql',
  META_GRAPHQL_URL: 'http://localhost:3002/graphql',
  GRAPHQL_API_NAME: 'private',
  DEFAULT_DATABASE_ID: 'dbe',
  // Mailpit SMTP (matches docker-compose mailpit on port 1025)
  MAILGUN_API_KEY: 'test-key',
  MAILGUN_KEY: 'test-key',
  MAILGUN_DOMAIN: 'mg.constructive.io',
  MAILGUN_FROM: 'no-reply@mg.constructive.io',
  MAILGUN_REPLY: 'info@mg.constructive.io',
  SMTP_HOST: 'localhost',
  SMTP_PORT: '1025',
  LOCAL_APP_PORT: '3000',
  SEND_EMAIL_LINK_DRY_RUN: 'true',
  // Ollama (for rag-embedding)
  OLLAMA_URL: 'http://localhost:11434',
  EMBEDDING_MODEL: 'nomic-embed-text:latest',
};

// --- Process definitions ---

interface ProcessDef {
  name: string;
  script: string;
  port: number;
}

const allProcesses: ProcessDef[] = [
  {
    name: 'job-service',
    script: path.resolve(ROOT, 'job/service/dist/run.js'),
    port: 8080,
  },
  {
    name: 'simple-email',
    script: path.resolve(ROOT, 'generated/simple-email/dist/index.js'),
    port: 8081,
  },
  {
    name: 'send-email-link',
    script: path.resolve(ROOT, 'generated/send-email-link/dist/index.js'),
    port: 8082,
  },
  {
    name: 'rag-embedding',
    script: path.resolve(ROOT, 'generated/rag-embedding/dist/index.js'),
    port: 8083,
  },
];

// --- CLI args ---

const args = process.argv.slice(2);
const onlyArg = args.find((a: string) => a.startsWith('--only='));
const onlyName: string | undefined = onlyArg?.split('=')[1];

// --- Job-service specific env ---

function getJobServiceEnv(): Record<string, string> {
  return {
    JOBS_SCHEMA: 'app_jobs',
    JOBS_SUPPORT_ANY: 'false',
    JOBS_SUPPORTED: 'send-email-link',
    HOSTNAME: 'knative-job-service-local',
    INTERNAL_JOBS_CALLBACK_PORT: '8080',
    INTERNAL_JOBS_CALLBACK_URL: 'http://localhost:8080/callback',
    JOBS_CALLBACK_HOST: 'localhost',
    INTERNAL_GATEWAY_URL: 'http://localhost:8082',
    INTERNAL_GATEWAY_DEVELOPMENT_MAP: JSON.stringify({
      'send-email-link': 'http://localhost:8082',
      'simple-email': 'http://localhost:8081',
      'rag-embedding': 'http://localhost:8083',
    }),
  };
}

// --- Main ---

const children: ReturnType<typeof spawn>[] = [];

function startProcess(def: ProcessDef): void {
  const extraEnv = def.name === 'job-service' ? getJobServiceEnv() : {};
  const env = { ...sharedEnv, ...extraEnv, PORT: String(def.port) };

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

console.log(`Starting: ${processes.map((p) => `${p.name} (:${p.port})`).join(', ')}`);

for (const def of processes) {
  startProcess(def);
}
