import React from 'react';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-24 bg-zinc-900 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#B87333]/10 -skew-x-12 translate-x-1/2"></div>
      <div className="pp-container text-center space-y-8 relative z-10">
        <h2 className="text-4xl md:text-5xl font-display font-black text-white uppercase leading-tight">
          Ready to get your <span className="text-[#B87333]">Project Back on the Road?</span>
        </h2>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Join thousands of mechanics and restorers sourcing authentic OEM parts directly from the source.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="w-full sm:w-auto bg-[#B87333] hover:bg-[#A35D1F] text-white px-10 py-4 rounded-sm font-display font-bold uppercase tracking-wide transition-all shadow-lg shadow-[#B87333]/20">
            Start Searching
          </button>
          <button className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-4 rounded-sm font-display font-bold uppercase tracking-wide transition-all">
            Yard Registry Signup
          </button>
        </div>
      </div>
    </section>
  );
};
