import type { FunctionHandler } from '@constructive-io/fn-runtime';

const handler: FunctionHandler = async (params: any) => {
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
