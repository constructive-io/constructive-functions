
import { createClient } from '@constructive-db/constructive-sdk';
// import puppeteer from 'puppeteer'; YOU DONT NEED THIS
import fetch from 'cross-fetch';

export default async (params: any, context: any) => {
  const { headers } = context;
  console.log('[opencode-headless] Request received');

  // Clean headers to avoid conflicts with SDK defaults
  const safeHeaders = { ...headers };
  ['host', 'content-length', 'connection', 'content-type', 'accept', 'user-agent', 'accept-encoding'].forEach(k => delete safeHeaders[k]);

  const sdk = createClient({
    endpoint: process.env.GRAPHQL_ENDPOINT || 'http://constructive-server:3000/graphql',
    headers: safeHeaders || {}
  });

  // Verify GQL connection (without try-catch)
  const gqlResult = await sdk.api.findMany({ select: { id: true, name: true }, first: 1 }).execute();
  if (!gqlResult.ok) {
    console.error('GQL Request failed:', gqlResult.errors);
  }

  const { url, prompt } = params;

  // Check if we can resolve the CLI path from the dependency
  // Since we linked it, it might be in node_modules/.bin/opencode or we point to the package bin
  // For "file:" dependencies, pnpm usually links the bin.

  // We will attempt to run 'opencode' as a child process.
  // Assuming 'opencode' is available in the path or we use the relative path.
  // Ideally, we run the agent to perform an action.

  // Example: opencode run --url <url> --prompt <prompt> (hypothetically)
  // Looking at Source, Opencode has `RunCommand`, `AgentCommand`.
  // Let's assume we want to run an agent session.

  console.log(`Starting Opencode Agent for: ${url || 'No URL'} - ${prompt || 'No Prompt'}`);

  try {
    const { spawn } = await import('child_process');
    const path = await import('path');

    // Resolve the binary path relative to the compiled file (dist/index.js)
    // binary is at ../bin/opencode
    const opencodeBin = path.resolve(__dirname, '../bin/opencode');
    console.log(`[opencode-headless] Using binary at: ${opencodeBin}`);

    return new Promise((resolve, reject) => {
      // Spawn 'opencode serve' in headless mode
      // This matches the user's requirement: "OPENCODE HAS A SERVER MODE"
      const args = ['serve', '--port', '8081']; // Explicitly use 8081 to avoid conflict with runner's PORT (8080)


      console.log(`[opencode-headless] Spawning: ${opencodeBin} with args: ${args.join(' ')}`);

      const child = spawn(opencodeBin, args, {
        env: {
          ...process.env,
          HEADLESS: 'true',
          HOME: process.cwd(), // Required for opencode to write config/logs without EACCES
          // Force non-interactive modes if possible
          CI: 'true'
        }
      });

      console.log(`[opencode-headless] Child PID: ${child.pid}`);

      child.on('error', (err) => {
        console.error(`[opencode-headless] FAILED TO START: ${err.message}`);
        resolve({ success: false, error: err.message });
      });

      child.on('exit', (code, signal) => {
        console.log(`[opencode-headless] Child exited with code: ${code}, signal: ${signal}`);
        // If it exits, it means it failed to stay running
        resolve({ success: false, code, error: 'Exited unexpectedly' });
      });

      let output = '';
      let error = '';

      child.stdout.on('data', (data) => {
        const s = data.toString();
        output += s;
        console.log(`[opencode] ${s}`);

        // If we see listening, we can resolve running
        if (s.includes('listening')) {
          resolve({ success: true, status: 'running', pid: child.pid });
        }
      });

      child.stderr.on('data', (data) => {
        const s = data.toString();
        error += s;
        console.error(`[opencode-err] ${s}`);
      });

      // Fallback: If it doesn't print 'listening' but also doesn't crash after 5s, assume running
      setTimeout(() => {
        resolve({ success: true, status: 'assumed_running', pid: child.pid });
      }, 5000);
    });

  } catch (e: any) {
    console.error(e);
    return { error: e.message };
  }
};


// Server boilerplate abstracted to runner.js
