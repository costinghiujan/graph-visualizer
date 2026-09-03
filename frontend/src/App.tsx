import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type OnNodeDrag,
  type NodeMouseHandler,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { theme } from './styles/theme';
import { ForceEngine } from './physics/forceEngine';
import { Sidebar, parseGraphInput } from './components/Sidebar';
import { CustomCircleNode } from './components/CustomCircleNode';
import { AnimatedEdge } from './components/AnimatedEdge';
import { TopBar } from './components/TopBar';
import { ALGORITHM_REGISTRY } from './algorithms/registry';
import type { AlgorithmStep } from './algorithms/types';

export function App() {
  const [inputText, setInputText] = useState<string>('1\n2\n3\n4\n1 2\n2 3\n1 4');
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const [selectedAlgoId, setSelectedAlgoId] = useState<string>('BFS');
  const [startNode, setStartNode] = useState<string | null>('1');
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Referință sigură pentru timer pentru a putea opri rularea instantaneu la Reset
  const intervalRef = useRef<number | null>(null);

  const nodeTypes = useMemo(() => ({ custom: CustomCircleNode }), []);
  const edgeTypes = useMemo(() => ({ animated: AnimatedEdge }), []);

  const engineRef = useRef<ForceEngine>(new ForceEngine());
  const animFrameRef = useRef<number | null>(null);

  const runPhysicsLoop = useCallback(() => {
    if (animFrameRef.current !== null) return;
    const loop = () => {
      const isMoving = engineRef.current.step();
      const positions = engineRef.current.getPositions();

      setNodes((curr) =>
        curr.map((n) => {
          const pos = positions.get(n.id);
          return pos ? { ...n, position: { x: pos.x, y: pos.y } } : n;
        })
      );

      if (isMoving) {
        animFrameRef.current = requestAnimationFrame(loop);
      } else {
        animFrameRef.current = null;
      }
    };
    animFrameRef.current = requestAnimationFrame(loop);
  }, [setNodes]);

  const applyStep = useCallback(
    (step: AlgorithmStep) => {
      setNodes((curr) =>
        curr.map((n) => {
          let status: 'idle' | 'start' | 'current' | 'visited' | 'queued' = 'idle';

          if (n.id === step.currentNode) {
            status = 'current';
          } else if (step.activeNodes?.includes(n.id)) {
            status = 'queued';
          } else if (step.visitedNodes.includes(n.id)) {
            status = 'visited';
          }

          return {
            ...n,
            data: {
              ...n.data,
              status,
              isSelected: n.id === startNode,
            },
          };
        })
      );

      setEdges((curr) =>
        curr.map((e) => {
          const key = [e.source, e.target].sort().join('--');
          const isTraversed = step.traversedEdges.includes(key);

          return {
            ...e,
            data: { ...e.data, isTraversed },
          };
        })
      );
    },
    [setNodes, setEdges, startNode]
  );

  // RESET COMPLET: Curăță timer-ul și readuce nodurile la starea inițială
  const handleReset = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);

    setNodes((curr) =>
      curr.map((n) => ({
        ...n,
        data: {
          ...n.data,
          status: 'idle',
          isSelected: n.id === startNode,
        },
      }))
    );

    setEdges((curr) =>
      curr.map((e) => ({
        ...e,
        data: { ...e.data, isTraversed: false },
      }))
    );
  }, [setNodes, setEdges, startNode]);

  const syncGraph = useCallback(
    (text: string) => {
      const { nodes: validNodes, edges: validEdges } = parseGraphInput(text);

      engineRef.current.syncNodes(validNodes);
      const positions = engineRef.current.getPositions();

      setNodes(
        validNodes.map((label) => ({
          id: label,
          type: 'custom',
          data: { label, status: 'idle', isSelected: label === startNode },
          position: positions.get(label) || { x: 350, y: 300 },
        }))
      );

      setEdges(
        validEdges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: 'animated',
          data: { isTraversed: false },
        }))
      );

      runPhysicsLoop();
    },
    [setNodes, setEdges, startNode, runPhysicsLoop]
  );

  useEffect(() => {
    syncGraph(inputText);
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, []);

  const handleTextChange = (text: string) => {
    setInputText(text);
    handleReset();
    syncGraph(text);
  };

  const onNodeClick: NodeMouseHandler = (_, clickedNode) => {
    if (isRunning) return;
    setStartNode(clickedNode.id);
    handleReset();

    setNodes((curr) =>
      curr.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isSelected: n.id === clickedNode.id,
        },
      }))
    );
  };

  const handleStart = () => {
    if (!startNode || isRunning) return;

    const algo = ALGORITHM_REGISTRY[selectedAlgoId];
    if (!algo) return;

    const { nodes: validNodes, edges: validEdges } = parseGraphInput(inputText);
    const steps = algo.run(validNodes, validEdges, startNode);
    if (steps.length === 0) return;

    handleReset();
    setIsRunning(true);

    let idx = 0;
    applyStep(steps[0]);

    intervalRef.current = window.setInterval(() => {
      idx++;
      if (idx < steps.length) {
        applyStep(steps[idx]);
      } else {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsRunning(false);
      }
    }, 700);
  };

  // Handlers drag
  const onNodeDragStart: OnNodeDrag = (_, node) => {
    engineRef.current.updateNodePosition(node.id, node.position.x, node.position.y, true);
    runPhysicsLoop();
  };
  const onNodeDrag: OnNodeDrag = (_, node) => {
    engineRef.current.updateNodePosition(node.id, node.position.x, node.position.y, true);
    runPhysicsLoop();
  };
  const onNodeDragStop: OnNodeDrag = (_, node) => {
    engineRef.current.updateNodePosition(node.id, node.position.x, node.position.y, false);
    runPhysicsLoop();
  };

  return (
    <div style={styles.container}>
      <TopBar
        selectedAlgorithmId={selectedAlgoId}
        onSelectAlgorithm={(id) => {
          setSelectedAlgoId(id);
          handleReset();
        }}
        startNode={startNode}
        isRunning={isRunning}
        onStart={handleStart}
        onReset={handleReset}
      />

      <div style={styles.sidebarWrapper}>
        <Sidebar
          inputText={inputText}
          onTextChange={handleTextChange}
          activeNodesCount={nodes.length}
          activeEdgesCount={edges.length}
          isOpen={true}
        />
      </div>

      <main style={styles.canvasContainer}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={false}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          proOptions={{ hideAttribution: true }}
          fitView
        >
          <Background color={theme.colors.border} variant={BackgroundVariant.Dots} gap={20} size={1.2} />
        </ReactFlow>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    width: '100vw',
    height: '100vh',
    backgroundColor: theme.colors.bgApp,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily,
    overflow: 'hidden',
    position: 'relative',
  },
  sidebarWrapper: {
    height: '100%',
    zIndex: 30,
    flexShrink: 0,
  },
  canvasContainer: {
    flex: 1,
    height: '100%',
    position: 'relative',
    minWidth: 0,
  },
};

export default App;