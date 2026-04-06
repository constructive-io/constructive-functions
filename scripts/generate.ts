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

  console.log('Done.');
}

main();
