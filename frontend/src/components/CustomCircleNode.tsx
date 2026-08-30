import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

const NODE_SIZE = 28;

export const CustomCircleNode: React.FC<NodeProps> = memo(({ data }) => {
  return (
    <div style={styles.wrapper}>
      {/* Puncte de ancoră invizibile pentru calculul traseului muchiilor */}
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
    width: NODE_SIZE,
    height: NODE_SIZE,
  },
  circle: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: '#0f172a',
    color: '#38bdf8',
    border: '2px solid #0284c7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.7rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
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