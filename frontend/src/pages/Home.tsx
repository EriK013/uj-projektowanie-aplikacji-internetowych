import { useEffect, useState } from "react";

import type { Month, MonthSummary } from "../api/months";
import { getSummary, listMonths } from "../api/months";
import { useAuth } from "../auth/AuthContext";
import EnvelopeCard from "../components/EnvelopeCard";
import TotalsBar from "../components/TotalsBar";
import NewMonthForm from "../components/NewMonthForm";

export default function Home() {
  const { user, logout } = useAuth();

  const [months, setMonths] = useState<Month[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listMonths()
      .then((data) => {
        setMonths(data);
        if (data.length > 0) {
          setSelectedId(data[0].id);
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (selectedId === null) {
      return;
    }
    getSummary(selectedId)
      .then(setSummary)
      .catch((err) => setError(err.message));
  }, [selectedId]);

  function handleCreated(month: Month) {
    setMonths((prev) => [month, ...prev]);
    setSelectedId(month.id);
  }

  const income = summary?.envelopes.filter((e) => e.kind === "income") ?? [];
  const expense = summary?.envelopes.filter((e) => e.kind === "expense") ?? [];

  return (
    <main style={{ maxWidth: 900, margin: "2rem auto", padding: "0 1rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>BudzetApp</h1>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={{ color: "#777", fontSize: "0.9rem" }}>{user?.email}</span>
          <button onClick={logout}>Wyloguj</button>
        </div>
      </header>

      {error && <p style={{ color: "#c0392b", marginTop: "1rem" }}>{error}</p>}

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", margin: "1.5rem 0" }}>
        <label>
          Miesiac:{" "}
          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(Number(e.target.value))}
            disabled={months.length === 0}
          >
            {months.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <NewMonthForm onCreated={handleCreated} />
      </div>

      {months.length === 0 && (
        <p style={{ color: "#777" }}>Brak miesiecy. Dodaj pierwszy, aby zaczac planowanie.</p>
      )}

      {summary && (
        <>
          <TotalsBar totals={summary.totals} />

          <div style={{ display: "flex", gap: "1.5rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
            <section style={{ flex: 1, minWidth: 280 }}>
              <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Przychody</h2>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {income.length === 0 && <p style={{ color: "#777" }}>Brak kopert przychodow.</p>}
                {income.map((e) => (
                  <EnvelopeCard key={e.id} envelope={e} />
                ))}
              </div>
            </section>

            <section style={{ flex: 1, minWidth: 280 }}>
              <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Wydatki</h2>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {expense.length === 0 && <p style={{ color: "#777" }}>Brak kopert wydatkow.</p>}
                {expense.map((e) => (
                  <EnvelopeCard key={e.id} envelope={e} />
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </main>
  );
}
