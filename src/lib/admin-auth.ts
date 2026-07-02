import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import { getUserRole, type UserRole } from "./user-roles";

export interface AdminAuthResult {
  session: any;
  role: UserRole;
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
      role: "buyer",
      isAdmin: false,
      response: { error: "Unauthorized", status: 401 },
    };
  }

  const role = await getUserRole(supabase, session.user.id);

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
