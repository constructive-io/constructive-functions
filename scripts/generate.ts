// generate: reads functions/*/handler.json and generates workspace
// packages into generated/<name>/ with symlinks back to handler source.
//
// Runs during preinstall via Node's native type stripping (--experimental-strip-types).
// No compilation or external dependencies needed.

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const ROOT: string = process.cwd();
const FUNCTIONS_DIR: string = path.resolve(ROOT, 'functions');
const GENERATED_DIR: string = path.resolve(ROOT, 'generated');

interface FunctionManifest {
  name: string;
  version: string;
  description?: string;
  dependencies?: Record<string, string>;
}

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
    });
}

function readManifest(fnDir: string): FunctionManifest {
  const manifestPath = path.join(fnDir, 'handler.json');
  const raw = fs.readFileSync(manifestPath, 'utf-8');
  return JSON.parse(raw);
}

function generatePackageJson(manifest: FunctionManifest): string {
  const pkg = {
    name: `@constructive-io/${manifest.name}-fn`,
    version: manifest.version,
    description: manifest.description || '',
    private: true,
    main: 'dist/index.js',
    scripts: {
      build: 'tsc -p tsconfig.json',
      clean: 'rimraf dist'
    },
    dependencies: {
      '@constructive-io/fn-runtime': 'workspace:^',
      ...(manifest.dependencies || {})
    },
    devDependencies: {
      '@types/node': '^22.10.4',
      typescript: '^5.1.6'
    }
  };

  return JSON.stringify(pkg, null, 2) + '\n';
}

function generateTsconfig(fnName: string, fnDir: string): string {
  const include = ['index.ts', 'handler.ts'];

  // Include any .d.ts files (they'll be symlinked)
  if (fs.existsSync(fnDir)) {
    const files = fs.readdirSync(fnDir);
    for (const file of files) {
      if (file.endsWith('.d.ts')) {
        include.push(file);
      }
    }
  }

  const tsconfig = {
    extends: '../../tsconfig.json',
    compilerOptions: {
      outDir: 'dist',
      rootDir: '.'
    },
    include,
    exclude: ['dist', 'node_modules']
  };

  return JSON.stringify(tsconfig, null, 2) + '\n';
}

function generateEntryPoint(manifest: FunctionManifest): string {
  return `import { createFunctionServer } from '@constructive-io/fn-runtime';
import handler from './handler';

const app = createFunctionServer(handler, { name: ${JSON.stringify(manifest.name)} });

export default app;

if (require.main === module) {
  app.listen(Number(process.env.PORT || 8080));
}
`;
}

function writeIfChanged(filePath: string, content: string): boolean {
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf-8');
    if (existing === content) return false;
  }
  fs.writeFileSync(filePath, content, 'utf-8');
  return true;
}

function ensureSymlink(target: string, linkPath: string): boolean {
  // Compute relative target from linkPath's directory
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

function main(): void {
  const functions = findFunctions();

  if (functions.length === 0) {
    console.log('No functions with handler.json found.');
    return;
  }

  // Ensure generated/ directory exists
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }

  console.log(`Found ${functions.length} function(s): ${functions.join(', ')}`);

  for (const fnName of functions) {
    const fnDir = path.join(FUNCTIONS_DIR, fnName);
    const genDir = path.join(GENERATED_DIR, fnName);
    const manifest = readManifest(fnDir);

    // Ensure generated/<name>/ exists
    if (!fs.existsSync(genDir)) {
      fs.mkdirSync(genDir, { recursive: true });
    }

    console.log(`  Generating ${fnName}...`);

    // Write package.json
    const pkgChanged = writeIfChanged(
      path.join(genDir, 'package.json'),
      generatePackageJson(manifest)
    );
    if (pkgChanged) console.log(`    - package.json`);

    // Write tsconfig.json
    const tsconfigChanged = writeIfChanged(
      path.join(genDir, 'tsconfig.json'),
      generateTsconfig(fnName, fnDir)
    );
    if (tsconfigChanged) console.log(`    - tsconfig.json`);

    // Write index.ts entry point
    const entryChanged = writeIfChanged(
      path.join(genDir, 'index.ts'),
      generateEntryPoint(manifest)
    );
    if (entryChanged) console.log(`    - index.ts`);

    // Symlink handler.ts
    const handlerTarget = path.join(fnDir, 'handler.ts');
    if (fs.existsSync(handlerTarget)) {
      const linked = ensureSymlink(handlerTarget, path.join(genDir, 'handler.ts'));
      if (linked) console.log(`    - handler.ts -> functions/${fnName}/handler.ts`);
    }

    // Symlink any .d.ts files
    const files = fs.readdirSync(fnDir);
    for (const file of files) {
      if (file.endsWith('.d.ts')) {
        const target = path.join(fnDir, file);
        const linked = ensureSymlink(target, path.join(genDir, file));
        if (linked) console.log(`    - ${file} -> functions/${fnName}/${file}`);
      }
    }
  }

  console.log('Done.');
}

main();
