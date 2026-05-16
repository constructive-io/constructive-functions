/**
 * E2E: rag-embedding function
 *
 * This test provisions a complete test environment:
 * 1. Sign in/up via SDK auth
 * 2. Provision a new database via SDK
 * 3. Create article table via metaschema SQL
 * 4. Configure embedding_chunks (creates article_chunks table)
 * 5. Insert test article
 * 6. Add rag-embedding job and verify completion
 *
 * Run: pnpm test:e2e -- --testPathPattern=rag-embedding
 */
import {
  getTestConnections,
  closeConnections,
  TestClient,
} from '../utils/db';
import { addJob, waitForJobComplete, waitForJobCreated, deleteTestJobs } from '../utils/jobs';
import {
  signInOrSignUp as sdkSignInOrSignUp,
  provisionDatabase as sdkProvisionDatabase,
  getSchemaInfo as sdkGetSchemaInfo,
  createTable as sdkCreateTable,
  createField as sdkCreateField,
  createPrimaryKey as sdkCreatePrimaryKey,
  setupEmbeddingChunks as sdkSetupEmbeddingChunks,
} from '../utils/sdk';

const TEST_PREFIX = 'k8s-e2e-rag-embedding';
const TEST_EMAIL = 'rag-test@test.com';
const TEST_PASSWORD = 'test123456!';

async function createArticlesTable(
  accessToken: string,
  databaseId: string,
  schemaId: string
): Promise<string> {
  const tableId = await sdkCreateTable(accessToken, databaseId, schemaId, 'article');

  const idFieldId = await sdkCreateField(accessToken, tableId, 'id', 'uuid', {
    isRequired: true,
    defaultValue: 'uuid_generate_v4()',
  });
  await sdkCreatePrimaryKey(accessToken, tableId, [idFieldId]);

  await sdkCreateField(accessToken, tableId, 'title', 'text');
  await sdkCreateField(accessToken, tableId, 'content', 'text');

  return tableId;
}

async function setupEmbeddingChunks(
  accessToken: string,
  databaseId: string,
  tableId: string
): Promise<string> {
  return sdkSetupEmbeddingChunks(accessToken, databaseId, tableId, {
    contentFieldName: 'content',
    dimensions: 768,
    chunkSize: 1000,
    chunkOverlap: 200,
    chunkStrategy: 'fixed',
    chunkingTaskName: 'rag-embedding',
  });
}

async function insertTestArticle(
  pg: TestClient,
  schemaName: string,
  databaseId: string
): Promise<string> {
  const testContent = `
Artificial Intelligence and Machine Learning

Artificial intelligence (AI) is the simulation of human intelligence processes by machines.
Machine learning is a subset of AI that provides systems the ability to automatically learn.

Deep Learning and Neural Networks

Deep learning is part of a broader family of machine learning methods based on artificial neural networks.
These systems learn to perform tasks by considering examples, generally without being programmed.
  `.trim();

  const tableName = `"${schemaName}"."article"`;

  // Use session-level config (false = not transaction-local) so it persists for the INSERT
  await pg.query(`SELECT set_config('jwt.claims.database_id', $1, false)`, [databaseId]);

  const result = await pg.query(
    `INSERT INTO ${tableName} (title, content)
     VALUES ($1, $2)
     RETURNING id`,
    ['Introduction to AI', testContent]
  );

  return result.rows[0].id;
}

