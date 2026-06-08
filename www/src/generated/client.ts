/**
 * Lightweight GraphQL client for the Constructive Platform UI.
 *
 * Talks to the Constructive GraphQL server at GRAPHQL_ENDPOINT.
 * Used by the generated React Query hooks.
 */

// In dev, Vite proxies /graphql to localhost:3002 (see vite.config.ts).
// In production, override with VITE_GRAPHQL_ENDPOINT.
export const GRAPHQL_ENDPOINT =
  import.meta.env.VITE_GRAPHQL_ENDPOINT || '/graphql';

export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{ message: string; locations?: Array<{ line: number; column: number }> }>;
}

export async function graphqlRequest<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status} ${res.statusText}`);
  }

  const json: GraphQLResponse<T> = await res.json();

  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join('; '));
  }

  if (!json.data) {
    throw new Error('GraphQL response missing data');
  }

  return json.data;
}
