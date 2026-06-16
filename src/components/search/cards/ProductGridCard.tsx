import React, { useState } from "react";
import { ThumbsUp, Star, Camera } from "lucide-react";
import { PARTS_FALLBACK_IMAGE } from "@/types";
import { useRouter } from "next/navigation";
import { ImageModal } from "../ImageModal";
import { SearchResultCardModel } from "@/domain/view-models/search";

interface ProductGridCardProps {
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

export const ProductGridCard: React.FC<ProductGridCardProps> = ({
  card,
  isFavorite,
  toggleFavorite,
  onSelectPart,
}) => {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasImage = !!card.imageUrl;
  const imageUrl = card.imageUrl || PARTS_FALLBACK_IMAGE;

  return (
    <>
      <div
        onClick={() => onSelectPart(card.id)}
        className="bg-white border border-zinc-200 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col cursor-pointer overflow-hidden"
      >
        <div className="aspect-square relative bg-zinc-100 flex items-center justify-center">
          {hasImage ? (
            <img
              src={imageUrl}
              alt={card.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <img
              src={PARTS_FALLBACK_IMAGE}
              alt="Placeholder"
              className="w-full h-full object-cover"
            />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(card.id);
            }}
            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full border border-zinc-200 hover:text-blue-500 transition-colors"
          >
            <ThumbsUp
              className={`w-4 h-4 ${isFavorite ? "fill-blue-500 text-blue-500" : "text-zinc-500"}`}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="absolute bottom-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-1">
          <h3 className="font-bold text-sm text-zinc-900 leading-tight line-clamp-2">
            {card.title}
          </h3>
          <p className="text-xs text-zinc-500">{card.subtitle}</p>

          <div className="pt-2">
            <span className="font-bold text-lg text-zinc-900">
              {card.price}
            </span>
          </div>

          <div className="pt-1">
            <span
              className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-semibold ${card.conditionColor}`}
            >
              {card.conditionLabel}
            </span>
          </div>

          <div className="pt-2 text-xs text-blue-600 font-bold hover:underline cursor-pointer">
            {card.sellerName}
          </div>
          <RatingStars rating={card.sellerRating || 0} count={card.sellerReviewCount || 0} />
        </div>
      </div>
      {isModalOpen && (
        <ImageModal imageUrl={imageUrl} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};
