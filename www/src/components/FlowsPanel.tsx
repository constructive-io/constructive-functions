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
import type { Graph, NodeDefinition } from '@fbp/types';
import { api, type PlatformFunction } from '../lib/api';
import { RefreshCw, Save, Trash2, Plus, Play, ChevronDown } from 'lucide-react';

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

const DEFAULT_GRAPH: Graph = {
  name: 'untitled',
  nodes: [],
  edges: [],
};

// Palette definitions for the graph/input, graph/output, graph/prop nodes  
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
  const [showFlowList, setShowFlowList] = useState(true);

  const graphRef = useRef<Graph>(currentGraph);
  graphRef.current = currentGraph;

  // Load functions from API
  useEffect(() => {
    setLoading(true);
    api.getFunctions()
      .then(setFunctions)
      .catch(() => {})
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
    // Platform functions as stubs that just pass through
    ...functions.map((fn): NodeDefinitionWithImpl => ({
      ...platformFnToDefinition(fn),
      impl: async (inputs) => {
        // In local mode, just pass payload through as result
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
      // Find the first graphOutput node to evaluate
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

  return (
    <div className="flex h-full bg-zinc-950">
      {/* Sidebar: flow list */}
      {showFlowList && (
        <div className="w-52 border-r border-zinc-800 flex flex-col bg-zinc-950 flex-shrink-0">
          <div className="border-b border-zinc-800 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Flows</h3>
              {loading && <RefreshCw size={10} className="animate-spin text-zinc-500" />}
            </div>
            <div className="space-y-1">
              {flows.map((f, i) => (
                <button
                  key={i}
                  onClick={() => setActiveFlowIdx(i)}
                  className={`w-full text-left px-2 py-1 rounded text-xs truncate transition-colors ${
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
              className="w-full flex items-center gap-1 px-2 py-1 rounded text-xs text-blue-400 hover:bg-zinc-900 transition-colors"
            >
              <Plus size={10} />
              New Flow
            </button>
          </div>

          {/* Flow metadata */}
          <div className="p-3 space-y-2 border-b border-zinc-800">
            <input
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              placeholder="Flow name…"
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-600"
            />
            <div className="flex items-center gap-1">
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                <Save size={10} />
                Save
              </button>
              <button
                onClick={handleEvaluate}
                disabled={isEvaluating}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50"
              >
                <Play size={10} />
                {isEvaluating ? 'Running…' : 'Evaluate'}
              </button>
              {activeFlowIdx !== null && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-zinc-800 hover:bg-red-900 text-zinc-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          </div>

          {/* Evaluation result */}
          {evaluationResult !== undefined && (
            <div className="p-3 flex-1 overflow-y-auto">
              <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">Result</h4>
              <pre className="text-[10px] text-zinc-300 bg-zinc-900 rounded p-2 overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(evaluationResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Toggle sidebar button */}
      <button
        onClick={() => setShowFlowList(!showFlowList)}
        className="absolute left-0 top-1/2 z-20 -translate-y-1/2 bg-zinc-800 border border-zinc-700 rounded-r px-0.5 py-2 text-zinc-400 hover:text-zinc-200 transition-colors"
        style={{ left: showFlowList ? '13rem' : 0 }}
      >
        <ChevronDown size={12} className={showFlowList ? 'rotate-90' : '-rotate-90'} />
      </button>

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
  );
}
