import * as fs from 'fs';
import * as path from 'path';
import type { HandlerManifest } from '@constructive-io/fn-types';
import type { FunctionInfo } from './types';

/**
 * Return directory names under `functionsDir` that contain a handler.json,
 * in `fs.readdirSync()` order. If `only` is provided, restrict to that one.
 */
export const findFunctions = (functionsDir: string, only?: string): string[] => {
  if (!fs.existsSync(functionsDir)) return [];
  return fs
    .readdirSync(functionsDir)
    .filter((name) => fs.existsSync(path.join(functionsDir, name, 'handler.json')))
    .filter((name) => !only || name === only);
};

export const readManifest = (fnDir: string): HandlerManifest => {
  const raw = fs.readFileSync(path.join(fnDir, 'handler.json'), 'utf-8');
  return JSON.parse(raw) as HandlerManifest;
};

/**
 * Resolve `templates/<type>/`. Throws if the directory does not exist.
 */
export const resolveTemplateDir = (
  manifest: HandlerManifest,
  templatesDir: string,
  defaultTemplate: string
): string => {
  const templateType = manifest.type || defaultTemplate;
  const templateDir = path.join(templatesDir, templateType);
  if (!fs.existsSync(templateDir)) {
    throw new Error(
      `Template "${templateType}" not found at ${templateDir}. ` +
        `Check the "type" field in handler.json for function "${manifest.name}".`
    );
  }
  return templateDir;
};

/**
 * Auto-assign ports to manifests missing one and validate there are no
 * conflicts (and that 8080 — reserved for the job-service — isn't claimed).
 *
 * Mutates the input manifests' `port` field.
 */
export const assignAndValidatePorts = (
  manifests: HandlerManifest[],
  defaultTemplate: string
): void => {
  const usedPorts = new Set<number>(
    manifests.filter((m) => m.port).map((m) => m.port as number)
  );
  let nextPort = usedPorts.size > 0 ? Math.max(...usedPorts) + 1 : 8081;
  for (const m of manifests) {
    if (!m.port) {
      while (usedPorts.has(nextPort)) nextPort++;
      m.port = nextPort;
      usedPorts.add(nextPort);
      nextPort++;
    }
  }

  const portToFunction = new Map<number, string>();
  for (const m of manifests) {
    if (m.port === 8080) {
      throw new Error(
        `Function "${m.name}" uses port 8080 which is reserved for job-service.`
      );
    }
    if (portToFunction.has(m.port as number)) {
      throw new Error(
        `Port ${m.port} conflict: "${m.name}" and "${portToFunction.get(m.port as number)}".`
      );
    }
    portToFunction.set(m.port as number, m.name);
  }
  // suppress unused var lint by referencing defaultTemplate consumer side
  void defaultTemplate;
};

/**
 * Build the resolved `FunctionInfo[]` for a discovered set of function dirs.
 * Reads manifests, assigns ports, defaults the template type.
 */
export const computeFunctionInfos = (
  fnDirs: string[],
  functionsDir: string,
  defaultTemplate: string
): FunctionInfo[] => {
  const manifests = fnDirs.map((dir) => readManifest(path.join(functionsDir, dir)));
  assignAndValidatePorts(manifests, defaultTemplate);
  return fnDirs.map((dir, i) => ({
    name: manifests[i].name,
    dir,
    port: manifests[i].port as number,
    type: manifests[i].type || defaultTemplate,
    manifest: manifests[i],
  }));
};
