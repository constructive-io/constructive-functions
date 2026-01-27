
import { createClient } from '@constructive-db/constructive-sdk';

export default async (params: any, context: any) => {
  const { headers } = context;
  console.log('Incoming Headers:', JSON.stringify(headers));

  // Clean headers to avoid Host mismatch (from proxy) poisoning the internal request
  // Also stripping standard headers to prevent conflicts (400 Bad Request) with SDK defaults
  const safeHeaders = { ...headers };
  [
    'host', 'content-length', 'connection',
    'content-type', 'accept', 'user-agent', 'accept-encoding'
  ].forEach(k => delete safeHeaders[k]);

  // Initialize SDK with endpoint from env (or default) and headers for auth propagation
  const sdk = createClient({
    endpoint: process.env.GRAPHQL_ENDPOINT || 'http://constructive-server:3000/graphql',
    headers: safeHeaders || {}
  });

  // Proof of GQL connection
  // Using the exposed 'services_public.apis' table via SDK
  const result = await sdk.api.findMany({
    select: {
      id: true,
      name: true
    },
    first: 5
  }).execute();

  if (result.ok) {
    const apis = result.data;
    console.error('[hello-world] GQL Response:', JSON.stringify(apis, null, 2));
    return {
      message: 'Hello World',
      received: params,
      user: context.user,
      apis
    };
  } else {
    console.error('GQL Request failed:', result.errors);
    throw new Error(`GQL Request Failed: ${JSON.stringify(result.errors)}`);
  }
};


// Server boilerplate abstracted to runner.js
