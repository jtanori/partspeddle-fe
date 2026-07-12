import React from 'react';
import { SearchResultCardModel } from '@/domain/view-models/search';
import { PartCard } from '@/components/design-system/part-card';
import { toPartCardPart } from './utils/to-part-card';

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
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {cards.map((card) => (
        <PartCard
          key={card.id}
          part={toPartCardPart(card)}
          variant="list"
          href={`/listing/${card.id}`}
          currency="MXN"
          isFavorite={favorites.includes(card.id)}
          onFavorite={toggleFavorite}
        />
      ))}
    </div>
  );
};
