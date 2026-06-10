import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { register } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await register(email, password);
      await login(email, password); 
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Blad rejestracji");
    }
  }

  return (
    <main style={{ maxWidth: 360, margin: "4rem auto", padding: "0 1rem" }}>
      <h1>Rejestracja</h1>
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
          placeholder="Haslo (min. 6 znakow)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        {error && <p style={{ color: "#c0392b" }}>{error}</p>}
        <button type="submit">Zarejestruj sie</button>
      </form>
      <p style={{ marginTop: "1rem" }}>
        Masz juz konto? <Link to="/login">Zaloguj sie</Link>
      </p>
    </main>
  );
}
