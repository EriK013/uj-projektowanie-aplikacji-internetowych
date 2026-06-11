import { useState } from "react";

import type { Category } from "../api/categories";
import { createCategory, deleteCategory } from "../api/categories";

type Props = {
  categories: Category[];
  onChanged: () => void;
};

export default function CategoryManager({ categories, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"income" | "expense">("expense");
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Podaj nazwe");
      return;
    }
    try {
      await createCategory(name.trim(), kind);
      setName("");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Blad");
    }
  }

  async function handleDelete(c: Category) {
    setError("");
    try {
      await deleteCategory(c.id);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Blad");
    }
  }

  if (!open) {
    return <button onClick={() => setOpen(true)}>Kategorie</button>;
  }

  return (
    <div className="box">
      <div className="box-head">
        <span className="label">Kategorie</span>
        <button className="small" onClick={() => setOpen(false)}>
          zamknij
        </button>
      </div>

      <ul className="cat-list">
        {categories.length === 0 && <li className="muted">Brak kategorii.</li>}
        {categories.map((c) => (
          <li key={c.id}>
            <span>
              {c.name}{" "}
              <span className="muted">({c.kind === "income" ? "przychod" : "wydatek"})</span>
            </span>
            <button className="small" onClick={() => handleDelete(c)}>
              usun
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="row">
        <input
          placeholder="Nazwa kategorii"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={kind} onChange={(e) => setKind(e.target.value as "income" | "expense")}>
          <option value="expense">wydatek</option>
          <option value="income">przychod</option>
        </select>
        <button type="submit">Dodaj</button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
