
import { KubernetesClient } from 'kubernetesjs';
import * as fs from 'fs';

describe('PyTorch GPU Function (Integration)', () => {
    let k8s: KubernetesClient;
    const NAMESPACE = 'default';
    let proxyProcess: any;

    beforeAll(async () => {
        const { spawn } = require('child_process');
        proxyProcess = spawn('kubectl', ['proxy', '--port=8009']);
        await new Promise(resolve => setTimeout(resolve, 2000));
        k8s = new KubernetesClient({ restEndpoint: 'http://127.0.0.1:8009' } as any);
    });

    afterAll(async () => {
        if (proxyProcess) proxyProcess.kill();
    });

    it('should orchestrate the pytorch-gpu job', async () => {
        const jobName = `pytorch-exec-${Math.floor(Date.now() / 1000)}`;
        try { await k8s.deleteBatchV1NamespacedJob({ path: { namespace: NAMESPACE, name: jobName }, query: { propagationPolicy: 'Background' } }); } catch (e) { }

        const jobManifest = {
            apiVersion: 'batch/v1',
            kind: 'Job',
            metadata: { name: jobName, namespace: NAMESPACE, labels: { "job-name": jobName, "app": "pytorch-gpu" } },
            spec: {
                backoffLimit: 0,
                template: {
                    metadata: { labels: { "job-name": jobName } },
                    spec: {
                        restartPolicy: 'Never',
                        containers: [{
                            name: 'pytorch-gpu',
                            image: 'constructive/pytorch-gpu:latest',
                            imagePullPolicy: "Never",
                            env: [{ name: "PORT", value: "8080" }]
                        }]
                    }
                }
            }
        };

        await k8s.createBatchV1NamespacedJob({ path: { namespace: NAMESPACE }, body: jobManifest, query: {} });

        let success = false;
        let logsResponse = '';
        let podName = '';

        for (let i = 0; i < 30; i++) {
            try {
                if (!podName) {
                    const pods = await k8s.listCoreV1NamespacedPod({ path: { namespace: NAMESPACE }, query: { labelSelector: `job-name=${jobName}` } });
                    if (pods.items && pods.items.length > 0) podName = pods.items[0].metadata.name;
                }
                if (podName) {
                    try {
                        const res = await fetch(`http://127.0.0.1:8009/api/v1/namespaces/${NAMESPACE}/pods/${podName}/log?tailLines=50`);
                        const logs = await res.text();
                        if (logs.includes('listening on port')) {
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

        if (!success) throw new Error(`PyTorch Service Failed: ${logsResponse}`);
        expect(success).toBe(true);
        expect(logsResponse).toContain('listening on port');

        try { await k8s.deleteBatchV1NamespacedJob({ path: { namespace: NAMESPACE, name: jobName }, query: { propagationPolicy: 'Background' } }); } catch (e) { }
    }, 120000);
});
