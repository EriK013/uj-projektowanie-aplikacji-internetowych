import type { SummaryEnvelope } from "../api/months";
import { pln } from "../format";

type Props = {
  envelope: SummaryEnvelope;
  onEdit: () => void;
  onDelete: () => void;
};

export default function EnvelopeCard({ envelope, onEdit, onDelete }: Props) {
  const dochod = envelope.kind === "income";
  const przekroczone = envelope.pct > 100;
  const szerokosc = Math.min(envelope.pct, 100);
  const zostalo = Number(envelope.remaining);

  const barClass = przekroczone ? (dochod ? "good" : "over") : "";
  const saldo = dochod ? -zostalo : zostalo;
  const zleSaldo = !dochod && zostalo < 0;

  return (
    <div className="env">
      <div className="env-head">
        <strong>{envelope.name}</strong>
        <span>{envelope.pct}%</span>
      </div>

      <div className="bar">
        <div className={barClass} style={{ width: `${szerokosc}%` }} />
      </div>

      <div className="env-foot">
        <span className="kwoty">
          {pln(envelope.spent)} / {pln(envelope.planned)}
        </span>
        <span className={zleSaldo ? "minus" : ""}>
          {saldo > 0 ? "+" : ""}
          {pln(String(saldo))}
        </span>
      </div>

      <div className="env-actions">
        <button type="button" className="small" onClick={onEdit}>
          edytuj
        </button>
        <button type="button" className="small" onClick={onDelete}>
          usun
        </button>
      </div>
    </div>
  );
}
