'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/hooks';
import { AlertTriangle, Eye, EyeOff, Mail } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (data.session) {
        // Validate the user server-side before trusting the session user object.
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) throw new Error('Session validation failed');

        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userData.user.id)
          .single();
        const userRole = (roleData?.role as 'buyer' | 'seller' | 'admin') || 'buyer';
        setUser({
          id: userData.user.id,
          email: userData.user.email || null,
          jwt: data.session.access_token,
          aud: userData.user.aud,
          role: userRole,
        });
        router.push(userRole === 'seller' ? '/seller' : '/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isShaking ? 'animate-auth-shake' : ''}>
      <style>{`
        @keyframes authShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-auth-shake { animation: authShake 300ms ease-in-out; }
      `}</style>

      <div className="mb-8 text-center md:text-left">
        <h2 className="font-display text-3xl font-black uppercase tracking-tight leading-none text-foreground-primary">
          Welcome Back
        </h2>
        <p className="mt-3 font-sans text-xs leading-relaxed text-foreground-muted">
          Access your secure PartsPeddle credentials.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 flex items-start gap-3 rounded border-l-4 border-status-warning bg-status-warning-soft p-4 text-sm text-foreground-primary">
          <AlertTriangle className="h-5 w-5 shrink-0 text-status-warning" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <label className="mb-1.5 ml-1 block font-display text-[10px] font-bold uppercase tracking-widest text-foreground-muted">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full rounded-lg border border-stroke-subtle bg-surface-secondary px-4 text-base text-foreground-primary outline-none transition-all focus:ring-2 focus:ring-brand-primary"
          />
          <Mail className="absolute right-4 top-9 h-4 w-4 text-foreground-muted" />
        </div>

        <div className="relative">
          <label className="mb-1.5 ml-1 block font-display text-[10px] font-bold uppercase tracking-widest text-foreground-muted">
            Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 w-full rounded-lg border border-stroke-subtle bg-surface-secondary px-4 pr-12 text-base text-foreground-primary outline-none transition-all focus:ring-2 focus:ring-brand-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-9 text-foreground-muted hover:text-foreground-secondary"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="mt-6 flex h-14 w-full items-center justify-center gap-2 font-display text-sm font-black uppercase tracking-widest"
        >
          {loading ? 'Processing...' : 'Sign In Securely'}
        </Button>
      </form>

      <div className="mt-8 border-t border-stroke-subtle pt-6 text-center font-sans text-sm text-foreground-secondary">
        New to PartsPeddle?
        <Link
          href="/register"
          className="ml-2 text-xs font-bold uppercase tracking-wide text-brand-primary hover:underline"
        >
          Join Now →
        </Link>
      </div>
    </div>
  );
}
