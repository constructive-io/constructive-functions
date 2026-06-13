import React, { useCallback, useRef, useState } from 'react';
import { useGraph, useSelection } from '../context/GraphContext';
import type { Node, Port } from '@fbp/types';
import { NodeIconSvg } from './NodeIcon';
import { BOUNDARY_NODE_KINDS, getPortNameFromBoundary, getDataTypeFromBoundary } from '../types';

// Derive ports from boundary nodes inside a subnet (ensures ports are always in sync)
export function deriveBoundaryPorts(nodes: Node[], type: 'input' | 'output'): Port[] {
  const nodeKind = type === 'input' ? BOUNDARY_NODE_KINDS.input : BOUNDARY_NODE_KINDS.output;
  return nodes
    .filter(n => n.type === nodeKind)
    .map(n => {
      const portName = getPortNameFromBoundary(n) || n.name;
      const portType = getDataTypeFromBoundary(n);
      return { name: portName, type: portType };
    });
}

// Standard compact node dimensions
const NODE_WIDTH = 240;
const NODE_HEADER_HEIGHT = 32;
const PORT_HEIGHT = 24;
const PORT_RADIUS = 6;

// Rich function card dimensions (same width as compact for uniformity)
const RICH_NODE_WIDTH = NODE_WIDTH;
const RICH_HEADER_HEIGHT = NODE_HEADER_HEIGHT;
const RICH_DESC_HEIGHT = 22;
const RICH_META_HEIGHT = 20;

interface GraphNodeProps {
  node: Node;
  onStartConnect: (nodeId: string, portName: string, isOutput: boolean, position: { x: number; y: number }) => void;
  onEndConnect?: (nodeId: string, portName: string, isOutput: boolean) => void;
}

// Get node prop value helper
function getNodeProp(node: Node, propName: string): any {
  const prop = node.props?.find(p => p.name === propName);
  return prop?.value;
}

