import React, { useState, useEffect } from 'react';
import { 
  Mail, Eye, EyeOff, ShieldCheck, Hammer, Percent, Calendar, ArrowRight,
  CheckCircle, AlertTriangle, User, Briefcase, Lock, CheckCircle2, XCircle
} from 'lucide-react';
import { supabaseMock } from '../services/db';
import { UserSession } from '../types';
// @ts-ignore
import logoImg from '../assets/images/logo_rusty.png';
// @ts-ignore
import hero1 from '../assets/images/hero_1.png';

interface AuthPageProps {
  onSuccess: (session: UserSession) => void;
  onCancel?: () => void;
}

export default function AuthPage({ onSuccess, onCancel }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(() => {
    // Determine sign-up mode based on URL path or parameters
    const params = new URLSearchParams(window.location.search);
    const hasSignupQuery = params.get('signup') === 'true' || params.get('mode') === 'signup';
    const isSignupPath = window.location.pathname.includes('signup') || window.location.hash.includes('signup');
    return hasSignupQuery || isSignupPath;
  });

  const [role, setRole] = useState<'buyer' | 'seller'>(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRole = params.get('role');
    if (urlRole === 'seller') return 'seller';
    if (urlRole === 'buyer') return 'buyer';
    if (window.location.hash.includes('role=seller')) return 'seller';
    return 'buyer';
  });

  // Fields state
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState(() => {
    // Pre-fill business name from query param if available
    const params = new URLSearchParams(window.location.search);
    return params.get('business_name') || params.get('business') || '';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Toggles and interactions
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [confirmSalvage, setConfirmSalvage] = useState(false);
  const [bottomNotice, setBottomNotice] = useState<string | null>(null);
  
  // Touched trackers for inline validation
  const [fullNameTouched, setFullNameTouched] = useState(false);
  const [businessNameTouched, setBusinessNameTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  // Email availability simulator states
  const [emailStatus, setEmailStatus] = useState<'empty' | 'invalid' | 'taken' | 'available'>('empty');
  const [emailChecking, setEmailChecking] = useState(false);

  // Layout / CSS trigger states
  const [isPortraitTablet, setIsPortraitTablet] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Tablet Portrait listener (768px - 900px / orientation portrait)
  useEffect(() => {
    const checkViewport = () => {
      const portrait = window.matchMedia('(orientation: portrait)').matches;
      const width = window.innerWidth;
      // Triggers if portrait mode and standard tablet width bounds
      setIsPortraitTablet(portrait && width >= 768 && width <= 900);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Sync role selector when query parameter changes
  useEffect(() => {
    const checkURLParams = () => {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      if (urlRole === 'seller' || urlRole === 'buyer') {
        setRole(urlRole);
      }
      const isSignupPath = window.location.pathname.includes('signup') || window.location.hash.includes('signup') || params.get('signup') === 'true';
      if (isSignupPath) {
        setIsSignUp(true);
      }
    };
    checkURLParams();
    window.addEventListener('hashchange', checkURLParams);
    return () => window.removeEventListener('hashchange', checkURLParams);
  }, []);

  // Real-time Email check simulator
  useEffect(() => {
    if (!email) {
      setEmailStatus('empty');
      return;
    }
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmailValid) {
      setEmailStatus('invalid');
      return;
    }

    setEmailChecking(true);
    const handler = setTimeout(() => {
      setEmailChecking(false);
      // Hardcoded list of mocked registered emails
      const registeredEmails = [
        'mechanic@garage.com',
        'seller@scrapyard.com',
        'admin@partspeddle.com',
        'seller@salvage.com',
        'salvage@yard.com'
      ];
      if (registeredEmails.includes(email.toLowerCase())) {
        setEmailStatus('taken');
      } else {
        setEmailStatus('available');
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [email]);

  // Shake animation helper
  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);
  };

  // Score Password Strength
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '', score: 0, color: 'bg-zinc-200', textClass: 'text-zinc-400' };
    
    // Check constraints
    const hasLength = pwd.length >= 8;
    const hasNum = /\d/.test(pwd);
    const hasSpecialOrUpper = /[A-Z]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd);

    // Compute basic rating
    if (pwd.length < 8) {
      return { label: 'Weak (min 8 chars)', score: 1, color: 'bg-red-500', textClass: 'text-red-500' };
    }
    
    if (hasLength && hasNum && hasSpecialOrUpper) {
      return { label: 'Strong password', score: 3, color: 'bg-emerald-600', textClass: 'text-emerald-600' };
    }
    
    if (hasLength && hasNum) {
      return { label: 'Fair password', score: 2, color: 'bg-amber-500', textClass: 'text-amber-500' };
    }

    return { label: 'Weak (add 1 number)', score: 1, color: 'bg-red-500', textClass: 'text-red-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  // Individual Form Field Inline Errors
  const fullNameLength = fullName.trim().length;
  const fullNameError = fullNameTouched && (fullNameLength < 2 || fullNameLength > 60);
  
  const businessNameError = businessNameTouched && role === 'seller' && (!businessName || businessName.trim() === '');
  
  const hasPasswordNumber = /\d/.test(password);
  const passwordError = passwordTouched && (password.length < 8 || !hasPasswordNumber);
  
  const confirmPasswordError = confirmPasswordTouched && confirmPassword !== password;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Pre-validate inputs
    if (isSignUp) {
      if (fullNameLength < 2 || fullNameLength > 60) {
        setFullNameTouched(true);
        setErrorMsg('Please enter a valid full name between 2 and 60 characters.');
        triggerShake();
        return;
      }

      if (role === 'seller' && (!businessName || businessName.trim() === '')) {
        setBusinessNameTouched(true);
        setErrorMsg('Please specify your licensed salvage yard business name.');
        triggerShake();
        return;
      }

      if (emailStatus === 'invalid') {
        setErrorMsg('Please enter a valid email address.');
        triggerShake();
        return;
      }

      if (emailStatus === 'taken') {
        setErrorMsg('This email address is already registered.');
        triggerShake();
        return;
      }

      if (password.length < 8 || !/\d/.test(password)) {
        setPasswordTouched(true);
        setErrorMsg('Password must be at least 8 characters and include at least 1 number.');
        triggerShake();
        return;
      }

      if (confirmPassword !== password) {
        setConfirmPasswordTouched(true);
        setErrorMsg('Your passwords do not match.');
        triggerShake();
        return;
      }

      if (!agreeTerms) {
        setErrorMsg('You must agree to the Terms of Use and Privacy Policy.');
        triggerShake();
        return;
      }

      if (role === 'seller' && !confirmSalvage) {
        setErrorMsg('You must confirm that you represent a licensed salvage yard.');
        triggerShake();
        return;
      }
    }

    setLoading(true);

    setTimeout(() => {
      if (isSignUp) {
        // Mock register action
        const mockSession: UserSession = {
          email: email,
          jwt: `mock-jwt-registered-${role}`,
          aud: 'authenticated',
          role: role
        };

        // Cache role preference
        localStorage.setItem('parts_peddle_user_role', role);

        // Pre-save profile elements if seller
        if (role === 'seller') {
          const profilePayload = {
            name: businessName,
            email: email,
            location: 'Registry Intake Yard',
            whatsapp: '+1 (555) 0192',
            logoUrl: '',
            verificationStatus: 'unverified'
          };
          localStorage.setItem('parts_peddle_seller_profile', JSON.stringify(profilePayload));
          localStorage.setItem('active_welcome_toast_message', `Welcome, ${businessName}! Complete your profile to list inventory.`);
        } else {
          localStorage.setItem('active_welcome_toast_message', `Welcome to PartsPeddle, ${fullName}! Account created successfully.`);
        }

        // Add account credentials dynamically to db mockup matching standard signup
        supabaseMock.signUp(email, password);

        setSuccessMsg('Account created successfully!');
        setTimeout(() => {
          onSuccess(mockSession);
        }, 1000);

      } else {
        // Sign-in mode
        const { error, session } = supabaseMock.signIn(email, password);
        if (error) {
          setErrorMsg('Invalid email or password.');
          setLoading(false);
          triggerShake();
        } else if (session) {
          // If signed in successfully, we can extract details from database of mock
          const savedRole = email.toLowerCase().includes('seller') ? 'seller' : 'buyer';
          localStorage.setItem('parts_peddle_user_role', savedRole);
          localStorage.setItem('active_welcome_toast_message', `Welcome back ${email}!`);
          
          const userSession: UserSession = {
            ...session,
            role: savedRole
          };
          setSuccessMsg('Signed in successfully!');
          setTimeout(() => {
            onSuccess(userSession);
          }, 1000);
        }
      }
    }, 800);
  };

  const handleSocialClick = (platform: string) => {
    setErrorMsg('');
    setSuccessMsg(`Simulating OAuth via ${platform}... Redirecting securely.`);
    setLoading(true);
    setTimeout(() => {
      const simulatedRole = role;
      const mockSession: UserSession = {
        email: `salvage_builder_${platform.toLowerCase()}@gmail.com`,
        jwt: `oauth-jwt-${platform}`,
        aud: 'authenticated',
        role: simulatedRole
      };
      
      localStorage.setItem('parts_peddle_user', JSON.stringify(mockSession));
      localStorage.setItem('parts_peddle_user_role', simulatedRole);
      localStorage.setItem('active_welcome_toast_message', `Connected cleanly via ${platform}! Welcome aboard.`);

      if (simulatedRole === 'seller') {
        const profilePayload = {
          name: 'Social Registered Salvage Yard',
          email: mockSession.email || '',
          location: 'Registry Service Center',
          whatsapp: '',
          logoUrl: '',
          verificationStatus: 'unverified'
        };
        localStorage.setItem('parts_peddle_seller_profile', JSON.stringify(profilePayload));
      }

      onSuccess(mockSession);
    }, 1200);
  };

  return (
    <div 
      className={`w-full flex bg-[#F5F0EB] ${isPortraitTablet ? 'flex-col min-h-screen overflow-y-auto' : 'md:h-screen md:flex-row md:overflow-hidden flex-col'}`} 
      id="id-auth-page-root"
    >
      <style>{`
        @keyframes authShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-auth-shake {
          animation: authShake 300ms ease-in-out;
        }
      `}</style>

      {/* Tablet Portrait Specific Banner Mode (768px-900px) */}
      {isPortraitTablet && (
        <div className="w-full h-[120px] min-h-[120px] bg-[#1E1E1E] relative flex items-center justify-between px-8 border-b border-zinc-800 shadow-md flex-shrink-0" id="tablet-portrait-auth-banner">
          <div className="absolute inset-0 bg-cover bg-center opacity-30 select-none pointer-events-none" style={{ backgroundImage: `url(${hero1})` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent select-none pointer-events-none" />
          <div onClick={onCancel} className="relative z-10 cursor-pointer">
            <img src={logoImg} alt="PartsPeddle Logo" className="h-8 w-auto object-contain bg-transparent" referrerPolicy="no-referrer" />
          </div>
          <div className="relative z-10 text-right">
            <p className="font-display text-[9px] text-[#B87333] tracking-widest font-bold uppercase">PP // SECURE GATEWAY</p>
            <h1 className="font-display text-base font-black text-white leading-tight uppercase tracking-wider mt-1">REAL PARTS / REAL PEOPLE</h1>
          </div>
        </div>
      )}

      {/* Immersive Left Brand-Story Column - 35% on standard landscape tablets, 40% on standard desktop */}
      {!isPortraitTablet && (
        <div 
          className="hidden md:flex md:w-[35%] lg:w-[40%] xl:w-1/2 bg-[#1E1E1E] relative flex-col justify-between p-8 lg:p-12 overflow-hidden text-white h-auto md:h-full flex-shrink-0" 
          id="id-brand-story-column"
        >
          {/* Vintage Workshop Background Image */}
          <div className="absolute inset-0 bg-cover bg-center animate-fade-in duration-700" style={{ backgroundImage: `url(${hero1})` }} />

          {/* Gradient Backdrop Layer - 80% opacity bottom to transition */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E]/85 via-[#1E1E1E]/60 to-transparent pointer-events-none" />

          {/* Brand Logo System - Genuine PartsPeddle Sign Logo */}
          <div 
            onClick={onCancel} 
            className="relative flex items-center select-none z-10 flex-shrink-0 cursor-pointer transition-transform duration-300 hover:scale-[1.03] bg-transparent"
          >
            <img 
              src={logoImg} 
              alt="PartsPeddle Logo" 
              className="w-[185px] lg:w-[210px] h-auto object-contain bg-transparent" 
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Stripped Tagline Panel for Narrow Column Width */}
          <div className="relative mt-auto mb-6 lg:mb-8 z-10 max-w-xl py-4 flex-shrink-0">
            <p className="font-mono text-[9px] tracking-[0.3em] font-black text-[#B87333] uppercase">INTEGRITY FIRST</p>
            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-white leading-tight uppercase tracking-tight mt-2 pb-1">
              REAL PARTS <br className="hidden md:block lg:hidden" />
              / REAL PEOPLE <br className="hidden md:block lg:hidden" />
              / REAL RELIABILITY.
            </h1>
            
            {/* Paragraph body is stripped down/removed on narrow columns (hidden on tablet landscape, lg layout visible) */}
            <p className="mt-4 text-xs lg:text-sm text-zinc-300 font-sans leading-relaxed max-w-md hidden lg:block">
              {isSignUp && role === 'seller' ? 
                'List your used inventory for free. Reach thousands of buyers. Zero listing fees, zero commission for 90 days.' :
                'PartsPeddle connects builders, restorers, and mechanics with hard-to-find OEM parts from real salvage yards and trusted backyard sellers.'
              }
            </p>
          </div>

          {/* One streamlined trust badge row */}
          <div className="relative border-t border-zinc-700/60 pt-4 z-10 w-full flex-shrink-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-5 h-5 text-[#B87333] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-display font-semibold text-white leading-none">Real OEM</span>
                  <span className="text-[8px] text-zinc-400 font-sans leading-none mt-1">No Aftermarket</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Hammer className="w-5 h-5 text-[#B87333] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-display font-semibold text-white leading-none">Yard Trusted</span>
                  <span className="text-[8px] text-zinc-400 font-sans leading-none mt-1">Dismantler Registry</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Percent className="w-5 h-5 text-[#B87333] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-display font-semibold text-white leading-none">Direct Prices</span>
                  <span className="text-[8px] text-zinc-400 font-sans leading-none mt-1">Saves Up To 60%</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="w-5 h-5 text-[#B87333] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-display font-semibold text-white leading-none">Built To Last</span>
                  <span className="text-[8px] text-zinc-400 font-sans leading-none mt-1">OEM Tolerances</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Right Column - 65% width on tablets (giving more breathing room) */}
      <div 
        className={`w-full ${isPortraitTablet ? 'w-full px-4' : 'md:w-[65%] lg:w-[60%] xl:w-1/2'} flex flex-col justify-between items-center bg-white md:bg-[#F5F0EB] min-h-screen md:h-full md:overflow-y-auto`} 
        id="auth-right-container"
      >
        
        {/* Minimal Mobile Header bar - Hidden on portrait tablets & desktops */}
        {!isPortraitTablet && (
          <div className="md:hidden w-full h-[56px] min-h-[56px] bg-[#1A1A1A] flex items-center justify-center border-b border-zinc-800/80 flex-shrink-0 select-none pb-0" id="mobile-auth-minimal-header">
            <div onClick={onCancel} className="cursor-pointer flex items-center justify-center">
              <img src={logoImg} alt="PartsPeddle Logo" className="h-6.5 w-auto object-contain bg-transparent" referrerPolicy="no-referrer" />
            </div>
          </div>
        )}

        {/* Scrollable Form Box Center area */}
        <div className={`flex-grow w-full flex flex-col justify-center items-center py-6 md:py-10 ${isPortraitTablet ? 'py-12' : 'md:items-start md:pl-8 lg:items-center lg:pl-0'}`}>
          
          <div 
            className={`w-full ${isPortraitTablet ? 'max-w-[480px] py-8 px-6' : 'md:max-w-[485px] md:mr-auto md:ml-10 lg:mx-auto bg-white border border-zinc-200 shadow-xl px-6 py-8 md:p-8 rounded-lg'} relative bg-white border border-zinc-200/50 rounded-xl max-w-[450px] shadow-sm ${isShaking ? 'animate-auth-shake' : ''}`}
            id="auth-box-card"
          >
            {/* Decal top tracker */}
            <div className="absolute top-2.5 right-4 font-mono text-[9px] text-[#8A8A8A]">
              PP // AUTH.SECURE
            </div>

            {/* Dynamic Card Header */}
            <div className="text-center md:text-left mb-6">
              <h2 className="font-display text-2xl md:text-3xl font-black uppercase text-[#1E1E1E] tracking-tight leading-none">
                {isSignUp ? (role === 'seller' ? 'Join as a Seller' : 'Create Your Account') : 'Welcome Back'}
              </h2>
              
              <p className="text-xs text-zinc-500 font-sans mt-2 leading-relaxed">
                {isSignUp ? (
                  role === 'seller' 
                    ? 'List your inventory free. Reach thousands of buyers. Zero listing fees.' 
                    : 'Find hard-to-find OEM parts from verified salvage yards.'
                ) : (
                  'Sign in to your secure PartsPeddle credentials.'
                )}
              </p>
            </div>

            {/* Dynamic Sign Up Segment Role Selector Button Tabs */}
            {isSignUp && (
              <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-zinc-100 rounded-lg border border-zinc-200/60" id="role-tabs-selector">
                <button
                  type="button"
                  onClick={() => {
                    setRole('buyer');
                    setErrorMsg('');
                  }}
                  className={`py-2 px-3 text-xs font-display font-bold uppercase rounded-md tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${role === 'buyer' ? 'bg-white text-[#B87333] shadow-xs' : 'text-zinc-500 hover:text-zinc-800'}`}
                >
                  <User className="w-3.5 h-3.5" />
                  Buyer signup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole('seller');
                    setErrorMsg('');
                  }}
                  className={`py-2 px-3 text-xs font-display font-bold uppercase rounded-md tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${role === 'seller' ? 'bg-white text-[#B87333] shadow-xs' : 'text-zinc-500 hover:text-zinc-800'}`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Seller signup
                </button>
              </div>
            )}

            {/* Global Error Banner */}
            {errorMsg && (
              <div className="p-3.5 mb-4 border-l-4 border-[#B87333] bg-amber-50/70 rounded text-[13px] text-zinc-800 flex items-start gap-2.5 shadow-xs" id="auth-global-error">
                <AlertTriangle className="w-4 h-4 text-[#B87333] mt-0.5 flex-shrink-0" />
                <span className="font-sans leading-normal font-medium">{errorMsg}</span>
              </div>
            )}

            {/* Global Success Banner */}
            {successMsg && (
              <div className="p-3.5 mb-4 border-l-4 border-emerald-600 bg-emerald-50 rounded text-[13px] text-zinc-800 flex items-start gap-2.5" id="auth-global-success">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span className="font-sans leading-normal font-medium">{successMsg}</span>
              </div>
            )}

            {/* Main Interactive Form Block */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Conditional Field: Full Name */}
              {isSignUp && (
                <div>
                  <label className="text-[11px] tracking-widest uppercase font-display font-bold text-zinc-700 block mb-1">
                    Contact Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={fullName}
                      disabled={loading}
                      onBlur={() => setFullNameTouched(true)}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`w-full h-11 bg-[#F5F0EB]/30 border rounded-lg px-3.5 text-base text-[#1E1E1E] focus:ring-2 focus:ring-[#B87333] focus:ring-offset-2 focus:outline-none transition-all font-sans ${fullNameError ? 'border-red-500 bg-red-50/20' : 'border-zinc-300'}`}
                    />
                    <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                  {fullNameError && (
                    <p className="text-[13px] text-red-500 font-sans mt-1">
                      Full name is required and should be 2 to 60 characters.
                    </p>
                  )}
                </div>
              )}

              {/* Conditional Field: Business Name (Only if signup and role is seller) */}
              {isSignUp && role === 'seller' && (
                <div>
                  <label className="text-[11px] tracking-widest uppercase font-display font-bold text-zinc-700 block mb-1">
                    Business Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="E.g. Rusty Salvage & Parts"
                      value={businessName}
                      disabled={loading}
                      onBlur={() => setBusinessNameTouched(true)}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className={`w-full h-11 bg-[#F5F0EB]/30 border rounded-lg px-3.5 text-base text-[#1E1E1E] focus:ring-2 focus:ring-[#B87333] focus:ring-offset-2 focus:outline-none transition-all font-sans ${businessNameError ? 'border-red-500 bg-red-50/20' : 'border-zinc-300'}`}
                    />
                    <Briefcase className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                  {businessNameError && (
                    <p className="text-[13px] text-red-500 font-sans mt-1">
                      Licensed business or salvage yard name is required.
                    </p>
                  )}
                </div>
              )}

              {/* Email Address Field */}
              <div>
                <label className="text-[11px] tracking-widest uppercase font-display font-bold text-zinc-700 block mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="E.g. brandon@scrapyard.com"
                    value={email}
                    disabled={loading}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full h-11 bg-[#F5F0EB]/30 border rounded-lg px-3.5 text-base text-[#1E1E1E] focus:ring-2 focus:ring-[#B87333] focus:ring-offset-2 focus:outline-none transition-all font-sans pr-10 ${emailStatus === 'taken' || emailStatus === 'invalid' ? 'border-red-500' : emailStatus === 'available' ? 'border-emerald-500 focus:ring-emerald-500' : 'border-zinc-300'}`}
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    {emailChecking ? (
                      <div className="w-4 h-4 border-2 border-[#B87333] border-t-transparent rounded-full animate-spin" />
                    ) : emailStatus === 'available' ? (
                      <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                    ) : emailStatus === 'taken' ? (
                      <XCircle className="w-4.5 h-4.5 text-red-500" />
                    ) : (
                      <Mail className="w-4.5 h-4.5 text-zinc-400 pointer-events-none" />
                    )}
                  </div>
                </div>

                {/* Real-time Email Availability Indicators */}
                {emailStatus === 'taken' && (
                  <p className="text-[13px] text-red-500 font-sans mt-1 flex items-center gap-1.5">
                    ✗ Email is already registered. Try signing in.
                  </p>
                )}
                {emailStatus === 'available' && (
                  <p className="text-[13px] text-emerald-600 font-sans mt-1 flex items-center gap-1.5">
                    ✓ Email is available for registration!
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1 flex-wrap sm:flex-nowrap gap-y-1 text-zinc-700">
                  <label className="text-[11px] tracking-widest uppercase font-display font-bold block">
                    Password *
                  </label>
                  {!isSignUp && (
                    <button 
                      type="button"
                      onClick={() => setErrorMsg('A passive reset code was sent to the email provided above. Complete verification secure gateway.')}
                      className="text-[10.5px] text-[#B87333] font-sans hover:underline cursor-pointer select-none pl-2 pr-0 font-medium ml-auto"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    placeholder={isSignUp ? "Minimum 8 chars with 1 number" : "Your account security password"}
                    value={password}
                    disabled={loading}
                    onBlur={() => setPasswordTouched(true)}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full h-11 bg-[#F5F0EB]/30 border rounded-lg px-3.5 text-base text-[#1E1E1E] focus:ring-2 focus:ring-[#B87333] focus:ring-offset-2 focus:outline-none pr-12 transition-all font-sans ${passwordError ? 'border-red-500' : 'border-zinc-300'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-zinc-450 hover:text-[#1E1E1E] p-2 select-none min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 pointer-events-none text-zinc-400" /> : <Eye className="w-4 h-4 pointer-events-none text-zinc-400" />}
                  </button>
                </div>

                {/* Inline check warning */}
                {passwordError && (
                  <p className="text-[13px] text-red-500 font-sans mt-1">
                    Password must be at least 8 characters and include at least 1 number.
                  </p>
                )}

                {/* Dynamic Password Strength meter below field (Signup Only) */}
                {isSignUp && password.length > 0 && (
                  <div className="mt-2.5 px-0.5 animate-fade-in">
                    <div className="flex justify-between items-center mb-1 text-[11px]">
                      <span className="text-zinc-500">Security rating:</span>
                      <span className={`font-semibold uppercase tracking-wider ${passwordStrength.textClass}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    {/* Visual 3-bar color code indicator */}
                    <div className="grid grid-cols-3 gap-1.5 h-1.5 mt-1">
                      <div className={`h-full rounded-sm transition-all duration-350 ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-zinc-200'}`} />
                      <div className={`h-full rounded-sm transition-all duration-350 ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-zinc-200'}`} />
                      <div className={`h-full rounded-sm transition-all duration-350 ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-zinc-200'}`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Conditional Field: Confirm Password (Signup Only) */}
              {isSignUp && (
                <div>
                  <label className="text-[11px] tracking-widest uppercase font-display font-bold text-zinc-700 block mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Re-enter the password exactly"
                      value={confirmPassword}
                      disabled={loading}
                      onBlur={() => setConfirmPasswordTouched(true)}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full h-11 bg-[#F5F0EB]/30 border rounded-lg px-3.5 text-base text-[#1E1E1E] focus:ring-2 focus:ring-[#B87333] focus:ring-offset-2 focus:outline-none transition-all font-sans ${confirmPasswordError ? 'border-red-500 bg-red-50/20' : 'border-zinc-300'}`}
                    />
                    <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                  {confirmPasswordError && (
                    <p className="text-[13px] text-red-500 font-sans mt-1">
                      Confirm password does not match the chosen password above.
                    </p>
                  )}
                </div>
              )}

              {/* Checkbox: Terms of Use (Signup Only) - Links open in new tab */}
              {isSignUp && (
                <div className="flex items-start gap-2.5 pt-1.5 select-none text-zinc-600">
                  <input
                    type="checkbox"
                    id="agree-terms-checkbox"
                    checked={agreeTerms}
                    disabled={loading}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-[#B87333] focus:ring-[#B87333] border-zinc-300 w-4.5 h-4.5"
                  />
                  <label htmlFor="agree-terms-checkbox" className="text-xs font-sans leading-snug cursor-pointer font-medium text-zinc-600">
                    I agree to the{' '}
                    <a href="/?modal=terms" target="_blank" rel="noopener noreferrer" className="text-[#B87333] underline hover:text-amber-800">
                      Terms of Use
                    </a>{' '}
                    and{' '}
                    <a href="/?modal=privacy" target="_blank" rel="noopener noreferrer" className="text-[#B87333] underline hover:text-amber-800">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              )}

              {/* Checkbox: Licensed Salvage Yard confirmation (Signup & Seller Only) */}
              {isSignUp && role === 'seller' && (
                <div className="flex items-start gap-2.5 pt-1 select-none text-zinc-600">
                  <input
                    type="checkbox"
                    id="confirm-salvage-checkbox"
                    checked={confirmSalvage}
                    disabled={loading}
                    onChange={(e) => setConfirmSalvage(e.target.checked)}
                    className="mt-0.5 rounded text-[#B87333] focus:ring-[#B87333] border-zinc-300 w-4.5 h-4.5"
                  />
                  <label htmlFor="confirm-salvage-checkbox" className="text-xs font-sans leading-snug cursor-pointer font-medium text-zinc-650">
                    I confirm I represent a <span className="font-bold text-zinc-800">licensed salvage yard, automotive recycler, or authorized parts dismantler</span> with valid business credentials.
                  </label>
                </div>
              )}

              {/* Submit / CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full h-11 bg-[#B87333] hover:bg-[#925624] transition-all text-white font-display font-extrabold text-xs tracking-widest uppercase rounded-lg shadow-md active:translate-y-0.5 flex items-center justify-center gap-2 mt-4 cursor-pointer focus:ring-2 focus:ring-[#B87333] focus:ring-offset-2 focus:outline-none ${loading ? 'opacity-75 cursor-wait' : ''}`}
                id="auth-submit-action-btn"
              >
                <span>{loading ? 'Processing Secure Connection...' : (isSignUp ? (role === 'seller' ? 'START SELLING →' : 'CREATE ACCOUNT →') : 'SIGN IN SECURELY →')}</span>
              </button>
            </form>

            {/* Social Divider block */}
            <div className="relative flex items-center justify-center py-5 border-t border-zinc-200/80 mt-6" id="divider-row">
              <span className="bg-white px-3 text-[11px] uppercase font-display font-bold text-zinc-400 tracking-widest absolute">
                Or continue with
              </span>
            </div>

            {/* Structured Social Buttons matching layout specs precisely:
                Google & Facebook desaturated on row 1, Apple full-width below desaturated to let Amber dominate */}
            <div className="grid grid-cols-2 gap-3.5" id="social-buttons-box">
              <button
                type="button"
                onClick={() => handleSocialClick('Google')}
                className="col-span-1 border border-zinc-250 bg-white rounded-lg flex justify-center items-center gap-2 px-3 text-xs font-display font-bold uppercase transition-all duration-300 hover:bg-zinc-50 cursor-pointer min-h-[44px] filter saturate-[0.75] contrast-[0.95] hover:saturate-[1.1] hover:contrast-100 placeholder-opacity-50 text-zinc-600 hover:border-[#B87333]/40"
                title="Continue with Google"
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
                onClick={() => handleSocialClick('Facebook')}
                className="col-span-1 border border-zinc-250 bg-white rounded-lg flex justify-center items-center gap-2 px-3 text-xs font-display font-bold uppercase transition-all duration-300 hover:bg-zinc-50 cursor-pointer min-h-[44px] filter saturate-[0.75] contrast-[0.95] hover:saturate-[1.1] hover:contrast-100 text-zinc-600 hover:border-[#B87333]/40"
                title="Continue with Facebook"
              >
                <svg className="w-4 h-4 text-[#1877F2] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>

              <button
                type="button"
                onClick={() => handleSocialClick('Apple')}
                className="col-span-2 border border-zinc-250 bg-white rounded-lg flex justify-center items-center gap-2 px-3 text-xs font-display font-bold uppercase transition-all duration-300 hover:bg-zinc-50 cursor-pointer min-h-[44px] filter saturate-[0.75] contrast-[0.95] hover:saturate-[1.1] hover:contrast-100 text-zinc-650 hover:border-[#B87333]/40"
                title="Continue with Apple"
              >
                <svg className="w-4 h-4 text-black flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C4 16.5 3.5 10.5 6.1 7.37c1.32-1.34 2.83-1.4 3.65-.95 1.05.54 1.86.53 2.97 0 .82-.42 2.45-.63 3.68.64 1.25.96 1.9 2.22 1.55 3.97-.68 2.9-2.9 9.3-5.9 9.25zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.26 2.5-2.15 4.45-3.74 4.25z"/>
                </svg>
                Apple (iOS Single Sign-On)
              </button>
            </div>

            {/* Form Toggle Switch Footer */}
            <div className="mt-6 text-center text-xs text-zinc-500 font-sans border-t border-zinc-100 pt-4" id="login-signup-toggle">
              {isSignUp ? (
                role === 'seller' ? 'Already selling with us? ' : 'Already have an account? '
              ) : (
                'New to PartsPeddle? '
              )}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-[#B87333] hover:text-amber-800 font-bold uppercase tracking-wide text-[11px] underline cursor-pointer select-none ml-1 focus:outline-none"
              >
                {isSignUp ? 'Sign In →' : 'Create an Account →'}
              </button>
            </div>

          </div>
        </div>

        {/* Minimal Actions Stacked layout at bottom - Spaced for tablets with 44px targets */}
        <div className="w-full border-t border-zinc-200/50 p-6 flex flex-col items-center gap-3 bg-zinc-50/20 flex-shrink-0">
          
          {/* Desktop/Tablet Horizontal layout */}
          <div className="hidden md:flex flex-wrap items-center justify-center gap-x-12 gap-y-1 text-xs font-sans text-zinc-500 font-medium">
            <button 
              type="button" 
              onClick={onCancel}
              className="hover:text-[#B87333] transition-colors cursor-pointer text-zinc-600 hover:underline min-h-[44px] px-4 flex items-center justify-center"
            >
              Back to Store
            </button>
            <span className="text-zinc-300 select-none hidden md:inline">•</span>
            <button 
              type="button" 
              onClick={() => setBottomNotice('Terms of Service: All listed OEM parts are secured through escrow and authorized salvage desks.')}
              className="hover:text-[#B87333] transition-colors cursor-pointer text-zinc-600 hover:underline min-h-[44px] px-4 flex items-center justify-center"
            >
              Terms of Use
            </button>
            <span className="text-zinc-300 select-none hidden md:inline">•</span>
            <button 
              type="button" 
              onClick={() => setBottomNotice('Privacy: PartsPeddle secures and encrypts buyer records. Details are kept offline.')}
              className="hover:text-[#B87333] transition-colors cursor-pointer text-zinc-600 hover:underline min-h-[44px] px-4 flex items-center justify-center"
            >
              Privacy Policy
            </button>
            <span className="text-zinc-300 select-none hidden md:inline">•</span>
            <button 
              type="button" 
              onClick={() => setBottomNotice('Support: Need helper assistance? Contact registry-desk@partspeddle.com')}
              className="hover:text-[#B87333] transition-colors cursor-pointer text-zinc-600 hover:underline min-h-[44px] px-4 flex items-center justify-center"
            >
              Support Desk
            </button>
          </div>

          {/* Mobile Vertical stack in a touch grid (each has min-height of 44px) */}
          <div className="md:hidden w-full flex flex-col divide-y divide-zinc-200/40 border border-zinc-200/60 rounded-xl overflow-hidden bg-zinc-50/50 text-xs font-bold tracking-wide uppercase text-zinc-600 select-none">
            <button 
              type="button" 
              onClick={onCancel}
              className="w-full min-h-[44px] flex items-center justify-center hover:bg-[#B87333]/5 text-[#B87333] transition-colors cursor-pointer text-center"
            >
              Back to Store
            </button>
            <button 
              type="button" 
              onClick={() => setBottomNotice('Terms of Service: All listed OEM parts are secured through escrow and authorized salvage desks.')}
              className="w-full min-h-[44px] flex items-center justify-center hover:bg-zinc-100/50 transition-colors cursor-pointer text-center"
            >
              Terms of Use
            </button>
            <button 
              type="button" 
              onClick={() => setBottomNotice('Privacy: PartsPeddle secures and encrypts buyer records. Details are kept offline.')}
              className="w-full min-h-[44px] flex items-center justify-center hover:bg-zinc-100/50 transition-colors cursor-pointer text-center"
            >
              Privacy Policy
            </button>
            <button 
              type="button" 
              onClick={() => setBottomNotice('Support: Need helper assistance? Contact registry-desk@partspeddle.com')}
              className="w-full min-h-[44px] flex items-center justify-center hover:bg-zinc-100/50 transition-colors cursor-pointer text-center"
            >
              Support Desk
            </button>
          </div>

          {bottomNotice && (
            <div className="text-[10.5px] text-zinc-600 bg-amber-50/80 px-3.5 py-2 rounded-lg max-w-sm text-center relative flex items-center gap-2 border border-[#B87333]/20 shadow-xs mt-1 animate-fade-in" id="auth-bottom-notice">
              <span className="font-mono text-[9px] text-[#B87333] font-bold">INFO //</span>
              <span className="text-zinc-600 font-medium leading-relaxed">{bottomNotice}</span>
              <button 
                type="button" 
                onClick={() => setBottomNotice(null)}
                className="hover:text-red-700 font-black ml-1 text-xs cursor-pointer p-0.5"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
