import { NextResponse, type NextRequest } from "next/server";
import { syncUserProfile } from "@/lib/auth/sync-user";
import { createRouteClient } from "@/lib/db/route-client";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = requestUrl.searchParams.get("next") || "/app/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url));
  const supabase = createRouteClient({ request, response });

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }

  try {
    await syncUserProfile(supabase, data.user);
  } catch {
    return NextResponse.redirect(new URL("/login?error=profile_sync_failed", request.url));
  }

  return response;
}
