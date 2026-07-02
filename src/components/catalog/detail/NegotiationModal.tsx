import React from 'react';
import { Send, X, DollarSign } from 'lucide-react';
import { Part, Offer } from '../../../types';

interface NegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  part: Part;
  activeOffer: Offer | null;
  offerPrice: number;
  setOfferPrice: (p: number) => void;
  offerMessage: string;
  setOfferMessage: (m: string) => void;
  onSubmitOffer: (e: React.FormEvent) => void;
  onAcceptCounter: (price: number) => void;
  negotiationState: 'idle' | 'sending' | 'replied';
  sellerName: string;
}

export const NegotiationModal: React.FC<NegotiationModalProps> = ({
  isOpen,
  onClose,
  part,
  activeOffer,
  offerPrice,
  setOfferPrice,
  offerMessage,
  setOfferMessage,
  onSubmitOffer,
  onAcceptCounter,
  negotiationState,
  sellerName
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-steel-black/80 backdrop-blur-xs">
      <div className="w-full max-w-md bg-charcoal border border-oil-dark rounded-xl p-6 shadow-2xl space-y-4 text-base-cream">
        
        <div className="flex justify-between items-center border-b border-oil-dark pb-3 mr-4">
          <div className="space-y-0.5">
            <h3 className="font-display text-base font-black uppercase tracking-wider text-rust-copper">
              Bidding Engine Portal
            </h3>
            <p className="text-[10px] text-warm-gray uppercase font-bold tracking-widest">
              DIRECT CHANNEL TO: {sellerName}
            </p>
          </div>
          <button onClick={onClose} className="text-warm-gray hover:text-base-cream transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {negotiationState === 'sending' ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-10 h-10 border-2 border-t-rust-copper border-oil-dark rounded-full animate-spin mx-auto"></div>
            <div className="space-y-1">
              <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-rust-copper">
                Transmitting Specs to Yard
              </h4>
              <p className="text-[10px] text-warm-gray font-sans">
                Inspecting current yard floor registers...
              </p>
            </div>
          </div>
        ) : negotiationState === 'replied' && activeOffer ? (
          <div className="space-y-5">
            <div className="p-4 rounded border font-sans text-xs flex flex-col space-y-3 bg-steel-black border-oil-dark">
              <div className="flex justify-between items-center">
                <span className="font-display font-bold uppercase tracking-wider text-rust-copper text-xs">
                  {sellerName} Representative
                </span>
                <span className={`px-2 py-0.5 rounded font-display font-bold text-[9px] uppercase ${activeOffer.status === 'Accepted' ? 'bg-sage-green text-steel-black' : activeOffer.status === 'Counter-Offer' ? 'bg-rust-copper text-steel-black' : 'bg-rose-800 text-white'}`}>
                  {activeOffer.status}
                </span>
              </div>
              <p className="text-base-cream leading-relaxed text-sm p-3.5 bg-charcoal rounded border border-oil-dark font-mono">
                &quot;{activeOffer.replyMessage}&quot;
              </p>
              {activeOffer.status === 'Counter-Offer' && activeOffer.counterPrice && (
                <div className="pt-3 border-t border-oil-dark flex justify-end gap-3">
                  <button 
                    onClick={() => onAcceptCounter(activeOffer.counterPrice!)}
                    className="bg-sage-green hover:bg-sage-green/90 text-steel-black font-display text-xs font-bold uppercase tracking-widest py-2 px-4 rounded-sm"
                  >
                    Accept (${activeOffer.counterPrice})
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmitOffer} className="space-y-4 font-sans">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase font-display font-bold text-warm-gray">Your Offer (USD)</label>
                <span className="font-mono text-lg font-black text-rust-copper">${offerPrice}</span>
              </div>
              <input
                type="range"
                min={Math.round(part.price * 0.5)}
                max={Math.round(part.price * 1.1)}
                value={offerPrice}
                onChange={(e) => setOfferPrice(Number(e.target.value))}
                className="w-full accent-rust-copper cursor-pointer h-1.5 bg-oil-dark"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-display font-bold text-warm-gray mb-1.5">Notes</label>
              <textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                rows={3}
                className="w-full bg-steel-black border border-oil-dark rounded-lg p-3 text-sm text-base-cream focus:outline-none focus:border-rust-copper"
              />
            </div>
            <button type="submit" className="w-full bg-rust-copper hover:bg-bronze text-steel-black font-display font-bold uppercase tracking-widest py-3 rounded-lg transition-all flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              <span>SEND OFFER</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
