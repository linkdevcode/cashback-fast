import { ACCESSTRADE_TRACKING_MEDIUM, ACCESSTRADE_TRACKING_SOURCE } from "./config";

export type AccessTradeCreateTrackingLinkInput = {
  apiKey: string;
  campaignId: string;
  originalUrl: string;
  platformCode: string;
  shortCode: string;
  userId: string;
};

export type AccessTradeSuccessLink = {
  aff_link?: string;
  first_link?: string | null;
  short_link?: string | null;
  url_origin?: string | null;
};

export type AccessTradeCreateTrackingLinkResponse = {
  success?: boolean;
  data?: {
    error_link?: Array<{ message?: string; url?: string }>;
    success_link?: AccessTradeSuccessLink[];
    suspend_url?: string[];
  };
};

function getAccessTradeErrorMessage(payload: AccessTradeCreateTrackingLinkResponse, status: number) {
  const apiMessage = payload.data?.error_link?.[0]?.message?.trim();

  if (apiMessage) {
    return apiMessage;
  }

  return `AccessTrade create tracking link failed with HTTP ${status}`;
}

export async function createAccessTradeTrackingLink(input: AccessTradeCreateTrackingLinkInput) {
  const response = await fetch("https://api.accesstrade.vn/v1/product_link/create", {
    method: "POST",
    headers: {
      Authorization: `Token ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      campaign_id: input.campaignId,
      urls: [input.originalUrl],
      utm_source: ACCESSTRADE_TRACKING_SOURCE,
      utm_medium: ACCESSTRADE_TRACKING_MEDIUM,
      utm_campaign: input.platformCode,
      sub1: input.userId,
      sub2: input.shortCode,
      sub3: input.platformCode,
    }),
  });

  let payload: AccessTradeCreateTrackingLinkResponse | null = null;

  try {
    payload = (await response.json()) as AccessTradeCreateTrackingLinkResponse;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      payload ? getAccessTradeErrorMessage(payload, response.status) : `AccessTrade create tracking link failed with HTTP ${response.status}`
    );
  }

  const affiliateUrl = payload?.data?.success_link?.[0]?.aff_link;

  if (!affiliateUrl) {
    throw new Error("AccessTrade response did not include an affiliate URL");
  }

  return {
    affiliateUrl,
    provider: "accesstrade" as const,
    campaignId: input.campaignId,
    raw: payload,
  };
}
