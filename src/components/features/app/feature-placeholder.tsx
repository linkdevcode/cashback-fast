import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

type FeaturePlaceholderProps = {
  title: string;
  description: string;
  badge?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export function FeaturePlaceholder({
  title,
  description,
  badge = "Coming soon",
  ctaLabel = "Back to dashboard",
  ctaHref = "/app/dashboard",
}: FeaturePlaceholderProps) {
  return (
    <Card className="bg-white/[0.03]">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-display text-2xl">{title}</CardTitle>
            <CardDescription className="mt-2 max-w-2xl">{description}</CardDescription>
          </div>
          <Badge variant="outline">{badge}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Link
          href={ctaHref}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-violet-500/15 px-4 text-sm font-semibold text-violet-200 transition-colors hover:bg-violet-500/20"
        >
          {ctaLabel}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
