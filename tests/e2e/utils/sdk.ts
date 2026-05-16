/**
 * SDK utilities for e2e tests that require provisioning databases,
 * creating tables, and other metaschema operations.
 *
 * Uses @constructive-io/node SDK to interact with constructive-server.
 */
import { GraphQLClient } from 'graphql-request';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3002';

function getClient(accessToken?: string): GraphQLClient {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return new GraphQLClient(`${SERVER_URL}/graphql`, { headers });
}

export async function signInOrSignUp(
  email: string,
  password: string
): Promise<{ accessToken: string; userId: string }> {
  const client = getClient();

  // Try sign in first
  try {
    const signInResult = await client.request<{
      authenticate: { jwtToken: string } | null;
    }>(
      `mutation SignIn($email: String!, $password: String!) {
        authenticate(input: { email: $email, password: $password }) {
          jwtToken
        }
      }`,
      { email, password }
    );

    if (signInResult.authenticate?.jwtToken) {
      const token = signInResult.authenticate.jwtToken;
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      return { accessToken: token, userId: payload.user_id };
    }
  } catch {
    // Sign in failed, try sign up
  }

  // Sign up
  const signUpResult = await client.request<{
    registerUser: { jwtToken: string };
  }>(
    `mutation SignUp($email: String!, $password: String!) {
      registerUser(input: { email: $email, password: $password }) {
        jwtToken
      }
    }`,
    { email, password }
  );

  const token = signUpResult.registerUser.jwtToken;
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  return { accessToken: token, userId: payload.user_id };
}

export async function provisionDatabase(
  accessToken: string,
  userId: string,
  name: string
): Promise<{ databaseId: string }> {
  const client = getClient(accessToken);

  const result = await client.request<{
    provisionDatabase: { database: { id: string } };
  }>(
    `mutation ProvisionDatabase($name: String!, $ownerId: UUID!) {
      provisionDatabase(input: { database: { name: $name, ownerId: $ownerId } }) {
        database {
          id
        }
      }
    }`,
    { name, ownerId: userId }
  );

  return { databaseId: result.provisionDatabase.database.id };
}

export async function getSchemaInfo(
  accessToken: string,
  databaseId: string
): Promise<{ schemaId: string; schemaName: string }> {
  const client = getClient(accessToken);

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
  const client = getClient(accessToken);

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
  const client = getClient(accessToken);

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
  const client = getClient(accessToken);

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
  const client = getClient(accessToken);

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
