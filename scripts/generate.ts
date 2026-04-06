// generate: reads functions/*/handler.json, resolves the template type,
// and generates workspace packages into generated/<name>/ by copying
// template files with placeholder replacement and dependency merging.
//
// Runs during preinstall via Node's native type stripping (--experimental-strip-types).
// No compilation or external dependencies needed.

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const ROOT: string = process.cwd();
const FUNCTIONS_DIR: string = path.resolve(ROOT, 'functions');
const GENERATED_DIR: string = path.resolve(ROOT, 'generated');
const TEMPLATES_DIR: string = path.resolve(ROOT, 'templates');

const DEFAULT_TEMPLATE = 'node-graphql';

interface FunctionManifest {
  name: string;
  version: string;
  description?: string;
  type?: string;
  port?: number;
  dependencies?: Record<string, string>;
}

// --- CLI args ---

const onlyArg = process.argv.find((a: string) => a.startsWith('--only='));
const onlyName: string | undefined = onlyArg?.split('=')[1];

// --- Discovery ---

function findFunctions(): string[] {
  if (!fs.existsSync(FUNCTIONS_DIR)) {
    console.log('No functions/ directory found, skipping.');
    return [];
  }

  return fs
    .readdirSync(FUNCTIONS_DIR)
    .filter((name: string) => {
      const handlerJson = path.join(FUNCTIONS_DIR, name, 'handler.json');
      return fs.existsSync(handlerJson);
    })
    .filter((name: string) => !onlyName || name === onlyName);
}

function readManifest(fnDir: string): FunctionManifest {
  const manifestPath = path.join(fnDir, 'handler.json');
  const raw = fs.readFileSync(manifestPath, 'utf-8');
  return JSON.parse(raw);
}

// --- Template resolution ---

function resolveTemplateDir(manifest: FunctionManifest): string {
  const templateType = manifest.type || DEFAULT_TEMPLATE;
  const templateDir = path.join(TEMPLATES_DIR, templateType);

  if (!fs.existsSync(templateDir)) {
    throw new Error(
      `Template "${templateType}" not found at ${templateDir}. ` +
      `Check the "type" field in handler.json for function "${manifest.name}".`
    );
  }

  return templateDir;
}

// --- Template file discovery ---

function walkTemplateFiles(dir: string, base: string = ''): string[] {
  const results: string[] = [];
  const entries = fs.readdirSync(dir) as string[];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const relPath = base ? path.join(base, entry) : entry;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...walkTemplateFiles(fullPath, relPath));
    } else {
      results.push(relPath);
    }
  }
  return results;
}

// --- Placeholder replacement ---

function replacePlaceholders(content: string, manifest: FunctionManifest): string {
  return content
    .replace(/\{\{name\}\}/g, manifest.name)
    .replace(/\{\{version\}\}/g, manifest.version)
    .replace(/\{\{description\}\}/g, manifest.description || '');
}

// --- File processors ---

function processPackageJson(templateContent: string, manifest: FunctionManifest): string {
  const pkg = JSON.parse(replacePlaceholders(templateContent, manifest));

  // Deep merge handler.json dependencies into template dependencies
  if (manifest.dependencies) {
    pkg.dependencies = {
      ...(pkg.dependencies || {}),
      ...manifest.dependencies
    };
  }

  return JSON.stringify(pkg, null, 2) + '\n';
}

function processTsconfig(templateContent: string, fnDir: string): string {
  const tsconfig = JSON.parse(templateContent);

  // Append any .d.ts files from the function directory
  if (fs.existsSync(fnDir)) {
    const files = fs.readdirSync(fnDir) as string[];
    for (const file of files) {
      if (file.endsWith('.d.ts') && !tsconfig.include.includes(file)) {
        tsconfig.include.push(file);
      }
    }
  }

  return JSON.stringify(tsconfig, null, 2) + '\n';
}

function processTemplateFile(
  fileName: string,
  templateContent: string,
  manifest: FunctionManifest,
  fnDir: string
): string {
  switch (fileName) {
    case 'package.json':
      return processPackageJson(templateContent, manifest);
    case 'tsconfig.json':
      return processTsconfig(templateContent, fnDir);
    default:
      return replacePlaceholders(templateContent, manifest);
  }
}

// --- Utilities ---

function writeIfChanged(filePath: string, content: string): boolean {
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf-8');
    if (existing === content) return false;
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  return true;
}

