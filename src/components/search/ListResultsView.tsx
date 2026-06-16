import React from "react";
import { ProductGridCard } from "./cards/ProductGridCard";
import { SearchResultCardModel } from "@/domain/view-models/search";

interface ListResultsViewProps {
  cards: SearchResultCardModel[];
  favorites: string[];
  toggleFavorite: (partId: string) => void;
  onSelectPart: (partId: string) => void;
  className?: string;
}

export const ListResultsView: React.FC<ListResultsViewProps> = ({
  cards,
  favorites,
  toggleFavorite,
  onSelectPart,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
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

