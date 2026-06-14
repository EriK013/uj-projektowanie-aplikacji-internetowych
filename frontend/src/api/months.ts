import { request } from "./client";

export type Month = {
  id: number;
  period: string;
  label: string;
  opening_balance: string;
};

export type SummaryTotals = {
  planned_income: string;
  spent_income: string;
  planned_expense: string;
  spent_expense: string;
  current_balance: string;
  predicted_balance: string;
  unallocated: string;
};

export type SummaryEnvelope = {
  id: number;
  category_id: number;
  name: string;
  kind: "income" | "expense";
  planned: string;
  spent: string;
  remaining: string;
  pct: number;
};

export type MonthSummary = {
  month: Month;
  totals: SummaryTotals;
  envelopes: SummaryEnvelope[];
};

export function listMonths(): Promise<Month[]> {
  return request<Month[]>("/months");
}

export function createMonth(period: string, openingBalance: string): Promise<Month> {
  return request<Month>("/months", {
    method: "POST",
    body: { period, opening_balance: openingBalance },
  });
}

export function getSummary(monthId: number): Promise<MonthSummary> {
  return request<MonthSummary>(`/months/${monthId}/summary`);
}
