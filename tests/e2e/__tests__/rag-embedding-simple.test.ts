/**
 * E2E: rag-embedding function (simplified)
 *
 * This test uses the existing database directly without SDK provisioning:
 * 1. Create test schema and table via SQL
 * 2. Set up embedding chunks via SQL
 * 3. Insert test article
 * 4. Add rag-embedding job and verify completion
 *
 * Run: pnpm exec jest tests/e2e/__tests__/rag-embedding-simple.test.ts
 */
import {
  getTestConnections,
  closeConnections,
  TestClient,
} from '../utils/db';
import { addJob, waitForJobComplete, deleteTestJobs, Job } from '../utils/jobs';

const TEST_PREFIX = 'rag-simple-test';

describe('E2E: rag-embedding (simplified)', () => {
  let pg: TestClient;
  const testSchemaName = `test_rag_${Date.now()}`;
  const testTableName = 'article';
  let articleId: string;
  let databaseId: string;

  beforeAll(async () => {
    const connections = await getTestConnections();
    pg = connections.pg;

    // Get the existing database ID
    const dbResult = await pg.query(
      `SELECT id FROM metaschema_public.database WHERE name = 'constructive' LIMIT 1`
    );
    databaseId = dbResult.rows[0].id;
    console.log(`[rag-simple] Using database ID: ${databaseId}`);

    // Create test schema
    console.log(`[rag-simple] Creating test schema: ${testSchemaName}`);
    await pg.query(`CREATE SCHEMA IF NOT EXISTS "${testSchemaName}"`);
    await pg.query(`SET search_path TO "${testSchemaName}", public`);

    // Create article table
    console.log(`[rag-simple] Creating article table`);
    await pg.query(`
      CREATE TABLE IF NOT EXISTS "${testSchemaName}".article (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        title text,
        content text,
        created_at timestamptz DEFAULT now()
      )
    `);

    // Create chunks table for rag-embedding output
    console.log(`[rag-simple] Creating article_chunks table`);
    await pg.query(`
      CREATE TABLE IF NOT EXISTS "${testSchemaName}".article_chunks (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        article_id uuid REFERENCES "${testSchemaName}".article(id),
        chunk_index int,
        chunk_text text,
        embedding vector(768),
        created_at timestamptz DEFAULT now()
      )
    `);
  });

  afterAll(async () => {
    // Clean up test schema
    if (pg) {
      try {
        await pg.query(`DROP SCHEMA IF EXISTS "${testSchemaName}" CASCADE`);
        console.log(`[rag-simple] Dropped test schema: ${testSchemaName}`);
      } catch (e) {
        console.error(`[rag-simple] Failed to drop schema: ${e}`);
      }
    }
    await closeConnections();
  });

  beforeEach(async () => {
    await deleteTestJobs(pg, 'generate_chunks');
  });

  it('should process rag-embedding job and create chunks', async () => {
    const testContent = `
Artificial Intelligence and Machine Learning

Artificial intelligence (AI) is the simulation of human intelligence processes by machines.
Machine learning is a subset of AI that provides systems the ability to automatically learn.

Deep Learning and Neural Networks

Deep learning is part of a broader family of machine learning methods based on artificial neural networks.
These systems learn to perform tasks by considering examples, generally without being programmed.
    `.trim();

    // Set database context
    await pg.query(`SELECT set_config('jwt.claims.database_id', $1, false)`, [databaseId]);

    // Insert test article
    console.log(`[rag-simple] Inserting test article`);
    const insertResult = await pg.query(
      `INSERT INTO "${testSchemaName}".article (title, content)
       VALUES ($1, $2)
       RETURNING id`,
      ['Introduction to AI', testContent]
    );
    articleId = insertResult.rows[0].id;
    console.log(`[rag-simple] Article ID: ${articleId}`);

    // Create rag-embedding job
    console.log(`[rag-simple] Creating rag-embedding job`);
    const jobPayload = {
      table: 'article',
      schema: testSchemaName,
      id: articleId,
      chunks_table: 'article_chunks',
      chunk_size: '500',
      chunk_overlap: '100',
      chunk_strategy: 'fixed',
    };

    const job: Job = await addJob(pg, databaseId, 'generate_chunks', jobPayload);
    const jobId = job.id;
    console.log(`[rag-simple] Job ID: ${jobId}`);

    // Wait for job completion (with timeout)
    const isDryRun = process.env.RAG_EMBEDDING_DRY_RUN !== 'false';
    console.log(`[rag-simple] Waiting for job completion (DRY_RUN=${isDryRun})...`);

    const completed = await waitForJobComplete(pg, jobId, { timeoutMs: 60000 });
    expect(completed).toBe(true);

    // Verify chunks were created (only if not dry run)
    if (!isDryRun) {
      const chunksResult = await pg.query(
        `SELECT * FROM "${testSchemaName}".article_chunks WHERE article_id = $1 ORDER BY chunk_index`,
        [articleId]
      );
      console.log(`[rag-simple] Created ${chunksResult.rows.length} chunks`);
      expect(chunksResult.rows.length).toBeGreaterThan(0);

      // Verify embedding was generated
      const firstChunk = chunksResult.rows[0];
      expect(firstChunk.chunk_text).toBeTruthy();
      expect(firstChunk.embedding).toBeTruthy();
    } else {
      console.log(`[rag-simple] Dry run mode - skipping chunk verification`);
    }
  }, 120000);
});
