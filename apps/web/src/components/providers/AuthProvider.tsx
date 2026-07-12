'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/hooks';
import { Skeleton } from '@/components/ui/skeleton';

const AuthContext = createContext({});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const { setUser } = useAuthStore();

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Validate the session by contacting the Supabase Auth server.
        // The user object from getSession() comes from storage and may not be authentic.
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (!isMounted) return;

        if (user && !userError) {
          setUser({
            id: user.id,
            email: user.email || null,
            jwt: null, // Client-side UI state does not need the JWT; fetch wrappers retrieve it separately.
            aud: user.aud ?? 'authenticated',
            role: user.user_metadata.role || 'buyer',
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth Synchronization Failure:', error);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return;

      // onAuthStateChange is only used for reactive UI updates (sign-in/out).
      // The initial user is validated via getUser() above.
      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email || null,
              jwt: null,
              aud: session.user.aud ?? 'authenticated',
              role: session.user.user_metadata.role || 'buyer',
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
      <div className="flex h-screen items-center justify-center bg-surface-secondary">
        <div className="w-full max-w-md space-y-4 px-6">
          <Skeleton className="mx-auto h-12 w-12 rounded-full" />
          <Skeleton.Text lines={2} className="text-center" />
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
};
