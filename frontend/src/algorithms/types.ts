export interface AlgorithmStep {
  currentNode?: string;
  visitedNodes: string[];
  activeNodes?: string[];     // queue pentru BFS, stack pentru DFS, etc.
  traversedEdges: string[];   // muchii parcurse
  activeEdge?: { source: string; target: string }; // muchia în curs de explorare
  description: string;
}

export interface GraphAlgorithm {
  id: string;
  name: string;
  run: (
    nodes: string[],
    edges: Array<{ source: string; target: string }>,
    startNode: string
  ) => AlgorithmStep[];
}