import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Briefcase, 
  Mail, 
  Eye, 
  EyeOff, 
  Lock, 
  XCircle,
  X,
  ChevronLeft
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserSession } from '../types';
import { BrandStoryColumn } from './auth/BrandStoryColumn';
import { SocialButtons } from './auth/SocialButtons';
import { AuthFooter } from './auth/AuthFooter';
// @ts-ignore
import logoImg from '../assets/images/logo_rusty.png';
// @ts-ignore
import hero1 from '../assets/images/hero_1.png';

interface AuthPageProps {
  onSuccess: (session: UserSession) => void;
  onCancel?: () => void;
}

export default function AuthPage({ onSuccess, onCancel = () => {} }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('signup') === 'true' || params.get('mode') === 'signup';
  });

  const [role, setRole] = useState<'buyer' | 'seller'>(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('role') as 'buyer' | 'seller') || 'buyer';
  });

  // Fields state
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [confirmSalvage, setConfirmSalvage] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [bottomNotice, setBottomNotice] = useState<string | null>(null);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setLoading(true);
      if (isSignUp) {
        if (password !== confirmPassword) throw new Error('Passwords do not match');
        if (!agreeTerms) throw new Error('You must agree to the Terms & Privacy Policy');
        if (role === 'seller' && !confirmSalvage) throw new Error('You must confirm salvage yard license');
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
              business_name: role === 'seller' ? businessName : undefined
            }
          }
        });
        if (error) throw error;
        
        // Show closable toast
        setBottomNotice('Account created! Please check your email for verification.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
          onSuccess({
            email: data.session.user.email || null,
            jwt: data.session.access_token,
            aud: data.session.user.aud,
            role: data.session.user.user_metadata.role || 'buyer'
          });
          // Redirect to home page
          window.location.href = '/';
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex bg-[#F5F0EB] md:h-screen md:flex-row md:overflow-hidden flex-col" id="id-auth-page-root">
      <style>{`
        @keyframes authShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-auth-shake { animation: authShake 300ms ease-in-out; }
      `}</style>

      <BrandStoryColumn isSignUp={isSignUp} role={role} onCancel={onCancel} />

      <div className="w-full md:w-[65%] lg:w-[60%] xl:w-1/2 flex flex-col justify-between items-center bg-white md:bg-[#F5F0EB] min-h-screen md:h-full md:overflow-y-auto">
        
        {/* Mobile Header */}
        <div className="md:hidden w-full h-[56px] min-h-[56px] bg-[#1A1A1A] flex items-center justify-center border-b border-zinc-800/80 flex-shrink-0">
          <div onClick={onCancel} className="cursor-pointer">
            <img src={logoImg} alt="Logo" className="h-6.5" />
          </div>
        </div>

        <div className="flex-grow w-full flex flex-col justify-center items-center py-10 px-4">
          <div className={`w-full max-w-[485px] bg-white border border-zinc-200 shadow-xl px-6 py-8 md:p-10 rounded-xl relative ${isShaking ? 'animate-auth-shake' : ''}`}>
            <button 
              onClick={() => window.location.href = '/'}
              className="absolute top-4 left-4 flex items-center gap-1 font-display text-xs font-black text-rust-copper hover:text-bronze transition-colors uppercase tracking-wider"
            >
              <ChevronLeft className="w-4 h-4" />
              RETURN TO HOME
            </button>

            <div className="text-center md:text-left mb-8">
              <h2 className="font-display text-3xl font-black uppercase text-[#1E1E1E] tracking-tight leading-none">
                {isSignUp ? (role === 'seller' ? 'Join as a Seller' : 'Create Account') : 'Welcome Back'}
              </h2>
              <p className="text-xs text-zinc-500 font-sans mt-3 leading-relaxed">
                {isSignUp ? 'Join the network of vetted salvage professionals.' : 'Access your secure PartsPeddle credentials.'}
              </p>
            </div>

            {isSignUp && (
              <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-zinc-100 rounded-lg border border-zinc-200/60">
                <button type="button" onClick={() => setRole('buyer')} className={`py-2.5 text-xs font-display font-bold uppercase rounded-md tracking-wider transition-all ${role === 'buyer' ? 'bg-white text-[#B87333] shadow-sm' : 'text-zinc-500'}`}>Buyer</button>
                <button type="button" onClick={() => setRole('seller')} className={`py-2.5 text-xs font-display font-bold uppercase rounded-md tracking-wider transition-all ${role === 'seller' ? 'bg-white text-[#B87333] shadow-sm' : 'text-zinc-500'}`}>Seller</button>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 mb-6 border-l-4 border-[#B87333] bg-amber-50 rounded text-sm text-zinc-800 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#B87333] shrink-0" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-4 mb-6 border-l-4 border-emerald-600 bg-emerald-50 rounded text-sm text-zinc-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-medium">{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div className="relative">
                  <label className="text-[10px] tracking-widest uppercase font-display font-bold text-zinc-500 block mb-1.5 ml-1">Contact Full Name</label>
                  <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-lg px-4 text-base focus:ring-2 focus:ring-[#B87333] outline-none transition-all" />
                  <User className="absolute right-4 top-9 w-4 h-4 text-zinc-400" />
                </div>
              )}

              {isSignUp && role === 'seller' && (
                <div className="relative">
                  <label className="text-[10px] tracking-widest uppercase font-display font-bold text-zinc-500 block mb-1.5 ml-1">Business Name (Optional)</label>
                  <input type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-lg px-4 text-base focus:ring-2 focus:ring-[#B87333] outline-none transition-all" />
                  <Briefcase className="absolute right-4 top-9 w-4 h-4 text-zinc-400" />
                </div>
              )}

              <div className="relative">
                <label className="text-[10px] tracking-widest uppercase font-display font-bold text-zinc-500 block mb-1.5 ml-1">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-lg px-4 text-base focus:ring-2 focus:ring-[#B87333] outline-none transition-all" />
                <Mail className="absolute right-4 top-9 w-4 h-4 text-zinc-400" />
              </div>

              <div className="relative">
                <label className="text-[10px] tracking-widest uppercase font-display font-bold text-zinc-500 block mb-1.5 ml-1">Password</label>
                <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-lg px-4 pr-12 text-base focus:ring-2 focus:ring-[#B87333] outline-none transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-9 text-zinc-400 hover:text-zinc-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {isSignUp && (
                <div className="relative">
                  <label className="text-[10px] tracking-widest uppercase font-display font-bold text-zinc-500 block mb-1.5 ml-1">Confirm Password</label>
                  <input type={showPassword ? 'text' : 'password'} required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-lg px-4 text-base focus:ring-2 focus:ring-[#B87333] outline-none transition-all" />
                  <Lock className="absolute right-4 top-9 w-4 h-4 text-zinc-400" />
                </div>
              )}

              {isSignUp && (
                <label className="flex items-start gap-3 cursor-pointer pt-1">
                  <input type="checkbox" required checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} className="mt-1 rounded text-[#B87333] focus:ring-[#B87333]" />
                  <span className="text-xs text-zinc-500 leading-snug">I agree to the <span className="text-[#B87333] underline">Terms of Use</span> and <span className="text-[#B87333] underline">Privacy Policy</span></span>
                </label>
              )}

              {isSignUp && role === 'seller' && (
                <label className="flex items-start gap-3 cursor-pointer pt-1">
                  <input type="checkbox" required checked={confirmSalvage} onChange={e => setConfirmSalvage(e.target.checked)} className="mt-1 rounded text-[#B87333] focus:ring-[#B87333]" />
                  <span className="text-xs text-zinc-500 leading-snug font-medium">I confirm I represent a <span className="font-bold text-zinc-800">licensed salvage yard</span> or authorized dismantler.</span>
                </label>
              )}

              <button disabled={loading} className="w-full h-14 bg-[#B87333] hover:bg-[#925624] disabled:opacity-70 transition-all text-white font-display font-black text-sm tracking-widest uppercase rounded-lg shadow-lg active:translate-y-0.5 flex items-center justify-center gap-2 mt-6">
                {loading ? 'Processing Secure Connection...' : (isSignUp ? 'Create Account' : 'Sign In Securely')}
              </button>
            </form>

            <div className="relative flex items-center justify-center py-8 border-t border-zinc-100 mt-8">
              <span className="bg-white px-4 text-[10px] uppercase font-display font-bold text-zinc-400 tracking-widest absolute">Or continue with</span>
            </div>

            <SocialButtons onSocialClick={(p) => setErrorMsg(`Simulating OAuth via ${p}...`)} />

            <div className="mt-8 text-center text-xs text-zinc-500 font-sans border-t border-zinc-100 pt-6">
              {isSignUp ? 'Already have an account?' : 'New to PartsPeddle?'}
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-[#B87333] hover:underline font-bold uppercase tracking-wide text-[10px] ml-2">
                {isSignUp ? 'Sign In →' : 'Join Now →'}
              </button>
            </div>
          </div>
        </div>

        <AuthFooter onCancel={onCancel} onNotice={setBottomNotice} />
        
        {bottomNotice && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-amber-50 px-4 py-3 rounded-lg border border-[#B87333]/20 shadow-xl flex items-center gap-3 animate-fade-in z-50 max-w-sm">
            <span className="text-[10px] text-zinc-600 font-medium leading-relaxed">{bottomNotice}</span>
            <button onClick={() => {
              setBottomNotice(null);
              setIsSignUp(false); // Switch to login mode
            }} className="p-1 hover:bg-amber-100 rounded"><X className="w-4 h-4 text-zinc-400" /></button>
          </div>
        )}
      </div>
    </div>
  );
}
