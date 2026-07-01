import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";

export interface AdminAuthResult {
  session: any;
  role: string;
  isAdmin: boolean;
  response: { error: string; status: number } | null;
}

export async function requireAdmin(
  request: NextRequest,
): Promise<AdminAuthResult> {
  const supabase = createServerClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    },
  );

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return {
      session: null,
      role: "",
      isAdmin: false,
      response: { error: "Unauthorized", status: 401 },
    };
  }

  // TODO(P1.1): migrate role source from user_metadata to server-side table
  const role = (session.user.user_metadata?.role as string) || "buyer";

  if (role !== "admin") {
    return {
      session,
      role,
      isAdmin: false,
      response: { error: "Forbidden", status: 403 },
    };
  }

  return { session, role, isAdmin: true, response: null };
}
