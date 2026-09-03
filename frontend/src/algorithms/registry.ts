import type { GraphAlgorithm } from './types';
import { BFSAlgorithm } from './bfs';
import { DFSAlgorithm } from './dfs';

export const ALGORITHM_REGISTRY: Record<string, GraphAlgorithm> = {
  [BFSAlgorithm.id]: BFSAlgorithm,
  [DFSAlgorithm.id]: DFSAlgorithm,
};

export { BFSAlgorithm, DFSAlgorithm };