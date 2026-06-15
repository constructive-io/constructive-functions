/**
 * Re-export from @constructive-io/module-loader for backward compatibility.
 *
 * The canonical implementation is in packages/module-loader.
 * This file exists so existing imports from within job/worker/ continue working.
 */

export {
  UsageLoader as UsageClient,
  UsageLoader,
  getModuleLoader as getLoader,
  _resetModuleLoaderCache as _resetLoaderCache,
  USAGE_DEFAULTS as DEFAULTS,
} from '@constructive-io/module-loader';

export type {
  UsageTableConfig as UsageModuleConfig,
  UsageTableConfig,
  MeterEntry,
  InferenceEntry,
  StorageEntry,
} from '@constructive-io/module-loader';
