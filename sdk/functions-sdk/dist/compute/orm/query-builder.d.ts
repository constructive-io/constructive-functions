import type { FieldNode } from 'graphql';
import { OrmClient, QueryResult } from './client';
export interface QueryBuilderConfig<TResult> {
    client: OrmClient;
    operation: 'query' | 'mutation';
    operationName: string;
    fieldName: string;
    document: string;
    variables?: Record<string, unknown>;
    transform?: (data: any) => TResult;
}
export declare class QueryBuilder<TResult> {
    private config;
    constructor(config: QueryBuilderConfig<TResult>);
    /**
     * Execute the query and return a discriminated union result
     * Use result.ok to check success, or .unwrap() to throw on error
     */
    execute(): Promise<QueryResult<TResult>>;
    /**
     * Execute and unwrap the result, throwing GraphQLRequestError on failure
     * @throws {GraphQLRequestError} If the query returns errors
     */
    unwrap(): Promise<TResult>;
    /**
     * Execute and unwrap, returning defaultValue on error instead of throwing
     */
    unwrapOr<D>(defaultValue: D): Promise<TResult | D>;
    /**
     * Execute and unwrap, calling onError callback on failure
     */
    unwrapOrElse<D>(onError: (errors: import('./client').GraphQLError[]) => D): Promise<TResult | D>;
    toGraphQL(): string;
    getVariables(): Record<string, unknown> | undefined;
}
export declare function buildSelections(select: Record<string, unknown> | undefined, connectionFieldsMap?: Record<string, Record<string, string>>, entityType?: string): FieldNode[];
export declare function buildFindManyDocument<TSelect, TWhere>(operationName: string, queryField: string, select: TSelect, args: {
    where?: TWhere;
    orderBy?: string[];
    first?: number;
    last?: number;
    after?: string;
    before?: string;
    offset?: number;
}, filterTypeName: string, orderByTypeName: string, connectionFieldsMap?: Record<string, Record<string, string>>): {
    document: string;
    variables: Record<string, unknown>;
};
export declare function buildFindFirstDocument<TSelect, TWhere>(operationName: string, queryField: string, select: TSelect, args: {
    where?: TWhere;
    orderBy?: string[];
}, filterTypeName: string, orderByTypeName: string, connectionFieldsMap?: Record<string, Record<string, string>>): {
    document: string;
    variables: Record<string, unknown>;
};
export declare function buildCreateDocument<TSelect, TData>(operationName: string, mutationField: string, entityField: string, select: TSelect, data: TData, inputTypeName: string, connectionFieldsMap?: Record<string, Record<string, string>>): {
    document: string;
    variables: Record<string, unknown>;
};
export declare function buildUpdateDocument<TSelect, TWhere extends {
    id: string;
}, TData>(operationName: string, mutationField: string, entityField: string, select: TSelect, where: TWhere, data: TData, inputTypeName: string, patchFieldName: string, connectionFieldsMap?: Record<string, Record<string, string>>): {
    document: string;
    variables: Record<string, unknown>;
};
export declare function buildUpdateByPkDocument<TSelect, TData>(operationName: string, mutationField: string, entityField: string, select: TSelect, id: string | number, data: TData, inputTypeName: string, idFieldName: string, patchFieldName: string, connectionFieldsMap?: Record<string, Record<string, string>>): {
    document: string;
    variables: Record<string, unknown>;
};
export declare function buildFindOneDocument<TSelect>(operationName: string, queryField: string, id: string | number, select: TSelect, idArgName: string, idTypeName: string, connectionFieldsMap?: Record<string, Record<string, string>>): {
    document: string;
    variables: Record<string, unknown>;
};
export declare function buildDeleteDocument<TWhere extends {
    id: string;
}, TSelect = undefined>(operationName: string, mutationField: string, entityField: string, where: TWhere, inputTypeName: string, select?: TSelect, connectionFieldsMap?: Record<string, Record<string, string>>): {
    document: string;
    variables: Record<string, unknown>;
};
export declare function buildDeleteByPkDocument<TSelect = undefined>(operationName: string, mutationField: string, entityField: string, keys: Record<string, unknown>, inputTypeName: string, select?: TSelect, connectionFieldsMap?: Record<string, Record<string, string>>): {
    document: string;
    variables: Record<string, unknown>;
};
export declare function buildJunctionRemoveDocument(operationName: string, mutationField: string, keys: Record<string, unknown>, inputTypeName: string): {
    document: string;
    variables: Record<string, unknown>;
};
export declare function buildCustomDocument<TSelect, TArgs>(operationType: 'query' | 'mutation', operationName: string, fieldName: string, select: TSelect, args: TArgs, variableDefinitions: Array<{
    name: string;
    type: string;
}>, connectionFieldsMap?: Record<string, Record<string, string>>, entityType?: string): {
    document: string;
    variables: Record<string, unknown>;
};
export declare function buildBulkInsertDocument<TSelect, TData>(operationName: string, mutationField: string, select: TSelect, data: TData[], inputTypeName: string, onConflict?: unknown, connectionFieldsMap?: Record<string, Record<string, string>>): {
    document: string;
    variables: Record<string, unknown>;
};
export declare function buildBulkUpsertDocument<TSelect, TData>(operationName: string, mutationField: string, select: TSelect, data: TData[], inputTypeName: string, onConflict: unknown, connectionFieldsMap?: Record<string, Record<string, string>>): {
    document: string;
    variables: Record<string, unknown>;
};
export declare function buildBulkUpdateDocument<TSelect, TWhere, TData>(operationName: string, mutationField: string, select: TSelect, where: TWhere, data: TData, inputTypeName: string, connectionFieldsMap?: Record<string, Record<string, string>>): {
    document: string;
    variables: Record<string, unknown>;
};
export declare function buildBulkDeleteDocument<TSelect, TWhere>(operationName: string, mutationField: string, select: TSelect, where: TWhere, inputTypeName: string, connectionFieldsMap?: Record<string, Record<string, string>>): {
    document: string;
    variables: Record<string, unknown>;
};
