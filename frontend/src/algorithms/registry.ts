// frontend/src/algorithms/registry.ts
import type { GraphAlgorithm, AlgorithmStep } from './types';

// Helper generic: construiește lista de adiacență neorientată
export function buildAdjacencyList(
  nodes: string[],
  edges: Array<{ source: string; target: string }>
): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n, []));

  edges.forEach(({ source, target }) => {
    if (adj.has(source) && adj.has(target)) {
      adj.get(source)!.push(target);
      adj.get(target)!.push(source);
    }
  });

  adj.forEach((neighbors) => neighbors.sort());
  return adj;
}

// 1. Breadth-First Search (BFS)
export const BFSAlgorithm: GraphAlgorithm = {
  id: 'BFS',
  name: 'Breadth-First Search (BFS)',
  run: (nodes, edges, startNode) => {
    if (!startNode || !nodes.includes(startNode)) return [];

    const adj = buildAdjacencyList(nodes, edges);
    const steps: AlgorithmStep[] = [];
    const visited = new Set<string>();
    const queue: string[] = [startNode];
    const traversedEdges = new Set<string>();

    visited.add(startNode);
    steps.push({
      currentNode: startNode,
      visitedNodes: Array.from(visited),
      activeNodes: [...queue],
      traversedEdges: [],
      description: `Start BFS din nodul "${startNode}".`,
    });

    while (queue.length > 0) {
      const current = queue.shift()!;

      steps.push({
        currentNode: current,
        visitedNodes: Array.from(visited),
        activeNodes: [...queue],
        traversedEdges: Array.from(traversedEdges),
        description: `Explorare vecini pentru "${current}".`,
      });

      const neighbors = adj.get(current) || [];
      for (const neighbor of neighbors) {
        const edgeKey = [current, neighbor].sort().join('--');

        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
          traversedEdges.add(edgeKey);

          steps.push({
            currentNode: current,
            visitedNodes: Array.from(visited),
            activeNodes: [...queue],
            traversedEdges: Array.from(traversedEdges),
            activeEdge: { source: current, target: neighbor },
            description: `Descoperit "${neighbor}".`,
          });
        }
      }
    }

    return steps;
  },
};

// 2. Depth-First Search (DFS)
export const DFSAlgorithm: GraphAlgorithm = {
  id: 'DFS',
  name: 'Depth-First Search (DFS)',
  run: (nodes, edges, startNode) => {
    if (!startNode || !nodes.includes(startNode)) return [];

    const adj = buildAdjacencyList(nodes, edges);
    const steps: AlgorithmStep[] = [];
    const visited = new Set<string>();
    const traversedEdges = new Set<string>();

    // Folosim o stivă de perechi [nodCurent, nodParinte]
    const stack: Array<{ node: string; parent: string | null }> = [
      { node: startNode, parent: null },
    ];

    steps.push({
      currentNode: startNode,
      visitedNodes: [],
      activeNodes: [startNode],
      traversedEdges: [],
      description: `Inițializare stivă DFS cu nodul "${startNode}".`,
    });

    while (stack.length > 0) {
      const { node: current, parent } = stack.pop()!;

      if (!visited.has(current)) {
        visited.add(current);

        if (parent !== null) {
          const edgeKey = [parent, current].sort().join('--');
          traversedEdges.add(edgeKey);
        }

        steps.push({
          currentNode: current,
          visitedNodes: Array.from(visited),
          activeNodes: stack.map((item) => item.node),
          traversedEdges: Array.from(traversedEdges),
          description: `Vizitare nod "${current}" în adâncime.`,
        });

        const neighbors = adj.get(current) || [];
        // Inversăm vecinii înainte de push în stivă pentru a-i explora în ordine alfanumerică (LIFO)
        for (let i = neighbors.length - 1; i >= 0; i--) {
          const neighbor = neighbors[i];
          if (!visited.has(neighbor)) {
            stack.push({ node: neighbor, parent: current });
          }
        }

        if (stack.length > 0) {
          steps.push({
            currentNode: current,
            visitedNodes: Array.from(visited),
            activeNodes: stack.map((item) => item.node),
            traversedEdges: Array.from(traversedEdges),
            description: `Actualizare stivă DFS. Urmează: "${stack[stack.length - 1].node}".`,
          });
        }
      }
    }

    return steps;
  },
};

// Registrul de algoritmi disponibili
export const ALGORITHM_REGISTRY: Record<string, GraphAlgorithm> = {
  BFS: BFSAlgorithm,
  DFS: DFSAlgorithm,
};