import { getConnections, PgTestClient } from 'pgsql-test';
import { KubernetesClient } from 'kubernetesjs';
import * as fs from 'fs';
import fetch from 'cross-fetch';
import { createJobTeardown } from '../../test-utils';

describe('LLM Internal Calvin Function (Integration)', () => {
    let db: PgTestClient;
    let pg: PgTestClient;
    let teardown: () => Promise<void>;
    let k8s: KubernetesClient;
    let proxyProcess: any;

    const NAMESPACE = 'default';

    beforeAll(async () => {
        // Start kubectl proxy in background to handle auth
        const { spawn } = require('child_process');
        proxyProcess = spawn('kubectl', ['proxy', '--port=8001']);

        // Wait for proxy to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Connect to local proxy
        k8s = new KubernetesClient({
            restEndpoint: 'http://127.0.0.1:8001'
        } as any);

        // Standard pgsql-test connection
        ({ pg, db, teardown } = await getConnections());
    });

    afterAll(async () => {
        if (teardown) await teardown();
        if (proxyProcess) proxyProcess.kill();
    });

    beforeEach(async () => {
        if (db) await db.beforeEach();
    });

    afterEach(async () => {
        if (db) await db.afterEach();
    });

    it('should orchestrate the llm-internal-calvin job', async () => {
        const jobName = `llm-calvin-exec-${Math.floor(Date.now() / 1000)}`;
        // 5. Fetch and Print Logs (Evidence)
        try {
            const podName = (await k8s.listCoreV1NamespacedPod({
                path: { namespace: NAMESPACE },
                query: { labelSelector: `job-name=${jobName}` }
            })).items[0].metadata.name;

            const res = await fetch(`http://127.0.0.1:8001/api/v1/namespaces/${NAMESPACE}/pods/${podName}/log`);
            const logs = await res.text();
            console.log('\n[Evidence] Function Pod Logs:\n' + logs + '\n');
        } catch (e) {
            console.warn("Failed to fetch logs for evidence", e);
        }

        // Cleanup
        try {
            await k8s.deleteBatchV1NamespacedJob({
                path: { namespace: NAMESPACE, name: jobName },
                query: { propagationPolicy: 'Background' }
            });
        } catch (e) { }

        // We can use createJobTeardown from utils
        const jobTeardown = createJobTeardown(k8s, NAMESPACE, jobName);

        const jobManifest = {
            apiVersion: 'batch/v1',
            kind: 'Job',
            metadata: { name: jobName, namespace: NAMESPACE, labels: { "job-name": jobName, "app": "llm-internal-calvin" } },
            spec: {
                backoffLimit: 0,
                template: {
                    metadata: { labels: { "job-name": jobName } },
                    spec: {
                        restartPolicy: 'Never',
                        containers: [{
                            name: 'llm-internal-calvin',
                            image: 'constructive/function-test-runner:v2',
                            imagePullPolicy: "IfNotPresent",
                            command: ["npx", "ts-node", "functions/_runtimes/node/runner.js", "functions/llm-internal-calvin/src/index.ts"],
                            env: [
                                { name: "CALVIN_API_KEY", value: process.env.CALVIN_API_KEY },
                                { name: "PORT", value: "8080" }
                            ]
                        }]
                    }
                }
            }
        };

        await k8s.createBatchV1NamespacedJob({ path: { namespace: NAMESPACE }, body: jobManifest, query: {} });

        let success = false;
        let logsResponse = '';
        let podName = '';
        let triggers = 0;
        let apiResult: any = null;

        for (let i = 0; i < 60; i++) {
            try {
                if (!podName) {
                    const pods = await k8s.listCoreV1NamespacedPod({ path: { namespace: NAMESPACE }, query: { labelSelector: `job-name=${jobName}` } });
                    if (pods.items && pods.items.length > 0) podName = pods.items[0].metadata.name;
                }
                if (podName) {
                    // Check logs for startup
                    let logs = '';
                    try {
                        const res = await fetch(`http://127.0.0.1:8001/api/v1/namespaces/${NAMESPACE}/pods/${podName}/log?tailLines=50`);
                        logs = await res.text();
                    } catch (e) { }
                    logsResponse = logs;


                    if (logs.includes('listening on port')) {
                        // Once listening, trigger the function via Proxy
                        if (!apiResult && triggers < 10) { // Retry multiple times for startup race conditions
                            try {
                                console.log(`[Test] Triggering Cloud Function (Attempt ${triggers + 1})...`);
                                const proxyRes = await fetch(`http://127.0.0.1:8001/api/v1/namespaces/${NAMESPACE}/pods/${podName}:8080/proxy/`, {
                                    method: 'POST',
                                    body: JSON.stringify({ prompt: "hello world" }),
                                    headers: { 'Content-Type': 'application/json' }
                                });
                                const text = await proxyRes.text();
                                try {
                                    const json = JSON.parse(text);
                                    // Check if it's the 503 error from K8s proxy or our actual result
                                    if (json.reason === 'ServiceUnavailable' || json.code === 503) {
                                        console.log('[Test] Service Unavailable, retrying...');
                                    } else {
                                        apiResult = json;
                                        console.log('[Test] Cloud Function Result:', JSON.stringify(apiResult, null, 2));
                                    }
                                } catch (e) {
                                    console.log('[Test] Cloud Function returned non-JSON:', text);
                                }
                                triggers++;
                            } catch (e) {
                                console.log('[Test] Trigger failed:', e);
                            }
                        }

                        // Success if we got a real result or at least logged the attempt
                        if (apiResult && (apiResult.result || apiResult.error)) {
                            success = true;
                            break;
                        }
                    }
                }
            } catch (e) { }
            await new Promise(r => setTimeout(r, 2000));
        }

        if (!success) throw new Error(`LLM Calvin Service Failed. Logs: ${logsResponse}`);

        expect(success).toBe(true);

        if (apiResult?.error) {
            console.error('API returned error:', apiResult.error);
            // Fail if there is an explicit error from the function
            throw new Error(`API Error: ${apiResult.error}`);
        }

        expect(apiResult).toBeDefined();
        expect(apiResult.result).toBeDefined();
        expect(typeof apiResult.result).toBe('string');
        expect(apiResult.result.length).toBeGreaterThan(0);

        console.log('✅ Final Verified Calvin Response:', apiResult.result);

        await jobTeardown();
    }, 120000);
});
