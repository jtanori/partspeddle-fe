import React from "react";
import { AlertTriangle } from "lucide-react";

export const SearchInitialState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white border border-zinc-200 rounded max-w-sm md:max-w-md lg:max-w-2xl mx-auto space-y-4 shadow-sm">
      <AlertTriangle className="w-12 h-12 text-rust-copper" />
      <h3 className="font-display text-lg font-bold uppercase text-zinc-900">
        Start Your Search
      </h3>
      <p className="text-xs text-zinc-500 text-center leading-relaxed">
        Use the filters or search bar to explore our OEM auto parts.
      </p>
    </div>
  );
};
