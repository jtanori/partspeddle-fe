import React from 'react';

interface ConfidenceBadgeProps {
  score: number;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ score }) => {
  const getColor = (s: number) => {
    if (s >= 0.9) return 'text-success border-success/30 bg-success/10';
    if (s >= 0.7) return 'text-accent-amber border-accent-amber/30 bg-accent-amber/10';
    return 'text-danger border-danger/30 bg-danger/10';
  };

  return (
    <span className={`px-2 py-0.5 border rounded-sm font-bold ${getColor(score)}`}>
      {(score * 100).toFixed(0)}%
    </span>
  );
};
