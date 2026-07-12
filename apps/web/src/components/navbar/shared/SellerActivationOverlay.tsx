import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Phone, MapPin } from 'lucide-react';

interface ActivationProps {
  onActivate: (sellerData: { whatsapp: string; location: string }) => void;
  onCancel: () => void;
}

export const SellerActivationOverlay: React.FC<ActivationProps> = ({ onActivate, onCancel }) => {
  const [whatsapp, setWhatsapp] = React.useState('');
  const [location, setLocation] = React.useState('');

  return (
    <div className="fixed inset-0 z-[200000] flex items-center justify-center p-4 bg-steel-black/80 backdrop-blur-xs">
        <div className="bg-charcoal border-2 border-rust-copper/80 p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl">
          <div className="space-y-1.5">
            <div className="w-10 h-10 rounded-lg bg-rust-copper/10 border border-rust-copper/30 flex items-center justify-center text-rust-copper">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-display text-lg font-black uppercase tracking-tight text-base-cream pt-1">
              Activate Your Seller Tools
            </h3>
            <p className="text-xs text-warm-gray leading-relaxed">
              Your account can list salvage parts instantly. Provide your baseline coordinates to allow buyers to submit escrow offers.
            </p>
          </div>

          <div className="space-y-3 font-sans">
            <div>
              <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-warm-gray mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3" /> WhatsApp Operations Number
              </label>
              <input 
                type="text" 
                placeholder="+52 (638) 000-0000"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full bg-steel-black border border-oil-dark rounded-lg p-2.5 text-xs text-base-cream focus:outline-none focus:border-rust-copper"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono font-bold tracking-wider text-warm-gray mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Dismantling Yard Location
              </label>
              <input 
                type="text" 
                placeholder="Puerto Peñasco, Sonora"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-steel-black border border-oil-dark rounded-lg p-2.5 text-xs text-base-cream focus:outline-none focus:border-rust-copper"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 font-display text-xs">
            <button 
              onClick={onCancel}
              className="flex-1 bg-transparent hover:bg-oil-dark border border-oil-dark py-2.5 rounded-lg text-warm-gray uppercase font-bold transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={() => onActivate({ whatsapp, location })}
              disabled={!whatsapp || !location}
              className="flex-1 bg-rust-copper hover:bg-rust-copper/90 disabled:opacity-40 disabled:hover:bg-rust-copper text-steel-black py-2.5 rounded-lg uppercase font-black tracking-wider transition-all flex items-center justify-center gap-1"
            >
              <span>Initialize Shop</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
    </div>
  );
};
