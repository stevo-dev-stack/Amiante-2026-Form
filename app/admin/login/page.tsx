"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Erreur de connexion");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(160deg, #f0f6f2 0%, #e8edf5 50%, #f0f4f8 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Lato', sans-serif",
    }}>
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 40px rgba(0,0,0,0.08)", padding: "48px 40px", width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: "#1a2e44", margin: "0 0 4px" }}>Administration</h1>
          <p style={{ color: "#6a7f90", fontSize: 13, margin: 0 }}>Campagne Amiante 2026 — SITCOM</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#4a6070", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Identifiant
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #dde3ec", fontSize: 14, color: "#1a2e44", boxSizing: "border-box", fontFamily: "inherit" }}
              placeholder="admin"
              autoComplete="username"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#4a6070", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid #dde3ec", fontSize: 14, color: "#1a2e44", boxSizing: "border-box", fontFamily: "inherit" }}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: "#e04040", fontWeight: 600, marginBottom: 16, textAlign: "center" }}>⚠ {error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "12px", borderRadius: 8, border: "none",
              background: loading ? "#6ab89a" : "linear-gradient(135deg, #0d6e4f, #1aab7c)",
              color: "#fff", fontWeight: 800, fontSize: 15, cursor: loading ? "default" : "pointer",
              boxShadow: "0 4px 14px rgba(13,110,79,0.35)",
            }}
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
