/**
 * Unit tests for the Knative spec builder and namespace resolver.
 */

import type { Pool } from 'pg';

import { buildKnativeServiceSpec, resolveNamespaceName } from '../../packages/provisioning-handlers/src/knative';

describe('buildKnativeServiceSpec', () => {
  it('builds a Knative Service spec with labels, ports, and volumes', () => {
    const spec = buildKnativeServiceSpec(
      {
        name: 'my-func',
        image: 'ghcr.io/org/my-func:v1',
        concurrency: 10,
        scale_min: 1,
        scale_max: 5,
        timeout_seconds: 60,
        resources: { limits: { memory: '256Mi' } },
      },
      'my-namespace'
    );

    expect(spec.apiVersion).toBe('serving.knative.dev/v1');
    expect(spec.kind).toBe('Service');
    expect(spec.metadata.name).toBe('my-func');
    expect(spec.metadata.namespace).toBe('my-namespace');

    // Standard labels (matches operator pattern)
    expect(spec.metadata.labels['app.kubernetes.io/managed-by']).toBe('provisioning-handlers');
    expect(spec.metadata.labels['app.kubernetes.io/component']).toBe('function');
    expect(spec.metadata.labels['app.kubernetes.io/name']).toBe('my-func');
    expect(spec.metadata.labels['app.kubernetes.io/part-of']).toBe('my-namespace');
    expect(spec.metadata.labels['app.kubernetes.io/instance']).toBe('my-namespace-my-func');
    expect(spec.metadata.labels['networking.knative.dev/visibility']).toBe('cluster-local');

    // Template labels propagate to pods
    expect(spec.spec.template.metadata.labels).toEqual(spec.metadata.labels);

    const tmplSpec = spec.spec.template.spec;
    expect(tmplSpec.containerConcurrency).toBe(10);
    expect(tmplSpec.timeoutSeconds).toBe(60);

    // Container
    const container = tmplSpec.containers[0];
    expect(container.image).toBe('ghcr.io/org/my-func:v1');
    expect(container.ports).toEqual([{ containerPort: 8080 }]);
    expect(container.envFrom).toEqual([{ secretRef: { name: 'my-namespace-secrets' } }]);
    expect(container.resources).toEqual({ limits: { memory: '256Mi' } });
    expect(container.volumeMounts).toEqual([{ name: 'tmp', mountPath: '/tmp' }]);

    // /tmp emptyDir volume
    expect(tmplSpec.volumes).toEqual([{ name: 'tmp', emptyDir: {} }]);

    // Autoscaling annotations (includes target when min+max are set)
    const annotations = spec.spec.template.metadata.annotations!;
    expect(annotations['autoscaling.knative.dev/minScale']).toBe('1');
    expect(annotations['autoscaling.knative.dev/maxScale']).toBe('5');
    expect(annotations['autoscaling.knative.dev/target']).toBe('50');
  });

  it('omits scaling annotations when min/max are zero', () => {
    const spec = buildKnativeServiceSpec(
      {
        name: 'basic-func',
        image: 'nginx:latest',
        concurrency: 0,
        scale_min: 0,
        scale_max: 0,
        timeout_seconds: 300,
        resources: {},
      },
      'default'
    );

    expect(spec.spec.template.metadata.annotations).toBeUndefined();
    expect(spec.spec.template.spec.containerConcurrency).toBeUndefined();
    // Resources omitted when empty
    expect(spec.spec.template.spec.containers[0].resources).toBeUndefined();
  });

  it('defaults timeout to 300 when not provided', () => {
    const spec = buildKnativeServiceSpec(
      { name: 'fn', image: 'img:v1' },
      'ns'
    );
    expect(spec.spec.template.spec.timeoutSeconds).toBe(300);
  });

  it('uses explicit scale_target when provided', () => {
    const spec = buildKnativeServiceSpec(
      {
        name: 'fn',
        image: 'img:v1',
        scale_min: 1,
        scale_max: 20,
        scale_target: 100,
      },
      'ns'
    );
    const annotations = spec.spec.template.metadata.annotations!;
    expect(annotations['autoscaling.knative.dev/target']).toBe('100');
  });
});

describe('resolveNamespaceName', () => {
  const mockQuery = jest.fn();
  const mockPool = { query: mockQuery } as unknown as Pool;

  beforeEach(() => jest.clearAllMocks());

  it('returns "default" when namespaceId is null', async () => {
    expect(await resolveNamespaceName(mockPool, null)).toBe('default');
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('queries the database and returns the namespace name', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ name: 'my-app' }] });
    expect(await resolveNamespaceName(mockPool, 'ns-123')).toBe('my-app');
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('metaschema_public.namespace'),
      ['ns-123']
    );
  });

  it('returns "default" when namespace not found', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    expect(await resolveNamespaceName(mockPool, 'ns-missing')).toBe('default');
  });
});
