import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type OnNodeDrag,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ForceEngine } from './physics/forceEngine';
import { Sidebar, parseGraphInput } from './components/Sidebar';
import { CustomCircleNode } from './components/CustomCircleNode';

export function App() {
  const [inputText, setInputText] = useState<string>('');
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const nodeTypes = useMemo(() => ({ custom: CustomCircleNode }), []);

  const engineRef = useRef<ForceEngine>(new ForceEngine());
  const animFrameRef = useRef<number | null>(null);

  const runPhysicsLoop = useCallback(() => {
    if (animFrameRef.current !== null) return;

    const loop = () => {
      const isMoving = engineRef.current.step();
      const positions = engineRef.current.getPositions();

      setNodes((currNodes) =>
        currNodes.map((node) => {
          const pos = positions.get(node.id);
          if (!pos) return node;
          return { ...node, position: { x: pos.x, y: pos.y } };
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

  useEffect(() => {
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const handleTextChange = (text: string) => {
    setInputText(text);

    const { nodes: validNodes, edges: validEdges } = parseGraphInput(text);

    // 1. Sincronizare motor fizic cu nodurile valide
    engineRef.current.syncNodes(validNodes);
    const positions = engineRef.current.getPositions();

    // 2. Actualizare noduri React Flow
    setNodes(
      validNodes.map((label) => ({
        id: label,
        type: 'custom',
        data: { label },
        position: positions.get(label) || { x: 350, y: 300 },
      }))
    );

    // 3. Actualizare muchii React Flow
    setEdges(
      validEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'straight',
        style: { stroke: '#38bdf8', strokeWidth: 2 },
      }))
    );

    runPhysicsLoop();
  };

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
      <Sidebar
        inputText={inputText}
        onTextChange={handleTextChange}
        activeNodesCount={nodes.length}
        activeEdgesCount={edges.length}
      />

      <main style={styles.canvasContainer}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={false}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStart={onNodeDragStart}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          fitView
        >
          <Background color="#1e293b" variant={BackgroundVariant.Dots} gap={20} size={1.2} />
          <Controls />
        </ReactFlow>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#030712',
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    overflow: 'hidden',
  },
  canvasContainer: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
};

export default App;