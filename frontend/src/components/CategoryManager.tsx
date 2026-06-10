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
    <div
      style={{
        background: "#fff",
        border: "1px solid #aaa",
        borderRadius: 8,
        padding: "1rem",
        marginTop: "1rem",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "1.1rem" }}>Kategorie</h2>
        <button onClick={() => setOpen(false)}>Zamknij</button>
      </div>

      <ul style={{ listStyle: "none", padding: 0, margin: "0.75rem 0", display: "grid", gap: "0.25rem" }}>
        {categories.length === 0 && <li style={{ color: "#777" }}>Brak kategorii.</li>}
        {categories.map((c) => (
          <li key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>
              {c.name} <span style={{ color: "#777", fontSize: "0.85rem" }}>({c.kind === "income" ? "przychod" : "wydatek"})</span>
            </span>
            <button onClick={() => handleDelete(c)} style={{ fontSize: "0.8rem", padding: "0.2rem 0.5rem" }}>
              Usun
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
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

      {error && <p style={{ color: "#c0392b", fontSize: "0.85rem", marginTop: "0.5rem" }}>{error}</p>}
    </div>
  );
}
