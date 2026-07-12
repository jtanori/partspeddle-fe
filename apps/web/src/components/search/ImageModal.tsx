import React from "react";
import { X } from "lucide-react";
import { Backdrop } from "../common/Backdrop";

interface ImageModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  imageUrl,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <Backdrop onClick={onClose} className="!z-0" />
      <div className="relative z-10 max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <img
          src={imageUrl}
          alt="Full screen view"
          className="max-w-full max-h-[90vh] object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};
