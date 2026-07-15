import { describe, expect, it } from "vitest";
import { DEMO_ORDERS } from "./orders";
import {
  DEMO_BANK_ACCOUNTS,
  DEMO_WITHDRAWALS,
  buildWithdrawalDashboardData,
  calculateWithdrawalSummary,
  getWithdrawalStatusMeta,
  sortWithdrawals,
} from "./withdrawals";

describe("withdrawals helpers", () => {
  it("calculates balance summary from earnings and withdrawals", () => {
    expect(calculateWithdrawalSummary(DEMO_ORDERS, DEMO_WITHDRAWALS)).toEqual({
      availableBalance: 54160,
      totalEarned: 62160,
      pendingBalance: 3000,
      withdrawnBalance: 5000,
      reservedBalance: 8000,
      minWithdrawalAmount: 50000,
      bankCount: 0,
      withdrawalCount: 3,
    });
  });

  it("sorts withdrawals by recency", () => {
    const ordered = sortWithdrawals(DEMO_WITHDRAWALS);

    expect(ordered[0]?.id).toBe("withdrawal-demo-2");
    expect(ordered[1]?.id).toBe("withdrawal-demo-1");
  });

  it("returns withdrawal status metadata", () => {
    expect(getWithdrawalStatusMeta("pending")).toEqual({
      label: "Pending",
      variant: "warning",
    });
    expect(getWithdrawalStatusMeta("completed")).toEqual({
      label: "Completed",
      variant: "success",
    });
  });

  it("builds dashboard data with demo fallbacks", () => {
    const data = buildWithdrawalDashboardData([], [], []);

    expect(data.banks).toEqual(DEMO_BANK_ACCOUNTS);
    expect(data.withdrawals).toHaveLength(3);
    expect(data.summary.availableBalance).toBe(54160);
    expect(data.usingDemoData).toBe(true);
  });
});
