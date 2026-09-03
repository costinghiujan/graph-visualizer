export interface BFSStep {
  currentNode: string;
  visitedNodes: string[];
  queue: string[];
  traversedEdges: string[];
  description: string;
}

export function generateBFSSteps(
  nodes: string[],
  edges: Array<{ source: string; target: string }>,
  startNode: string
): BFSStep[] {
  if (!startNode || !nodes.includes(startNode)) return [];

  // Construire listă de adiacență neorientată
  const adj: Map<string, string[]> = new Map();
  nodes.forEach((n) => adj.set(n, []));
  edges.forEach(({ source, target }) => {
    if (adj.has(source) && adj.has(target)) {
      adj.get(source)!.push(target);
      adj.get(target)!.push(source);
    }
  });

  // Sortăm vecinii alfanumeric pentru o parcurgere deterministă
  adj.forEach((neighbors) => neighbors.sort());

  const steps: BFSStep[] = [];
  const visited = new Set<string>();
  const queue: string[] = [startNode];
  const traversedEdgeSet = new Set<string>();

  visited.add(startNode);

  steps.push({
    currentNode: startNode,
    visitedNodes: Array.from(visited),
    queue: [...queue],
    traversedEdges: [],
    description: `Inițializare BFS din nodul "${startNode}".`,
  });

  while (queue.length > 0) {
    const current = queue.shift()!;

    steps.push({
      currentNode: current,
      visitedNodes: Array.from(visited),
      queue: [...queue],
      traversedEdges: Array.from(traversedEdgeSet),
      description: `Explorare vecini pentru nodul "${current}".`,
    });

    const neighbors = adj.get(current) || [];
    for (const neighbor of neighbors) {
      const edgeKey = [current, neighbor].sort().join('--');

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        traversedEdgeSet.add(edgeKey);

        steps.push({
          currentNode: current,
          visitedNodes: Array.from(visited),
          queue: [...queue],
          traversedEdges: Array.from(traversedEdgeSet),
          description: `Vecinul nevizitat "${neighbor}" a fost adăugat în coadă.`,
        });
      }
    }
  }

  return steps;
}