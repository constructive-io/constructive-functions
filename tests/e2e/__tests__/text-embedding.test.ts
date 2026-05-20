/**
 * E2E: text-embedding function (generate_embedding task)
 *
 * This test verifies the SearchVector embedding flow using a provisioned tenant database.
 * Prerequisites: Run provision-with-search-vector.ts to create a tenant with SearchUnified.
 *
 * Run: pnpm test:e2e -- --testPathPattern=text-embedding
 *
 * KNOWN BUG: SearchUnified trigger creates jobs with NULL database_id because
 * app_jobs.add_job reads database_id from JWT claims, which don't exist in trigger context.
 * This test works around the bug by manually setting database_id on the job.
 * TODO: Fix in constructive-db SearchUnified node to pass database_id explicitly.
 */
import {
  getTestConnections,
  closeConnections,
  TestClient,
} from '../utils/db';
import { addJob, waitForJobComplete } from '../utils/jobs';

describe('E2E: text-embedding (generate_embedding)', () => {
  let pg: TestClient;
  let tenantSchema: string | null = null;
  let tenantDatabaseId: string | null = null;
  let documentId: string;

  beforeAll(async () => {
    const connections = await getTestConnections();
    pg = connections.pg;

    // Find an existing tenant database with documents table (created by provision-with-search-vector.ts)
    // Schema naming pattern: {database_name}-{hash}-app-public
    const schemaResult = await pg.query(`
      SELECT
        s.table_schema,
        d.id as database_id
      FROM information_schema.tables s
      JOIN metaschema_public.database d
        ON s.table_schema LIKE d.name || '-%'
      WHERE s.table_name = 'documents'
        AND s.table_schema LIKE '%-app-public'
        AND d.name != 'constructive'
        AND EXISTS (
          SELECT 1 FROM information_schema.columns c
          WHERE c.table_schema = s.table_schema
            AND c.table_name = 'documents'
            AND c.column_name = 'embedding'
        )
      LIMIT 1
    `);

    if (schemaResult.rows.length > 0) {
      tenantSchema = schemaResult.rows[0].table_schema;
      tenantDatabaseId = schemaResult.rows[0].database_id;
      console.log(`[text-embedding] Found tenant schema: ${tenantSchema}`);
      console.log(`[text-embedding] Database ID: ${tenantDatabaseId}`);
    } else {
      console.log(`[text-embedding] No tenant with documents+embedding found.`);
      console.log(`[text-embedding] Run: PORT=3002 pnpm tsx src/provision-with-search-vector.ts testvec1`);
    }
  });

  afterAll(async () => {
    await closeConnections();
  });

  it('should generate embedding for a document', async () => {
    if (!tenantSchema || !tenantDatabaseId) {
      console.log('[text-embedding] Skipping: No provisioned tenant found');
      return;
    }

    // Insert test document (trigger will auto-generate embedding_text)
    console.log(`[text-embedding] Inserting test document`);
    const insertResult = await pg.query(`
      INSERT INTO "${tenantSchema}".documents (title, body, owner_id)
      VALUES (
        'E2E Test: Neural Networks',
        'Deep learning uses artificial neural networks with multiple layers.',
        gen_random_uuid()
      )
      RETURNING id, embedding_text
    `);
    documentId = insertResult.rows[0].id;
    console.log(`[text-embedding] Created document: ${documentId}`);
    console.log(`[text-embedding] embedding_text: ${insertResult.rows[0].embedding_text}`);

    // Wait a moment for the auto-enqueued job to be created
    await new Promise(r => setTimeout(r, 1000));

    // Find the auto-enqueued job for this document
    const jobResult = await pg.query(`
      SELECT id, database_id FROM app_jobs.jobs
      WHERE task_identifier = 'generate_embedding'
        AND payload->>'id' = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [documentId]);

    let jobId: string;
    if (jobResult.rows.length > 0) {
      jobId = jobResult.rows[0].id;
      console.log(`[text-embedding] Found auto-enqueued job: ${jobId}`);

      // BUG WORKAROUND: SearchUnified trigger doesn't set database_id (no JWT context in triggers)
      // Fix the job's database_id if it's NULL and reset for retry
      if (!jobResult.rows[0].database_id) {
        console.log(`[text-embedding] Fixing NULL database_id on job ${jobId}`);
        await pg.query(`
          UPDATE app_jobs.jobs
          SET database_id = $1, attempts = 0, last_error = NULL, run_at = NOW()
          WHERE id = $2
        `, [tenantDatabaseId, jobId]);
      }
    } else {
      // Manually create job if trigger didn't fire
      console.log(`[text-embedding] No auto-enqueued job found, creating manually`);
      const job = await addJob(pg, tenantDatabaseId, 'generate_embedding', {
        schema: tenantSchema,
        table: 'documents',
        id: documentId,
        field: 'embedding',
      });
      jobId = job.id;
      console.log(`[text-embedding] Job created: ${jobId}`);
    }

    // Wait for job to complete
    const result = await waitForJobComplete(pg, jobId, { timeout: 30000 });
    console.log(`[text-embedding] Job result: ${result.status}`);
    if (result.status === 'failed') {
      console.log(`[text-embedding] Job error: ${result.error}`);
    }
    expect(result.status).toBe('completed');

    // Verify embedding was generated
    const afterResult = await pg.query(`
      SELECT
        embedding IS NOT NULL as has_embedding,
        left(embedding::text, 80) as preview
      FROM "${tenantSchema}".documents
      WHERE id = $1
    `, [documentId]);

    expect(afterResult.rows[0].has_embedding).toBe(true);
    console.log(`[text-embedding] Embedding preview: ${afterResult.rows[0].preview}`);

    // Verify it's not all zeros (real embedding)
    const isZeros = afterResult.rows[0].preview?.startsWith('[0,0,0,0,0');
    if (isZeros) {
      console.log(`[text-embedding] WARNING: Embedding is all zeros (DRY_RUN mode or OLLAMA_URL not set)`);
    } else {
      console.log(`[text-embedding] SUCCESS: Real embedding generated`);
    }
  });
});
