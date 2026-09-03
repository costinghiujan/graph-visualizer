import React, { memo } from 'react';
import { BaseEdge, getStraightPath, type EdgeProps } from '@xyflow/react';
import { theme } from '../styles/theme';

export const AnimatedEdge: React.FC<EdgeProps> = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}) => {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const isTraversed = Boolean(data?.isTraversed);

  return (
    <>
      {/* Linia de bază */}
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: theme.colors.borderFocus,
          strokeWidth: 2,
        }}
      />
      {/* Stratul activat cu tranziție progresivă */}
      {isTraversed && (
        <path
          d={edgePath}
          fill="none"
          stroke={theme.colors.edgeTraversed}
          strokeWidth={3}
          className="animated-edge-fill"
        />
      )}
    </>
  );
});