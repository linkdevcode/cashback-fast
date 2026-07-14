"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Toast } from "@/components/ui/toast";
import { Check, Copy, ExternalLink, Link2, Loader2, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

const platformMatchers = [
  { code: "shopee", label: "Shopee", pattern: /shopee\.(vn|co\.id)/i },
  { code: "lazada", label: "Lazada", pattern: /lazada\.(vn|co\.th)/i },
  { code: "tiktok", label: "TikTok Shop", pattern: /tiktok\.com\/shop/i },
  { code: "tiki", label: "Tiki", pattern: /tiki\.vn/i },
];

function detectPlatform(url: string) {
  return platformMatchers.find((item) => item.pattern.test(url)) ?? null;
}

function buildTrackedLink(url: string, platformCode: string) {
  const shortCode = `${platformCode}-${Math.random().toString(36).slice(2, 8)}`.toLowerCase();
  return {
    shortUrl: `hoantien.pro/go/${shortCode}`,
    affiliateUrl: `https://accesstrade.example/track?platform=${platformCode}&url=${encodeURIComponent(
      url
    )}`,
    shortCode,
  };
}

export function LinkConverterDemo() {
  const [input, setInput] = useState("https://shopee.vn/product/123456789");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const platform = useMemo(() => detectPlatform(input), [input]);
  const result = useMemo(() => {
    if (!platform) {
      return null;
    }

    return buildTrackedLink(input, platform.code);
  }, [input, platform]);

  const handleGenerate = async () => {
    if (!platform) {
      return;
    }

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    setIsGenerating(false);
  };

  const handleCopy = async () => {
    if (!result) {
      return;
    }

    await navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/70 to-transparent" />
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-300" />
              Live demo converter
            </CardTitle>
            <CardDescription>
              Dán link sản phẩm để tự nhận diện nền tảng và sinh link rút gọn.
            </CardDescription>
          </div>
          <Badge variant={platform ? "success" : "warning"}>
            {platform ? platform.label : "Chưa nhận diện"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            URL sản phẩm
          </span>
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Dán link Shopee, Lazada, TikTok Shop, Tiki..."
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <Button onClick={handleGenerate} disabled={!platform || isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <Link2 className="mr-2 h-4 w-4" />
                Tạo link hoàn tiền
              </>
            )}
          </Button>
          <Button variant="secondary" onClick={handleCopy} disabled={!result}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Đã copy
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy link
              </>
            )}
          </Button>
        </div>

        {result ? (
          <div className="space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/80">
                  Link đã tạo
                </p>
                <p className="mt-1 font-mono text-sm text-white">{result.shortUrl}</p>
              </div>
              <Button variant="ghost" size="sm" className="text-emerald-100">
                <ExternalLink className="mr-2 h-4 w-4" />
                Mở thử
              </Button>
            </div>
            <p className="text-sm text-slate-300">
              Affiliate URL được sinh theo provider, rồi gắn `short_code` để theo dõi click và
              conversion.
            </p>
          </div>
        ) : (
          <Toast
            title="Chưa nhận diện được nền tảng"
            description="Hãy thử một link Shopee/Lazada/TikTok Shop/Tiki để xem demo."
            variant="error"
          />
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="bg-white/[0.03]">
            <CardContent className="px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Click</p>
              <p className="mt-2 text-2xl font-bold text-white">0</p>
            </CardContent>
          </Card>
          <Card className="bg-white/[0.03]">
            <CardContent className="px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Conversion</p>
              <p className="mt-2 text-2xl font-bold text-white">0</p>
            </CardContent>
          </Card>
          <Card className="bg-white/[0.03]">
            <CardContent className="px-4 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">QR Code</p>
              <p className="mt-2 text-2xl font-bold text-white">Ready</p>
            </CardContent>
          </Card>
        </div>

        <p className="text-xs leading-6 text-slate-500">
          Demo này chỉ mô phỏng luồng UX. Ở sprint sau, nút tạo link sẽ gọi API thật và lưu lịch
          sử vào database.
        </p>
      </CardContent>
    </Card>
  );
}
