"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

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
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || [])
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: 28, fontWeight: "bold", marginBottom: 20 }}>
        Admin Panel
      </h1>

      <p style={{ marginBottom: 20 }}>
        Dobrodošli u administratorski panel.
      </p>

      {loading && <p>Učitavanje korisnika...</p>}

      {!loading && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Ime</th>
              <th>Email</th>
              <th>Uloga</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.ime} {u.prezime}</td>
                <td>{u.email}</td>
                <td>{u.uloga}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}