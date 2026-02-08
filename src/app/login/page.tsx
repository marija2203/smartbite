import Link from "next/link"

export default function Home() {
  return (
    <main className="sb-bg">
      <div className="sb-card">
        <h1 className="sb-title">SmartBite</h1>

        <p className="sb-subtitle">
          🍴✨ SmartBite – klikni. Poruči. Uživaj.
        </p>

        <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
          <Link className="sb-btn" href="/login">
            Prijavi se
          </Link>

          <Link className="sb-btn" href="/register">
            Registruj se
          </Link>
        </div>

        <p
          style={{
            marginTop: 16,
            fontSize: 12,
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          Nemaš nalog?🥺 Pridruži se i poruči pametnije uz SmartBite💅🧠
        </p>
      </div>
    </main>
  )
}