describe('E2E: rag-embedding', () => {
  let pg: TestClient;
  let databaseId: string;
  let schemaName: string;
  let articleId: string;
  let chunksTableName: string;
  let accessToken: string;
  let subdomain: string;
  let userId: string;

  const dbName = `rag_test_${Date.now()}`;

  beforeAll(async () => {
    const connections = await getTestConnections();
    pg = connections.pg;

    console.log('[rag-embedding e2e] Authenticating via SDK...');
    const auth = await sdkSignInOrSignUp(TEST_EMAIL, TEST_PASSWORD);
    accessToken = auth.accessToken;
    userId = auth.userId;
    subdomain = dbName.replace(/_/g, '-');
    console.log(`[rag-embedding e2e] User ID: ${userId}`);

    console.log('[rag-embedding e2e] Provisioning database via SDK...');
    const db = await sdkProvisionDatabase(accessToken, userId, dbName);
    databaseId = db.databaseId;
    console.log(`[rag-embedding e2e] Database ID: ${databaseId}`);

    console.log('[rag-embedding e2e] Getting schema info via SDK...');
    const schema = await sdkGetSchemaInfo(accessToken, databaseId);
    schemaName = schema.schemaName;
    console.log(`[rag-embedding e2e] Schema: ${schemaName}`);

    console.log('[rag-embedding e2e] Creating article table via SDK...');
    const tableId = await createArticlesTable(accessToken, databaseId, schema.schemaId);
    console.log(`[rag-embedding e2e] Table ID: ${tableId}`);

    console.log('[rag-embedding e2e] Setting up embedding_chunks via SDK...');
    chunksTableName = await setupEmbeddingChunks(accessToken, databaseId, tableId);
    console.log(`[rag-embedding e2e] Chunks table: ${chunksTableName}`);

    console.log('[rag-embedding e2e] Inserting test article...');
    articleId = await insertTestArticle(pg, schemaName, databaseId);
    console.log(`[rag-embedding e2e] Article ID: ${articleId}`);
  }, 300000);

  afterAll(async () => {
    if (pg) {
      await deleteTestJobs(pg, TEST_PREFIX);
      // Clean up test database to prevent OOM from accumulated schema caches
      if (databaseId) {
        try {
          await pg.query(`DELETE FROM metaschema_public.database WHERE id = $1`, [databaseId]);
          console.log(`[rag-embedding e2e] Cleaned up test database: ${databaseId}`);
        } catch (err) {
          console.log(`[rag-embedding e2e] Failed to clean up database: ${err}`);
        }
      }
    }
    await closeConnections();
  });

  it('should process rag-embedding job and create chunks', async () => {
    const job = await addJob(pg, databaseId, 'rag-embedding', {
      table: 'article',
      schema: schemaName,
      id: articleId,
      chunks_table: chunksTableName,
      chunk_size: '1000',
      chunk_overlap: '200',
      chunk_strategy: 'fixed',
    });

    expect(job.id).toBeDefined();
    console.log(`[rag-embedding e2e] Added job: ${job.id}`);

    const result = await waitForJobComplete(pg, job.id, { timeout: 60000 });
    console.log(`[rag-embedding e2e] Job result: ${result.status}`, result.error || '');

    expect(result.status).toBe('completed');

    const chunks = await pg.query(
      `SELECT id, chunk_index, content, embedding
       FROM "${schemaName}"."${chunksTableName}"
       WHERE article_id = $1
       ORDER BY chunk_index`,
      [articleId]
    );

    console.log(`[rag-embedding e2e] Chunks created: ${chunks.rows.length}`);

    expect(chunks.rows.length).toBeGreaterThan(0);
    expect(chunks.rows[0].content).toBeDefined();
    expect(chunks.rows[0].embedding).toBeDefined();
  }, 90000);

  it('should process job with actor_id for updated content', async () => {
    // Clear existing chunks first
    await pg.query(
      `DELETE FROM "${schemaName}"."${chunksTableName}" WHERE article_id = $1`,
      [articleId]
    );

    // Update article content directly via SQL
    const updatedContent = `Updated content for RAG testing.

This is a test of the rag-embedding job with actor_id.
The job should process the updated content and create new chunks.`;

    await pg.query(`SELECT set_config('jwt.claims.database_id', $1, false)`, [databaseId]);
    await pg.query(
      `UPDATE "${schemaName}"."article" SET content = $1 WHERE id = $2`,
      [updatedContent, articleId]
    );
    console.log('[rag-embedding e2e] Article updated via SQL');

    // Set user_id claim so add_job() auto-injects actor_id (like a real trigger would)
    await pg.query(`SELECT set_config('jwt.claims.user_id', $1, false)`, [userId]);

    // Add job - actor_id is auto-injected by add_job() from jwt.claims.user_id
    const job = await addJob(pg, databaseId, 'rag-embedding', {
      table: 'article',
      schema: schemaName,
      id: articleId,
      chunks_table: chunksTableName,
      chunk_size: '1000',
      chunk_overlap: '200',
      chunk_strategy: 'fixed',
    });

    console.log(`[rag-embedding e2e] Added job with actor_id: ${job.id}`);

    const result = await waitForJobComplete(pg, job.id, { timeout: 60000 });
    console.log(`[rag-embedding e2e] Job result: ${result.status}`, result.error || '');
    expect(result.status).toBe('completed');

    // Check chunks were created
    const chunks = await pg.query(
      `SELECT id, chunk_index, content
       FROM "${schemaName}"."${chunksTableName}"
       WHERE article_id = $1
       ORDER BY chunk_index`,
      [articleId]
    );

    console.log(`[rag-embedding e2e] Chunks after update: ${chunks.rows.length}`);
  }, 90000);

  it('should auto-trigger job on INSERT', async () => {
    // Set JWT claims for trigger to call add_job()
    await pg.query(`SELECT set_config('jwt.claims.database_id', $1, false)`, [databaseId]);
    await pg.query(`SELECT set_config('jwt.claims.user_id', $1, false)`, [userId]);

    // Get last job ID to filter new jobs
    const lastJob = await pg.oneOrNone<{ id: string }>(
      `SELECT id FROM app_jobs.jobs WHERE database_id = $1 ORDER BY id DESC LIMIT 1`,
      [databaseId]
    );

    // INSERT triggers article_enqueue_chunking_insert_tg
    const tableName = `"${schemaName}"."article"`;
    const result = await pg.query(
      `INSERT INTO ${tableName} (title, content) VALUES ($1, $2) RETURNING id`,
      ['Trigger Test', 'Content to test automatic trigger creates rag-embedding job.']
    );
    const newArticleId = result.rows[0].id;
    console.log(`[rag-embedding e2e] Inserted article: ${newArticleId}`);

    // Wait for trigger-created job
    const job = await waitForJobCreated(pg, databaseId, 'rag-embedding', {
      timeout: 5000,
      afterId: lastJob?.id,
    });

    expect(job).not.toBeNull();
    console.log(`[rag-embedding e2e] Trigger created job: ${job!.id}`);
    expect(job!.payload.id).toBe(newArticleId);

    // Wait for completion
    const complete = await waitForJobComplete(pg, job!.id, { timeout: 60000 });
    console.log(`[rag-embedding e2e] Trigger job: ${complete.status}`);
    expect(complete.status).toBe('completed');

    // Verify chunks
    const chunks = await pg.query(
      `SELECT id FROM "${schemaName}"."${chunksTableName}" WHERE article_id = $1`,
      [newArticleId]
    );
    expect(chunks.rows.length).toBeGreaterThan(0);
    console.log(`[rag-embedding e2e] Trigger test chunks: ${chunks.rows.length}`);
  }, 90000);
});
