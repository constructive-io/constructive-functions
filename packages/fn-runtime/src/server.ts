import { createJobApp } from '@constructive-io/knative-job-fn';
import type { FunctionHandler, ServerOptions } from '@constructive-io/fn-types';
import { buildContext } from './context';

export const createFunctionServer = (
  handler: FunctionHandler<any, any>,
  options: ServerOptions = {}
) => {
  const app = createJobApp();

  app.post('/', async (req: any, res: any, next: any) => {
    try {
      const context = buildContext(
        {
          databaseId: req.get('X-Database-Id') || req.get('x-database-id') || process.env.DEFAULT_DATABASE_ID,
          workerId: req.get('X-Worker-Id') || req.get('x-worker-id'),
          jobId: req.get('X-Job-Id') || req.get('x-job-id')
        },
        { name: options.name }
      );

      const params = req.body || {};
      const result = await handler(params, context);

      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  });

  return app;
};
