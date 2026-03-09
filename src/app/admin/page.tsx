"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(user);

    if (parsed.uloga !== "ADMIN") {
      router.push("/restaurants");
    }
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Admin Panel</h1>

      <p>Dobrodošli u administratorski panel.</p>

      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => alert("Ovde može ići upravljanje korisnicima")}
          style={{
            padding: "10px 20px",
            background: "#111827",
            color: "white",
            borderRadius: 8,
          }}
        >
          Upravljanje korisnicima
        </button>
      </div>
    </div>
  );
}