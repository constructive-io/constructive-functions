#!/usr/bin/env npx tsx
/**
 * Setup RAG test tables in test-rag database using Blueprint
 *
 * Creates via blueprint:
 * - articles table with content field and DataEmbedding node
 * - Automatically creates articles_chunks table
 * - Test data
 *
 * Usage:
 *   npx tsx scripts/setup-rag-test-tables.ts
 *
 * Prerequisites:
 *   - test-rag database provisioned (run provision-test-db.ts first)
 *   - postgres port-forward on 5432
 */
import pg from 'pg';

const TEST_RAG_DATABASE_ID = '019d67cb-45d1-70fb-ad65-d03ee63a8b3f';
const TEST_USER_ID = '019d67cb-13e7-7112-838d-480a961762e0'; // from provision-test-db.ts

const pgClient = new pg.Client({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres123!',
  database: 'constructive',  // Always use constructive database
});

async function main() {
  console.log('Setting up RAG test tables via Blueprint...');
  console.log(`Database ID: ${TEST_RAG_DATABASE_ID}`);

  await pgClient.connect();
  console.log('Connected to postgres');

  // Test connection
  const testResult = await pgClient.query('SELECT current_database()');
  console.log(`Connected to database: ${testResult.rows[0].current_database}`);

  // Step 1: Get app_public schema ID
  console.log('\n1. Getting schema ID...');
  const schemaResult = await pgClient.query(
    `SELECT id, name, schema_name FROM "metaschema_public"."schema"
     WHERE database_id = $1 AND name = 'app_public'`,
    [TEST_RAG_DATABASE_ID]
  );

  if (schemaResult.rows.length === 0) {
    console.error('Schema app_public not found. Run provision-test-db.ts first.');
    await pgClient.end();
    process.exit(1);
  }

  const schema = schemaResult.rows[0];
  console.log(`   Schema ID: ${schema.id}`);
  console.log(`   Schema name: ${schema.schema_name}`);

  // Step 2: Create blueprint definition
  console.log('\n2. Creating blueprint...');

  // Blueprint without DataEmbedding (not a valid node type)
  // We'll add embedding_chunks config separately
  const blueprintDefinition = {
    tables: [
      {
        table_name: 'articles',
        nodes: [
          { $type: 'DataId' },
          { $type: 'DataTimestamps' }
        ],
        fields: [
          { name: 'title', type: 'text', is_required: false },
          { name: 'content', type: 'text', is_required: false }
        ],
        grant_roles: ['authenticated'],
        grants: [
          ['select', '*'],
          ['insert', '*'],
          ['update', '*'],
          ['delete', '*']
        ],
        policies: [
          {
            $type: 'AuthzAllowAll',
            privileges: ['select', 'insert', 'update', 'delete'],
            permissive: true
          }
        ]
      }
    ],
    relations: []
  };

  // Check if blueprint already exists
  const existingBp = await pgClient.query(
    `SELECT id FROM "metaschema_modules_public"."blueprint"
     WHERE database_id = $1 AND name = 'rag_test_articles'`,
    [TEST_RAG_DATABASE_ID]
  );

  let blueprintId: string;
  if (existingBp.rows.length > 0) {
    blueprintId = existingBp.rows[0].id;
    console.log(`   Blueprint already exists, ID: ${blueprintId}`);
  } else {
    const bpResult = await pgClient.query(
      `INSERT INTO "metaschema_modules_public"."blueprint"
        (owner_id, database_id, name, display_name, definition)
       VALUES ($1, $2, 'rag_test_articles', 'RAG Test Articles', $3::jsonb)
       RETURNING id`,
      [TEST_USER_ID, TEST_RAG_DATABASE_ID, JSON.stringify(blueprintDefinition)]
    );
    blueprintId = bpResult.rows[0].id;
    console.log(`   Blueprint ID: ${blueprintId}`);
  }

  // Step 3: Construct blueprint
  console.log('\n3. Constructing blueprint...');

  // Check if already constructed
  const existingConstruction = await pgClient.query(
    `SELECT id, status, table_map FROM "metaschema_modules_public"."blueprint_construction"
     WHERE blueprint_id = $1 AND status = 'constructed'`,
    [blueprintId]
  );

  let tableMap: Record<string, string>;
  if (existingConstruction.rows.length > 0) {
    console.log(`   Already constructed, ID: ${existingConstruction.rows[0].id}`);
    tableMap = existingConstruction.rows[0].table_map;
  } else {
    const constructResult = await pgClient.query(
      `SELECT "metaschema_modules_public".construct_blueprint(
        blueprint_id := $1,
        schema_id := $2
       ) as construction_id`,
      [blueprintId, schema.id]
    );
    const constructionId = constructResult.rows[0].construction_id;
    console.log(`   Construction ID: ${constructionId}`);

    // Get table_map
    const mapResult = await pgClient.query(
      `SELECT status, table_map, error_details FROM "metaschema_modules_public"."blueprint_construction"
       WHERE id = $1`,
      [constructionId]
    );

    if (mapResult.rows[0].status !== 'constructed') {
      console.error('Construction failed:', mapResult.rows[0].error_details);
      await pgClient.end();
      process.exit(1);
    }

    tableMap = mapResult.rows[0].table_map;
  }

  console.log('   Table map:', tableMap);

  const articlesTableId = tableMap['articles'];
  console.log(`   Articles table ID: ${articlesTableId}`);

  // Step 4: Create embedding_chunks config (this auto-creates the chunks table)
  console.log('\n4. Creating embedding_chunks config...');
  const existingEmbedding = await pgClient.query(
    `SELECT id, chunks_table_id, chunks_table_name FROM "metaschema_public"."embedding_chunks"
     WHERE table_id = $1`,
    [articlesTableId]
  );

  if (existingEmbedding.rows.length > 0) {
    const ec = existingEmbedding.rows[0];
    console.log(`   Embedding config already exists, ID: ${ec.id}`);
    console.log(`   Chunks table ID: ${ec.chunks_table_id}`);
    console.log(`   Chunks table name: ${ec.chunks_table_name}`);
  } else {
    const embeddingResult = await pgClient.query(
      `INSERT INTO "metaschema_public"."embedding_chunks" (
        database_id, table_id, content_field_name, dimensions, metric,
        chunk_size, chunk_overlap, chunk_strategy, chunking_task_name
      ) VALUES ($1, $2, 'content', 768, 'cosine', 1000, 200, 'fixed', 'rag-embedding')
      RETURNING id, chunks_table_id, chunks_table_name`,
      [TEST_RAG_DATABASE_ID, articlesTableId]
    );
    const ec = embeddingResult.rows[0];
    console.log(`   Embedding config ID: ${ec.id}`);
    console.log(`   Chunks table ID: ${ec.chunks_table_id}`);
    console.log(`   Chunks table name: ${ec.chunks_table_name}`);
  }

  // Step 5: Insert test article
  console.log('\n5. Inserting test article...');

  const testContent = `
Artificial Intelligence and Machine Learning

Artificial intelligence (AI) is the simulation of human intelligence processes by machines, especially computer systems. These processes include learning, reasoning, and self-correction. Machine learning is a subset of AI that provides systems the ability to automatically learn and improve from experience without being explicitly programmed.

Deep Learning and Neural Networks

Deep learning is part of a broader family of machine learning methods based on artificial neural networks. Neural networks are computing systems inspired by biological neural networks that constitute animal brains. These systems learn to perform tasks by considering examples, generally without being programmed with task-specific rules.

Applications of AI

AI has numerous applications across various industries:
- Healthcare: Disease diagnosis, drug discovery, personalized treatment
- Finance: Fraud detection, algorithmic trading, risk assessment
- Transportation: Autonomous vehicles, traffic optimization
- Manufacturing: Predictive maintenance, quality control, robotics

The Future of AI

As AI technology continues to advance, we can expect to see even more transformative applications. From natural language processing to computer vision, AI is reshaping how we interact with technology and solve complex problems.
  `.trim();

  const actualTableName = `"${schema.schema_name}"."articles"`;

  // Check if article already exists
  let articleId: string;
  try {
    const existingArticle = await pgClient.query(
      `SELECT id FROM ${actualTableName} LIMIT 1`
    );
    if (existingArticle.rows.length > 0) {
      articleId = existingArticle.rows[0].id;
      console.log(`   Article already exists, ID: ${articleId}`);
    } else {
      // Temporarily disable the chunking triggers to insert without creating job
      await pgClient.query(
        `ALTER TABLE ${actualTableName} DISABLE TRIGGER articles_enqueue_chunking_insert_tg`
      ).catch(() => {});
      await pgClient.query(
        `ALTER TABLE ${actualTableName} DISABLE TRIGGER articles_enqueue_chunking_update_tg`
      ).catch(() => {});

      const insertResult = await pgClient.query(
        `INSERT INTO ${actualTableName} (title, content) VALUES ($1, $2) RETURNING id`,
        ['Introduction to AI', testContent]
      );
      articleId = insertResult.rows[0].id;
      console.log(`   Article ID: ${articleId}`);

      // Re-enable triggers
      await pgClient.query(
        `ALTER TABLE ${actualTableName} ENABLE TRIGGER articles_enqueue_chunking_insert_tg`
      ).catch(() => {});
      await pgClient.query(
        `ALTER TABLE ${actualTableName} ENABLE TRIGGER articles_enqueue_chunking_update_tg`
      ).catch(() => {});
    }
  } catch (err: any) {
    if (err.code === '42P01') {
      console.log('   Table not yet created in postgres, waiting for sync...');
      articleId = 'pending';
    } else {
      throw err;
    }
  }

  await pgClient.end();

  console.log('\n6. Done!');
  console.log('\nTo test rag-embedding function:');
  console.log(`
curl -X POST http://localhost:8083 \\
  -H "Content-Type: application/json" \\
  -H "X-Database-Id: ${TEST_RAG_DATABASE_ID}" \\
  -d '{
    "table": "articles",
    "schema": "${schema.schema_name}",
    "id": "${articleId}",
    "chunks_table": "articles_chunks",
    "chunk_size": "1000",
    "chunk_overlap": "200",
    "chunk_strategy": "fixed"
  }'
  `);
}

main().catch(async err => {
  console.error('Error:', err);
  await pgClient.end().catch(() => {});
  process.exit(1);
});
