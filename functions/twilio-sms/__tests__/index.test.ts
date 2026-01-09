
import { getConnections, PgTestClient } from 'pgsql-test';
import { KubernetesClient } from 'kubernetesjs';

describe('Twilio SMS Function (Integration)', () => {
    let db: PgTestClient;
    let pg: PgTestClient;
    let teardown: () => Promise<void>;
    let k8s: KubernetesClient;
    const NAMESPACE = 'default';
    let proxyProcess: any;

    beforeAll(async () => {
        const { spawn } = require('child_process');
        proxyProcess = spawn('kubectl', ['proxy', '--port=8009']);
        await new Promise(resolve => setTimeout(resolve, 2000));
        k8s = new KubernetesClient({ restEndpoint: 'http://127.0.0.1:8009' } as any);

        // database connection in the pod
        ({ pg, db, teardown } = await getConnections({
            pg: {
                user: 'postgres',
                password: process.env.PGPASSWORD,
                host: process.env.PGHOST,
                port: Number(process.env.PGPORT || 5432),
                database: String(process.env.PGDATABASE || `twilio_sms_test_${Math.floor(Math.random() * 100000)}`)
            },
            db: {
                connections: { app: { user: 'postgres', password: process.env.PGPASSWORD } }
            }
        }));
    });

    afterAll(async () => {
        await teardown();
        if (proxyProcess) proxyProcess.kill();
    });

    it('should verify database connectivity via pgsql-test', async () => {
        const result = await pg.query('SELECT 1 as num');
        expect(result.rows[0].num).toBe(1);
    });

    it('should orchestrate the twilio-sms job and verify startup', async () => {
        const jobName = `twilio-sms-exec-${Math.floor(Date.now() / 1000)}`;
        try { await k8s.deleteBatchV1NamespacedJob({ path: { namespace: NAMESPACE, name: jobName }, query: { propagationPolicy: 'Background' } }); } catch (e) { }

        const jobManifest = {
            apiVersion: 'batch/v1',
            kind: 'Job',
            metadata: { name: jobName, namespace: NAMESPACE, labels: { "job-name": jobName, "app": "twilio-sms" } },
            spec: {
                backoffLimit: 0,
                template: {
                    metadata: { labels: { "job-name": jobName } },
                    spec: {
                        restartPolicy: 'Never',
                        containers: [{
                            name: 'twilio-sms',
                            image: 'constructive/function-test-runner:v2',
                            imagePullPolicy: "IfNotPresent",
                            command: ["npx", "ts-node", "functions/_runtimes/node/runner.js", "functions/twilio-sms/src/index.ts"],
                            env: [
                                { name: "PORT", value: "8080" },
                                // Propagate env vars from the test runner pod to the function pod
                                { name: "TWILIO_ACCOUNT_SID", value: process.env.TWILIO_ACCOUNT_SID },
                                { name: "TWILIO_AUTH_TOKEN", value: process.env.TWILIO_AUTH_TOKEN },
                                { name: "TWILIO_FROM_NUMBER", value: process.env.TWILIO_FROM_NUMBER },
                                { name: "PGHOST", value: "postgres" },
                                { name: "PGPASSWORD", value: process.env.PGPASSWORD }
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

        if (!success) throw new Error(`Twilio SMS Service Failed: ${logsResponse}`);
        expect(success).toBe(true);

        try { await k8s.deleteBatchV1NamespacedJob({ path: { namespace: NAMESPACE, name: jobName }, query: { propagationPolicy: 'Background' } }); } catch (e) { }
    }, 120000);
});
