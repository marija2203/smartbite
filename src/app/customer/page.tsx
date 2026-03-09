"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SBButton from "../components/SBButton";

type MenuItem = {
  id: number;
  naziv: string;
  opis?: string | null;
  cena: number;
};

type CartItem = {
  item: MenuItem;
  qty: number;
};

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null;
}

function CustomerPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const restoranId = searchParams.get("restoranId");

  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [adresaDostave, setAdresaDostave] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const total = useMemo(() => {
    return cart.reduce((sum, c) => sum + c.item.cena * c.qty, 0);
  }, [cart]);

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const found = prev.find((x) => x.item.id === item.id);
      if (found) {
        return prev.map((x) =>
          x.item.id === item.id ? { ...x, qty: x.qty + 1 } : x
        );
      }
      return [...prev, { item, qty: 1 }];
    });
  }

  function clearCart() {
    setCart([]);
    setSuccess("");
    setError("");
  }

  async function loadMenu() {
    try {
      setError("");
      setSuccess("");
      setLoading(true);

      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      if (!restoranId) {
        setError("Nije izabran restoran. Vrati se na listu restorana.");
        return;
      }

      const res = await fetch(`/api/menu-items?restoranId=${restoranId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Greška pri učitavanju menija.");
      }

      setMenu(
        Array.isArray(data.stavke)
          ? data.stavke
          : Array.isArray(data.menu)
          ? data.menu
          : []
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function createOrder() {
    try {
      setError("");
      setSuccess("");

      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      if (!restoranId) {
        setError("Nije izabran restoran.");
        return;
      }

      if (!adresaDostave.trim()) {
        setError("Unesi adresu dostave.");
        return;
      }

      if (cart.length === 0) {
        setError("Korpa je prazna.");
        return;
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restoranId: Number(restoranId),
          adresaDostave: adresaDostave.trim(),
          stavke: cart.map((c) => ({
            stavkaMenijaId: c.item.id,
            kolicina: c.qty,
          })),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Greška pri kreiranju porudžbine.");
      }

      setSuccess(`Porudžbina je kreirana. ID: #${data.id ?? "?"}`);
      setCart([]);
      setAdresaDostave("");
    } catch (e: any) {
      setError(e.message);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    loadMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoranId]);

  return (
    <div className="sb-bg">
      <div className="sb-container">
        <div className="sb-panel">
          <div className="sb-row">
            <div>
              <div className="sb-h1">SmartBite</div>
              <div className="sb-muted">
                Kupac • Meni restorana #{restoranId ?? "—"}
              </div>
            </div>

            <div className="sb-actions">
              <SBButton
                className="sb-btn-soft"
                onClick={loadMenu}
                disabled={loading}
              >
                {loading ? "Učitavanje..." : "Osveži"}
              </SBButton>

              <SBButton
                className="sb-btn-soft"
                onClick={() => router.push("/restaurants")}
              >
                Restorani
              </SBButton>

              <SBButton variant="danger" onClick={logout}>
                Logout
              </SBButton>
            </div>
          </div>

          {error && <div className="sb-alert sb-alert--error">⚠️ {error}</div>}
          {success && <div className="sb-alert sb-alert--ok">✅ {success}</div>}

          <div style={{ marginTop: 16 }}>
            <div className="sb-muted" style={{ marginBottom: 8 }}>
              Adresa dostave
            </div>
            <input
              className="sb-input"
              type="text"
              placeholder="Unesi adresu dostave"
              value={adresaDostave}
              onChange={(e) => setAdresaDostave(e.target.value)}
            />
          </div>

<div className="sb-grid sb-grid-customer">
            <div className="sb-order-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 16 }}>Meni</div>
              </div>

              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {menu.length === 0 && !loading && (
                  <div className="sb-muted">Nema stavki u meniju.</div>
                )}

                {menu.map((m) => (
                  <div key={m.id} className="sb-order-card" style={{ padding: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 900 }}>{m.naziv}</div>
                        <div className="sb-muted">{m.opis ?? "—"}</div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ fontWeight: 900 }}>{m.cena} RSD</div>
                        <SBButton
                          className="sb-btn-soft"
                          onClick={() => addToCart(m)}
                        >
                          Dodaj
                        </SBButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sb-order-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 16 }}>Korpa</div>
                <SBButton className="sb-btn-soft" onClick={clearCart}>
                  Očisti
                </SBButton>
              </div>

              <div className="sb-muted" style={{ marginTop: 10 }}>
                Dodaj stavke iz menija.
              </div>

              <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                {cart.length === 0 && (
                  <div className="sb-muted">Korpa je prazna.</div>
                )}

                {cart.map((c) => (
                  <div key={c.item.id} className="sb-order-card" style={{ padding: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 900 }}>{c.item.naziv}</div>
                        <div className="sb-muted">
                          {c.qty} × {c.item.cena} RSD
                        </div>
                      </div>

                      <div style={{ fontWeight: 900 }}>
                        {c.qty * c.item.cena} RSD
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ fontWeight: 900 }}>Ukupno: {total} RSD</div>
                <SBButton className="sb-btn-soft" onClick={createOrder}>
                  Kreiraj porudžbinu
                </SBButton>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14 }} className="sb-muted"></div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomerPageContent />
    </Suspense>
  );
}