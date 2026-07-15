import { describe, expect, it } from "vitest";
import {
  DEMO_ORDERS,
  calculateOrderStats,
  filterOrders,
  formatVnd,
  getOrderStatusMeta,
  paginateOrders,
} from "./orders";

describe("orders helpers", () => {
  it("returns the correct status metadata", () => {
    expect(getOrderStatusMeta("pending")).toEqual({
      label: "Chờ xử lý",
      variant: "warning",
    });
    expect(getOrderStatusMeta("approved")).toEqual({
      label: "Đã đối soát",
      variant: "success",
    });
    expect(getOrderStatusMeta("rejected")).toEqual({
      label: "Bị hủy",
      variant: "danger",
    });
    expect(getOrderStatusMeta("paid")).toEqual({
      label: "Đã thanh toán",
      variant: "info",
    });
  });

  it("formats VND currency", () => {
    expect(formatVnd(12000)).toContain("12.000");
    expect(formatVnd(12000)).toContain("₫");
  });

  it("filters orders by platform, status, search and date range", () => {
    const filtered = filterOrders(DEMO_ORDERS, {
      platform: "shopee",
      status: "approved",
      q: "001",
      from: "2026-07-14",
      to: "2026-07-15",
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].order_id_external).toContain("001");
  });

  it("paginates orders correctly", () => {
    expect(paginateOrders(DEMO_ORDERS, 1, 2)).toHaveLength(2);
    expect(paginateOrders(DEMO_ORDERS, 2, 2)).toHaveLength(2);
  });

  it("calculates stats from demo orders", () => {
    expect(calculateOrderStats(DEMO_ORDERS)).toEqual({
      available: 62160,
      pending: 29280,
      totalEarned: 62160,
      approvedCount: 2,
      paidCount: 1,
      pendingCount: 2,
      rejectedCount: 1,
    });
  });
});
