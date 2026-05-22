/**
 * provision.ts — Provision utilities for e2e tests
 *
 * Uses @constructive-io/node SDK for clean GraphQL operations.
 */

import { auth, NodeHttpAdapter, public_ } from '@constructive-io/node';
import { config } from './config';
import { TestClient } from './db';

const MODULES = [
  'users_module',
  'membership_types_module',
  'permissions_module:app',
  'limits_module:app',
  'levels_module:app',
  'memberships_module:app',
  'sessions_module',
  'user_state_module',
  'config_secrets_user_module',
  'emails_module',
  'rls_module',
  'user_auth_module',
];

export interface TenantConfig {
  dbName: string;
  databaseId: string;
  schemaName: string;
  userId: string;
  accessToken: string;
}

/**
 * Retry helper for transient failures
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 5,
  delayMs = 2000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('already exists') || msg.includes('ACCOUNT_EXISTS') || msg.includes('duplicate key')) {
        throw err;
      }
      if (attempt === maxRetries) throw err;
      console.log(`   Attempt ${attempt}/${maxRetries} failed. Retrying...`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw new Error('unreachable');
}

/**
 * Create auth client for global sign up/sign in
 */
function createAuthClient() {
  const adapter = new NodeHttpAdapter(config.authEndpoint, {
    'X-Meta-Schema': 'true',
    'X-Schemata': 'constructive_auth_public',
  });
  return auth.createClient({ adapter });
}

/**
 * Create metaschema client for platform API operations
 */
function createMetaschemaClient(accessToken: string, databaseId?: string) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'X-Meta-Schema': 'true',
  };
  if (databaseId) {
    headers['X-Database-Id'] = databaseId;
  }
  const adapter = new NodeHttpAdapter(config.apiEndpoint, headers);
  return public_.createClient({ adapter });
}

/**
 * Sign up or sign in a user
 */
async function authUser(email: string, password: string): Promise<{ userId: string; accessToken: string }> {
  const authClient = createAuthClient();

  try {
    const result = await authClient.mutation
      .signUp(
        { input: { email, password } },
        { select: { result: { select: { userId: true, accessToken: true } } } }
      )
      .unwrap();
    const data = (result as any)?.signUp?.result;
    if (data?.userId && data?.accessToken) {
      return data;
    }
  } catch (err: any) {
    if (err.message?.includes('ACCOUNT_EXISTS')) {
      const result = await authClient.mutation
        .signIn(
          { input: { email, password } },
          { select: { result: { select: { userId: true, accessToken: true } } } }
        )
        .unwrap();
      const data = (result as any)?.signIn?.result;
      if (data?.userId && data?.accessToken) {
        return data;
      }
    }
    throw err;
  }

  throw new Error('Auth failed: no token returned');
}

/**
 * Wait for schema to be ready via SQL
 */
async function waitForSchema(pg: TestClient, dbName: string): Promise<{ databaseId: string; schemaName: string }> {
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const result = await pg.query(`
      SELECT id, schema_hash
      FROM metaschema_public.database
      WHERE name = $1 AND schema_hash IS NOT NULL
    `, [dbName]);
    if (result.rows.length > 0 && result.rows[0].schema_hash) {
      return {
        databaseId: result.rows[0].id,
        schemaName: `${result.rows[0].schema_hash}-app-public`,
      };
    }
  }
  throw new Error('Schema construction timeout');
}

/**
 * Provision a tenant database with article table (ProcessChunks + SearchUnified)
 * - ProcessChunks: creates article_chunks table with chunk embeddings
 * - SearchUnified: adds embedding field to article table
 */
