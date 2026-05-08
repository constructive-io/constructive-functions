import type { FunctionHandler } from '@constructive-io/fn-runtime';

interface Payload {
  // TODO: shape your function input
}

interface Result {
  ok: true;
}

const handler: FunctionHandler<Payload, Result> = async (params, ctx) => {
  ctx.log.info('____name____ invoked', params);
  return { ok: true };
};

export default handler;
