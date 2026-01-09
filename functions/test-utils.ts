
import { KubernetesClient } from 'kubernetesjs';

export const JOB_TEARDOWN_DELAY = 2000;

/**
 * Creates a teardown function for a specific K8s Job.
 * Checks process.env.NO_TEARDOWN to skip cleanup if set.
 * 
 * @param k8s - The KubernetesClient instance
 * @param namespace - The namespace of the job
 * @param jobName - The name of the job
 * @returns A function to be called in `afterAll` or `finally` blocks
 */
export const createJobTeardown = (k8s: KubernetesClient, namespace: string, jobName: string) => {
    return async () => {
        if (process.env.NO_TEARDOWN === 'true' || process.env.NO_TEARDOWN === '1') {
            console.log(`[Teardown] Skipping cleanup for job: ${jobName} (NO_TEARDOWN set)`);
            return;
        }

        console.log(`[Teardown] Cleaning up job: ${jobName}`);
        try {
            await k8s.deleteBatchV1NamespacedJob({
                path: { namespace, name: jobName },
                query: { propagationPolicy: 'Background' }
            });
        } catch (e: any) {
            console.warn(`[Teardown] Warning during cleanup of ${jobName}: ${e.message}`);
        }
    };
};
