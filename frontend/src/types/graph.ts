export interface PhysicsNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  isDragging: boolean;
}

export interface SimulationConfig {
  center: { x: number; y: number };
  repulsion: number;
  minDistance: number;
  centerGravity: number;
  damping: number;
  stopThreshold: number;
}