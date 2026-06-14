/**
 * Standalone entry point for the agentic server (dev mode).
 *
 * Uses the published `agentic-server` package with `@constructive-io/express-context`
 * for tenant-scoped database access.
 *
 * Environment variables:
 *   PORT                 — Server port (default: 3003)
 *   CHAT_PROVIDER        — LLM chat provider (default: ollama)
 *   CHAT_MODEL           — Default chat model (default: llama3)
 *   CHAT_BASE_URL        — Chat provider URL (default: http://localhost:11434)
 *   EMBEDDER_PROVIDER    — Embedding provider (default: ollama)
 *   EMBEDDER_MODEL       — Default embedding model (default: nomic-embed-text)
 *   EMBEDDER_BASE_URL    — Embedding provider URL (default: http://localhost:11434)
 */

import express from 'express';
import { createContextMiddleware } from '@constructive-io/express-context';
import { createAgenticRouter } from 'agentic-server';

const port = Number(process.env.PORT || 3003);

const app = express();
app.use(express.json());

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', provider: process.env.CHAT_PROVIDER || 'ollama' });
});

app.use(createContextMiddleware());
app.use(createAgenticRouter());

app.listen(port, () => {
  console.log(`Agentic server listening on port ${port}`);
  console.log(`Provider: ${process.env.CHAT_PROVIDER || 'ollama'} @ ${process.env.CHAT_BASE_URL || 'http://localhost:11434'}`);
});
