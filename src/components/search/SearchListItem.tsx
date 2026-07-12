import React from "react";
import { Part } from "../../types";

interface SearchListItemProps {
  part: Part;
  isFavorite: boolean;
  toggleFavorite: (partId: string) => void;
  onSelectPart: (partId: string) => void;
  className?: string;
}

export const SearchListItem: React.FC<SearchListItemProps> = ({
  part,
  isFavorite,
  toggleFavorite,
  onSelectPart,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center gap-4 p-4 border border-zinc-200 rounded-sm hover:shadow-md transition-shadow bg-white ${className}`}
    >
      <img
        src={part.images?.[0] || "placeholder.png"}
        alt={part.title}
        className="w-24 h-24 object-cover rounded-sm"
      />
      <div className="flex-1">
        <h3 className="font-display font-bold text-lg text-zinc-900">
          {part.title}
        </h3>
        <p className="text-sm text-zinc-500">
          {part.compatibility?.[0]?.make} • {part.condition}
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold text-lg text-zinc-900">
          ${part.price.toFixed(2)}
        </p>
        <button
          onClick={() => onSelectPart(part.id)}
          className="mt-2 text-xs font-bold uppercase text-[#B87333]"
        >
          View Details
        </button>
      </div>
    </div>
  );
};
