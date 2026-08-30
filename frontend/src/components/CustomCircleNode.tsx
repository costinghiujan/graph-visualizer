import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { theme } from '../styles/theme';

export const CustomCircleNode: React.FC<NodeProps> = memo(({ data }) => {
  return (
    <div style={styles.wrapper}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        style={styles.handle}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={false}
        style={styles.handle}
      />

      <div style={styles.circle}>
        {data.label as string}
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
    background: theme.colors.bgSidebar,
    color: theme.colors.accent,
    border: `2px solid ${theme.colors.accentHover}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.7rem',
    boxShadow: theme.shadows.node,
    userSelect: 'none',
    cursor: 'grab',
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
    minWidth: 0,
    minHeight: 0,
    border: 'none',
    background: 'transparent',
  },
};