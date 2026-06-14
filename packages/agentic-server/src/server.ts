import express from 'express';
import { createRouter, AgenticRouterOptions } from './router';

export interface AgenticServerOptions extends AgenticRouterOptions {
  port?: number;
}

/**
 * Create a standalone Express app for the agentic server.
 * Used by both standalone mode and integration tests.
 */
export const createAgenticServer = (options: AgenticServerOptions) => {
  const app = express();
  app.use(express.json());

  // Header security: strip identity headers from external requests.
  // Only trust X-Database-Id/X-Entity-Id when X-Internal-Service is set
  // (meaning the request comes from fn-runtime, not an external client).
  app.use((req: any, _res: any, next: any) => {
    const isInternal = req.get('X-Internal-Service');
    if (!isInternal) {
      // External request — strip identity headers to prevent forgery
      req.headers['x-database-id'] = undefined;
      req.headers['x-entity-id'] = undefined;
      req.headers['x-actor-id'] = undefined;
    }
    next();
  });

  app.use(createRouter(options));

  return app;
};
