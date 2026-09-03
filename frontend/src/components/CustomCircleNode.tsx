import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { theme } from '../styles/theme';

export interface CustomNodeData {
  label: string;
  status?: 'idle' | 'start' | 'current' | 'visited' | 'queued';
  isSelected?: boolean;
}

export const CustomCircleNode: React.FC<NodeProps> = memo(({ data }) => {
  const nodeData = data as unknown as CustomNodeData;
  const status = nodeData.status || 'idle';

  // Adnotăm explicit cu string pentru a permite reatribuirea
  let borderColor: string = theme.colors.accentHover;
  let bgColor: string = theme.colors.bgSidebar;
  let textColor: string = theme.colors.accent;

  if (nodeData.isSelected || status === 'start') {
    borderColor = theme.colors.nodeStart;
    bgColor = '#064e3b';
    textColor = '#6ee7b7';
  } else if (status === 'current') {
    borderColor = theme.colors.nodeCurrent;
    bgColor = '#78350f';
    textColor = '#fde68a';
  } else if (status === 'visited') {
    borderColor = theme.colors.nodeVisited;
    bgColor = '#312e81';
    textColor = '#c7d2fe';
  } else if (status === 'queued') {
    borderColor = theme.colors.nodeQueued;
    bgColor = '#0c4a6e';
    textColor = '#7dd3fc';
  }

  return (
    <div style={styles.wrapper}>
      <Handle type="target" position={Position.Top} isConnectable={false} style={styles.handle} />
      <Handle type="source" position={Position.Bottom} isConnectable={false} style={styles.handle} />

      <div
        style={{
          ...styles.circle,
          borderColor,
          backgroundColor: bgColor,
          color: textColor,
        }}
      >
        {nodeData.label}
      </div>
    </div>
  );
});

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'relative',
    width: theme.sizes.nodeSize,
    height: theme.sizes.nodeSize,
  },
  circle: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    borderWidth: '2px',
    borderStyle: 'solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.7rem',
    boxShadow: theme.shadows.node,
    userSelect: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s, border-color 0.2s, color 0.2s',
  },
  handle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    opacity: 0,
    pointerEvents: 'none',
    width: 1,
    height: 1,
  },
};