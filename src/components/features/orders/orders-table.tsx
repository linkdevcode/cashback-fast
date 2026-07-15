"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusBadge } from "./order-status-badge";
import { formatVnd, type OrderRecord } from "@/lib/orders";
import { Copy, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";

type OrdersTableProps = {
  orders: OrderRecord[];
  origin: string;
  onDelete?: (id: string) => void;
  deletingId?: string | null;
};

export function OrdersTable({ orders, origin, onDelete, deletingId }: OrdersTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Đơn hàng</TableHead>
            <TableHead>Nền tảng</TableHead>
            <TableHead>Giá trị</TableHead>
            <TableHead>Hoa hồng</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-mono text-sm text-white">{order.order_id_external}</p>
                  <p className="text-xs text-slate-400">{order.id}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{order.platform.name}</p>
                  <p className="text-xs text-slate-400">{order.platform.code}</p>
                </div>
              </TableCell>
              <TableCell className="text-sm text-slate-200">{formatVnd(order.order_value)}</TableCell>
              <TableCell>
                <div className="space-y-1 text-sm text-slate-200">
                  <p>{formatVnd(order.user_commission)}</p>
                  <p className="text-xs text-slate-500">
                    Total {formatVnd(order.commission_total)}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-sm text-slate-300">
                {new Date(order.created_at).toLocaleDateString("vi-VN")}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigator.clipboard.writeText(`${origin}/app/orders?id=${order.id}`)
                    }
                    aria-label="Sao chép liên kết đơn hàng"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Link
                    href={`/app/orders/${order.id}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-200 transition-colors hover:bg-white/[0.08]"
                    aria-label="Xem chi tiết đơn hàng"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  {onDelete ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(order.id)}
                      disabled={deletingId === order.id}
                    >
                      <Trash2 className="h-4 w-4 text-rose-300" />
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
