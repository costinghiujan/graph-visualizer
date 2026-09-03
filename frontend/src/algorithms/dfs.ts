import type { GraphAlgorithm, AlgorithmStep } from './types';
import { buildAdjacencyList } from './utils';

export const DFSAlgorithm: GraphAlgorithm = {
  id: 'DFS',
  name: 'Depth-First Search (DFS)',
  run: (nodes, edges, startNode) => {
    if (!startNode || !nodes.includes(startNode)) return [];

    const adj = buildAdjacencyList(nodes, edges);
    const steps: AlgorithmStep[] = [];
    const visited = new Set<string>();
    const traversedEdges = new Set<string>();

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