import React from 'react';
import { MessageCircle, Phone, Mail, Clock } from 'lucide-react';

export default function NeedHelp() {
  return (
    <div className="bg-white border border-zinc-200 rounded-pp-card p-6 shadow-sm space-y-6">
      <h3 className="font-display font-black uppercase text-xs tracking-widest text-zinc-500">Need Help?</h3>
      <div className="space-y-4">
        <button className="flex items-center gap-4 w-full group">
          <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-pp-primary group-hover:bg-pp-primary/10 transition-colors">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div className="text-left">
             <p className="text-[11px] font-black uppercase tracking-tight text-zinc-800">Live Chat</p>
             <p className="text-[10px] font-bold text-emerald-600 uppercase">We&apos;re online now</p>
          </div>
        </button>

        <button className="flex items-center gap-4 w-full group">
          <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-pp-primary group-hover:bg-pp-primary/10 transition-colors">
            <Phone className="w-4 h-4" />
          </div>
          <div className="text-left">
             <p className="text-[11px] font-black uppercase tracking-tight text-zinc-800">Call Us</p>
             <p className="text-[10px] font-bold text-zinc-400 uppercase">+1 (800) 555-0199</p>
          </div>
        </button>

        <button className="flex items-center gap-4 w-full group">
          <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-pp-primary group-hover:bg-pp-primary/10 transition-colors">
            <Mail className="w-4 h-4" />
          </div>
          <div className="text-left">
             <p className="text-[11px] font-black uppercase tracking-tight text-zinc-800">Email Us</p>
             <p className="text-[10px] font-bold text-zinc-400 uppercase">support@partspeddle.com</p>
          </div>
        </button>

        <div className="flex items-center gap-4 w-full pt-2">
          <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-left">
             <p className="text-[11px] font-black uppercase tracking-tight text-zinc-800">Hours</p>
             <p className="text-[10px] font-bold text-zinc-400 uppercase">Mon - Fri: 8AM - 6PM EST</p>
          </div>
        </div>
      </div>
    </div>
  );
}
