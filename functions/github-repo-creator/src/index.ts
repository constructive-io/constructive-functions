
import { createClient } from '@constructive-db/constructive-sdk';
import { Octokit } from 'octokit';
import { execSync } from 'child_process';
import fetch from 'cross-fetch';

export default async (params: any, context: any) => {
  const { headers } = context;
  console.log('[github-repo-creator] Request received');

  // Clean headers to avoid conflicts with SDK defaults
  const safeHeaders = { ...headers };
  ['host', 'content-length', 'connection', 'content-type', 'accept', 'user-agent', 'accept-encoding'].forEach(k => delete safeHeaders[k]);

  const sdk = createClient({
    endpoint: process.env.GRAPHQL_ENDPOINT || 'http://constructive-server:3000/graphql',
    headers: safeHeaders || {}
  });

  // SDK call without try-catch
  // Test with sdk.api to verify connectivity
  const result = await sdk.api.findMany({
    select: { id: true, name: true },
    first: 5
  }).execute();

  const users = result.ok ? result.data : null;
  if (!result.ok) {
    console.error('GQL Request failed:', result.errors);
  }

  const { repoName, githubToken } = params;

  if (!repoName || !githubToken) {
    return { error: "Missing repoName or githubToken" };
  }

  try {
    const octokit = new Octokit({ auth: githubToken });

    // 1. Create Repo
    console.log(`Creating repo: ${repoName}`);
    const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({ name: repoName, private: true });
    const cloneUrl = repo.clone_url;

    // 2. Dump DB (pgpm)
    const dumpFile = `/tmp/${repoName}.sql`;
    console.log(`Dumping DB to ${dumpFile}...`);
    // Assuming PGDATABASE or dbName is provided. For now standardizing on a passed arg or default
    const dbName = params.dbName || process.env.PGDATABASE || 'postgres';
    execSync(`pgpm dump --database ${dbName} --file ${dumpFile}`);

    // 3. (Optional) Initialize and Push - leaving as Todo or just return the dump file info

    return { success: true, message: `Repo ${repoName} created`, cloneUrl, dumpFile };
  } catch (e: any) {
    console.error(e);
    return { error: e.message };
  }
};


// Server boilerplate abstracted to runner.js
