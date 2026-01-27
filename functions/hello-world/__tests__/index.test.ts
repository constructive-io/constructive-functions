
import { getConnections, PgTestClient } from 'pgsql-test';
import { KubernetesClient } from 'kubernetesjs';
import * as fs from 'fs';

describe('Hello World Function (Integration)', () => {
    let db: PgTestClient;
    let pg: PgTestClient;
    let teardown: () => Promise<void>;
    let k8s: KubernetesClient;
    let k8sOpts: any;
    let sharedPodName: string = '';

    const NAMESPACE = 'default';

    let proxyProcess: any;

    beforeAll(async () => {
        // Start kubectl proxy in background to handle auth
        const { spawn } = require('child_process');
        proxyProcess = spawn('kubectl', ['proxy', '--port=8001']);

        proxyProcess.stderr.on('data', (d: any) => console.error(`[Proxy Err]: ${d}`));
        proxyProcess.on('error', (e: any) => console.error(`[Proxy Failed]:`, e));

        // Wait for proxy to be ready
        await new Promise(resolve => setTimeout(resolve, 5000));

        // database connection in the pod
        ({ pg, db, teardown } = await getConnections({
            pg: {
                user: 'postgres',
                password: process.env.PGPASSWORD,
                host: process.env.PGHOST,
                port: Number(process.env.PGPORT || 5432),
                database: String(process.env.PGDATABASE || `hello_world_test_${Math.floor(Math.random() * 100000)}`)
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
    }, 30000);

    afterAll(async () => {
        await teardown();
        if (proxyProcess) proxyProcess.kill();
    });

    it('should orchestrate the hello-world job and verify completion', async () => {
        const jobName = `hello-world-exec-${Math.floor(Date.now() / 1000)}`;
        console.log(`[Test] Orchestrating Job: ${jobName}`);

        // 1. Clean up potential leftovers
        try {
            await k8s.deleteBatchV1NamespacedJob({
                path: { namespace: NAMESPACE, name: jobName },
                query: { propagationPolicy: 'Background' }
            });
        } catch (e) { }

        // 2. Create the Hello World Job
        const jobManifest = {
            apiVersion: 'batch/v1',
            kind: 'Job',
            metadata: {
                name: jobName,
                namespace: NAMESPACE,
                labels: { "job-name": jobName, "app": "hello-world" }
            },
            spec: {
                backoffLimit: 0,
                template: {
                    metadata: { labels: { "job-name": jobName } },
                    spec: {
                        restartPolicy: 'Never',
                        containers: [{
                            name: 'hello-world',
                            image: 'constructive/function-test-runner:v8',
                            imagePullPolicy: "IfNotPresent",
                            command: ["npx", "ts-node", "functions/_runtimes/node/runner.js", "functions/hello-world/src/index.ts"],
                            env: [
                                { name: "PGHOST", value: "postgres" },
                                { name: "PGPASSWORD", value: process.env.PGPASSWORD }
                            ]
                        }]
                    }
                }
            }
        };

        // Apply via k8s client
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
        for (let i = 0; i < 30; i++) {
            try {
                if (!podName) {
                    const pods = await k8s.listCoreV1NamespacedPod({
                        path: { namespace: NAMESPACE },
                        query: { labelSelector: `job-name=${jobName}` }
                    });
                    if (pods.items && pods.items.length > 0) {
                        podName = pods.items[0].metadata.name;
                        sharedPodName = podName;
                        console.log(`[Test] Found Pod: ${podName}`);
                    }
                }

                if (podName) {
                    try {
                        // Use raw fetch via proxy because kubernetesjs might fail to parse text logs
                        const res = await fetch(`http://127.0.0.1:8001/api/v1/namespaces/${NAMESPACE}/pods/${podName}/log?tailLines=50`);
                        const logs = await res.text();


                        if (logs.includes('listening on port')) {
                            console.log(`[Test] Service is listening! Success.`);
                            console.log('\n[Evidence] Function Pod Logs:\n' + logs + '\n');
                            logsResponse = logs;

                            // 4. Invoke via Proxy to Verify User Context
                            console.log(`[Test] Invoking hello-world function via proxy...`);
                            const proxyUrl = `http://127.0.0.1:8001/api/v1/namespaces/${NAMESPACE}/pods/${podName}:8080/proxy/`;

                            const invokeRes = await fetch(proxyUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-User-Id': 'user_123'
                                },
                                body: JSON.stringify({ name: 'Test User' })
                            });

                            if (!invokeRes.ok) {
                                throw new Error(`Invocation failed: ${invokeRes.status} ${invokeRes.statusText}`);
                            }

                            const invokeJson = await invokeRes.json();
                            console.log('[Test] Invocation Response:', JSON.stringify(invokeJson));

                            // Verify User Context Injection
                            if (invokeJson.user && invokeJson.user.id === 'user_123') {
                                console.log('[Test] Verified: User Context injected correctly (X-User-Id priority).');
                            } else {
                                throw new Error(`User Context verification failed. Received: ${JSON.stringify(invokeJson.user)}`);
                            }

                            // Fetch logs again to see execution logs
                            console.log('[Test] Fetching post-invocation logs...');
                            await new Promise(r => setTimeout(r, 2000));
                            const postRes = await fetch(`http://127.0.0.1:8001/api/v1/namespaces/${NAMESPACE}/pods/${podName}/log?tailLines=50`);
                            const postLogs = await postRes.text();
                            console.log('\n[Evidence] Post-Invocation Pod Logs:\n' + postLogs + '\n');

                            success = true;
                            break;
                        }
                        if (logs) logsResponse = logs;
                    } catch (logErr) {
                        console.warn('Log fetch error:', logErr);
                    }
                }
            } catch (e) {
                // Ignore transient errors
            }
            await new Promise(r => setTimeout(r, 2000));
        }

        if (!success) {
            throw new Error(`Service failed to start or log listening. Logs: ${logsResponse}`);
        }

        expect(success).toBe(true);
        expect(logsResponse).toContain('listening on port');
    }, 300000);

    it('should verify database connectivity via pgsql-test', async () => {
        const result = await pg.query('SELECT 1 as num');
        expect(result.rows[0].num).toBe(1);
    });
});
