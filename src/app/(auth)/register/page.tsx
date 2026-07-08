'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Eye, EyeOff, Mail, Lock, User, CheckCircle } from 'lucide-react';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    if (!passwordRegex.test(formData.password)) {
      setErrorMsg(
        'Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character.',
      );
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    if (!agreeToTerms) {
      setErrorMsg('You must agree to the Terms of Service and Privacy Policy.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
          },
        },
      });
      if (error) throw error;

      // Confirm the user object with the auth server before storing state.
      if (data.session) {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) throw new Error('User verification failed');
      }

      setSuccessMsg('Account created successfully. Please check your email to confirm.');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
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

      <div className="mb-6 text-center md:text-left">
        <h2 className="font-display text-2xl font-black uppercase tracking-tight leading-none text-foreground-primary">
          Join PartsPeddle
        </h2>
        <p className="mt-2 font-sans text-xs leading-relaxed text-foreground-muted">
          Create your secure account to start buying or selling parts.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-5 flex items-start gap-3 rounded border-l-4 border-status-warning bg-status-warning-soft p-4 text-sm text-foreground-primary">
          <AlertTriangle className="h-5 w-5 shrink-0 text-status-warning" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-5 flex items-start gap-3 rounded border-l-4 border-status-success bg-status-success-soft p-4 text-sm text-foreground-primary">
          <CheckCircle className="h-5 w-5 shrink-0 text-status-success" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 ml-1 block font-display text-[10px] font-bold uppercase tracking-widest text-foreground-muted">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="h-12 w-full rounded-lg border border-stroke-subtle bg-surface-secondary px-4 text-base text-foreground-primary outline-none transition-all focus:ring-2 focus:ring-brand-primary"
            />
          </div>
          <div>
            <label className="mb-1.5 ml-1 block font-display text-[10px] font-bold uppercase tracking-widest text-foreground-muted">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="h-12 w-full rounded-lg border border-stroke-subtle bg-surface-secondary px-4 text-base text-foreground-primary outline-none transition-all focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>

        <div className="relative">
          <label className="mb-1.5 ml-1 block font-display text-[10px] font-bold uppercase tracking-widest text-foreground-muted">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="h-12 w-full rounded-lg border border-stroke-subtle bg-surface-secondary px-4 text-base text-foreground-primary outline-none transition-all focus:ring-2 focus:ring-brand-primary"
          />
          <Mail className="absolute right-4 top-9 h-4 w-4 text-foreground-muted" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="mb-1.5 ml-1 block font-display text-[10px] font-bold uppercase tracking-widest text-foreground-muted">
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
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
          <div className="relative">
            <label className="mb-1.5 ml-1 block font-display text-[10px] font-bold uppercase tracking-widest text-foreground-muted">
              Confirm
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="h-12 w-full rounded-lg border border-stroke-subtle bg-surface-secondary px-4 pr-12 text-base text-foreground-primary outline-none transition-all focus:ring-2 focus:ring-brand-primary"
            />
            <Lock className="absolute right-4 top-9 h-4 w-4 text-foreground-muted" />
          </div>
        </div>

        <div className="relative">
          <label className="mb-1.5 ml-1 block font-display text-[10px] font-bold uppercase tracking-widest text-foreground-muted">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="h-12 w-full rounded-lg border border-stroke-subtle bg-surface-secondary px-4 text-base text-foreground-primary outline-none transition-all focus:ring-2 focus:ring-brand-primary"
          />
          <User className="absolute right-4 top-9 h-4 w-4 text-foreground-muted" />
        </div>

        <label className="flex items-start gap-3 pt-1">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            className="mt-1 h-4 w-4 accent-brand-primary"
          />
          <span className="font-sans text-xs leading-relaxed text-foreground-muted">
            I agree to the{' '}
            <Link href="/terms" className="text-brand-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-brand-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        <Button
          type="submit"
          disabled={loading}
          className="mt-4 flex h-14 w-full items-center justify-center gap-2 font-display text-sm font-black uppercase tracking-widest"
        >
          {loading ? 'Creating Account...' : 'Create Secure Account'}
        </Button>
      </form>

      <div className="mt-6 border-t border-stroke-subtle pt-5 text-center font-sans text-sm text-foreground-secondary">
        Already registered?
        <Link
          href="/login"
          className="ml-2 text-xs font-bold uppercase tracking-wide text-brand-primary hover:underline"
        >
          Sign In →
        </Link>
      </div>
    </div>
  );
}
