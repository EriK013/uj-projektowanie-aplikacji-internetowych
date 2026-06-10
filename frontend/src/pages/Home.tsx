import { useAuth } from "../auth/AuthContext";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <main style={{ maxWidth: 600, margin: "2rem auto", padding: "0 1rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>BudzetApp</h1>
        <button onClick={logout}>Wyloguj</button>
      </header>
      <p style={{ marginTop: "1rem" }}>Zalogowano jako {user?.email}</p>
    </main>
  );
}
