"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Toast } from "@/components/ui/toast";
import {
  detectPlatformFromUrl,
  formatRelativeTime,
  getPlatformLabel,
} from "@/lib/links";
import { Check, Copy, ExternalLink, Loader2, Link2, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type PlatformRow = {
  id: string;
  name: string;
  code: string;
  base_url: string;
};

type RecentLink = {
  id: string;
  platform_id: string;
  original_url: string;
  short_code: string;
  affiliate_url: string;
  qr_code_url: string | null;
  click_count: number;
  conversion_count: number;
  created_at: string;
  platforms?: {
    name: string;
    code: string;
  } | null;
};

type LinkGeneratorPanelProps = {
  platforms: PlatformRow[];
  initialLinks: RecentLink[];
};

type CreatedLink = RecentLink & {
  short_url: string;
  platform: PlatformRow;
};

const quickTags = [
  { code: "", label: "Auto-detect", tone: "outline" as const, symbol: "A" },
  { code: "shopee", label: "Shopee", tone: "warning" as const, symbol: "S" },
  { code: "lazada", label: "Lazada", tone: "info" as const, symbol: "L" },
  { code: "tiktok", label: "TikTok Shop", tone: "default" as const, symbol: "T" },
  { code: "tiki", label: "Tiki", tone: "success" as const, symbol: "T" },
];

export function LinkGeneratorPanel({ platforms, initialLinks }: LinkGeneratorPanelProps) {
  const [input, setInput] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [links, setLinks] = useState(initialLinks);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [result, setResult] = useState<CreatedLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const detectedPlatform = useMemo(() => {
    if (!input.trim()) {
      return null;
    }

    return detectPlatformFromUrl(input);
  }, [input]);

  const activePlatform = useMemo(() => {
    if (selectedPlatform) {
      return platforms.find((item) => item.code === selectedPlatform) || null;
    }

    if (detectedPlatform) {
      return platforms.find((item) => item.code === detectedPlatform.code) || null;
    }

    return null;
  }, [detectedPlatform, platforms, selectedPlatform]);

  const handleGenerate = async () => {
    setError(null);

    if (!input.trim()) {
      setError("Vui lòng dán một URL hợp lệ.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/v1/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: input.trim(),
          platform: selectedPlatform || undefined,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Không thể tạo link");
      }

      const created = payload.data as Omit<CreatedLink, "short_url"> & {
        platform: PlatformRow;
      };
      const currentOrigin = origin || window.location.origin;

      const nextResult: CreatedLink = {
        ...created,
        short_url: `${currentOrigin}/go/${created.short_code}`,
      };

      setResult(nextResult);
      setLinks((current) => [created, ...current].slice(0, 50));
      setInput("");
      setSelectedPlatform("");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể tạo link");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;

    await navigator.clipboard.writeText(result.short_url);
    setCopiedCode(result.short_code);
    window.setTimeout(() => setCopiedCode(null), 1600);
  };

  const handleDelete = async (linkId: string) => {
    setIsDeletingId(linkId);
    setError(null);

    try {
      const response = await fetch(`/api/v1/links/${linkId}`, {
        method: "DELETE",
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Không thể xóa link");
      }

      setLinks((current) => current.filter((item) => item.id !== linkId));
      if (result?.id === linkId) {
        setResult(null);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể xóa link");
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <Card className="bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-display text-2xl">
            <Link2 className="h-5 w-5 text-violet-300" />
            Tạo Link tiếp thị
          </CardTitle>
          <CardDescription>
            Dán URL sản phẩm, hệ thống sẽ tự nhận diện nền tảng và tạo short link để bạn chia sẻ.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              URL sản phẩm
            </span>
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="https://shopee.vn/..."
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Nền tảng
            </span>
            <Select value={selectedPlatform} onChange={(event) => setSelectedPlatform(event.target.value)}>
              <option value="">Auto-detect</option>
              {platforms.map((platform) => (
                <option key={platform.id} value={platform.code}>
                  {platform.name}
                </option>
              ))}
            </Select>
          </label>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Hỗ trợ nhanh
            </span>
            <div className="flex flex-wrap gap-2">
              {quickTags.map((tag) => {
                const active = selectedPlatform === tag.code || (!selectedPlatform && tag.code === "");
                return (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => setSelectedPlatform(tag.code)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                      active
                        ? "border-violet-500/30 bg-violet-500/15 text-white"
                        : "border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                        tag.tone === "warning"
                          ? "bg-orange-500/20 text-orange-200"
                          : tag.tone === "info"
                            ? "bg-cyan-500/20 text-cyan-200"
                            : tag.tone === "success"
                              ? "bg-emerald-500/20 text-emerald-200"
                              : tag.tone === "default"
                                ? "bg-fuchsia-500/20 text-fuchsia-200"
                                : "bg-white/10 text-slate-200"
                      }`}
                    >
                      {tag.symbol}
                    </span>
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Link2 className="mr-2 h-4 w-4" />
                  Tạo Link
                </>
              )}
            </Button>

            <div className="flex items-center gap-2">
              <Badge variant={activePlatform ? "success" : "outline"}>
                {activePlatform ? activePlatform.name : "Auto"}
              </Badge>
              {detectedPlatform ? <Badge variant="outline">Phát hiện: {detectedPlatform.label}</Badge> : null}
            </div>
          </div>

          {error ? (
            <Toast title="Không thể thực hiện" description={error} variant="error" />
          ) : null}

          {result ? (
            <div className="space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/80">
                    Link đã tạo
                  </p>
                  <p className="mt-2 break-all font-mono text-sm text-white">{result.short_url}</p>
                </div>
                <Button variant="secondary" size="sm" onClick={handleCopy}>
                  {copiedCode === result.short_code ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Đã sao chép
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Sao chép
                    </>
                  )}
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Card className="bg-white/[0.03]">
                  <CardContent className="px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Mã rút gọn</p>
                    <p className="mt-2 font-mono text-sm text-white">{result.short_code}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/[0.03]">
                  <CardContent className="px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Nền tảng</p>
                    <p className="mt-2 text-sm font-semibold text-white">{result.platform.name}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/[0.03]">
                  <CardContent className="px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Điểm đến</p>
                    <a
                      href={result.affiliate_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300"
                    >
                      Mở URL affiliate
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="bg-white/[0.03]">
        <CardHeader>
          <CardTitle className="text-display text-2xl">Link gần đây</CardTitle>
          <CardDescription>Hiển thị 50 link gần nhất của user hiện tại.</CardDescription>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-sm text-slate-400">
              Chưa có link nào. Hãy tạo link đầu tiên ở khung bên trái.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Link</TableHead>
                    <TableHead>Thống kê</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">
                              {link.platforms?.name || getPlatformLabel(link.platforms?.code || "")}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {formatRelativeTime(link.created_at)}
                            </span>
                          </div>
                          <p className="max-w-[280px] break-all text-sm text-white">
                            {link.original_url}
                          </p>
                          <p className="font-mono text-xs text-slate-400">
                            {origin ? `${origin}/go/${link.short_code}` : `/go/${link.short_code}`}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm text-slate-300">
                          <p>Clicks: {link.click_count}</p>
                          <p>Chuyển đổi: {link.conversion_count}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                `${origin || window.location.origin}/go/${link.short_code}`
                              )
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(link.id)}
                            disabled={isDeletingId === link.id}
                          >
                            {isDeletingId === link.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-rose-300" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
