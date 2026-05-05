/**
 * Function registry loader for the in-process function server.
 *
 * Sources, in priority order:
 *   1. FUNCTIONS_REGISTRY env var
 *      Format: "name:moduleName:port,..." (port optional)
 *      Example: "simple-email:@org/simple-email-fn:8081,foo:@org/foo-fn"
 *   2. FUNCTIONS_MANIFEST_PATH env var pointing to a JSON file with shape
 *        { functions: [{ name, dir, port, type, moduleName? }] }
 *   3. Default file: <cwd>/generated/functions-manifest.json
 *
 * If no source resolves, the registry is empty; callers throw on lookup of
 * an unknown function (preserves the legacy "Unknown function X" behaviour).
 */
import * as fs from 'fs';
import * as path from 'path';

export interface FunctionRegistryEntry {
  moduleName: string;
  defaultPort: number;
}

export type FunctionRegistry = Record<string, FunctionRegistryEntry>;

const DEFAULT_MODULE_PREFIX = '@constructive-io/';
const DEFAULT_MODULE_SUFFIX = '-fn';

const conventionalModuleName = (name: string): string =>
  `${DEFAULT_MODULE_PREFIX}${name}${DEFAULT_MODULE_SUFFIX}`;

const parseEnvRegistry = (raw: string): FunctionRegistry => {
  const out: FunctionRegistry = {};
  for (const pair of raw.split(',')) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const [name, moduleName, portStr] = trimmed.split(':').map((s) => s.trim());
    if (!name) continue;
    const portNumber = portStr ? Number(portStr) : NaN;
    out[name] = {
      moduleName: moduleName || conventionalModuleName(name),
      defaultPort: Number.isFinite(portNumber) ? portNumber : 0,
    };
  }
  return out;
};

interface ManifestEntry {
  name: string;
  dir?: string;
  port?: number;
  type?: string;
  moduleName?: string;
}

const fromManifestEntry = (entry: ManifestEntry): FunctionRegistryEntry => ({
  moduleName: entry.moduleName ?? conventionalModuleName(entry.name),
  defaultPort: typeof entry.port === 'number' ? entry.port : 0,
});

const loadManifestFile = (manifestPath: string): FunctionRegistry => {
  const raw = fs.readFileSync(manifestPath, 'utf-8');
  const parsed = JSON.parse(raw) as { functions?: ManifestEntry[] };
  const out: FunctionRegistry = {};
  for (const entry of parsed.functions ?? []) {
    if (!entry.name) continue;
    out[entry.name] = fromManifestEntry(entry);
  }
  return out;
};

export const loadFunctionRegistry = (
  env: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd()
): FunctionRegistry => {
  if (env.FUNCTIONS_REGISTRY) {
    return parseEnvRegistry(env.FUNCTIONS_REGISTRY);
  }
  const manifestPath =
    env.FUNCTIONS_MANIFEST_PATH ?? path.join(cwd, 'generated', 'functions-manifest.json');
  if (fs.existsSync(manifestPath)) {
    return loadManifestFile(manifestPath);
  }
  return {};
};
