import * as fs from 'fs';
import type { HandlerManifest } from '@constructive-io/fn-types';

/**
 * Replace the three universal placeholders. No escaping; passes special
 * characters through verbatim (matches the legacy generator).
 */
export const replacePlaceholders = (
  content: string,
  manifest: HandlerManifest
): string =>
  content
    .replace(/\{\{name\}\}/g, manifest.name)
    .replace(/\{\{version\}\}/g, manifest.version)
    .replace(/\{\{description\}\}/g, manifest.description || '');

/**
 * Generic key/value placeholder renderer (used for k8s/skaffold templates that
 * have non-standard keys like `{{namespace}}`, `{{port}}`).
 */
export const renderTemplate = (
  template: string,
  vars: Record<string, string>
): string => {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
};

/**
 * Apply placeholder replacement, then shallow-merge `manifest.dependencies`
 * into the template's `dependencies` (handler keys win on conflict).
 * `devDependencies` and other fields are passed through untouched.
 */
export const processPackageJson = (
  templateContent: string,
  manifest: HandlerManifest
): string => {
  const pkg = JSON.parse(replacePlaceholders(templateContent, manifest));

  if (manifest.dependencies) {
    pkg.dependencies = {
      ...(pkg.dependencies || {}),
      ...manifest.dependencies,
    };
  }

  return JSON.stringify(pkg, null, 2) + '\n';
};

/**
 * Append any `.d.ts` files found in `fnDir` to the template's `include` array
 * (in `fs.readdirSync()` order). Existing entries are not duplicated.
 */
export const processTsconfig = (
  templateContent: string,
  fnDir: string
): string => {
  const tsconfig = JSON.parse(templateContent);

  if (fs.existsSync(fnDir)) {
    const files = fs.readdirSync(fnDir);
    for (const file of files) {
      if (file.endsWith('.d.ts') && !tsconfig.include.includes(file)) {
        tsconfig.include.push(file);
      }
    }
  }

  return JSON.stringify(tsconfig, null, 2) + '\n';
};

/** Route a template file to its specific processor based on basename. */
export const processTemplateFile = (
  fileName: string,
  templateContent: string,
  manifest: HandlerManifest,
  fnDir: string
): string => {
  switch (fileName) {
    case 'package.json':
      return processPackageJson(templateContent, manifest);
    case 'tsconfig.json':
      return processTsconfig(templateContent, fnDir);
    default:
      return replacePlaceholders(templateContent, manifest);
  }
};
