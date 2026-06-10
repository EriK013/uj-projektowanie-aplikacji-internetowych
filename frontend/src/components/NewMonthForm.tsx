import { useState } from "react";

import type { Month } from "../api/months";
import { createMonth } from "../api/months";

export default function NewMonthForm({ onCreated }: { onCreated: (m: Month) => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [balance, setBalance] = useState("0");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!value) {
      setError("Wybierz miesiac");
      return;
    }
    const [rok, mm] = value.split("-");
    try {
      const month = await createMonth(`${mm}-${rok}`, balance);
      onCreated(month);
      setOpen(false);
      setValue("");
      setBalance("0");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Blad");
    }
  }

  if (!open) {
    return <button onClick={() => setOpen(true)}>+ Nowy miesiac</button>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <input type="month" value={value} onChange={(e) => setValue(e.target.value)} required />
      <input
        type="number"
        step="0.01"
        min="0"
        value={balance}
        onChange={(e) => setBalance(e.target.value)}
        placeholder="Saldo startowe"
        style={{ width: 130 }}
      />
      <button type="submit">Dodaj</button>
      <button type="button" onClick={() => setOpen(false)}>
        Anuluj
      </button>
      {error && <span style={{ color: "#c0392b", fontSize: "0.85rem" }}>{error}</span>}
    </form>
  );
}
