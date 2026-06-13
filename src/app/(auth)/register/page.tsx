"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  AlertTriangle,
  CheckCircle2,
  User,
  Briefcase,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [confirmSalvage, setConfirmSalvage] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    try {
      setLoading(true);
      if (password !== confirmPassword)
        throw new Error("Passwords do not match");
      if (!agreeTerms)
        throw new Error("You must agree to the Terms & Privacy Policy");
      if (role === "seller" && !confirmSalvage)
        throw new Error("You must confirm salvage yard license");

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
            business_name: role === "seller" ? businessName : undefined,
          },
        },
      });
      if (error) throw error;

      setSuccessMsg(
        "Account created! Please check your email for verification.",
      );
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isShaking ? "animate-auth-shake" : ""}>
      <style>{`
        @keyframes authShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-auth-shake { animation: authShake 300ms ease-in-out; }
      `}</style>

      <div className="text-center md:text-left mb-8">
        <h2 className="font-display text-3xl font-black uppercase text-[#1E1E1E] tracking-tight leading-none">
          {role === "seller" ? "Join as a Seller" : "Create Account"}
        </h2>
        <p className="text-xs text-zinc-500 font-sans mt-3 leading-relaxed">
          Join the network of vetted salvage professionals.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-zinc-100 rounded-lg border border-zinc-200/60">
        <button
          type="button"
          onClick={() => setRole("buyer")}
          className={`py-2 text-xs font-display font-bold uppercase rounded-md tracking-wider transition-all ${role === "buyer" ? "bg-white text-rust-copper shadow-sm" : "text-zinc-500"}`}
        >
          Buyer
        </button>
        <button
          type="button"
          onClick={() => setRole("seller")}
          className={`py-2 text-xs font-display font-bold uppercase rounded-md tracking-wider transition-all ${role === "seller" ? "bg-white text-rust-copper shadow-sm" : "text-zinc-500"}`}
        >
          Seller
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 mb-6 border-l-4 border-rust-copper bg-amber-50 rounded text-sm text-zinc-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rust-copper shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 mb-6 border-l-4 border-emerald-600 bg-emerald-50 rounded text-sm text-zinc-800 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label className="text-[10px] tracking-widest uppercase font-display font-bold text-zinc-500 block mb-1 ml-1">
            Full Name
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-lg px-4 text-sm focus:ring-2 focus:ring-rust-copper outline-none transition-all"
          />
          <User className="absolute right-4 top-8 w-4 h-4 text-zinc-400" />
        </div>

        {role === "seller" && (
          <div className="relative">
            <label className="text-[10px] tracking-widest uppercase font-display font-bold text-zinc-500 block mb-1 ml-1">
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-lg px-4 text-sm focus:ring-2 focus:ring-rust-copper outline-none transition-all"
            />
            <Briefcase className="absolute right-4 top-8 w-4 h-4 text-zinc-400" />
          </div>
        )}

        <div className="relative">
          <label className="text-[10px] tracking-widest uppercase font-display font-bold text-zinc-500 block mb-1 ml-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-lg px-4 text-sm focus:ring-2 focus:ring-rust-copper outline-none transition-all"
          />
          <Mail className="absolute right-4 top-8 w-4 h-4 text-zinc-400" />
        </div>

        <div className="relative">
          <label className="text-[10px] tracking-widest uppercase font-display font-bold text-zinc-500 block mb-1 ml-1">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-lg px-4 text-sm focus:ring-2 focus:ring-rust-copper outline-none transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-8 text-zinc-400"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        <div className="relative">
          <label className="text-[10px] tracking-widest uppercase font-display font-bold text-zinc-500 block mb-1 ml-1">
            Confirm Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-lg px-4 text-sm focus:ring-2 focus:ring-rust-copper outline-none transition-all"
          />
          <Lock className="absolute right-4 top-8 w-4 h-4 text-zinc-400" />
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            required
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-1 rounded text-rust-copper focus:ring-rust-copper"
          />
          <span className="text-[11px] text-zinc-500">
            I agree to the{" "}
            <span className="text-rust-copper underline">Terms</span> and{" "}
            <span className="text-rust-copper underline">Privacy Policy</span>
          </span>
        </label>

        {role === "seller" && (
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={confirmSalvage}
              onChange={(e) => setConfirmSalvage(e.target.checked)}
              className="mt-1 rounded text-rust-copper focus:ring-rust-copper"
            />
            <span className="text-[11px] text-zinc-500 font-medium">
              I confirm I represent a{" "}
              <span className="font-bold text-zinc-800">
                licensed salvage yard
              </span>
              .
            </span>
          </label>
        )}

        <button
          disabled={loading}
          className="w-full h-12 bg-rust-copper hover:bg-bronze disabled:opacity-70 transition-all text-white font-display font-black text-xs tracking-widest uppercase rounded-lg shadow-lg active:translate-y-0.5 mt-4"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-zinc-600 font-sans border-t border-zinc-100 pt-6">
        Already have an account?
        <Link
          href="/login"
          className="text-rust-copper hover:underline font-bold uppercase tracking-wide text-xs ml-2"
        >
          Sign In →
        </Link>
      </div>
    </div>
  );
}
