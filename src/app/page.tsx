"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <main className="sb-bg">
      <div className="sb-card">
        <h1 className="sb-title" data-text="SmartBite">SmartBite</h1>

        <p className="sb-subtitle">🍴✨ SmartBite – klikni. Poruči. Uživaj.</p>

        <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
          <button
            type="button"
            className="sb-btn"
            onClick={() => router.push("/login")}
          >
            Prijavi se
          </button>

          <Link className="sb-btn" href="/register">
            Registruj se
          </Link>
        </div>

        <p style={{ marginTop: 16, fontSize: 12, color: "#6b7280", textAlign: "center" }}>
          Nemaš nalog?🥺 Pridruži se i poruči pametnije uz SmartBite💅🧠
        </p>
      </div>
    </main>
  )
}
