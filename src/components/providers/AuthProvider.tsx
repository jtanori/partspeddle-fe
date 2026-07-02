"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/hooks";

const AuthContext = createContext({});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { setUser } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (session) {
          setUser({
            id: session.user.id,
            email: session.user.email || null,
            jwt: session.access_token,
            aud: session.user.aud,
            role: session.user.user_metadata.role || "buyer",
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth Synchronization Failure:", error);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email || null,
              jwt: session.access_token,
              aud: session.user.aud,
              role: session.user.user_metadata.role || "buyer",
            }
          : null,
      );
      setIsInitializing(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [setUser]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-5 h-5 border-2 border-zinc-200 border-t-rust-copper rounded-full animate-spin" />
      </div>
    );
  }

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};
