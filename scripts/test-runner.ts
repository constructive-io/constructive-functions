import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { KubernetesClient } from 'kubernetesjs';

// Since we are in scripts/test-runner.ts, the functions dir is ../functions
const FUNCTIONS_DIR = path.join(__dirname, '../functions');
const NAMESPACE = 'default';

let k8s: KubernetesClient;

// Helper to wait
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function runTestForFunction(fnName: string): Promise<boolean> {
    if (fnName.startsWith('_')) return true; // Skip tooling dirs like _runners, _runtimes

    // Skip files like .DS_Store if fs.readdir included them (though we check isDirectory later, extra safety)
    if (fnName.startsWith('.')) return true;

    const jobName = `test-${fnName}-${Math.floor(Date.now() / 1000)}`;
    console.log(`[Runner] Starting test for: ${fnName} (Job: ${jobName})`);

    const envVars = [
        { name: "IS_IN_POD", value: "true" },
        { name: "NODE_TLS_REJECT_UNAUTHORIZED", value: "0" },
        { name: "PGHOST", value: "postgres" },
        { name: "PGPASSWORD", value: "postgres123!" },
        { name: "PGUSER", value: "postgres" }
    ];

    const jobManifest = {
        apiVersion: 'batch/v1',
        kind: 'Job',
        metadata: {
            name: jobName,
            namespace: NAMESPACE,
            labels: { "job-name": jobName, "function": fnName }
        },
        spec: {
            backoffLimit: 0,
            template: {
                metadata: { labels: { "job-name": jobName } },
                spec: {
                    restartPolicy: 'Never',
                    serviceAccountName: 'default',
                    containers: [{
                        name: 'test-runner',
                        image: 'constructive/function-test-runner:v2',
                        imagePullPolicy: "IfNotPresent",
                        command: ["/bin/sh", "-c", `npx jest functions/${fnName}/__tests__/index.test.ts`],
                        env: envVars
                    }]
                }
            }
        }
    };

    let status = 'Failed';
    let logs = '';

    try {
        // Cleanup old job
        try {
            await k8s.deleteBatchV1NamespacedJob({
                path: { namespace: NAMESPACE, name: jobName },
                query: { propagationPolicy: 'Background' }
            });
        } catch (e) { }

        // Create Job
        await k8s.createBatchV1NamespacedJob({
            path: { namespace: NAMESPACE },
            body: jobManifest,
            query: {}
        });

        console.log(`[Runner] Waiting for job ${jobName} to complete...`);

        // Poll for completion
        let podName = '';
        let completed = false;

        // Wait up to 120s (60 * 2000ms)
        for (let i = 0; i < 60; i++) {
            try {
                // Check Job Status
                const job = await k8s.readBatchV1NamespacedJobStatus({
                    path: { namespace: NAMESPACE, name: jobName },
                    query: {}
                });

                if (job.status) {
                    if ((job.status.succeeded || 0) > 0) {
                        status = 'Succeeded';
                        completed = true;
                    } else if ((job.status.failed || 0) > 0) {
                        status = 'Failed';
                        completed = true;
                    }
                }

                // Find Pod Name
                if (!podName) {
                    const pods = await k8s.listCoreV1NamespacedPod({
                        path: { namespace: NAMESPACE },
                        query: { labelSelector: `job-name=${jobName}` }
                    });
                    if (pods.items && pods.items.length > 0 && pods.items[0].metadata && pods.items[0].metadata.name) {
                        podName = pods.items[0].metadata.name;
                    }
                }

                if (completed) break;

            } catch (e) {
                // Ignore transient errors
            }
            await sleep(2000);
        }

        if (!completed) {
            console.log(`[Runner] ${fnName}: TIMED OUT`);
        } else {
            console.log(`[Runner] ${fnName}: ${status}`);
        }

        // Fetch Logs
        if (podName) {
            console.log(`[Runner] Fetching logs for ${podName}...`);
            try {
                const res = await fetch(`http://127.0.0.1:8001/api/v1/namespaces/${NAMESPACE}/pods/${podName}/log`);
                logs = await res.text();
            } catch (e) {
                console.warn("Log fetch failed", e);
            }
            console.log("---------------------------------------------------");
            console.log(logs);
            console.log("---------------------------------------------------");
        }

        // Cleanup
        try {
            await k8s.deleteBatchV1NamespacedJob({
                path: { namespace: NAMESPACE, name: jobName },
                query: { propagationPolicy: 'Background' }
            });
        } catch (e) { }

        return status === 'Succeeded';

    } catch (e: any) {
        console.error(`[Runner] Error running ${fnName}:`, e.message);
        try {
            await k8s.deleteBatchV1NamespacedJob({
                path: { namespace: NAMESPACE, name: jobName },
                query: { propagationPolicy: 'Background' }
            });
        } catch (e2) { }
        return false;
    }
}

async function main() {
    // Start Proxy
    console.log("Starting kubectl proxy...");
    const proxy = spawn('kubectl', ['proxy', '--port=8001'], {
        stdio: 'ignore'
    });

    proxy.on('error', (err) => {
        console.error('Failed to start kubectl proxy:', err);
    });

    proxy.on('exit', (code, signal) => {
        if (code !== 0 && code !== null) {
            console.error(`kubectl proxy exited with code ${code} and signal ${signal}`);
        }
    });

    // Wait for proxy
    await sleep(2000);

    // Init Client
    k8s = new KubernetesClient({
        restEndpoint: 'http://127.0.0.1:8001'
    });

    try {
        const functionsToTest = [
            'rust-hello-world',
            'stripe-function',
            'crypto-login',
            'llm-external',
            'llm-internal-calvin',
            'github-repo-creator',
            'opencode-headless',
            'pytorch-gpu'
        ];
        const dirs = fs.readdirSync(FUNCTIONS_DIR);
        let failure = false;

        for (const dir of dirs) {
            // Skip non-directories or ignored dirs
            if (dir.startsWith('_') || dir.startsWith('.')) continue;

            const fullPath = path.join(FUNCTIONS_DIR, dir);
            try {
                if (fs.statSync(fullPath).isDirectory()) {
                    const testFile = path.join(fullPath, '__tests__/index.test.ts');
                    if (fs.existsSync(testFile)) {
                        if (functionsToTest.includes(dir)) {
                            const success = await runTestForFunction(dir);
                            if (!success) failure = true;
                        }
                    }
                }
            } catch (e) {
                // ignore
            }
        }

        // Kill proxy
        proxy.kill();
        process.exit(failure ? 1 : 0);

    } catch (e) {
        console.error(e);
        proxy.kill();
        process.exit(1);
    }
}

main();
