import { createMockAffiliateUrl, type PlatformCode } from "@/lib/links";
import {
  getAffiliateFallbackReason,
  getAffiliateProviderMode,
  type AffiliateProviderMode,
} from "./config";
import { createAccessTradeTrackingLink } from "./accesstrade";

export type AffiliateLinkRequest = {
  originalUrl: string;
  platformCode: PlatformCode;
  shortCode: string;
  userId: string;
};

export type AffiliateLinkResult = {
  affiliateUrl: string;
  provider: "accesstrade" | "mock";
  campaignId: string | null;
  fallbackReason: string | null;
};

function buildMockResult(mode: AffiliateProviderMode, input: AffiliateLinkRequest): AffiliateLinkResult {
  return {
    affiliateUrl: createMockAffiliateUrl(input.originalUrl, input.platformCode),
    provider: "mock",
    campaignId: mode.campaignId,
    fallbackReason: getAffiliateFallbackReason(mode),
  };
}

export async function createAffiliateLink(input: AffiliateLinkRequest): Promise<AffiliateLinkResult> {
  const mode = getAffiliateProviderMode(input.platformCode);

  if (!mode.enabled) {
    return buildMockResult(mode, input);
  }

  const result = await createAccessTradeTrackingLink({
    apiKey: mode.apiKey,
    campaignId: mode.campaignId,
    originalUrl: input.originalUrl,
    platformCode: input.platformCode,
    shortCode: input.shortCode,
    userId: input.userId,
  });

  return {
    affiliateUrl: result.affiliateUrl,
    provider: result.provider,
    campaignId: result.campaignId,
    fallbackReason: null,
  };
}
