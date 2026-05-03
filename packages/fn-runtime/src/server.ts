import { createJobApp } from '@constructive-io/knative-job-fn';
import { buildContext } from './context';
import type { FunctionHandler, ServerOptions } from './types';

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
          actorId: req.get('X-Actor-Id') || req.get('x-actor-id'),
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
