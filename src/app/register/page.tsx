"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type RegisterResponse = {
  token?: string
  user?: { uloga?: "RESTORAN" | "KUPAC" | string }
  error?: string
}

export default function RegisterPage() {
  const router = useRouter()

  const [ime, setIme] = useState("")
  const [email, setEmail] = useState("")
  const [lozinka, setLozinka] = useState("")
  const [uloga, setUloga] = useState<"KUPAC" | "RESTORAN">("KUPAC")

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ime, email, lozinka, uloga }),
      })

      const data: RegisterResponse = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.error || "Greška pri registraciji")
      }

      // ako backend vraća token odmah – super
      if (data?.token) {
        localStorage.setItem("token", data.token)
      }

      // redirect po ulozi (ako user postoji), u suprotnom na login
      const role = data?.user?.uloga || uloga
      if (role === "RESTORAN") router.push("/restaurant")
      else if (role === "KUPAC") router.push("/customer")
      else router.push("/login")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Nepoznata greška"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="sb-bg-register">
      <div className="sb-card">
        <h1 className="sb-title" data-text="Registracija">Registracija</h1>
        <p className="sb-subtitle">Tvoj omiljeni obrok je samo klik daleko🫧💙</p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Ime
          </label>
          <input
            className="sb-input"
            placeholder="Unesi ime"
            value={ime}
            onChange={(e) => setIme(e.target.value)}
            required
          />

          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Email
          </label>
          <input
            className="sb-input"
            placeholder="npr. marija@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            inputMode="email"
            autoComplete="email"
            required
          />

          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Lozinka
          </label>
          <input
            className="sb-input"
            type="password"
            placeholder="Unesi lozinku"
            value={lozinka}
            onChange={(e) => setLozinka(e.target.value)}
            autoComplete="new-password"
            required
          />

          <label style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>
            Uloga
          </label>
          <select
            className="sb-input"
            value={uloga}
            onChange={(e) => setUloga(e.target.value as "KUPAC" | "RESTORAN")}
            style={{ marginBottom: 16 }}
          >
            <option value="KUPAC">Kupac</option>
            <option value="RESTORAN">Restoran</option>
          </select>

          <button className="sb-btn" type="submit" disabled={loading}>
            {loading ? "Kreiram nalog..." : "Registruj se"}
          </button>

          {error && <div className="sb-error">{error}</div>}

          <p style={{ marginTop: 14, fontSize: 13, color: "#6b7280", textAlign: "center" }}>
            Već imaš nalog?{" "}
            <a href="/login" style={{ fontWeight: 800, textDecoration: "none" }}>
              Prijavi se ✨
            </a>
          </p>
        </form>
      </div>
    </main>
  )
}
