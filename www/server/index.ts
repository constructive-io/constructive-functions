import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { Pool } from 'pg';
import { spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const PORT = parseInt(process.env.PLATFORM_UI_PORT || '3456', 10);
const app = express();
const server = createServer(app);

app.use(express.json());

// ─── Postgres pool ──────────────────────────────────────────────────────────

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'password',
  database: process.env.PGDATABASE || 'constructive-functions-db1',
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseRequirements(raw: string): Array<{ name: string; required: boolean }> {
  if (!raw || raw === '{}') return [];
  const inner = raw.slice(1, -1);
  const items: Array<{ name: string; required: boolean }> = [];
  for (const match of inner.matchAll(/"?\(([^,]+),(t|f)\)"?/g)) {
    items.push({ name: match[1], required: match[2] === 't' });
  }
  return items;
}

// ─── REST API — Functions ───────────────────────────────────────────────────

app.get('/api/functions', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT name, task_identifier, service_url, is_invocable, is_built_in,
             scope, description, required_secrets, required_configs,
             payload_schema, namespace_id,
             (SELECT n.name FROM constructive_infra_public.platform_namespaces n WHERE n.id = f.namespace_id) as namespace,
             created_at, updated_at
      FROM constructive_infra_public.platform_function_definitions f
      ORDER BY name
    `);
    const rows = result.rows.map((r: any) => ({
      ...r,
      required_secrets: parseRequirements(r.required_secrets),
      required_configs: parseRequirements(r.required_configs),
    }));
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── REST API — FBP Node Definitions ────────────────────────────────────────

app.get('/api/definitions', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT name, task_identifier, service_url, is_invocable,
             scope, description, required_secrets, required_configs,
             payload_schema
      FROM constructive_infra_public.platform_function_definitions
      ORDER BY name
    `);

    const definitions = result.rows.map((r: any) => {
      const secrets = parseRequirements(r.required_secrets);
      const configs = parseRequirements(r.required_configs);
      const schema = r.payload_schema;

      const props = [
        ...secrets.map((s: { name: string; required: boolean }) => ({
          name: s.name,
          type: 'secret',
          required: s.required,
          description: `Secret: ${s.name}`,
        })),
        ...configs.map((c: { name: string; required: boolean }) => ({
          name: c.name,
          type: 'config',
          required: c.required,
          description: `Config: ${c.name}`,
        })),
      ];

      const inputs = [{
        name: 'payload',
        type: 'json',
        description: 'Job payload object',
        ...(schema ? { schema } : {}),
      }];

      return {
        context: r.task_identifier,
        name: r.name,
        category: r.scope || 'default',
        description: r.description,
        inputs,
        outputs: [{ name: 'result', type: 'json', description: 'Handler return value' }],
        props: props.length > 0 ? props : undefined,
      };
    });

    res.json(definitions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── REST API — Secrets ─────────────────────────────────────────────────────

app.get('/api/secrets', async (_req, res) => {
  try {
    // Derive secret/config definitions from function definitions (inlined arrays)
    const result = await pool.query(`
      SELECT DISTINCT (r).name, (r).required, 'secret' AS kind
      FROM constructive_infra_public.platform_function_definitions,
           unnest(required_secrets) AS r
      WHERE is_invocable = true
      UNION
      SELECT DISTINCT (r).name, (r).required, 'config' AS kind
      FROM constructive_infra_public.platform_function_definitions,
           unnest(required_configs) AS r
      WHERE is_invocable = true
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── .env helpers (must be declared before Secret Values endpoints) ────────

const PROJECT_ROOT = process.env.PROJECT_ROOT || resolve(process.cwd(), '..');
const ENV_PATH = resolve(PROJECT_ROOT, '.env');

function parseDotEnv(filePath: string): Record<string, string> {
  if (!existsSync(filePath)) return {};
  const vars: Record<string, string> = {};
  for (const line of readFileSync(filePath, 'utf-8').split('\n')) {
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
    vars[key] = val;
  }
  return vars;
}

function writeDotEnv(filePath: string, vars: Record<string, string>): void {
  const lines: string[] = [
    '# Auto-generated by Platform UI — edits here are safe.',
    '# Values can also be edited from http://localhost:5173 → Secrets tab.',
    '',
  ];
  const groups: Record<string, string[]> = {
    postgres: ['POSTGRES_PASSWORD', 'PGADMIN_DEFAULT_PASSWORD', 'PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE'],
    email_mailgun: ['MAILGUN_API_KEY', 'MAILGUN_KEY', 'MAILGUN_DOMAIN', 'MAILGUN_FROM', 'MAILGUN_REPLY'],
    email_smtp: ['EMAIL_SEND_USE_SMTP', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_FROM'],
    dryrun: ['SEND_EMAIL_DRY_RUN', 'SEND_VERIFICATION_LINK_DRY_RUN'],
    minio: ['MINIO_ROOT_USER', 'MINIO_ROOT_PASSWORD'],
    aws: ['ROUTE53_ACCESS_KEY_ID', 'ROUTE53_HOSTED_ZONE_ID'],
  };
  const groupLabels: Record<string, string> = {
    postgres: '# --- PostgreSQL ---',
    email_mailgun: '# --- Email: Mailgun ---',
    email_smtp: '# --- Email: SMTP / Mailpit ---',
    dryrun: '# --- Function dry-run toggles ---',
    minio: '# --- MinIO ---',
    aws: '# --- AWS ---',
  };

  const written = new Set<string>();
  for (const [group, keys] of Object.entries(groups)) {
    const groupVars = keys.filter((k) => k in vars);
    if (groupVars.length === 0) continue;
    lines.push(groupLabels[group] || `# --- ${group} ---`);
    for (const key of groupVars) {
      lines.push(`${key}=${vars[key]}`);
      written.add(key);
    }
    lines.push('');
  }
  // Write remaining keys not in any group
  const remaining = Object.entries(vars).filter(([k]) => !written.has(k));
  if (remaining.length > 0) {
    lines.push('# --- Other ---');
    for (const [key, val] of remaining) {
      lines.push(`${key}=${val}`);
    }
    lines.push('');
  }

  writeFileSync(filePath, lines.join('\n'), 'utf-8');
}

// ─── REST API — Secret/Config Values (real upstream tables) ─────────────────

const DB_ID = '00000000-0000-0000-0000-000000000000';

async function getDefaultNamespaceId(): Promise<string> {
  const result = await pool.query(
    `SELECT id FROM constructive_infra_public.platform_namespaces
     WHERE name = 'default' AND database_id = $1 LIMIT 1`,
    [DB_ID]
  );
  if (result.rows.length > 0) return result.rows[0].id;
  throw new Error('Default namespace not found — deploy constructive-infra-seed first');
}

async function getSecretNames(): Promise<Set<string>> {
  const result = await pool.query(`
    SELECT DISTINCT (r).name AS secret_name
    FROM constructive_infra_public.platform_function_definitions,
         unnest(required_secrets) AS r
    WHERE is_invocable = true
  `);
  return new Set(result.rows.map((r: any) => r.secret_name));
}

async function getConfigNames(): Promise<Set<string>> {
  const result = await pool.query(`
    SELECT DISTINCT (r).name AS config_name
    FROM constructive_infra_public.platform_function_definitions,
         unnest(required_configs) AS r
    WHERE is_invocable = true
  `);
  return new Set(result.rows.map((r: any) => r.config_name));
}

app.get('/api/secret-values', async (_req, res) => {
  try {
    const secrets = await pool.query(`
      SELECT name, convert_from(value, 'UTF8') AS configured_value,
             database_id, created_at, updated_at
      FROM constructive_store_private.platform_secrets
      WHERE database_id = $1
      ORDER BY name
    `, [DB_ID]);
    const configs = await pool.query(`
      SELECT name, value AS configured_value,
             created_at, updated_at
      FROM constructive_store_public.platform_config
      ORDER BY name
    `);
    const vars: Record<string, string> = {};
    const rows: any[] = [];
    for (const row of secrets.rows) {
      if (row.configured_value != null) vars[row.name] = row.configured_value;
      rows.push({ secret_name: row.name, configured_value: row.configured_value, kind: 'secret', ...row });
    }
    for (const row of configs.rows) {
      if (row.configured_value != null) vars[row.name] = row.configured_value;
      rows.push({ secret_name: row.name, configured_value: row.configured_value, kind: 'config', ...row });
    }
    res.json({ vars, rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/secret-values', async (req, res) => {
  try {
    const { vars } = req.body as { vars: Record<string, string> };
    if (!vars || typeof vars !== 'object') {
      res.status(400).json({ error: 'Body must contain { vars: { KEY: "value", ... } }' });
      return;
    }
    const nsId = await getDefaultNamespaceId();
    const secretNames = await getSecretNames();
    const configNames = await getConfigNames();
    let upserted = 0;
    for (const [name, value] of Object.entries(vars)) {
      if (value === '') continue;
      if (secretNames.has(name)) {
        await pool.query(
          `INSERT INTO constructive_store_private.platform_secrets
             (id, name, value, database_id, namespace_id)
           VALUES (gen_random_uuid(), $1, convert_to($2, 'UTF8'), $3, $4)
           ON CONFLICT (database_id, namespace_id, name)
           DO UPDATE SET value = convert_to($2, 'UTF8'), updated_at = now()`,
          [name, value, DB_ID, nsId]
        );
        upserted++;
      } else if (configNames.has(name)) {
        await pool.query(
          `INSERT INTO constructive_store_public.platform_config
             (id, name, value, namespace_id)
           VALUES (gen_random_uuid(), $1, $2, $3)
           ON CONFLICT (namespace_id, name)
           DO UPDATE SET value = $2, updated_at = now()`,
          [name, value, nsId]
        );
        upserted++;
      }
    }
    res.json({ ok: true, upserted });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/secrets/sync-from-db', async (_req, res) => {
  try {
    const secrets = await pool.query(`
      SELECT name, convert_from(value, 'UTF8') AS val
      FROM constructive_store_private.platform_secrets
      WHERE database_id = $1 AND value IS NOT NULL
    `, [DB_ID]);
    const configs = await pool.query(`
      SELECT name, value AS val
      FROM constructive_store_public.platform_config
      WHERE value IS NOT NULL AND value != ''
    `);
    const dbVars: Record<string, string> = {};
    for (const row of [...secrets.rows, ...configs.rows]) {
      dbVars[row.name] = row.val;
    }
    const existing = parseDotEnv(ENV_PATH);
    const merged = { ...existing, ...dbVars };
    writeDotEnv(ENV_PATH, merged);
    res.json({ ok: true, synced: Object.keys(dbVars).length, total: Object.keys(merged).length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/secrets/sync-to-db', async (_req, res) => {
  try {
    const envVars = parseDotEnv(ENV_PATH);
    const nsId = await getDefaultNamespaceId();
    const secretNames = await getSecretNames();
    const configNames = await getConfigNames();
    let upserted = 0;
    for (const [name, value] of Object.entries(envVars)) {
      if (value === '') continue;
      if (secretNames.has(name)) {
        await pool.query(
          `INSERT INTO constructive_store_private.platform_secrets
             (id, name, value, database_id, namespace_id)
           VALUES (gen_random_uuid(), $1, convert_to($2, 'UTF8'), $3, $4)
           ON CONFLICT (database_id, namespace_id, name)
           DO UPDATE SET value = convert_to($2, 'UTF8'), updated_at = now()`,
          [name, value, DB_ID, nsId]
        );
        upserted++;
      } else if (configNames.has(name)) {
        await pool.query(
          `INSERT INTO constructive_store_public.platform_config
             (id, name, value, namespace_id)
           VALUES (gen_random_uuid(), $1, $2, $3)
           ON CONFLICT (namespace_id, name)
           DO UPDATE SET value = $2, updated_at = now()`,
          [name, value, nsId]
        );
        upserted++;
      }
    }
    res.json({ ok: true, synced: upserted });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── REST API — .env file (read / write) ─────────────────────────────────────

app.get('/api/env', (_req, res) => {
  try {
    const vars = parseDotEnv(ENV_PATH);
    res.json({ path: ENV_PATH, exists: existsSync(ENV_PATH), vars });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/env', async (req, res) => {
  try {
    const { vars } = req.body as { vars: Record<string, string> };
    if (!vars || typeof vars !== 'object') {
      res.status(400).json({ error: 'Body must contain { vars: { KEY: "value", ... } }' });
      return;
    }
    // Merge with existing .env so we don't lose keys not in the request
    const existing = parseDotEnv(ENV_PATH);
    const merged = { ...existing, ...vars };
    // Remove keys explicitly set to empty string if they didn't exist before
    for (const [k, v] of Object.entries(merged)) {
      if (v === '' && !(k in existing)) delete merged[k];
    }
    writeDotEnv(ENV_PATH, merged);

    // Also sync non-empty values to DB (best-effort)
    try {
      const nsId = await getDefaultNamespaceId();
      const secretNames = await getSecretNames();
      const configNames = await getConfigNames();
      for (const [name, value] of Object.entries(merged)) {
        if (value === '') continue;
        if (secretNames.has(name)) {
          await pool.query(
            `INSERT INTO constructive_store_private.platform_secrets
               (id, name, value, database_id, namespace_id)
             VALUES (gen_random_uuid(), $1, convert_to($2, 'UTF8'), $3, $4)
             ON CONFLICT (database_id, namespace_id, name)
             DO UPDATE SET value = convert_to($2, 'UTF8'), updated_at = now()`,
            [name, value, DB_ID, nsId]
          );
        } else if (configNames.has(name)) {
          await pool.query(
            `INSERT INTO constructive_store_public.platform_config
               (id, name, value, namespace_id)
             VALUES (gen_random_uuid(), $1, $2, $3)
             ON CONFLICT (namespace_id, name)
             DO UPDATE SET value = $2, updated_at = now()`,
            [name, value, nsId]
          );
        }
      }
    } catch {
      // DB sync is best-effort; .env write already succeeded
    }

    res.json({ ok: true, path: ENV_PATH, count: Object.keys(merged).length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── REST API — Namespaces ──────────────────────────────────────────────────

app.get('/api/namespaces', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, namespace_name, description, is_active,
             created_at, updated_at
      FROM constructive_infra_public.platform_namespaces
      ORDER BY name
    `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── REST API — Jobs ────────────────────────────────────────────────────────

app.get('/api/jobs', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, task_identifier, payload, priority, attempts, max_attempts,
             locked_by, locked_at, last_error, created_at, updated_at
      FROM app_jobs.jobs
      ORDER BY id DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const { task_identifier, payload } = req.body;
    const result = await pool.query(
      `INSERT INTO app_jobs.jobs (task_identifier, payload)
       VALUES ($1, $2::json)
       RETURNING id, task_identifier, payload, created_at`,
      [task_identifier, JSON.stringify(payload)]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── REST API — Invocations ─────────────────────────────────────────────────

app.get('/api/invocations', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, function_name, job_id, worker_id, status,
             started_at, completed_at, duration_ms, error_message,
             created_at
      FROM constructive_infra_public.platform_function_invocations
      ORDER BY created_at DESC
      LIMIT 50
    `);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── REST API — Status ──────────────────────────────────────────────────────

app.get('/api/status', async (_req, res) => {
  try {
    const pgVersion = await pool.query('SELECT version()');
    const dbName = await pool.query('SELECT current_database()');
    const fnCount = await pool.query(
      `SELECT count(*) as count FROM constructive_infra_public.platform_function_definitions WHERE is_invocable = true`
    );
    const jobCount = await pool.query(
      `SELECT count(*) as count FROM app_jobs.jobs`
    );
    const invocationCount = await pool.query(
      `SELECT count(*) as count FROM constructive_infra_public.platform_function_invocations`
    );

    res.json({
      database: dbName.rows[0].current_database,
      postgres: pgVersion.rows[0].version.split(' ').slice(0, 2).join(' '),
      functions: parseInt(fnCount.rows[0].count, 10),
      jobs: parseInt(jobCount.rows[0].count, 10),
      invocations: parseInt(invocationCount.rows[0].count, 10),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── REST API — Run make commands ───────────────────────────────────────────

app.post('/api/run', (req, res) => {
  const { command } = req.body;
  const allowedCommands = [
    'make status',
    'make verify-platform',
    'make up',
    'make down',
    'make up:email-job',
    'make down:email-job',
    'make check-env',
  ];

  if (!allowedCommands.some(c => command.startsWith(c))) {
    res.status(400).json({ error: `Command not allowed. Allowed: ${allowedCommands.join(', ')}` });
    return;
  }

  const proc = spawn('bash', ['-c', command], {
    cwd: process.env.PROJECT_ROOT || process.cwd(),
    env: process.env as Record<string, string>,
  });

  let output = '';
  proc.stdout.on('data', (data: Buffer) => { output += data.toString(); });
  proc.stderr.on('data', (data: Buffer) => { output += data.toString(); });
  proc.on('close', (exitCode: number | null) => {
    res.json({ output, exitCode: exitCode ?? 1 });
  });
});

// ─── REST API — K8s proxy ────────────────────────────────────────────────────

const K8S_API = process.env.KUBERNETES_API_URL || 'http://127.0.0.1:8001';

app.all('/api/k8s/*', async (req, res) => {
  const k8sPath = '/' + (req.params as any)[0];
  const url = `${K8S_API}${k8sPath}${req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''}`;

  try {
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'] as string;
    }

    const init: RequestInit = {
      method: req.method,
      headers,
    };
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      init.body = JSON.stringify(req.body);
    }

    const k8sRes = await fetch(url, init);
    const body = await k8sRes.text();

    res.status(k8sRes.status);
    for (const [key, value] of k8sRes.headers.entries()) {
      if (key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    }
    res.send(body);
  } catch (err: any) {
    res.status(502).json({ error: `K8s proxy error: ${err.message}`, target: url });
  }
});

// ─── WebSocket — Shell Terminal ─────────────────────────────────────────────

const wss = new WebSocketServer({ server, path: '/ws/terminal' });

wss.on('connection', (ws: WebSocket) => {
  const shell = spawn('bash', ['-i'], {
    cwd: process.env.PROJECT_ROOT || process.cwd(),
    env: { ...process.env, TERM: 'xterm-256color' } as Record<string, string>,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  shell.stdout.on('data', (data: Buffer) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data.toString());
    }
  });

  shell.stderr.on('data', (data: Buffer) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data.toString());
    }
  });

  ws.on('message', (msg: Buffer | string) => {
    const str = msg.toString();
    if (shell.stdin.writable) {
      shell.stdin.write(str);
    }
  });

  ws.on('close', () => {
    shell.kill();
  });

  shell.on('exit', () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });
});

// ─── Start ──────────────────────────────────────────────────────────────────

server.listen(PORT, () => {
  console.log(`\n  Platform UI server: http://localhost:${PORT}`);
  console.log(`  Terminal WebSocket: ws://localhost:${PORT}/ws/terminal`);
  console.log(`  API endpoints:     http://localhost:${PORT}/api/{status,functions,jobs,invocations,secrets,secret-values,namespaces}`);
  console.log(`  K8s proxy:         http://localhost:${PORT}/api/k8s/* → ${K8S_API}`);
  console.log(`  Database:          ${process.env.PGDATABASE || 'constructive-functions-db1'}\n`);
});
