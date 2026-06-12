import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { GraphEditor, NodeIcon } from '@fbp/graph-editor';
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
import { RefreshCw, Save, Trash2, Plus, Play, Zap, ChevronDown, ChevronRight, Cloud, Server } from 'lucide-react';

const DATABASE_ID = '00000000-0000-0000-0000-000000000000';
const BOUNDARY_NAMES = ['graph/input', 'graph/output', 'graph/prop'];
const EXECUTION_POLL_MS = 1500;

type NodeState = 'pending' | 'running' | 'completed' | 'failed';
type ExecutionState = {
  executionId: string;
  status: 'running' | 'completed' | 'failed' | 'unknown';
  nodeStates: Record<string, NodeState>;
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
};

interface StoreEntry {
  id: string;
  name: string;
  hash?: string | null;
}


function platformFnToDefinition(fn: FunctionNode): NodeDefinition {
  const inputs = (fn.inputs && fn.inputs.length > 0)
    ? fn.inputs.map(p => ({ name: p.name, type: p.type, description: p.description }))
    : [{ name: 'payload', type: 'json' }];
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

function functionToNode(fn: FunctionNode, position: { x: number; y: number }): Node {
  return {
    name: `${fn.name}_${Date.now()}`,
    type: fn.taskIdentifier || fn.name || '',
    meta: position,
    props: [
      { name: 'secretsCount', type: 'number', value: ((fn.requiredSecrets ?? []) as FunctionRequirement[]).length || 0 },
      { name: 'configsCount', type: 'number', value: ((fn.requiredConfigs ?? []) as FunctionRequirement[]).length || 0 },
      { name: 'scope', type: 'string', value: fn.scope || 'platform' },
    ],
  };
}

function definitionToNode(def: NodeDefinition, position: { x: number; y: number }): Node {
  return {
    name: `${def.name.split('/').pop()}_${Date.now().toString(36)}`,
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
  {
    name: 'json-transform', taskIdentifier: 'json-transform', serviceUrl: '', isInvocable: true, isBuiltIn: true,
    scope: 'platform', description: 'Transforms JSON data using a JSONPath expression and optional mapping',
    inputs: [
      { name: 'data', type: 'json', description: 'Input JSON data to transform' },
      { name: 'mapping', type: 'json', description: 'Key mapping object (old_key → new_key)', optional: true },
    ],
    outputs: [
      { name: 'result', type: 'json', description: 'Transformed JSON output' },
      { name: 'count', type: 'number', description: 'Number of keys processed' },
    ],
    props: [
      { name: 'path', type: 'string', default: '$', description: 'JSONPath expression to select data' },
      { name: 'flatten', type: 'boolean', default: false, description: 'Whether to flatten nested objects' },
      { name: 'removeNulls', type: 'boolean', default: true, description: 'Strip null values from output' },
    ],
    icon: 'braces', category: 'data',
  },
  {
    name: 'http-request', taskIdentifier: 'http-request', serviceUrl: '', isInvocable: true, isBuiltIn: true,
    scope: 'platform', description: 'Makes an HTTP request to an external URL',
    requiredSecrets: [{ name: 'AUTH_TOKEN', required: false }],
    inputs: [
      { name: 'url', type: 'string', description: 'Request URL' },
      { name: 'body', type: 'json', description: 'Request body (for POST/PUT/PATCH)', optional: true },
      { name: 'headers', type: 'json', description: 'Additional request headers', optional: true },
    ],
    outputs: [
      { name: 'data', type: 'json', description: 'Response body parsed as JSON' },
      { name: 'status', type: 'number', description: 'HTTP status code' },
      { name: 'headers', type: 'json', description: 'Response headers' },
    ],
    props: [
      { name: 'method', type: 'string', default: 'GET', description: 'HTTP method (GET, POST, PUT, PATCH, DELETE)' },
      { name: 'timeout', type: 'number', default: 30000, description: 'Request timeout in milliseconds' },
      { name: 'retries', type: 'number', default: 0, description: 'Number of retry attempts on failure' },
    ],
    volatile: true, icon: 'globe', category: 'network',
  },
  {
    name: 'text-template', taskIdentifier: 'text-template', serviceUrl: '', isInvocable: true, isBuiltIn: true,
    scope: 'platform', description: 'Renders a text template with {{variable}} substitution',
    inputs: [
      { name: 'variables', type: 'json', description: 'Key-value pairs for template substitution' },
    ],
    outputs: [
      { name: 'text', type: 'string', description: 'Rendered template output' },
      { name: 'missingVars', type: 'json', description: 'Array of template variables with no value' },
    ],
    props: [
      { name: 'template', type: 'string', default: '', description: 'Template string with {{variable}} placeholders', required: true },
      { name: 'strict', type: 'boolean', default: false, description: 'Fail if any template variable is missing' },
      { name: 'fallback', type: 'string', default: '', description: 'Default value for missing variables' },
    ],
    icon: 'file-text', category: 'string',
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
} as const;

const STORE_FIELDS = { id: true, name: true, hash: true } as const;

// ─── GraphQL client helper ──────────────────────────────────────────────

async function gqlFetch(endpoint: string, query: string, variables: Record<string, unknown> = {}) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data;
}

async function loadGraphFromStore(storeId: string): Promise<{ graph: Graph; commitId: string | null } | null> {
  const endpoint = '/graphql/compute';

  // Get the 'main' ref for this store
  const refData = await gqlFetch(endpoint, `
    query ($where: PlatformFunctionGraphRefFilter) {
      platformFunctionGraphRefs(where: $where, first: 1) {
        nodes { id name commitId storeId }
      }
    }
  `, { where: { storeId: { equalTo: storeId } } });
  const ref = refData?.platformFunctionGraphRefs?.nodes?.[0];
  if (!ref?.commitId) {
    // No ref/commit chain — try reading via platformReadFunctionGraph
    // (graph was created by platformImportGraphJson, not blob save)
    return loadGraphFromImport(storeId);
  }

  // Get the commit
  const commitData = await gqlFetch(endpoint, `
    query ($where: PlatformFunctionGraphCommitFilter) {
      platformFunctionGraphCommits(where: $where, first: 1) {
        nodes { id treeId message date parentIds }
      }
    }
  `, { where: { id: { equalTo: ref.commitId } } });
  const commit = commitData?.platformFunctionGraphCommits?.nodes?.[0];
  if (!commit?.treeId) return loadGraphFromImport(storeId);

  // Get the object (tree)
  const objData = await gqlFetch(endpoint, `
    query ($where: PlatformFunctionGraphObjectFilter) {
      platformFunctionGraphObjects(where: $where, first: 1) {
        nodes { id data }
      }
    }
  `, { where: { id: { equalTo: commit.treeId } } });
  const obj = objData?.platformFunctionGraphObjects?.nodes?.[0];
  if (!obj?.data) return loadGraphFromImport(storeId);

  return { graph: obj.data as unknown as Graph, commitId: ref.commitId };
}

async function loadGraphFromImport(storeId: string): Promise<{ graph: Graph; commitId: string | null } | null> {
  const endpoint = '/graphql/compute';

  // Find the platform_function_graphs entry that uses this store
  const graphData = await gqlFetch(endpoint, `
    query ($where: PlatformFunctionGraphFilter) {
      platformFunctionGraphs(where: $where, first: 1) {
        nodes { id storeId name context }
      }
    }
  `, { where: { storeId: { equalTo: storeId } } });
  const graph = graphData?.platformFunctionGraphs?.nodes?.[0];
  if (!graph?.id) return null;

  // Read the full graph using the SQL deserialization function
  const readData = await gqlFetch(endpoint, `
    query ($graphId: UUID!) {
      platformReadFunctionGraph(graphId: $graphId)
    }
  `, { graphId: graph.id });
  const graphJson = readData?.platformReadFunctionGraph;
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
  const endpoint = '/graphql/compute';

  // Create object (content-addressed blob) — ID is a deterministic hash of content,
  // so saving the same graph twice will collide. Catch and reuse existing object.
  let objectId: string;
  try {
    const objData = await gqlFetch(endpoint, `
      mutation ($input: CreatePlatformFunctionGraphObjectInput!) {
        createPlatformFunctionGraphObject(input: $input) {
          platformFunctionGraphObject { id }
        }
      }
    `, {
      input: {
        platformFunctionGraphObject: {
          id: crypto.randomUUID(),
          databaseId: DATABASE_ID,
          data: graph as unknown as Record<string, unknown>,
        },
      },
    });
    objectId = objData.createPlatformFunctionGraphObject.platformFunctionGraphObject.id;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('duplicate key') || msg.includes('unique constraint')) {
      // Object already exists with this content hash — look up the existing ref's tree
      const refData = await gqlFetch(endpoint, `
        query ($where: PlatformFunctionGraphRefFilter) {
          platformFunctionGraphRefs(where: $where, first: 1) {
            nodes { id commitId }
          }
        }
      `, { where: { storeId: { equalTo: storeId } } });
      const existingRef = refData?.platformFunctionGraphRefs?.nodes?.[0];
      if (existingRef?.commitId) {
        // Content unchanged — return existing commit, no new save needed
        return { commitId: existingRef.commitId, objectId: '' };
      }
      throw err;
    }
    throw err;
  }

  // Create commit pointing to the object
  const commitData = await gqlFetch(endpoint, `
    mutation ($input: CreatePlatformFunctionGraphCommitInput!) {
      createPlatformFunctionGraphCommit(input: $input) {
        platformFunctionGraphCommit { id }
      }
    }
  `, {
    input: {
      platformFunctionGraphCommit: {
        databaseId: DATABASE_ID,
        storeId,
        treeId: objectId,
        message: `Save: ${graph.name || 'untitled'}`,
        parentIds: parentCommitId ? [parentCommitId] : [],
      },
    },
  });
  const commitId = commitData.createPlatformFunctionGraphCommit.platformFunctionGraphCommit.id;

  // Upsert ref: find existing 'main' ref, update or create
  const refData = await gqlFetch(endpoint, `
    query ($where: PlatformFunctionGraphRefFilter) {
      platformFunctionGraphRefs(where: $where, first: 1) {
        nodes { id }
      }
    }
  `, { where: { storeId: { equalTo: storeId } } });
  const existingRef = refData?.platformFunctionGraphRefs?.nodes?.[0];

  if (existingRef) {
    await gqlFetch(endpoint, `
      mutation ($input: UpdatePlatformFunctionGraphRefInput!) {
        updatePlatformFunctionGraphRef(input: $input) {
          platformFunctionGraphRef { id }
        }
      }
    `, {
      input: { id: existingRef.id, databaseId: DATABASE_ID, platformFunctionGraphRefPatch: { commitId } },
    });
  } else {
    await gqlFetch(endpoint, `
      mutation ($input: CreatePlatformFunctionGraphRefInput!) {
        createPlatformFunctionGraphRef(input: $input) {
          platformFunctionGraphRef { id }
        }
      }
    `, {
      input: {
        platformFunctionGraphRef: {
          databaseId: DATABASE_ID,
          storeId,
          name: 'main',
          commitId,
        },
      },
    });
  }

  return { commitId, objectId };
}

async function createStore(name: string): Promise<StoreEntry> {
  const endpoint = '/graphql/compute';
  const data = await gqlFetch(endpoint, `
    mutation ($input: CreatePlatformFunctionGraphStoreInput!) {
      createPlatformFunctionGraphStore(input: $input) {
        platformFunctionGraphStore { id name hash }
      }
    }
  `, {
    input: {
      platformFunctionGraphStore: { databaseId: DATABASE_ID, name },
    },
  });
  return data.createPlatformFunctionGraphStore.platformFunctionGraphStore;
}

async function deleteStore(id: string): Promise<void> {
  const endpoint = '/graphql/compute';
  await gqlFetch(endpoint, `
    mutation ($input: DeletePlatformFunctionGraphStoreInput!) {
      deletePlatformFunctionGraphStore(input: $input) { platformFunctionGraphStore { id } }
    }
  `, { input: { id } });
}

// ─── Graph execution helpers ────────────────────────────────────────────

async function importAndExecuteGraph(
  graph: Graph,
  inputPayload: Record<string, unknown> = {},
  outputNode: string | null = null,
  outputPort: string | null = null,
): Promise<{ graphId: string; executionId: string }> {
  const endpoint = '/graphql/compute';

  const importData = await gqlFetch(endpoint, `
    mutation ($input: PlatformImportGraphJsonInput!) {
      platformImportGraphJson(input: $input) { result }
    }
  `, {
    input: {
      databaseId: DATABASE_ID,
      name: graph.name || 'untitled',
      graphJson: graph as unknown as Record<string, unknown>,
      context: graph.context || 'function',
    },
  });
  const graphId = importData.platformImportGraphJson.result;

  const execInput: Record<string, unknown> = { graphId, inputPayload };
  if (outputNode) execInput.outputNode = outputNode;
  if (outputPort) execInput.outputPort = outputPort;

  const execData = await gqlFetch(endpoint, `
    mutation ($input: PlatformStartExecutionInput!) {
      platformStartExecution(input: $input) { result }
    }
  `, { input: execInput });
  const executionId = execData.platformStartExecution.result;

  return { graphId, executionId };
}

async function pollExecutionStatus(executionId: string): Promise<{
  status: string;
  nodeStates: Record<string, NodeState>;
  output?: unknown;
  error?: string;
}> {
  const endpoint = '/graphql/compute';

  // Query invocations for this execution to get per-node status
  const invData = await gqlFetch(endpoint, `
    query ($where: PlatformFunctionInvocationFilter) {
      platformFunctionInvocations(where: $where, orderBy: CREATED_AT_ASC) {
        nodes {
          id
          taskIdentifier
          status
          durationMs
          createdAt
          graphExecutionId
          payload
        }
      }
    }
  `, {
    where: { graphExecutionId: { equalTo: executionId } },
  });

  const invocations = invData?.platformFunctionInvocations?.nodes ?? [];
  const nodeStates: Record<string, NodeState> = {};
  let hasRunning = false;
  let hasFailed = false;

  for (const inv of invocations) {
    const nodeName = inv.payload?.node_name;
    if (!nodeName) continue;
    const s = inv.status as string;
    if (s === 'completed') nodeStates[nodeName] = 'completed';
    else if (s === 'failed') { nodeStates[nodeName] = 'failed'; hasFailed = true; }
    else { nodeStates[nodeName] = 'running'; hasRunning = true; }
  }

  const overallStatus = hasFailed ? 'failed' : hasRunning ? 'running' : (invocations.length > 0 ? 'completed' : 'running');
  return { status: overallStatus, nodeStates };
}

// ─── Component ──────────────────────────────────────────────────────────

export function FlowsPanel() {
  const { data, isLoading } = compute.usePlatformFunctionDefinitionsQuery({
    selection: { fields: FUNCTION_FIELDS },
  });

  const { data: storesData, isLoading: storesLoading, refetch: refetchStores } = compute.usePlatformFunctionGraphStoresQuery({
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

  const definitions: NodeDefinition[] = useMemo(() => [
    ...functions.map(platformFnToDefinition),
    ...mathDefinitions.map(({ impl, ...rest }) => rest as NodeDefinition),
    ...coreDefinitions.map(({ impl, ...rest }) => rest as NodeDefinition),
    ...uiDefinitions.map(({ impl, ...rest }) => rest as NodeDefinition),
    ...netDefinitions.map(({ impl, ...rest }) => rest as NodeDefinition),
  ], [functions]);

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
    const graph = graphRef.current;
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
      for (const node of graph.nodes) {
        if (!['graphInput', 'graphOutput', 'graphProp'].includes(node.type)) {
          initialNodeStates[node.name] = 'pending';
        }
      }

      setExecutionState({
        executionId,
        status: 'running',
        nodeStates: initialNodeStates,
      });

      // Start polling for execution status
      pollRef.current = setInterval(async () => {
        try {
          const pollResult = await pollExecutionStatus(executionId);
          setExecutionState(prev => {
            if (!prev || prev.executionId !== executionId) return prev;
            const merged: Record<string, NodeState> = { ...prev.nodeStates };
            for (const [name, state] of Object.entries(pollResult.nodeStates)) {
              merged[name] = state;
            }
            return {
              ...prev,
              nodeStates: merged,
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
        } catch {
          // Keep polling on transient errors
        }
      }, EXECUTION_POLL_MS);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setExecutionState({ executionId: '', status: 'failed', nodeStates: {}, error: msg });
      setIsExecuting(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    const name = flowName.trim() || `Flow ${stores.length + 1}`;
    const graph = graphRef.current;
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
    if (fn) {
      const node = functionToNode(fn, position);
      setCurrentGraph(prev => ({ ...prev, nodes: [...prev.nodes, node] }));
    } else {
      const node = definitionToNode(def, position);
      setCurrentGraph(prev => ({ ...prev, nodes: [...prev.nodes, node] }));
    }
  }, []);

  const handleLoadAll = useCallback(() => {
    const newNodes = functions.map((fn, i) =>
      functionToNode(fn, { x: 300, y: 50 + i * 200 })
    );
    setCurrentGraph(prev => ({ ...prev, nodes: [...prev.nodes, ...newNodes] }));
  }, [functions]);

  const handleDragStart = useCallback((e: React.DragEvent, def: NodeDefinition) => {
    e.dataTransfer.setData('application/fbp-node', JSON.stringify({
      definitionName: def.name,
      isBoundary: BOUNDARY_NAMES.includes(def.name),
    }));
    e.dataTransfer.effectAllowed = 'copy';
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
        {activeStoreId && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-sm text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
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
              {stores.length === 0 && !storesLoading && (
                <p className="text-xs text-zinc-600 px-3 py-1">No saved flows yet</p>
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
                              {isFunction ? (
                                <Zap size={14} className="text-cyan-400 flex-shrink-0" />
                              ) : (
                                def.icon && <NodeIcon icon={def.icon} size={14} className="text-zinc-500 flex-shrink-0" />
                              )}
                              <span className="text-sm text-zinc-300 truncate">
                                {def.name.split('/').pop()}
                              </span>
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
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Execution
                <span className={`ml-2 inline-block w-2 h-2 rounded-full ${
                  executionState.status === 'running' ? 'bg-yellow-400 animate-pulse' :
                  executionState.status === 'completed' ? 'bg-green-400' :
                  executionState.status === 'failed' ? 'bg-red-400' : 'bg-zinc-400'
                }`} />
              </h4>
              <div className="space-y-1 mb-2">
                {Object.entries(executionState.nodeStates).map(([name, state]) => (
                  <div key={name} className="flex items-center gap-2 text-xs">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      state === 'completed' ? 'bg-green-400' :
                      state === 'failed' ? 'bg-red-400' :
                      state === 'running' ? 'bg-yellow-400 animate-pulse' : 'bg-zinc-600'
                    }`} />
                    <span className="text-zinc-400 truncate">{name}</span>
                    <span className={`ml-auto text-[10px] ${
                      state === 'completed' ? 'text-green-400' :
                      state === 'failed' ? 'text-red-400' :
                      state === 'running' ? 'text-yellow-400' : 'text-zinc-600'
                    }`}>{state}</span>
                  </div>
                ))}
              </div>
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
          />
        </div>
      </div>
    </div>
  );
}
