"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Porudzbina = {
  id: number
  status: "KREIRANA" | "PRIHVACENA" | "ODBIJENA" | string
  kupac?: string | null
  ukupno?: number
}

export default function RestaurantOrdersPage() {
  const router = useRouter()

  const [orders, setOrders] = useState<Porudzbina[]>([])
  const [loading, setLoading] = useState(false)
  const [changingId, setChangingId] = useState<number | null>(null)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function loadOrders() {
    try {
      setError("")
      setSuccess("")
      setLoading(true)

      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const res = await fetch("/api/orders?view=restaurant", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) throw new Error(data.error || "Greška pri učitavanju porudžbina.")

      setOrders(Array.isArray(data.porudzbine) ? data.porudzbine : [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function badgeClass(status: string) {
    if (status === "KREIRANA") return "sb-badge sb-badge--created"
    if (status === "PRIHVACENA") return "sb-badge sb-badge--accepted"
    if (status === "ODBIJENA") return "sb-badge sb-badge--rejected"
    return "sb-badge"
  }

  async function changeStatus(orderId: number, status: "PRIHVACENA" | "ODBIJENA") {
    try {
      setError("")
      setSuccess("")
      setChangingId(orderId)

      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      // ✅ OVO JE NAJČEŠĆI FORMAT:
      // PUT /api/orders/:id/status  { status: "PRIHVACENA" }
      // Ako ti backend koristi drugi endpoint, reci mi i prilagodim.
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Greška pri promeni statusa porudžbine.")

      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
      setSuccess(`Status porudžbine #${orderId} je promenjen na: ${status}.`)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setChangingId(null)
    }
  }

  function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <div className="sb-bg-restaurant">
      <div className="sb-container">
        <div className="sb-panel">
          <div className="sb-row">
            <div>
              <div className="sb-h1">Porudžbine</div>
              <div className="sb-muted">Pregled i obrada porudžbina restorana 🍽️✨</div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="sb-btn-soft" onClick={loadOrders} disabled={loading}>
                {loading ? "Učitavanje..." : "Osveži"}
              </button>
              <button className="sb-btn-soft" onClick={() => router.push("/customer")}>
                Customer view
              </button>
              <button className="sb-btn-danger" onClick={logout}>
                Logout
              </button>
            </div>
          </div>

          {error && <div className="sb-alert sb-alert--error">⚠️ {error}</div>}
          {success && <div className="sb-alert sb-alert--ok">✅ {success}</div>}

          <div className="sb-grid">
            {orders.length === 0 && !loading && (
              <div className="sb-muted">Nema porudžbina još.</div>
            )}

            {orders.map((o) => (
              <div key={o.id} className="sb-order-card">
                <div className="sb-order-top">
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 16 }}>Porudžbina #{o.id}</div>
                    <div style={{ marginTop: 8 }} className={badgeClass(o.status)}>
                      Status: <span style={{ fontWeight: 900 }}>{o.status}</span>
                    </div>
                    <div style={{ marginTop: 10 }} className="sb-muted">
                      Kupac: {o.kupac ?? "—"}
                    </div>
                    <div className="sb-muted">Ukupno: {o.ukupno ?? "—"} RSD</div>
                  </div>

                  {o.status === "KREIRANA" && (
                    <div className="sb-actions">
                      <button
                        className="sb-btn-soft"
                        onClick={() => changeStatus(o.id, "PRIHVACENA")}
                        disabled={changingId === o.id}
                      >
                        {changingId === o.id ? "..." : "Prihvati"}
                      </button>

                      <button
                        className="sb-btn-danger"
                        onClick={() => changeStatus(o.id, "ODBIJENA")}
                        disabled={changingId === o.id}
                      >
                        {changingId === o.id ? "..." : "Odbij"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 14 }} className="sb-muted">
          Tip: napravi screenshot pre i posle klika “Prihvati/Odbij” (status se menja) ✨
        </div>
      </div>
    </div>
  )
}
