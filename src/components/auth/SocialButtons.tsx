import React from 'react';

export const SocialButtons: React.FC<{ onSocialClick: (p: string) => void }> = ({ onSocialClick }) => {
  return (
    <div className="grid grid-cols-2 gap-3.5" id="social-buttons-box">
      <button
        type="button"
        onClick={() => onSocialClick('Google')}
        className="col-span-1 border border-zinc-250 bg-white rounded-sm flex justify-center items-center gap-2 px-3 text-xs font-display font-bold uppercase transition-all duration-300 hover:bg-zinc-50 cursor-pointer min-h-[44px] filter saturate-[0.75] contrast-[0.95] hover:saturate-[1.1] hover:contrast-100 text-zinc-600 hover:border-[#B87333]/40"
      >
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
        </svg>
        Google
      </button>

      <button
        type="button"
        onClick={() => onSocialClick('Facebook')}
        className="col-span-1 border border-zinc-250 bg-white rounded-sm flex justify-center items-center gap-2 px-3 text-xs font-display font-bold uppercase transition-all duration-300 hover:bg-zinc-50 cursor-pointer min-h-[44px] filter saturate-[0.75] contrast-[0.95] hover:saturate-[1.1] hover:contrast-100 text-zinc-600 hover:border-[#B87333]/40"
      >
        <svg className="w-4 h-4 text-[#1877F2] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Facebook
      </button>

      <button
        type="button"
        onClick={() => onSocialClick('Apple')}
        className="col-span-2 border border-zinc-250 bg-white rounded-sm flex justify-center items-center gap-2 px-3 text-xs font-display font-bold uppercase transition-all duration-300 hover:bg-zinc-50 cursor-pointer min-h-[44px] filter saturate-[0.75] contrast-[0.95] hover:saturate-[1.1] hover:contrast-100 text-zinc-650 hover:border-[#B87333]/40"
      >
        <svg className="w-4 h-4 text-black flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C4 16.5 3.5 10.5 6.1 7.37c1.32-1.34 2.83-1.4 3.65-.95 1.05.54 1.86.53 2.97 0 .82-.42 2.45-.63 3.68.64 1.25.96 1.9 2.22 1.55 3.97-.68 2.9-2.9 9.3-5.9 9.25zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.26 2.5-2.15 4.45-3.74 4.25z"/>
        </svg>
        Apple (iOS SSO)
      </button>
    </div>
  );
};
