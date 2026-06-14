import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { GraphEditor, NodeIcon, nextNodeName } from '@fbp/graph-editor';
import type { NodeExecutionInfo } from '@fbp/graph-editor';
import { evaluate } from '@fbp/evaluator';
import {
  mathDefinitions,
  coreDefinitions,
  uiDefinitions,
  netDefinitions,
  graphInputDef,
  graphOutputDef,
  graphPropDef,
} from '@fbp/evaluator';
import type { NodeDefinitionWithImpl } from '@fbp/evaluator';
import type { Graph, NodeDefinition, Node } from '@fbp/types';
import { compute } from '@constructive-functions/constructive-functions-hooks';
import { RefreshCw, Save, Trash2, Plus, Play, Zap, ChevronDown, ChevronRight, Cloud, Server, Download, Upload, Eye, EyeOff, X, AlertTriangle } from 'lucide-react';

const DATABASE_ID = '00000000-0000-0000-0000-000000000000';
const BOUNDARY_NAMES = ['graph/input', 'graph/output', 'graph/prop'];
const EXECUTION_POLL_MS = 1500;

type NodeState = 'pending' | 'queued' | 'running' | 'completed' | 'failed';

interface InvocationDetail {
  id: string;
  taskIdentifier: string;
  status: string;
  durationMs: number | null;
  error: string | null;
  result: unknown;
  payload: unknown;
  createdAt: string;
}

type ExecutionState = {
  executionId: string;
  status: 'running' | 'completed' | 'failed' | 'unknown';
  nodeStates: Record<string, NodeState>;
  nodeDetails: Record<string, NodeExecutionInfo>;
  invocations: Record<string, InvocationDetail>;
  output?: unknown;
  error?: string;
};

interface FunctionRequirement {
  name?: string;
  required?: boolean;
}

interface PortDef {
  name: string;
  type: string;
  description?: string;
  optional?: boolean;
  multi?: boolean;
  schema?: Record<string, unknown>;
}

interface PropDef {
  name: string;
  type: string;
  default?: unknown;
  description?: string;
  required?: boolean;
  schema?: Record<string, unknown>;
}

type FunctionNode = {
  name?: string | null;
  taskIdentifier?: string | null;
  serviceUrl?: string | null;
  isInvocable?: boolean | null;
  isBuiltIn?: boolean | null;
  scope?: string | null;
  description?: string | null;
  requiredSecrets?: FunctionRequirement[] | null;
  requiredConfigs?: FunctionRequirement[] | null;
  inputs?: PortDef[] | null;
  outputs?: PortDef[] | null;
  props?: PropDef[] | null;
  volatile?: boolean | null;
  icon?: string | null;
  category?: string | null;
  runtime?: string | null;
};

interface StoreEntry {
  id: string;
  name: string;
  hash?: string | null;
}


function platformFnToDefinition(fn: FunctionNode): NodeDefinition {
  const inputs = fn.inputs
    ? fn.inputs.map(p => ({ name: p.name, type: p.type, description: p.description, optional: p.optional }))
    : [];
  const outputs = (fn.outputs && fn.outputs.length > 0)
    ? fn.outputs.map(p => ({ name: p.name, type: p.type, description: p.description }))
    : [{ name: 'result', type: 'json' }];
  return {
    context: fn.scope || 'platform',
    name: fn.taskIdentifier || fn.name || '',
    category: fn.category || 'functions',
    description: fn.description || undefined,
    inputs,
    outputs,
    props: fn.props?.map(p => ({ name: p.name, type: p.type, default: p.default, description: p.description, required: p.required })),
    icon: fn.icon || (fn.isInvocable ? 'zap' : 'circle'),
  };
}

function functionToNode(fn: FunctionNode, position: { x: number; y: number }, existingNames: string[]): Node {
  const nodeType = fn.taskIdentifier || fn.name || '';
  return {
    name: nextNodeName(nodeType, existingNames),
    type: nodeType,
    meta: position,
    props: [
      { name: 'secretsCount', type: 'number', value: ((fn.requiredSecrets ?? []) as FunctionRequirement[]).length || 0 },
      { name: 'configsCount', type: 'number', value: ((fn.requiredConfigs ?? []) as FunctionRequirement[]).length || 0 },
      { name: 'scope', type: 'string', value: fn.scope || 'platform' },
    ],
  };
}

function definitionToNode(def: NodeDefinition, position: { x: number; y: number }, existingNames: string[]): Node {
  return {
    name: nextNodeName(def.name, existingNames),
    type: def.name,
    meta: position,
  };
}

