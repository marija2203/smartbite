"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("token") : null
}

export default function RestaurantPage() {
  const router = useRouter()

  useEffect(() => {
    const token = getToken()
    if (!token) router.push("/login")
  }, [router])

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontWeight: 900 }}>Restaurant panel</h1>
      <p>Ovde ide tvoja restaurant strana (meni, dodavanje stavki, itd.).</p>

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button onClick={() => router.push("/customer")}>Customer view</button>
        <button
          onClick={() => {
            localStorage.removeItem("token")
            router.push("/login")
          }}
        >
          Logout
        </button>
      </div>
    </div>
  )
}
