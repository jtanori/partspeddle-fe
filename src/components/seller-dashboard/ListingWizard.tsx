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

      import { SYSTEM_CATEGORIES } from '../../services/db'; // Assuming taxonomy is here

      // ... inside ListingWizard component state:
      const [formData, setFormData] = useState<any>({
          system: '',
          category: '',
          part_type: '',
          title: '',
          subtitle: '',
          brand: '',
          model: ''
      });

      // ... inside return, Step 2 rendering:
            {/* Step 2: Taxonomy & Metrics */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                      <h4 className="text-sm font-display font-bold uppercase text-base-cream">Taxonomy Selection</h4>
                      <select 
                          value={formData.system}
                          onChange={(e) => setFormData({...formData, system: e.target.value, category: ''})}
                          className="w-full bg-steel-black border border-oil-dark rounded-lg p-3 text-sm text-base-cream"
                      >
                          <option value="">Select System</option>
                          {Object.keys(SYSTEM_CATEGORIES).map(sys => <option key={sys} value={sys}>{sys}</option>)}
                      </select>
                      <select 
                          value={formData.category}
                          disabled={!formData.system}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full bg-steel-black border border-oil-dark rounded-lg p-3 text-sm text-base-cream disabled:opacity-50"
                      >
                          <option value="">Select Category</option>
                          {formData.system && SYSTEM_CATEGORIES[formData.system]?.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                  </div>
                  <div className="space-y-4">
                      <h4 className="text-sm font-display font-bold uppercase text-base-cream">Identification</h4>
                      <input 
                          type="text" placeholder="Title (e.g. 1987 Alternator)" value={formData.title}
                          onChange={(e) => setFormData({...formData, title: e.target.value})}
                          className="w-full bg-steel-black border border-oil-dark rounded-lg p-3 text-sm text-base-cream"
                      />
                      <input 
                          type="text" placeholder="Subtitle" value={formData.subtitle}
                          onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                          className="w-full bg-steel-black border border-oil-dark rounded-lg p-3 text-sm text-base-cream"
                      />
                      <div className="flex gap-2">
                          <input 
                              type="text" placeholder="Brand" value={formData.brand}
                              onChange={(e) => setFormData({...formData, brand: e.target.value})}
                              className="w-full bg-steel-black border border-oil-dark rounded-lg p-3 text-sm text-base-cream"
                          />
                          <input 
                              type="text" placeholder="Model" value={formData.model}
                              onChange={(e) => setFormData({...formData, model: e.target.value})}
                              className="w-full bg-steel-black border border-oil-dark rounded-lg p-3 text-sm text-base-cream"
                          />
                      </div>
                  </div>
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
