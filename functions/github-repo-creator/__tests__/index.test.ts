
import { KubernetesClient } from 'kubernetesjs';
import * as fs from 'fs';
import { createJobTeardown } from '../../test-utils';

describe('Github Repo Creator Function (Integration)', () => {
    let k8s: KubernetesClient;
    const NAMESPACE = 'default';
    let proxyProcess: any;

    beforeAll(async () => {
        const { spawn } = require('child_process');
        proxyProcess = spawn('kubectl', ['proxy', '--port=8007']);
        await new Promise(resolve => setTimeout(resolve, 2000));
        k8s = new KubernetesClient({ restEndpoint: 'http://127.0.0.1:8007' } as any);
    });

    afterAll(async () => {
        if (proxyProcess) proxyProcess.kill();
    });

    it('should orchestrate the github-repo-creator job', async () => {
        const jobName = `gh-repo-create-exec-${Math.floor(Date.now() / 1000)}`;
        try { await k8s.deleteBatchV1NamespacedJob({ path: { namespace: NAMESPACE, name: jobName }, query: { propagationPolicy: 'Background' } }); } catch (e) { }

        const teardown = createJobTeardown(k8s, NAMESPACE, jobName);

        const jobManifest = {
            apiVersion: 'batch/v1',
            kind: 'Job',
            metadata: { name: jobName, namespace: NAMESPACE, labels: { "job-name": jobName, "app": "github-repo-creator" } },
            spec: {
                backoffLimit: 0,
                template: {
                    metadata: { labels: { "job-name": jobName } },
                    spec: {
                        restartPolicy: 'Never',
                        containers: [{
                            name: 'github-repo-creator',
                            image: 'constructive/function-test-runner:v8',
                            imagePullPolicy: "IfNotPresent",
                            command: ["npx", "ts-node", "functions/_runtimes/node/runner.js", "functions/github-repo-creator/src/index.ts"],
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
                        const res = await fetch(`http://127.0.0.1:8007/api/v1/namespaces/${NAMESPACE}/pods/${podName}/log?tailLines=50`);
                        const logs = await res.text();
                        if (logs.includes('listening on port')) {
                            success = true;
                            logsResponse = logs;

                            // Invoke to trigger GQL log
                            console.log('[Test] Invoking github-repo-creator via proxy...');
                            const proxyUrl = `http://127.0.0.1:8007/api/v1/namespaces/${NAMESPACE}/pods/${podName}:8080/proxy/`;
                            await fetch(proxyUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ repoName: 'test', githubToken: 'abc' })
                            });

                            // Capture logs
                            await new Promise(r => setTimeout(r, 2000));
                            const logRes = await fetch(`http://127.0.0.1:8007/api/v1/namespaces/${NAMESPACE}/pods/${podName}/log?tailLines=50`);
                            console.log('\n[Evidence] Pod Logs:\n' + await logRes.text() + '\n');

                            break;
                        }
                        logsResponse = logs;
                    } catch (e) { }
                }
            } catch (e) { }
            await new Promise(r => setTimeout(r, 2000));
        }

        if (!success) throw new Error(`Github Repo Creator Failed: ${logsResponse}`);
        expect(success).toBe(true);

        await teardown();
    }, 120000);
});
