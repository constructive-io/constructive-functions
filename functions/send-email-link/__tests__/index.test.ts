import { getConnections, PgTestClient } from 'pgsql-test';
import { KubernetesClient } from 'kubernetesjs';
import * as fs from 'fs';

describe('Send Email Link Function (Integration)', () => {
    let pg: PgTestClient;
    let db: PgTestClient;
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
                database: String(process.env.PGDATABASE || `send_email_link_test_${Math.floor(Math.random() * 100000)} `)
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

    it('should orchestrate send-email-link service and verify trigger', async () => {
        const jobName = `send-email-link-exec-${Math.floor(Date.now() / 1000)}`;

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
                            name: 'send-email-link',
                            image: 'constructive/function-test-runner:v4',
                            imagePullPolicy: "IfNotPresent",
                            command: ["npx", "ts-node", "functions/_runtimes/node/runner.js", "functions/send-email-link/src/index.ts"],
                            env: [
                                { name: "PGHOST", value: "postgres" },
                                { name: "PGPASSWORD", value: process.env.PGPASSWORD },
                                { name: "PORT", value: "8080" },
                                { name: "GRAPHQL_URL", value: "http://mock-graphql" },
                                { name: "SEND_EMAIL_LINK_DRY_RUN", value: "true" },
                                { name: "MAILGUN_DOMAIN", value: "example.com" },
                                { name: "MAILGUN_FROM", value: "no-reply@example.com" },
                                { name: "MAILGUN_REPLY", value: "no-reply@example.com" },
                                { name: "MAILGUN_KEY", value: "mock-key" }
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
        let triggerSuccess = false;

        // Poll for Pod and check status/logs
        for (let i = 0; i < 60; i++) {
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
                    // Check logs for startup
                    try {
                        const res = await fetch(`http://127.0.0.1:8001/api/v1/namespaces/${NAMESPACE}/pods/${podName}/log?tailLines=50`);
                        const logs = await res.text();
                        if (logs) logsResponse = logs;

                        if (logs.includes('listening on port')) {
                            success = true;
                        }
                    } catch (e) { }

                    // If started, try to trigger
                    if (success && !triggerSuccess) {
                        try {
                            console.log('[Test] Attempting to trigger function...');
                            const triggerRes = await fetch(`http://127.0.0.1:8001/api/v1/namespaces/${NAMESPACE}/pods/${podName}:8080/proxy/`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-Database-Id': '00000000-0000-0000-0000-000000000000'
                                },
                                body: JSON.stringify({
                                    email_type: 'unknown_type_for_validation_check',
                                    email: 'test@example.com'
                                })
                            });

                            const json = await triggerRes.json();
                            console.log('[Test] Trigger response:', json);

                            // We expect { missing: 'email_type' } because we passed a valid 'non-matching' type? 
                            // Wait, 'unknown_type_for_validation_check' falls to default case in switch -> return { missing: 'email_type' }?
                            // Actually switch default returns { missing: 'email_type' } based on code?
                            // Checked code: default returns { missing: 'email_type' }.

                            if (json && json.missing === 'email_type') {
                                triggerSuccess = true;
                                console.log('[Test] Trigger Verification Succeeded!');
                                break;
                            }
                        } catch (e) { console.log('Trigger failed:', e); }
                    }
                }
            } catch (e) { }
            await new Promise(r => setTimeout(r, 1000));
        }

        if (!success) {
            throw new Error(`Service failed to start. Logs: ${logsResponse}`);
        }
        if (!triggerSuccess) {
            throw new Error(`Service started but failed to verify trigger. Logs: ${logsResponse}`);
        }

        expect(success).toBe(true);
        expect(triggerSuccess).toBe(true);

        // Cleanup
        try {
            await k8s.deleteBatchV1NamespacedJob({
                path: { namespace: NAMESPACE, name: jobName },
                query: { propagationPolicy: 'Background' }
            });
        } catch (e) { }
    }, 120000);
});
