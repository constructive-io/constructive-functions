import { getConnections, PgTestClient } from 'pgsql-test';
import { KubernetesClient } from 'kubernetesjs';
// @ts-ignore
import app from '../src/index';
import * as fs from 'fs';

describe('Runtime Script Function (Integration)', () => {
    let db: PgTestClient;
    let pg: PgTestClient;
    let teardown: () => Promise<void>;
    let k8s: KubernetesClient;
    let k8sOpts: any;
    const NAMESPACE = 'default';
    let proxyProcess: any;

    beforeAll(async () => {
        // Start kubectl proxy in background to handle auth
        const { spawn } = require('child_process');
        proxyProcess = spawn('kubectl', ['proxy', '--port=8001']);

        // Wait for proxy to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));

        ({ pg, db, teardown } = await getConnections({
            pg: {
                user: 'postgres',
                password: process.env.PGPASSWORD,
                host: process.env.PGHOST,
                port: Number(process.env.PGPORT || 5432),
                database: String(process.env.PGDATABASE || `runtime_script_test_${Math.floor(Math.random() * 100000)}`)
            },
            db: {
                connections: { app: { user: 'postgres', password: process.env.PGPASSWORD } }
            }
        }));

        // Connect to local proxy
        k8s = new KubernetesClient({
            restEndpoint: 'http://127.0.0.1:8001'
        } as any);
        k8sOpts = {};
    });

    afterAll(async () => {
        await teardown();
        if (proxyProcess) proxyProcess.kill();
    });

    it('should orchestrate runtime-script service', async () => {
        const jobName = `runtime-script-exec-${Math.floor(Date.now() / 1000)}`;

        // 1. Clean up potential leftovers
        try {
            await k8s.deleteBatchV1NamespacedJob({
                path: { namespace: NAMESPACE, name: jobName },
                query: { propagationPolicy: 'Background' }
            });
        } catch (e) { }

        // 2. Create Job
        const jobManifest = {
            apiVersion: 'batch/v1',
            kind: 'Job',
            metadata: { name: jobName, namespace: NAMESPACE, labels: { "job-name": jobName } },
            spec: {
                backoffLimit: 0,
                template: {
                    metadata: { labels: { "job-name": jobName } },
                    spec: {
                        restartPolicy: 'Never',
                        containers: [{
                            name: 'runtime-script',
                            image: 'constructive/function-test-runner:v9',
                            imagePullPolicy: "IfNotPresent",
                            command: ["npx", "ts-node", "functions/_runtimes/node/runner.js", "functions/runtime-script/src/index.ts"],
                            env: [
                                { name: "PGHOST", value: "postgres" },
                                { name: "PGPASSWORD", value: process.env.PGPASSWORD },
                                { name: "PORT", value: "8080" }
                            ]
                        }]
                    }
                }
            }
        };

        await k8s.createBatchV1NamespacedJob({
            path: { namespace: NAMESPACE },
            body: jobManifest,
            query: {}
        });

        // 3. Wait for Pod Running & Logs
        console.log(`[Test] Waiting for pod for job ${jobName} to be Running...`);
        let logsResponse = '';
        let podName = '';
        let success = false;

        // Poll for Pod and check status/logs
        for (let i = 0; i < 45; i++) {
            try {
                if (!podName) {
                    const pods = await k8s.listCoreV1NamespacedPod({
                        path: { namespace: NAMESPACE },
                        query: { labelSelector: `job-name=${jobName}` }
                    });
                    if (pods.items && pods.items.length > 0) {
                        podName = pods.items[0].metadata.name;
                        console.log(`[Test] Found Pod: ${podName}`);
                    }
                }

                if (podName) {
                    try {
                        const res = await fetch(`http://127.0.0.1:8001/api/v1/namespaces/${NAMESPACE}/pods/${podName}/log?tailLines=50`);
                        const logs = await res.text();

                        if (logs.includes('listening on port')) {
                            console.log(`[Test] Service is listening! Success.`);
                            logsResponse = logs;
                            success = true;
                            break;
                        }
                        if (logs) logsResponse = logs;
                    } catch (e) { }
                }
            } catch (e) { }
            await new Promise(r => setTimeout(r, 1000));
        }

        if (!success) {
            throw new Error(`Service failed to start. Logs: ${logsResponse}`);
        }

        // 4. Invoke via Proxy to Trigger GQL Logic
        console.log(`[Test] Invoking runtime-script function via proxy...`);
        const proxyUrl = `http://127.0.0.1:8001/api/v1/namespaces/${NAMESPACE}/pods/${podName}:8080/proxy/`;

        const invokeRes = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': 'user_123'
            },
            body: JSON.stringify({ query: 'SELECT 1 as num' })
        });

        if (!invokeRes.ok) {
            const errText = await invokeRes.text();
            console.error(`[Test] Invocation Error Body: ${errText}`);
            throw new Error(`Invocation failed: ${invokeRes.status} ${invokeRes.statusText} - ${errText}`);
        }

        const invokeJson = await invokeRes.json();
        console.log('[Test] Invocation Response:', JSON.stringify(invokeJson));

        // Fetch logs again to capture execution logs
        console.log('[Test] Fetching post-invocation logs...');
        await new Promise(r => setTimeout(r, 2000));
        const postRes = await fetch(`http://127.0.0.1:8001/api/v1/namespaces/${NAMESPACE}/pods/${podName}/log?tailLines=50`);
        const postLogs = await postRes.text();
        console.log('\n[Evidence] Post-Invocation Pod Logs:\n' + postLogs + '\n');

        expect(success).toBe(true);
        expect(logsResponse).toContain('listening on port');

        // Cleanup
        try {
            await k8s.deleteBatchV1NamespacedJob({
                path: { namespace: NAMESPACE, name: jobName },
                query: { propagationPolicy: 'Background' }
            });
        } catch (e) { }
    }, 120000);
});
