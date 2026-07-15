import { DEMO_ORDERS, calculateOrderStats, getOrderStatusMeta, type OrderRecord } from "@/lib/orders";

export const EARNINGS_RANGES = [7, 30, 90] as const;

export type EarningsRange = (typeof EARNINGS_RANGES)[number];

export type EarningsHistoryPoint = {
  date: string;
  label: string;
  value: number;
};

export type EarningsPlatformBreakdown = {
  code: string;
  name: string;
  amount: number;
  orderCount: number;
  share: number;
};

export type EarningsActivityItem = {
  id: string;
  orderId: string;
  platform: OrderRecord["platform"];
  amount: number;
  title: string;
  description: string;
  status: OrderRecord["status"];
  statusLabel: string;
  statusVariant: ReturnType<typeof getOrderStatusMeta>["variant"];
  createdAt: string;
};

export type EarningsSnapshot = {
  orders: OrderRecord[];
  usingDemoData: boolean;
};

function getLocalDayKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join(
    "-"
  );
}

function getDisplayLabel(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function getSeriesStart(days: number) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return start;
}

function getRelevantDate(order: OrderRecord) {
  return order.status === "approved" && order.conversion_time ? new Date(order.conversion_time) : new Date(order.created_at);
}

function getApprovedOrders(orders: OrderRecord[]) {
  return orders.filter((order) => order.status === "approved");
}

export function buildEarningsHistory(orders: OrderRecord[], days: EarningsRange) {
  const approvedOrders = getApprovedOrders(orders);
  const start = getSeriesStart(days);
  const cursor = new Date(start);
  const valuesByDay = new Map<string, number>();

  approvedOrders.forEach((order) => {
    const date = getRelevantDate(order);
    if (Number.isNaN(date.getTime())) {
      return;
    }

    const key = getLocalDayKey(date);
    valuesByDay.set(key, (valuesByDay.get(key) || 0) + order.user_commission);
  });

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(cursor);
    date.setDate(start.getDate() + index);
    const key = getLocalDayKey(date);

    return {
      date: key,
      label: getDisplayLabel(date),
      value: valuesByDay.get(key) || 0,
    };
  });
}

export function buildEarningsHistoryByRange(orders: OrderRecord[]) {
  return EARNINGS_RANGES.reduce<Record<EarningsRange, EarningsHistoryPoint[]>>((acc, range) => {
    acc[range] = buildEarningsHistory(orders, range);
    return acc;
  }, {} as Record<EarningsRange, EarningsHistoryPoint[]>);
}

export function buildPlatformBreakdown(orders: OrderRecord[]) {
  const approvedOrders = getApprovedOrders(orders);
  const totals = new Map<string, { code: string; name: string; amount: number; orderCount: number }>();

  approvedOrders.forEach((order) => {
    const current = totals.get(order.platform.code) || {
      code: order.platform.code,
      name: order.platform.name,
      amount: 0,
      orderCount: 0,
    };

    current.amount += order.user_commission;
    current.orderCount += 1;
    totals.set(order.platform.code, current);
  });

  const totalAmount = Array.from(totals.values()).reduce((sum, item) => sum + item.amount, 0);

  return Array.from(totals.values())
    .map((item) => ({
      ...item,
      share: totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function buildRecentActivity(orders: OrderRecord[], limit = 5): EarningsActivityItem[] {
  return [...orders]
    .sort((a, b) => new Date(getRelevantDate(b)).getTime() - new Date(getRelevantDate(a)).getTime())
    .slice(0, limit)
    .map((order) => {
      const statusMeta = getOrderStatusMeta(order.status);
      const amountLabel = order.status === "approved" ? `+${order.user_commission.toLocaleString("vi-VN")}đ` : `${order.user_commission.toLocaleString("vi-VN")}đ`;
      const descriptionByStatus: Record<OrderRecord["status"], string> = {
        approved: "Đã ghi nhận vào earnings",
        pending: "Đang chờ duyệt từ nền tảng",
        rejected: "Đơn bị từ chối",
      };

      return {
        id: order.id,
        orderId: order.order_id_external,
        platform: order.platform,
        amount: order.user_commission,
        title: `${order.platform.name} · ${amountLabel}`,
        description: `${descriptionByStatus[order.status]} · ${new Date(getRelevantDate(order)).toLocaleString("vi-VN")}`,
        status: order.status,
        statusLabel: statusMeta.label,
        statusVariant: statusMeta.variant,
        createdAt: order.created_at,
      };
    });
}

export function buildEarningsSnapshot(orders: OrderRecord[]): EarningsSnapshot {
  const resolvedOrders = orders.length > 0 ? orders : DEMO_ORDERS;

  return {
    orders: resolvedOrders,
    usingDemoData: orders.length === 0,
  };
}

export function calculateEarningsSummary(orders: OrderRecord[]) {
  return calculateOrderStats(orders);
}
