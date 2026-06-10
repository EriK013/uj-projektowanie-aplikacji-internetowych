import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Blad logowania");
    }
  }

  return (
    <main style={{ maxWidth: 360, margin: "4rem auto", padding: "0 1rem" }}>
      <h1>Logowanie</h1>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem", marginTop: "1rem" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Haslo"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: "#c0392b" }}>{error}</p>}
        <button type="submit">Zaloguj</button>
      </form>
      <p style={{ marginTop: "1rem" }}>
        Nie masz konta? <Link to="/register">Zarejestruj sie</Link>
      </p>
    </main>
  );
}
