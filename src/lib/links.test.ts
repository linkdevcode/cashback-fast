import { describe, expect, it, vi } from "vitest";
import {
  createMockAffiliateUrl,
  detectPlatformFromUrl,
  formatRelativeTime,
  generateShortCode,
  getPlatformLabel,
} from "./links";

describe("links helpers", () => {
  it("detects supported platforms from URL", () => {
    expect(detectPlatformFromUrl("https://shopee.vn/product/123")).toEqual({
      code: "shopee",
      label: "Shopee",
    });
    expect(detectPlatformFromUrl("https://www.lazada.vn/products/abc")).toEqual({
      code: "lazada",
      label: "Lazada",
    });
    expect(detectPlatformFromUrl("https://www.tiktok.com/shop/product/1")).toEqual({
      code: "tiktok",
      label: "TikTok Shop",
    });
    expect(detectPlatformFromUrl("https://tiki.vn/abc")).toEqual({
      code: "tiki",
      label: "Tiki",
    });
  });

  it("returns null for unknown URLs", () => {
    expect(detectPlatformFromUrl("https://example.com")).toBeNull();
  });

  it("generates a deterministic short code when random is mocked", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    expect(generateShortCode(6)).toBe("AAAAAA");
  });

  it("builds mock affiliate URLs with encoded original URL", () => {
    expect(createMockAffiliateUrl("https://shopee.vn/p/a b", "shopee")).toBe(
      "https://accesstrade.example/track?platform=shopee&url=https%3A%2F%2Fshopee.vn%2Fp%2Fa%20b"
    );
  });

  it("returns a readable label for a platform code", () => {
    expect(getPlatformLabel("shopee")).toBe("Shopee");
    expect(getPlatformLabel("unknown")).toBe("unknown");
  });

  it("formats relative time for recent timestamps", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T00:00:00.000Z"));

    expect(formatRelativeTime("2026-07-14T23:59:40.000Z")).toBe("Vừa xong");
    expect(formatRelativeTime("2026-07-14T23:50:00.000Z")).toBe("10 phút trước");
    expect(formatRelativeTime("2026-07-14T21:00:00.000Z")).toBe("3 giờ trước");
    expect(formatRelativeTime("2026-07-12T00:00:00.000Z")).toBe("3 ngày trước");

    vi.useRealTimers();
  });
});
