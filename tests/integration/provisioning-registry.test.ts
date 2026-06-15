/**
 * Integration tests for the provisioning handler registry.
 *
 * Verifies that:
 *   1. Sync handlers are registered at module load time
 *   2. Unknown task identifiers return null
 *   3. Custom handlers can be registered dynamically
 */

import {
  getProvisioningHandler,
  registerProvisioningHandler,
} from '../../packages/provisioning-handlers/src/registry';

describe('Provisioning handler registry', () => {
  it('returns a handler for namespace:sync-secrets', () => {
    const handler = getProvisioningHandler('namespace:sync-secrets');
    expect(handler).toBeInstanceOf(Function);
  });

  it('returns a handler for function:sync-resources', () => {
    const handler = getProvisioningHandler('function:sync-resources');
    expect(handler).toBeInstanceOf(Function);
  });

  it('returns null for unknown task identifiers', () => {
    expect(getProvisioningHandler('unknown:task')).toBeNull();
    expect(getProvisioningHandler('namespace:provision')).toBeNull();
    expect(getProvisioningHandler('function:provision')).toBeNull();
  });

  it('allows registering custom handlers', () => {
    const custom = jest.fn().mockResolvedValue({ ok: true });
    registerProvisioningHandler('test:custom', custom);

    const handler = getProvisioningHandler('test:custom');
    expect(handler).toBe(custom);
  });
});
