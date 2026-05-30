import React, { useState } from 'react';
import { Camera, X, Sparkles, Upload, Package, Truck, ArrowRight, Zap, Pencil } from 'lucide-react';

interface ListingWizardProps {
  onClose: () => void;
}

export const ListingWizard: React.FC<ListingWizardProps> = ({ onClose }) => {
  const [mode, setMode] = useState<'none' | 'vehicle' | 'component'>('none');
  const [currentStep, setCurrentStep] = useState(1);
  const [isScanning, setIsScanning] = useState(false);

  if (mode === 'none') {
    return (
      <div className="bg-charcoal border border-oil-dark rounded-2xl p-8 shadow-2xl text-base-cream font-sans max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h2 className="font-display text-xl font-black uppercase tracking-wider text-rust-copper">
                Select Ingestion Pathway
            </h2>
            <button onClick={onClose} className="text-warm-gray hover:text-base-cream">
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
                onClick={() => setMode('vehicle')}
                className="bg-steel-black border border-oil-dark p-6 rounded-xl hover:border-rust-copper transition-all text-left space-y-4 group"
            >
                <Truck className="w-8 h-8 text-rust-copper" />
                <div>
                    <h4 className="font-display font-bold text-base-cream uppercase tracking-wider">Vehicle Listing</h4>
                    <p className="text-xs text-warm-gray mt-1">Process complete donor vehicle, frame assemblies, or salvaged chassis.</p>
                </div>
            </button>
            <button
                onClick={() => setMode('component')}
                className="bg-steel-black border border-oil-dark p-6 rounded-xl hover:border-rust-copper transition-all text-left space-y-4 group"
            >
                <Package className="w-8 h-8 text-rust-copper" />
                <div>
                    <h4 className="font-display font-bold text-base-cream uppercase tracking-wider">Component Listing</h4>
                    <p className="text-xs text-warm-gray mt-1">Ingest isolated parts, machinery assemblies, or single-unit sub-assemblies.</p>
                </div>
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-charcoal border border-oil-dark rounded-2xl p-6 shadow-2xl text-base-cream font-sans">
      {/* Wizard Header */}
      <div className="flex justify-between items-center mb-8 border-b border-oil-dark pb-4">
        <h2 className="font-display text-lg font-black uppercase tracking-wider text-rust-copper">
          {mode === 'vehicle' ? 'Vehicle Listing' : 'Component Listing'} — Step {currentStep} of 5
        </h2>
        <button onClick={() => setMode('none')} className="text-warm-gray hover:text-base-cream">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Step 1: Ingestion (Common for both) */}
      {currentStep === 1 && (
        <div className="space-y-6">
            <div className="aspect-video bg-steel-black rounded-lg border-2 border-dashed border-oil-dark flex items-center justify-center cursor-pointer hover:border-rust-copper transition-colors">
                <div className='text-center'>
                    <Upload className="w-8 h-8 text-warm-gray mx-auto mb-2" />
                    <span className='text-xs font-bold uppercase tracking-widest text-warm-gray'>Upload Image</span>
                </div>
            </div>
          
          <button 
            onClick={() => setIsScanning(true)}
            disabled={isScanning}
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
