import type { PgpmPackage } from '@pgpmjs/core';
import type { PgpmOptions } from '@pgpmjs/types';
import type { BaseContext, BaseFunctionHandler, BaseServerOptions } from '@constructive-io/fn-core';

export type PgpmFunctionContext = BaseContext & {
  project: PgpmPackage;
  options: PgpmOptions;
};

export type PgpmFunctionHandler<P = unknown, R = unknown> = BaseFunctionHandler<P, PgpmFunctionContext, R>;

export type PgpmServerOptions = BaseServerOptions & {
  cwd?: string;
};
