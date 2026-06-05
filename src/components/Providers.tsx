'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';

export function Providers({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile } = useAppStore();

  useEffect(() => {
    // Initialize Auth
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser({
          id: session.user.id,
          email: session.user.email || null,
          jwt: session.access_token,
          aud: session.user.aud,
          role: session.user.user_metadata.role || 'buyer'
        });
        
        // Fetch profile if needed
        const { data: profile } = await supabase
          .from('seller_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (profile) setProfile(profile);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ? {
        id: session.user.id,
        email: session.user.email || null,
        jwt: session.access_token,
        aud: session.user.aud,
        role: session.user.user_metadata.role || 'buyer'
      } : null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setProfile]);

  return <>{children}</>;
}
