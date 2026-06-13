import React from 'react';
import { useGraph, useSelection, useScopedGraph, useNodeStates } from '../context/GraphContext';
import { getNodePortPosition } from './GraphNode';
import { getBezierPath } from '../utils/geometry';
import type { Edge } from '@fbp/types';

interface GraphEdgeProps {
  edge: Edge;
}

export function GraphEdge({ edge }: GraphEdgeProps) {
  const { getDefinition } = useGraph();
  const { selection, selectEdges } = useSelection();
  const { nodes } = useScopedGraph();
  const nodeStatesMap = useNodeStates();
  
  const edgeId = `${edge.src.node}:${edge.src.port}->${edge.dst.node}:${edge.dst.port}`;
  const isSelected = selection.edgeIds.has(edgeId);

  const srcNode = nodes.find(n => n.name === edge.src.node);
  const dstNode = nodes.find(n => n.name === edge.dst.node);
  
  if (!srcNode || !dstNode) return null;

  const srcDef = getDefinition(srcNode.type);
  const dstDef = getDefinition(dstNode.type);

  const srcPos = getNodePortPosition(srcNode, edge.src.port, true, srcDef);
  const dstPos = getNodePortPosition(dstNode, edge.dst.port, false, dstDef);

  if (!srcPos || !dstPos) return null;

  const path = getBezierPath(srcPos, dstPos);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectEdges([edgeId], e.shiftKey);
  };

  // Determine edge execution state from source/destination node states
  // Animate while source is running (data being prepared for this edge)
  // Go solid green once source completes (data delivered to destination port)
  const srcState = nodeStatesMap?.[edge.src.node]?.state;
  const dstState = nodeStatesMap?.[edge.dst.node]?.state;
  const isDataFlowing = srcState === 'running' || srcState === 'queued';
  const isDelivered = srcState === 'completed';
  const isFailed = srcState === 'failed' || dstState === 'failed';

  let edgeColor = isSelected ? '#3b82f6' : '#64748b';
  let edgeWidth = isSelected ? 3 : 2;
  if (nodeStatesMap) {
    if (isDataFlowing) { edgeColor = '#facc15'; edgeWidth = 3; }
    else if (isFailed) { edgeColor = '#f87171'; edgeWidth = 2; }
    else if (isDelivered) { edgeColor = '#4ade80'; edgeWidth = 2; }
    else if (isSelected) { /* keep selection color */ }
    else if (srcState || dstState) { edgeColor = '#52525b'; }
  }

  return (
    <g onClick={handleClick} style={{ cursor: 'pointer' }}>
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
      />
      <path
        d={path}
        fill="none"
        stroke={edgeColor}
        strokeWidth={edgeWidth}
        strokeLinecap="round"
        strokeDasharray={isDataFlowing ? '8 4' : undefined}
      >
        {isDataFlowing && (
          <animate attributeName="stroke-dashoffset" from="24" to="0" dur="0.6s" repeatCount="indefinite" />
        )}
      </path>
    </g>
  );
}

interface TempEdgeProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
}

export function TempEdge({ start, end }: TempEdgeProps) {
  const path = getBezierPath(start, end);
  
  return (
    <path
      d={path}
      fill="none"
      stroke="#3b82f6"
      strokeWidth={2}
      strokeDasharray="8 4"
      strokeLinecap="round"
      pointerEvents="none"
    />
  );
}