const MOCK_FUNCTIONS: FunctionNode[] = [
  {
    name: 'send-email', taskIdentifier: 'send-email', serviceUrl: '', isInvocable: true, isBuiltIn: true,
    scope: 'platform', description: 'Sends transactional emails via Mailgun or SMTP',
    requiredSecrets: [{ name: 'MAILGUN_API_KEY', required: false }],
    requiredConfigs: [{ name: 'SMTP_HOST', required: false }],
    inputs: [
      { name: 'to', type: 'string', description: 'Recipient email address' },
      { name: 'subject', type: 'string', description: 'Email subject line' },
      { name: 'html', type: 'string', description: 'HTML body content', optional: true },
      { name: 'text', type: 'string', description: 'Plain text body content', optional: true },
      { name: 'from', type: 'string', description: 'Sender email address', optional: true },
      { name: 'replyTo', type: 'string', description: 'Reply-to email address', optional: true },
    ],
    outputs: [{ name: 'result', type: 'json', description: 'Send result with status and message ID' }],
    volatile: true, icon: 'mail', category: 'email',
  },
  // ─── Inline nodes (run in-process, no HTTP) ────────────────────────
  {
    name: 'math/add', taskIdentifier: 'math/add', isInvocable: true, isBuiltIn: true,
    scope: 'platform', description: 'Adds two numbers', runtime: 'inline',
    inputs: [{ name: 'a', type: 'number' }, { name: 'b', type: 'number' }],
    outputs: [{ name: 'sum', type: 'number' }],
    icon: 'plus', category: 'math',
  },
  {
    name: 'math/multiply', taskIdentifier: 'math/multiply', isInvocable: true, isBuiltIn: true,
    scope: 'platform', description: 'Multiplies two numbers', runtime: 'inline',
    inputs: [{ name: 'a', type: 'number' }, { name: 'b', type: 'number' }],
    outputs: [{ name: 'product', type: 'number' }],
    icon: 'x', category: 'math',
  },
  {
    name: 'math/subtract', taskIdentifier: 'math/subtract', isInvocable: true, isBuiltIn: true,
    scope: 'platform', description: 'Subtracts b from a', runtime: 'inline',
    inputs: [{ name: 'a', type: 'number' }, { name: 'b', type: 'number' }],
    outputs: [{ name: 'difference', type: 'number' }],
    icon: 'minus', category: 'math',
  },
  {
    name: 'const/number', taskIdentifier: 'const/number', isInvocable: true, isBuiltIn: true,
    scope: 'platform', description: 'Emit a constant number', runtime: 'inline',
    outputs: [{ name: 'value', type: 'number' }],
    props: [{ name: 'value', type: 'number', default: 0 }],
    icon: 'hash', category: 'const',
  },
  {
    name: 'const/string', taskIdentifier: 'const/string', isInvocable: true, isBuiltIn: true,
    scope: 'platform', description: 'Emit a constant string', runtime: 'inline',
    outputs: [{ name: 'value', type: 'string' }],
    props: [{ name: 'value', type: 'string', default: '' }],
    icon: 'type', category: 'const',
  },
  {
    name: 'const/boolean', taskIdentifier: 'const/boolean', isInvocable: true, isBuiltIn: true,
    scope: 'platform', description: 'Emit a constant boolean', runtime: 'inline',
    outputs: [{ name: 'value', type: 'boolean' }],
    props: [{ name: 'value', type: 'boolean', default: false }],
    icon: 'toggle', category: 'const',
  },
  {
    name: 'json/select', taskIdentifier: 'json/select', isInvocable: true, isBuiltIn: true,
    scope: 'platform', description: 'Extract a value from JSON by dot-path', runtime: 'inline',
    inputs: [{ name: 'obj', type: 'json' }],
    outputs: [{ name: 'value', type: 'any' }],
    props: [{ name: 'path', type: 'string', default: '' }],
    icon: 'filter', category: 'json',
  },
  {
    name: 'json/merge', taskIdentifier: 'json/merge', isInvocable: true, isBuiltIn: true,
    scope: 'platform', description: 'Merge two JSON objects', runtime: 'inline',
    inputs: [{ name: 'a', type: 'json' }, { name: 'b', type: 'json' }],
    outputs: [{ name: 'value', type: 'json' }],
    icon: 'git-merge', category: 'json',
  },
  {
    name: 'json/object', taskIdentifier: 'json/object', isInvocable: true, isBuiltIn: true,
    scope: 'platform', description: 'Wrap all inputs into a JSON object', runtime: 'inline',
    inputs: [{ name: 'value', type: 'any' }],
    outputs: [{ name: 'value', type: 'json' }],
    icon: 'braces', category: 'json',
  },
  {
    name: 'json/split', taskIdentifier: 'json/split', isInvocable: true, isBuiltIn: true,
    scope: 'platform', description: 'Split a JSON object by key list', runtime: 'inline',
    inputs: [{ name: 'obj', type: 'json' }],
    outputs: [{ name: 'selected', type: 'json' }, { name: 'rest', type: 'json' }],
    props: [{ name: 'keys', type: 'json', default: [] }],
    icon: 'scissors', category: 'json',
  },
  {
    name: 'string/template', taskIdentifier: 'string/template', isInvocable: true, isBuiltIn: true,
    scope: 'platform', description: 'Build a string from a {{placeholder}} template', runtime: 'inline',
    outputs: [{ name: 'value', type: 'string' }],
    props: [{ name: 'template', type: 'string', default: '' }],
    icon: 'quote', category: 'string',
  },
  {
    name: 'flow/guard', taskIdentifier: 'flow/guard', isInvocable: true, isBuiltIn: true,
    scope: 'platform', description: 'Stop the flow if a condition fails', runtime: 'inline',
    inputs: [{ name: 'ok', type: 'boolean' }, { name: 'error', type: 'json', optional: true }],
    outputs: [{ name: 'pass', type: 'signal' }, { name: 'fail', type: 'signal' }, { name: 'error', type: 'json' }],
    icon: 'shield', category: 'flow',
  },
  {
    name: 'coerce', taskIdentifier: 'coerce', isInvocable: true, isBuiltIn: true,
    scope: 'platform', description: 'Convert a value to a different type', runtime: 'inline',
    inputs: [{ name: 'value', type: 'any' }],
    outputs: [{ name: 'value', type: 'any' }],
    props: [{ name: 'type', type: 'string', default: 'string' }],
    icon: 'repeat', category: 'flow',
  },
];

const DEFAULT_GRAPH: Graph = {
  name: 'untitled',
  nodes: [],
  edges: [],
};

const CATEGORY_ORDER = ['email', 'data', 'network', 'custom', 'functions', 'graph', 'const', 'math', 'json', 'flow', 'string', 'layout', 'form', 'content', 'graphql'];
const CATEGORY_LABELS: Record<string, string> = {
  email: 'Email',
  data: 'Data',
  network: 'Network',
  custom: 'Custom',
  functions: 'Functions',
  graph: 'Graph I/O',
  const: 'Constants',
  math: 'Math',
  json: 'JSON',
  flow: 'Flow Control',
  string: 'String',
  layout: 'Layout',
  form: 'Form',
  content: 'Content',
  graphql: 'GraphQL',
};

