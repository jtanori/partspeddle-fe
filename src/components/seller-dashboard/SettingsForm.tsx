import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { User, MapPin, Mail, Phone, Camera, ShieldCheck, Check } from 'lucide-react';

export const SettingsForm: React.FC = () => {
  const { profile, setProfile } = useAppStore();
  const [localProfile, setLocalProfile] = useState(profile);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = () => {
    setSaveStatus('saving');
    setProfile(localProfile);
    setTimeout(() => setSaveStatus('saved'), 800);
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
      <div className="bg-zinc-900 p-8 text-white">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 bg-zinc-800 rounded-2xl flex items-center justify-center border-2 border-dashed border-zinc-700 overflow-hidden transition-all group-hover:border-[#B87333]">
              {localProfile.logoUrl ? (
                <img src={localProfile.logoUrl} className="w-full h-full object-cover" alt="Logo" />
              ) : (
                <Camera className="w-8 h-8 text-zinc-600 group-hover:text-[#B87333]" />
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 bg-[#B87333] p-2 rounded-lg shadow-lg hover:scale-110 transition-transform">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-display font-black uppercase tracking-tight">{localProfile.name || 'Yard Profile'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheck className="w-4 h-4 text-[#7A8B6F]" />
              <span className="text-xs text-[#7A8B6F] font-bold uppercase tracking-widest">{localProfile.verificationStatus} Registry</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-xs font-display font-bold uppercase tracking-[0.2em] text-[#B87333] pb-2 border-b border-zinc-100">Yard Information</h3>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                <User className="w-3 h-3" /> Business Name
              </label>
              <input 
                type="text" 
                value={localProfile.name}
                onChange={(e) => setLocalProfile({...localProfile, name: e.target.value})}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#B87333] transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3 h-3" /> Yard Location
              </label>
              <input 
                type="text" 
                value={localProfile.location}
                onChange={(e) => setLocalProfile({...localProfile, location: e.target.value})}
                placeholder="City, State"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#B87333] transition-all"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs font-display font-bold uppercase tracking-[0.2em] text-[#B87333] pb-2 border-b border-zinc-100">Contact Dispatch</h3>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                <Mail className="w-3 h-3" /> Business Email
              </label>
              <input 
                type="email" 
                value={localProfile.email}
                onChange={(e) => setLocalProfile({...localProfile, email: e.target.value})}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#B87333] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1.5">
                <Phone className="w-3 h-3" /> WhatsApp / Phone
              </label>
              <input 
                type="text" 
                value={localProfile.whatsapp}
                onChange={(e) => setLocalProfile({...localProfile, whatsapp: e.target.value})}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#B87333] transition-all"
              />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 pt-6 flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saveStatus !== 'idle'}
            className={`min-w-[160px] flex items-center justify-center gap-2 py-3 px-8 rounded-xl font-display font-bold uppercase text-sm transition-all shadow-lg ${
              saveStatus === 'saved' ? 'bg-[#7A8B6F] text-white shadow-[#7A8B6F]/20' : 'bg-[#B87333] hover:bg-[#A35D1F] text-white shadow-[#B87333]/20'
            }`}
          >
            {saveStatus === 'saving' && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
            {saveStatus === 'saved' && <Check className="w-4 h-4" />}
            {saveStatus === 'idle' ? 'Save Profile' : saveStatus === 'saving' ? 'Saving...' : 'Changes Saved'}
          </button>
        </div>
      </div>
    </div>
  );
};
