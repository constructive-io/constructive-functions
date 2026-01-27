
import { getConnections, PgTestClient } from 'pgsql-test';
import { KubernetesClient } from 'kubernetesjs';
import * as fs from 'fs';

describe('Create DB Function (Integration)', () => {
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

        // database connection in the pod
        ({ pg, db, teardown } = await getConnections());

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

    it('should orchestrate the create-db job and verify database creation', async () => {
        const jobName = `create-db-exec-${Math.floor(Date.now() / 1000)}`;
        console.log(`[Test] Orchestrating Job: ${jobName}`);

        // 1. Clean up potential leftovers
        try {
            await k8s.deleteBatchV1NamespacedJob({
                path: { namespace: NAMESPACE, name: jobName },
                query: { propagationPolicy: 'Background' }
            });
        } catch (e) { }

        // 2. Create the Job
        const jobManifest = {
            apiVersion: 'batch/v1',
            kind: 'Job',
            metadata: {
                name: jobName,
                namespace: NAMESPACE,
                labels: { "job-name": jobName, "app": "create-db" }
            },
            spec: {
                backoffLimit: 0,
                template: {
                    metadata: { labels: { "job-name": jobName } },
                    spec: {
                        restartPolicy: 'Never',
                        containers: [{
                            name: 'create-db',
                            image: 'constructive/function-test-runner:v9',
                            imagePullPolicy: "IfNotPresent",
                            command: ["npx", "ts-node", "functions/_runtimes/node/runner.js", "functions/create-db/src/index.ts"],
                            env: [
                                { name: "PGHOST", value: "postgres" },
                                { name: "PGUSER", value: "postgres" },
                                { name: "PGDATABASE", value: "postgres" },
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


                            // Now verify the function actually works by invoking it via the proxy
                            console.log(`[Test] Invoking create-db function via proxy...`);
                            // K8s API Proxy URL to reach the pod directly
                            const proxyUrl = `http://127.0.0.1:8001/api/v1/namespaces/${NAMESPACE}/pods/${podName}:8080/proxy/`;

                            const dbName = `test_db_${Math.floor(Date.now() / 1000)}`;

                            const invokeRes = await fetch(proxyUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    "database": dbName
                                })
                            });

                            if (!invokeRes.ok) {
                                throw new Error(`Invocation failed: ${invokeRes.status} ${invokeRes.statusText}`);
                            }

                            const invokeJson = await invokeRes.json();
                            console.log('[Test] Invocation Response:', JSON.stringify(invokeJson));

                            if (invokeJson.error) {
                                throw new Error(`Create DB internal error: ${invokeJson.error}`);
                            }

                            if (!invokeJson.created && !invokeJson.exists) {
                                throw new Error(`Unexpected response: ${JSON.stringify(invokeJson)}`);
                            }
                            console.log(`[Test] Function reported success for ${dbName}`);

                            // Verification: Check if the database exists via global PG client
                            const checkResult = await pg.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
                            if (checkResult.rowCount === 0) {
                                throw new Error(`Database ${dbName} was NOT found in pg_database!`);
                            }
                            console.log('[Test] Verified: Database exists in Postgres catalog.');

                            // Optional: Cleanup created DB
                            // We shouldn't leave test DBs, but running DROP DATABASE might fail if connections indicate usage.
                            // However, we can try.
                            try {
                                // await pg.query(`DROP DATABASE "${dbName}"`);
                                // console.log('[Test] Cleaned up test database.');
                            } catch (e) {
                                console.warn('[Test] Cleanup failed (non-fatal):', e);
                            }

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

        // Cleanup
        try {
            await k8s.deleteBatchV1NamespacedJob({
                path: { namespace: NAMESPACE, name: jobName },
                query: { propagationPolicy: 'Background' }
            });
        } catch (e) { }
    }, 120000);

    it('should verify database connectivity via pgsql-test', async () => {
        const result = await pg.query('SELECT 1 as num');
        expect(result.rows[0].num).toBe(1);
    });
});
