
import { KubernetesClient } from 'kubernetesjs';
import * as fs from 'fs';
import * as path from 'path';
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });
import { createJobTeardown } from '../../test-utils';

describe('LLM External Function (Integration)', () => {
    let k8s: KubernetesClient;
    const NAMESPACE = 'default';
    let proxyProcess: any;

    beforeAll(async () => {
        const { spawn } = require('child_process');
        proxyProcess = spawn('kubectl', ['proxy', '--port=8001']);
        await new Promise(resolve => setTimeout(resolve, 2000));
        k8s = new KubernetesClient({ restEndpoint: 'http://127.0.0.1:8001' } as any);
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
                            env: [
                                { name: "OPENAI_API_KEY", value: process.env.OPENAI_API_KEY },
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

        for (let i = 0; i < 45; i++) {
            try {
                if (!podName) {
                    const pods = await k8s.listCoreV1NamespacedPod({ path: { namespace: NAMESPACE }, query: { labelSelector: `job-name=${jobName}` } });
                    if (pods.items && pods.items.length > 0) podName = pods.items[0].metadata.name;
                }
                if (podName) {
                    try {
                        const res = await fetch(`http://127.0.0.1:8001/api/v1/namespaces/${NAMESPACE}/pods/${podName}/log?tailLines=50`);
                        const logs = await res.text();
                        logsResponse = logs;

                        if (logs.includes('listening on port')) {
                            // Trigger with OpenAI payload
                            // Trigger the function
                            console.log('[Test] Triggering function...');
                            const triggerRes = await fetch(`http://127.0.0.1:8001/api/v1/namespaces/${NAMESPACE}/pods/${podName}:8080/proxy/`, {
                                method: 'POST',
                                body: JSON.stringify({ provider: 'test', prompt: 'Can you explain the quantum field theory in simple terms?' }),
                                headers: { 'Content-Type': 'application/json' }
                            });

                            if (triggerRes.ok) {
                                const body = await triggerRes.json();
                                console.log('[Test] Response:', body);
                                if (body.works) {
                                    success = true;
                                    logsResponse = logs;
                                    break;
                                }
                            }
                        }
                        // logsResponse = logs; // update logsResponse in loop
                    } catch (e) { }
                }
            } catch (e) { }
            await new Promise(r => setTimeout(r, 2000));
        }

        // Fetch Logs
        if (podName) {
            try {
                const res = await fetch(`http://127.0.0.1:8001/api/v1/namespaces/${NAMESPACE}/pods/${podName}/log`);
                const logs = await res.text();
                console.log('\n[Evidence] Function Pod Logs:\n' + logs + '\n');
            } catch (e) { }
        }

        if (!success) throw new Error(`LLM External Service Failed: Did not receive success response.`);
        expect(success).toBe(true);

        await teardown();
    }, 120000);
});
