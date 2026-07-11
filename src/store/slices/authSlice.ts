import type { StateCreator } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { UserSession } from '@/types';

export type UserRole = 'buyer' | 'seller';

export interface SellerProfile {
  id?: string;
  name?: string;
  business_name?: string;
  location?: string;
  whatsapp?: string;
  email?: string;
  status?: string;
  logoUrl?: string;
  verificationStatus?: string;
  verification_status?: string;
}

export interface AuthSlice {
  user: UserSession | null;
  userRole: UserRole;
  profile: SellerProfile | null;
  setUser: (user: UserSession | null) => void;
  setUserRole: (role: UserRole) => void;
  setProfile: (profile: SellerProfile | null) => void;
  logout: () => Promise<void>;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  // Role is derived from the server session; never store it in localStorage.
  userRole: 'buyer',
  profile: null,

  setUser: (user) => set({ user }),
  setUserRole: (role) => set({ userRole: role }),
  setProfile: (profile) => set({ profile }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, userRole: 'buyer', profile: null });
  },
});
