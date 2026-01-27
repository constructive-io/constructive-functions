
import { KubernetesClient } from 'kubernetesjs';
import * as fs from 'fs';

// Since this is a standalone image, we don't need pgsql-test logic inside the pod
// But we can use the same pattern as hello-world to orchestrate the job.

describe('Rust Hello World Function (Integration)', () => {
    // Build check removed as Makefile ensures build happens
    let k8s: KubernetesClient;
    const NAMESPACE = 'default';
    let proxyProcess: any;

    beforeAll(async () => {
        // Start kubectl proxy
        const { spawn } = require('child_process');
        proxyProcess = spawn('kubectl', ['proxy', '--port=8005']);

        await new Promise(resolve => setTimeout(resolve, 2000));

        k8s = new KubernetesClient({
            restEndpoint: 'http://127.0.0.1:8005'
        } as any);
    });

    afterAll(async () => {
        if (proxyProcess) proxyProcess.kill();
    });

    it('should orchestrate the rust-hello-world job and verify log output', async () => {
        const jobName = `rust-hw-exec-${Math.floor(Date.now() / 1000)}`;
        console.log(`[Test] Orchestrating Job: ${jobName}`);

        // Cleanup
        try {
            await k8s.deleteBatchV1NamespacedJob({
                path: { namespace: NAMESPACE, name: jobName },
                query: { propagationPolicy: 'Background' }
            });
        } catch (e) { }

        // Job Manifest
        const jobManifest = {
            apiVersion: 'batch/v1',
            kind: 'Job',
            metadata: {
                name: jobName,
                namespace: NAMESPACE,
                labels: { "job-name": jobName, "app": "rust-hello-world" }
            },
            spec: {
                backoffLimit: 0,
                template: {
                    metadata: { labels: { "job-name": jobName } },
                    spec: {
                        restartPolicy: 'Never',
                        containers: [{
                            name: 'rust-hello-world',
                            image: 'constructive/rust-hello-world:latest',
                            imagePullPolicy: "Never", // Use local Kind image
                            env: [{ name: "PORT", value: "8080" }]
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

        // Wait for Logs
        let success = false;
        let podName = '';
        let logsResponse = '';

        for (let i = 0; i < 30; i++) {
            try {
                if (!podName) {
                    const pods = await k8s.listCoreV1NamespacedPod({
                        path: { namespace: NAMESPACE },
                        query: { labelSelector: `job-name=${jobName}` }
                    });
                    if (pods.items && pods.items.length > 0) podName = pods.items[0].metadata.name;
                }

                if (podName) {
                    try {
                        const res = await fetch(`http://127.0.0.1:8005/api/v1/namespaces/${NAMESPACE}/pods/${podName}/log?tailLines=50`);
                        const logs = await res.text();
                        if (logs.includes('[rust-hello-world] listening on port 8080')) {
                            success = true;
                            logsResponse = logs;
                            break;
                        }
                        logsResponse = logs;
                    } catch (e) { }
                }
            } catch (e) { }
            await new Promise(r => setTimeout(r, 2000));
        }

        if (!success) throw new Error(`Rust Job Failed logs: ${logsResponse}`);
        expect(success).toBe(true);
        expect(logsResponse).toContain('listening on port 8080');

        // Cleanup
        try {
            await k8s.deleteBatchV1NamespacedJob({
                path: { namespace: NAMESPACE, name: jobName },
                query: { propagationPolicy: 'Background' }
            });
        } catch (e) { }
    }, 120000);
});
