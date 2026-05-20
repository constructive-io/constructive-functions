import { GraphQLClient } from 'graphql-request';
import type { FunctionContext } from '@constructive-io/fn-types';
import type { ResolvedSecret, SecretsMap, ResolveSecretsOptions } from './types';

const GET_FUNCTION_ID_QUERY = `
  query GetFunctionId($name: String!) {
    defaultFunctionDefinitions(condition: { name: $name }, first: 1) {
      nodes {
        id
      }
    }
  }
`;

const RESOLVE_SECRETS_QUERY = `
  query ResolveSecrets(
    $functionId: UUID!
    $databaseId: UUID!
    $secretsSchema: String!
    $secretsGetter: String!
  ) {
    resolveFunctionSecrets(
      pFunctionId: $functionId
      pDatabaseId: $databaseId
      pSecretsSchema: $secretsSchema
      pSecretsGetter: $secretsGetter
    ) {
      secretName
      secretValue
      secretSource
    }
  }
`;

const DEFAULT_SECRETS_SCHEMA = 'constructive_store_private';
const DEFAULT_SECRETS_GETTER = 'app_secrets_get';
const DEFAULT_SCHEMATA = 'infra_private,infra_public';

const createSecretsClient = (
  graphqlUrl: string,
  databaseId: string,
  schemata: string
): GraphQLClient => {
  return new GraphQLClient(graphqlUrl, {
    headers: {
      'X-Database-Id': databaseId,
      'X-Schemata': schemata,
    },
  });
};

async function getFunctionId(
  client: GraphQLClient,
  functionName: string
): Promise<string> {
  const response = await client.request<{
    defaultFunctionDefinitions: { nodes: { id: string }[] };
  }>(GET_FUNCTION_ID_QUERY, { name: functionName });

  const nodes = response.defaultFunctionDefinitions?.nodes;
  if (!nodes?.length) {
    throw new Error(`Function "${functionName}" not found in default_function_definitions`);
  }

  return nodes[0].id;
}

export async function resolveSecretsRaw(
  options: ResolveSecretsOptions
): Promise<ResolvedSecret[]> {
  const {
    functionName,
    databaseId,
    graphqlUrl,
    functionId: providedFunctionId,
    secretsSchema = DEFAULT_SECRETS_SCHEMA,
    secretsGetter = DEFAULT_SECRETS_GETTER,
    schemata = DEFAULT_SCHEMATA,
  } = options;

  const client = createSecretsClient(graphqlUrl, databaseId, schemata);

  const functionId = providedFunctionId ?? await getFunctionId(client, functionName);

  const response = await client.request<{
    resolveFunctionSecrets: ResolvedSecret[];
  }>(RESOLVE_SECRETS_QUERY, {
    functionId,
    databaseId,
    secretsSchema,
    secretsGetter,
  });

  return response.resolveFunctionSecrets;
}

export async function resolveSecrets(
  context: FunctionContext,
  functionName: string
): Promise<SecretsMap> {
  const { databaseId } = context.job;
  const graphqlUrl = context.env.GRAPHQL_URL;

  if (!databaseId) {
    throw new Error(
      'Cannot resolve secrets: missing databaseId in context.job'
    );
  }

  if (!graphqlUrl) {
    throw new Error(
      'Cannot resolve secrets: missing GRAPHQL_URL in environment'
    );
  }

  const secrets = await resolveSecretsRaw({
    functionName,
    databaseId,
    graphqlUrl,
  });

  return Object.fromEntries(
    secrets
      .filter((s) => s.secretValue != null)
      .map((s) => [s.secretName, s.secretValue!])
  );
}