function ensureSymlink(target: string, linkPath: string): boolean {
  const linkDir = path.dirname(linkPath);
  const relTarget = path.relative(linkDir, target);

  try {
    const existing = fs.readlinkSync(linkPath);
    if (existing === relTarget) return false;
    fs.unlinkSync(linkPath);
  } catch {
    // Not a symlink or doesn't exist - remove if it's a regular file
    try { fs.unlinkSync(linkPath); } catch { /* doesn't exist */ }
  }

  fs.symlinkSync(relTarget, linkPath);
  return true;
}

// --- Skaffold & kustomize overlay generation ---

const K8S_NAMESPACE = 'constructive-functions';

interface FunctionInfo {
  name: string;
  dir: string;
  port: number;
}

function generateJobServicePatch(fn: FunctionInfo): void {
  const overlayDir = path.join(GENERATED_DIR, fn.dir, 'k8s', 'skaffold-overlay');
  if (!fs.existsSync(overlayDir)) {
    fs.mkdirSync(overlayDir, { recursive: true });
  }

  const gatewayMap: Record<string, string> = {};
  gatewayMap[fn.name] = `http://${fn.name}.${K8S_NAMESPACE}.svc.cluster.local`;

  const kustomization = [
    'apiVersion: kustomize.config.k8s.io/v1beta1',
    'kind: Kustomization',
    'resources:',
    '  - ../../../../k8s/overlays/local-simple',
    'patches:',
    '  - path: job-service-patch.yaml',
    '',
  ].join('\n');

  const patch = [
    'apiVersion: apps/v1',
    'kind: Deployment',
    'metadata:',
    '  name: knative-job-service',
    'spec:',
    '  template:',
    '    spec:',
    '      containers:',
    '        - name: knative-job-service',
    '          env:',
    '            - name: JOBS_SUPPORTED',
    `              value: "${fn.name}"`,
    '            - name: INTERNAL_GATEWAY_URL',
    `              value: "http://${fn.name}.${K8S_NAMESPACE}.svc.cluster.local"`,
    '            - name: INTERNAL_GATEWAY_DEVELOPMENT_MAP',
    `              value: '${JSON.stringify(gatewayMap)}'`,
    '',
  ].join('\n');

  writeIfChanged(path.join(overlayDir, 'kustomization.yaml'), kustomization);
  writeIfChanged(path.join(overlayDir, 'job-service-patch.yaml'), patch);
}

function generateSkaffoldYaml(fns: FunctionInfo[]): void {
  const buildBlock = [
    '    build:',
    '      artifacts:',
    '        - image: constructive-functions',
    '          context: .',
    '          docker:',
    '            dockerfile: Dockerfile.dev',
    '          sync:',
    '            manual:',
    "              - src: 'functions/**/*.ts'",
    '                dest: /usr/src/app',
    '      local:',
    '        push: false',
  ].join('\n');

  const sharedPortForwards = [
    '      - resourceType: service',
    '        resourceName: knative-job-service',
    `        namespace: ${K8S_NAMESPACE}`,
    '        port: 8080',
    '        localPort: 8080',
    '      - resourceType: service',
    '        resourceName: postgres',
    `        namespace: ${K8S_NAMESPACE}`,
    '        port: 5432',
    '        localPort: 5432',
    '      - resourceType: service',
    '        resourceName: constructive-server',
    `        namespace: ${K8S_NAMESPACE}`,
    '        port: 3000',
    '        localPort: 3002',
  ].join('\n');

  // Per-function profiles
  const perFnProfiles: string[] = [];
  for (const fn of fns) {
    perFnProfiles.push([
      `  - name: ${fn.name}`,
      buildBlock,
      '    manifests:',
      '      kustomize:',
      '        paths:',
      `          - generated/${fn.dir}/k8s/skaffold-overlay`,
      '      rawYaml:',
      `        - generated/${fn.dir}/k8s/local-deployment.yaml`,
      '    deploy:',
      '      kubectl:',
      `        defaultNamespace: ${K8S_NAMESPACE}`,
      '    portForward:',
      '      - resourceType: service',
      `        resourceName: ${fn.name}`,
      `        namespace: ${K8S_NAMESPACE}`,
      '        port: 80',
      `        localPort: ${fn.port}`,
      sharedPortForwards,
    ].join('\n'));
  }

  // local-simple: all functions
  const allRawYaml = fns
    .map((fn) => `        - generated/${fn.dir}/k8s/local-deployment.yaml`)
    .join('\n');
  const allFnPortForwards = fns
    .map((fn) => [
      '      - resourceType: service',
      `        resourceName: ${fn.name}`,
      `        namespace: ${K8S_NAMESPACE}`,
      '        port: 80',
      `        localPort: ${fn.port}`,
    ].join('\n'))
    .join('\n');

  const localSimpleProfile = [
    '  # All functions together.',
    '  - name: local-simple',
    buildBlock,
    '    manifests:',
    '      kustomize:',
    '        paths:',
    '          - k8s/overlays/local-simple',
    '      rawYaml:',
    allRawYaml,
    '    deploy:',
    '      kubectl:',
    `        defaultNamespace: ${K8S_NAMESPACE}`,
    '    portForward:',
    allFnPortForwards,
    sharedPortForwards,
  ].join('\n');

  // local (Knative): no rawYaml, uses kustomize overlay
  const localKnativeProfile = [
    '  # Full Knative setup — requires `cd k8s && make operators-knative-only` first.',
    '  - name: local',
    buildBlock,
    '    manifests:',
    '      kustomize:',
    '        paths:',
    '          - k8s/overlays/local',
    '    portForward:',
    allFnPortForwards,
    sharedPortForwards,
  ].join('\n');

  const skaffold = [
    '# AUTO-GENERATED by scripts/generate.ts — do not edit manually.',
    '# To add a function, create functions/<name>/handler.json and run `pnpm generate`.',
    'apiVersion: skaffold/v4beta11',
    'kind: Config',
    'metadata:',
    '  name: constructive-functions',
    '',
    'profiles:',
    '  # Per-function profiles (infra + single function).',
    ...perFnProfiles.map((p) => p),
    '',
    localSimpleProfile,
    '',
    localKnativeProfile,
    '',
  ].join('\n');

  const skaffoldPath = path.join(ROOT, 'skaffold.yaml');
  if (writeIfChanged(skaffoldPath, skaffold)) {
    console.log('  Updated skaffold.yaml');
  }
}

