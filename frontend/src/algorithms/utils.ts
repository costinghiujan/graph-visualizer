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