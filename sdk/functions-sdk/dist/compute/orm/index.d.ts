import type { OrmClientConfig } from './client';
import { PlatformSecretDefinitionModel } from './models/platformSecretDefinition';
import { PlatformFunctionExecutionLogModel } from './models/platformFunctionExecutionLog';
import { PlatformNamespaceModel } from './models/platformNamespace';
import { PlatformFunctionInvocationModel } from './models/platformFunctionInvocation';
import { PlatformNamespaceEventModel } from './models/platformNamespaceEvent';
import { PlatformFunctionDefinitionModel } from './models/platformFunctionDefinition';
export type { OrmClientConfig, QueryResult, GraphQLError, GraphQLAdapter } from './client';
export { GraphQLRequestError, FetchAdapter } from './client';
export { QueryBuilder } from './query-builder';
export * from './select-types';
export * from './models';
export { createMutationOperations } from './mutation';
/**
 * Create an ORM client instance
 *
 * @example
 * ```typescript
 * const db = createClient({
 *   endpoint: 'https://api.example.com/graphql',
 *   headers: { Authorization: 'Bearer token' },
 * });
 *
 * // Query users
 * const users = await db.user.findMany({
 *   select: { id: true, name: true },
 *   first: 10,
 * }).execute();
 *
 * // Create a user
 * const newUser = await db.user.create({
 *   data: { name: 'John', email: 'john@example.com' },
 *   select: { id: true },
 * }).execute();
 * ```
 */
export declare function createClient(config: OrmClientConfig): {
    platformSecretDefinition: PlatformSecretDefinitionModel;
    platformFunctionExecutionLog: PlatformFunctionExecutionLogModel;
    platformNamespace: PlatformNamespaceModel;
    platformFunctionInvocation: PlatformFunctionInvocationModel;
    platformNamespaceEvent: PlatformNamespaceEventModel;
    platformFunctionDefinition: PlatformFunctionDefinitionModel;
    mutation: {
        provisionBucket: <S extends import("./input-types").ProvisionBucketPayloadSelect>(args: import("./mutation").ProvisionBucketVariables, options: {
            select: S;
        } & import("./select-types").StrictSelect<S, import("./input-types").ProvisionBucketPayloadSelect>) => import("./query-builder").QueryBuilder<{
            provisionBucket: import("./select-types").InferSelectResult<import("./input-types").ProvisionBucketPayload, S> | null;
        }>;
    };
};
