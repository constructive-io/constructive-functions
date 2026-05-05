export { FnGenerator } from './generator';
export type {
  ApplyResult,
  FnGeneratorOptions,
  FunctionInfo,
  GenerateOptions,
  Manifest,
} from './types';
export { findFunctions, readManifest, computeFunctionInfos } from './discovery';
export {
  replacePlaceholders,
  renderTemplate,
  processPackageJson,
  processTsconfig,
  processTemplateFile,
} from './placeholders';
export { walkTemplateFiles, writeIfChanged, ensureSymlink } from './fs-utils';
