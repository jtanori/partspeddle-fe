import type { StateCreator } from "zustand";
import { supabase } from "@/lib/supabase";
import type { UserSession } from "@/types";
import { safeGetItem, safeSetItem } from "../storage";

export type UserRole = "buyer" | "seller";

export interface SellerProfile {
  id?: string;
  name?: string;
  business_name?: string;
  location?: string;
  whatsapp?: string;
  email?: string;
  status?: string;
  [key: string]: unknown;
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
  userRole:
    (safeGetItem("parts_peddle_user_role") as UserRole) || "buyer",
  profile: null,

  setUser: (user) => set({ user }),
  setUserRole: (role) => {
    safeSetItem("parts_peddle_user_role", role);
    set({ userRole: role });
  },
  setProfile: (profile) => set({ profile }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, userRole: "buyer", profile: null });
    safeSetItem("parts_peddle_user_role", "buyer");
  },
});