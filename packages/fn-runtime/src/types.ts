import type { GraphQLClient } from 'graphql-request';
import type { BaseContext, BaseFunctionHandler, BaseServerOptions } from '@constructive-io/fn-core';

export type FunctionContext = BaseContext & {
  client: GraphQLClient;
  meta: GraphQLClient;
};

export type FunctionHandler<P = unknown, R = unknown> = BaseFunctionHandler<P, FunctionContext, R>;

export type ServerOptions = BaseServerOptions;
