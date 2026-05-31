import React, { useState } from 'react';
import { Camera, X, Sparkles, Upload, Package, Truck, Zap, Pencil, ShieldCheck } from 'lucide-react';
import { SYSTEM_CATEGORIES } from '../../services/taxonomy';
import { analyzeListingImage } from '../../services/ai-vision';
import { AIAnalysisResult } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../store/useAppStore';
import { compressImage } from '../../lib/image-utils';

interface ListingWizardProps {
  onClose: () => void;
}

type ManifestStatus = 'active' | 'sold' | 'damaged';

export const ListingWizard: React.FC<ListingWizardProps> = ({ onClose }) => {
  const { user } = useAppStore();
  const [mode, setMode] = useState<'none' | 'vehicle' | 'component'>('none');
  const [currentStep, setCurrentStep] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [isAiVetted, setIsAiVetted] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [images, setImages] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<any>({
      system: '', category: '', title: '', brand: '', model: '',
      oem_part_number: '', weight: '', voltage: '', amperage: '',
      pulley_type: '', make: '', year: '', vin: '', condition: 'Used OEM',
      price_mxn: 0, stock_number: ''
  });
  
  const [manifest, setManifest] = useState<Record<string, ManifestStatus>>({'Alternator': 'active', 'Starter': 'active'});

  const handleImageUpload = async (file: File) => {
    const compressedBlob = await compressImage(file);
    const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
    const fileExt = compressedFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    
    const { data, error } = await supabase.storage.from('listing-images').upload(fileName, compressedFile);
    if (error) {
        console.error('Upload error:', error);
        return;
    }
    const { data: publicUrlData } = supabase.storage.from('listing-images').getPublicUrl(fileName);
    setImages(prev => [...prev, publicUrlData.publicUrl]);
  };

  const handleOcrAnalysis = async () => {
    setIsScanning(true);
    try {
        const mockFile = new File([""], "image.png");
        const result = await analyzeListingImage(mockFile, mode);
        setAiResult(result);
        setIsAiVetted(true);
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

  const commitListing = async () => {
      if (!user) return;
      const payload = {
          ...formData,
          seller_id: user.id,
          images: images,
          is_ai_vetted: isAiVetted,
          is_search_penalized: !isAiVetted,
          created_at: new Date().toISOString()
      };
      const { error } = await supabase.from('parts').insert(payload);
      if (error) {
          console.error("Commit failed:", error);
          return;
      }
      onClose();
  };

  const ConfidenceBadge = ({ score }: { score?: number }) => {
    if (score === undefined) return null;
    const isHigh = score >= 0.7;
    return (
      <span className={`ml-2 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${isHigh ? 'text-sage-green bg-sage-green/10 border-sage-green/30' : 'text-rust-copper bg-rust-copper/10 border-rust-copper/30'}`}>
        {Math.round(score * 100)}% Accuracy
      </span>
    );
  };

  if (mode === 'none') {
    return (
      <div className="bg-charcoal border border-oil-dark rounded-xl p-6 shadow-2xl text-base-cream font-sans max-w-2xl mx-auto border-t-2 border-t-rust-copper">
        <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-sm font-black uppercase tracking-wider text-rust-copper border-l-2 border-rust-copper pl-3">Select Ingestion Pathway</h2>
            <button onClick={onClose} className="text-warm-gray hover:text-base-cream transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => setMode('vehicle')} className="bg-steel-black border border-oil-dark p-5 rounded-xl hover:border-rust-copper transition-all text-left space-y-3 group hover:bg-oil-dark/40">
                <Truck className="w-6 h-6 text-rust-copper" />
                <div>
                    <h4 className="font-display font-bold text-[11px] text-base-cream uppercase tracking-wider">Vehicle Listing</h4>
                    <p className="text-[10px] text-warm-gray mt-0.5 leading-relaxed">Process complete donor vehicle, frame assemblies, or salvaged chassis.</p>
                </div>
            </button>
            <button onClick={() => setMode('component')} className="bg-steel-black border border-oil-dark p-5 rounded-xl hover:border-rust-copper transition-all text-left space-y-3 group hover:bg-oil-dark/40">
                <Package className="w-6 h-6 text-rust-copper" />
                <div>
                    <h4 className="font-display font-bold text-[11px] text-base-cream uppercase tracking-wider">Component Listing</h4>
                    <p className="text-[10px] text-warm-gray mt-0.5 leading-relaxed">Ingest isolated parts, machinery assemblies, or single-unit sub-assemblies.</p>
                </div>
            </button>
        </div>
        <button 
            onClick={() => { setMode('component'); setCurrentStep(2); setIsAiVetted(false); }}
            className="w-full mt-4 py-2.5 border border-oil-dark rounded-lg text-warm-gray font-mono uppercase text-[9px] hover:text-base-cream hover:bg-oil-dark/20 transition-all tracking-widest"
        >
            Bypass Optical Scans / Manual Matrix Mode
        </button>
      </div>
    );
  }

  return (
    <div className="bg-charcoal border border-oil-dark rounded-xl p-5 shadow-2xl text-base-cream font-sans border-t-2 border-t-rust-copper">
      <div className="flex justify-between items-center border-b border-oil-dark pb-3 mb-4">
        <h2 className="font-display text-xs font-black uppercase tracking-wider text-rust-copper border-l-2 border-rust-copper pl-2.5">
          {mode === 'vehicle' ? 'Vehicle Listing' : 'Component Listing'} — Step {currentStep} of 5
        </h2>
        <button onClick={() => setMode('none')} className="text-warm-gray hover:text-base-cream transition-colors"><X className="w-5 h-5" /></button>
      </div>

      {currentStep === 1 && (
        <div className="space-y-4">
            <div className="border border-dashed border-rust-copper/20 hover:border-rust-copper/50 rounded bg-steel-black/30 transition-all p-6 flex flex-col items-center justify-center gap-2 cursor-pointer group relative overflow-hidden">
                <Upload className="w-5 h-5 text-rust-copper/60 group-hover:text-rust-copper transition-colors" />
                <div className="text-center">
                    <p className="text-xs font-medium text-base-cream/90">Drag and drop media or <span className="text-rust-copper underline">browse files</span></p>
                    <p className="text-[10px] text-warm-gray font-mono mt-0.5">Supports JPEG, PNG up to 12MB</p>
                </div>
                <input type="file" className='absolute inset-0 opacity-0 cursor-pointer' onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} />
            </div>
            {images.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square bg-steel-black rounded border border-oil-dark overflow-hidden group">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-0.5 right-0.5 bg-black/60 rounded p-1 text-base-cream opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2 h-2" /></button>
                        </div>
                    ))}
                </div>
            )}
          <button onClick={handleOcrAnalysis} className="w-full bg-charcoal/50 border border-rust-copper/40 text-rust-copper hover:bg-rust-copper hover:text-steel-black font-display font-bold uppercase py-2.5 rounded-lg text-[10px] transition-all flex items-center justify-center gap-2 tracking-widest">
            <Sparkles className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? 'Syncing Pipeline...' : 'Execute Optical OCR Analysis Layer'}
          </button>
        </div>
      )}

      {currentStep === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                  <h4 className="text-[10px] font-display font-bold uppercase text-rust-copper tracking-widest">Taxonomy Parameters</h4>
                  <div className="relative">
                    <select value={formData.system} onChange={(e) => setFormData({...formData, system: e.target.value})} className="w-full bg-steel-black border border-oil-dark rounded-lg p-2 text-xs text-base-cream outline-none focus:border-rust-copper/50 transition-colors">
                        <option value="">Select System</option>
                        {Object.keys(SYSTEM_CATEGORIES).map(sys => <option key={sys} value={sys}>{sys}</option>)}
                    </select>
                    {isAiVetted && aiResult?.confidence_scores && <ConfidenceBadge score={aiResult.confidence_scores.part_type_accuracy} />}
                  </div>
                  <input type="text" placeholder="Technical Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-steel-black border border-oil-dark rounded-lg p-2 text-xs text-base-cream outline-none focus:border-rust-copper/50 transition-colors" />
              </div>
          </div>
      )}

      {currentStep === 3 && (
          <div className="space-y-4">
              <h4 className="text-[10px] font-display font-bold uppercase text-rust-copper tracking-widest">Engineering Schemas</h4>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="OEM Part Number" value={formData.oem_part_number} onChange={(e) => setFormData({...formData, oem_part_number: e.target.value})} className="w-full bg-steel-black border border-oil-dark rounded-lg p-2 text-xs text-base-cream" />
                <input type="text" placeholder="Weight" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full bg-steel-black border border-oil-dark rounded-lg p-2 text-xs text-base-cream" />
              </div>
              {formData.system === 'Electrical System' && (
                <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Voltage" value={formData.voltage} onChange={(e) => setFormData({...formData, voltage: e.target.value})} className="w-full bg-steel-black border border-oil-dark rounded-lg p-2 text-xs text-base-cream" />
                    <input type="text" placeholder="Amperage" value={formData.amperage} onChange={(e) => setFormData({...formData, amperage: e.target.value})} className="w-full bg-steel-black border border-oil-dark rounded-lg p-2 text-xs text-base-cream" />
                </div>
              )}
          </div>
      )}

      {currentStep === 4 && (
        <div className="space-y-4">
            <h4 className="text-[10px] font-display font-bold uppercase text-rust-copper tracking-widest">Vehicle Fitment</h4>
            <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Make" value={formData.make} onChange={(e) => setFormData({...formData, make: e.target.value})} className="w-full bg-steel-black border border-oil-dark rounded-lg p-2 text-xs text-base-cream" />
                <input type="text" placeholder="Year" value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full bg-steel-black border border-oil-dark rounded-lg p-2 text-xs text-base-cream" />
            </div>
            <input type="text" placeholder="VIN (Optional)" value={formData.vin} onChange={(e) => setFormData({...formData, vin: e.target.value})} className="w-full bg-steel-black border border-oil-dark rounded-lg p-2 text-xs text-base-cream" />
        </div>
      )}

      {currentStep === 5 && (
        <div className="space-y-4">
            <h4 className="text-[10px] font-display font-bold uppercase text-rust-copper tracking-widest">Pricing & Logistics</h4>
            <div className="flex flex-wrap gap-2">
              {['New Old Stock', 'Excellent', 'Used OEM', 'For Parts'].map(cond => (
                <button key={cond} onClick={() => setFormData({...formData, condition: cond})} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${formData.condition === cond ? 'bg-rust-copper text-steel-black' : 'bg-charcoal text-warm-gray border border-oil-dark'}`}>
                  {cond}
                </button>
              ))}
            </div>
             <input type="number" placeholder="Price (MXN)" value={formData.price_mxn} onChange={(e) => setFormData({...formData, price_mxn: e.target.value})} className="w-full bg-steel-black border border-oil-dark rounded-lg p-2 text-xs text-base-cream font-mono" />
             <div className="p-3 bg-steel-black/50 border border-rust-copper/20 rounded-lg flex justify-between items-center">
                <span className="text-[9px] text-warm-gray uppercase font-bold tracking-widest">Est. USD Value</span>
                <span className="text-xs font-black text-rust-copper">${(Number(formData.price_mxn) / 20).toFixed(2)} USD</span>
             </div>
        </div>
      )}

      <div className="flex justify-between mt-6 pt-4 border-t border-oil-dark">
        <button onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} disabled={currentStep === 1} className="px-5 py-2 bg-charcoal border border-oil-dark rounded text-[10px] font-bold uppercase tracking-wider text-warm-gray hover:text-base-cream disabled:opacity-30 transition-all">Back</button>
        <button onClick={() => currentStep === 5 ? commitListing() : setCurrentStep(prev => Math.min(5, prev + 1))} className="px-5 py-2 bg-rust-copper hover:bg-bronze text-steel-black rounded text-[10px] font-bold uppercase tracking-wider transition-all active:scale-[0.98]">
            {currentStep === 5 ? 'Commit to Registry' : 'Advance Step'}
        </button>
      </div>
    </div>
  );
};
