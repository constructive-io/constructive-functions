
import { KubernetesClient } from 'kubernetesjs';
import * as fs from 'fs';
import { createJobTeardown } from '../../test-utils';

// Mock interaction is hard without actually signing. 
// We will test startup for now.

describe('Crypto Login Function (Integration)', () => {
    let k8s: KubernetesClient;
    const NAMESPACE = 'default';
    let proxyProcess: any;

    beforeAll(async () => {
        const { spawn } = require('child_process');
        proxyProcess = spawn('kubectl', ['proxy', '--port=8004']);
        await new Promise(resolve => setTimeout(resolve, 2000));
        k8s = new KubernetesClient({ restEndpoint: 'http://127.0.0.1:8004' } as any);
    });

    afterAll(async () => {
        if (proxyProcess) proxyProcess.kill();
    });

    it('should orchestrate the crypto-login job and verify startup', async () => {
        const jobName = `crypto-login-exec-${Math.floor(Date.now() / 1000)}`;
        // Initial cleanup (force)
        try { await k8s.deleteBatchV1NamespacedJob({ path: { namespace: NAMESPACE, name: jobName }, query: { propagationPolicy: 'Background' } }); } catch (e) { }

        const teardown = createJobTeardown(k8s, NAMESPACE, jobName);

        // We run a simple startup test here. 
        // Logic verification for signatures (ETH, SOL, BTC) is best done via unit tests or inside the pod if we can curl it.
        // For integration, we just check it stands up.
        // TODO: Enhance to `curl` the pod with signatures if possible, but requires generating valid signatures in test code.

        const jobManifest = {
            apiVersion: 'batch/v1',
            kind: 'Job',
            metadata: { name: jobName, namespace: NAMESPACE, labels: { "job-name": jobName, "app": "crypto-login" } },
            spec: {
                backoffLimit: 0,
                template: {
                    metadata: { labels: { "job-name": jobName } },
                    spec: {
                        restartPolicy: 'Never',
                        containers: [{
                            name: 'crypto-login',
                            image: 'constructive/function-test-runner:v8',
                            imagePullPolicy: "IfNotPresent",
                            command: ["npx", "ts-node", "functions/_runtimes/node/runner.js", "functions/crypto-login/src/index.ts"],
                            env: [
                                { name: "PORT", value: "8080" },
                                { name: "PGHOST", value: "postgres" },
                                { name: "PGPASSWORD", value: process.env.PGPASSWORD },
                                { name: "STRIPE_PUBLISHABLE_KEY", value: process.env.STRIPE_PUBLISHABLE_KEY },
                                { name: "STRIPE_SECRET_KEY", value: process.env.STRIPE_SECRET_KEY },
                                { name: "TWILIO_ACCOUNT_SID", value: process.env.TWILIO_ACCOUNT_SID },
                                { name: "TWILIO_AUTH_TOKEN", value: process.env.TWILIO_AUTH_TOKEN },
                                { name: "CALVIN_API_KEY", value: process.env.CALVIN_API_KEY },
                                { name: "OPENAI_API_KEY", value: process.env.OPENAI_API_KEY }
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

        for (let i = 0; i < 30; i++) {
            try {
                if (!podName) {
                    const pods = await k8s.listCoreV1NamespacedPod({ path: { namespace: NAMESPACE }, query: { labelSelector: `job-name=${jobName}` } });
                    if (pods.items && pods.items.length > 0) podName = pods.items[0].metadata.name;
                }
                if (podName) {
                    try {
                        const res = await fetch(`http://127.0.0.1:8004/api/v1/namespaces/${NAMESPACE}/pods/${podName}/log?tailLines=50`);
                        const logs = await res.text();
                        if (logs.includes('listening on port')) {
                            success = true;
                            logsResponse = logs;

                            // Invoke to trigger GQL log
                            console.log('[Test] Invoking crypto-login via proxy...');
                            const proxyUrl = `http://127.0.0.1:8004/api/v1/namespaces/${NAMESPACE}/pods/${podName}:8080/proxy/`;
                            // Dummy payload to trigger execution flow
                            await fetch(proxyUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email: 'test', password: 'test' })
                            });

                            // Capture logs
                            await new Promise(r => setTimeout(r, 2000));
                            const logRes = await fetch(`http://127.0.0.1:8004/api/v1/namespaces/${NAMESPACE}/pods/${podName}/log?tailLines=50`);
                            console.log('\n[Evidence] Pod Logs:\n' + await logRes.text() + '\n');

                            break;
                        }
                        logsResponse = logs;
                    } catch (e) { }
                }
            } catch (e) { }
            await new Promise(r => setTimeout(r, 2000));
        }

        if (!success) throw new Error(`Crypto Login Service Failed: ${logsResponse}`);
        expect(success).toBe(true); // Just test startup

        await teardown();
    }, 120000);
});
