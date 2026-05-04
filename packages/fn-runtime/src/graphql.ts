import { GraphQLClient } from 'graphql-request';

type GraphQLClientOptions = {
  hostHeaderEnvVar?: string;
  databaseId?: string;
  useMetaSchema?: boolean;
  apiName?: string;
  schemata?: string;
};

const createGraphQLClient = (
  url: string,
  env: Record<string, string | undefined>,
  options: GraphQLClientOptions = {}
): GraphQLClient => {
  const headers: Record<string, string> = {};

  if (env.GRAPHQL_AUTH_TOKEN) {
    headers.Authorization = `Bearer ${env.GRAPHQL_AUTH_TOKEN}`;
  }

  const envName = options.hostHeaderEnvVar || 'GRAPHQL_HOST_HEADER';
  const hostHeader = env[envName];
  if (hostHeader) {
    headers.host = hostHeader;
  }

  if (options.databaseId) {
    headers['X-Database-Id'] = options.databaseId;
  }
  if (options.useMetaSchema) {
    headers['X-Meta-Schema'] = 'true';
  }
  if (options.apiName) {
    headers['X-Api-Name'] = options.apiName;
  }
  if (options.schemata) {
    headers['X-Schemata'] = options.schemata;
  }

  return new GraphQLClient(url, { headers });
};

export const createClients = (
  databaseId: string,
  env: Record<string, string | undefined>
): { client: GraphQLClient; meta: GraphQLClient } => {
  const graphqlUrl = env.GRAPHQL_URL;
  if (!graphqlUrl) {
    throw new Error('Missing required environment variable GRAPHQL_URL');
  }

  const metaGraphqlUrl = env.META_GRAPHQL_URL || graphqlUrl;
  const apiName = env.GRAPHQL_API_NAME;
  const schemata = env.GRAPHQL_SCHEMATA;

  const client = createGraphQLClient(graphqlUrl, env, {
    hostHeaderEnvVar: 'GRAPHQL_HOST_HEADER',
    databaseId,
    ...(apiName && { apiName }),
    ...(schemata && { schemata })
  });

  // Meta client targets platform-level data (databases, sites, domains, themes
  // in metaschema_public). It must NOT use tenant API routing — sending
  // X-Api-Name causes the server to load every schema registered for that API
  // (both *_public and *_private variants), which collides on duplicate codec
  // names like identityProviders. Use X-Meta-Schema instead.
  const meta = createGraphQLClient(metaGraphqlUrl, env, {
    hostHeaderEnvVar: 'META_GRAPHQL_HOST_HEADER',
    useMetaSchema: true,
  });

  return { client, meta };
};
