import { describe, expect, it, vi, afterEach } from "vitest";
import { rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests until the limit is reached", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T00:00:00.000Z"));

    expect(rateLimit("user-1", 2, 1000)).toEqual({
      allowed: true,
      count: 1,
      remaining: 1,
      resetTime: Date.now() + 1000,
    });
    expect(rateLimit("user-1", 2, 1000)).toEqual({
      allowed: true,
      count: 2,
      remaining: 0,
      resetTime: Date.now() + 1000,
    });
    expect(rateLimit("user-1", 2, 1000)).toMatchObject({
      allowed: false,
      count: 3,
      remaining: 0,
    });
  });

  it("resets once the window expires", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T00:00:00.000Z"));

    rateLimit("user-2", 1, 1000);
    vi.setSystemTime(new Date("2026-07-15T00:00:01.001Z"));

    expect(rateLimit("user-2", 1, 1000)).toEqual({
      allowed: true,
      count: 1,
      remaining: 0,
      resetTime: Date.now() + 1000,
    });
  });
});
