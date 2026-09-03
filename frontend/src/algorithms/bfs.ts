import type { GraphAlgorithm, AlgorithmStep } from './types';
import { buildAdjacencyList } from './utils';

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