const FUNCTION_FIELDS = {
  id: true,
  name: true,
  taskIdentifier: true,
  serviceUrl: true,
  isInvocable: true,
  isBuiltIn: true,
  scope: true,
  description: true,
  inputs: true,
  outputs: true,
  props: true,
  volatile: true,
  icon: true,
  category: true,
  runtime: true,
} as const;

const STORE_FIELDS = { id: true, name: true, hash: true } as const;

// ─── SDK ORM helper ──────────────────────────────────────────────────────

function orm() {
  return compute.getClient();
}

async function rawMutation(document: string, variables: Record<string, unknown>) {
  const res = await fetch('/graphql/compute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: document, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`GraphQL Error: ${json.errors.map((e: any) => e.message).join(', ')}`);
  }
  return json.data;
}

async function loadGraphFromStore(storeId: string): Promise<{ graph: Graph; commitId: string | null } | null> {
  // Get the 'main' ref for this store
  const refResult = await orm().platformFunctionGraphRef.findMany({
    select: { id: true, commitId: true, storeId: true },
    where: { storeId: { equalTo: storeId } },
    first: 1,
  }).unwrap();
  const ref = refResult?.platformFunctionGraphRefs?.nodes?.[0];
  if (!ref?.commitId) return loadGraphFromImport(storeId);

  // Get the commit
  const commitResult = await orm().platformFunctionGraphCommit.findMany({
    select: { id: true, treeId: true, message: true, parentIds: true },
    where: { id: { equalTo: ref.commitId } },
    first: 1,
  }).unwrap();
  const commit = commitResult?.platformFunctionGraphCommits?.nodes?.[0];
  if (!commit?.treeId) return loadGraphFromImport(storeId);

  // Get the object (tree)
  const objResult = await orm().platformFunctionGraphObject.findMany({
    select: { id: true, data: true },
    where: { id: { equalTo: commit.treeId } },
    first: 1,
  }).unwrap();
  const obj = objResult?.platformFunctionGraphObjects?.nodes?.[0];
  if (!obj?.data) return loadGraphFromImport(storeId);

  return { graph: obj.data as unknown as Graph, commitId: ref.commitId };
}

async function loadGraphFromImport(storeId: string): Promise<{ graph: Graph; commitId: string | null } | null> {
  // Find the platform_function_graphs entry that uses this store
  const graphResult = await orm().platformFunctionGraph.findMany({
    select: { id: true, storeId: true, name: true, context: true },
    where: { storeId: { equalTo: storeId } },
    first: 1,
  }).unwrap();
  const graphRow = graphResult?.platformFunctionGraphs?.nodes?.[0];
  if (!graphRow?.id) return null;

  // Read the full graph using the SQL deserialization function
  const readResult = await orm().query.platformReadFunctionGraph(
    { graphId: graphRow.id },
  ).unwrap();
  const graphJson = readResult?.platformReadFunctionGraph;
  if (!graphJson) return null;

  // Strip the SQL execution context — it's for the graph engine, not the local evaluator
  const parsed = graphJson as Record<string, unknown>;
  if (parsed.context === 'function') delete parsed.context;

  return { graph: parsed as unknown as Graph, commitId: null };
}

async function saveGraphToStore(
  storeId: string,
  graph: Graph,
  parentCommitId: string | null
): Promise<{ commitId: string; objectId: string }> {
  // Create object (content-addressed blob)
  let objectId: string;
  try {
    const objResult = await orm().platformFunctionGraphObject.create({
      data: { id: crypto.randomUUID(), databaseId: DATABASE_ID, data: graph as unknown as Record<string, unknown> },
      select: { id: true },
    }).unwrap();
    objectId = objResult.createPlatformFunctionGraphObject.platformFunctionGraphObject.id;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('duplicate key') || msg.includes('unique constraint')) {
      const refResult = await orm().platformFunctionGraphRef.findMany({
        select: { id: true, commitId: true },
        where: { storeId: { equalTo: storeId } },
        first: 1,
      }).unwrap();
      const existingRef = refResult?.platformFunctionGraphRefs?.nodes?.[0];
      if (existingRef?.commitId) return { commitId: existingRef.commitId, objectId: '' };
      throw err;
    }
    throw err;
  }

  // Create commit pointing to the object
  const commitResult = await orm().platformFunctionGraphCommit.create({
    data: { databaseId: DATABASE_ID, storeId, treeId: objectId, message: `Save: ${graph.name || 'untitled'}`, parentIds: parentCommitId ? [parentCommitId] : [] },
    select: { id: true },
  }).unwrap();
  const commitId = commitResult.createPlatformFunctionGraphCommit.platformFunctionGraphCommit.id;

  // Upsert ref: find existing 'main' ref, update or create
  const refResult = await orm().platformFunctionGraphRef.findMany({
    select: { id: true },
    where: { storeId: { equalTo: storeId } },
    first: 1,
  }).unwrap();
  const existingRef = refResult?.platformFunctionGraphRefs?.nodes?.[0];

  if (existingRef) {
    // ORM update/delete for partitioned tables omits databaseId from the
    // GraphQL input, but the mutation requires it. Use raw mutation.
    await rawMutation(
      `mutation($input: UpdatePlatformFunctionGraphRefInput!) {
        updatePlatformFunctionGraphRef(input: $input) { platformFunctionGraphRef { id } }
      }`,
      { input: { id: existingRef.id, databaseId: DATABASE_ID, platformFunctionGraphRefPatch: { commitId } } }
    );
  } else {
    await orm().platformFunctionGraphRef.create({
      data: { databaseId: DATABASE_ID, storeId, name: 'main', commitId },
      select: { id: true },
    }).unwrap();
  }

  return { commitId, objectId };
}

async function createStore(name: string): Promise<StoreEntry> {
  const result = await orm().platformFunctionGraphStore.create({
    data: { databaseId: DATABASE_ID, name },
    select: { id: true, name: true, hash: true },
  }).unwrap();
  return result.createPlatformFunctionGraphStore.platformFunctionGraphStore;
}