export async function provisionArticle(pg: TestClient, dbName: string): Promise<TenantConfig> {
  const email = `test-${dbName}@example.com`;
  const password = 'TestPassword123!';

  // Step 1: Check if database exists via SQL
  const existingResult = await pg.query(`
    SELECT id, schema_hash
    FROM metaschema_public.database
    WHERE name = $1
  `, [dbName]);

  if (existingResult.rows.length > 0) {
    const existing = existingResult.rows[0];
    const { userId, accessToken } = await authUser(email, password);

    if (existing.schema_hash) {
      const schemaName = `${existing.schema_hash}-app-public`;
      console.log(`[provision] Database exists: ${schemaName}`);
      return { dbName, databaseId: existing.id, schemaName, userId, accessToken };
    }

    console.log(`[provision] Database exists, waiting for schema...`);
    const { schemaName } = await waitForSchema(pg, dbName);
    return { dbName, databaseId: existing.id, schemaName, userId, accessToken };
  }

  // Step 2: Auth
  console.log(`[provision] Creating new database: ${dbName}`);
  const { userId, accessToken } = await authUser(email, password);

  // Step 3: Provision via SDK
  const metaClient = createMetaschemaClient(accessToken);

  const provisionResult = await withRetry(() =>
    metaClient.databaseProvisionModule
      .create({
        data: {
          databaseName: dbName,
          ownerId: userId,
          subdomain: dbName,
          domain: 'localhost',
          modules: MODULES,
          bootstrapUser: true,
          options: {},
        },
        select: { id: true, databaseId: true, status: true, errorMessage: true },
      })
      .unwrap()
  );

  const provision = (provisionResult as any)?.createDatabaseProvisionModule?.databaseProvisionModule;
  if (!provision?.databaseId) {
    throw new Error(`Provision failed: ${provision?.errorMessage || 'unknown'}`);
  }

  const { databaseId } = provision;

  // Wait for provisioning
  if (provision.status !== 'completed') {
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 1000));
      const statusResult = await metaClient.databaseProvisionModule
        .findOne({ id: provision.id }, { select: { status: true, errorMessage: true } })
        .unwrap();
      const status = (statusResult as any)?.databaseProvisionModuleById?.status;
      if (status === 'completed') break;
      if (status === 'failed') {
        throw new Error(`Provision failed: ${(statusResult as any)?.databaseProvisionModuleById?.errorMessage}`);
      }
    }
  }

  // Step 4: Create blueprint with ProcessChunks + SearchUnified
  const blueprintClient = createMetaschemaClient(accessToken, databaseId);
  const blueprintDef = {
    tables: [{
      table_name: 'article',
      nodes: [
        'DataId',
        'DataTimestamps',
        {
          $type: 'ProcessChunks',
          data: {
            content_field_name: 'content',
            chunk_size: 500,
            chunk_overlap: 100,
            chunk_strategy: 'fixed',
            dimensions: 768,
            metric: 'cosine',
            chunking_task_name: 'generate_chunks',
            enqueue_chunking_job: true,
          },
        },
        {
          $type: 'SearchUnified',
          data: {
            source_fields: ['title', 'content'],
            embedding_text_field: 'embedding_text',
            embedding: {
              field_name: 'embedding',
              dimensions: 768,
              index_method: 'hnsw',
              metric: 'cosine',
            },
          },
        },
      ],
      fields: [
        { name: 'title', type: 'text', is_required: false },
        { name: 'content', type: 'text', is_required: false },
        { name: 'owner_id', type: 'uuid', is_required: true },
      ],
      use_rls: true,
      grants: [{ roles: ['authenticated'], privileges: [['select', '*'], ['insert', '*'], ['update', '*'], ['delete', '*']] }],
      policies: [{ $type: 'AuthzAllowAll', data: {}, privileges: ['select', 'insert', 'update', 'delete'], permissive: true }],
    }],
    entity_types: [],
  };

  const createBpResult = await withRetry(() =>
    blueprintClient.blueprint
      .create({
        data: {
          ownerId: userId,
          databaseId,
          name: `rag_e2e_${Date.now()}`,
          displayName: 'E2E RAG Test',
          definition: blueprintDef,
        },
        select: { id: true },
      })
      .unwrap()
  );

  const blueprintId = (createBpResult as any)?.createBlueprint?.blueprint?.id;
  if (!blueprintId) {
    throw new Error('Blueprint creation failed');
  }

  // Step 5: Construct blueprint via mutation
  await withRetry(() =>
    blueprintClient.mutation.constructBlueprint(
      { input: { blueprintId } },
      { select: { result: true } }
    ).unwrap()
  );

  // Step 6: Wait for schema
  const { schemaName } = await waitForSchema(pg, dbName);

  return { dbName, databaseId, schemaName, userId, accessToken };
}

