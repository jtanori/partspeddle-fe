import React from 'react';

interface PDPLayoutEngineProps {
  children: React.ReactNode;
}

export default function PDPLayoutEngine({ children }: PDPLayoutEngineProps) {
  // We expect children to be an array of at least 2: Main, Sidebar
  const childrenArray = React.Children.toArray(children);

  return (
    <div 
      data-testid="layout-container" 
      className="max-w-[var(--content-max)] mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8"
    >
      <div className="lg:col-span-8 space-y-8">
        {childrenArray[0]}
      </div>
      <aside className="lg:col-span-4 space-y-6">
        {childrenArray[1]}
      </aside>
    </div>
  );
}
