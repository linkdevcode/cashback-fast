import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const getUserMock = vi.fn();
  const fromMock = vi.fn();
  const rateLimitMock = vi.fn();
  const detectPlatformFromUrlMock = vi.fn();
  const generateShortCodeMock = vi.fn();
  const createMockAffiliateUrlMock = vi.fn();

  const platformChain = {
    select: vi.fn(() => platformChain),
    eq: vi.fn(() => platformChain),
    single: vi.fn(),
  };

  const listChain = {
    select: vi.fn(() => listChain),
    eq: vi.fn(() => listChain),
    order: vi.fn(() => listChain),
    limit: vi.fn(),
  };

  const insertResultChain = {
    select: vi.fn(() => insertResultChain),
    single: vi.fn(),
  };

  const createChain = {
    select: vi.fn(() => createChain),
    eq: vi.fn(() => createChain),
    order: vi.fn(() => createChain),
    limit: vi.fn(),
    insert: vi.fn(() => insertResultChain),
    delete: vi.fn(() => createChain),
  };

  return {
    getUserMock,
    fromMock,
    rateLimitMock,
    detectPlatformFromUrlMock,
    generateShortCodeMock,
    createMockAffiliateUrlMock,
    platformChain,
    listChain,
    insertResultChain,
    createChain,
  };
});

let mode: "get" | "post" = "get";

vi.mock("@/lib/db/server", () => ({
  createClient: () => ({
    auth: {
      getUser: mocks.getUserMock,
    },
    from: mocks.fromMock,
  }),
}));

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: mocks.rateLimitMock,
}));

vi.mock("@/lib/links", () => ({
  detectPlatformFromUrl: mocks.detectPlatformFromUrlMock,
  generateShortCode: mocks.generateShortCodeMock,
  createMockAffiliateUrl: mocks.createMockAffiliateUrlMock,
}));

import { GET, POST } from "./route";
import { DELETE } from "./[id]/route";

describe("links API routes", () => {
  beforeEach(() => {
    mode = "get";
    mocks.getUserMock.mockReset();
    mocks.fromMock.mockReset();
    mocks.rateLimitMock.mockReset();
    mocks.detectPlatformFromUrlMock.mockReset();
    mocks.generateShortCodeMock.mockReset();
    mocks.createMockAffiliateUrlMock.mockReset();

    mocks.fromMock.mockImplementation((table: string) => {
      if (table === "platforms") {
        return mocks.platformChain;
      }

      if (table === "affiliate_links") {
        return mode === "get" ? mocks.listChain : mocks.createChain;
      }

      return null;
    });
  });

  it("returns recent links for the authenticated user", async () => {
    mocks.getUserMock.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mocks.listChain.limit.mockResolvedValue({
      data: [
        {
          id: "link-1",
          user_id: "user-1",
          platform_id: "platform-1",
          original_url: "https://shopee.vn/product/1",
          short_code: "ABC12345",
          affiliate_url: "https://example.com",
          qr_code_url: null,
          click_count: 3,
          conversion_count: 1,
          created_at: "2026-07-15T00:00:00.000Z",
        },
      ],
      error: null,
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(mocks.fromMock).toHaveBeenCalledWith("affiliate_links");
    expect(mocks.listChain.eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(mocks.listChain.limit).toHaveBeenCalledWith(50);
  });

  it("creates an affiliate link using auto-detected platform", async () => {
    mode = "post";
    mocks.getUserMock.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mocks.rateLimitMock.mockReturnValue({
      allowed: true,
      remaining: 29,
      resetTime: Date.now() + 60_000,
    });
    mocks.detectPlatformFromUrlMock.mockReturnValue({ code: "shopee", label: "Shopee" });
    mocks.generateShortCodeMock.mockReturnValue("SHORT123");
    mocks.createMockAffiliateUrlMock.mockReturnValue("https://accesstrade.example/affiliate");

    mocks.platformChain.single.mockResolvedValue({
      data: { id: "platform-1", name: "Shopee", code: "shopee", base_url: "https://shopee.vn" },
      error: null,
    });
    mocks.insertResultChain.single.mockResolvedValue({
      data: {
        id: "link-1",
        user_id: "user-1",
        platform_id: "platform-1",
        original_url: "https://shopee.vn/product/1",
        short_code: "SHORT123",
        affiliate_url: "https://accesstrade.example/affiliate",
        qr_code_url: null,
        click_count: 0,
        conversion_count: 0,
        created_at: "2026-07-15T00:00:00.000Z",
      },
      error: null,
    });

    const request = new Request("http://localhost/api/v1/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://shopee.vn/product/1" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.short_code).toBe("SHORT123");
    expect(mocks.rateLimitMock).toHaveBeenCalledWith("link:create:user-1", 30, 60 * 1000);
    expect(mocks.detectPlatformFromUrlMock).toHaveBeenCalledWith("https://shopee.vn/product/1");
    expect(mocks.createMockAffiliateUrlMock).toHaveBeenCalledWith("https://shopee.vn/product/1", "shopee");
    expect(mocks.insertResultChain.single).toHaveBeenCalled();
  });

  it("rejects link creation when the rate limit is exceeded", async () => {
    mode = "post";
    mocks.getUserMock.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    mocks.rateLimitMock.mockReturnValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 60_000,
    });

    const request = new Request("http://localhost/api/v1/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://shopee.vn/product/1" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(429);
    expect(body.success).toBe(false);
    expect(body.error).toBe("Rate limit exceeded");
  });

  it("removes a link for the authenticated user", async () => {
    mocks.getUserMock.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const deleteChain = {
      delete: vi.fn(() => deleteChain),
      eq: vi.fn(() => deleteChain),
      single: vi.fn(),
    };

    mocks.fromMock.mockImplementation((table: string) => {
      if (table === "affiliate_links") {
        return deleteChain;
      }

      return null;
    });

    deleteChain.single.mockResolvedValue({
      data: null,
      error: null,
    });

    const response = await DELETE(new Request("http://localhost/api/v1/links/link-1"), {
      params: { id: "link-1" },
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(deleteChain.eq).toHaveBeenNthCalledWith(1, "id", "link-1");
    expect(deleteChain.eq).toHaveBeenNthCalledWith(2, "user_id", "user-1");
  });
});
