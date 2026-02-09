"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [lozinka, setLozinka] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lozinka }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.error || "Greška pri prijavi.")
      }

      // Sačuvaj token
      if (data?.token) {
        localStorage.setItem("token", data.token)
      }

      // Redirect po ulozi
      if (data?.user?.uloga === "RESTORAN") {
        router.push("/restaurant")
      } else {
        router.push("/customer")
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="sb-bg-login">
      <div className="sb-card">
        <h1 className="sb-title" data-text="Prijava">
          Prijava
        </h1>

        <p className="sb-subtitle">Uloguj se i nastavi tamo gde si stala 💖</p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginTop: 18 }}>
          <input
            className="sb-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="sb-input"
            type="password"
            placeholder="Lozinka"
            value={lozinka}
            onChange={(e) => setLozinka(e.target.value)}
            required
          />

          <button className="sb-btn" type="submit" disabled={loading}>
            {loading ? "Prijavljujem..." : "Prijavi se"}
          </button>
        </form>

        {error && (
          <div className="sb-error" style={{ marginTop: 10 }}>
            {error}
          </div>
        )}

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

