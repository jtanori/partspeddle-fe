"use client";

import React, { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { supabase } from "@/lib/supabase";

import { AuthProvider } from "./providers/AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
