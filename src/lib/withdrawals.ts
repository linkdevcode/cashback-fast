import { calculateEarningsSummary } from "@/lib/earnings";
import { DEMO_ORDERS, formatVnd, type OrderRecord } from "@/lib/orders";

export type BankAccount = {
  id: string;
  user_id: string;
  bank_name: string;
  bank_code: string;
  account_number: string;
  account_holder: string;
  is_default: boolean;
  created_at: string;
};

export type WithdrawalStatus = "pending" | "processing" | "completed" | "failed" | "rejected";

export type WithdrawalRecord = {
  id: string;
  user_id: string;
  bank_account_id: string | null;
  amount: number;
  fee: number;
  net_amount: number;
  status: WithdrawalStatus;
  processed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  bank?: BankAccount | null;
};

export type WithdrawalSummary = {
  availableBalance: number;
  totalEarned: number;
  pendingBalance: number;
  withdrawnBalance: number;
  reservedBalance: number;
  minWithdrawalAmount: number;
  bankCount: number;
  withdrawalCount: number;
};

export type WithdrawalDashboardData = {
  orders: OrderRecord[];
  banks: BankAccount[];
  withdrawals: WithdrawalRecord[];
  summary: WithdrawalSummary;
  usingDemoData: boolean;
};

export const MIN_WITHDRAWAL_AMOUNT = 50000;

export const WITHDRAWAL_STATUS_META: Record<
  WithdrawalStatus,
  { label: string; variant: "success" | "warning" | "danger" | "outline" }
> = {
  pending: { label: "Pending", variant: "warning" },
  processing: { label: "Processing", variant: "outline" },
  completed: { label: "Completed", variant: "success" },
  failed: { label: "Failed", variant: "danger" },
  rejected: { label: "Rejected", variant: "danger" },
};

export const DEMO_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: "bank-demo-1",
    user_id: "demo-user",
    bank_name: "Vietcombank",
    bank_code: "VCB",
    account_number: "0123456789",
    account_holder: "Nguyễn Khắc Linh",
    is_default: true,
    created_at: "2026-07-10T09:30:00.000Z",
  },
  {
    id: "bank-demo-2",
    user_id: "demo-user",
    bank_name: "MB Bank",
    bank_code: "MB",
    account_number: "0987654321",
    account_holder: "Nguyễn Khắc Linh",
    is_default: false,
    created_at: "2026-07-12T07:00:00.000Z",
  },
];

export const DEMO_WITHDRAWALS: WithdrawalRecord[] = [
  {
    id: "withdrawal-demo-1",
    user_id: "demo-user",
    bank_account_id: "bank-demo-1",
    amount: 5000,
    fee: 0,
    net_amount: 5000,
    status: "completed",
    processed_at: "2026-07-14T08:30:00.000Z",
    notes: "Đã chuyển khoản thành công",
    created_at: "2026-07-13T09:00:00.000Z",
    updated_at: "2026-07-14T08:30:00.000Z",
  },
  {
    id: "withdrawal-demo-2",
    user_id: "demo-user",
    bank_account_id: "bank-demo-2",
    amount: 3000,
    fee: 0,
    net_amount: 3000,
    status: "pending",
    processed_at: null,
    notes: null,
    created_at: "2026-07-14T10:15:00.000Z",
    updated_at: "2026-07-14T10:15:00.000Z",
  },
  {
    id: "withdrawal-demo-3",
    user_id: "demo-user",
    bank_account_id: "bank-demo-1",
    amount: 4000,
    fee: 0,
    net_amount: 4000,
    status: "failed",
    processed_at: "2026-07-12T12:00:00.000Z",
    notes: "Số tài khoản không hợp lệ",
    created_at: "2026-07-12T11:30:00.000Z",
    updated_at: "2026-07-12T12:00:00.000Z",
  },
];

function isDeductedWithdrawal(status: WithdrawalStatus) {
  return status === "pending" || status === "processing" || status === "completed";
}

export function getWithdrawalStatusMeta(status: string) {
  return WITHDRAWAL_STATUS_META[status as WithdrawalStatus] ?? WITHDRAWAL_STATUS_META.pending;
}

export function sortWithdrawals(withdrawals: WithdrawalRecord[]) {
  return [...withdrawals].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function attachBankToWithdrawals(
  withdrawals: WithdrawalRecord[],
  banks: BankAccount[]
) {
  const bankMap = new Map(banks.map((bank) => [bank.id, bank]));

  return withdrawals.map((withdrawal) => ({
    ...withdrawal,
    bank: withdrawal.bank_account_id ? bankMap.get(withdrawal.bank_account_id) ?? null : null,
  }));
}

export function calculateWithdrawalSummary(
  orders: OrderRecord[],
  withdrawals: WithdrawalRecord[]
): WithdrawalSummary {
  const earnings = calculateEarningsSummary(orders);
  const reservedBalance = withdrawals
    .filter((withdrawal) => isDeductedWithdrawal(withdrawal.status))
    .reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
  const pendingBalance = withdrawals
    .filter((withdrawal) => withdrawal.status === "pending" || withdrawal.status === "processing")
    .reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
  const withdrawnBalance = withdrawals
    .filter((withdrawal) => withdrawal.status === "completed")
    .reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

  return {
    availableBalance: Math.max(0, earnings.available - reservedBalance),
    totalEarned: earnings.available,
    pendingBalance,
    withdrawnBalance,
    reservedBalance,
    minWithdrawalAmount: MIN_WITHDRAWAL_AMOUNT,
    bankCount: 0,
    withdrawalCount: withdrawals.length,
  };
}

export function formatWithdrawalStatusLabel(status: string) {
  return getWithdrawalStatusMeta(status).label;
}

export function formatWithdrawalAmount(amount: number) {
  return formatVnd(amount);
}

export function buildWithdrawalDashboardData(
  orders: OrderRecord[],
  banks: BankAccount[],
  withdrawals: WithdrawalRecord[]
): WithdrawalDashboardData {
  const sourceOrders = orders.length > 0 ? orders : DEMO_ORDERS;
  const sourceBanks = banks.length > 0 ? banks : DEMO_BANK_ACCOUNTS;
  const sourceWithdrawals = withdrawals.length > 0 ? withdrawals : DEMO_WITHDRAWALS;
  const summary = calculateWithdrawalSummary(sourceOrders, sourceWithdrawals);

  return {
    orders: sourceOrders,
    banks: sourceBanks,
    withdrawals: attachBankToWithdrawals(sortWithdrawals(sourceWithdrawals), sourceBanks),
    summary: {
      ...summary,
      bankCount: sourceBanks.length,
    },
    usingDemoData: orders.length === 0 || banks.length === 0 || withdrawals.length === 0,
  };
}

export function isWithdrawalAmountValid(amount: number, availableBalance: number) {
  return amount >= MIN_WITHDRAWAL_AMOUNT && amount <= availableBalance;
}

export function normalizeWithdrawalAmount(amount: number) {
  return Math.round(amount);
}

