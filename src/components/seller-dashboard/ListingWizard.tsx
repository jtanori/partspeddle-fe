import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import StageOneMedia from '../wizard/stages/StageOneMedia';
import { StageTwoTaxonomy } from '../wizard/stages/StageTwoTaxonomy';
import { StageThreeLogistics } from '../wizard/stages/StageThreeLogistics';
import { analyzeListingImage } from '../../services/ai-vision';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../store/useAppStore';
import { useInventoryWizard } from '../../context/InventoryWizardContext';
import { useIngestionSessionLock } from '../../hooks/useIngestionSessionLock';
import { compressImage } from '../../lib/image-utils';

interface ListingWizardProps {
  onClose: () => void;
}

export const ListingWizard: React.FC<ListingWizardProps> = ({ onClose }) => {
  const { user } = useAppStore();
  const { setIsTerminalLocked } = useInventoryWizard();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'vehicle' | 'component'>('component');
  const [isScanning, setIsScanning] = useState(false);
  const [formData, setFormData] = useState<any>({
      system: '', category: '', title: '', brand: '', model: '',
      oem_part_number: '', price_mxn: 0, stock_number: '', description: '', condition: 'Used OEM'
  });
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; file: File; previewUrl: string }[]>([]);
  const [fitmentArray, setFitmentArray] = useState<string[]>([]);
  const [aiResult, setAiResult] = useState<any>(null);

  const isDirty = uploadedFiles.length > 0 || formData.title !== '';
  
  React.useEffect(() => {
      setIsTerminalLocked(isDirty);
  }, [isDirty, setIsTerminalLocked]);

  useIngestionSessionLock(isDirty);

  const handleUpload = async (file: File) => {
    if (!user) return;
    const compressedBlob = await compressImage(file);
    const fileName = `${user.id}/${Math.random()}.jpg`;
    await supabase.storage.from('yard-assets').upload(fileName, compressedBlob);
    const { data: publicUrlData } = supabase.storage.from('yard-assets').getPublicUrl(fileName);
    
    setUploadedFiles(prev => [...prev, { id: fileName, file, previewUrl: publicUrlData.publicUrl }]);
  };

  const handleScan = async () => {
    if (uploadedFiles.length === 0) return;
    setIsScanning(true);
    const result = await analyzeListingImage(uploadedFiles[0].file, mode);
    setAiResult(result);
    setFormData((prev: any) => ({ ...prev, ...result }));
    setIsScanning(false);
    setStep(2);
  };

  const commitListing = async () => {
      try {
        const payload = {
          listing: { ...formData, seller_id: user?.id },
          assets: uploadedFiles.map(file => ({ url: file.id, is_primary: true })),
          fitment: fitmentArray.map(id => ({ vehicle_variant_id: id }))
        };

        const { error } = await supabase.rpc('commit_inventory_package', payload);

        if (error) throw error;

        onClose();
      } catch (error) {
        console.error("Critical failure during inventory commit:", error);
        alert("Failed to commit listing to inventory. Please try again.");
      }
  };

  return (
    <div className="terminal-panel p-6">
      <div className="flex justify-between items-center border-b border-border-default pb-4 mb-6">
        <h2 className="font-heading text-xs font-black uppercase tracking-widest text-accent-amber border-l-2 border-accent-amber pl-3">
          Ingestion Terminal — Stage {step} of 3
        </h2>
        <button onClick={onClose}><X className="w-4 h-4" /></button>
      </div>

      {step === 1 && <StageOneMedia mode={mode} setMode={setMode} uploadedFiles={uploadedFiles} onUpload={handleUpload} onRemove={(id) => setUploadedFiles(uploadedFiles.filter(item => item.id !== id))} onScan={handleScan} isScanning={isScanning} />}
      {step === 2 && <StageTwoTaxonomy formData={formData} setFormData={setFormData} aiResult={aiResult} />}
      {step === 3 && <StageThreeLogistics formData={formData} setFormData={setFormData} fitmentArray={fitmentArray} setFitmentArray={setFitmentArray} />}
      
      <div className="flex justify-between mt-6 pt-6 border-t border-border-default">
        <button onClick={() => setStep(prev => Math.max(1, prev - 1))} disabled={step === 1} className="px-6 py-2 border border-border-default text-[10px] font-bold uppercase">← Back</button>
        <button 
            onClick={() => step === 3 ? commitListing() : setStep(prev => Math.min(3, prev + 1))}
            className="px-8 py-2 bg-accent-amber text-neutral-950 text-[10px] font-black uppercase tracking-widest"
        >
            {step === 3 ? 'COMMIT TO INVENTORY →' : 'Next Stage →'}
        </button>
      </div>
    </div>
  );
};
