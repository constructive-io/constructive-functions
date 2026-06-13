import React from 'react';
import { GraphProvider } from '../context/GraphContext';
import type { NodeExecutionInfo } from '../context/GraphContext';
import { GraphCanvas } from './GraphCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { NodePalette } from './NodePalette';
import { StatusBar } from './StatusBar';
import type { Graph, NodeDefinition } from '@fbp/types';

// Type for evaluate function
type EvaluateFn = (graph: Graph, options: { definitions: any[]; outputNode: string; outputPort: string }) => Promise<any>;

interface GraphEditorProps {
  graph?: Graph;
  definitions?: NodeDefinition[];
  initialCwd?: string;
  showHeader?: boolean;
  showPropertiesPanel?: boolean;
  showNodePalette?: boolean;
  showStatusBar?: boolean;
  className?: string;
  onGraphChange?: (graph: Graph) => void;
  onSelectionChange?: (selectedNodeIds: string[]) => void;
  evaluationResult?: unknown;
  onRefreshEvaluation?: () => void;
  evaluateFn?: EvaluateFn;
  nodeStates?: Record<string, NodeExecutionInfo>;
}

export function GraphEditor({
  graph,
  definitions,
  initialCwd,
  showHeader = true,
  showPropertiesPanel = true,
  showNodePalette = true,
  showStatusBar = true,
  className = '',
  onGraphChange,
  onSelectionChange,
  evaluationResult,
  onRefreshEvaluation,
  evaluateFn,
  nodeStates
}: GraphEditorProps) {
  return (
    <GraphProvider initialGraph={graph} initialCwd={initialCwd} externalDefinitions={definitions} onSelectionChange={onSelectionChange} onGraphChange={onGraphChange} nodeStates={nodeStates}>
      <div className={`flex flex-col h-full bg-zinc-950 ${className}`}>
        {showHeader && (
          <div className="h-10 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 flex-shrink-0">
            <span className="text-sm font-medium text-zinc-300">FBP Graph Editor</span>
            <span className="ml-3 text-xs text-zinc-500">Flow-Based Programming</span>
          </div>
        )}
        
        <div className="flex flex-1 min-h-0">
          {showNodePalette && (
            <div className="w-48 flex-shrink-0 border-r border-zinc-800 bg-zinc-950">
              <NodePalette />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <GraphCanvas />
          </div>
          
          {showPropertiesPanel && (
            <div className="w-72 flex-shrink-0 border-l border-zinc-800">
              <PropertiesPanel 
                evaluationResult={evaluationResult} 
                onRefreshEvaluation={onRefreshEvaluation}
                evaluateFn={evaluateFn}
                definitions={definitions as any[]}
              />
            </div>
          )}
        </div>
        
        {showStatusBar && <StatusBar />}
      </div>
    </GraphProvider>
  );
}
