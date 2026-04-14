#!/usr/bin/env -S npx tsx
/**
 * Setup RAG test environment (combined provision + table setup)
 *
 * This script:
 * 1. Checks if test-rag database exists
 * 2. Provisions it if not
 * 3. Sets up RAG test tables (articles + articles_chunks)
 * 4. Inserts test data
 *
 * Usage:
 *   npx tsx scripts/setup-rag-test.ts
 *
 * Prerequisites:
 *   - constructive-server running (skaffold dev)
 *   - Port forwarding:
 *     - kubectl port-forward svc/constructive-server 3002:3000
 *     - kubectl port-forward svc/postgres 5432:5432
 */
import http from 'node:http';
import pg from 'pg';

// Fixed test database name
const TEST_DB_NAME = 'test-rag';
const TEST_EMAIL = 'test@test.com';
const TEST_PASSWORD = 'test123456!';

/**
 * Make HTTP POST request with custom Host header
 */
function httpPost(host: string, port: number, body: string, headers: Record<string, string> = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port,
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Host': host,
        'Content-Length': Buffer.byteLength(body),
        ...headers,
      },
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          reject(new Error(`Invalid JSON response: ${raw.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const serverPort = parseInt(process.env.SERVER_PORT || '3002', 10);
  const pgHost = process.env.PGHOST || 'localhost';
  const pgPort = parseInt(process.env.PGPORT || '5432', 10);
  const pgUser = process.env.PGUSER || 'postgres';
  const pgPassword = process.env.PGPASSWORD || 'postgres123!';

  console.log('=== RAG Test Environment Setup ===\n');
  console.log(`Database name: ${TEST_DB_NAME}`);
  console.log(`Server port: ${serverPort}`);
  console.log(`Postgres: ${pgHost}:${pgPort}`);

  // Connect to postgres to check if database exists
  const pgClient = new pg.Client({
    host: pgHost,
    port: pgPort,
    user: pgUser,
    password: pgPassword,
    database: 'constructive',
  });

  await pgClient.connect();
  console.log('\nConnected to postgres');

  // Step 1: Check if database already exists
  console.log('\n[1/5] Checking if database exists...');
  const dbCheck = await pgClient.query(
    `SELECT id, name FROM "metaschema_public"."database" WHERE name = $1`,
    [TEST_DB_NAME]
  );

  let databaseId: string;
  let userId: string;

  if (dbCheck.rows.length > 0) {
    databaseId = dbCheck.rows[0].id;
    console.log(`   Database already exists: ${databaseId}`);

    // Get owner ID
    const ownerCheck = await pgClient.query(
      `SELECT owner_id FROM "metaschema_public"."database" WHERE id = $1`,
      [databaseId]
    );
    userId = ownerCheck.rows[0].owner_id;
    console.log(`   Owner ID: ${userId}`);
  } else {
    // Step 2: Provision new database via GraphQL
    console.log('   Database not found, provisioning...');

    // Authenticate
    console.log('\n[2/5] Authenticating...');
    let signInResult = await httpPost('auth.localhost', serverPort, JSON.stringify({
      query: `mutation SignIn($input: SignInInput!) { signIn(input: $input) { result { accessToken userId } } }`,
      variables: { input: { email: TEST_EMAIL, password: TEST_PASSWORD } }
    }));

    if (signInResult.errors || !signInResult.data?.signIn?.result) {
      console.log('   User not found, signing up...');
      const signUpResult = await httpPost('auth.localhost', serverPort, JSON.stringify({
        query: `mutation SignUp($input: SignUpInput!) { signUp(input: $input) { result { accessToken userId } } }`,
        variables: { input: { email: TEST_EMAIL, password: TEST_PASSWORD } }
      }));

      if (signUpResult.errors) {
        console.error('Sign up failed:', signUpResult.errors);
        await pgClient.end();
        process.exit(1);
      }
      signInResult = { data: { signIn: signUpResult.data.signUp } };
    }

    const { accessToken, userId: authUserId } = signInResult.data.signIn.result;
    userId = authUserId;
    console.log(`   User ID: ${userId}`);

    // Provision database
    console.log('\n[3/5] Provisioning database...');
    const provisionResult = await httpPost('api.localhost', serverPort, JSON.stringify({
      query: `mutation ProvisionDatabase($input: CreateDatabaseProvisionModuleInput!) {
        createDatabaseProvisionModule(input: $input) {
          databaseProvisionModule { id databaseId databaseName status }
        }
      }`,
      variables: {
        input: {
          databaseProvisionModule: {
            databaseName: TEST_DB_NAME,
            ownerId: userId,
            subdomain: TEST_DB_NAME,
            domain: 'localhost',
            modules: ['all'],
            bootstrapUser: true,
          }
        }
      }
    }), { Authorization: `Bearer ${accessToken}` });

    if (provisionResult.errors) {
      console.error('Provision failed:', provisionResult.errors);
      await pgClient.end();
      process.exit(1);
    }

    const provision = provisionResult.data.createDatabaseProvisionModule.databaseProvisionModule;
    databaseId = provision.databaseId;
    console.log(`   Database ID: ${databaseId}`);
    console.log(`   Status: ${provision.status}`);
  }

  // Step 3: Get schema ID
  console.log('\n[3/5] Getting schema ID...');
  const schemaResult = await pgClient.query(
    `SELECT id, name, schema_name FROM "metaschema_public"."schema"
     WHERE database_id = $1 AND name = 'app_public'`,
    [databaseId]
  );

  if (schemaResult.rows.length === 0) {
    console.error('Schema app_public not found. Database may still be provisioning.');
    await pgClient.end();
    process.exit(1);
  }

  const schema = schemaResult.rows[0];
  console.log(`   Schema ID: ${schema.id}`);
  console.log(`   Schema name: ${schema.schema_name}`);

  // Step 4: Create blueprint and tables
  console.log('\n[4/5] Setting up RAG tables...');

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

  // Check/create blueprint
  const existingBp = await pgClient.query(
    `SELECT id FROM "metaschema_modules_public"."blueprint"
     WHERE database_id = $1 AND name = 'rag_test_articles'`,
    [databaseId]
  );

  let blueprintId: string;
  if (existingBp.rows.length > 0) {
    blueprintId = existingBp.rows[0].id;
    console.log(`   Blueprint exists: ${blueprintId}`);
  } else {
    const bpResult = await pgClient.query(
      `INSERT INTO "metaschema_modules_public"."blueprint"
        (owner_id, database_id, name, display_name, definition)
       VALUES ($1, $2, 'rag_test_articles', 'RAG Test Articles', $3::jsonb)
       RETURNING id`,
      [userId, databaseId, JSON.stringify(blueprintDefinition)]
    );
    blueprintId = bpResult.rows[0].id;
    console.log(`   Blueprint created: ${blueprintId}`);
  }

  // Check/construct blueprint
  const existingConstruction = await pgClient.query(
    `SELECT id, status, table_map FROM "metaschema_modules_public"."blueprint_construction"
     WHERE blueprint_id = $1 AND status = 'constructed'`,
    [blueprintId]
  );

  let tableMap: Record<string, string>;
  if (existingConstruction.rows.length > 0) {
    tableMap = existingConstruction.rows[0].table_map;
    console.log(`   Blueprint already constructed`);
  } else {
    const constructResult = await pgClient.query(
      `SELECT "metaschema_modules_public".construct_blueprint(
        blueprint_id := $1,
        schema_id := $2
       ) as construction_id`,
      [blueprintId, schema.id]
    );
    const constructionId = constructResult.rows[0].construction_id;

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
    console.log(`   Blueprint constructed`);
  }

  const articlesTableId = tableMap['articles'];
  console.log(`   Articles table ID: ${articlesTableId}`);

  // Create embedding_chunks config
  const existingEmbedding = await pgClient.query(
    `SELECT id, chunks_table_id, chunks_table_name FROM "metaschema_public"."embedding_chunks"
     WHERE table_id = $1`,
    [articlesTableId]
  );

  let chunksTableName: string;
  if (existingEmbedding.rows.length > 0) {
    chunksTableName = existingEmbedding.rows[0].chunks_table_name;
    console.log(`   Embedding config exists, chunks table: ${chunksTableName}`);
  } else {
    const embeddingResult = await pgClient.query(
      `INSERT INTO "metaschema_public"."embedding_chunks" (
        database_id, table_id, content_field_name, dimensions, metric,
        chunk_size, chunk_overlap, chunk_strategy, chunking_task_name
      ) VALUES ($1, $2, 'content', 768, 'cosine', 1000, 200, 'fixed', 'rag-embedding')
      RETURNING id, chunks_table_id, chunks_table_name`,
      [databaseId, articlesTableId]
    );
    chunksTableName = embeddingResult.rows[0].chunks_table_name;
    console.log(`   Embedding config created, chunks table: ${chunksTableName}`);
  }

  // Step 5: Insert test article
  console.log('\n[5/5] Inserting test data...');

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

  let articleId: string;
  try {
    const existingArticle = await pgClient.query(
      `SELECT id FROM ${actualTableName} LIMIT 1`
    );
    if (existingArticle.rows.length > 0) {
      articleId = existingArticle.rows[0].id;
      console.log(`   Test article exists: ${articleId}`);
    } else {
      // Disable triggers to insert without creating job
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
      console.log(`   Test article created: ${articleId}`);

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
      console.log('   Table not yet created, waiting for sync...');
      articleId = 'pending';
    } else {
      throw err;
    }
  }

  await pgClient.end();

  // Print summary
  console.log('\n=== Setup Complete ===\n');
  console.log('Database ID:', databaseId);
  console.log('Schema:', schema.schema_name);
  console.log('Article ID:', articleId);
  console.log('\nTo test rag-embedding function:\n');
  console.log(`curl -X POST http://localhost:8083 \\
  -H "Content-Type: application/json" \\
  -H "X-Database-Id: ${databaseId}" \\
  -d '{
    "table": "articles",
    "schema": "${schema.schema_name}",
    "id": "${articleId}",
    "chunks_table": "${chunksTableName}",
    "chunk_size": "1000",
    "chunk_overlap": "200",
    "chunk_strategy": "fixed"
  }'`);
}

main().catch(async err => {
  console.error('Error:', err);
  process.exit(1);
});
