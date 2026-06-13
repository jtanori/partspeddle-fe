import React from "react";
import { Part } from "../../types";
import { ProductListCard } from "./cards/ProductListCard";
import { getSystemIcon } from "./constants";
import { getConditionColor } from "./utils/condition-utils";

interface ListResultsViewProps {
  parts: Part[];
  favorites: string[];
  toggleFavorite: (partId: string) => void;
  onSelectPart: (partId: string) => void;
  className?: string;
}

export const ListResultsView: React.FC<ListResultsViewProps> = ({
  parts,
  favorites,
  toggleFavorite,
  onSelectPart,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {parts.map((part) => (
        <ProductListCard
          key={part.id}
          part={part}
          isFavorite={favorites.includes(part.id)}
          toggleFavorite={toggleFavorite}
          onSelectPart={onSelectPart}
          getConditionColor={getConditionColor as (condition: string) => string}
        />
      ))}
    </div>
  );
};
