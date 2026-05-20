/**
 * SDK utilities for e2e tests that require provisioning databases,
 * creating tables, and other metaschema operations.
 *
 * Uses @constructive-io/node SDK to interact with constructive-server.
 */
import { GraphQLClient } from 'graphql-request';
import * as http from 'http';

const PUBLIC_SERVER_URL = process.env.PUBLIC_SERVER_URL || 'http://localhost:3000';
const PRIVATE_SERVER_URL = process.env.PRIVATE_SERVER_URL || 'http://localhost:3002';
const PUBLIC_HOST = process.env.PUBLIC_HOST || 'api.localhost:3000';

async function httpGraphQL<T>(
  url: string,
  query: string,
  variables: Record<string, unknown>,
  headers: Record<string, string>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const data = JSON.stringify({ query, variables });

    const options: http.RequestOptions = {
      hostname: parsedUrl.hostname,
      port: parseInt(parsedUrl.port) || 80,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (json.errors) {
            reject(new Error(`GraphQL Error: ${JSON.stringify(json.errors)}`));
          } else {
            resolve(json.data as T);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getMetaClient(accessToken?: string): GraphQLClient {
  const headers: Record<string, string> = {
    'X-Meta-Schema': 'true',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return new GraphQLClient(`${PRIVATE_SERVER_URL}/graphql`, { headers });
}

export async function signInOrSignUp(
  email: string,
  password: string
): Promise<{ accessToken: string; userId: string }> {
  const url = `${PUBLIC_SERVER_URL}/graphql`;
  const headers = { Host: PUBLIC_HOST };

  // Try sign in first
  try {
    const signInResult = await httpGraphQL<{
      signIn: { result: { accessToken: string; userId: string } } | null;
    }>(
      url,
      `mutation SignIn($email: String!, $password: String!) {
        signIn(input: { email: $email, password: $password }) {
          result {
            accessToken
            userId
          }
        }
      }`,
      { email, password },
      headers
    );

    if (signInResult.signIn?.result?.accessToken) {
      return {
        accessToken: signInResult.signIn.result.accessToken,
        userId: signInResult.signIn.result.userId,
      };
    }
  } catch {
    // Sign in failed, try sign up
  }

  // Sign up
  const signUpResult = await httpGraphQL<{
    signUp: { result: { accessToken: string; userId: string } };
  }>(
    url,
    `mutation SignUp($email: String!, $password: String!) {
      signUp(input: { email: $email, password: $password }) {
        result {
          accessToken
          userId
        }
      }
    }`,
    { email, password },
    headers
  );

  return {
    accessToken: signUpResult.signUp.result.accessToken,
    userId: signUpResult.signUp.result.userId,
  };
}

export async function provisionDatabase(
  accessToken: string,
  userId: string,
  name: string
): Promise<{ databaseId: string }> {
  const client = getMetaClient(accessToken);

  const result = await client.request<{
    createUserDatabase: { result: string };
  }>(
    `mutation CreateUserDatabase($name: String!, $ownerId: UUID!) {
      createUserDatabase(input: { databaseName: $name, ownerId: $ownerId }) {
        result
      }
    }`,
    { name, ownerId: userId }
  );

  return { databaseId: result.createUserDatabase.result };
}

export async function getSchemaInfo(
  accessToken: string,
  databaseId: string
): Promise<{ schemaId: string; schemaName: string }> {
  const client = getMetaClient(accessToken);

  const result = await client.request<{
    database: {
      schemasByDatabaseId: {
        nodes: Array<{ id: string; name: string }>;
      };
    };
  }>(
    `query GetSchema($databaseId: UUID!) {
      database(id: $databaseId) {
        schemasByDatabaseId(condition: { isDefault: true }) {
          nodes {
            id
            name
          }
        }
      }
    }`,
    { databaseId }
  );

  const schema = result.database.schemasByDatabaseId.nodes[0];
  return { schemaId: schema.id, schemaName: schema.name };
}

export async function createTable(
  accessToken: string,
  databaseId: string,
  schemaId: string,
  tableName: string
): Promise<string> {
  const client = getMetaClient(accessToken);

  const result = await client.request<{
    createTable: { table: { id: string } };
  }>(
    `mutation CreateTable($schemaId: UUID!, $name: String!) {
      createTable(input: { table: { schemaId: $schemaId, name: $name } }) {
        table {
          id
        }
      }
    }`,
    { schemaId, name: tableName }
  );

  return result.createTable.table.id;
}

export async function createField(
  accessToken: string,
  tableId: string,
  name: string,
  type: string,
  options?: { isRequired?: boolean; defaultValue?: string }
): Promise<string> {
  const client = getMetaClient(accessToken);

  const result = await client.request<{
    createField: { field: { id: string } };
  }>(
    `mutation CreateField($tableId: UUID!, $name: String!, $type: String!, $isRequired: Boolean, $defaultValue: String) {
      createField(input: { field: { tableId: $tableId, name: $name, type: $type, isRequired: $isRequired, defaultValue: $defaultValue } }) {
        field {
          id
        }
      }
    }`,
    {
      tableId,
      name,
      type,
      isRequired: options?.isRequired ?? false,
      defaultValue: options?.defaultValue ?? null,
    }
  );

  return result.createField.field.id;
}

export async function createPrimaryKey(
  accessToken: string,
  tableId: string,
  fieldIds: string[]
): Promise<void> {
  const client = getMetaClient(accessToken);

  await client.request(
    `mutation CreatePrimaryKey($tableId: UUID!, $fieldIds: [UUID!]!) {
      createPrimaryKey(input: { tableId: $tableId, fieldIds: $fieldIds }) {
        clientMutationId
      }
    }`,
    { tableId, fieldIds }
  );
}

export async function setupEmbeddingChunks(
  accessToken: string,
  databaseId: string,
  tableId: string,
  options: {
    contentFieldName: string;
    dimensions: number;
    chunkSize: number;
    chunkOverlap: number;
    chunkStrategy: string;
    chunkingTaskName: string;
  }
): Promise<string> {
  const client = getMetaClient(accessToken);

  const result = await client.request<{
    setupEmbeddingChunks: { chunksTableName: string };
  }>(
    `mutation SetupEmbeddingChunks(
      $tableId: UUID!,
      $contentFieldName: String!,
      $dimensions: Int!,
      $chunkSize: Int!,
      $chunkOverlap: Int!,
      $chunkStrategy: String!,
      $chunkingTaskName: String!
    ) {
      setupEmbeddingChunks(input: {
        tableId: $tableId,
        contentFieldName: $contentFieldName,
        dimensions: $dimensions,
        chunkSize: $chunkSize,
        chunkOverlap: $chunkOverlap,
        chunkStrategy: $chunkStrategy,
        chunkingTaskName: $chunkingTaskName
      }) {
        chunksTableName
      }
    }`,
    {
      tableId,
      contentFieldName: options.contentFieldName,
      dimensions: options.dimensions,
      chunkSize: options.chunkSize,
      chunkOverlap: options.chunkOverlap,
      chunkStrategy: options.chunkStrategy,
      chunkingTaskName: options.chunkingTaskName,
    }
  );

  return result.setupEmbeddingChunks.chunksTableName;
}
