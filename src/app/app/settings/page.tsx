import { SettingsWorkspace } from "@/components/features/settings/settings-workspace";
import { getSettingsUserAndSupabase, loadSettingsData } from "@/lib/settings-server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const { supabase, user } = await getSettingsUserAndSupabase();

  if (!user) {
    redirect("/login?redirect=/app/settings");
  }

  const { profile, banks, usingDemoBanks, usingDemoProfile } = await loadSettingsData(supabase, user.id);

  return (
    <SettingsWorkspace
      profile={profile}
      banks={banks}
      usingDemoBanks={usingDemoBanks}
      usingDemoProfile={usingDemoProfile}
    />
  );
}
