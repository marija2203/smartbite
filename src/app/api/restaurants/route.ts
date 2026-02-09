import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const sort = url.searchParams.get("sort") || "time" // "time" | "newest"

    const orderBy =
      sort === "newest"
        ? { id: "desc" as const }
        : { prosecnoVremeDostave: "asc" as const }

    const restorani = await prisma.restoran.findMany({
      where: { aktivan: true },
      select: {
        id: true,
        naziv: true,
        adresa: true,
        telefon: true,
        aktivan: true,
        prosecnoVremeDostave: true,
      },
      orderBy,
    })

    return NextResponse.json({ restorani }, { status: 200 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Greska na serveru." }, { status: 500 })
  }
}
