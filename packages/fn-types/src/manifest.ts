export interface Port {
  name: string;
  type: string;
  schema?: Record<string, unknown>;
  description?: string;
  optional?: boolean;
  multi?: boolean;
}

export interface NodeDefinition {
  context: string;
  name: string;
  category?: string;
  inputs?: Port[];
  outputs?: Port[];
  description?: string;
  icon?: string;
  volatile?: boolean;
}

export interface HandlerManifest {
  name: string;
  version: string;
  description?: string;
  /** Template type. Defaults to 'node-graphql'. */
  type?: string;
  /** HTTP port the function listens on. Auto-assigned if omitted. */
  port?: number;
  /**
   * Task identifier used by the job worker to dispatch this function
   * (e.g. "email:send_verification_link"). Defaults to `name` when omitted.
   */
  taskIdentifier?: string;
  /** FBP scope: 'platform' or 'org'. Defaults to 'platform'. */
  scope?: string;
  /** Typed input ports — keys of `params` this function reads. */
  inputs?: Port[];
  /** Typed output ports — keys of the return object this function produces. */
  outputs?: Port[];
  /** Extra dependencies merged into the generated package's package.json. */
  dependencies?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Convert a handler.json manifest into an FBP NodeDefinition.
 * Functions without explicit inputs/outputs get default payload/result ports.
 */
export function toNodeDefinition(
  manifest: HandlerManifest,
  context?: string
): NodeDefinition {
  const defaultInputs: Port[] = [{ name: 'payload', type: 'json' }];
  const defaultOutputs: Port[] = [{ name: 'result', type: 'json' }];

  return {
    context: context ?? manifest.scope ?? 'function',
    name: manifest.taskIdentifier ?? manifest.name,
    description: manifest.description,
    inputs: manifest.inputs ?? defaultInputs,
    outputs: manifest.outputs ?? defaultOutputs,
    volatile: manifest['volatile'] === true ? true : undefined,
  };
}
