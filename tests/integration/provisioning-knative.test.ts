/**
 * Unit tests for the Knative spec builder and namespace resolver.
 */

import type { Pool } from 'pg';

import { buildKnativeServiceSpec, resolveNamespaceName } from '../../packages/provisioning-handlers/src/knative';

describe('buildKnativeServiceSpec', () => {
  it('builds a basic Knative Service spec', () => {
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

    const tmplSpec = spec.spec.template.spec;
    expect(tmplSpec.containerConcurrency).toBe(10);
    expect(tmplSpec.timeoutSeconds).toBe(60);
    expect(tmplSpec.containers[0].image).toBe('ghcr.io/org/my-func:v1');
    expect(tmplSpec.containers[0].envFrom).toEqual([
      { secretRef: { name: 'my-namespace-secrets' } },
    ]);
    expect(tmplSpec.containers[0].resources).toEqual({ limits: { memory: '256Mi' } });

    const annotations = spec.spec.template.metadata.annotations!;
    expect(annotations['autoscaling.knative.dev/minScale']).toBe('1');
    expect(annotations['autoscaling.knative.dev/maxScale']).toBe('5');
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
  });

  it('defaults timeout to 300 when not provided', () => {
    const spec = buildKnativeServiceSpec(
      { name: 'fn', image: 'img:v1' },
      'ns'
    );
    expect(spec.spec.template.spec.timeoutSeconds).toBe(300);
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
