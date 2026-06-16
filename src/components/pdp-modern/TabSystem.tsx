import React, { useState } from 'react';
import { PartViewModel } from '@/domain/types/pdp.types';

interface TabSystemProps {
  viewModel: PartViewModel;
}

export default function TabSystem({ viewModel }: TabSystemProps) {
  const [activeTab, setActiveTab] = useState(viewModel.tabs[0].id);

  return (
    <div className="w-full">
      <div className="flex border-b border-zinc-200">
        {viewModel.tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-bold uppercase transition-colors ${
              activeTab === tab.id 
                ? 'border-b-2 border-[#B87333] text-[#B87333]' 
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="py-6">
        {viewModel.tabs.find((t) => t.id === activeTab)?.content}
      </div>
    </div>
  );
}
