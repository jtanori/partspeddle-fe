'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageGalleryProps {
  images: string[];
  alt: string;
  className?: string;
}

const VISIBLE_THUMBNAILS = 4;

/**
 * Canonical image gallery with thumbnail rail, main image, and keyboard navigation.
 */
export function ImageGallery({ images, alt, className }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const safeImages = images.length > 0 ? images : [];
  const hasImages = safeImages.length > 0;
  // `activeImage` is guaranteed because we return early when `hasImages` is false.
  const activeImage = safeImages[activeIndex]!;
  const visibleThumbnails = safeImages.slice(0, VISIBLE_THUMBNAILS);
  const overflow = Math.max(0, safeImages.length - VISIBLE_THUMBNAILS);

  const handlePrevious = useCallback(() => {
    setActiveIndex((i) => (i === 0 ? safeImages.length - 1 : i - 1));
  }, [safeImages.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((i) => (i === safeImages.length - 1 ? 0 : i + 1));
  }, [safeImages.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    },
    [handlePrevious, handleNext],
  );

  if (!hasImages) {
    return (
      <div className={cn('flex flex-col-reverse gap-4 md:flex-row md:gap-6', className)}>
        <div className="flex gap-3 md:flex-col">
          <Skeleton className="h-16 w-16 shrink-0" />
        </div>
        <Skeleton.Image className="flex-1 rounded-xl" />
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-col-reverse gap-4 md:flex-row md:gap-6', className)}
      onKeyDown={handleKeyDown}
    >
      {/* Thumbnail rail */}
      <div className="flex gap-3 overflow-x-auto md:flex-col md:overflow-visible">
        {visibleThumbnails.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIndex(i)}
            className={cn(
              'relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all',
              activeIndex === i
                ? 'border-brand-primary ring-1 ring-brand-primary/20'
                : 'border-stroke-subtle hover:border-stroke-default',
            )}
            aria-label={`View image ${i + 1}`}
            aria-current={activeIndex === i ? 'true' : undefined}
          >
            <Image src={img} alt={`${alt} thumbnail ${i + 1}`} fill className="object-cover" />
          </button>
        ))}
        {overflow > 0 && (
          <button
            type="button"
            onClick={handleNext}
            className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-md border border-stroke-subtle bg-surface-secondary text-meta font-black text-foreground-primary"
            aria-label={`Show ${overflow} more images`}
          >
            <span>+{overflow}</span>
          </button>
        )}
      </div>

      {/* Main display */}
      <div
        className="group relative flex-1 overflow-hidden rounded-xl border border-stroke-subtle bg-surface-primary"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMousePos({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
          });
        }}
      >
        <div className="relative aspect-square w-full">
          {imageError[activeIndex] ? (
            <div className="flex h-full w-full items-center justify-center bg-surface-secondary text-meta text-foreground-muted">
              Image unavailable
            </div>
          ) : (
            <Image
              src={activeImage}
              alt={alt}
              fill
              priority
              className={cn(
                'object-contain p-4 transition-transform duration-500 sm:p-8',
                isZoomed && 'scale-110',
              )}
              style={isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : undefined}
              onError={() => setImageError((prev) => ({ ...prev, [activeIndex]: true }))}
            />
          )}
        </div>

        {/* Zoom affordance */}
        <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full bg-foreground-primary/90 px-4 py-2 text-meta font-black uppercase tracking-widest text-foreground-inverse opacity-0 shadow-2xl transition-all group-hover:opacity-100 sm:flex">
          <Search className="h-3.5 w-3.5 text-brand-primary" />
          <span>Hover to zoom</span>
        </div>

        {/* Nav arrows */}
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevious}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-surface-primary/90 p-2 text-foreground-primary opacity-0 shadow transition-opacity hover:text-brand-primary focus-visible:opacity-100 group-hover:opacity-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-surface-primary/90 p-2 text-foreground-primary opacity-0 shadow transition-opacity hover:text-brand-primary focus-visible:opacity-100 group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
