import React from 'react';
import { SearchResultCardModel } from '@/domain/view-models/search';
import { PartCard } from '@/components/design-system/part-card';
import { toPartCardPart } from './utils/to-part-card';

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
  className = '',
}) => {
  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}
    >
      {cards.map((card) => (
        <PartCard
          key={card.id}
          part={toPartCardPart(card)}
          variant="grid"
          href={`/listing/${card.id}`}
          currency="MXN"
          isFavorite={favorites.includes(card.id)}
          onFavorite={toggleFavorite}
        />
      ))}
    </div>
  );
};
