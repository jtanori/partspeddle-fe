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
      className="max-w-[1280px] mx-auto px-pp-pad py-pp-pad grid grid-cols-1 lg:grid-cols-12 gap-pp-gap"
    >
      <div className="lg:col-span-8 space-y-pp-gap">
        {childrenArray[0]}
      </div>
      <aside className="lg:col-span-4 space-y-pp-pad">
        {childrenArray[1]}
      </aside>
    </div>
  );
}
