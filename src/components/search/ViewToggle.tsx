import React from "react";
import { LayoutGrid, List } from "lucide-react";

interface ViewToggleProps {
  currentView: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
  className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  currentView,
  onViewChange,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center bg-zinc-100 rounded-sm p-1 gap-1 ${className}`}
    >
      <button
        onClick={() => onViewChange("grid")}
        className={`p-1.5 rounded-sm transition-all ${
          currentView === "grid"
            ? "bg-white shadow-sm text-zinc-900"
            : "text-zinc-500 hover:text-zinc-700"
        }`}
        aria-label="Grid view"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onViewChange("list")}
        className={`p-1.5 rounded-sm transition-all ${
          currentView === "list"
            ? "bg-white shadow-sm text-zinc-900"
            : "text-zinc-500 hover:text-zinc-700"
        }`}
        aria-label="List view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
};
