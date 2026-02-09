"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type Stavka = {
  id: number
  naziv: string
  opis: string
  cena: number
  dostupna: boolean
}

type CartItem = {
  stavka: Stavka
  kolicina: number
}

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null
}

export default function CustomerPage() {
  const router = useRouter()
  const [stavke, setStavke] = useState<Stavka[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [adresaDostave, setAdresaDostave] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loadingMenu, setLoadingMenu] = useState(false)
  const [placing, setPlacing] = useState(false)

  const restoranId = 1

  async function loadMenu() {
    try {
      setError("")
      setSuccess("")
      setLoadingMenu(true)

      const res = await fetch(`/api/restaurants/${restoranId}`)
      const data = await res.json().catch(() => ({}))

      if (!res.ok) throw new Error(data.error || "Greška pri učitavanju restorana.")

      setStavke(Array.isArray(data?.restoran?.stavke) ? data.restoran.stavke : [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoadingMenu(false)
    }
  }

  useEffect(() => {
    loadMenu()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function addToCart(stavka: Stavka) {
    setError("")
    setSuccess("")
    setCart((prev) => {
      const idx = prev.findIndex((x) => x.stavka.id === stavka.id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], kolicina: copy[idx].kolicina + 1 }
        return copy
      }
      return [...prev, { stavka, kolicina: 1 }]
    })
  }

  function dec(stavkaId: number) {
    setCart((prev) =>
      prev
        .map((x) => (x.stavka.id === stavkaId ? { ...x, kolicina: x.kolicina - 1 } : x))
        .filter((x) => x.kolicina > 0)
    )
  }

  function inc(stavkaId: number) {
    setCart((prev) =>
      prev.map((x) => (x.stavka.id === stavkaId ? { ...x, kolicina: x.kolicina + 1 } : x))
    )
  }

  function clearCart() {
    setCart([])
  }

  const ukupno = useMemo(() => {
    return cart.reduce((sum, it) => sum + it.stavka.cena * it.kolicina, 0)
  }, [cart])

  async function placeOrder() {
    try {
      setError("")
      setSuccess("")

      if (cart.length === 0) {
        setError("Korpa je prazna.")
        return
      }
      if (!adresaDostave.trim()) {
        setError("Unesi adresu dostave.")
        return
      }

      const token = getToken()
      if (!token) {
        setError("Za poručivanje je potrebna prijava.")
        router.push("/login")
        return
      }

      setPlacing(true)

      const payload = {
        adresaDostave,
        restoranId,
        stavke: cart.map((it) => ({ stavkaMenijaId: it.stavka.id, kolicina: it.kolicina })),
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "Greška pri kreiranju porudžbine.")

      setSuccess(`Porudžbina kreirana! ID: ${data?.porudzbina?.id ?? "-"}`)
      setAdresaDostave("")
      setCart([])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setPlacing(false)
    }
  }

  function logout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <div className="sb-bg-customer">
      <div className="sb-navbar">
        <div>
          <div style={{ fontWeight: 900, fontSize: 18 }}>SmartBite</div>
          <div style={{ fontSize: 12, color: "rgba(42,42,42,0.65)" }}>
            Kupac • Meni restorana #{restoranId}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button className="sb-add-btn" onClick={() => router.push("/restaurant")}>
            Restaurant view
          </button>
          <button className="sb-add-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "26px auto 0" }}>
        {error && (
          <div className="sb-error">
            <b>Greška:</b> {error}
          </div>
        )}
        {success && (
          <div
            style={{
              marginTop: 14,
              padding: "10px 12px",
              borderRadius: 12,
              background: "rgba(230, 255, 244, 0.85)",
              border: "1px solid rgba(140, 255, 210, 0.9)",
              color: "#0b3d2a",
              fontSize: 13,
            }}
          >
            <b>OK:</b> {success}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, marginTop: 16 }}>
          <div className="sb-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>Meni</h2>
              <button className="sb-add-btn" onClick={loadMenu} disabled={loadingMenu}>
                {loadingMenu ? "Učitavanje..." : "Osveži"}
              </button>
            </div>

            <div style={{ marginTop: 14 }}>
              {loadingMenu && <p>Učitavanje menija...</p>}
              {!loadingMenu && stavke.length === 0 && <p>Nema stavki menija.</p>}

              <div style={{ display: "grid", gap: 12 }}>
                {stavke.map((s) => (
                  <div key={s.id} className="sb-menu-item">
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800 }}>
                        {s.naziv}{" "}
                        {!s.dostupna && (
                          <span style={{ fontSize: 12, color: "crimson", fontWeight: 700 }}>
                            (nedostupno)
                          </span>
                        )}
                      </div>
                      <div style={{ color: "rgba(42,42,42,0.65)", fontSize: 13 }}>
                        {s.opis || "—"}
                      </div>
                    </div>

                    <div style={{ width: 120, textAlign: "right", fontWeight: 800 }}>
                      {s.cena} RSD
                    </div>

                    <button
                      className="sb-add-btn"
                      onClick={() => addToCart(s)}
                      disabled={!s.dostupna}
                      title={!s.dostupna ? "Nedostupno" : "Dodaj"}
                      style={{ opacity: s.dostupna ? 1 : 0.55 }}
                    >
                      Dodaj
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="sb-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>Korpa</h2>
              <button className="sb-add-btn" onClick={clearCart} disabled={cart.length === 0}>
                Očisti
              </button>
            </div>

            <div style={{ marginTop: 14 }}>
              {cart.length === 0 ? (
                <p style={{ color: "rgba(42,42,42,0.65)" }}>Dodaj stavke iz menija.</p>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {cart.map((it) => (
                    <div key={it.stavka.id} className="sb-menu-item">
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800 }}>{it.stavka.naziv}</div>
                        <div style={{ fontSize: 12, color: "rgba(42,42,42,0.65)" }}>
                          {it.stavka.cena} RSD
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button
                          className="sb-add-btn"
                          style={{ padding: "8px 12px", borderRadius: 12 }}
                          onClick={() => dec(it.stavka.id)}
                        >
                          −
                        </button>
                        <div style={{ minWidth: 18, textAlign: "center", fontWeight: 900 }}>
                          {it.kolicina}
                        </div>
                        <button
                          className="sb-add-btn"
                          style={{ padding: "8px 12px", borderRadius: 12 }}
                          onClick={() => inc(it.stavka.id)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}

                  <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900 }}>
                      <span>Ukupno</span>
                      <span>{ukupno} RSD</span>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <label style={{ fontSize: 12, color: "rgba(42,42,42,0.65)" }}>
                        Adresa dostave
                      </label>
                      <input
                        className="sb-input"
                        value={adresaDostave}
                        onChange={(e) => setAdresaDostave(e.target.value)}
                        placeholder="npr. Bulevar 1, Beograd"
                        style={{ marginTop: 6 }}
                      />
                    </div>

                    <button
                      className="sb-btn"
                      style={{ width: "100%", marginTop: 10 }}
                      onClick={placeOrder}
                      disabled={placing}
                    >
                      {placing ? "Poručujem..." : "Kreiraj porudžbinu"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