async function deleteStore(id: string): Promise<void> {
  // Raw mutation — partitioned table delete requires databaseId in the input
  await rawMutation(
    `mutation($input: DeletePlatformFunctionGraphStoreInput!) {
      deletePlatformFunctionGraphStore(input: $input) { platformFunctionGraphStore { id } }
    }`,
    { input: { id, databaseId: DATABASE_ID } }
  );
}

// ─── Graph execution helpers ────────────────────────────────────────────

async function importAndExecuteGraph(
  graph: Graph,
  inputPayload: Record<string, unknown> = {},
  outputNode: string | null = null,
  outputPort: string | null = null,
): Promise<{ graphId: string; executionId: string }> {
  const importResult = await orm().mutation.platformImportGraphJson(
    { input: { databaseId: DATABASE_ID, name: graph.name || 'untitled', graphJson: graph as unknown as Record<string, unknown>, context: graph.context || 'function' } },
    { select: { result: true } },
  ).unwrap();
  const graphId = importResult.platformImportGraphJson!.result;

  const execInput: Record<string, unknown> = { graphId, inputPayload };
  if (outputNode) execInput.outputNode = outputNode;
  if (outputPort) execInput.outputPort = outputPort;

  const execResult = await orm().mutation.platformStartExecution(
    { input: execInput as any },
    { select: { result: true } },
  ).unwrap();
  const executionId = execResult.platformStartExecution!.result;

  return { graphId, executionId };
}

async function pollExecutionStatus(executionId: string): Promise<{
  status: string;
  nodeStates: Record<string, NodeState>;
  nodeDetails: Record<string, NodeExecutionInfo>;
  invocations: Record<string, InvocationDetail>;
  output?: unknown;
  error?: string;
}> {
  // Query node_states via SDK (table is in public schema)
  let nsRows: Array<{
    node_name: string;
    status: string;
    node_path: string[] | null;
    started_at: string | null;
    completed_at: string | null;
    duration_ms: number | null;
  }> = [];
  try {
    const nsResult = await orm().platformFunctionGraphExecutionNodeState.findMany({
      select: { nodeName: true, status: true, nodePath: true, startedAt: true, completedAt: true },
      where: { executionId: { equalTo: executionId } },
      orderBy: ['CREATED_AT_ASC'],
    }).unwrap();
    const gqlNodes = nsResult?.platformFunctionGraphExecutionNodeStates?.nodes ?? [];
    nsRows = gqlNodes.map((n: any) => ({
      node_name: n.nodeName,
      status: n.status,
      node_path: n.nodePath,
      started_at: n.startedAt,
      completed_at: n.completedAt,
      duration_ms: n.startedAt
        ? (new Date(n.completedAt || Date.now()).getTime() - new Date(n.startedAt).getTime())
        : null,
    }));
  } catch (err) {
    console.error('[pollExecutionStatus] node_states query failed:', err);
  }

  // Also query invocations for detailed payload/result data
  let invocationsArr: any[] = [];
  try {
    const invResult = await orm().platformFunctionInvocation.findMany({
      select: { id: true, taskIdentifier: true, status: true, durationMs: true, error: true, result: true, createdAt: true, startedAt: true, completedAt: true, graphExecutionId: true, payload: true },
      where: { graphExecutionId: { equalTo: executionId } },
      orderBy: ['CREATED_AT_ASC'],
    }).unwrap();
    invocationsArr = invResult?.platformFunctionInvocations?.nodes ?? [];
  } catch (err) {
    console.error('[pollExecutionStatus] invocations query failed:', err);
  }

  const nodeStates: Record<string, NodeState> = {};
  const nodeDetails: Record<string, NodeExecutionInfo> = {};
  const invocations: Record<string, InvocationDetail> = {};
  let hasRunning = false;
  let hasFailed = false;
  let hasQueued = false;

  // Primary source: node_states table (has all states including queued)
  for (const row of nsRows) {
    const s = row.status;
    let state: NodeState;
    if (s === 'completed') state = 'completed';
    else if (s === 'failed') { state = 'failed'; hasFailed = true; }
    else if (s === 'queued') { state = 'queued'; hasQueued = true; }
    else if (s === 'running') { state = 'running'; hasRunning = true; }
    else { state = 'running'; hasRunning = true; }
    nodeStates[row.node_name] = state;

    nodeDetails[row.node_name] = {
      state,
      durationMs: row.duration_ms != null ? Math.round(row.duration_ms) : undefined,
      startedAt: row.started_at ?? undefined,
      completedAt: row.completed_at ?? undefined,
    };
  }

  // Supplement with invocation details (payload, result, error)
  for (const inv of invocationsArr) {
    const nodeName = inv.payload?.node_name;
    if (!nodeName) continue;

    invocations[nodeName] = {
      id: inv.id,
      taskIdentifier: inv.taskIdentifier,
      status: inv.status,
      durationMs: inv.durationMs,
      error: inv.error,
      result: inv.result,
      payload: inv.payload,
      createdAt: inv.createdAt,
    };

    // Invocation error takes precedence for detail
    if (inv.error && nodeDetails[nodeName]) {
      nodeDetails[nodeName].error = inv.error;
    }
  }

  const overallStatus = hasFailed ? 'failed'
    : (hasRunning || hasQueued) ? 'running'
    : (nsRows.length > 0 ? 'completed' : 'running');
  return { status: overallStatus, nodeStates, nodeDetails, invocations };
}

// ─── Component ──────────────────────────────────────────────────────────

