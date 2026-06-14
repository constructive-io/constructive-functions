import type { GraphQLClient } from 'graphql-request';

export type FunctionHandler<P = unknown, R = unknown> = (
  params: P,
  context: FunctionContext
) => Promise<R> | R;

export type FunctionLogger = {
  info: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
};

// ─── Agent Context (LLM inference via agentic server) ─────────────────────

export type InferenceOptions = {
  messages: Array<{ role: 'user' | 'system' | 'assistant'; content: string }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
};

export type InferenceResult = {
  content: string;
  finishReason: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

export type EmbedResult = {
  embeddings: number[][];
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
};

export type AgentContext = {
  /** Fully typed inference call — metered, logged, quota-checked by the agentic server */
  inference(options: InferenceOptions): Promise<InferenceResult>;

  /** Generate embeddings — metered by the agentic server */
  embed(input: string | string[], model?: string): Promise<EmbedResult>;

  /** Database ID from job context (set server-side, unforgeable) */
  readonly databaseId: string | undefined;

  /** Entity ID from job context (set server-side, unforgeable) */
  readonly entityId: string | undefined;
};

// ─── Storage Context (S3/MinIO operations) ───────────────────────────────

export type StorageContext = {
  /** Read an object from S3/MinIO. Returns the body as a Buffer. */
  read(bucket: string, key: string): Promise<Buffer>;

  /** Write (put) an object to S3/MinIO. */
  write(bucket: string, key: string, body: Buffer | Uint8Array | string): Promise<void>;

  /** Delete an object from S3/MinIO. */
  delete(bucket: string, key: string): Promise<void>;
};

// ─── Function Context ─────────────────────────────────────────────────────

export type FunctionContext = {
  job: {
    jobId?: string;
    workerId?: string;
    databaseId?: string;
    actorId?: string;
    entityId?: string;
    /** Present when this function is running as a graph node */
    executionId?: string;
    /** Present when this function is running as a graph node */
    nodeName?: string;
  };
  client: GraphQLClient;
  meta: GraphQLClient;
  agent: AgentContext;
  storage: StorageContext;
  log: FunctionLogger;
  env: Record<string, string | undefined>;
};

export type ServerOptions = {
  name?: string;
};
