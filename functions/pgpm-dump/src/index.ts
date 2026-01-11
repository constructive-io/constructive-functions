
import { GraphQLClient } from 'graphql-request';
import gql from 'graphql-tag';
import fetch from 'cross-fetch';
import { dump } from 'pgpm';

// example GQL
const GetUsers = gql`
  query GetUsers {
    users {
      nodes {
        id
        username
      }
    }
  }
`;

export default async (params: any, context: any) => {
  console.log('Pgpm Dump Request received', params);
  const { client } = context;

  // Execute GQL Query as proof of connectivity
  try {
    const data = await client.request(GetUsers);
    console.log('GQL Query Result:', JSON.stringify(data));
  } catch (e: any) {
    console.warn('GQL Request failed (expected if server not reachable in test):', e.message);
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
