import type { SummaryEnvelope } from "../api/months";
import { pln } from "../format";

export default function EnvelopeCard({ envelope }: { envelope: SummaryEnvelope }) {
  const przekroczone = envelope.pct > 100;
  const szerokosc = Math.min(envelope.pct, 100);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e0e0e0",
        borderRadius: 8,
        padding: "0.75rem 1rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong>{envelope.name}</strong>
        <span>{envelope.pct}%</span>
      </div>

      <div
        style={{
          height: 8,
          background: "#eee",
          borderRadius: 4,
          margin: "0.5rem 0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${szerokosc}%`,
            height: "100%",
            background: przekroczone ? "#c0392b" : "#27ae60",
          }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", color: "#555" }}>
        <span>
          {pln(envelope.spent)} / {pln(envelope.planned)}
        </span>
        <span style={{ color: Number(envelope.remaining) < 0 ? "#c0392b" : "#555" }}>
          zostalo {pln(envelope.remaining)}
        </span>
      </div>
    </div>
  );
}
