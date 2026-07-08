import React from 'react';
import { MessageCircle, Phone, Mail, Clock } from 'lucide-react';

export default function NeedHelp() {
  return (
    <div className="bg-surface-primary border border-stroke-subtle rounded-xl p-6 shadow-card space-y-6">
      <h3 className="font-display font-black uppercase text-xs tracking-widest text-foreground-muted">Need Help?</h3>
      <div className="space-y-4">
        <button className="flex items-center gap-4 w-full group">
          <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-foreground-muted group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-colors">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div className="text-left">
             <p className="text-[11px] font-black uppercase tracking-tight text-foreground-primary">Live Chat</p>
             <p className="text-[10px] font-bold text-status-success uppercase">We&apos;re online now</p>
          </div>
        </button>

        <button className="flex items-center gap-4 w-full group">
          <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-foreground-muted group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-colors">
            <Phone className="w-4 h-4" />
          </div>
          <div className="text-left">
             <p className="text-[11px] font-black uppercase tracking-tight text-foreground-primary">Call Us</p>
             <p className="text-[10px] font-bold text-foreground-muted uppercase">+1 (800) 555-0199</p>
          </div>
        </button>

        <button className="flex items-center gap-4 w-full group">
          <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-foreground-muted group-hover:text-brand-primary group-hover:bg-brand-primary/10 transition-colors">
            <Mail className="w-4 h-4" />
          </div>
          <div className="text-left">
             <p className="text-[11px] font-black uppercase tracking-tight text-foreground-primary">Email Us</p>
             <p className="text-[10px] font-bold text-foreground-muted uppercase">support@partspeddle.com</p>
          </div>
        </button>

        <div className="flex items-center gap-4 w-full pt-2">
          <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-foreground-muted">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-left">
             <p className="text-[11px] font-black uppercase tracking-tight text-foreground-primary">Hours</p>
             <p className="text-[10px] font-bold text-foreground-muted uppercase">Mon - Fri: 8AM - 6PM EST</p>
          </div>
        </div>
      </div>
    </div>
  );
}
