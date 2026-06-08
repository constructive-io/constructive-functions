import { useEffect, useState, useCallback, useRef } from 'react';
import { GraphEditor } from '@fbp/graph-editor';
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
import { api, type PlatformFunction } from '../lib/api';
import { RefreshCw, Save, Trash2, Plus, Play, Zap } from 'lucide-react';

const STORAGE_KEY = 'constructive-flows-v2';

interface SavedFlow {
  name: string;
  graph: Graph;
}

function loadFlows(): SavedFlow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFlows(flows: SavedFlow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flows));
}

function platformFnToDefinition(fn: PlatformFunction): NodeDefinition {
  return {
    context: fn.scope || 'platform',
    name: fn.task_identifier || fn.name,
    category: 'functions',
    description: fn.description || undefined,
    inputs: [{ name: 'payload', type: 'json' }],
    outputs: [{ name: 'result', type: 'json' }],
    icon: fn.is_invocable ? 'zap' : 'circle',
  };
}

// Create a graph node from a platform function with metadata props
function functionToNode(fn: PlatformFunction, position: { x: number; y: number }): Node {
  return {
    name: `${fn.name}_${Date.now()}`,
    type: fn.task_identifier || fn.name,
    meta: position,
    props: [
      { name: 'secretsCount', type: 'number', value: fn.required_secrets?.length || 0 },
      { name: 'configsCount', type: 'number', value: fn.required_configs?.length || 0 },
      { name: 'scope', type: 'string', value: fn.scope || 'platform' },
    ],
  };
}

// Mock functions for demo when API is unavailable
const MOCK_FUNCTIONS: PlatformFunction[] = [
  {
    name: 'send-email', task_identifier: 'email:send_email', service_url: '', is_invocable: true, is_built_in: true,
    scope: 'platform', description: 'Sends transactional emails via SMTP or Mailgun',
    required_secrets: [{ name: 'MAILGUN_API_KEY', required: true }, { name: 'SMTP_PASSWORD', required: false }],
    required_configs: [{ name: 'SMTP_HOST', required: true }], created_at: '', updated_at: '',
  },
  {
    name: 'send-verification-link', task_identifier: 'email:send_verification_link', service_url: '', is_invocable: true, is_built_in: true,
    scope: 'platform', description: 'Sends invite, password reset, and verification emails',
    required_secrets: [{ name: 'MAILGUN_API_KEY', required: true }],
    required_configs: [{ name: 'SMTP_HOST', required: true }, { name: 'FROM_EMAIL', required: true }], created_at: '', updated_at: '',
  },
  {
    name: 'process-webhook', task_identifier: 'webhook:process', service_url: '', is_invocable: true, is_built_in: false,
    scope: 'tenant', description: 'Processes incoming webhook payloads and routes to handlers',
    required_secrets: [{ name: 'WEBHOOK_SECRET', required: true }],
    required_configs: [], created_at: '', updated_at: '',
  },
];

const DEFAULT_GRAPH: Graph = {
  name: 'untitled',
  nodes: [],
  edges: [],
};

// Palette definitions for graph/input, graph/output, graph/prop nodes
const PALETTE_DEFINITIONS: NodeDefinition[] = [
  { context: 'core', name: 'graph/input', category: 'graph', inputs: [], outputs: [{ name: 'value', type: 'any' }], icon: 'arrow-right' },
  { context: 'core', name: 'graph/output', category: 'graph', inputs: [{ name: 'value', type: 'any' }], outputs: [], icon: 'arrow-left' },
  { context: 'core', name: 'graph/prop', category: 'graph', inputs: [], outputs: [{ name: 'value', type: 'any' }], icon: 'settings' },
];

