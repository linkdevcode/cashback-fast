type PlatformPattern = {
  code: string;
  label: string;
  pattern: RegExp;
};

export type PlatformCode = "shopee" | "lazada" | "tiktok" | "tiki";

export type PlatformInfo = {
  code: PlatformCode;
  label: string;
};

export const PLATFORM_PATTERNS: PlatformPattern[] = [
  { code: "shopee", label: "Shopee", pattern: /shopee\.(vn|co\.id)/i },
  { code: "lazada", label: "Lazada", pattern: /lazada\.(vn|co\.th)/i },
  { code: "tiktok", label: "TikTok Shop", pattern: /tiktok\.com\/shop/i },
  { code: "tiki", label: "Tiki", pattern: /tiki\.vn/i },
];

export function detectPlatformFromUrl(url: string): PlatformInfo | null {
  const match = PLATFORM_PATTERNS.find((item) => item.pattern.test(url));

  if (!match) {
    return null;
  }

  return { code: match.code as PlatformCode, label: match.label };
}

export function generateShortCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let index = 0; index < length; index += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

export function createMockAffiliateUrl(originalUrl: string, platformCode: string) {
  return `https://accesstrade.example/track?platform=${platformCode}&url=${encodeURIComponent(
    originalUrl
  )}`;
}

export function getPlatformLabel(platformCode: string) {
  return (
    PLATFORM_PATTERNS.find((item) => item.code === platformCode)?.label || platformCode
  );
}

export function formatRelativeTime(dateValue: string | Date) {
  const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
}
