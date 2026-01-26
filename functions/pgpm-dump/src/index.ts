
import { createClient } from '@constructive-db/constructive-sdk'; // sdk
import fetch from 'cross-fetch';
import { dump } from 'pgpm';

export default async (params: any, context: any) => {
  console.log('Pgpm Dump Request received', params);
  const { headers } = context;

  // Clean headers to avoid conflicts with SDK defaults
  const safeHeaders = { ...headers };
  ['host', 'content-length', 'connection', 'content-type', 'accept', 'user-agent', 'accept-encoding'].forEach(k => delete safeHeaders[k]);

  const sdk = createClient({
    endpoint: process.env.GRAPHQL_ENDPOINT || 'http://constructive-server:3000/graphql',
    headers: safeHeaders || {}
  });

  // Execute GQL Query as proof of connectivity (without try-catch)
  const result = await sdk.api.findMany({ select: { id: true, name: true }, first: 1 }).execute();
  console.log('GQL Query Result:', JSON.stringify(result));
  if (!result.ok) {
    console.error('GQL Request failed:', result.errors);
  }

  // Map params to argv-like object expected by pgpm
  // dump command expects: argv, prompter, options
  // We mock prompter since we expect fully specified args to avoid prompts

  const argv: any = {
    _: [], // Positional args
    ...params // Spread incoming params (database, out, cwd, database-id, etc.)
  };

  // Ensure strict mapping if needed, but params usually match CLI flags
  if (params.database_id) argv['database-id'] = params.database_id;

  // Mock prompter/CLI objects
  const prompter: any = {
    prompt: () => { throw new Error('Interactive prompt not supported in cloud function'); }
  };
  const options: any = {};

  try {
    console.log(`Executing pgpm dump programmatically with args:`, JSON.stringify(argv));

    // Call the library function
    // Note: dump() prints to stdout/stderr directly via console or its own logger.
    // We might want to capture that if we could, but 'pgpm' uses @pgpmjs/logger.
    // valid return from dump is argv

    await dump(argv, prompter, options);

    return {
      message: 'PGPM Dump executed successfully',
      args: argv
    };
  } catch (e: any) {
    console.error('PGPM execution failed', e);
    return {
      error: e.message,
      stack: e.stack
    };
  }
};
