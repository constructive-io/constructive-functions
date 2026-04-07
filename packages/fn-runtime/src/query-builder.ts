import type { GraphQLClient } from 'graphql-request';
import {
  QueryBuilder,
  SCHEMA_INTROSPECTION_QUERY,
  inferTablesFromIntrospection,
  createASTQueryBuilder
} from '@constructive-io/graphql-query';
import type { IntrospectionQueryResponse } from '@constructive-io/graphql-query';

const cache = new Map<string, QueryBuilder>();

export async function getQueryBuilder(
  client: GraphQLClient,
  cacheKey: string
): Promise<QueryBuilder> {
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const introspection =
    await client.request<IntrospectionQueryResponse>(SCHEMA_INTROSPECTION_QUERY);
  const tables = inferTablesFromIntrospection(introspection);
  const builder = createASTQueryBuilder(tables);
  cache.set(cacheKey, builder);
  return builder;
}
