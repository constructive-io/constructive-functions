export interface HandlerManifest {
  name: string;
  version: string;
  description?: string;
  /** Template type. Defaults to 'node-graphql'. */
  type?: string;
  /** HTTP port the function listens on. Auto-assigned if omitted. */
  port?: number;
  /** Extra dependencies merged into the generated package's package.json. */
  dependencies?: Record<string, string>;
  [key: string]: unknown;
}
