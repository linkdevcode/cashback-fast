import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/db/server";
import {
  detectPlatformFromUrl,
  generateShortCode,
} from "@/lib/links";
import { createAffiliateLink } from "@/lib/affiliates";
import { rateLimit } from "@/lib/rate-limit";

const createLinkSchema = z.object({
  url: z.string().url("Invalid URL"),
  platform: z.enum(["shopee", "lazada", "tiktok", "tiki"]).optional(),
});

async function getAuthenticatedUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return { supabase, user: null };
  }

  return { supabase, user: data.user };
}

export async function GET() {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { data: links, error } = await supabase
    .from("affiliate_links")
    .select(
      "id, user_id, platform_id, original_url, short_code, affiliate_url, qr_code_url, click_count, conversion_count, created_at, platforms(name, code)"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch links" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data: links });
}

export async function POST(request: Request) {
  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const limitKey = `link:create:${user.id}`;
  const limited = rateLimit(limitKey, 30, 60 * 1000);

  if (!limited.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "Rate limit exceeded",
        meta: {
          remaining: limited.remaining,
          resetTime: limited.resetTime,
        },
      },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = createLinkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { url, platform: providedPlatform } = parsed.data;
  const detectedPlatform = providedPlatform
    ? { code: providedPlatform, label: providedPlatform }
    : detectPlatformFromUrl(url);

  if (!detectedPlatform) {
    return NextResponse.json(
      { success: false, error: "Could not detect platform from URL" },
      { status: 400 }
    );
  }

  const { data: platformRow, error: platformError } = await supabase
    .from("platforms")
    .select("id, name, code, base_url")
    .eq("code", detectedPlatform.code)
    .single();

  if (platformError || !platformRow) {
    return NextResponse.json(
      { success: false, error: "Platform not found" },
      { status: 400 }
    );
  }

  const shortCode = generateShortCode();

  let affiliateLink: Awaited<ReturnType<typeof createAffiliateLink>> | null = null;

  try {
    affiliateLink = await createAffiliateLink({
      originalUrl: url,
      platformCode: platformRow.code,
      shortCode,
      userId: user.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create affiliate tracking link",
      },
      { status: 502 }
    );
  }

  if (!affiliateLink) {
    return NextResponse.json(
      { success: false, error: "Failed to create affiliate tracking link" },
      { status: 502 }
    );
  }

  const { data: link, error } = await supabase
    .from("affiliate_links")
    .insert({
      user_id: user.id,
      platform_id: platformRow.id,
      original_url: url,
      short_code: shortCode,
      affiliate_url: affiliateLink.affiliateUrl,
    })
    .select(
      "id, user_id, platform_id, original_url, short_code, affiliate_url, qr_code_url, click_count, conversion_count, created_at"
    )
    .single();

  if (error || !link) {
    return NextResponse.json(
      { success: false, error: "Failed to create link" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        ...link,
        platform: platformRow,
        affiliate_provider: affiliateLink.provider,
        affiliate_campaign_id: affiliateLink.campaignId,
        affiliate_fallback_reason: affiliateLink.fallbackReason,
      },
    },
    { status: 201 }
  );
}
