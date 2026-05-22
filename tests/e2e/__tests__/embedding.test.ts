/**
 * E2E: Embedding functions (generate_chunks + generate_embedding)
 *
 * Tests both embedding features on the same article table:
 *   - ProcessChunks: creates article_chunks with chunk embeddings
 *   - SearchUnified: adds embedding field to article
 *
 * Run: pnpm test:e2e -- --testPathPattern=embedding
 */
import {
  getTestConnections,
  closeConnections,
  TestClient,
} from '../utils/db';
import { waitForJobCreated, waitForJobComplete } from '../utils/jobs';
import { provisionArticle, TenantConfig } from '../utils/provision';

describe('E2E: embedding (ProcessChunks + SearchUnified)', () => {
  let pg: TestClient;
  let tenant: TenantConfig;
  let articleId: string | null = null;

  beforeAll(async () => {
    const connections = await getTestConnections();
    pg = connections.pg;

    const dbName = 'embedding_e2e_test';
    console.log(`[embedding] Provisioning: ${dbName}`);
    tenant = await provisionArticle(pg, dbName);
    console.log(`[embedding] Ready: ${tenant.schemaName}`);
  }, 120000);

  afterAll(async () => {
    if (tenant && articleId) {
      try {
        await pg.query(`DELETE FROM "${tenant.schemaName}".article_chunks WHERE article_id = $1`, [articleId]);
        await pg.query(`DELETE FROM "${tenant.schemaName}".article WHERE id = $1`, [articleId]);
        console.log(`[embedding] Cleaned up test data`);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    await closeConnections();
  });

  it('should generate chunks and embedding for an article', async () => {
    const content = `
      Machine learning is a subset of artificial intelligence that enables systems
      to learn and improve from experience without being explicitly programmed.
      Deep learning, a further subset, uses neural networks with many layers.
      These networks can identify patterns in large amounts of unstructured data.
      Applications include image recognition, natural language processing, and
      autonomous vehicles. The field continues to evolve rapidly with new advances.
    `.trim();

    // Insert article
    console.log(`[embedding] Inserting article`);
    await pg.query(`SELECT set_config('jwt.claims.database_id', $1, false)`, [tenant.databaseId]);

    const insertResult = await pg.query(`
      INSERT INTO "${tenant.schemaName}".article (title, content, owner_id)
      VALUES ('E2E Test: Machine Learning', $1, gen_random_uuid())
      RETURNING id, embedding_text
    `, [content]);
    articleId = insertResult.rows[0].id;
    console.log(`[embedding] Article: ${articleId}`);
    console.log(`[embedding] embedding_text: ${insertResult.rows[0].embedding_text?.substring(0, 80)}...`);

    // Wait for both jobs
    const [chunksJob, embeddingJob] = await Promise.all([
      waitForJobCreated(pg, 'generate_chunks', articleId, tenant.databaseId),
      waitForJobCreated(pg, 'generate_embedding', articleId, tenant.databaseId),
    ]);

    if (!chunksJob) throw new Error('Trigger did not create job for generate_chunks');
    if (!embeddingJob) throw new Error('Trigger did not create job for generate_embedding');

    console.log(`[embedding] Found jobs: chunks=${chunksJob.jobId}, embedding=${embeddingJob.jobId}`);

    // Wait for both jobs to complete
    console.log(`[embedding] Waiting for jobs...`);
    const [chunksResult, embeddingResult] = await Promise.all([
      waitForJobComplete(pg, chunksJob.jobId, { timeout: 90000 }),
      waitForJobComplete(pg, embeddingJob.jobId, { timeout: 60000 }),
    ]);

    console.log(`[embedding] Job results: chunks=${chunksResult.status}, embedding=${embeddingResult.status}`);

    if (chunksResult.status === 'failed') throw new Error(`Chunks job failed: ${chunksResult.error}`);
    if (embeddingResult.status === 'failed') throw new Error(`Embedding job failed: ${embeddingResult.error}`);

    // Verify chunks were created
    const chunksResult2 = await pg.query(`
      SELECT
        id,
        chunk_index,
        length(content) as content_length,
        embedding IS NOT NULL as has_embedding
      FROM "${tenant.schemaName}".article_chunks
      WHERE article_id = $1
      ORDER BY chunk_index
    `, [articleId]);

    console.log(`[embedding] Chunks created: ${chunksResult2.rows.length}`);
    for (const chunk of chunksResult2.rows) {
      console.log(`[embedding]   [${chunk.chunk_index}] ${chunk.content_length} chars, embedding: ${chunk.has_embedding}`);
    }

    expect(chunksResult2.rows.length).toBeGreaterThan(0);
    expect(chunksResult2.rows.every(r => r.has_embedding)).toBe(true);

    // Verify article embedding was generated
    const articleResult = await pg.query(`
      SELECT
        embedding IS NOT NULL as has_embedding,
        left(embedding::text, 80) as preview
      FROM "${tenant.schemaName}".article
      WHERE id = $1
    `, [articleId]);

    expect(articleResult.rows[0].has_embedding).toBe(true);
    console.log(`[embedding] Article embedding: ${articleResult.rows[0].preview}`);

    // Summary
    const isZeros = articleResult.rows[0].preview?.startsWith('[0,0,0,0,0');
    if (isZeros) {
      console.log(`[embedding] Mode: DRY_RUN (zero vectors)`);
    } else {
      console.log(`[embedding] Mode: Real embeddings`);
    }
  }, 120000);
});
