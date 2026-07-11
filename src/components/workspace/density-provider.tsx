'use client';

import * as React from 'react';

type Density = 'comfortable' | 'compact' | 'dense';

interface DensityContextValue {
  density: Density;
  setDensity: (density: Density) => void;
}

const DensityContext = React.createContext<DensityContextValue | undefined>(undefined);

interface DensityProviderProps {
  children: React.ReactNode;
  defaultDensity?: Density;
}

/**
 * Provides density mode for workspace components.
 * Marketplace defaults to comfortable; workspace defaults to compact.
 */
export function DensityProvider({ children, defaultDensity = 'compact' }: DensityProviderProps) {
  const [density, setDensity] = React.useState<Density>(defaultDensity);

  return (
    <DensityContext.Provider value={{ density, setDensity }}>
      <div data-density={density} className="contents">
        {children}
      </div>
    </DensityContext.Provider>
  );
}

/**
 * Read the current density mode.
 */
export function useDensity(): DensityContextValue {
  const context = React.useContext(DensityContext);
  if (!context) {
    throw new Error('useDensity must be used within a DensityProvider');
  }
  return context;
}
