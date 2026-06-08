import type { Point } from '../context/GraphContext';

export function screenToCanvas(screenPoint: Point, pan: Point, zoom: number): Point {
  return {
    x: (screenPoint.x - pan.x) / zoom,
    y: (screenPoint.y - pan.y) / zoom
  };
}

export function canvasToScreen(canvasPoint: Point, pan: Point, zoom: number): Point {
  return {
    x: canvasPoint.x * zoom + pan.x,
    y: canvasPoint.y * zoom + pan.y
  };
}

export function getBezierPath(
  start: Point,
  end: Point,
  curvature: number = 0.5
): string {
  const dx = end.x - start.x;
  const controlOffset = Math.abs(dx) * curvature;
  
  const cp1 = { x: start.x + controlOffset, y: start.y };
  const cp2 = { x: end.x - controlOffset, y: end.y };
  
  return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
}

export function pointInRect(point: Point, rect: { x: number; y: number; width: number; height: number }): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function rectsOverlap(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number }
): boolean {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  );
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function distance(a: Point, b: Point): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}
