import type { SummaryEnvelope } from "../api/months";
import { pln } from "../format";

type Props = {
  envelope: SummaryEnvelope;
  onEdit: () => void;
  onDelete: () => void;
};

export default function EnvelopeCard({ envelope, onEdit, onDelete }: Props) {
  const przekroczone = envelope.pct > 100;
  const szerokosc = Math.min(envelope.pct, 100);
  const zostalo = Number(envelope.remaining);

  return (
    <div className="env">
      <div className="env-head">
        <strong>{envelope.name}</strong>
        <span>{envelope.pct}%</span>
      </div>

      <div className="bar">
        <div className={przekroczone ? "over" : ""} style={{ width: `${szerokosc}%` }} />
      </div>

      <div className="env-foot">
        <span className="kwoty">
          {pln(envelope.spent)} / {pln(envelope.planned)}
        </span>
        <span className={zostalo < 0 ? "minus" : ""}>
          {zostalo > 0 ? "+" : ""}
          {pln(envelope.remaining)}
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
