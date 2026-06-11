import fs from 'fs';
import * as http from 'node:http';
import path from 'path';

import { buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql';

const SCHEMAS_DIR = path.resolve(__dirname, '../schemas');
const INDEX_PATH = path.resolve(__dirname, '../src/index.ts');

const GRAPHQL_PORT = process.env.GRAPHQL_PORT || '6464';

// API-to-subdomain mapping matching constructive-db's provision_base_modules
const API_ENDPOINTS: Record<string, string> = {
  api: 'api',
  compute: 'compute',
  objects: 'objects',
};

async function fetchSchemaSDL(subdomain: string, port: string): Promise<string> {
  const introspectionQuery = getIntrospectionQuery({ descriptions: true });
  const postData = JSON.stringify({
    query: introspectionQuery,
    variables: null,
    operationName: 'IntrospectionQuery',
  });

  const responseData: string = await new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: Number(port),
        path: '/graphql',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': String(Buffer.byteLength(postData)),
          Host: `${subdomain}.localhost:${port}`,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode} – ${data}`));
            return;
          }
          resolve(data);
        });
      },
    );
    req.on('error', (err) => reject(err));
    req.write(postData);
    req.end();
  });

  let json: { data?: unknown; errors?: unknown[] };
  try {
    json = JSON.parse(responseData);
  } catch {
    throw new Error(`Failed to parse response: ${responseData.slice(0, 200)}`);
  }

  if (json.errors) {
    throw new Error(
      `Introspection returned errors: ${JSON.stringify(json.errors).slice(0, 500)}`,
    );
  }
  if (!json.data) {
    throw new Error('No data in introspection response');
  }

  const schema = buildClientSchema(json.data as Parameters<typeof buildClientSchema>[0]);
  return printSchema(schema);
}

async function main() {
  const apiNames = Object.keys(API_ENDPOINTS);
  console.log('Generating schemas for all APIs...');
  console.log(`APIs: ${apiNames.join(', ')}`);
  console.log(`Port: ${GRAPHQL_PORT}`);

  fs.mkdirSync(SCHEMAS_DIR, { recursive: true });

  let hasError = false;

  for (const [apiName, subdomain] of Object.entries(API_ENDPOINTS)) {
    console.log(`\n[${apiName}] Subdomain: ${subdomain}.localhost:${GRAPHQL_PORT}`);

    try {
      console.log(`[${apiName}] Fetching introspection...`);
      const sdl = await fetchSchemaSDL(subdomain, GRAPHQL_PORT);

      if (!sdl.trim()) {
        console.error(`[${apiName}] ERROR: Empty schema returned`);
        hasError = true;
        continue;
      }

      const outPath = path.join(SCHEMAS_DIR, `${apiName}.graphql`);
      fs.writeFileSync(outPath, sdl, 'utf-8');
      console.log(`[${apiName}] Written: ${outPath} (${sdl.length} bytes)`);
    } catch (err) {
      console.error(
        `[${apiName}] ERROR: ${err instanceof Error ? err.message : String(err)}`,
      );
      hasError = true;
    }
  }

  if (hasError) {
    console.error('\nSchema generation failed for one or more APIs');
    process.exit(1);
  }

  // Auto-generate src/index.ts from API names
  const indexContent = [
    `export const API_NAMES = ${JSON.stringify(apiNames)} as const;`,
    '',
    'export type ApiName = (typeof API_NAMES)[number];',
    '',
  ].join('\n');
  fs.mkdirSync(path.dirname(INDEX_PATH), { recursive: true });
  fs.writeFileSync(INDEX_PATH, indexContent, 'utf-8');
  console.log(`\nWrote ${INDEX_PATH} with API_NAMES: [${apiNames.join(', ')}]`);

  console.log('\nAll schemas generated successfully!');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
