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
    <div className="flex gap-6 h-[480px]">
      {/* Thumbnail Rail (Left) - Precise w-16 */}
      <div className="flex flex-col gap-3 w-16 shrink-0">
        {visibleImages.map((img, i) => (
          <button
            key={i}
            onClick={() => setActiveImageIdx(i)}
            className={`w-16 h-16 rounded-pp-atom border-2 transition-all overflow-hidden ${
              activeImageIdx === i 
                ? 'border-pp-primary ring-1 ring-pp-primary/20' 
                : 'border-zinc-100 hover:border-zinc-300'
            }`}
          >
            <img src={img} alt={`thumbnail ${i}`} className="w-full h-full object-cover" />
          </button>
        ))}
        {overflow > 0 && (
          <div className="w-16 h-16 rounded-pp-atom bg-zinc-50 flex flex-col items-center justify-center border border-zinc-200">
            <span className="font-black text-pp-text text-xs">+{overflow}</span>
          </div>
        )}
      </div>

      {/* Main Display (Right) */}
      <div className="relative flex-1 rounded-pp-card overflow-hidden bg-white border border-zinc-100 group shadow-inner">
        <img 
          src={images[activeImageIdx]} 
          alt="Product Main" 
          className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Grounded Zoom Overlay */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-pp-text/90 backdrop-blur-sm text-white px-5 py-2.5 rounded-full shadow-2xl text-[10px] flex items-center gap-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <Search className="w-3.5 h-3.5 text-pp-primary" /> 
          <span className="font-black tracking-[0.2em] uppercase">Hover to zoom</span>
        </div>
      </div>
    </div>
  );
}
