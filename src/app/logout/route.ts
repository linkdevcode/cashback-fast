import { NextResponse, type NextRequest } from "next/server";
import { createRouteClient } from "@/lib/db/route-client";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  const supabase = createRouteClient({ request, response });

  await supabase.auth.signOut();

  return response;
}
