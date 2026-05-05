import * as fs from 'fs';
import * as path from 'path';

/**
 * Recursively walk `dir` and return relative paths of all files (not
 * directories), in `fs.readdirSync()` order — which is filesystem-dependent
 * and intentionally NOT sorted, to match the legacy generator byte-for-byte.
 */
export const walkTemplateFiles = (dir: string, base = ''): string[] => {
  const results: string[] = [];
  const entries = fs.readdirSync(dir);
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
};

/**
 * Write `content` to `filePath` only if the existing file's contents differ.
 * Returns true if a write occurred.
 */
export const writeIfChanged = (filePath: string, content: string): boolean => {
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf-8');
    if (existing === content) return false;
  }
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
  return true;
};

/**
 * Ensure a relative symlink at `linkPath` points at `target`. Returns true if
 * the link was created or refreshed.
 */
export const ensureSymlink = (target: string, linkPath: string): boolean => {
  const linkDir = path.dirname(linkPath);
  if (!fs.existsSync(linkDir)) fs.mkdirSync(linkDir, { recursive: true });
  const relTarget = path.relative(linkDir, target);

  try {
    const existing = fs.readlinkSync(linkPath);
    if (existing === relTarget) return false;
    fs.unlinkSync(linkPath);
  } catch {
    try {
      fs.unlinkSync(linkPath);
    } catch {
      /* doesn't exist */
    }
  }

  fs.symlinkSync(relTarget, linkPath);
  return true;
};
