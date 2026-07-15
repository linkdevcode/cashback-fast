import { LinkGeneratorPanel } from "@/components/features/links/link-generator-panel";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/db/server";
import { redirect } from "next/navigation";

export default async function LinksPage() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login?redirect=/app/links");
  }

  const [{ data: platforms }, { data: links }] = await Promise.all([
    supabase.from("platforms").select("id, name, code, base_url").eq("is_active", true).order("name"),
    supabase
      .from("affiliate_links")
      .select("id, platform_id, original_url, short_code, affiliate_url, qr_code_url, click_count, conversion_count, created_at")
      .eq("user_id", data.user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const platformMap = new Map(
    (platforms ?? []).map((platform) => [platform.id, { name: platform.name, code: platform.code }])
  );

  const recentLinks = (links ?? []).map((link) => ({
    ...link,
    platforms: platformMap.get(link.platform_id) || null,
  }));

  return (
    <div className="space-y-6">

      <LinkGeneratorPanel
        platforms={(platforms ?? []) as Array<{ id: string; name: string; code: string; base_url: string }>}
        initialLinks={recentLinks as Array<{
          id: string;
          platform_id: string;
          original_url: string;
          short_code: string;
          affiliate_url: string;
          qr_code_url: string | null;
          click_count: number;
          conversion_count: number;
          created_at: string;
          platforms?: { name: string; code: string } | null;
        }>}
      />
    </div>
  );
}
