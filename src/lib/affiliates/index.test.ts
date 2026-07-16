import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createAffiliateLink } from "./index";

describe("affiliate provider layer", () => {
  const originalEnv = {
    ACCESSTRADE_API_KEY: process.env.ACCESSTRADE_API_KEY,
    ACCESSTRADE_CAMPAIGN_SHOPEE_ID: process.env.ACCESSTRADE_CAMPAIGN_SHOPEE_ID,
    ENABLE_ACCESSTRADE_INTEGRATION: process.env.ENABLE_ACCESSTRADE_INTEGRATION,
  };

  beforeEach(() => {
    process.env.ACCESSTRADE_API_KEY = "";
    process.env.ACCESSTRADE_CAMPAIGN_SHOPEE_ID = "";
    process.env.ENABLE_ACCESSTRADE_INTEGRATION = "";
    vi.unstubAllGlobals();
  });

  afterEach(() => {
    process.env.ACCESSTRADE_API_KEY = originalEnv.ACCESSTRADE_API_KEY;
    process.env.ACCESSTRADE_CAMPAIGN_SHOPEE_ID = originalEnv.ACCESSTRADE_CAMPAIGN_SHOPEE_ID;
    process.env.ENABLE_ACCESSTRADE_INTEGRATION = originalEnv.ENABLE_ACCESSTRADE_INTEGRATION;
    vi.unstubAllGlobals();
  });

  it("falls back to mock links when AccessTrade is not configured", async () => {
    const result = await createAffiliateLink({
      originalUrl: "https://shopee.vn/product/1",
      platformCode: "shopee",
      shortCode: "SHORT123",
      userId: "user-1",
    });

    expect(result.provider).toBe("mock");
    expect(result.affiliateUrl).toContain("accesstrade.example");
    expect(result.fallbackReason).toBe("AccessTrade API key is not configured");
  });

  it("creates a real AccessTrade tracking link when configured", async () => {
    process.env.ACCESSTRADE_API_KEY = "at-key";
    process.env.ACCESSTRADE_CAMPAIGN_SHOPEE_ID = "campaign-123";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        data: {
          success_link: [
            {
              aff_link: "https://tracking.accesstrade.vn/abc",
              short_link: "https://short.accesstrade.vn/xyz",
              url_origin: "https://shopee.vn/product/1",
            },
          ],
        },
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await createAffiliateLink({
      originalUrl: "https://shopee.vn/product/1",
      platformCode: "shopee",
      shortCode: "SHORT123",
      userId: "user-1",
    });

    expect(result.provider).toBe("accesstrade");
    expect(result.affiliateUrl).toBe("https://tracking.accesstrade.vn/abc");
    expect(result.campaignId).toBe("campaign-123");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.accesstrade.vn/v1/product_link/create",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Token at-key",
          "Content-Type": "application/json",
        }),
      })
    );
  });
});
