import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/db/server";

const updateProfileSchema = z.object({
  full_name: z.string().min(2, "Full name is required").max(100).optional(),
  phone: z.string().min(6, "Phone number is required").max(30).nullable().optional(),
  avatar_url: z.string().url("Avatar URL must be valid").nullable().optional(),
});

async function getUserAndSupabase() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  return { supabase, user: error || !data.user ? null : data.user };
}

export async function GET() {
  const { supabase, user } = await getUserAndSupabase();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle();

  if (error) {
    return NextResponse.json({ success: false, error: "Failed to load profile" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data,
  });
}

export async function PUT(request: Request) {
  const { supabase, user } = await getUserAndSupabase();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("users")
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data,
  });
}
