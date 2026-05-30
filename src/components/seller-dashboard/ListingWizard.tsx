import React, { useState } from 'react';
import { Camera, X, Sparkles, Upload } from 'lucide-react';
import { Part } from '../../types';

interface ListingWizardProps {
  initialImages?: string[];
  initialData?: any;
  onClose: () => void;
}

export const ListingWizard: React.FC<ListingWizardProps> = ({ initialImages = [], initialData = {}, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [images, setImages] = useState<string[]>(initialImages);
  const [aiData, setAiData] = useState<any>(initialData);
  const [isScanning, setIsScanning] = useState(false);

  const handleOcrAnalysis = () => {
    setIsScanning(true);
    // Simulate AI scan
    setTimeout(() => {
        setAiData({ system: 'Powertrain', part_type: 'Alternator', confidence: 0.95 });
        setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="bg-charcoal border border-oil-dark rounded-2xl p-6 shadow-2xl text-base-cream font-sans">
      {/* Wizard Header */}
      <div className="flex justify-between items-center mb-8 border-b border-oil-dark pb-4">
        <h2 className="font-display text-lg font-black uppercase tracking-wider text-rust-copper">
          Listing Wizard — Step {currentStep} of 5
        </h2>
        <button onClick={onClose} className="text-warm-gray hover:text-base-cream">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Step 1: Ingestion */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-video bg-steel-black rounded-lg border border-oil-dark overflow-hidden">
                <img src={img} alt="Uploaded part" className="w-full h-full object-cover" />
                <button className="absolute top-1 right-1 bg-charcoal/80 rounded-full p-1 text-base-cream hover:text-rose-400">
                    <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <div className="aspect-video bg-steel-black rounded-lg border-2 border-dashed border-oil-dark flex items-center justify-center cursor-pointer hover:border-rust-copper transition-colors">
                <Upload className="w-6 h-6 text-warm-gray" />
            </div>
          </div>
          
          <button 
            onClick={handleOcrAnalysis}
            disabled={isScanning || images.length === 0}
            className="w-full bg-charcoal border border-rust-copper text-rust-copper hover:bg-rust-copper hover:text-steel-black font-display font-bold uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isScanning ? <Sparkles className="animate-spin" /> : <Sparkles />}
            {isScanning ? 'Analyzing...' : 'Execute Optical OCR Analysis Layer'}
          </button>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex justify-between mt-8 pt-6 border-t border-oil-dark">
        <button 
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-6 py-2 bg-charcoal border border-oil-dark rounded-lg text-xs font-bold uppercase tracking-wider text-warm-gray hover:text-base-cream disabled:opacity-50"
        >
            Back
        </button>
        <button 
            onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
            className="px-6 py-2 bg-rust-copper hover:bg-bronze text-steel-black rounded-lg text-xs font-bold uppercase tracking-wider"
        >
            {currentStep === 5 ? 'Commit to Active Registry Node' : 'Advance Step'}
        </button>
      </div>
    </div>
  );
};
