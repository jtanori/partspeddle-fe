import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, Sparkles, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ImageOptimizer } from '../common/ImageOptimizer';

export const ListingWizard: React.FC = () => {
  const navigate = useNavigate();
  const { setPendingSnapImages } = useAppStore();
  const [images, setImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageAdded = (dataUrl: string) => {
    setImages(prev => [...prev, dataUrl]);
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const startAnalysis = async () => {
    if (images.length === 0) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('/api/gemini/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
      });
      
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze images');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-zinc-200">
      <div className="bg-zinc-900 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#B87333] rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-display font-bold uppercase tracking-tight">AI Listing Assistant</h3>
            <p className="text-xs text-zinc-400">Snap photos to generate specs instantly</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Upload Zone */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={img} className="w-full h-full object-cover" alt="Upload" />
              <button 
                onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {images.length < 4 && (
            <ImageOptimizer onOptimized={handleImageAdded}>
              <div className="aspect-square border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#B87333] hover:bg-[#B87333]/5 transition-all cursor-pointer">
                <Camera className="w-8 h-8 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Add Photo</span>
              </div>
            </ImageOptimizer>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex flex-col gap-4">
          <button
            onClick={startAnalysis}
            disabled={images.length === 0 || isAnalyzing}
            className="w-full bg-[#B87333] hover:bg-[#A35D1F] disabled:opacity-50 text-white py-4 rounded-xl font-display font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#B87333]/20"
          >
            {isAnalyzing ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze with Gemini AI
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-center gap-2 border border-red-100">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        {/* Results Preview */}
        {analysisResult && (
          <div className="space-y-6 animate-fade-in border-t border-zinc-100 pt-8">
            <div className="flex items-center gap-2 text-[#7A8B6F]">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-bold uppercase tracking-widest text-sm">Identification Successful</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50 p-6 rounded-xl border border-zinc-200">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Suggested Title</label>
                  <p className="font-display font-bold text-lg text-zinc-900">{analysisResult.suggested_title}</p>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">System / Part Type</label>
                  <p className="text-sm font-semibold text-zinc-700">{analysisResult.system} — {analysisResult.part_type}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Price Estimate</label>
                  <p className="font-mono font-bold text-[#B87333]">${analysisResult.estimated_price_range[0]} - ${analysisResult.estimated_price_range[1]}</p>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">AI Confidence</label>
                  <div className="w-full bg-zinc-200 h-1.5 rounded-full mt-1">
                    <div 
                      className="bg-[#7A8B6F] h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${analysisResult.confidence_score * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setPendingSnapImages(images);
                navigate('/dashboard');
              }}
              className="w-full bg-zinc-900 text-white py-4 rounded-xl font-display font-bold uppercase tracking-widest hover:bg-black transition-colors"
            >
              Draft Full Listing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
