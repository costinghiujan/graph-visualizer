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

import { theme } from './styles/theme';
import { ForceEngine } from './physics/forceEngine';
import { Sidebar, parseGraphInput } from './components/Sidebar';
import { CustomCircleNode } from './components/CustomCircleNode';

export function App() {
  const [inputText, setInputText] = useState<string>('');
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Gestionare stări responsive (Desktop vs Mobile/Tablete)
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < theme.breakpoints.mobile);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(window.innerWidth >= theme.breakpoints.mobile);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < theme.breakpoints.mobile;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

    engineRef.current.syncNodes(validNodes);
    const positions = engineRef.current.getPositions();

    setNodes(
      validNodes.map((label) => ({
        id: label,
        type: 'custom',
        data: { label },
        position: positions.get(label) || { x: 350, y: 300 },
      }))
    );

    setEdges(
      validEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'straight',
        style: { stroke: theme.colors.edgeStroke, strokeWidth: 2 },
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
      {/* Buton mobil pentru deschiderea sidebar-ului */}
      {isMobile && !isSidebarOpen && (
        <button
          style={styles.floatingToggle}
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Deschide panou graf"
        >
          ☰ Noduri
        </button>
      )}

      {/* Overlay întunecat pentru ecrane mici */}
      {isMobile && isSidebarOpen && (
        <div
          style={styles.backdrop}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        style={{
          ...styles.sidebarWrapper,
          position: isMobile ? 'absolute' : 'relative',
          display: !isMobile || isSidebarOpen ? 'block' : 'none',
        }}
      >
        <Sidebar
          inputText={inputText}
          onTextChange={handleTextChange}
          activeNodesCount={nodes.length}
          activeEdgesCount={edges.length}
          isOpen={isSidebarOpen}
          onClose={isMobile ? () => setIsSidebarOpen(false) : undefined}
        />
      </div>

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
    margin: 0,
    padding: 0,
  },
  sidebarWrapper: {
    height: '100%',
    zIndex: 40,
    top: 0,
    left: 0,
    flexShrink: 0, // Garantează că sidebar-ul își păstrează lățimea fixă
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(2px)',
    zIndex: 35,
  },
  floatingToggle: {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    zIndex: 20,
    backgroundColor: theme.colors.bgSidebar,
    color: theme.colors.textPrimary,
    border: `1px solid ${theme.colors.borderFocus}`,
    borderRadius: `${theme.sizes.borderRadius}px`,
    padding: '0.5rem 0.85rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: theme.shadows.card,
  },
  canvasContainer: {
    flex: 1,
    height: '100%',
    position: 'relative',
    minWidth: 0, // Permite canvas-ului să ocupe tot restul de spațiu disponibil
  },
};

export default App;