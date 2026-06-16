import React from 'react';
import { MessageCircle, Phone, Mail, Clock } from 'lucide-react';

export default function NeedHelp() {
  return (
    <div className="bg-white border border-zinc-250 rounded p-6 shadow-sm space-y-4">
      <h3 className="font-display font-bold uppercase text-sm">Need Help?</h3>
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-3"><MessageCircle className="w-4 h-4" /> <span>Live Chat</span></div>
        <div className="flex items-center gap-3"><Phone className="w-4 h-4" /> <span>Call Us</span></div>
        <div className="flex items-center gap-3"><Mail className="w-4 h-4" /> <span>Email Us</span></div>
        <div className="flex items-center gap-3"><Clock className="w-4 h-4" /> <span>Hours</span></div>
      </div>
    </div>
  );
}
