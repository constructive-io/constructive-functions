#!/usr/bin/env npx tsx
/**
 * Provision a test database for rag-embedding testing
 *
 * Usage:
 *   npx tsx scripts/provision-test-db.ts <db-name>
 *   npx tsx scripts/provision-test-db.ts test-rag
 *
 * Prerequisites:
 *   - constructive-server running (skaffold dev or kubectl)
 *   - Port forwarding: kubectl port-forward svc/constructive-server 3002:3000
 */
import http from 'node:http';

// Test user credentials
const TEST_EMAIL = 'test@test.com';
const TEST_PASSWORD = 'test123456!';

/**
 * Make HTTP POST request with custom Host header
 * Node.js fetch silently drops Host header, so we use node:http directly
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
  const dbName = process.argv[2];
  if (!dbName) {
    console.error('Usage: npx tsx scripts/provision-test-db.ts <db-name>');
    process.exit(1);
  }

  const port = parseInt(process.env.PORT || '3002', 10);
  console.log(`Provisioning database: ${dbName}`);
  console.log(`Server port: ${port}`);

  // Step 1: Try sign in first, if fails then sign up
  console.log('\n1. Authenticating...');

  let signInResult = await httpPost('auth.localhost', port, JSON.stringify({
    query: `mutation SignIn($input: SignInInput!) { signIn(input: $input) { result { accessToken userId } } }`,
    variables: { input: { email: TEST_EMAIL, password: TEST_PASSWORD } }
  }));

  if (signInResult.errors || !signInResult.data?.signIn?.result) {
    console.log('   User not found, signing up...');
    const signUpResult = await httpPost('auth.localhost', port, JSON.stringify({
      query: `mutation SignUp($input: SignUpInput!) { signUp(input: $input) { result { accessToken userId } } }`,
      variables: { input: { email: TEST_EMAIL, password: TEST_PASSWORD } }
    }));

    if (signUpResult.errors) {
      console.error('Sign up failed:', signUpResult.errors);
      process.exit(1);
    }
    signInResult = { data: { signIn: signUpResult.data.signUp } };
  }

  const { accessToken, userId } = signInResult.data.signIn.result;
  console.log(`   User ID: ${userId}`);
  console.log(`   Access Token: ${accessToken.slice(0, 20)}...`);

  // Step 2: Provision database
  console.log('\n2. Provisioning database...');
  const provisionResult = await httpPost('api.localhost', port, JSON.stringify({
    query: `mutation ProvisionDatabase($input: CreateDatabaseProvisionModuleInput!) {
      createDatabaseProvisionModule(input: $input) {
        databaseProvisionModule { id databaseId databaseName status }
      }
    }`,
    variables: {
      input: {
        databaseProvisionModule: {
          databaseName: dbName,
          ownerId: userId,
          subdomain: dbName,
          domain: 'localhost',
          modules: ['all'],
          bootstrapUser: true,
        }
      }
    }
  }), { Authorization: `Bearer ${accessToken}` });

  if (provisionResult.errors) {
    console.error('Provision failed:', provisionResult.errors);
    process.exit(1);
  }

  const provision = provisionResult.data.createDatabaseProvisionModule.databaseProvisionModule;
  console.log(`   Database ID: ${provision.databaseId}`);
  console.log(`   Status: ${provision.status}`);

  console.log('\n3. Done! Database provisioned.');
  console.log(`\nAPIs available (port ${port}):`);
  console.log(`   curl -H "Host: public-${dbName}.localhost" http://localhost:${port}/graphql`);
  console.log(`   curl -H "Host: admin-${dbName}.localhost" http://localhost:${port}/graphql`);
  console.log(`   curl -H "Host: auth-${dbName}.localhost" http://localhost:${port}/graphql`);
  console.log(`   curl -H "Host: app-public-${dbName}.localhost" http://localhost:${port}/graphql`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
