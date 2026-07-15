import { Badge } from "@/components/ui/badge";
import { getOrderStatusMeta } from "@/lib/orders";

export function OrderStatusBadge({ status }: { status: string }) {
  const meta = getOrderStatusMeta(status);
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}
