"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import SBButton from "../components/SBButton"

type User = {
  id: number
  ime: string
  prezime: string
  email: string
  uloga: string
}

export default function AdminPage() {
  const router = useRouter()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      router.push("/login")
      return
    }

    fetch("/api/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || [])
        setLoading(false)
      })
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
              <div className="sb-h1">Admin Panel</div>
              <div className="sb-muted">
                Upravljanje korisnicima sistema
              </div>
            </div>

            <SBButton variant="danger" onClick={logout}>
              Logout
            </SBButton>
          </div>

          {loading && <div className="sb-muted">Učitavanje korisnika...</div>}

          {!loading && (
            <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
              {users.map((u) => (
                <div key={u.id} className="sb-order-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 20,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 900 }}>
                        {u.ime} {u.prezime}
                      </div>

                      <div className="sb-muted">{u.email}</div>
                    </div>

                    <div
                      style={{
                        fontWeight: 900,
                        padding: "6px 12px",
                        borderRadius: 10,
                        background: "#f3f4f6",
                      }}
                    >
                      {u.uloga}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}