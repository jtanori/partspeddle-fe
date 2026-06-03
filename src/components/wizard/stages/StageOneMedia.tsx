import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface StagedFile {
  id: string;
  file: File;
  previewUrl: string;
}

interface StageOneMediaProps {
  mode: 'vehicle' | 'component';
  setMode: (mode: 'vehicle' | 'component') => void;
  uploadedFiles: StagedFile[];
  onUpload: (file: File) => void;
  onRemove: (id: string) => void;
  onScan: () => void;
  isScanning: boolean;
}

export default function StageOneMedia({
  mode,
  setMode,
  uploadedFiles,
  onUpload,
  onRemove,
  onScan,
  isScanning
}: StageOneMediaProps) {
  const [activeMode, setActiveMode] = useState<'VEHICLE' | 'COMPONENT'>(mode === 'vehicle' ? 'VEHICLE' : 'COMPONENT');
  const [activePopover, setActivePopover] = useState<string | null>(null);

  // Sync mode with parent
  const handleModeChange = (newMode: 'VEHICLE' | 'COMPONENT') => {
    setActiveMode(newMode);
    setMode(newMode === 'VEHICLE' ? 'vehicle' : 'component');
  };

  return (
    <div className="w-full flex flex-col min-h-0 overflow-hidden bg-zinc-900/20 border border-zinc-800 rounded-sm p-4 font-mono">
      
      {/* SECTION 1: TACTICAL CONTROL BAR */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4 relative">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-zinc-500 tracking-widest uppercase">{'>>'} INTAKE STREAM:</span>
          
          <div className="flex bg-black p-0.5 rounded border border-zinc-800 relative">
            <button 
              onClick={() => handleModeChange('VEHICLE')}
              className={`px-3 py-1 text-[11px] tracking-wider font-mono transition-colors rounded-sm ${activeMode === 'VEHICLE' ? 'bg-zinc-900 text-amber-500 border border-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              VEHICLE
            </button>
            <button 
              onClick={() => handleModeChange('COMPONENT')}
              className={`px-3 py-1 text-[11px] tracking-wider font-mono transition-colors rounded-sm ${activeMode === 'COMPONENT' ? 'bg-zinc-900 text-amber-500 border border-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              COMPONENT
            </button>
          </div>
          
          {/* HELP POPOVER ANCHOR */}
          <div className="relative inline-block">
            <button 
              onMouseEnter={() => setActivePopover('mode')}
              onMouseLeave={() => setActivePopover(null)}
              className="w-4 h-4 rounded-full bg-black border border-zinc-800 flex items-center justify-center text-[10px] text-zinc-500 hover:border-amber-500 hover:text-amber-500 transition-colors focus:outline-none"
            >
              ?
            </button>
            {activePopover === 'mode' && (
              <div className="absolute left-6 top-0 w-80 bg-zinc-950 border border-amber-500/40 p-3 text-[10px] text-zinc-300 rounded-sm shadow-2xl z-50 leading-relaxed whitespace-pre-line">
                <span className="text-amber-500 font-bold">[ INTAKE MODE SELECTION ]</span>{"\n"}
                • VEHICLE: Scans donor frames to pull raw VIN, title registries, and chassis specs.{"\n"}
                • COMPONENT: Activates high-density computer vision to segment loose parts and auto-generate stock indexes.
              </div>
            )}
          </div>
        </div>

        <div className="text-[10px] text-zinc-600 uppercase tracking-wider hidden sm:block">
          SYS_STATUS: [ BUFFER_STAGING_ACTIVE ]
        </div>
      </div>

      {/* SECTION 2: WORKSPACE CONTENT CORE (CONTAINED SCROLL LAYER) */}
      <div className="flex-1 flex flex-col min-h-0 space-y-4">
        
        {/* HIGH-DENSITY INPUT DROPZONE */}
        <div className="relative group border border-dashed border-zinc-800 rounded-sm p-6 bg-black/40 hover:border-amber-500/30 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[140px]">
          <div className="text-center space-y-1">
            <p className="text-xs text-zinc-400">
              Drag and drop raw camera media files or <span className="text-amber-500 underline">browse node storage</span>
            </p>
            <p className="text-[9px] text-zinc-600 uppercase tracking-widest">
              Maximum intake allocation: 50MB per batch packet buffer
            </p>
          </div>
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => e.target.files && onUpload(e.target.files[0])} />
        </div>

        {/* IMAGE STAGING FEED (ISOLATED INTERNAL SCROLLBAR) */}
        <div className="flex-1 overflow-y-auto min-h-[140px] max-h-[260px] bg-black/60 border border-zinc-900 p-3 rounded-sm custom-scrollbar">
          {uploadedFiles.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center border border-dashed border-zinc-900/40 py-8">
              <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
                [ Empty staging queue — Asset upload required ]
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="relative aspect-square bg-black border border-zinc-800 rounded-sm overflow-hidden group">
                  <img 
                    src={file.previewUrl} 
                    alt="Part intake matrix" 
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 z-0 flex flex-col items-center justify-center p-2 text-center bg-zinc-950">
                    <span className="text-[9px] uppercase tracking-wider text-amber-500/80 font-bold mb-1">STAGED_NODE</span>
                    <span className="text-[8px] text-zinc-500 truncate w-full">{file.file.name}</span>
                  </div>
                  
                  <button onClick={() => onRemove(file.id)} className="absolute top-1 right-1 z-10 bg-black/80 hover:bg-zinc-900 text-zinc-500 hover:text-red-400 border border-zinc-800 px-1 py-0.5 text-[9px] font-bold rounded-sm transition-colors">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: RE-POSITIONED INTEGRATED SYSTEM CONTROL BAR */}
      <div className="mt-4 pt-3 border-t border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-[10px] text-zinc-500 font-mono">
          STAGED_PAYLOAD: <span className="text-zinc-300 font-bold">{uploadedFiles.length} nodes</span> waiting ingestion compile
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <button className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors py-2 px-1">
            Skip AI & Manual Entry
          </button>
          
          <button 
            onClick={onScan}
            disabled={uploadedFiles.length === 0 || isScanning}
            className="bg-amber-500 hover:bg-amber-600 text-black font-black tracking-widest uppercase px-6 py-2.5 text-xs border border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 transition-all shadow-[0_0_10px_rgba(245,158,11,0.05)] rounded-sm disabled:opacity-50"
          >
            {isScanning ? 'Executing Scan...' : 'Execute Scan'}
          </button>
        </div>
      </div>
    </div>
  );
}
