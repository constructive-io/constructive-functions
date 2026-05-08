import * as fs from 'fs';
import * as path from 'path';
import { renderTemplate } from '../placeholders';
import type { FunctionInfo, Manifest } from '../types';

const PYTHON_ARTIFACTS = `        - image: constructive-functions-python
          context: .
          docker:
            dockerfile: Dockerfile.python.dev
          sync:
            manual:
              - src: 'functions/**/*.py'
                dest: /usr/src/app
              - src: 'generated/**/*.py'
                dest: /usr/src/app`;

/**
 * Build the root `skaffold.yaml` from `templates/k8s/skaffold.yaml`,
 * including per-function profiles, an aggregate raw-yaml list, port
 * forwards, and the Python build artifact (only if any function is python).
 */
export const buildSkaffold = (args: {
  fns: FunctionInfo[];
  rootDir: string;
  templatesDir: string;
  namespace: string;
}): Manifest => {
  const k8s = path.join(args.templatesDir, 'k8s');
  const nodeProfile = fs.readFileSync(path.join(k8s, 'skaffold-profile.yaml'), 'utf-8');
  const pythonProfile = fs.readFileSync(path.join(k8s, 'skaffold-profile-python.yaml'), 'utf-8');
  const main = fs.readFileSync(path.join(k8s, 'skaffold.yaml'), 'utf-8');

  const perFnProfiles = args.fns
    .map((fn) =>
      renderTemplate(fn.type === 'python' ? pythonProfile : nodeProfile, {
        name: fn.name,
        dir: fn.dir,
        port: String(fn.port),
        namespace: args.namespace,
      }).trimEnd()
    )
    .join('\n');

  const allRawYaml = args.fns
    .map((fn) => `        - generated/${fn.dir}/k8s/local-deployment.yaml`)
    .join('\n');

  const allPortForwards = args.fns
    .map((fn) =>
      [
        '      - resourceType: service',
        `        resourceName: ${fn.name}`,
        `        namespace: ${args.namespace}`,
        '        port: 80',
        `        localPort: ${fn.port}`,
      ].join('\n')
    )
    .join('\n');

  const pythonArtifacts = args.fns.some((fn) => fn.type === 'python') ? PYTHON_ARTIFACTS : '';

  const skaffold = renderTemplate(main, {
    per_function_profiles: perFnProfiles,
    all_raw_yaml: allRawYaml,
    all_port_forwards: allPortForwards,
    python_artifacts: pythonArtifacts,
    namespace: args.namespace,
  });

  return { kind: 'file', path: path.join(args.rootDir, 'skaffold.yaml'), content: skaffold };
};
