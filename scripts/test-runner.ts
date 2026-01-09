
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { KubernetesClient } from 'kubernetesjs';

// Since we are in scripts/test-runner.ts, the functions dir is ../functions

// Since we are in scripts/test-runner.ts, the functions dir is ../functions
const FUNCTIONS_DIR = path.join(__dirname, '../functions');
const NAMESPACE = 'default';

// Load .env from root
require('dotenv').config({ path: path.join(__dirname, '../.env') });

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
        { name: "PGPASSWORD", value: process.env.PGPASSWORD || "password" },
        { name: "PGUSER", value: "postgres" },
        // Inject Standard Env Vars
        { name: "STRIPE_PUBLISHABLE_KEY", value: process.env.STRIPE_PUBLISHABLE_KEY },
        { name: "STRIPE_SECRET_KEY", value: process.env.STRIPE_SECRET_KEY },
        { name: "STRIPE_RESTRICTED_KEY", value: process.env.STRIPE_RESTRICTED_KEY },
        { name: "TWILIO_ACCOUNT_SID", value: process.env.TWILIO_ACCOUNT_SID },
        { name: "TWILIO_AUTH_TOKEN", value: process.env.TWILIO_AUTH_TOKEN },
        { name: "TWILIO_FROM_NUMBER", value: process.env.TWILIO_FROM_NUMBER },
        { name: "CALVIN_API_KEY", value: process.env.CALVIN_API_KEY },
        { name: "OPENAI_API_KEY", value: process.env.OPENAI_API_KEY }
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

        // Wait up to 300s (150 * 2000ms)
        for (let i = 0; i < 150; i++) {
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
                // replace with the kjs version
                const res = await fetch(`http://127.0.0.1:8001/api/v1/namespaces/${NAMESPACE}/pods/${podName}/log`);
                logs = await res.text();
            } catch (e) {
                console.warn("Log fetch failed", e);
            }
            console.log("\n=================== EVIDENCE LOGS (STDOUT) ===================");
            console.log(logs);
            console.log("==============================================================\n");
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
    // Parse arguments
    const args = process.argv.slice(2);
    let targetFunction = '';

    // Simple arg parsing for --function
    const fnIndex = args.indexOf('--function');
    if (fnIndex !== -1 && args[fnIndex + 1]) {
        targetFunction = args[fnIndex + 1];
    }

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
        let failure = false;

        if (targetFunction) {
            // SINGLE MODE
            console.log(`[Runner] Running in SINGLE mode for: ${targetFunction}`);
            const fullPath = path.join(FUNCTIONS_DIR, targetFunction);
            if (!fs.existsSync(fullPath)) {
                console.error(`function ${targetFunction} not found`);
                failure = true;
            } else {
                const success = await runTestForFunction(targetFunction);
                if (!success) failure = true;
            }
        } else {
            // ALL MODE
            console.log(`[Runner] Running in ALL mode`);
            const dirs = fs.readdirSync(FUNCTIONS_DIR);

            for (const dir of dirs) {
                // Skip non-directories or ignored dirs
                if (dir.startsWith('_') || dir.startsWith('.')) continue;

                const fullPath = path.join(FUNCTIONS_DIR, dir);
                try {
                    if (fs.statSync(fullPath).isDirectory()) {
                        const testFile = path.join(fullPath, '__tests__/index.test.ts');
                        if (fs.existsSync(testFile)) {
                            const success = await runTestForFunction(dir);
                            if (!success) failure = true;
                        }
                    }
                } catch (e) {
                    // ignore
                }
            }
        }

        // Kill proxy
        proxy.kill();
        process.exit(failure ? 1 : 0);

    } catch (e: any) {
        console.error(e);
        proxy.kill();
        process.exit(1);
    }
}

main();
