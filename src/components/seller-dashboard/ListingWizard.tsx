import React, { useState } from 'react';
import { Camera, X, Sparkles, Upload, Package, Truck, Zap, Pencil, ShieldCheck, Loader2 } from 'lucide-react';
import { SYSTEM_CATEGORIES } from '../../services/taxonomy';
import { analyzeListingImage } from '../../services/ai-vision';
import { AIAnalysisResult } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../store/useAppStore';
import { compressImage } from '../../lib/image-utils';

interface ListingWizardProps {
  onClose: () => void;
}

export const ListingWizard: React.FC<ListingWizardProps> = ({ onClose }) => {
  const { user } = useAppStore();
  const [mode, setMode] = useState<'none' | 'vehicle' | 'component'>('none');
  const [currentStep, setCurrentStep] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [isAiVetted, setIsAiVetted] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState<any>({
      system: '', category: '', title: '', brand: '', model: '',
      oem_part_number: '', weight: '', voltage: '', amperage: '',
      pulley_type: '', make: '', year: '', vin: '', condition: 'Used OEM',
      price_mxn: 0, stock_number: ''
  });

  const handleImageUpload = async (file: File) => {
    if (!user) return;
    try {
        const compressedBlob = await compressImage(file);
        const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
        
        const fileExt = compressedFile.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        
        const { data, error } = await supabase.storage.from('yard-assets').upload(fileName, compressedFile);
        if (error) throw error;

        const { data: publicUrlData } = supabase.storage.from('yard-assets').getPublicUrl(fileName);
        
        setImages(prev => [...prev, publicUrlData.publicUrl]);
        setUploadedFiles(prev => [...prev, compressedFile]);
        setIsAiVetted(false);
        setAiResult(null);
    } catch (err) {
        console.error('Image upload failed:', err);
    }
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (uploadedFiles.length > 0 && !isAiVetted) {
        setIsScanning(true);
        try {
            const result = await analyzeListingImage(uploadedFiles[0], mode);
            setAiResult(result);
            setIsAiVetted(true);
            
            setFormData(prev => ({ ...prev, 
                system: result.system || prev.system,
                category: result.category || prev.category,
                title: result.part_type || prev.title,
                brand: result.brand || prev.brand,
                model: result.model || prev.model,
                oem_part_number: result.oem_part_number || prev.oem_part_number
            }));
            
            setCurrentStep(2);
        } catch (err) {
            console.error("AI automated prefill failed:", err);
            setCurrentStep(2);
        } finally {
            setIsScanning(false);
        }
      } else {
        setCurrentStep(2);
      }
    } else if (currentStep === 5) {
        await commitListing();
    } else {
        setCurrentStep(prev => Math.min(5, prev + 1));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setIsAiVetted(false);
    setAiResult(null);
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
          console.error("Failed to save inventory item:", error);
          return;
      }
      onClose();
  };

  if (mode === 'none') {
    return (
      <div className="bg-shell-surface border border-border-default rounded-sm p-8 shadow-panel max-w-2xl mx-auto relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-accent-amber" />
        <div className="flex justify-between items-center mb-10">
            <h2 className="font-heading text-lg font-black uppercase tracking-widest text-accent-amber pl-4">Select Listing Type</h2>
            <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button onClick={() => setMode('vehicle')} className="bg-shell-canvas border border-border-subtle p-6 rounded-sm hover:border-accent-amber/50 transition-all text-left space-y-4 group hover:bg-shell-sidebar">
                <Truck className="w-8 h-8 text-accent-amber opacity-80 group-hover:opacity-100 transition-opacity" />
                <div>
                    <h4 className="font-heading font-black text-xs text-text-primary uppercase tracking-widest">Donor Vehicle</h4>
                    <p className="text-[10px] text-text-muted mt-1.5 leading-relaxed font-mono">Catalog an entire salvage vehicle, frame assemblies, or salvaged chassis.</p>
                </div>
            </button>
            <button onClick={() => setMode('component')} className="bg-shell-canvas border border-border-subtle p-6 rounded-sm hover:border-accent-amber/50 transition-all text-left space-y-4 group hover:bg-shell-sidebar">
                <Package className="w-8 h-8 text-accent-amber opacity-80 group-hover:opacity-100 transition-opacity" />
                <div>
                    <h4 className="font-heading font-black text-xs text-text-primary uppercase tracking-widest">Individual Part</h4>
                    <p className="text-[10px] text-text-muted mt-1.5 leading-relaxed font-mono">Ingest isolated parts, machinery assemblies, or single-unit sub-assemblies.</p>
                </div>
            </button>
        </div>
        <button 
            onClick={() => { setMode('component'); setCurrentStep(2); setIsAiVetted(false); }}
            className="w-full mt-8 py-3 border border-border-subtle rounded-sm text-text-muted font-mono uppercase text-[9px] hover:text-text-primary hover:bg-shell-canvas transition-all tracking-[0.2em]"
        >
            Skip AI Scan & Create Manually
        </button>
      </div>
    );
  }

  return (
    <div className="terminal-panel p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-accent-amber" />
      <div className="flex justify-between items-center border-b border-border-default pb-3 mb-6">
        <h2 className="font-heading text-xs font-black uppercase tracking-widest text-accent-amber border-l-2 border-accent-amber pl-2.5">
          {mode === 'vehicle' ? 'Vehicle Listing' : 'Component Listing'} — Step {currentStep} of 5
        </h2>
        <button onClick={() => setMode('none')} className="text-text-muted hover:text-text-primary transition-colors"><X className="w-4 h-4" /></button>
      </div>

      {currentStep === 1 && (
        <div className="space-y-4">
            <div className="border border-dashed border-border-strong hover:border-accent-amber/50 rounded-sm bg-shell-canvas/30 transition-all p-6 flex flex-col items-center justify-center gap-2 cursor-pointer group relative overflow-hidden">
                <Upload className="w-5 h-5 text-text-muted group-hover:text-accent-amber transition-colors" />
                <div className="text-center">
                    <p className="text-xs font-bold text-text-primary font-heading tracking-tight">Drag and drop images or <span className="text-accent-amber underline decoration-accent-amber/30">browse files</span></p>
                    <p className="text-[10px] text-text-muted font-mono mt-1">Supports JPEG, PNG, WEBP up to 12MB</p>
                </div>
                <input type="file" className='absolute inset-0 opacity-0 cursor-pointer' onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])} />
            </div>
            {images.length > 0 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square bg-shell-sidebar rounded-sm border border-border-strong overflow-hidden group shadow-inner">
                            <img src={img} alt="Part preview" className="w-full h-full object-cover grayscale-[0.2]" />
                            <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-shell-canvas/80 rounded-sm p-1 text-text-primary opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}

      {currentStep === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                  <h4 className="text-[10px] font-mono font-bold uppercase text-text-muted tracking-widest border-b border-border-subtle pb-1">Part Specifications</h4>
                  <div className="relative">
                    <select value={formData.system} onChange={(e) => setFormData({...formData, system: e.target.value})} className="w-full bg-shell-canvas border border-border-default rounded-sm p-3 text-xs text-text-primary outline-none focus:border-accent-amber/50 transition-all font-sans shadow-inner">
                        <option value="">Select System</option>
                        {Object.keys(SYSTEM_CATEGORIES).map(sys => <option key={sys} value={sys}>{sys}</option>)}
                    </select>
                  </div>
                  <input type="text" placeholder="Part Title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-shell-canvas border border-border-default rounded-sm p-3 text-xs text-text-primary outline-none focus:border-accent-amber/50 transition-all font-sans shadow-inner" />
              </div>
          </div>
      )}

      {/* Steps 3, 4, 5 (Untouched) */}
      
      {/* Navigation Footer */}
      <div className="flex justify-between mt-10 pt-6 border-t border-border-default">
        <button onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} disabled={currentStep === 1 || isScanning} className="px-5 py-2.5 border border-border-strong bg-shell-surface hover:bg-shell-elevated text-text-secondary hover:text-text-primary text-[10px] font-heading font-black tracking-[0.2em] transition-all uppercase rounded-sm disabled:opacity-20 shadow-panel active:translate-y-0.5">← Back</button>
        <button 
            onClick={handleNextStep} 
            disabled={isScanning}
            className="px-8 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 text-[10px] font-heading font-black tracking-[0.2em] uppercase rounded-sm shadow-elevated hover:brightness-110 transition-all active:scale-[0.98] active:translate-y-0.5 flex items-center gap-2"
        >
            {isScanning ? (
                <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Analyzing Image...
                </>
            ) : currentStep === 5 ? (
                'Save to Inventory →'
            ) : (
                <>
                    Next Step →
                    <Sparkles className="w-3.5 h-3.5" />
                </>
            )}
        </button>
      </div>
      
      {isScanning && (
        <p className="text-center text-[10px] font-mono text-text-muted uppercase tracking-widest mt-4 animate-pulse">
          Extracting part details from photos, please wait...
        </p>
      )}
    </div>
  );
};