export function FlowsPanel() {
  const { data, isLoading } = compute.usePlatformFunctionDefinitionsQuery({
    selection: { fields: FUNCTION_FIELDS },
  });

  const { data: storesData, isLoading: storesLoading, refetch: refetchStores, error: storesError } = compute.usePlatformFunctionGraphStoresQuery({
    selection: { fields: STORE_FIELDS },
  });

  const apiFunctions = data?.platformFunctionDefinitions?.nodes ?? [];
  const functions: FunctionNode[] = apiFunctions.length > 0 ? apiFunctions : MOCK_FUNCTIONS;
  const loading = isLoading;

  const stores: StoreEntry[] = (storesData?.platformFunctionGraphStores?.nodes ?? []) as StoreEntry[];

  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  const [activeCommitId, setActiveCommitId] = useState<string | null>(null);
  const [flowName, setFlowName] = useState('');
  const [currentGraph, setCurrentGraph] = useState<Graph>(DEFAULT_GRAPH);
  const [evaluationResult, setEvaluationResult] = useState<unknown>(undefined);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingFlow, setIsLoadingFlow] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [autoSave, setAutoSave] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [executionState, setExecutionState] = useState<ExecutionState | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showExecutionOverlay, setShowExecutionOverlay] = useState(true);
  const [inspectedNode, setInspectedNode] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didAutoLoad = useRef(false);

  const graphRef = useRef<Graph>(currentGraph);
  graphRef.current = currentGraph;

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Load a flow from a store
  const handleLoadStore = useCallback(async (store: StoreEntry) => {
    setActiveStoreId(store.id);
    setFlowName(store.name);
    setIsLoadingFlow(true);
    setEvaluationResult(undefined);
    try {
      const result = await loadGraphFromStore(store.id);
      if (result) {
        setCurrentGraph(result.graph);
        setActiveCommitId(result.commitId);
      } else {
        setCurrentGraph({ ...DEFAULT_GRAPH, name: store.name });
        setActiveCommitId(null);
      }
    } catch (err: any) {
      console.error('Failed to load flow:', err);
      setCurrentGraph({ ...DEFAULT_GRAPH, name: store.name });
      setActiveCommitId(null);
    } finally {
      setIsLoadingFlow(false);
    }
  }, []);

  // Auto-load first store only on initial mount
  useEffect(() => {
    if (stores.length > 0 && !didAutoLoad.current) {
      didAutoLoad.current = true;
      handleLoadStore(stores[0]);
    }
  }, [stores, handleLoadStore]);

  const definitions: NodeDefinition[] = useMemo(() => {
    const platformDefs = functions.map(platformFnToDefinition);
    const platformNames = new Set(platformDefs.map(d => d.name));
    const evaluatorDefs = [
      ...mathDefinitions,
      ...coreDefinitions,
      ...uiDefinitions,
      ...netDefinitions,
    ]
      .filter(d => !platformNames.has(d.name))
      .map(({ impl, ...rest }) => rest as NodeDefinition);
    return [...platformDefs, ...evaluatorDefs];
  }, [functions]);

  const implDefinitions: NodeDefinitionWithImpl[] = useMemo(() => [
    ...mathDefinitions,
    ...coreDefinitions,
    ...uiDefinitions,
    ...netDefinitions,
    graphInputDef,
    graphOutputDef,
    graphPropDef,
    ...functions.map((fn): NodeDefinitionWithImpl => ({
      ...platformFnToDefinition(fn),
      impl: async (inputs) => {
        return { result: inputs.payload ?? inputs };
      },
    })),
  ], [functions]);

  const groupedDefinitions = useMemo(() => {
    const groups: Record<string, { def: NodeDefinition; fn?: FunctionNode }[]> = {};
    const fnMap = new Map(functions.map(f => [f.taskIdentifier || f.name || '', f]));

    for (const def of definitions) {
      const cat = def.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push({ def, fn: fnMap.get(def.name) });
    }
    return groups;
  }, [definitions, functions]);

  const orderedCategories = useMemo(() => {
    const result: string[] = [];
    for (const cat of CATEGORY_ORDER) {
      if (groupedDefinitions[cat]) result.push(cat);
    }
    for (const cat of Object.keys(groupedDefinitions)) {
      if (!result.includes(cat)) result.push(cat);
    }
    return result;
  }, [groupedDefinitions]);

  const handleGraphChange = useCallback((graph: Graph) => {
    setCurrentGraph(graph);
  }, []);


  const handleEvaluate = useCallback(async () => {
    const graph = graphRef.current;
    if (!graph.nodes.length) return;

    setIsEvaluating(true);
    try {
      const outputNode = graph.nodes.find(n => n.type === 'graphOutput');
      if (!outputNode) {
        setEvaluationResult({ error: 'No graphOutput node found. Add one to see results.' });
        return;
      }

      // Set context to 'js' for local evaluation (definitions use context: 'js')
      const evalGraph = { ...graph, context: 'js' };
      const result = await evaluate(evalGraph, {
        definitions: implDefinitions,
        outputNode: outputNode.name,
        outputPort: 'value',
      });
      setEvaluationResult(result);
    } catch (err: any) {
      setEvaluationResult({ error: err.message });
    } finally {
      setIsEvaluating(false);
    }
  }, [implDefinitions]);

  const handleExecute = useCallback(async () => {
    const graph = { ...graphRef.current, name: flowName.trim() || 'untitled' };
    if (!graph.nodes.length) return;

    setIsExecuting(true);
    setExecutionState(null);
    if (pollRef.current) clearInterval(pollRef.current);

    try {
      // Build input payload from graphInput nodes' props
      const inputPayload: Record<string, unknown> = {};
      for (const node of graph.nodes) {
        if (node.type === 'graphInput') {
          const portNameProp = (node.props ?? []).find(p => p.name === 'portName');
          const valueProp = (node.props ?? []).find(p => p.name === 'value');
          if (portNameProp?.value && valueProp?.value !== undefined) {
            inputPayload[String(portNameProp.value)] = valueProp.value;
          }
        }
      }

      // Auto-detect output node — use first graphOutput if present, otherwise omit
      const outputNode = graph.nodes.find(n => n.type === 'graphOutput');
      const { executionId } = await importAndExecuteGraph(
        graph,
        inputPayload,
        outputNode?.name ?? null,
        outputNode ? 'value' : null,
      );

      // Initialize node states — mark all non-boundary nodes as pending
      const initialNodeStates: Record<string, NodeState> = {};
      const initialDetails: Record<string, NodeExecutionInfo> = {};
      for (const node of graph.nodes) {
        if (!['graphInput', 'graphOutput', 'graphProp'].includes(node.type)) {
          initialNodeStates[node.name] = 'pending';
          initialDetails[node.name] = { state: 'pending' };
        }
      }

      setExecutionState({
        executionId,
        status: 'running',
        nodeStates: initialNodeStates,
        nodeDetails: initialDetails,
        invocations: {},
      });
      setShowExecutionOverlay(true);
      setInspectedNode(null);

      // Start polling for execution status
      pollRef.current = setInterval(async () => {
        try {
          const pollResult = await pollExecutionStatus(executionId);
          setExecutionState(prev => {
            if (!prev || prev.executionId !== executionId) return prev;
            const merged: Record<string, NodeState> = { ...prev.nodeStates };
            const mergedDetails: Record<string, NodeExecutionInfo> = { ...prev.nodeDetails };
            const mergedInvocations: Record<string, InvocationDetail> = { ...prev.invocations };
            for (const [name, state] of Object.entries(pollResult.nodeStates)) {
              merged[name] = state;
            }
            for (const [name, detail] of Object.entries(pollResult.nodeDetails)) {
              mergedDetails[name] = detail;
            }
            for (const [name, inv] of Object.entries(pollResult.invocations)) {
              mergedInvocations[name] = inv;
            }
            return {
              ...prev,
              nodeStates: merged,
              nodeDetails: mergedDetails,
              invocations: mergedInvocations,
              status: pollResult.status as ExecutionState['status'],
              output: pollResult.output,
              error: pollResult.error,
            };
          });

          // Stop polling when execution completes or fails
          if (pollResult.status === 'completed' || pollResult.status === 'failed') {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
            setIsExecuting(false);
          }
        } catch (pollErr) {
          console.error('[execution-poll] transient error:', pollErr);
        }
      }, EXECUTION_POLL_MS);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setExecutionState({ executionId: '', status: 'failed', nodeStates: {}, nodeDetails: {}, invocations: {}, error: msg });
      setIsExecuting(false);
    }
  }, [flowName]);

  const handleSave = useCallback(async () => {
    const name = flowName.trim() || `Flow ${stores.length + 1}`;
    const graph = { ...graphRef.current, name };
    setIsSaving(true);
    setSaveStatus(null);

    try {
      let storeId = activeStoreId;

      // Create a new store if none is active
      if (!storeId) {
        const store = await createStore(name);
        storeId = store.id;
        setActiveStoreId(storeId);
      }

      const { commitId } = await saveGraphToStore(storeId, graph, activeCommitId);
      setActiveCommitId(commitId);
      setFlowName(name);
      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(null), 2000);
      refetchStores();
    } catch (err: any) {
      console.error('Failed to save flow:', err);
      setSaveStatus(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [flowName, stores.length, activeStoreId, activeCommitId, refetchStores]);

  // Auto-save: debounce 1s after each graph edit
  useEffect(() => {
    if (!autoSave || !activeStoreId) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave();
    }, 1000);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [currentGraph, autoSave, activeStoreId, handleSave]);

  const handleNew = useCallback(() => {
    setCurrentGraph({ ...DEFAULT_GRAPH, name: '' });
    setFlowName('');
    setActiveStoreId(null);
    setActiveCommitId(null);
    setEvaluationResult(undefined);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!activeStoreId) return;
    try {
      await deleteStore(activeStoreId);
      refetchStores();
      handleNew();
    } catch (err: any) {
      console.error('Failed to delete store:', err);
    }
  }, [activeStoreId, refetchStores, handleNew]);

  const handleAddNode = useCallback((def: NodeDefinition, fn?: FunctionNode) => {
    const position = { x: 300 + Math.random() * 200, y: 100 + Math.random() * 200 };
    setCurrentGraph(prev => {
      const existingNames = prev.nodes.map(n => n.name);
      const node = fn
        ? functionToNode(fn, position, existingNames)
        : definitionToNode(def, position, existingNames);
      return { ...prev, nodes: [...prev.nodes, node] };
    });
  }, []);

  const handleLoadAll = useCallback(() => {
    setCurrentGraph(prev => {
      const existingNames = prev.nodes.map(n => n.name);
      const newNodes = functions.map((fn, i) => {
        const node = functionToNode(fn, { x: 300, y: 50 + i * 200 }, existingNames);
        existingNames.push(node.name);
        return node;
      });
      return { ...prev, nodes: [...prev.nodes, ...newNodes] };
    });
  }, [functions]);

  const handleDragStart = useCallback((e: React.DragEvent, def: NodeDefinition) => {
    e.dataTransfer.setData('application/fbp-node', JSON.stringify({
      definitionName: def.name,
      isBoundary: BOUNDARY_NAMES.includes(def.name),
    }));
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleExportGraph = useCallback(() => {
    const graph = graphRef.current;
    const blob = new Blob([JSON.stringify(graph, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${flowName.trim() || 'graph'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [flowName]);

  const handleImportGraph = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const graph = JSON.parse(text) as Graph;
        setCurrentGraph(graph);
        if (graph.name) setFlowName(graph.name);
      } catch (err) {
        console.error('Failed to import graph:', err);
      }
    };
    input.click();
  }, []);

  const toggleCategory = useCallback((cat: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }, []);

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Top bar: flow name + save */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 flex-shrink-0" style={{ marginLeft: '18rem' }}>
        <input
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          placeholder="Flow name..."
          className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-600 w-56"
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-green-600 hover:bg-green-500 text-white transition-colors disabled:opacity-50"
        >
          {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
          {isSaving ? 'Saving...' : 'Save'}
        </button>
        <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoSave}
            onChange={(e) => setAutoSave(e.target.checked)}
            className="accent-green-500 w-3.5 h-3.5"
          />
          Auto
        </label>
        <button
          onClick={handleEvaluate}
          disabled={isEvaluating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
        >
          <Play size={14} />
          {isEvaluating ? 'Running...' : 'Evaluate'}
        </button>
        <button
          onClick={handleExecute}
          disabled={isExecuting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50"
          title="Execute graph on the server via compute-worker"
        >
          {isExecuting ? <RefreshCw size={14} className="animate-spin" /> : <Server size={14} />}
          {isExecuting ? 'Executing...' : 'Execute'}
        </button>
        {executionState && (
          <button
            onClick={() => { setShowExecutionOverlay(v => !v); if (!showExecutionOverlay) setInspectedNode(null); }}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-sm transition-colors ${
              showExecutionOverlay ? 'text-yellow-400 bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
            title={showExecutionOverlay ? 'Hide execution overlay' : 'Show execution overlay'}
          >
            {showExecutionOverlay ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
        )}
        {activeStoreId && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-sm text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
        <button
          onClick={handleExportGraph}
          className="flex items-center gap-1 px-2 py-1.5 rounded-md text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          title="Export graph as JSON"
        >
          <Download size={14} />
        </button>
        <button
          onClick={handleImportGraph}
          className="flex items-center gap-1 px-2 py-1.5 rounded-md text-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          title="Import graph from JSON"
        >
          <Upload size={14} />
        </button>
        {saveStatus && (
          <span className={`text-xs ${saveStatus.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
            {saveStatus}
          </span>
        )}
        {activeStoreId && (
          <span className="flex items-center gap-1 text-xs text-zinc-600 ml-auto">
            <Cloud size={12} />
            stored in DB
          </span>
        )}
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Unified left sidebar: FLOWS + NODES */}
        <div className="w-72 border-r border-zinc-800 flex flex-col bg-zinc-950 flex-shrink-0">
          {/* FLOWS section */}
          <div className="p-3 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Flows</h3>
              {(loading || storesLoading || isLoadingFlow) && <RefreshCw size={12} className="animate-spin text-zinc-500" />}
            </div>
            <div className="space-y-0.5 mb-2">
              {stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => handleLoadStore(store)}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-sm truncate transition-colors flex items-center gap-2 ${
                    activeStoreId === store.id
                      ? 'bg-zinc-800 text-zinc-200'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <Cloud size={12} className="flex-shrink-0 text-zinc-600" />
                  {store.name}
                </button>
              ))}
              {stores.length === 0 && (!storesLoading || storesError) && (
                <div className="px-3 py-2">
                  {storesError && <p className="text-xs text-red-500 mb-1">{(storesError as any)?.message || 'Failed to load stores'}</p>}
                  <p className="text-xs text-zinc-600 mb-2">No stores yet</p>
                  <button
                    onClick={async () => {
                      const name = flowName.trim() || 'default';
                      try {
                        const store = await createStore(name);
                        setActiveStoreId(store.id);
                        setFlowName(name);
                        refetchStores();
                      } catch (err: any) {
                        console.error('Failed to create store:', err);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors w-full justify-center"
                  >
                    <Plus size={12} />
                    Create Store
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={handleNew}
              className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Plus size={14} />
              New Flow
            </button>
          </div>

          {/* NODES section — unified palette */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 py-2 border-b border-zinc-800 sticky top-0 bg-zinc-950 z-10">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nodes</h3>
              <p className="text-[10px] text-zinc-600 mt-0.5">Click or drag onto canvas</p>
            </div>

            <div className="p-2 space-y-1">
              {orderedCategories.map(cat => {
                const items = groupedDefinitions[cat];
                const isCollapsed = collapsedCategories.has(cat);
                const isFunction = cat === 'functions';

                return (
                  <div key={cat}>
                    {/* Category header */}
                    <button
                      onClick={() => toggleCategory(cat)}
                      className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[10px] uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {isCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                      {CATEGORY_LABELS[cat] || cat}
                      <span className="text-zinc-700 ml-auto">{items.length}</span>
                    </button>

                    {/* Category items */}
                    {!isCollapsed && (
                      <div className="space-y-0.5 mb-2">
                        {items.map(({ def, fn }) => (
                          <button
                            key={`${def.context}:${def.name}`}
                            onClick={() => handleAddNode(def, fn)}
                            draggable
                            onDragStart={(e) => handleDragStart(e, def)}
                            title={fn?.description || def.description || ''}
                            className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-zinc-800/70 transition-colors cursor-grab active:cursor-grabbing"
                          >
                            <div className="flex items-center gap-2">
                              {def.icon ? (
                                <NodeIcon icon={def.icon} size={14} className={fn?.runtime === 'inline' ? 'text-amber-500 flex-shrink-0' : isFunction ? 'text-cyan-400 flex-shrink-0' : 'text-zinc-500 flex-shrink-0'} />
                              ) : (
                                <Zap size={14} className={isFunction ? 'text-cyan-400 flex-shrink-0' : 'text-zinc-500 flex-shrink-0'} />
                              )}
                              <span className="text-sm text-zinc-300 truncate">
                                {def.name.split('/').pop()}
                              </span>
                              {fn?.runtime === 'inline' ? (
                                <span className="ml-auto px-1.5 py-0.5 text-[9px] font-medium rounded bg-amber-900/40 text-amber-400 flex-shrink-0" title="Runs in-process on the compute worker">inline</span>
                              ) : isFunction ? (
                                <span className="ml-auto px-1.5 py-0.5 text-[9px] font-medium rounded bg-cyan-900/40 text-cyan-400 flex-shrink-0" title="Dispatched via HTTP to a function service">http</span>
                              ) : null}
                            </div>
                          </button>
                        ))}
                        {isFunction && functions.length > 0 && (
                          <button
                            onClick={handleLoadAll}
                            className="w-full text-center text-[10px] text-zinc-600 hover:text-zinc-400 py-1 transition-colors"
                          >
                            Load all to canvas
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Execution state */}
          {executionState && (
            <div className="p-3 border-t border-zinc-800 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Execution
                  <span className={`ml-2 inline-block w-2 h-2 rounded-full ${
                    executionState.status === 'running' ? 'bg-yellow-400 animate-pulse' :
                    executionState.status === 'completed' ? 'bg-green-400' :
                    executionState.status === 'failed' ? 'bg-red-400' : 'bg-zinc-400'
                  }`} />
                </h4>
                <button
                  onClick={() => { setExecutionState(null); setInspectedNode(null); }}
                  className="text-zinc-600 hover:text-zinc-400 transition-colors"
                  title="Clear execution state"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="space-y-0.5 mb-2">
                {Object.entries(executionState.nodeStates).map(([name, state]) => {
                  const detail = executionState.nodeDetails[name];
                  const isInspected = inspectedNode === name;
                  return (
                    <button
                      key={name}
                      onClick={() => setInspectedNode(isInspected ? null : name)}
                      className={`w-full flex items-center gap-2 text-xs px-1.5 py-1 rounded transition-colors text-left ${
                        isInspected ? 'bg-zinc-800 ring-1 ring-zinc-700' : 'hover:bg-zinc-800/50'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        state === 'completed' ? 'bg-green-400' :
                        state === 'failed' ? 'bg-red-400' :
                        state === 'running' ? 'bg-yellow-400 animate-pulse' :
                        state === 'queued' ? 'bg-purple-400' : 'bg-zinc-600'
                      }`} />
                      <span className="text-zinc-400 truncate flex-1">{name}</span>
                      {detail?.durationMs !== undefined && (
                        <span className="text-[10px] text-zinc-500 flex-shrink-0">
                          {detail.durationMs < 1000 ? `${detail.durationMs}ms` : `${(detail.durationMs / 1000).toFixed(1)}s`}
                        </span>
                      )}
                      <span className={`text-[10px] flex-shrink-0 ${
                        state === 'completed' ? 'text-green-400' :
                        state === 'failed' ? 'text-red-400' :
                        state === 'running' ? 'text-yellow-400' :
                        state === 'queued' ? 'text-purple-400' : 'text-zinc-600'
                      }`}>{state}</span>
                    </button>
                  );
                })}
              </div>

              {/* Node detail panel */}
              {inspectedNode && executionState.invocations[inspectedNode] && (() => {
                const inv = executionState.invocations[inspectedNode];
                return (
                  <div className="bg-zinc-900 rounded-md p-2 mb-2 space-y-2 border border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-300">{inspectedNode}</span>
                      <button onClick={() => setInspectedNode(null)} className="text-zinc-600 hover:text-zinc-400">
                        <X size={10} />
                      </button>
                    </div>
                    <div className="text-[10px] text-zinc-500 space-y-0.5">
                      <div>Type: <span className="text-zinc-400">{inv.taskIdentifier}</span></div>
                      <div>Status: <span className={inv.status === 'failed' ? 'text-red-400' : 'text-green-400'}>{inv.status}</span></div>
                      {inv.durationMs != null && <div>Duration: <span className="text-zinc-400">{inv.durationMs}ms</span></div>}
                    </div>
                    {inv.error && (
                      <div>
                        <div className="flex items-center gap-1 text-[10px] text-red-400 mb-0.5">
                          <AlertTriangle size={10} /> Error
                        </div>
                        <pre className="text-[10px] text-red-300 bg-zinc-950 rounded p-1.5 overflow-x-auto whitespace-pre-wrap break-all max-h-20 overflow-y-auto">
                          {typeof inv.error === 'string' ? inv.error : JSON.stringify(inv.error, null, 2)}
                        </pre>
                      </div>
                    )}
                    {inv.payload && (
                      <div>
                        <div className="text-[10px] text-zinc-500 mb-0.5">Input Payload</div>
                        <pre className="text-[10px] text-zinc-400 bg-zinc-950 rounded p-1.5 overflow-x-auto whitespace-pre-wrap break-all max-h-20 overflow-y-auto">
                          {JSON.stringify((inv.payload as Record<string, unknown>)?.inputs ?? inv.payload, null, 2)}
                        </pre>
                      </div>
                    )}
                    {inv.result && (
                      <div>
                        <div className="text-[10px] text-zinc-500 mb-0.5">Result</div>
                        <pre className="text-[10px] text-zinc-300 bg-zinc-950 rounded p-1.5 overflow-x-auto whitespace-pre-wrap break-all max-h-20 overflow-y-auto">
                          {JSON.stringify(inv.result, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })()}

              {executionState.error && (
                <pre className="text-xs text-red-400 bg-zinc-900 rounded-md p-2 overflow-x-auto whitespace-pre-wrap break-all max-h-24 overflow-y-auto">
                  {executionState.error}
                </pre>
              )}
              {executionState.output && (
                <pre className="text-xs text-zinc-300 bg-zinc-900 rounded-md p-2 overflow-x-auto whitespace-pre-wrap break-all max-h-24 overflow-y-auto">
                  {JSON.stringify(executionState.output, null, 2)}
                </pre>
              )}
              <p className="text-[10px] text-zinc-600 mt-1">
                ID: {executionState.executionId.slice(0, 8)}...
              </p>
            </div>
          )}

          {/* Evaluation result */}
          {evaluationResult !== undefined && (
            <div className="p-3 border-t border-zinc-800 flex-shrink-0">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Local Eval</h4>
              <pre className="text-xs text-zinc-300 bg-zinc-900 rounded-md p-2 overflow-x-auto whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                {JSON.stringify(evaluationResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Graph Editor — no inner palette, just canvas + properties */}
        <div className="flex-1 min-w-0 min-h-0 relative">
          <GraphEditor
            graph={currentGraph}
            definitions={definitions}
            showHeader={false}
            showPropertiesPanel={true}
            showNodePalette={false}
            showStatusBar={true}
            onGraphChange={handleGraphChange}
            evaluateFn={evaluate as any}
            nodeStates={showExecutionOverlay && executionState ? executionState.nodeDetails : undefined}
          />
        </div>
      </div>
    </div>
  );
}