export function FlowsPanel() {
  const [functions, setFunctions] = useState<PlatformFunction[]>([]);
  const [loading, setLoading] = useState(true);
  const [flows, setFlowsList] = useState<SavedFlow[]>(loadFlows);
  const [activeFlowIdx, setActiveFlowIdx] = useState<number | null>(
    loadFlows().length > 0 ? 0 : null
  );
  const [flowName, setFlowName] = useState('');
  const [currentGraph, setCurrentGraph] = useState<Graph>(DEFAULT_GRAPH);
  const [evaluationResult, setEvaluationResult] = useState<unknown>(undefined);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const graphRef = useRef<Graph>(currentGraph);
  graphRef.current = currentGraph;

  // Load functions from API, fall back to mock data for demo
  useEffect(() => {
    setLoading(true);
    api.getFunctions()
      .then(fns => setFunctions(fns.length > 0 ? fns : MOCK_FUNCTIONS))
      .catch(() => setFunctions(MOCK_FUNCTIONS))
      .finally(() => setLoading(false));
  }, []);

  // Load active flow
  useEffect(() => {
    if (activeFlowIdx !== null && flows[activeFlowIdx]) {
      const flow = flows[activeFlowIdx];
      setCurrentGraph(flow.graph);
      setFlowName(flow.name);
      setEvaluationResult(undefined);
    }
  }, [activeFlowIdx, flows]);

  // Build definitions: platform functions + built-in evaluator defs + palette boundary nodes
  const definitions: NodeDefinition[] = [
    ...functions.map(platformFnToDefinition),
    ...mathDefinitions.map(({ impl, ...rest }) => rest as NodeDefinition),
    ...coreDefinitions.map(({ impl, ...rest }) => rest as NodeDefinition),
    ...uiDefinitions.map(({ impl, ...rest }) => rest as NodeDefinition),
    ...netDefinitions.map(({ impl, ...rest }) => rest as NodeDefinition),
    ...PALETTE_DEFINITIONS,
  ];

  // Build impl definitions for evaluation
  const implDefinitions: NodeDefinitionWithImpl[] = [
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
  ];

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

  // Save current flow
  const handleSave = useCallback(() => {
    const name = flowName.trim() || `Flow ${flows.length + 1}`;
    const flowData: SavedFlow = { name, graph: graphRef.current };

    const updated = [...flows];
    if (activeFlowIdx !== null) {
      updated[activeFlowIdx] = flowData;
    } else {
      updated.push(flowData);
      setActiveFlowIdx(updated.length - 1);
    }
    setFlowsList(updated);
    saveFlows(updated);
    setFlowName(name);
  }, [flowName, flows, activeFlowIdx]);

  // New flow
  const handleNew = useCallback(() => {
    setCurrentGraph({ ...DEFAULT_GRAPH, name: '' });
    setFlowName('');
    setActiveFlowIdx(null);
    setEvaluationResult(undefined);
  }, []);

  // Delete flow
  const handleDelete = useCallback(() => {
    if (activeFlowIdx === null) return;
    const updated = flows.filter((_, i) => i !== activeFlowIdx);
    setFlowsList(updated);
    saveFlows(updated);
    if (updated.length > 0) {
      setActiveFlowIdx(0);
    } else {
      handleNew();
    }
  }, [activeFlowIdx, flows, handleNew]);

  // Add function to canvas
  const handleAddFunction = useCallback((fn: PlatformFunction) => {
    const node = functionToNode(fn, { x: 300 + Math.random() * 200, y: 100 + Math.random() * 200 });
    setCurrentGraph(prev => ({
      ...prev,
      nodes: [...prev.nodes, node],
    }));
  }, []);

  // Load all functions to canvas
  const handleLoadAll = useCallback(() => {
    const newNodes = functions.map((fn, i) =>
      functionToNode(fn, { x: 300, y: 50 + i * 200 })
    );
    setCurrentGraph(prev => ({
      ...prev,
      nodes: [...prev.nodes, ...newNodes],
    }));
  }, [functions]);

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Top bar: flow name + save */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800 flex-shrink-0" style={{ marginLeft: '20rem' }}>
        <input
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          placeholder="Flow name..."
          className="bg-zinc-900 border border-zinc-700 rounded-md px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-600 w-56"
        />
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-green-600 hover:bg-green-500 text-white transition-colors"
        >
          <Save size={14} />
          Save
        </button>
        <button
          onClick={handleEvaluate}
          disabled={isEvaluating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
        >
          <Play size={14} />
          {isEvaluating ? 'Running...' : 'Evaluate'}
        </button>
        {activeFlowIdx !== null && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-sm text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left sidebar: FLOWS + FUNCTIONS */}
        <div className="w-80 border-r border-zinc-800 flex flex-col bg-zinc-950 flex-shrink-0 overflow-y-auto">
          {/* FLOWS section */}
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Flows</h3>
              {loading && <RefreshCw size={12} className="animate-spin text-zinc-500" />}
            </div>
            <div className="space-y-1 mb-3">
              {flows.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFlowIdx(i)}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-sm truncate transition-colors ${
                    activeFlowIdx === i
                      ? 'bg-zinc-800 text-zinc-200'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
            <button
              onClick={handleNew}
              className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Plus size={14} />
              New Flow
            </button>
          </div>

          {/* FUNCTIONS section */}
          <div className="p-4 flex-1">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Functions</h3>
            <p className="text-xs text-zinc-600 mb-3">Drag onto canvas</p>

            <div className="space-y-2">
              {functions.map((fn) => (
                <button
                  key={fn.name}
                  onClick={() => handleAddFunction(fn)}
                  className="w-full text-left p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 transition-colors group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap size={14} className="text-cyan-400" />
                    <span className="text-sm font-medium text-zinc-200 font-mono">{fn.name}</span>
                  </div>
                  {fn.description && (
                    <p className="text-xs text-zinc-500 leading-relaxed">{fn.description}</p>
                  )}
                </button>
              ))}
            </div>

            {functions.length > 0 && (
              <button
                onClick={handleLoadAll}
                className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 mt-3 py-1 transition-colors"
              >
                Load all to canvas
              </button>
            )}
          </div>

          {/* Evaluation result */}
          {evaluationResult !== undefined && (
            <div className="p-4 border-t border-zinc-800">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Result</h4>
              <pre className="text-xs text-zinc-300 bg-zinc-900 rounded-md p-2 overflow-x-auto whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                {JSON.stringify(evaluationResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Graph Editor */}
        <div className="flex-1 min-w-0 min-h-0 relative">
          <GraphEditor
            graph={currentGraph}
            definitions={definitions}
            showPropertiesPanel={true}
            showNodePalette={true}
            showStatusBar={true}
            onGraphChange={handleGraphChange}
            evaluateFn={evaluate as any}
          />
        </div>
      </div>
    </div>
  );
}
