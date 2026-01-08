import app from '@constructive-io/knative-job-fn';
import { Octokit } from 'octokit';
import { execSync } from 'child_process';

app.post('/', async (req: any, res: any) => {
    console.log('[github-repo-creator] Request received');
    const { repoName, githubToken } = req.body;

    if (!repoName || !githubToken) return res.status(400).json({ error: "Missing repoName or githubToken" });

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
        const dbName = req.body.dbName || process.env.PGDATABASE || 'postgres';
        execSync(`pgpm dump --database ${dbName} --file ${dumpFile}`);

        // 3. (Optional) Initialize and Push - leaving as Todo or just return the dump file info

        res.json({ success: true, message: `Repo ${repoName} created`, cloneUrl, dumpFile });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

export default app;

if (require.main === module) {
    const port = Number(process.env.PORT ?? 8080);
    (app as any).listen(port, () => {
        console.log(`[github-repo-creator] listening on port ${port}`);
    });
}
