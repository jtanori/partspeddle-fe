import React from "react";
import { ProductGridCard } from "./cards/ProductGridCard";
import { SearchResultCardModel } from "@/domain/view-models/search";

interface GridResultsViewProps {
  cards: SearchResultCardModel[];
  favorites: string[];
  toggleFavorite: (partId: string) => void;
  onSelectPart: (partId: string) => void;
  className?: string;
}

export const GridResultsView: React.FC<GridResultsViewProps> = ({
  cards,
  favorites,
  toggleFavorite,
  onSelectPart,
  className = "",
}) => {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}
    >
      {cards.map((card) => (
        <ProductGridCard
          key={card.id}
          card={card}
          isFavorite={favorites.includes(card.id)}
          toggleFavorite={toggleFavorite}
          onSelectPart={onSelectPart}
        />
      ))}
    </div>
  );
};
