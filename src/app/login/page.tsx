"use client"

import Link from "next/link"

export default function LoginPage() {
  return (
    <main className="sb-bg-login">
      <div className="sb-card">
        <h1 className="sb-title" data-text="Prijava">
          Prijava
        </h1>

        <p className="sb-subtitle">Uloguj se i nastavi tamo gde si stala 💖</p>

        <form style={{ display: "grid", gap: 12, marginTop: 18 }}>
          <input className="sb-input" type="email" placeholder="Email" />
          <input className="sb-input" type="password" placeholder="Lozinka" />

          <button className="sb-btn" type="submit">
            Prijavi se
          </button>
        </form>

        <p style={{ marginTop: 14, fontSize: 13, textAlign: "center", color: "#6b7280" }}>
          Nemaš nalog? 💞{" "}
          <Link href="/register" style={{ fontWeight: 800, color: "#111827" }}>
            Registruj se
          </Link>
        </p>
      </div>
    </main>
  )
}

