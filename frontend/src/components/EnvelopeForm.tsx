import { useState } from "react";

import type { Category } from "../api/categories";
import { createEnvelope, updateEnvelope } from "../api/envelopes";
import type { SummaryEnvelope } from "../api/months";

type Props = {
  monthId: number;
  categories: Category[];
  editing?: SummaryEnvelope;
  onSaved: () => void;
  onCancel: () => void;
};

export default function EnvelopeForm({ monthId, categories, editing, onSaved, onCancel }: Props) {
  const [categoryId, setCategoryId] = useState<number | "">(
    editing ? editing.id : categories[0]?.id ?? "",
  );
  const [planned, setPlanned] = useState(editing?.planned ?? "0");
  const [spent, setSpent] = useState(editing?.spent ?? "0");
  const [error, setError] = useState("");

  const kind = editing ? editing.kind : categories.find((c) => c.id === categoryId)?.kind;
  const spentLabel = kind === "income" ? "Otrzymano (zl)" : "Wydane (zl)";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (editing) {
        await updateEnvelope(editing.id, planned, spent);
      } else {
        if (categoryId === "") {
          setError("Wybierz kategorie");
          return;
        }
        await createEnvelope(monthId, categoryId, planned, spent);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Blad");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: "#fff",
        border: "1px solid #aaa",
        borderRadius: 8,
        padding: "0.75rem 1rem",
        display: "grid",
        gap: "0.5rem",
      }}
    >
      {editing ? (
        <strong>{editing.name}</strong>
      ) : (
        <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
          {categories.length === 0 && <option value="">Brak wolnych kategorii</option>}
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.kind === "income" ? "przychod" : "wydatek"})
            </option>
          ))}
        </select>
      )}

      <label style={{ fontSize: "0.85rem" }}>
        Plan (zl)
        <input
          type="number"
          step="0.01"
          min="0"
          value={planned}
          onChange={(e) => setPlanned(e.target.value)}
          style={{ width: "100%" }}
        />
      </label>

      <label style={{ fontSize: "0.85rem" }}>
        {spentLabel}
        <input
          type="number"
          step="0.01"
          min="0"
          value={spent}
          onChange={(e) => setSpent(e.target.value)}
          style={{ width: "100%" }}
        />
      </label>

      {error && <span style={{ color: "#c0392b", fontSize: "0.85rem" }}>{error}</span>}

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button type="submit">Zapisz</button>
        <button type="button" onClick={onCancel}>
          Anuluj
        </button>
      </div>
    </form>
  );
}
