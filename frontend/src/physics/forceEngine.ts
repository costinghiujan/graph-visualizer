import type { PhysicsNode, SimulationConfig } from '../types/graph';

export const DEFAULT_CONFIG: SimulationConfig = {
  center: { x: 350, y: 300 }, // Punctul central dorit
  repulsion: 8000,
  minDistance: 35,
  centerGravity: 0.02,
  damping: 0.82,
  stopThreshold: 0.04,
};

export class ForceEngine {
  private nodes: Map<string, PhysicsNode> = new Map();
  private config: SimulationConfig;

  constructor(config: SimulationConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  public syncNodes(labels: string[]): void {
    const nextNodes = new Map<string, PhysicsNode>();

    labels.forEach((label, idx) => {
      const existing = this.nodes.get(label);
      if (existing) {
        nextNodes.set(label, existing);
      } else {
        const angle = (idx / Math.max(labels.length, 1)) * 2 * Math.PI;
        const offset = 20 + (idx % 3) * 10;
        nextNodes.set(label, {
          id: label,
          x: this.config.center.x + Math.cos(angle) * offset,
          y: this.config.center.y + Math.sin(angle) * offset,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          isDragging: false,
        });
      }
    });

    this.nodes = nextNodes;
  }

  public updateNodePosition(id: string, x: number, y: number, isDragging: boolean): void {
    const node = this.nodes.get(id);
    if (node) {
      node.x = x;
      node.y = y;
      node.isDragging = isDragging;
      node.vx = 0;
      node.vy = 0;
    }
  }

  public step(): boolean {
    const pNodes = Array.from(this.nodes.values());
    if (pNodes.length === 0) return false;

    let totalEnergy = 0;

    // 1. Forțe de repulsie reciprocă (Coulomb)
    for (let i = 0; i < pNodes.length; i++) {
      for (let j = i + 1; j < pNodes.length; j++) {
        const u = pNodes[i];
        const v = pNodes[j];

        let dx = u.x - v.x;
        let dy = u.y - v.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 1) {
          dx = (Math.random() - 0.5) * 2;
          dy = (Math.random() - 0.5) * 2;
          dist = 1;
        }

        const effectiveDist = Math.max(dist, this.config.minDistance);
        const force = this.config.repulsion / (effectiveDist * effectiveDist);

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (!u.isDragging) {
          u.vx += fx;
          u.vy += fy;
        }
        if (!v.isDragging) {
          v.vx -= fx;
          v.vy -= fy;
        }
      }
    }

    // 2. Atracție gravitațională spre centrul fix
    pNodes.forEach((node) => {
      if (node.isDragging) return;

      const gravityX = (this.config.center.x - node.x) * this.config.centerGravity;
      const gravityY = (this.config.center.y - node.y) * this.config.centerGravity;

      node.vx = (node.vx + gravityX) * this.config.damping;
      node.vy = (node.vy + gravityY) * this.config.damping;

      node.x += node.vx;
      node.y += node.vy;

      totalEnergy += Math.abs(node.vx) + Math.abs(node.vy);
    });

    const hasDragging = pNodes.some((n) => n.isDragging);
    return totalEnergy > this.config.stopThreshold || hasDragging;
  }

  public getPositions(): Map<string, { x: number; y: number }> {
    const result = new Map<string, { x: number; y: number }>();
    this.nodes.forEach((n, id) => result.set(id, { x: n.x, y: n.y }));
    return result;
  }
}