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
    const fileName = `${user?.id}/${Math.random()}.${fileExt}`;
    
    const { data, error } = await supabase.storage.from('yard-assets').upload(fileName, compressedFile);
    if (error) {
        console.error('Upload error:', error);
        return;
    }
    const { data: publicUrlData } = supabase.storage.from('yard-assets').getPublicUrl(fileName);
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
      <span className={`ml-2 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-sm border ${isHigh ? 'text-sage-green bg-sage-green/10 border-sage-green/30' : 'text-amber-500 bg-amber-500/10 border-amber-500/30'}`}>
        {Math.round(score * 100)}% Accuracy
      </span>
    );
  };

  if (mode === 'none') {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-sm p-6 shadow-2xl text-base-cream font-mono max-w-2xl mx-auto border-t-2 border-t-amber-500">
        <div className="flex justify-between items-center mb-6">
            <h2 className="font-sans text-sm font-black uppercase tracking-wider text-amber-400 border-l-2 border-amber-500 pl-3">Select Ingestion Pathway</h2>
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-100 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => setMode('vehicle')} className="bg-zinc-900 border border-zinc-800 p-5 rounded-sm hover:border-amber-500/50 transition-all text-left space-y-3 group hover:bg-zinc-800/40">
                <Truck className="w-6 h-6 text-amber-500" />
                <div>
                    <h4 className="font-sans font-black text-[11px] text-base-cream uppercase tracking-wider">Vehicle Listing</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed font-mono">Process complete donor vehicle, frame assemblies, or salvaged chassis.</p>
                </div>
            </button>
            <button onClick={() => setMode('component')} className="bg-zinc-900 border border-zinc-800 p-5 rounded-sm hover:border-amber-500/50 transition-all text-left space-y-3 group hover:bg-zinc-800/40">
                <Package className="w-6 h-6 text-amber-500" />
                <div>
                    <h4 className="font-sans font-black text-[11px] text-base-cream uppercase tracking-wider">Component Listing</h4>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed font-mono">Ingest isolated parts, machinery assemblies, or single-unit sub-assemblies.</p>
                </div>
            </button>
        </div>
        <button 
            onClick={() => { setMode('component'); setCurrentStep(2); setIsAiVetted(false); }}
            className="w-full mt-4 py-2 border border-zinc-800 rounded-sm text-zinc-500 font-mono uppercase text-[9px] hover:text-zinc-100 hover:bg-zinc-900/50 transition-all tracking-widest"
        >
            Bypass Optical Scans / Manual Matrix Mode
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-sm p-5 shadow-2xl text-base-cream font-mono border-t-2 border-t-amber-500">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-3 mb-4">
        <h2 className="font-sans text-xs font-black uppercase tracking-wider text-amber-400 border-l-2 border-amber-500 pl-2.5">
          {mode === 'vehicle' ? 'Vehicle Asset' : 'Component Node'} — Step {currentStep} of 5
        </h2>
        <button onClick={() => setMode('none')} className="text-zinc-500 hover:text-zinc-100 transition-colors font-sans"><X className="w-4 h-4" /></button>
      </div>

      {currentStep === 1 && (
        <div className="space-y-4">
            <div className="border border-dashed border-amber-500/20 hover:border-amber-500/50 rounded-sm bg-zinc-900/30 transition-all p-6 flex flex-col items-center justify-center gap-2 cursor-pointer group relative overflow-hidden">
                <Upload className="w-5 h-5 text-amber-500/60 group-hover:text-amber-400 transition-colors" />
                <div className="text-center">
                    <p className="text-xs font-bold text-neutral-100 font-sans tracking-tight">Drag and drop media or <span className="text-amber-500 underline">browse files</span></p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Supports JPEG, PNG up to 12MB</p>
                </div>
                <input type="file" className='absolute inset-0 opacity-0 cursor-pointer' onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} />
            </div>
            {images.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square bg-zinc-900 rounded-sm border border-zinc-800 overflow-hidden group shadow-inner">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-0.5 right-0.5 bg-neutral-950/80 rounded-sm p-1 text-base-cream opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2 h-2" /></button>
                        </div>
                    ))}
                </div>
            )}
          <button onClick={handleOcrAnalysis} className="w-full bg-zinc-900 border border-amber-500/40 text-amber-500 hover:bg-amber-500/10 font-bold uppercase py-2.5 rounded-sm text-[9px] transition-all flex items-center justify-center gap-2 tracking-widest font-mono">
            <Sparkles className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? 'Syncing Pipeline...' : 'Execute Optical OCR Analysis Layer'}
          </button>
        </div>
      )}

      {currentStep === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase text-amber-500 tracking-widest">Taxonomy Parameters</h4>
                  <div className="relative">
                    <select value={formData.system} onChange={(e) => setFormData({...formData, system: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-sm p-2 text-xs text-neutral-100 outline-none focus:border-amber-500/50 transition-colors font-sans">
                        <option value="">Select System</option>
                        {Object.keys(SYSTEM_CATEGORIES).map(sys => <option key={sys} value={sys}>{sys}</option>)}
                    </select>
                    {isAiVetted && aiResult?.confidence_scores && <ConfidenceBadge score={aiResult.confidence_scores.part_type_accuracy} />}
                  </div>
                  <input type="text" placeholder="Technical Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-sm p-2 text-xs text-neutral-100 outline-none focus:border-amber-500/50 transition-colors font-sans" />
              </div>
          </div>
      )}

      {/* Navigation Footer - High Contrast */}
      <div className="flex justify-between mt-6 pt-4 border-t border-zinc-800">
        <button 
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} 
            disabled={currentStep === 1} 
            className="px-5 py-2 border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white text-[10px] font-bold tracking-wide transition-all uppercase rounded-sm disabled:opacity-20"
        >
            ← Back
        </button>
        <button 
            onClick={() => currentStep === 5 ? commitListing() : setCurrentStep(prev => Math.min(5, prev + 1))} 
            className="px-6 py-2 bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 text-[10px] font-black tracking-widest uppercase rounded-sm shadow-[0_2px_10px_rgba(245,158,11,0.15)] hover:shadow-[0_2px_14px_rgba(245,158,11,0.3)] transition-all active:scale-[0.98]"
        >
            {currentStep === 5 ? 'Commit to Registry →' : 'Advance Step →'}
        </button>
      </div>
    </div>
  );
};
