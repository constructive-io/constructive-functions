import * as fs from 'fs';
import * as path from 'path';
import { walkTemplateFiles } from '../fs-utils';
import { processTemplateFile } from '../placeholders';
import type { FunctionInfo, Manifest } from '../types';

/**
 * Build all manifests for a single function:
 *   - per-template files (placeholders applied, package.json/tsconfig.json processed)
 *   - shared template files (same processing)
 *   - symlinks for handler.{ts,py}, *.d.ts, and any other *.py
 *
 * `templateDir` is the resolved type-specific dir (`templates/node-graphql/` etc.).
 */
export const buildPackageManifests = (
  fn: FunctionInfo,
  args: {
    fnDir: string;          // absolute: <functionsDir>/<dir>
    genDir: string;         // absolute: <outputDir>/<dir>
    templateDir: string;    // absolute: <templatesDir>/<type>
    sharedDir?: string;     // absolute: <templatesDir>/shared (if present)
  }
): Manifest[] => {
  const out: Manifest[] = [];

  // 1. Per-template files
  const templateFiles = walkTemplateFiles(args.templateDir);
  for (const relPath of templateFiles) {
    const templateFile = path.join(args.templateDir, relPath);
    const outputFile = path.join(args.genDir, relPath);
    const templateContent = fs.readFileSync(templateFile, 'utf-8');
    const baseName = path.basename(relPath);
    const processed = processTemplateFile(baseName, templateContent, fn.manifest, args.fnDir);
    out.push({ kind: 'file', path: outputFile, content: processed });
  }

  // 2. Shared template files
  if (args.sharedDir && fs.existsSync(args.sharedDir)) {
    const sharedFiles = walkTemplateFiles(args.sharedDir);
    for (const relPath of sharedFiles) {
      const templateFile = path.join(args.sharedDir, relPath);
      const outputFile = path.join(args.genDir, relPath);
      const templateContent = fs.readFileSync(templateFile, 'utf-8');
      const baseName = path.basename(relPath);
      const processed = processTemplateFile(baseName, templateContent, fn.manifest, args.fnDir);
      out.push({ kind: 'file', path: outputFile, content: processed });
    }
  }

  // 3. Handler symlink (handler.ts wins; handler.py only if no handler.ts)
  const handlerTs = path.join(args.fnDir, 'handler.ts');
  const handlerPy = path.join(args.fnDir, 'handler.py');
  if (fs.existsSync(handlerTs)) {
    out.push({ kind: 'symlink', path: path.join(args.genDir, 'handler.ts'), target: handlerTs });
  } else if (fs.existsSync(handlerPy)) {
    out.push({ kind: 'symlink', path: path.join(args.genDir, 'handler.py'), target: handlerPy });
  }

  // 4. Auxiliary symlinks: all *.d.ts and *.py (except handler.py already linked above)
  const files = fs.readdirSync(args.fnDir);
  for (const file of files) {
    if (file.endsWith('.d.ts') || (file.endsWith('.py') && file !== 'handler.py')) {
      out.push({
        kind: 'symlink',
        path: path.join(args.genDir, file),
        target: path.join(args.fnDir, file),
      });
    }
  }

  return out;
};
