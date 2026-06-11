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
    <main className="auth">
      <div className="logo">
        budzet<span>/</span>app
      </div>
      <form onSubmit={handleSubmit}>
        <h1>Rejestracja</h1>
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
        {error && <p className="error">{error}</p>}
        <button type="submit" className="primary">
          Zarejestruj sie
        </button>
      </form>
      <p>
        Masz juz konto? <Link to="/login">Zaloguj sie</Link>
      </p>
    </main>
  );
}
