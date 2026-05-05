import * as fs from 'fs';
import * as path from 'path';
import { FnGenerator } from '../src';

/**
 * Regression test: run FnGenerator against the brasilia repo's own
 * `functions/` and `templates/`, output to a temp dir, and assert it
 * is byte-identical to the brasilia repo's checked-in `generated/`
 * (which is produced by the legacy `scripts/generate.ts`).
 */

const ROOT = path.resolve(__dirname, '..', '..', '..');
const FUNCTIONS_DIR = path.join(ROOT, 'functions');
const TEMPLATES_DIR = path.join(ROOT, 'templates');
const BASELINE_GENERATED = path.join(ROOT, 'generated');
const BASELINE_SKAFFOLD = path.join(ROOT, 'skaffold.yaml');

const walk = (dir: string): { files: string[]; symlinks: string[] } => {
  const files: string[] = [];
  const symlinks: string[] = [];
  const recurse = (current: string, base: string): void => {
    const entries = fs.readdirSync(current);
    for (const entry of entries) {
      // Skip pnpm-installed dirs that aren't generator output.
      if (entry === 'node_modules' || entry === 'dist') continue;
      const full = path.join(current, entry);
      const rel = base ? path.join(base, entry) : entry;
      const stat = fs.lstatSync(full);
      if (stat.isSymbolicLink()) {
        symlinks.push(rel);
      } else if (stat.isDirectory()) {
        recurse(full, rel);
      } else {
        files.push(rel);
      }
    }
  };
  recurse(dir, '');
  return { files, symlinks };
};

describe('FnGenerator snapshot vs scripts/generate.ts', () => {
  let tmpDir: string;
  let tmpRoot: string;

  beforeAll(() => {
    // The generator writes skaffold.yaml at the rootDir, so we mirror the
    // brasilia layout into a tmp tree (functions/, templates/ symlinked to
    // the real ones; outputDir in tmpDir; rootDir = tmpRoot).
    tmpRoot = fs.mkdtempSync(path.join(require('os').tmpdir(), 'fn-gen-test-'));
    tmpDir = path.join(tmpRoot, 'generated');

    fs.symlinkSync(FUNCTIONS_DIR, path.join(tmpRoot, 'functions'));
    fs.symlinkSync(TEMPLATES_DIR, path.join(tmpRoot, 'templates'));

    const gen = new FnGenerator({ rootDir: tmpRoot });
    gen.generate();
  });

  afterAll(() => {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it('produces the same files (byte-identical)', () => {
    const baseline = walk(BASELINE_GENERATED);
    const actual = walk(tmpDir);
    expect([...actual.files].sort()).toEqual([...baseline.files].sort());
    for (const rel of baseline.files) {
      const a = fs.readFileSync(path.join(tmpDir, rel), 'utf-8');
      const b = fs.readFileSync(path.join(BASELINE_GENERATED, rel), 'utf-8');
      expect({ file: rel, content: a }).toEqual({ file: rel, content: b });
    }
  });

  it('produces the same symlinks (same relative target)', () => {
    const baseline = walk(BASELINE_GENERATED);
    const actual = walk(tmpDir);
    expect([...actual.symlinks].sort()).toEqual([...baseline.symlinks].sort());
    for (const rel of baseline.symlinks) {
      const a = fs.readlinkSync(path.join(tmpDir, rel));
      const b = fs.readlinkSync(path.join(BASELINE_GENERATED, rel));
      expect({ symlink: rel, target: a }).toEqual({ symlink: rel, target: b });
    }
  });

  it('produces an identical skaffold.yaml', () => {
    const a = fs.readFileSync(path.join(tmpRoot, 'skaffold.yaml'), 'utf-8');
    const b = fs.readFileSync(BASELINE_SKAFFOLD, 'utf-8');
    expect(a).toBe(b);
  });
});