export function GraphNode({ node, onStartConnect, onEndConnect }: GraphNodeProps) {
  const { state, dispatch, getDefinition, getShortName } = useGraph();
  const { selection, selectNodes } = useSelection();
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredPort, setHoveredPort] = useState<{ name: string; isOutput: boolean } | null>(null);
  const dragStart = useRef<{ x: number; y: number; nodeX: number; nodeY: number } | null>(null);

  const definition = getDefinition(node.type);
  const isSelected = selection.nodeIds.has(node.name);
  const isPreview = state.boxSelect.previewNodeIds.has(node.name);
  const isSubnet = node.nodes && node.nodes.length > 0;
  const isRichNode = definition?.category === 'functions';

  // For subnets, derive inputs/outputs from boundary nodes inside
  const inputs = isSubnet 
    ? deriveBoundaryPorts(node.nodes || [], 'input')
    : (node.inputs || definition?.inputs || []);
  const outputs = isSubnet 
    ? deriveBoundaryPorts(node.nodes || [], 'output')
    : (node.outputs || definition?.outputs || []);

  const x = node.meta?.x || 0;
  const y = node.meta?.y || 0;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    let nodesToDrag: string[];
    const additive = e.shiftKey;

    if (additive) {
      nodesToDrag = [...Array.from(state.selection.nodeIds), node.name];
      selectNodes([node.name], true);
    } else if (isSelected) {
      nodesToDrag = Array.from(state.selection.nodeIds);
    } else {
      nodesToDrag = [node.name];
      selectNodes([node.name], false);
    }

    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, nodeX: x, nodeY: y };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!dragStart.current) return;
      const dx = (moveEvent.clientX - dragStart.current.x) / state.view.zoom;
      const dy = (moveEvent.clientY - dragStart.current.y) / state.view.zoom;
      dispatch({
        type: 'MOVE_NODES',
        nodeIds: nodesToDrag,
        delta: { x: dx, y: dy }
      });
      dragStart.current = { ...dragStart.current, x: moveEvent.clientX, y: moveEvent.clientY };
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStart.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [node.name, isSelected, x, y, state.view.zoom, state.selection.nodeIds, selectNodes, dispatch]);

  const handlePortMouseDown = useCallback((e: React.MouseEvent, portName: string, isOutput: boolean, portY: number, portX: number) => {
    e.stopPropagation();
    onStartConnect(node.name, portName, isOutput, { x: portX, y: portY });
  }, [node.name, onStartConnect]);

  const handlePortMouseUp = useCallback((e: React.MouseEvent, portName: string, isOutput: boolean) => {
    e.stopPropagation();
    if (state.connecting.active && onEndConnect) {
      onEndConnect(node.name, portName, isOutput);
    }
  }, [node.name, state.connecting.active, onEndConnect]);

  const getPortColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'number': return '#4ade80';
      case 'string': return '#f472b6';
      case 'boolean': return '#facc15';
      case 'json':
      case 'object': return '#60a5fa';
      case 'array': return '#a78bfa';
      default: return '#94a3b8';
    }
  };

  // ── Rich function card rendering ──
  // Uses same width as compact nodes; adds description + metadata rows below header
  if (isRichNode) {
    const width = RICH_NODE_WIDTH;
    const description = definition?.description || '';
    const secretsCount = getNodeProp(node, 'secretsCount') ?? 0;
    const configsCount = getNodeProp(node, 'configsCount') ?? 0;
    const scope = getNodeProp(node, 'scope') || definition?.context || 'platform';

    // Layout: header + description + metadata + ports
    const bodyTop = RICH_HEADER_HEIGHT;
    const descTop = bodyTop + 4;
    const metaTop = descTop + RICH_DESC_HEIGHT;
    const portStartY = metaTop + RICH_META_HEIGHT + 2;
    const portRows = Math.max(inputs.length, outputs.length, 1);
    const totalHeight = portStartY + portRows * PORT_HEIGHT + 4;

    return (
      <g
        transform={`translate(${x}, ${y})`}
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Node name label above */}
        <text
          x={width / 2}
          y={-8}
          textAnchor="middle"
          fill="#52525b"
          fontSize={10}
          fontFamily="system-ui, sans-serif"
        >
          {node.name}
        </text>
        {/* Shadow */}
        <rect
          x={3} y={3}
          width={width} height={totalHeight}
          rx={10} ry={10}
          fill="rgba(0,0,0,0.3)"
        />

        {/* Card background */}
        <rect
          width={width} height={totalHeight}
          rx={10} ry={10}
          fill="#18181b"
        />

        {/* Header background */}
        <rect
          width={width}
          height={RICH_HEADER_HEIGHT}
          rx={10} ry={10}
          fill="#27272a"
        />
        <rect
          y={RICH_HEADER_HEIGHT - 10}
          width={width} height={10}
          fill="#27272a"
        />

        {/* Border */}
        <rect
          width={width} height={totalHeight}
          rx={10} ry={10}
          fill="none"
          stroke={isSelected || isPreview ? '#3b82f6' : '#3f3f46'}
          strokeWidth={isSelected || isPreview ? 2 : 1}
        />

        {/* Header: icon + name (same layout as compact) */}
        <g transform={`translate(14, ${RICH_HEADER_HEIGHT / 2})`}>
          <g transform="translate(-2, -6)">
            <NodeIconSvg icon={definition?.icon || 'circle'} size={12} />
          </g>
          <text
            x={16}
            dominantBaseline="middle"
            fill="#e4e4e7"
            fontSize={13}
            fontWeight={600}
            fontFamily="system-ui, sans-serif"
          >
            {getShortName(node.type)}
          </text>
        </g>

        {/* Description (single line, truncated) */}
        {description && (
          <text
            x={14} y={descTop + 14}
            fill="#71717a"
            fontSize={10}
            fontFamily="system-ui, sans-serif"
          >
            {description.length > 38 ? description.slice(0, 35) + '…' : description}
          </text>
        )}

        {/* Metadata row: scope badge + secrets + configs */}
        <g transform={`translate(14, ${metaTop + 2})`}>
          <rect x={0} y={0} width={scope.length * 5.5 + 10} height={14} rx={3} fill="#27272a" />
          <text x={5} y={10} fill="#a1a1aa" fontSize={9} fontFamily="system-ui">{scope}</text>
          {secretsCount > 0 && (
            <>
              <text x={scope.length * 5.5 + 16} y={10} fill="#71717a" fontSize={9} fontFamily="system-ui">🔒{secretsCount}</text>
            </>
          )}
          {configsCount > 0 && (
            <text x={scope.length * 5.5 + (secretsCount > 0 ? 42 : 16)} y={10} fill="#71717a" fontSize={9} fontFamily="system-ui">⚙{configsCount}</text>
          )}
        </g>

        {/* Input ports (left) */}
        {inputs.map((port, i) => {
          const portY = portStartY + i * PORT_HEIGHT + PORT_HEIGHT / 2;
          const isValidDrop = state.connecting.active && state.connecting.isOutput && state.connecting.sourceNode !== node.name;
          const isHov = hoveredPort?.name === port.name && !hoveredPort?.isOutput;
          const highlight = isValidDrop && isHov;
          const isOptional = 'optional' in port && port.optional;
          return (
            <g key={`input-${port.name}`}>
              <circle
                cx={0} cy={portY}
                r={PORT_RADIUS}
                fill={highlight ? '#60a5fa' : isOptional ? '#18181b' : '#3b82f6'}
                stroke={isOptional ? '#3b82f6' : '#18181b'}
                strokeWidth={2}
                style={{ cursor: 'crosshair' }}
                onMouseDown={(e) => handlePortMouseDown(e, port.name, false, y + portY, x)}
                onMouseUp={(e) => handlePortMouseUp(e, port.name, false)}
                onMouseEnter={() => setHoveredPort({ name: port.name, isOutput: false })}
                onMouseLeave={() => setHoveredPort(null)}
              />
              <text
                x={12} y={portY}
                dominantBaseline="middle"
                fill={isOptional ? '#64748b' : '#a1a1aa'}
                fontSize={11}
                fontFamily="system-ui, sans-serif"
              >
                {port.name}
              </text>
            </g>
          );
        })}

        {/* Output ports (right) */}
        {outputs.map((port, i) => {
          const portY = portStartY + i * PORT_HEIGHT + PORT_HEIGHT / 2;
          const isValidDrop = state.connecting.active && !state.connecting.isOutput && state.connecting.sourceNode !== node.name;
          const isHov = hoveredPort?.name === port.name && hoveredPort?.isOutput;
          const highlight = isValidDrop && isHov;
          return (
            <g key={`output-${port.name}`}>
              <circle
                cx={width} cy={portY}
                r={PORT_RADIUS}
                fill={highlight ? '#60a5fa' : '#22c55e'}
                stroke="#18181b"
                strokeWidth={2}
                style={{ cursor: 'crosshair' }}
                onMouseDown={(e) => handlePortMouseDown(e, port.name, true, y + portY, x + width)}
                onMouseUp={(e) => handlePortMouseUp(e, port.name, true)}
                onMouseEnter={() => setHoveredPort({ name: port.name, isOutput: true })}
                onMouseLeave={() => setHoveredPort(null)}
              />
              <text
                x={width - 12} y={portY}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#a1a1aa"
                fontSize={11}
                fontFamily="system-ui, sans-serif"
              >
                {port.name}
              </text>
            </g>
          );
        })}
      </g>
    );
  }

  // ── Standard compact node rendering ──
  const nodeHeight = NODE_HEADER_HEIGHT + Math.max(inputs.length, outputs.length, 1) * PORT_HEIGHT + 8;
  const headerFill = isSubnet ? '#7c3aed' : '#27272a';

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onMouseDown={handleMouseDown}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Node name label above */}
      <text
        x={NODE_WIDTH / 2}
        y={-8}
        textAnchor="middle"
        fill="#52525b"
        fontSize={10}
        fontFamily="system-ui, sans-serif"
      >
        {node.name}
      </text>
      {/* Shadow */}
      <rect
        x={3} y={3}
        width={NODE_WIDTH}
        height={nodeHeight}
        rx={10}
        ry={10}
        fill="rgba(0,0,0,0.3)"
      />

      {/* Background fill */}
      <rect
        width={NODE_WIDTH}
        height={nodeHeight}
        rx={10}
        ry={10}
        fill="#18181b"
      />

      {/* Header background */}
      <rect
        width={NODE_WIDTH}
        height={NODE_HEADER_HEIGHT}
        rx={10}
        ry={10}
        fill={headerFill}
      />
      <rect
        y={NODE_HEADER_HEIGHT - 10}
        width={NODE_WIDTH}
        height={10}
        fill={headerFill}
      />

      {/* Border */}
      <rect
        width={NODE_WIDTH}
        height={nodeHeight}
        rx={10}
        ry={10}
        fill="none"
        stroke={isSelected || isPreview ? '#3b82f6' : '#3f3f46'}
        strokeWidth={isSelected || isPreview ? 2 : 1}
      />

      {/* Header: icon + title aligned together */}
      <g transform={`translate(14, ${NODE_HEADER_HEIGHT / 2})`}>
        {definition?.icon && (
          <g transform="translate(-2, -6)">
            <NodeIconSvg icon={definition.icon} size={12} />
          </g>
        )}
        <text
          x={definition?.icon ? 16 : 0}
          dominantBaseline="middle"
          fill="#e4e4e7"
          fontSize={13}
          fontWeight={600}
          fontFamily="system-ui, sans-serif"
        >
          {getShortName(node.type)}
        </text>
      </g>

      {isSubnet && (
        <text
          x={NODE_WIDTH - 10}
          y={NODE_HEADER_HEIGHT / 2}
          textAnchor="end"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.6)"
          fontSize={10}
          fontFamily="system-ui, sans-serif"
        >
          subnet
        </text>
      )}

      {inputs.map((port, i) => {
        const isValidDropTarget = state.connecting.active && state.connecting.isOutput && state.connecting.sourceNode !== node.name;
        const isHovered = hoveredPort?.name === port.name && hoveredPort?.isOutput === false;
        const highlight = isValidDropTarget && isHovered;
        const isOptional = 'optional' in port && port.optional;
        const portColor = getPortColor(port.type);
        return (
          <g key={`input-${port.name}`} transform={`translate(0, ${NODE_HEADER_HEIGHT + i * PORT_HEIGHT})`}>
            <circle
              cx={0}
              cy={PORT_HEIGHT / 2}
              r={PORT_RADIUS}
              fill={highlight ? '#60a5fa' : isOptional ? '#18181b' : portColor}
              stroke={isOptional ? portColor : '#18181b'}
              strokeWidth={2}
              style={{ cursor: 'crosshair' }}
              onMouseDown={(e) => handlePortMouseDown(e, port.name, false, y + NODE_HEADER_HEIGHT + i * PORT_HEIGHT + PORT_HEIGHT / 2, x)}
              onMouseUp={(e) => handlePortMouseUp(e, port.name, false)}
              onMouseEnter={() => setHoveredPort({ name: port.name, isOutput: false })}
              onMouseLeave={() => setHoveredPort(null)}
            />
            <text
              x={12}
              y={PORT_HEIGHT / 2}
              dominantBaseline="middle"
              fill={isOptional ? '#64748b' : '#a1a1aa'}
              fontSize={11}
              fontFamily="system-ui, sans-serif"
            >
              {port.name}
            </text>
          </g>
        );
      })}

      {outputs.map((port, i) => {
        const isValidDropTarget = state.connecting.active && !state.connecting.isOutput && state.connecting.sourceNode !== node.name;
        const isHovered = hoveredPort?.name === port.name && hoveredPort?.isOutput === true;
        const highlight = isValidDropTarget && isHovered;
        return (
          <g key={`output-${port.name}`} transform={`translate(0, ${NODE_HEADER_HEIGHT + i * PORT_HEIGHT})`}>
            <circle
              cx={NODE_WIDTH}
              cy={PORT_HEIGHT / 2}
              r={PORT_RADIUS}
              fill={highlight ? '#60a5fa' : getPortColor(port.type)}
              stroke="#18181b"
              strokeWidth={2}
              style={{ cursor: 'crosshair' }}
              onMouseDown={(e) => handlePortMouseDown(e, port.name, true, y + NODE_HEADER_HEIGHT + i * PORT_HEIGHT + PORT_HEIGHT / 2, x + NODE_WIDTH)}
              onMouseUp={(e) => handlePortMouseUp(e, port.name, true)}
              onMouseEnter={() => setHoveredPort({ name: port.name, isOutput: true })}
              onMouseLeave={() => setHoveredPort(null)}
            />
            <text
              x={NODE_WIDTH - 12}
              y={PORT_HEIGHT / 2}
              textAnchor="end"
              dominantBaseline="middle"
              fill="#a1a1aa"
              fontSize={11}
              fontFamily="system-ui, sans-serif"
            >
              {port.name}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export function getNodePortPosition(
  node: Node,
  portName: string,
  isOutput: boolean,
  definition?: { inputs?: Port[]; outputs?: Port[]; category?: string }
): { x: number; y: number } | null {
  const x = node.meta?.x || 0;
  const y = node.meta?.y || 0;
  
  const isSubnet = node.nodes && node.nodes.length > 0;
  const isRich = definition?.category === 'functions';
  const ports = isSubnet
    ? deriveBoundaryPorts(node.nodes || [], isOutput ? 'output' : 'input')
    : isOutput
      ? (node.outputs || definition?.outputs || [])
      : (node.inputs || definition?.inputs || []);
  
  const portIndex = ports.findIndex(p => p.name === portName);
  if (portIndex === -1) return null;

  if (isRich) {
    const portStartY = RICH_HEADER_HEIGHT + 4 + RICH_DESC_HEIGHT + RICH_META_HEIGHT + 2;
    return {
      x: isOutput ? x + RICH_NODE_WIDTH : x,
      y: y + portStartY + portIndex * PORT_HEIGHT + PORT_HEIGHT / 2
    };
  }
  
  return {
    x: isOutput ? x + NODE_WIDTH : x,
    y: y + NODE_HEADER_HEIGHT + portIndex * PORT_HEIGHT + PORT_HEIGHT / 2
  };
}

export function getNodeWidth(node: Node, definition?: { category?: string }): number {
  if (definition?.category === 'functions') return RICH_NODE_WIDTH;
  return NODE_WIDTH;
}

export { NODE_WIDTH, NODE_HEADER_HEIGHT, PORT_HEIGHT, RICH_NODE_WIDTH };
