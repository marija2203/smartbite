"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import SBButton from "../components/SBButton"

type Restoran = {
  id: number
  naziv: string
  opis?: string | null
}

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null
}
//kolokvijum
export default function RestaurantsPage() {
  const router = useRouter()

  const [items, setItems] = useState<Restoran[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function loadRestaurants() {
    try {
      setError("")
      setLoading(true)

      const token = getToken()
      if (!token) {
        router.push("/login")
        return
      }

      const res = await fetch("/api/restaurants", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) throw new Error(data.error || "Greška pri učitavanju restorana.")
      setItems(Array.isArray(data.restorani) ? data.restorani : [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRestaurants()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <div className="sb-bg">
      <div className="sb-container">
        <div className="sb-panel">
          <div className="sb-row">
            <div>
              <div className="sb-h1">Restorani</div>
              <div className="sb-muted">Izaberi restoran i napuni korpu omiljenim zalogajima 🛒✨</div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <SBButton className="sb-btn-soft" onClick={loadRestaurants} disabled={loading}>
                {loading ? "Učitavanje..." : "Osveži"}
              </SBButton>

              <SBButton variant="danger" onClick={logout}>
                Logout
              </SBButton>
            </div>
          </div>

          {error && <div className="sb-alert sb-alert--error">⚠️ {error}</div>}

          <div className="sb-grid">
            {items.length === 0 && !loading && <div className="sb-muted">Nema restorana u bazi.</div>}

            {items.map((r) => (
              <div key={r.id} className="sb-order-card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>{r.naziv}</div>
                    <div className="sb-muted" style={{ marginTop: 8 }}>
  {r.naziv === "Pasta House" && "Mirisna italijanska kuhinja i kremaste paste 🍝"}
  {r.naziv === "Burger Lab" && "Sočni burgeri i hrskavi zalogaji sreće 🍔"}
  {r.naziv === "Sushi Go" && "Sveže rolnice i azijska elegancija 🍣"}
</div>

                  </div>

                  <div style={{ display: "flex", alignItems: "center" }}>
                    <SBButton
                      className="sb-btn-soft"
                      onClick={() => router.push(`/customer?restoranId=${r.id}`)}
                    >
                      Otvori meni
                    </SBButton>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 14 }} className="sb-muted">
            
          </div>
        </div>
      </div>
    </div>
  )
}

