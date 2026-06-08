import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { Pool } from 'pg';
import { spawn } from 'child_process';

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
             namespace_id,
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

// ─── REST API — Secrets ─────────────────────────────────────────────────────

app.get('/api/secrets', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT name, description, is_built_in, database_id,
             created_at, updated_at
      FROM constructive_infra_public.platform_secret_definitions
      ORDER BY name
    `);
    res.json(result.rows);
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
  console.log(`  API endpoints:     http://localhost:${PORT}/api/{status,functions,jobs,invocations,secrets,namespaces}`);
  console.log(`  K8s proxy:         http://localhost:${PORT}/api/k8s/* → ${K8S_API}`);
  console.log(`  Database:          ${process.env.PGDATABASE || 'constructive-functions-db1'}\n`);
});
