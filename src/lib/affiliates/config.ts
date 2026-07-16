import type { PlatformCode } from "@/lib/links";

export const ACCESSTRADE_TRACKING_SOURCE = "hoantienpro";
export const ACCESSTRADE_TRACKING_MEDIUM = "affiliate";

export type AffiliateProviderMode =
  | {
      enabled: true;
      apiKey: string;
      campaignId: string;
      provider: "accesstrade";
    }
  | {
      enabled: false;
      provider: "mock";
      reason: "missing_api_key" | "missing_campaign_id" | "disabled";
      campaignId: string | null;
    };

const PLATFORM_CAMPAIGN_ENV_KEYS: Record<PlatformCode, string> = {
  shopee: "ACCESSTRADE_CAMPAIGN_SHOPEE_ID",
  lazada: "ACCESSTRADE_CAMPAIGN_LAZADA_ID",
  tiktok: "ACCESSTRADE_CAMPAIGN_TIKTOK_ID",
  tiki: "ACCESSTRADE_CAMPAIGN_TIKI_ID",
};

function readEnvValue(key: string) {
  const value = process.env[key]?.trim();
  return value ? value : null;
}

export function getAccessTradeCampaignId(platformCode: PlatformCode) {
  return readEnvValue(PLATFORM_CAMPAIGN_ENV_KEYS[platformCode]);
}

export function getAffiliateProviderMode(platformCode: PlatformCode): AffiliateProviderMode {
  const apiKey = readEnvValue("ACCESSTRADE_API_KEY");
  const campaignId = getAccessTradeCampaignId(platformCode);
  const enabledFlag = readEnvValue("ENABLE_ACCESSTRADE_INTEGRATION");

  if (enabledFlag === "false") {
    return {
      enabled: false,
      provider: "mock",
      reason: "disabled",
      campaignId,
    };
  }

  if (!apiKey) {
    return {
      enabled: false,
      provider: "mock",
      reason: "missing_api_key",
      campaignId,
    };
  }

  if (!campaignId) {
    return {
      enabled: false,
      provider: "mock",
      reason: "missing_campaign_id",
      campaignId: null,
    };
  }

  return {
    enabled: true,
    provider: "accesstrade",
    apiKey,
    campaignId,
  };
}

export function getAffiliateFallbackReason(mode: AffiliateProviderMode) {
  if (mode.enabled) {
    return null;
  }

  if (mode.reason === "missing_api_key") {
    return "AccessTrade API key is not configured";
  }

  if (mode.reason === "missing_campaign_id") {
    return "Missing AccessTrade campaign mapping for this platform";
  }

  return "AccessTrade integration is disabled";
}
