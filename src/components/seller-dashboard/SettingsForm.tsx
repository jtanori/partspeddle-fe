import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/hooks';
import { User, MapPin, Mail, Phone, Camera, ShieldCheck, Check, Upload, ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const LogoUploadZone: React.FC<{ initialLogoUrl?: string }> = ({ initialLogoUrl }) => {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active authentication window context detected.');

      const uploadPayload = new FormData();
      uploadPayload.append('logo', file);

      const response = await fetch('/api/seller/upload-logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: uploadPayload,
      });


      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Upload error');

      setLogoUrl(result.logoUrl);
    } catch (err: any) {
      setUploadError(err.message || 'Asset syncing pipeline broken.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border border-border-strong bg-shell-canvas/30 rounded-sm p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 max-w-2xl shadow-panel w-full">
      <div className="relative w-20 h-20 rounded-sm border border-border-strong bg-shell-sidebar flex items-center justify-center overflow-hidden shrink-0 group shadow-inner transition-colors hover:border-accent-amber/30">
        {logoUrl ? (
          <img src={logoUrl} alt="Yard Master Identity" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
        ) : (
          <ImageIcon className="w-8 h-8 text-text-muted opacity-40" />
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-shell-sidebar/80 flex items-center justify-center backdrop-blur-xs">
            <Loader2 className="w-5 h-5 text-accent-amber animate-spin" />
          </div>
        )}
      </div>

      <div className="flex-1 space-y-1.5">
        <label className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent-amber font-black block">
          Corporate Identity Asset
        </label>
        <p className="text-xs text-text-muted font-sans leading-relaxed">
          Upload official commercial yard branding. JPG, PNG, WEBP formats up to 5MB.
        </p>
        
        {uploadError && (
          <p className="text-[10px] text-danger font-mono mt-1 animate-pulse">⚠️ {uploadError}</p>
        )}

        <div className="pt-2">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/webp" 
            className="hidden" 
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border-strong rounded-sm bg-shell-canvas hover:bg-shell-surface text-[10px] font-black text-text-secondary hover:text-text-primary transition-all disabled:opacity-40 uppercase tracking-widest shadow-sm"
          >
            <Upload className="w-3.5 h-3.5" />
            {logoUrl ? 'Replace Node Branding' : 'Initialize Logo Ingest'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const SettingsForm: React.FC = () => {
  const { profile, setProfile } = useAuthStore();
  const [localProfile, setLocalProfile] = useState(profile);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (profile) setLocalProfile(profile);
  }, [profile]);

  if (!localProfile) {
    return (
      <div className="terminal-panel p-24 flex flex-col items-center justify-center gap-6">
        <div className="w-10 h-10 border-4 border-accent-amber/20 border-t-accent-amber rounded-full animate-spin"></div>
        <span className="text-xs font-heading font-black text-text-muted uppercase tracking-[0.25em]">Loading profile settings...</span>
      </div>
    );
  }

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active authentication context.');

      const response = await fetch('/api/seller/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          yardName: localProfile.name,
          whatsappNumber: localProfile.whatsapp,
          location: localProfile.location,
          email: localProfile.email
        }),
      });


      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Update failed');

      setProfile(result.profile);
      setSaveStatus('saved');
    } catch (err: any) {
      console.error('Failed to save profile:', err.message);
      setSaveStatus('idle');
    }
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  return (
    <div className="terminal-panel overflow-hidden">
      <div className="bg-shell-canvas/50 p-4 sm:p-6 md:p-10 border-b border-border-default">
        <div className="flex flex-col md:flex-row md:items-center gap-10">
          <LogoUploadZone initialLogoUrl={localProfile.logoUrl} />
          <div className="space-y-2">
            <h2 className="text-3xl font-heading font-black uppercase tracking-tight text-text-primary">{localProfile.name || 'Yard Profile'}</h2>
            <div className="flex items-center gap-2.5">
              <div className={`p-1 rounded-sm ${localProfile.verificationStatus === 'verified' ? 'bg-success/10' : 'bg-warning/10'}`}>
                <ShieldCheck className={`w-4 h-4 ${localProfile.verificationStatus === 'verified' ? 'text-success' : 'text-warning'}`} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${localProfile.verificationStatus === 'verified' ? 'text-success' : 'text-warning'}`}>
                {localProfile.verificationStatus || 'Unverified'} Registry Node
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 bg-shell-workspace/30">
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-border-subtle pb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-amber" />
            <h3 className="text-xs font-heading font-black uppercase tracking-[0.2em] text-text-primary">Yard Infrastructure</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono font-bold text-text-muted tracking-widest flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Registry Identity
              </label>
              <input 
                type="text" 
                value={localProfile.name || ''}
                onChange={(e) => setLocalProfile({...localProfile, name: e.target.value})}
                className="w-full bg-shell-canvas border border-border-default rounded-sm p-3.5 text-xs text-text-primary outline-none focus:border-accent-amber/50 focus:ring-1 focus:ring-accent-amber/10 transition-all font-sans shadow-inner"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono font-bold text-text-muted tracking-widest flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Geospatial Coordinate
              </label>
              <input 
                type="text" 
                value={localProfile.location || ''}
                onChange={(e) => setLocalProfile({...localProfile, location: e.target.value})}
                placeholder="Region, Province, District"
                className="w-full bg-shell-canvas border border-border-default rounded-sm p-3.5 text-xs text-text-primary outline-none focus:border-accent-amber/50 focus:ring-1 focus:ring-accent-amber/10 transition-all font-sans shadow-inner"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-border-subtle pb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-amber" />
            <h3 className="text-xs font-heading font-black uppercase tracking-[0.2em] text-text-primary">Comms Dispatch</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono font-bold text-text-muted tracking-widest flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> Network Email
              </label>
              <input 
                type="email" 
                value={localProfile.email || ''}
                onChange={(e) => setLocalProfile({...localProfile, email: e.target.value})}
                className="w-full bg-shell-canvas border border-border-default rounded-sm p-3.5 text-xs text-text-primary outline-none focus:border-accent-amber/50 focus:ring-1 focus:ring-accent-amber/10 transition-all font-sans shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono font-bold text-text-muted tracking-widest flex items-center gap-2">
                <Phone className="w-3.5 h-3.5" /> Encrypted Comms Link
              </label>
              <input 
                type="text" 
                value={localProfile.whatsapp || ''}
                onChange={(e) => setLocalProfile({...localProfile, whatsapp: e.target.value})}
                placeholder="+XX (XXX) XXX-XXXX"
                className="w-full bg-shell-canvas border border-border-default rounded-sm p-3.5 text-xs text-text-primary outline-none focus:border-accent-amber/50 focus:ring-1 focus:ring-accent-amber/10 transition-all font-sans shadow-inner"
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 pt-8 flex justify-end border-t border-border-subtle mt-4">
          <button 
            onClick={handleSave}
            disabled={saveStatus !== 'idle'}
            className={`min-w-[200px] flex items-center justify-center gap-3 py-3.5 px-10 rounded-sm font-heading font-black uppercase text-[11px] tracking-[0.2em] transition-all shadow-elevated active:translate-y-0.5 ${
              saveStatus === 'saved' ? 'bg-success text-neutral-950' : 'bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950'
            }`}
          >
            {saveStatus === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
            {saveStatus === 'saved' && <Check className="w-4 h-4" />}
            {saveStatus === 'idle' ? 'Synchronize Profile Node' : saveStatus === 'saving' ? 'Syncing...' : 'Parameters Committed'}
          </button>
        </div>
      </div>
    </div>
  );
};
