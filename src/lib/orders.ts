export type OrderStatus = "pending" | "approved" | "rejected";

export type OrderPlatform = {
  code: string;
  name: string;
};

export type OrderRecord = {
  id: string;
  user_id: string;
  affiliate_link_id: string | null;
  platform_id: string;
  platform: OrderPlatform;
  order_id_external: string;
  order_value: number;
  commission_total: number;
  user_commission: number;
  platform_commission: number;
  status: OrderStatus;
  click_time: string | null;
  conversion_time: string | null;
  audit_date: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderFilters = {
  platform?: string;
  status?: string;
  q?: string;
  from?: string;
  to?: string;
};

export type OrderStats = {
  available: number;
  pending: number;
  totalEarned: number;
  approvedCount: number;
  pendingCount: number;
  rejectedCount: number;
};

export const ORDER_STATUS_META: Record<
  OrderStatus,
  {
    label: string;
    variant: "success" | "warning" | "danger";
  }
> = {
  pending: { label: "Pending", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "danger" },
};

export const DEMO_ORDERS: OrderRecord[] = [
  {
    id: "order-demo-1",
    user_id: "demo-user",
    affiliate_link_id: "link-demo-1",
    platform_id: "platform-shopee",
    platform: { code: "shopee", name: "Shopee" },
    order_id_external: "SHOPEE-20260715-001",
    order_value: 125000,
    commission_total: 18000,
    user_commission: 14400,
    platform_commission: 3600,
    status: "approved",
    click_time: "2026-07-14T17:10:00.000Z",
    conversion_time: "2026-07-14T17:24:00.000Z",
    audit_date: "2026-07-21T00:00:00.000Z",
    created_at: "2026-07-14T17:24:00.000Z",
    updated_at: "2026-07-14T17:24:00.000Z",
  },
  {
    id: "order-demo-2",
    user_id: "demo-user",
    affiliate_link_id: "link-demo-2",
    platform_id: "platform-lazada",
    platform: { code: "lazada", name: "Lazada" },
    order_id_external: "LAZADA-20260715-002",
    order_value: 98000,
    commission_total: 15000,
    user_commission: 12000,
    platform_commission: 3000,
    status: "pending",
    click_time: "2026-07-14T12:05:00.000Z",
    conversion_time: null,
    audit_date: "2026-07-23T00:00:00.000Z",
    created_at: "2026-07-14T12:20:00.000Z",
    updated_at: "2026-07-14T12:20:00.000Z",
  },
  {
    id: "order-demo-3",
    user_id: "demo-user",
    affiliate_link_id: "link-demo-3",
    platform_id: "platform-tiktok",
    platform: { code: "tiktok", name: "TikTok Shop" },
    order_id_external: "TIKTOK-20260714-003",
    order_value: 265000,
    commission_total: 31000,
    user_commission: 24800,
    platform_commission: 6200,
    status: "approved",
    click_time: "2026-07-13T09:00:00.000Z",
    conversion_time: "2026-07-13T09:10:00.000Z",
    audit_date: "2026-07-20T00:00:00.000Z",
    created_at: "2026-07-13T09:10:00.000Z",
    updated_at: "2026-07-13T09:10:00.000Z",
  },
  {
    id: "order-demo-4",
    user_id: "demo-user",
    affiliate_link_id: "link-demo-4",
    platform_id: "platform-tiki",
    platform: { code: "tiki", name: "Tiki" },
    order_id_external: "TIKI-20260713-004",
    order_value: 76000,
    commission_total: 10200,
    user_commission: 8160,
    platform_commission: 2040,
    status: "rejected",
    click_time: "2026-07-12T18:00:00.000Z",
    conversion_time: "2026-07-12T18:07:00.000Z",
    audit_date: "2026-07-19T00:00:00.000Z",
    created_at: "2026-07-12T18:07:00.000Z",
    updated_at: "2026-07-12T18:07:00.000Z",
  },
  {
    id: "order-demo-5",
    user_id: "demo-user",
    affiliate_link_id: "link-demo-5",
    platform_id: "platform-shopee",
    platform: { code: "shopee", name: "Shopee" },
    order_id_external: "SHOPEE-20260712-005",
    order_value: 158000,
    commission_total: 21600,
    user_commission: 17280,
    platform_commission: 4320,
    status: "pending",
    click_time: "2026-07-11T15:30:00.000Z",
    conversion_time: null,
    audit_date: "2026-07-19T00:00:00.000Z",
    created_at: "2026-07-11T15:35:00.000Z",
    updated_at: "2026-07-11T15:35:00.000Z",
  },
  {
    id: "order-demo-6",
    user_id: "demo-user",
    affiliate_link_id: "link-demo-6",
    platform_id: "platform-lazada",
    platform: { code: "lazada", name: "Lazada" },
    order_id_external: "LAZADA-20260711-006",
    order_value: 212000,
    commission_total: 28700,
    user_commission: 22960,
    platform_commission: 5740,
    status: "approved",
    click_time: "2026-07-10T10:30:00.000Z",
    conversion_time: "2026-07-10T10:44:00.000Z",
    audit_date: "2026-07-17T00:00:00.000Z",
    created_at: "2026-07-10T10:44:00.000Z",
    updated_at: "2026-07-10T10:44:00.000Z",
  },
];

export function formatVnd(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getOrderStatusMeta(status: string) {
  return ORDER_STATUS_META[status as OrderStatus] ?? ORDER_STATUS_META.pending;
}

export function filterOrders(orders: OrderRecord[], filters: OrderFilters) {
  return orders.filter((order) => {
    if (filters.platform && order.platform.code !== filters.platform) {
      return false;
    }

    if (filters.status && order.status !== filters.status) {
      return false;
    }

    if (filters.q) {
      const query = filters.q.toLowerCase();
      const searchable = `${order.order_id_external} ${order.platform.name} ${order.platform.code} ${order.id}`.toLowerCase();
      if (!searchable.includes(query)) {
        return false;
      }
    }

    const dateSource = new Date(order.created_at);

    if (filters.from && dateSource < new Date(filters.from)) {
      return false;
    }

    if (filters.to) {
      const end = new Date(filters.to);
      end.setHours(23, 59, 59, 999);
      if (dateSource > end) {
        return false;
      }
    }

    return true;
  });
}

export function paginateOrders(orders: OrderRecord[], page: number, limit: number) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, limit);
  const start = (safePage - 1) * safeLimit;
  return orders.slice(start, start + safeLimit);
}

export function calculateOrderStats(orders: OrderRecord[]): OrderStats {
  return orders.reduce<OrderStats>(
    (acc, order) => {
      if (order.status === "approved") {
        acc.available += order.user_commission;
        acc.totalEarned += order.user_commission;
        acc.approvedCount += 1;
      }

      if (order.status === "pending") {
        acc.pending += order.user_commission;
        acc.pendingCount += 1;
      }

      if (order.status === "rejected") {
        acc.rejectedCount += 1;
      }

      return acc;
    },
    {
      available: 0,
      pending: 0,
      totalEarned: 0,
      approvedCount: 0,
      pendingCount: 0,
      rejectedCount: 0,
    }
  );
}
