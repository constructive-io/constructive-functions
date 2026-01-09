
import { GraphQLClient } from 'graphql-request';
import { Octokit } from 'octokit';
import { execSync } from 'child_process';
import gql from 'graphql-tag';
import fetch from 'cross-fetch';

// Proof of GQL connection
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
    const { client } = context;
    console.log('[github-repo-creator] Request received');

    let users = null;
    try {
        const data = await client.request(GetUsers);
        users = data?.users;
    } catch (e: any) {
        console.warn('GQL Request failed:', e.message);
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
