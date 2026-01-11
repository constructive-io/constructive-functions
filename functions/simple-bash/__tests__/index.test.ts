import { getConnections, PgTestClient } from 'pgsql-test';
import { KubernetesClient } from 'kubernetesjs';
import * as fs from 'fs';

describe('Simple Bash Function (Integration)', () => {
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

        // Bash might not use PG but we initialize it for consistency/logging
        ({ pg, db, teardown } = await getConnections({
            pg: {
                user: 'postgres',
                password: process.env.PGPASSWORD,
                host: process.env.PGHOST,
                port: Number(process.env.PGPORT || 5432),
                database: String(process.env.PGDATABASE || `simple_bash_test_${Math.floor(Math.random() * 100000)}`)
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

    it('should orchestrate simple-bash job', async () => {
        const jobName = `simple-bash-exec-${Math.floor(Date.now() / 1000)}`;
        console.log(`[Test] Orchestrating Job: ${jobName}`);

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
                            name: 'simple-bash',
                            image: 'constructive/function-test-runner:v4',
                            imagePullPolicy: "IfNotPresent",
                            // Corrected script path to index.sh
                            command: ["/bin/bash", "functions/simple-bash/src/index.sh", "arg1"],
                            env: []
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

        // 3. Wait for Completion
        console.log(`[Test] Waiting for job ${jobName} to complete...`);
        let logsResponse = '';
        let success = false;
        let podName = '';

        // Poll for Job Status
        for (let i = 0; i < 60; i++) {
            try {
                const job = await k8s.readBatchV1NamespacedJobStatus({
                    path: { namespace: NAMESPACE, name: jobName },
                    query: {}
                });

                if (job.status && (job.status.succeeded || 0) > 0) {
                    success = true;
                }

                // Also find pod name for logs
                if (!podName) {
                    const pods = await k8s.listCoreV1NamespacedPod({
                        path: { namespace: NAMESPACE },
                        query: { labelSelector: `job-name=${jobName}` }
                    });
                    if (pods.items && pods.items.length > 0 && pods.items[0].metadata && pods.items[0].metadata.name) {
                        podName = pods.items[0].metadata.name;
                    }
                }

                if (success && podName) break;

            } catch (e) { }
            await new Promise(r => setTimeout(r, 1000));
        }

        if (success && podName) {
            try {
                const res = await fetch(`http://127.0.0.1:8001/api/v1/namespaces/${NAMESPACE}/pods/${podName}/log`);
                logsResponse = await res.text();
                console.log("Job Logs:", logsResponse);
            } catch (e) {
                console.warn("Failed to fetch logs", e);
            }
        }

        if (!success) {
            throw new Error(`Job failed to complete. Logs: ${logsResponse}`);
        }

        expect(success).toBe(true);
        expect(logsResponse).toContain('Hello Bash!');

        // Cleanup
        try {
            await k8s.deleteBatchV1NamespacedJob({
                path: { namespace: NAMESPACE, name: jobName },
                query: { propagationPolicy: 'Background' }
            });
        } catch (e) { }
    }, 120000);
});
