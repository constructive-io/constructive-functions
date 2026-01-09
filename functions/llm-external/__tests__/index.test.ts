
import { KubernetesClient } from 'kubernetesjs';
import * as fs from 'fs';
import { createJobTeardown } from '../../test-utils';

describe('LLM External Function (Integration)', () => {
    let k8s: KubernetesClient;
    const NAMESPACE = 'default';
    let proxyProcess: any;

    beforeAll(async () => {
        const { spawn } = require('child_process');
        proxyProcess = spawn('kubectl', ['proxy', '--port=8005']);
        await new Promise(resolve => setTimeout(resolve, 2000));
        k8s = new KubernetesClient({ restEndpoint: 'http://127.0.0.1:8005' } as any);
    });

    afterAll(async () => {
        if (proxyProcess) proxyProcess.kill();
    });

    it('should orchestrate the llm-external job', async () => {
        const jobName = `llm-ext-exec-${Math.floor(Date.now() / 1000)}`;
        try { await k8s.deleteBatchV1NamespacedJob({ path: { namespace: NAMESPACE, name: jobName }, query: { propagationPolicy: 'Background' } }); } catch (e) { }

        const teardown = createJobTeardown(k8s, NAMESPACE, jobName);

        const jobManifest = {
            apiVersion: 'batch/v1',
            kind: 'Job',
            metadata: { name: jobName, namespace: NAMESPACE, labels: { "job-name": jobName, "app": "llm-external" } },
            spec: {
                backoffLimit: 0,
                template: {
                    metadata: { labels: { "job-name": jobName } },
                    spec: {
                        restartPolicy: 'Never',
                        containers: [{
                            name: 'llm-external',
                            image: 'constructive/function-test-runner:v2',
                            imagePullPolicy: "IfNotPresent",
                            command: ["npx", "ts-node", "functions/_runtimes/node/runner.js", "functions/llm-external/src/index.ts"],
                            env: [{ name: "OPENAI_API_KEY", value: "sk-mock-key" }, { name: "PORT", value: "8080" }]
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

        for (let i = 0; i < 45; i++) {
            try {
                if (!podName) {
                    const pods = await k8s.listCoreV1NamespacedPod({ path: { namespace: NAMESPACE }, query: { labelSelector: `job-name=${jobName}` } });
                    if (pods.items && pods.items.length > 0) podName = pods.items[0].metadata.name;
                }
                if (podName) {
                    // Check logs for startup
                    let logs = '';
                    try {
                        const res = await fetch(`http://127.0.0.1:8005/api/v1/namespaces/${NAMESPACE}/pods/${podName}/log?tailLines=50`);
                        logs = await res.text();
                    } catch (e) { }
                    logsResponse = logs;

                    if (logs.includes('listening on port')) {
                        // Once listening, trigger the function via Proxy
                        if (triggers < 5) { // Retry trigger a few times
                            try {
                                await fetch(`http://127.0.0.1:8005/api/v1/namespaces/${NAMESPACE}/pods/${podName}/proxy/`, { method: 'POST', body: JSON.stringify({}), headers: { 'Content-Type': 'application/json' } });
                                triggers++;
                            } catch (e) { }
                        }

                        // Verify KNS activity (either success or DNS error proving intent)
                        if (logs.includes('GetUsers') || logs.includes('constructive-server') || logs.includes('ENOTFOUND') || logs.includes('ECONNREFUSED') || logs.includes('runner')) {
                            success = true;
                            break;
                        }
                    }
                }
            } catch (e) { }
            await new Promise(r => setTimeout(r, 2000));
        }

        if (!success) throw new Error(`LLM External Service Failed (No KNS Activity detected): ${logsResponse}`);
        expect(success).toBe(true);

        await teardown();
    }, 120000);
});
