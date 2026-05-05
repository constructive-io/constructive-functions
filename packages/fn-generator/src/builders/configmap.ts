import * as fs from 'fs';
import * as path from 'path';
import { renderTemplate } from '../placeholders';
import type { FunctionInfo, Manifest } from '../types';

/**
 * Build a `functions-configmap.yaml` for either a single function (when
 * `target` is supplied) or the aggregate of all functions.
 *
 *   - per-function output: `<outputDir>/<target.dir>/k8s/functions-configmap.yaml`
 *   - aggregate output:    `<outputDir>/functions-configmap.yaml`
 */
export const buildConfigMap = (args: {
  fns: FunctionInfo[];
  target?: FunctionInfo;
  outputDir: string;
  templatesDir: string;
  namespace: string;
}): Manifest => {
  const targetFns = args.target ? [args.target] : args.fns;
  const gatewayMap: Record<string, string> = {};
  for (const fn of targetFns) {
    gatewayMap[fn.name] = `http://${fn.name}.${args.namespace}.svc.cluster.local`;
  }

  const template = fs.readFileSync(
    path.join(args.templatesDir, 'k8s', 'functions-configmap.yaml'),
    'utf-8'
  );
  const yaml = renderTemplate(template, {
    jobs_supported: targetFns.map((fn) => fn.name).join(','),
    gateway_map: JSON.stringify(gatewayMap),
  });

  const outPath = args.target
    ? path.join(args.outputDir, args.target.dir, 'k8s', 'functions-configmap.yaml')
    : path.join(args.outputDir, 'functions-configmap.yaml');

  return { kind: 'file', path: outPath, content: yaml };
};
