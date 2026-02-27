import { createServer } from '@constructive-io/fn-core';
import type { RequestHeaders } from '@constructive-io/fn-core';
import { buildContext } from './context';
import type { FunctionHandler, ServerOptions } from './types';

export const createFunctionServer = (
  handler: FunctionHandler<any, any>,
  options: ServerOptions = {}
) => {
  return createServer(handler, (headers: RequestHeaders) =>
    buildContext(headers, options)
  );
};
