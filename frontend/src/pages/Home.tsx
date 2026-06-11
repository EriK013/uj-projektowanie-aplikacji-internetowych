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
    <>
      <header className="topbar">
        <h1 className="logo">
          budzet<span>/</span>app
        </h1>
        <div className="user">
          <span className="muted">{user?.email}</span>
          <button onClick={logout}>wyloguj</button>
        </div>
      </header>

      {summary && <TotalsBar totals={summary.totals} />}

      <main className="content">
        {error && <p className="error" style={{ margin: "1rem 0" }}>{error}</p>}

        <div className="okres">
          <span className="label">Okres</span>
          <div className="tabs">
            {months.map((m) => (
              <button
                key={m.id}
                className={m.id === selectedId ? "active" : ""}
                onClick={() => selectMonth(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
          <NewMonthForm onCreated={handleMonthCreated} />
          <CategoryManager categories={categories} onChanged={refreshCategories} />
          <span className="spacer" />
          {summary && form.mode !== "add" && (
            <button
              className="primary"
              onClick={() => setForm({ mode: "add" })}
              disabled={availableCategories.length === 0}
              title={availableCategories.length === 0 ? "Brak wolnych kategorii" : undefined}
            >
              + nowa koperta
            </button>
          )}
        </div>

        {months.length === 0 && (
          <p className="muted">Brak miesiecy. Dodaj pierwszy, aby zaczac planowanie.</p>
        )}

        {summary && (
          <>
            {form.mode === "add" && (
              <EnvelopeForm
                monthId={summary.month.id}
                categories={availableCategories}
                onSaved={handleSaved}
                onCancel={() => setForm({ mode: "none" })}
              />
            )}

            <div className="panel">
              <section>
                <div className="col-head">
                  <span className="label">Przychody</span>
                  <span className="muted">{sumuj(income)}</span>
                </div>
                {income.length === 0 && <p className="muted">Brak kopert przychodow.</p>}
                {income.map((e) => renderEnvelope(e))}
              </section>

              <section>
                <div className="col-head">
                  <span className="label">Wydatki</span>
                  <span className="muted">{sumuj(expense)}</span>
                </div>
                {expense.length === 0 && <p className="muted">Brak kopert wydatkow.</p>}
                {expense.map((e) => renderEnvelope(e))}
              </section>
            </div>
          </>
        )}
      </main>
    </>
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

function sumuj(list: SummaryEnvelope[]): string {
  const spent = list.reduce((acc, e) => acc + Number(e.spent), 0);
  const planned = list.reduce((acc, e) => acc + Number(e.planned), 0);
  return `${spent.toLocaleString("pl-PL")} / ${planned.toLocaleString("pl-PL")}`;
}
