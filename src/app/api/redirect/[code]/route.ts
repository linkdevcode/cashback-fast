import { createAdminClient } from "@/lib/db/admin";
import { NextResponse, type NextRequest } from "next/server";

type Params = {
  params: {
    code: string;
  };
};

export async function GET(request: NextRequest, { params }: Params) {
  const { code } = params;
  const supabase = createAdminClient();

  const { data: link, error } = await supabase
    .from("affiliate_links")
    .select("id, affiliate_url, click_count")
    .eq("short_code", code)
    .single();

  if (error || !link) {
    return NextResponse.json({ success: false, error: "Link not found" }, { status: 404 });
  }

  await supabase
    .from("affiliate_links")
    .update({ click_count: link.click_count + 1 })
    .eq("id", link.id);

  const destination = link.affiliate_url || new URL("/", request.url).toString();
  return NextResponse.redirect(destination, { status: 302 });
}
