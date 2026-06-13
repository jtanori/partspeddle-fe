"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Part } from "../../types";
import { SectionHeader } from "../common/SectionHeader";
import { ProductGridCard } from "../search/cards/ProductGridCard";
import { getSystemIcon } from "../search/constants";
import { getConditionColor } from "../search/utils/condition-utils";
import { EmptyState } from "../common/EmptyState";
import { ViewAllButton } from "../common/ViewAllButton";

interface ListingsGridProps {
  title: string;
  subtitle: string;
  parts: Part[];
  onViewAll?: () => void;
  emptyState?: {
    title: string;
    description: string;
    actionText?: string;
    onAction?: () => void;
  };
}

export const ListingsGrid: React.FC<ListingsGridProps> = ({
  title,
  subtitle,
  parts,
  onViewAll,
  emptyState,
}) => {
  const router = useRouter();
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleViewAll = onViewAll || (() => router.push("/search"));

  const toggleFavorite = (partId: string) => {
    setFavorites((prev) =>
      prev.includes(partId)
        ? prev.filter((id) => id !== partId)
        : [...prev, partId],
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-4 mb-16 pt-16">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        actions={<ViewAllButton onClick={handleViewAll} />}
      />

      {parts && parts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {parts.map((part) => (
            <ProductGridCard
              key={part.id}
              part={part}
              isFavorite={favorites.includes(part.id)}
              toggleFavorite={toggleFavorite}
              onSelectPart={(id) => router.push(`/listing/${id}`)}
              getConditionColor={getConditionColor as any}
              partThumbnail={part.images?.[0]}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={emptyState?.title || "No Matching Inventory Found"}
          description={
            emptyState?.description ||
            "We couldn't find any OEM parts matching this specific criteria in our active network. Try adjusting your search or check back later."
          }
          actionText={emptyState?.actionText || "Search All Inventory"}
          onAction={emptyState?.onAction || (() => router.push("/search"))}
        />
      )}
    </section>
  );
};
