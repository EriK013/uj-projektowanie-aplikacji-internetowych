import { useEffect, useState } from "react";

import type { Category } from "../api/categories";
import { listCategories } from "../api/categories";
import { deleteEnvelope } from "../api/envelopes";
import type { Month, MonthSummary, SummaryEnvelope } from "../api/months";
import { getSummary, listMonths } from "../api/months";
import { useAuth } from "../auth/AuthContext";
import CategoryManager from "../components/CategoryManager";
import EnvelopeCard from "../components/EnvelopeCard";
import EnvelopeForm from "../components/EnvelopeForm";
import NewMonthForm from "../components/NewMonthForm";
import TotalsBar from "../components/TotalsBar";

type FormState = { mode: "none" } | { mode: "add" } | { mode: "edit"; envelope: SummaryEnvelope };

export default function Home() {
  const { user, logout } = useAuth();

  const [months, setMonths] = useState<Month[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<FormState>({ mode: "none" });
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
    listCategories()
      .then(setCategories)
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

  function refreshSummary() {
    if (selectedId === null) return;
    getSummary(selectedId).then(setSummary).catch((err) => setError(err.message));
  }

  function refreshCategories() {
    listCategories().then(setCategories).catch((err) => setError(err.message));
  }

  function selectMonth(id: number) {
    setSummary(null);
    setForm({ mode: "none" });
    setSelectedId(id);
  }

  function handleMonthCreated(month: Month) {
    setMonths((prev) => [month, ...prev]);
    selectMonth(month.id);
  }

  async function handleDelete(envelope: SummaryEnvelope) {
    if (!confirm(`Usunac koperte "${envelope.name}"?`)) return;
    try {
      await deleteEnvelope(envelope.id);
      refreshSummary();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Blad");
    }
  }

  function handleSaved() {
    setForm({ mode: "none" });
    refreshSummary();
  }

  const income = summary?.envelopes.filter((e) => e.kind === "income") ?? [];
  const expense = summary?.envelopes.filter((e) => e.kind === "expense") ?? [];

  const usedCategoryNames = new Set(summary?.envelopes.map((e) => e.name) ?? []);
  const availableCategories = categories.filter((c) => !usedCategoryNames.has(c.name));

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
            onChange={(e) => selectMonth(Number(e.target.value))}
            disabled={months.length === 0}
          >
            {months.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <NewMonthForm onCreated={handleMonthCreated} />
        <CategoryManager categories={categories} onChanged={refreshCategories} />
      </div>

      {months.length === 0 && (
        <p style={{ color: "#777" }}>Brak miesiecy. Dodaj pierwszy, aby zaczac planowanie.</p>
      )}

      {summary && (
        <>
          <TotalsBar totals={summary.totals} />

          <div style={{ marginTop: "1.5rem" }}>
            {form.mode === "add" ? (
              <EnvelopeForm
                monthId={summary.month.id}
                categories={availableCategories}
                onSaved={handleSaved}
                onCancel={() => setForm({ mode: "none" })}
              />
            ) : (
              <button onClick={() => setForm({ mode: "add" })} disabled={availableCategories.length === 0}>
                + Nowa koperta
              </button>
            )}
            {form.mode === "add" && availableCategories.length === 0 && (
              <p style={{ color: "#777", fontSize: "0.85rem" }}>Brak wolnych kategorii.</p>
            )}
          </div>

          <div style={{ display: "flex", gap: "1.5rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
            <section style={{ flex: 1, minWidth: 280 }}>
              <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Przychody</h2>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {income.length === 0 && <p style={{ color: "#777" }}>Brak kopert przychodow.</p>}
                {income.map((e) => renderEnvelope(e))}
              </div>
            </section>

            <section style={{ flex: 1, minWidth: 280 }}>
              <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Wydatki</h2>
              <div style={{ display: "grid", gap: "0.5rem" }}>
                {expense.length === 0 && <p style={{ color: "#777" }}>Brak kopert wydatkow.</p>}
                {expense.map((e) => renderEnvelope(e))}
              </div>
            </section>
          </div>
        </>
      )}
    </main>
  );

  function renderEnvelope(e: SummaryEnvelope) {
    if (form.mode === "edit" && form.envelope.id === e.id) {
      return (
        <EnvelopeForm
          key={e.id}
          monthId={summary!.month.id}
          categories={categories}
          editing={e}
          onSaved={handleSaved}
          onCancel={() => setForm({ mode: "none" })}
        />
      );
    }
    return (
      <EnvelopeCard
        key={e.id}
        envelope={e}
        onEdit={() => setForm({ mode: "edit", envelope: e })}
        onDelete={() => handleDelete(e)}
      />
    );
  }
}
