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
import { RefreshCw, Save, Trash2, Plus, Play, Zap, ChevronDown, ChevronRight, Cloud } from 'lucide-react';

const DATABASE_ID = '00000000-0000-0000-0000-000000000000';
const BOUNDARY_NAMES = ['graph/input', 'graph/output', 'graph/prop'];

interface FunctionRequirement {
  name?: string;
  required?: boolean;
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
};

interface StoreEntry {
  id: string;
  name: string;
  hash?: string | null;
}


function platformFnToDefinition(fn: FunctionNode): NodeDefinition {
  return {
    context: fn.scope || 'platform',
    name: fn.taskIdentifier || fn.name || '',
    category: 'functions',
    description: fn.description || undefined,
    inputs: [{ name: 'payload', type: 'json' }],
    outputs: [{ name: 'result', type: 'json' }],
    icon: fn.isInvocable ? 'zap' : 'circle',
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
    name: 'send-email', taskIdentifier: 'email:send_email', serviceUrl: '', isInvocable: true, isBuiltIn: true,
    scope: 'platform', description: 'Sends transactional emails via SMTP or Mailgun',
    requiredSecrets: [{ name: 'MAILGUN_API_KEY', required: true }, { name: 'SMTP_PASSWORD', required: false }],
    requiredConfigs: [{ name: 'SMTP_HOST', required: true }],
  },
  {
    name: 'send-verification-link', taskIdentifier: 'email:send_verification_link', serviceUrl: '', isInvocable: true, isBuiltIn: true,
    scope: 'platform', description: 'Sends invite, password reset, and verification emails',
    requiredSecrets: [{ name: 'MAILGUN_API_KEY', required: true }],
    requiredConfigs: [{ name: 'SMTP_HOST', required: true }, { name: 'FROM_EMAIL', required: true }],
  },
];

const DEFAULT_GRAPH: Graph = {
  name: 'untitled',
  nodes: [],
  edges: [],
};

const CATEGORY_ORDER = ['functions', 'graph', 'const', 'math', 'json', 'flow', 'string', 'layout', 'form', 'content', 'graphql'];
const CATEGORY_LABELS: Record<string, string> = {
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
  if (!ref?.commitId) return null;

  // Get the commit
  const commitData = await gqlFetch(endpoint, `
    query ($where: PlatformFunctionGraphCommitFilter) {
      platformFunctionGraphCommits(where: $where, first: 1) {
        nodes { id treeId message date parentIds }
      }
    }
  `, { where: { id: { equalTo: ref.commitId } } });
  const commit = commitData?.platformFunctionGraphCommits?.nodes?.[0];
  if (!commit?.treeId) return null;

  // Get the object (tree)
  const objData = await gqlFetch(endpoint, `
    query ($where: PlatformFunctionGraphObjectFilter) {
      platformFunctionGraphObjects(where: $where, first: 1) {
        nodes { id data }
      }
    }
  `, { where: { id: { equalTo: commit.treeId } } });
  const obj = objData?.platformFunctionGraphObjects?.nodes?.[0];
  if (!obj?.data) return null;

  return { graph: obj.data as unknown as Graph, commitId: ref.commitId };
}

async function saveGraphToStore(
  storeId: string,
  graph: Graph,
  parentCommitId: string | null
): Promise<{ commitId: string; objectId: string }> {
  const endpoint = '/graphql/compute';

  // Create object (content-addressed blob)
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
  const objectId = objData.createPlatformFunctionGraphObject.platformFunctionGraphObject.id;

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
      deletePlatformFunctionGraphStore(input: $input) { deletedPlatformFunctionGraphStoreNodeId }
    }
  `, { input: { id } });
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

  const graphRef = useRef<Graph>(currentGraph);
  graphRef.current = currentGraph;

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

  // Auto-load first store when stores arrive
  useEffect(() => {
    if (stores.length > 0 && !activeStoreId) {
      handleLoadStore(stores[0]);
    }
  }, [stores, activeStoreId, handleLoadStore]);

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

      const result = await evaluate(graph, {
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
        <button
          onClick={handleEvaluate}
          disabled={isEvaluating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
        >
          <Play size={14} />
          {isEvaluating ? 'Running...' : 'Evaluate'}
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

          {/* Evaluation result */}
          {evaluationResult !== undefined && (
            <div className="p-3 border-t border-zinc-800 flex-shrink-0">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Result</h4>
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