function generateJobServiceYaml(fns: FunctionInfo[]): void {
  const jobsSupported = fns.map((fn) => fn.name).join(',');
  const gatewayMap: Record<string, string> = {};
  for (const fn of fns) {
    gatewayMap[fn.name] = `http://${fn.name}.${K8S_NAMESPACE}.svc.cluster.local`;
  }

  const yaml = [
    '# AUTO-GENERATED by scripts/generate.ts — do not edit manually.',
    '# To add a function, create functions/<name>/handler.json and run `pnpm generate`.',
    'apiVersion: apps/v1',
    'kind: Deployment',
    'metadata:',
    '  name: knative-job-service',
    '  labels:',
    '    app: knative-job-service',
    'spec:',
    '  replicas: 1',
    '  selector:',
    '    matchLabels:',
    '      app: knative-job-service',
    '  template:',
    '    metadata:',
    '      labels:',
    '        app: knative-job-service',
    '    spec:',
    '      containers:',
    '        - name: knative-job-service',
    '          image: constructive-functions:local',
    '          command: ["node"]',
    '          args: ["job/service/dist/run.js"]',
    '          envFrom:',
    '            - configMapRef:',
    '                name: constructive',
    '            - secretRef:',
    '                name: pg-credentials',
    '          env:',
    '            - name: NODE_ENV',
    '              value: "development"',
    '            - name: JOBS_SCHEMA',
    '              value: "app_jobs"',
    '            - name: INTERNAL_JOBS_CALLBACK_PORT',
    '              value: "8080"',
    '            - name: INTERNAL_JOBS_CALLBACK_URL',
    `              value: "http://knative-job-service.${K8S_NAMESPACE}.svc.cluster.local:8080"`,
    '            - name: JOBS_SUPPORT_ANY',
    '              value: "false"',
    '            - name: JOBS_SUPPORTED',
    `              value: "${jobsSupported}"`,
    '            - name: JOBS_CALLBACK_HOST',
    `              value: "knative-job-service.${K8S_NAMESPACE}.svc.cluster.local"`,
    '            - name: JOBS_CALLBACK_BASE_URL',
    `              value: "http://knative-job-service.${K8S_NAMESPACE}.svc.cluster.local:8080/callback"`,
    '            - name: KNATIVE_SERVICE_URL',
    `              value: "${K8S_NAMESPACE}.svc.cluster.local"`,
    '            - name: INTERNAL_GATEWAY_URL',
    `              value: "http://${fns[0]?.name || 'unknown'}.${K8S_NAMESPACE}.svc.cluster.local"`,
    '            - name: INTERNAL_GATEWAY_DEVELOPMENT_MAP',
    `              value: '${JSON.stringify(gatewayMap)}'`,
    '            - name: HOSTNAME',
    '              valueFrom:',
    '                fieldRef:',
    '                  fieldPath: metadata.name',
    '          ports:',
    '            - containerPort: 8080',
    '              name: jobs-http',
    '          resources:',
    '            requests:',
    '              memory: "128Mi"',
    '              cpu: "100m"',
    '            limits:',
    '              memory: "512Mi"',
    '              cpu: "500m"',
    '---',
    'apiVersion: v1',
    'kind: Service',
    'metadata:',
    '  name: knative-job-service',
    '  labels:',
    '    app: knative-job-service',
    'spec:',
    '  type: ClusterIP',
    '  selector:',
    '    app: knative-job-service',
    '  ports:',
    '    - name: jobs-http',
    '      port: 8080',
    '      targetPort: jobs-http',
    '',
  ].join('\n');

  const jobServicePath = path.join(ROOT, 'k8s', 'overlays', 'local-simple', 'job-service.yaml');
  if (writeIfChanged(jobServicePath, yaml)) {
    console.log('  Updated k8s/overlays/local-simple/job-service.yaml');
  }
}

