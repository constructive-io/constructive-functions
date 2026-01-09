
import { KubernetesClient } from 'kubernetesjs';
import * as fs from 'fs';

describe('Opencode Headless Function (Integration)', () => {
    let k8s: KubernetesClient;
    const NAMESPACE = 'default';
    let proxyProcess: any;

    beforeAll(async () => {
        const { spawn } = require('child_process');
        proxyProcess = spawn('kubectl', ['proxy', '--port=8008']);
        await new Promise(resolve => setTimeout(resolve, 2000));
        k8s = new KubernetesClient({ restEndpoint: 'http://127.0.0.1:8008' } as any);
    });

    afterAll(async () => {
        if (proxyProcess) proxyProcess.kill();
    });

    it('should orchestrate the opencode-headless job', async () => {
        const jobName = `opencode-headless-exec-${Math.floor(Date.now() / 1000)}`;
        try { await k8s.deleteBatchV1NamespacedJob({ path: { namespace: NAMESPACE, name: jobName }, query: { propagationPolicy: 'Background' } }); } catch (e) { }

        const jobManifest = {
            apiVersion: 'batch/v1',
            kind: 'Job',
            metadata: { name: jobName, namespace: NAMESPACE, labels: { "job-name": jobName, "app": "opencode-headless" } },
            spec: {
                backoffLimit: 0,
                template: {
                    metadata: { labels: { "job-name": jobName } },
                    spec: {
                        restartPolicy: 'Never',
                        containers: [{
                            name: 'opencode-headless',
                            image: 'constructive/function-test-runner:v2',
                            imagePullPolicy: "IfNotPresent",
                            command: ["npx", "ts-node", "functions/_runtimes/node/runner.js", "functions/opencode-headless/src/index.ts"],
                            env: [{ name: "PORT", value: "8080" }],
                            ports: [{ containerPort: 8080 }]
                        }]
                    }
                }
            }
        };

        await k8s.createBatchV1NamespacedJob({ path: { namespace: NAMESPACE }, body: jobManifest, query: {} });

        let success = false;
        let logsResponse = '';
        let podName = '';
        let triggered = false;

        for (let i = 0; i < 30; i++) {
            try {
                if (!podName) {
                    const pods = await k8s.listCoreV1NamespacedPod({ path: { namespace: NAMESPACE }, query: { labelSelector: `job-name=${jobName}` } });
                    if (pods.items && pods.items.length > 0) podName = pods.items[0].metadata.name;
                }
                if (podName) {
                    try {
                        const res = await fetch(`http://127.0.0.1:8008/api/v1/namespaces/${NAMESPACE}/pods/${podName}/log?tailLines=50`);
                        const logs = await res.text();

                        // Check if server is listening and we haven't triggered yet
                        if (logs.includes('listening on port') && !triggered) {
                            triggered = true;
                            // Trigger the function
                            try {
                                console.log('Attempting to trigger opencode-headless via proxy...');
                                const triggerRes = await fetch(`http://127.0.0.1:8008/api/v1/namespaces/${NAMESPACE}/pods/${podName}/proxy/`, {
                                    method: 'POST',
                                    body: JSON.stringify({ prompt: 'test' }),
                                    headers: { 'Content-Type': 'application/json' }
                                });
                                console.log(`Trigger status: ${triggerRes.status} ${triggerRes.statusText}`);
                                const text = await triggerRes.text();
                                console.log(`Trigger response: ${text}`);
                                if (!triggerRes.ok) console.error(text);
                            } catch (e) {
                                console.error('Trigger failed:', e);
                            }
                        }

                        // Check for opencode server startup logs (only if triggered or just appearing)
                        if (logs.includes('opencode server listening') || logs.includes('Using ConstructiveAdapter') || logs.includes('[opencode]')) {
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

        // Fetch and Print Logs (Evidence)
        try {
            const res = await fetch(`http://127.0.0.1:8008/api/v1/namespaces/${NAMESPACE}/pods/${podName}/log`);
            const logs = await res.text();
            console.log('\n[Evidence] Function Pod Logs:\n' + logs + '\n');
        } catch (e) {
            console.warn("Failed to fetch logs for evidence", e);
        }

        if (!success) throw new Error(`Opencode Headless Failed: ${logsResponse}`);
        expect(success).toBe(true);

        try { await k8s.deleteBatchV1NamespacedJob({ path: { namespace: NAMESPACE, name: jobName }, query: { propagationPolicy: 'Background' } }); } catch (e) { }
    }, 120000);
});
