"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/hooks";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (data.session) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.session.user.id)
          .single();
        const userRole = (roleData?.role as "buyer" | "seller" | "admin") || "buyer";
        setUser({
          id: data.session.user.id,
          email: data.session.user.email || null,
          jwt: data.session.access_token,
          aud: data.session.user.aud,
          role: userRole,
        });
        router.push(userRole === "seller" ? "/seller" : "/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed");
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
          Welcome Back
        </h2>
        <p className="text-xs text-zinc-500 font-sans mt-3 leading-relaxed">
          Access your secure PartsPeddle credentials.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 mb-6 border-l-4 border-rust-copper bg-amber-50 rounded text-sm text-zinc-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rust-copper shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <label className="text-[10px] tracking-widest uppercase font-display font-bold text-zinc-500 block mb-1.5 ml-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-lg px-4 text-base focus:ring-2 focus:ring-rust-copper outline-none transition-all"
          />
          <Mail className="absolute right-4 top-9 w-4 h-4 text-zinc-400" />
        </div>

        <div className="relative">
          <label className="text-[10px] tracking-widest uppercase font-display font-bold text-zinc-500 block mb-1.5 ml-1">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-lg px-4 pr-12 text-base focus:ring-2 focus:ring-rust-copper outline-none transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-9 text-zinc-400 hover:text-zinc-600"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        <button
          disabled={loading}
          className="w-full h-14 bg-rust-copper hover:bg-bronze disabled:opacity-70 transition-all text-white font-display font-black text-sm tracking-widest uppercase rounded-lg shadow-lg active:translate-y-0.5 flex items-center justify-center gap-2 mt-6"
        >
          {loading ? "Processing..." : "Sign In Securely"}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-zinc-600 font-sans border-t border-zinc-100 pt-6">
        New to PartsPeddle?
        <Link
          href="/register"
          className="text-rust-copper hover:underline font-bold uppercase tracking-wide text-xs ml-2"
        >
          Join Now →
        </Link>
      </div>
    </div>
  );
}
