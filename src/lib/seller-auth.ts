import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { User } from "@supabase/supabase-js";

type SellerAuthResult =
  | { user: User; error: null }
  | { user: null; error: NextResponse };

export async function requireSeller(req: NextRequest): Promise<SellerAuthResult> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Missing authorization context." },
        { status: 401 },
      ),
    };
  }

  const token = authHeader.replace("Bearer ", "");
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Unauthorized session window." },
        { status: 401 },
      ),
    };
  }

  return { user, error: null };
}