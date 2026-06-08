import { useEffect, useState, useCallback, useMemo, DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type Connection,
  type Node as RFNode,
  type Edge as RFEdge,
  type NodeProps,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { usePlatformFunctionDefinitionsQuery } from '../generated/hooks';
import type { PlatformFunctionDefinition } from '../generated/types';
import { RefreshCw, Save, Trash2, Zap, Lock, Settings } from 'lucide-react';

const STORAGE_KEY = 'constructive-flows';

interface FlowData {
  name: string;
  nodes: RFNode[];
  edges: RFEdge[];
}

// ─── Custom Node ─────────────────────────────────────────────────────────────

interface FunctionNodeData {
  label: string;
  description: string;
  taskIdentifier: string;
  scope: string;
  isInvocable: boolean;
  secretsCount: number;
  configsCount: number;
  [key: string]: unknown;
}

function FunctionNode({ data }: NodeProps<RFNode<FunctionNodeData>>) {
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 shadow-lg min-w-[200px]">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-zinc-800"
        id="payload"
      />
      <div className="px-3 py-2 border-b border-zinc-700 flex items-center gap-2">
        <Zap size={12} className={data.isInvocable ? 'text-emerald-400' : 'text-zinc-600'} />
        <span className="font-mono text-xs font-semibold text-zinc-200">{data.label}</span>
      </div>
      <div className="px-3 py-2 space-y-1">
        {data.description && (
          <p className="text-[10px] text-zinc-500 leading-tight">{data.description}</p>
        )}
        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
          <span className="font-mono">{data.taskIdentifier}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-600">
          {data.secretsCount > 0 && (
            <span className="flex items-center gap-0.5">
              <Lock size={8} />
              {data.secretsCount}
            </span>
          )}
          {data.configsCount > 0 && (
            <span className="flex items-center gap-0.5">
              <Settings size={8} />
              {data.configsCount}
            </span>
          )}
          <span className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-500">{data.scope}</span>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-zinc-800"
        id="result"
      />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  functionNode: FunctionNode,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface Requirement { name: string; required: boolean }

function toRequirements(raw: unknown): Requirement[] {
  if (!Array.isArray(raw)) return [];
  return raw as Requirement[];
}

function functionToNode(fn: PlatformFunctionDefinition, position: { x: number; y: number }): RFNode<FunctionNodeData> {
  return {
    id: `${fn.name}-${Date.now()}`,
    type: 'functionNode',
    position,
    data: {
      label: fn.name ?? '',
      description: fn.description || '',
      taskIdentifier: fn.taskIdentifier ?? '',
      scope: fn.scope || 'default',
      isInvocable: fn.isInvocable ?? false,
      secretsCount: toRequirements((fn as any).requiredSecrets).length,
      configsCount: toRequirements((fn as any).requiredConfigs).length,
    },
  };
}

function loadFlows(): FlowData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFlows(flows: FlowData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(flows));
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FlowsPanel() {
  const { data, isLoading: loading } = usePlatformFunctionDefinitionsQuery({
    selection: {
      fields: {
        id: true,
        name: true,
        taskIdentifier: true,
        isInvocable: true,
        scope: true,
        description: true,
      },
    },
    refetchInterval: false,
  });
  const functions = (data?.platformFunctionDefinitions?.nodes ?? []) as PlatformFunctionDefinition[];
  const [flows, setFlowsList] = useState<FlowData[]>(loadFlows);
  const [activeFlowIdx, setActiveFlowIdx] = useState<number | null>(
    loadFlows().length > 0 ? 0 : null
  );
  const [flowName, setFlowName] = useState('');

  const [nodes, setNodes, onNodesChange] = useNodesState<RFNode<FunctionNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RFEdge>([]);

  // Load active flow into canvas
  useEffect(() => {
    if (activeFlowIdx !== null && flows[activeFlowIdx]) {
      const flow = flows[activeFlowIdx];
      setNodes(flow.nodes as RFNode<FunctionNodeData>[]);
      setEdges(flow.edges);
      setFlowName(flow.name);
    }
  }, [activeFlowIdx, flows, setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, animated: true, style: { stroke: '#10b981' } }, eds));
    },
    [setEdges]
  );

  // Drag & drop from sidebar
  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const fnName = event.dataTransfer.getData('application/constructive-function');
      if (!fnName) return;

      const fn = functions.find((f) => f.name === fnName);
      if (!fn) return;

      const bounds = (event.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect();
      if (!bounds) return;

      const position = {
        x: event.clientX - bounds.left - 100,
        y: event.clientY - bounds.top - 30,
      };

      setNodes((nds) => [...nds, functionToNode(fn, position)]);
    },
    [functions, setNodes]
  );

  // Save current flow
  const handleSave = useCallback(() => {
    const name = flowName.trim() || `Flow ${flows.length + 1}`;
    const flowData: FlowData = { name, nodes, edges };

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
  }, [flowName, nodes, edges, flows, activeFlowIdx]);

  // New flow
  const handleNew = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setFlowName('');
    setActiveFlowIdx(null);
  }, [setNodes, setEdges]);

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

  // Populate canvas with all functions as unconnected nodes
  const handleLoadAll = useCallback(() => {
    const newNodes = functions.map((fn, i) =>
      functionToNode(fn, { x: 50 + (i % 3) * 280, y: 50 + Math.floor(i / 3) * 180 })
    );
    setNodes(newNodes);
    setEdges([]);
  }, [functions, setNodes, setEdges]);

  const defaultEdgeOptions = useMemo(
    () => ({ animated: true, style: { stroke: '#10b981' } }),
    []
  );

  return (
    <div className="flex h-full">
      {/* Sidebar: function palette + flow list */}
      <div className="w-56 border-r border-zinc-800 flex flex-col bg-zinc-950">
        {/* Flow list */}
        <div className="border-b border-zinc-800 p-3 space-y-2">
          <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Flows</h3>
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
            className="w-full text-left px-2 py-1 rounded text-xs text-blue-400 hover:bg-zinc-900 transition-colors"
          >
            + New Flow
          </button>
        </div>

        {/* Function palette */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Functions</h3>
            {loading && <RefreshCw size={10} className="animate-spin text-zinc-500" />}
          </div>
          <p className="text-[10px] text-zinc-600">Drag onto canvas</p>
          {functions.map((fn) => (
            <div
              key={fn.name}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/constructive-function', fn.name ?? '');
                e.dataTransfer.effectAllowed = 'move';
              }}
              className="rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1.5 cursor-grab hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Zap size={10} className={fn.isInvocable ? 'text-emerald-400' : 'text-zinc-600'} />
                <span className="font-mono text-[11px] text-zinc-300">{fn.name ?? ''}</span>
              </div>
              {fn.description && (
                <p className="text-[9px] text-zinc-600 mt-0.5 leading-tight">{fn.description}</p>
              )}
            </div>
          ))}
          {!loading && functions.length > 0 && (
            <button
              onClick={handleLoadAll}
              className="w-full text-xs text-zinc-500 hover:text-zinc-300 py-1 transition-colors"
            >
              Load all to canvas
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800">
          <input
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            placeholder="Flow name…"
            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-600 w-48"
          />
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            <Save size={10} />
            Save
          </button>
          {activeFlowIdx !== null && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-zinc-800 hover:bg-red-900 text-zinc-400 hover:text-red-300 transition-colors"
            >
              <Trash2 size={10} />
            </button>
          )}
          <span className="text-[10px] text-zinc-600 ml-auto">
            {nodes.length} node{nodes.length !== 1 ? 's' : ''} · {edges.length} edge{edges.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            proOptions={{ hideAttribution: true }}
            className="bg-zinc-950"
          >
            <Background color="#27272a" gap={20} />
            <Controls className="!bg-zinc-900 !border-zinc-700 !rounded-lg [&>button]:!bg-zinc-800 [&>button]:!border-zinc-700 [&>button]:!text-zinc-300 [&>button:hover]:!bg-zinc-700" />
            <MiniMap
              nodeColor="#3f3f46"
              maskColor="rgba(0,0,0,0.7)"
              className="!bg-zinc-900 !border-zinc-700 !rounded-lg"
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
