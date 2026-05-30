import React, { useState } from 'react';
import { Camera, X, Sparkles, Upload, Package, Truck, Zap, Pencil, ShieldCheck } from 'lucide-react';
import { SYSTEM_CATEGORIES } from '../../services/db';
import { analyzeListingImage } from '../../services/ai-vision';
import { AIAnalysisResult } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../store/useAppStore';

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

import { compressImage } from '../../lib/image-utils';

// ...
  const handleImageUpload = async (file: File) => {
    // 1. Compress the file on the client side
    const compressedBlob = await compressImage(file);
    const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
    
    // 2. Upload the compressed blob
    const fileExt = compressedFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
        .from('listing-images')
        .upload(fileName, compressedFile);

    if (error) {
        console.error('Upload error:', error);
        return;
    }

    const { data: publicUrlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName);

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

      {currentStep === 1 && (
        <div className="space-y-6">
            <div className="aspect-video bg-steel-black rounded-lg border-2 border-dashed border-oil-dark flex items-center justify-center cursor-pointer hover:border-rust-copper transition-colors">
                <label className='text-center cursor-pointer'>
                    <Upload className="w-8 h-8 text-warm-gray mx-auto mb-2" />
                    <span className='text-xs font-bold uppercase tracking-widest text-warm-gray'>Upload Image</span>
                    <input type="file" className='hidden' onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} />
                </label>
            </div>
          <button onClick={handleOcrAnalysis} className="w-full bg-charcoal border border-rust-copper text-rust-copper hover:bg-rust-copper hover:text-steel-black font-display font-bold uppercase py-3 rounded-xl transition-all flex items-center justify-center gap-2">
            <Sparkles className={isScanning ? "animate-spin" : ""} />
            {isScanning ? 'Analyzing...' : 'Execute Optical OCR Analysis Layer'}
          </button>
        </div>
      )}

      {currentStep === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                  <h4 className="text-sm font-display font-bold uppercase text-base-cream">Taxonomy Selection</h4>
                  <div className="relative">
                    <select value={formData.system} onChange={(e) => setFormData({...formData, system: e.target.value})} className="w-full bg-steel-black border border-oil-dark rounded-lg p-3 text-sm text-base-cream">
                        <option value="">Select System</option>
                        {Object.keys(SYSTEM_CATEGORIES).map(sys => <option key={sys} value={sys}>{sys}</option>)}
                    </select>
                    {isAiVetted && aiResult?.confidence_scores && <ConfidenceBadge score={aiResult.confidence_scores.part_type_accuracy} />}
                  </div>
                  <input type="text" placeholder="Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-steel-black border border-oil-dark rounded-lg p-3 text-sm text-base-cream" />
              </div>
          </div>
      )}

      {/* Navigation Footer */}
      <div className="flex justify-between mt-8 pt-6 border-t border-oil-dark">
        <button onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} disabled={currentStep === 1} className="px-6 py-2 bg-charcoal border border-oil-dark rounded-lg text-xs font-bold uppercase tracking-wider text-warm-gray hover:text-base-cream disabled:opacity-50">Back</button>
        <button onClick={() => currentStep === 5 ? commitListing() : setCurrentStep(prev => Math.min(5, prev + 1))} className="px-6 py-2 bg-rust-copper hover:bg-bronze text-steel-black rounded-lg text-xs font-bold uppercase tracking-wider">
            {currentStep === 5 ? 'Commit to Active Registry Node' : 'Advance Step'}
        </button>
      </div>
    </div>
  );
};
