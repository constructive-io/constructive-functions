import { createJobApp } from '@constructive-io/knative-job-fn';
import type { BaseContext, BaseFunctionHandler, RequestHeaders } from './types';

export type ContextFactory<C extends BaseContext> = (
  headers: RequestHeaders
) => C | Promise<C>;

export const extractHeaders = (req: any): RequestHeaders => ({
  databaseId:
    req.get('X-Database-Id') ||
    req.get('x-database-id') ||
    process.env.DEFAULT_DATABASE_ID,
  workerId: req.get('X-Worker-Id') || req.get('x-worker-id'),
  jobId: req.get('X-Job-Id') || req.get('x-job-id')
});

export const createServer = <C extends BaseContext>(
  handler: BaseFunctionHandler<any, C, any>,
  contextFactory: ContextFactory<C>
) => {
  const app = createJobApp();

  app.post('/', async (req: any, res: any, next: any) => {
    try {
      const headers = extractHeaders(req);
      const context = await contextFactory(headers);
      const params = req.body || {};
      const result = await handler(params, context);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  return app;
};
