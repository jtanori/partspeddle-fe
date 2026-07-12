import { EvolutionReport, PTSVector } from './compiled-semantic-artifact';

export function evaluatePTS(evolution: EvolutionReport): PTSVector {
  // Score: 1 for added/removed, 0.5 for modified
  const score = 
    evolution.groupDiffs.reduce((acc, d) => 
      acc + (d.changeType === 'ADDED' || d.changeType === 'REMOVED' ? 1 : 0.5), 0) +
    evolution.facetDiffs.reduce((acc, f) => 
      acc + (f.type === 'ADDED' || f.type === 'REMOVED' ? 1 : 0.5), 0);
      
  return {
    driftScore: score,
    highDrift: score > 5 // Threshold for blocking drift
  };
}
