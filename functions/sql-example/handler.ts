import type { FunctionHandler } from './types';

type Params = {
  query?: string;
  actor_id?: string;
};

type Result = {
  success: boolean;
  message: string;
  data?: unknown;
};

const handler: FunctionHandler<Params, Result> = async (params, context) => {
  const { log, withUserContext } = context;
  const { query = 'SELECT version()', actor_id } = params;

  log.info('[sql-example] Executing query', { query, actor_id });

  const result = await withUserContext(actor_id, async (client) => {
    const res = await client.query(query);
    return res.rows;
  });

  log.info('[sql-example] Query complete', { rowCount: result.length });

  return {
    success: true,
    message: 'Query executed successfully',
    data: result,
  };
};

export default handler;
