import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const handlePrev = () => setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
  const handleNext = () => setActiveImageIdx((prev) => (prev + 1) % images.length);

  return (
    <div className="relative aspect-video rounded overflow-hidden border border-zinc-200 bg-zinc-950 shadow flex items-center justify-center group">
      <img 
        src={images[activeImageIdx]} 
        alt="Product" 
        className="w-full h-full object-cover"
      />
      <button onClick={handlePrev} className="absolute left-3 p-2 bg-black/60 hover:bg-[#B87333] text-white rounded-full transition-colors">
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button onClick={handleNext} className="absolute right-3 p-2 bg-black/60 hover:bg-[#B87333] text-white rounded-full transition-colors">
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
