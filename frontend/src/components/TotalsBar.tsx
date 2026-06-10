import type { SummaryTotals } from "../api/months";
import { pln } from "../format";

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e0e0e0",
        borderRadius: 8,
        padding: "0.75rem 1rem",
        flex: 1,
      }}
    >
      <div style={{ fontSize: "0.85rem", color: "#777" }}>{label}</div>
      <div style={{ fontSize: "1.3rem", fontWeight: 600 }}>{pln(value)}</div>
    </div>
  );
}

export default function TotalsBar({ totals }: { totals: SummaryTotals }) {
  return (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
      <Box label="Saldo obecne" value={totals.current_balance} />
      <Box label="Saldo przewidywane" value={totals.predicted_balance} />
      <Box label="Wolne srodki" value={totals.unallocated} />
    </div>
  );
}
