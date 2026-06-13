import React from "react";
import { Part } from "../../types";
import { ProductGridCard } from "./cards/ProductGridCard";
import { getSystemIcon } from "./constants";
import { getConditionColor } from "./utils/condition-utils";

interface GridResultsViewProps {
  parts: Part[];
  favorites: string[];
  toggleFavorite: (partId: string) => void;
  onSelectPart: (partId: string) => void;
  className?: string;
}

export const GridResultsView: React.FC<GridResultsViewProps> = ({
  parts,
  favorites,
  toggleFavorite,
  onSelectPart,
  className = "",
}) => {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}
    >
      {parts.map((part) => (
        <ProductGridCard
          key={part.id}
          part={part}
          isFavorite={favorites.includes(part.id)}
          toggleFavorite={toggleFavorite}
          onSelectPart={onSelectPart}
          getConditionColor={getConditionColor as (condition: string) => string}
          partThumbnail={part.images?.[0]}
        />
      ))}
    </div>
  );
};
