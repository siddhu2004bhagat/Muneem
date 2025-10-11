import React from 'react';
import type { SelectionRect } from '../types/pen.types';

interface Props {
  rect: SelectionRect | null;
}

const LassoOverlay: React.FC<Props> = ({ rect }) => {
  if (!rect) return null;
  const x = Math.min(rect.x, rect.x + rect.width);
  const y = Math.min(rect.y, rect.y + rect.height);
  const w = Math.abs(rect.width);
  const h = Math.abs(rect.height);

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <rect x={x} y={y} width={w} height={h} rx={4} ry={4} fill="rgba(0,0,0,0.05)" stroke="var(--border)" strokeDasharray="6 4"/>
      {/* Corner handles (visual only for now) */}
      <circle cx={x} cy={y} r={4} fill="white" stroke="var(--border)"/>
      <circle cx={x + w} cy={y} r={4} fill="white" stroke="var(--border)"/>
      <circle cx={x} cy={y + h} r={4} fill="white" stroke="var(--border)"/>
      <circle cx={x + w} cy={y + h} r={4} fill="white" stroke="var(--border)"/>
    </svg>
  );
};

export default LassoOverlay;


