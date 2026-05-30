import React, { useState } from 'react';
import { Camera, X, Sparkles, Upload, Package, Truck, Zap, Pencil, ShieldCheck } from 'lucide-react';
import { SYSTEM_CATEGORIES } from '../../services/db';
import { analyzeListingImage } from '../../services/ai-vision';
import { AIAnalysisResult } from '../../types';

interface ListingWizardProps {
  onClose: () => void;
}

type ManifestStatus = 'active' | 'sold' | 'damaged';

export const ListingWizard: React.FC<ListingWizardProps> = ({ onClose }) => {
  const [mode, setMode] = useState<'none' | 'vehicle' | 'component'>('none');
  const [currentStep, setCurrentStep] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [isAiVetted, setIsAiVetted] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  const [formData, setFormData] = useState<any>({
      system: '', category: '', title: '', brand: '', model: '',
      oem_part_number: '', weight: '', voltage: '', amperage: '',
      pulley_type: '', make: '', year: '', vin: '', condition: 'Used OEM',
      price_mxn: 0, stock_number: ''
  });

  const [manifest, setManifest] = useState<Record<string, ManifestStatus>>({'Alternator': 'active', 'Starter': 'active'});

  const handleOcrAnalysis = async () => {
    setIsScanning(true);
    try {
        const mockFile = new File([""], "image.png");
        const result = await analyzeListingImage(mockFile, mode);
        setAiResult(result);
        setIsAiVetted(true);
        // Map common fields automatically
        setFormData(prev => ({ ...prev, 
            system: result.system || prev.system,
            title: result.part_type || prev.title 
        }));
    } catch (err) {
        console.error("AI Analysis failed:", err);
    } finally {
        setIsScanning(false);
    }
  };


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

        <button 
            onClick={() => { setMode('component'); setCurrentStep(2); setIsAiVetted(false); }}
            className="w-full mt-6 py-3 border border-zinc-800 text-warm-gray font-mono uppercase text-[11px] hover:text-base-cream transition-colors"
        >
            Bypass Optical Scans / Manual Matrix Mode
        </button>
      </div>
    );
  }

  return (
    <div className="bg-charcoal border border-oil-dark rounded-2xl p-6 shadow-2xl text-base-cream font-sans max-h-[90vh] overflow-y-auto">
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

      const ConfidenceBadge = ({ score }: { score?: number }) => {
        if (score === undefined) return null;
        const isHigh = score >= 0.7;
        return (
          <span className={`ml-2 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${isHigh ? 'text-sage-green bg-sage-green/10 border-sage-green/30' : 'text-rust-copper bg-rust-copper/10 border-rust-copper/30'}`}>
            {Math.round(score * 100)}% Accuracy
          </span>
        );
      };

          {/* Step 2: Taxonomy */}
          {currentStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                      <h4 className="text-sm font-display font-bold uppercase text-base-cream">Taxonomy Selection</h4>
                      <div className="relative">
                        <select value={formData.system} onChange={(e) => setFormData({...formData, system: e.target.value, category: ''})} className="w-full bg-steel-black border border-oil-dark rounded-lg p-3 text-sm text-base-cream">
                            <option value="">Select System</option>
                            {Object.keys(SYSTEM_CATEGORIES).map(sys => <option key={sys} value={sys}>{sys}</option>)}
                        </select>
                        {isAiVetted && aiResult?.confidence_scores && <ConfidenceBadge score={aiResult.confidence_scores.part_type_accuracy} />}
                      </div>
                      <input type="text" placeholder="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-steel-black border border-oil-dark rounded-lg p-3 text-sm text-base-cream" />
                  </div>
              </div>
          )}


      {/* Step 3: Tech Specs */}
      {currentStep === 3 && (
          <div className="space-y-4">
              <input type="text" placeholder="OEM Part Number" value={formData.oem_part_number} onChange={(e) => setFormData({...formData, oem_part_number: e.target.value})} className="w-full bg-steel-black border border-oil-dark rounded-lg p-3 text-sm text-base-cream" />
              {(formData.system === 'Electrical System') && (
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Voltage" value={formData.voltage} onChange={(e) => setFormData({...formData, voltage: e.target.value})} className="w-full bg-charcoal border border-oil-dark rounded-lg p-3 text-sm text-base-cream" />
                    <input type="text" placeholder="Amperage" value={formData.amperage} onChange={(e) => setFormData({...formData, amperage: e.target.value})} className="w-full bg-charcoal border border-oil-dark rounded-lg p-3 text-sm text-base-cream" />
                </div>
              )}
          </div>
      )}

      {/* Step 4: Fitment */}
      {currentStep === 4 && (
        <div className="space-y-4">
            <input type="text" placeholder="VIN (Optional)" value={formData.vin} onChange={(e) => setFormData({...formData, vin: e.target.value})} className="w-full bg-steel-black border border-oil-dark rounded-lg p-3 text-sm text-base-cream" />
            <input type="text" placeholder="Make" value={formData.make} onChange={(e) => setFormData({...formData, make: e.target.value})} className="w-full bg-steel-black border border-oil-dark rounded-lg p-3 text-sm text-base-cream" />
        </div>
      )}

      {/* Step 5: Pricing */}
      {currentStep === 5 && (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {['New Old Stock', 'Excellent', 'Used OEM', 'For Parts'].map(cond => (
                <button key={cond} onClick={() => setFormData({...formData, condition: cond})} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase ${formData.condition === cond ? 'bg-rust-copper text-steel-black' : 'bg-charcoal text-warm-gray border border-oil-dark'}`}>
                  {cond}
                </button>
              ))}
            </div>
             <input type="number" placeholder="Price (MXN)" value={formData.price_mxn} onChange={(e) => setFormData({...formData, price_mxn: e.target.value})} className="w-full bg-steel-black border border-oil-dark rounded-lg p-3 text-sm text-base-cream" />
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
