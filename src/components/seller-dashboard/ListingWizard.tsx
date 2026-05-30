import React, { useState } from 'react';
import { Camera, X, Sparkles, Upload, Package, Truck, Zap, Pencil, ShieldCheck } from 'lucide-react';
import { SYSTEM_CATEGORIES } from '../../services/db';

interface ListingWizardProps {
  onClose: () => void;
}

// Tri-state toggle type
type ManifestStatus = 'active' | 'sold' | 'damaged';

export const ListingWizard: React.FC<ListingWizardProps> = ({ onClose }) => {
  const [mode, setMode] = useState<'none' | 'vehicle' | 'component'>('none');
  const [currentStep, setCurrentStep] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [isAiVetted, setIsAiVetted] = useState(false);
  const [confidenceScore, setConfidenceScore] = useState(0.85); // Mode B demo value
  
  const [manifest, setManifest] = useState<Record<string, ManifestStatus>>({
      'Alternator': 'active',
      'Starter': 'active'
  });

  const toggleManifestStatus = (part: string) => {
      setManifest(prev => {
          const states: ManifestStatus[] = ['active', 'sold', 'damaged'];
          const current = prev[part] || 'active';
          const next = states[(states.indexOf(current) + 1) % states.length];
          return { ...prev, [part]: next };
      });
  };

  const getStatusStyle = (status: ManifestStatus) => {
      switch(status) {
          case 'sold': return 'text-warm-gray line-through';
          case 'damaged': return 'bg-rust-copper/10 text-rust-copper border border-rust-copper/30';
          default: return 'text-base-cream border-oil-dark';
      }
  };

  if (mode === 'none') {
    return (
      <div className="bg-charcoal border border-oil-dark rounded-2xl p-8 shadow-2xl text-base-cream font-sans max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h2 className="font-display text-xl font-black uppercase tracking-wider text-rust-copper">Select Ingestion Pathway</h2>
            <button onClick={onClose} className="text-warm-gray hover:text-base-cream"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button onClick={() => setMode('vehicle')} className="bg-steel-black border border-oil-dark p-6 rounded-xl hover:border-rust-copper transition-all text-left space-y-4 group">
                <Truck className="w-8 h-8 text-rust-copper" />
                <div>
                    <h4 className="font-display font-bold text-base-cream uppercase tracking-wider">Vehicle Listing</h4>
                    <p className="text-xs text-warm-gray mt-1">Process complete donor vehicle, frame assemblies, or salvaged chassis.</p>
                </div>
            </button>
            <button onClick={() => setMode('component')} className="bg-steel-black border border-oil-dark p-6 rounded-xl hover:border-rust-copper transition-all text-left space-y-4 group">
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
      <div className="flex justify-between items-center mb-8 border-b border-oil-dark pb-4">
        <h2 className="font-display text-lg font-black uppercase tracking-wider text-rust-copper">
          {mode === 'vehicle' ? 'Vehicle Listing' : 'Component Listing'} — Step {currentStep} of 5
        </h2>
        <button onClick={() => setMode('none')} className="text-warm-gray hover:text-base-cream"><X className="w-5 h-5" /></button>
      </div>

      {/* Step 1: Ingestion */}
      {currentStep === 1 && (
        <div className="space-y-6">
            <div className="aspect-video bg-steel-black rounded-lg border-2 border-dashed border-oil-dark flex items-center justify-center cursor-pointer hover:border-rust-copper transition-colors">
                <div className='text-center'>
                    <Upload className="w-8 h-8 text-warm-gray mx-auto mb-2" />
                    <span className='text-xs font-bold uppercase tracking-widest text-warm-gray'>Upload Image</span>
                </div>
            </div>
          
          <button onClick={() => setIsScanning(true)} className="w-full bg-charcoal border border-rust-copper text-rust-copper hover:bg-rust-copper hover:text-steel-black font-display font-bold uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2">
            <Sparkles className={isScanning ? "animate-spin" : ""} />
            {isScanning ? 'Analyzing...' : 'Execute Optical OCR Analysis Layer'}
          </button>
        </div>
      )}

      {/* Mode A: Manifest Grid (Vehicle) */}
      {mode === 'vehicle' && currentStep === 2 && (
          <div className="space-y-4">
              <h4 className="text-sm font-display font-bold uppercase text-base-cream">Vehicle Manifest Projection</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.keys(manifest).map(part => (
                      <button key={part} onClick={() => toggleManifestStatus(part)} className={`p-3 rounded border text-xs font-bold uppercase tracking-wider ${getStatusStyle(manifest[part])}`}>
                          {part} - {manifest[part]}
                      </button>
                  ))}
              </div>
          </div>
      )}

      {/* Mode B: Confidence Gauge (Component) */}
      {mode === 'component' && currentStep === 2 && (
          <div className="space-y-4">
              <h4 className="text-sm font-display font-bold uppercase text-base-cream">AI Verification Layer</h4>
              <div className={`p-4 rounded-lg border ${confidenceScore >= 0.7 ? 'bg-sage-green/10 border-sage-green/30' : 'bg-rust-copper/10 border-rust-copper/30'}`}>
                  <span className={`text-xs font-mono font-bold ${confidenceScore >= 0.7 ? 'text-sage-green' : 'text-rust-copper'}`}>
                      [{Math.round(confidenceScore * 100)}% Accuracy Match]
                  </span>
              </div>
          </div>
      )}

      {/* Navigation Footer */}
      <div className="flex justify-between mt-8 pt-6 border-t border-oil-dark">
        <button onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} disabled={currentStep === 1} className="px-6 py-2 bg-charcoal border border-oil-dark rounded-lg text-xs font-bold uppercase tracking-wider text-warm-gray hover:text-base-cream disabled:opacity-50">Back</button>
        <button onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))} className="px-6 py-2 bg-rust-copper hover:bg-bronze text-steel-black rounded-lg text-xs font-bold uppercase tracking-wider">
            {currentStep === 5 ? 'Commit to Active Registry Node' : 'Advance Step'}
        </button>
      </div>
    </div>
  );
};