// --- Main ---

function main(): void {
  const functions = findFunctions();

  if (functions.length === 0) {
    console.log('No functions with handler.json found.');
    return;
  }

  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }

  console.log(`Found ${functions.length} function(s): ${functions.join(', ')}`);

  for (const fnName of functions) {
    const fnDir = path.join(FUNCTIONS_DIR, fnName);
    const genDir = path.join(GENERATED_DIR, fnName);
    const manifest = readManifest(fnDir);
    const templateDir = resolveTemplateDir(manifest);

    if (!fs.existsSync(genDir)) {
      fs.mkdirSync(genDir, { recursive: true });
    }

    console.log(`  Generating ${fnName} (template: ${manifest.type || DEFAULT_TEMPLATE})...`);

    // Walk all template files and copy/process them
    const templateFiles = walkTemplateFiles(templateDir);
    for (const relPath of templateFiles) {
      const templateFile = path.join(templateDir, relPath);
      const outputFile = path.join(genDir, relPath);

      // Ensure subdirectories exist (e.g., k8s/)
      const outputDir = path.dirname(outputFile);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const templateContent = fs.readFileSync(templateFile, 'utf-8');
      const baseName = path.basename(relPath);
      const processed = processTemplateFile(baseName, templateContent, manifest, fnDir);
      const changed = writeIfChanged(outputFile, processed);
      if (changed) console.log(`    - ${relPath}`);
    }

    // Symlink handler.ts
    const handlerTarget = path.join(fnDir, 'handler.ts');
    if (fs.existsSync(handlerTarget)) {
      const linked = ensureSymlink(handlerTarget, path.join(genDir, 'handler.ts'));
      if (linked) console.log(`    - handler.ts -> functions/${fnName}/handler.ts`);
    }

    // Symlink any .d.ts files
    const files = fs.readdirSync(fnDir) as string[];
    for (const file of files) {
      if (file.endsWith('.d.ts')) {
        const target = path.join(fnDir, file);
        const linked = ensureSymlink(target, path.join(genDir, file));
        if (linked) console.log(`    - ${file} -> functions/${fnName}/${file}`);
      }
    }
  }

  // --- Write functions manifest ---
  const allManifests: FunctionManifest[] = [];
  for (const fnName of functions) {
    const fnDir = path.join(FUNCTIONS_DIR, fnName);
    allManifests.push(readManifest(fnDir));
  }

  // Auto-assign ports for functions that don't have one
  const usedPorts = new Set(allManifests.filter((m) => m.port).map((m) => m.port!));
  let nextPort = usedPorts.size > 0 ? Math.max(...usedPorts) + 1 : 8081;
  for (const m of allManifests) {
    if (!m.port) {
      while (usedPorts.has(nextPort)) nextPort++;
      m.port = nextPort;
      usedPorts.add(nextPort);
      nextPort++;
    }
  }

  const manifestData = {
    functions: allManifests.map((m) => ({
      name: m.name,
      dir: functions[allManifests.indexOf(m)],
      port: m.port,
    })),
  };

  const manifestPath = path.join(GENERATED_DIR, 'functions-manifest.json');
  const manifestContent = JSON.stringify(manifestData, null, 2) + '\n';
  if (writeIfChanged(manifestPath, manifestContent)) {
    console.log('  Updated generated/functions-manifest.json');
  }

  // --- Generate skaffold, kustomize overlays, and job-service config ---
  // Only when generating all functions (not --only mode)
  if (!onlyName) {
    const fnInfos: FunctionInfo[] = manifestData.functions as FunctionInfo[];

    for (const fn of fnInfos) {
      generateJobServicePatch(fn);
    }
    console.log('  Generated per-function kustomize overlays');

    generateSkaffoldYaml(fnInfos);
    generateJobServiceYaml(fnInfos);
  }

  console.log('Done.');
}

main();
