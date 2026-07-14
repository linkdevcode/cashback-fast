import type { SupabaseClient, User } from "@supabase/supabase-js";

type PublicUserRow = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  referral_code: string | null;
  referred_by: string | null;
  is_banned: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
};

function getProfileName(user: User) {
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.username ||
    user.email?.split("@")[0] ||
    "User"
  );
}

function getProfileAvatar(user: User) {
  return user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
}

function generateReferralCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let index = 0; index < length; index += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

async function createUniqueReferralCode(supabase: SupabaseClient) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const referralCode = generateReferralCode();
    const { data } = await supabase
      .from("users")
      .select("id")
      .eq("referral_code", referralCode)
      .maybeSingle();

    if (!data) {
      return referralCode;
    }
  }

  throw new Error("Could not generate unique referral code");
}

export async function syncUserProfile(
  supabase: SupabaseClient,
  authUser: User
): Promise<PublicUserRow> {
  if (!authUser.email) {
    throw new Error("Missing user email from Supabase Auth");
  }

  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Failed to load user profile: ${fetchError.message}`);
  }

  const payload = {
    id: authUser.id,
    email: authUser.email,
    full_name: getProfileName(authUser),
    avatar_url: getProfileAvatar(authUser),
    phone: authUser.user_metadata?.phone ?? null,
  };

  if (existingUser) {
    const { data, error } = await supabase
      .from("users")
      .update(payload)
      .eq("id", authUser.id)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }

    return data as PublicUserRow;
  }

  const referralCode = await createUniqueReferralCode(supabase);
  const { data, error } = await supabase
    .from("users")
    .insert({
      ...payload,
      referral_code: referralCode,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create user profile: ${error.message}`);
  }

  return data as PublicUserRow;
}
