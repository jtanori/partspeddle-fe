import React from "react";
import { Heart, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { SearchResultCardModel } from "@/domain/view-models/search";

interface ProductListCardProps {
  card: SearchResultCardModel;
  isFavorite: boolean;
  toggleFavorite: (id: string) => void;
  onSelectPart: (id: string) => void;
}

const RatingStars = ({ rating, count }: { rating: number; count: number }) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3 h-3 ${
            star <= Math.round(rating)
              ? "fill-orange-400 text-orange-400"
              : "fill-zinc-200 text-zinc-200"
          }`}
        />
      ))}
      <span className="text-xs text-zinc-500 ml-1">({count})</span>
    </div>
  );
};

export const ProductListCard: React.FC<ProductListCardProps> = ({
  card,
  isFavorite,
  toggleFavorite,
  onSelectPart,
}) => {
  const router = useRouter();

  return (
    <div
      onClick={() => onSelectPart(card.id)}
      className="bg-white border border-zinc-200 rounded-lg shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="w-24 h-24 bg-zinc-100 rounded-md overflow-hidden flex-shrink-0">
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={card.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400">
            No Image
          </div>
        )}
      </div>

      <div className="flex-grow space-y-1">
        <h3 className="font-bold text-sm text-zinc-900">{card.title}</h3>
        <p className="text-xs text-zinc-500">
          {card.subtitle || "Specifications"}
        </p>

        <div className="flex items-center gap-2 pt-1">
          <span
            className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold ${card.conditionColor}`}
          >
            {card.conditionLabel}
          </span>
          <span className="text-xs text-zinc-500">
            {card.fitmentSummary}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs font-bold text-zinc-800">{card.sellerName}</span>
          <RatingStars rating={card.sellerRating || 0} count={card.sellerReviewCount || 0} />
        </div>
      </div>

      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto sm:shrink-0 mt-2 sm:mt-0">
        <span className="font-bold text-lg text-zinc-900">
          {card.price}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(card.id);
          }}
          className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-zinc-500"}`}
          />
        </button>
        <button className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-sm uppercase ml-auto sm:ml-0">
          View Details
        </button>
      </div>
    </div>
  );
};
