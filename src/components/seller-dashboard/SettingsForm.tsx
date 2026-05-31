import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
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
    <div className="border border-zinc-800 bg-zinc-900/30 rounded-xl p-4 flex items-center gap-4 max-w-xl">
      <div className="relative w-16 h-16 rounded-xl border border-zinc-800 bg-zinc-950 flex items-center justify-center overflow-hidden shrink-0 group">
        {logoUrl ? (
          <img src={logoUrl} alt="Yard Master Identity" className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="w-6 h-6 text-zinc-600" />
        )}
        
        {isUploading && (
          <div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center backdrop-blur-xs">
            <Loader2 className="w-4 h-4 text-rust-copper animate-spin" />
          </div>
        )}
      </div>

      <div className="flex-1 space-y-1">
        <label className="text-[11px] font-mono uppercase tracking-wider text-rust-copper font-bold block">
          Corporate Identity Asset
        </label>
        <p className="text-xs text-zinc-400">
          Upload your official commercial yard logo mark. JPG, PNG formats up to 5MB.
        </p>
        
        {uploadError && (
          <p className="text-[10px] text-red-400 font-mono mt-1">⚠️ {uploadError}</p>
        )}

        <div className="pt-1">
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-800 rounded bg-zinc-900 hover:bg-zinc-850 text-xs font-medium text-zinc-200 hover:text-white transition-all disabled:opacity-40"
          >
            <Upload className="w-3.5 h-3.5" />
            {logoUrl ? 'Replace Branding Logo' : 'Select Image File'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const SettingsForm: React.FC = () => {
  const { profile, setProfile } = useAppStore();
  const [localProfile, setLocalProfile] = useState(profile);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (profile) setLocalProfile(profile);
  }, [profile]);

  if (!localProfile) {
    return (
      <div className="bg-charcoal rounded-2xl shadow-sm border border-oil-dark p-20 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-rust-copper border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-warm-gray uppercase tracking-widest">Hydrating Profile Terminal...</span>
      </div>
    );
  }

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      // 1. Update users table (email, name)
      const { error: userError } = await supabase
        .from('users')
        .update({ email: localProfile.email, full_name: localProfile.name })
        .eq('id', user.id);
      if (userError) throw userError;

      // 2. Update seller_profiles table
      const { error: sellerError } = await supabase
        .from('seller_profiles')
        .update({ 
          business_name: localProfile.name,
          location: localProfile.location,
          whatsapp: localProfile.whatsapp
        })
        .eq('user_id', user.id);
      if (sellerError) throw sellerError;

      setProfile(localProfile);
      setSaveStatus('saved');
    } catch (err) {
      console.error('Failed to save profile:', err);
      setSaveStatus('idle');
    }
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  return (
    <div className="bg-steel-black rounded-2xl shadow-sm border border-oil-dark overflow-hidden text-base-cream">
      <div className="bg-charcoal p-8 border-b border-oil-dark">
        <div className="flex items-center gap-6">
          <LogoUploadZone initialLogoUrl={localProfile.logoUrl} />
          <div>
            <h2 className="text-2xl font-display font-black uppercase tracking-tight text-base-cream">{localProfile.name || 'Yard Profile'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheck className="w-4 h-4 text-sage-green" />
              <span className="text-xs text-sage-green font-bold uppercase tracking-widest">{localProfile.verificationStatus} Registry</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-xs font-display font-bold uppercase tracking-[0.2em] text-rust-copper pb-2 border-b border-oil-dark">Yard Information</h3>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-warm-gray tracking-wider flex items-center gap-1.5">
                <User className="w-3 h-3" /> Business Name
              </label>
              <input 
                type="text" 
                value={localProfile.name || ''}
                onChange={(e) => setLocalProfile({...localProfile, name: e.target.value})}
                className="w-full bg-steel-black border border-oil-dark rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rust-copper transition-all text-base-cream"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-warm-gray tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Yard Location
              </label>
              <input 
                type="text" 
                value={localProfile.location || ''}
                onChange={(e) => setLocalProfile({...localProfile, location: e.target.value})}
                placeholder="City, State"
                className="w-full bg-steel-black border border-oil-dark rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rust-copper transition-all text-base-cream"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-display font-bold uppercase tracking-[0.2em] text-rust-copper pb-2 border-b border-oil-dark">Contact Dispatch</h3>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-warm-gray tracking-wider flex items-center gap-1.5">
                <Mail className="w-3 h-3" /> Business Email
              </label>
              <input 
                type="email" 
                value={localProfile.email || ''}
                onChange={(e) => setLocalProfile({...localProfile, email: e.target.value})}
                className="w-full bg-steel-black border border-oil-dark rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rust-copper transition-all text-base-cream"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-warm-gray tracking-wider flex items-center gap-1.5">
                <Phone className="w-3 h-3" /> WhatsApp / Phone
              </label>
              <input 
                type="text" 
                value={localProfile.whatsapp || ''}
                onChange={(e) => setLocalProfile({...localProfile, whatsapp: e.target.value})}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-steel-black border border-oil-dark rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-rust-copper transition-all text-base-cream"
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 pt-6 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saveStatus !== 'idle'}
            className={`min-w-[160px] flex items-center justify-center gap-2 py-3 px-8 rounded-xl font-display font-bold uppercase text-sm transition-all shadow-lg ${
              saveStatus === 'saved' ? 'bg-sage-green text-steel-black shadow-sage-green/20' : 'bg-rust-copper hover:bg-bronze text-steel-black shadow-rust-copper/20'
            }`}
          >
            {saveStatus === 'saving' && <span className="w-4 h-4 border-2 border-steel-black border-t-transparent rounded-full animate-spin"></span>}
            {saveStatus === 'saved' && <Check className="w-4 h-4" />}
            {saveStatus === 'idle' ? 'Save Profile' : saveStatus === 'saving' ? 'Saving...' : 'Changes Saved'}
          </button>
        </div>
      </div>
    </div>
  );
};
