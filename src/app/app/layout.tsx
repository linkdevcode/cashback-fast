import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/server";
import { AppShell } from "@/components/layout/app-shell";

function getDisplayName(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const metadata = user.user_metadata ?? {};
  const fullName = metadata.full_name ?? metadata.name ?? metadata.username;

  if (typeof fullName === "string" && fullName.trim()) {
    return fullName;
  }

  return user.email?.split("@")[0] || "User";
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login?redirect=/app/dashboard");
  }

  const avatarUrl =
    typeof data.user.user_metadata?.avatar_url === "string"
      ? data.user.user_metadata.avatar_url
      : typeof data.user.user_metadata?.picture === "string"
        ? data.user.user_metadata.picture
        : null;

  return (
    <AppShell
      name={getDisplayName(data.user)}
      email={data.user.email || "user@example.com"}
      avatarUrl={avatarUrl}
    >
      {children}
    </AppShell>
  );
}
