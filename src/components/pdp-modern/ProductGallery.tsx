import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const visibleCount = 4;
  const visibleImages = images.slice(0, visibleCount);
  const overflow = images.length - visibleCount;

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-6 h-auto md:h-[480px]">
      {/* Thumbnail Rail - horizontal on mobile, vertical on desktop */}
      <div className="flex md:flex-col gap-3 w-full md:w-16 shrink-0 overflow-x-auto md:overflow-visible">
        {visibleImages.map((img, i) => (
          <button
            key={i}
            onClick={() => setActiveImageIdx(i)}
            className={`w-16 h-16 md:w-16 md:h-16 shrink-0 rounded-md border-2 transition-all overflow-hidden ${
              activeImageIdx === i
                ? 'border-brand-primary ring-1 ring-brand-primary/20'
                : 'border-stroke-subtle hover:border-stroke-default'
            }`}
          >
            <img src={img} alt={`thumbnail ${i}`} className="w-full h-full object-cover" />
          </button>
        ))}
        {overflow > 0 && (
          <div className="w-16 h-16 shrink-0 rounded-md bg-surface-muted flex flex-col items-center justify-center border border-stroke-subtle">
            <span className="font-black text-foreground-primary text-xs">+{overflow}</span>
          </div>
        )}
      </div>

      {/* Main Display */}
      <div className="relative flex-1 rounded-xl overflow-hidden bg-surface-primary border border-stroke-subtle group shadow-inner h-[300px] sm:h-[380px] md:h-auto">
        <img
          src={images[activeImageIdx]}
          alt="Product Main"
          className="w-full h-full object-contain p-4 sm:p-8 transition-transform duration-500 group-hover:scale-105"
        />

        {/* Grounded Zoom Overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-foreground-primary/90 backdrop-blur-sm text-foreground-inverse px-5 py-2.5 rounded-full shadow-2xl text-[10px] hidden sm:flex items-center gap-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Search className="w-3.5 h-3.5 text-brand-primary" />
          <span className="font-black tracking-[0.2em] uppercase">Hover to zoom</span>
        </div>
      </div>
    </div>
  );
}
