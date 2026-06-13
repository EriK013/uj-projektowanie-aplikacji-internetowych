import type { SummaryTotals } from "../api/months";
import { pln } from "../format";

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="value">{pln(value)}</div>
    </div>
  );
}

export default function TotalsBar({ totals }: { totals: SummaryTotals }) {
  return (
    <div className="totals">
      <Box label="Saldo obecne" value={totals.current_balance} />
      <Box label="Saldo przewidywane" value={totals.predicted_balance} />
      <Box label="Wynik miesiąca" value={totals.unallocated} />
    </div>
  );
}
