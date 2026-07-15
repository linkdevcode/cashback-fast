import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const fromMock = vi.fn();

  const selectChain = {
    select: vi.fn(() => selectChain),
    eq: vi.fn(() => selectChain),
    single: vi.fn(),
  };

  const updateChain = {
    update: vi.fn(() => updateChain),
    eq: vi.fn(() => updateChain),
  };

  return { fromMock, selectChain, updateChain };
});

vi.mock("@/lib/db/admin", () => ({
  createAdminClient: () => ({
    from: mocks.fromMock,
  }),
}));

import { GET } from "./route";

describe("redirect route", () => {
  beforeEach(() => {
    mocks.fromMock.mockReset();
    mocks.selectChain.select.mockReset();
    mocks.selectChain.eq.mockReset();
    mocks.selectChain.single.mockReset();
    mocks.updateChain.update.mockReset();
    mocks.updateChain.eq.mockReset();

    mocks.fromMock.mockImplementation((table: string) => {
      if (table === "affiliate_links") {
        return {
          select: mocks.selectChain.select,
          eq: mocks.selectChain.eq,
          single: mocks.selectChain.single,
          update: mocks.updateChain.update,
        };
      }

      return null;
    });
  });

  it("redirects to the affiliate url and increments click count", async () => {
    mocks.selectChain.single.mockResolvedValue({
      data: {
        id: "link-1",
        affiliate_url: "https://example.com/track",
        click_count: 4,
      },
      error: null,
    });

    const response = await GET(
      new Request("http://localhost/go/SHORT123") as Parameters<typeof GET>[0],
      {
        params: { code: "SHORT123" },
      }
    );

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://example.com/track");
    expect(mocks.selectChain.eq).toHaveBeenCalledWith("short_code", "SHORT123");
    expect(mocks.updateChain.update).toHaveBeenCalledWith({ click_count: 5 });
    expect(mocks.updateChain.eq).toHaveBeenCalledWith("id", "link-1");
  });

  it("returns 404 when the code is unknown", async () => {
    mocks.selectChain.single.mockResolvedValue({
      data: null,
      error: new Error("not found"),
    });

    const response = await GET(
      new Request("http://localhost/go/UNKNOWN") as Parameters<typeof GET>[0],
      {
        params: { code: "UNKNOWN" },
      }
    );

    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.success).toBe(false);
    expect(body.error).toBe("Link not found");
  });
});
