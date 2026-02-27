import type { FunctionContext, FunctionHandler } from '@constructive-io/fn-runtime';

type ExampleParams = {
  throw?: boolean;
};

const handler: FunctionHandler<ExampleParams> = async (
  params: ExampleParams,
  _context: FunctionContext
) => {
  if (params.throw) {
    throw new Error('THROWN_ERROR');
  }

  return {
    fn: 'example-fn',
    message: 'hi I did a lot of work',
    body: params
  };
};

export default handler;
