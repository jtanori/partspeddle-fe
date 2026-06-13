import React from "react";
import { Heart, Star } from "lucide-react";
import { Part, PartCondition } from "@/types";
import { getConditionLabel } from "../utils/condition-utils";

interface ListResultsViewProps {
  parts: Part[];
  favorites: string[];
  toggleFavorite: (partId: string) => void;
  onSelectPart: (partId: string) => void;
  className?: string;
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

export const ProductListCard: React.FC<{
  part: Part;
  isFavorite: boolean;
  toggleFavorite: (id: string) => void;
  onSelectPart: (id: string) => void;
  getConditionColor: (cond: PartCondition) => string;
}> = ({
  part,
  isFavorite,
  toggleFavorite,
  onSelectPart,
  getConditionColor,
}) => {
  const sellerName = part.seller?.businessName || part.seller?.name || "N/A";
  const sellerRating = part.seller?.rating || 0;
  const sellerReviewCount = part.seller?.reviewCount || 0;
  const imageUrl = (part.images && part.images[0]) || "";

  return (
    <div
      onClick={() => onSelectPart(part.id)}
      className="bg-white border border-zinc-200 rounded-lg shadow-sm p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="w-24 h-24 bg-zinc-100 rounded-md overflow-hidden flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={part.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400">
            No Image
          </div>
        )}
      </div>

      <div className="flex-grow space-y-1">
        <h3 className="font-bold text-sm text-zinc-900">{part.title}</h3>
        <p className="text-xs text-zinc-500">
          {part.subtitle || "Specifications"}
        </p>

        <div className="flex items-center gap-2 pt-1">
          <span
            className={`px-2 py-0.5 rounded-sm text-[10px] font-semibold ${getConditionColor(part.condition)}`}
          >
            {getConditionLabel(part.condition)}
          </span>
          <span className="text-xs text-zinc-500">
            {typeof part.mileage === "number"
              ? `${part.mileage.toLocaleString()} mi`
              : "Tested"}
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="text-xs font-bold text-zinc-800">{sellerName}</span>
          <RatingStars rating={sellerRating} count={sellerReviewCount} />
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className="font-bold text-lg text-zinc-900">
          {new Intl.NumberFormat("es-MX", {
            style: "currency",
            currency: "MXN",
          }).format(part.price || 0)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(part.id);
          }}
          className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
        >
          <Heart
            className={`w-5 h-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-zinc-500"}`}
          />
        </button>
        <button className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-sm uppercase">
          View Details
        </button>
      </div>
    </div>
  );
};
