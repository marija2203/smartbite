import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

type TokenUser = { id: number; uloga: string; email: string }

function getUserFromAuth(req: NextRequest): TokenUser | null {
  const auth = req.headers.get("authorization")
  if (!auth?.startsWith("Bearer ")) return null

  const token = auth.slice("Bearer ".length)

  try {
    return jwt.verify(token, JWT_SECRET) as TokenUser
  } catch {
    return null
  }
}

/**
 * GET /api/menu-items?restoranId=1
 * Prikaz stavki menija za određeni restoran
 */
export async function GET(req: NextRequest) {
  const user = getUserFromAuth(req)
  if (!user) {
    return NextResponse.json(
      { error: "Niste prijavljeni (nema Authorization header-a)." },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(req.url)
  const restoranIdStr = searchParams.get("restoranId")
  const restoranId = restoranIdStr ? Number(restoranIdStr) : NaN

  if (!restoranIdStr || Number.isNaN(restoranId)) {
    return NextResponse.json(
      { error: "Nedostaje restoranId u query." },
      { status: 400 }
    )
  }

  // RESTORAN može da vidi samo svoj restoran
  if (user.uloga === "RESTORAN") {
    const restoran = await prisma.restoran.findFirst({
      where: { id: restoranId, vlasnikId: user.id },
      select: { id: true },
    })

    if (!restoran) {
      return NextResponse.json(
        { error: "Nemate pristup ovom restoranu." },
        { status: 403 }
      )
    }
  }

  const stavke = await prisma.stavkaMenija.findMany({
    where: { restoranId },
    orderBy: { id: "desc" },
  })

  return NextResponse.json({ stavke })
}

/**
 * POST /api/menu-items
 * Dodavanje nove stavke menija (samo RESTORAN)
 */
export async function POST(req: NextRequest) {
  const user = getUserFromAuth(req)
  if (!user) {
    return NextResponse.json(
      { error: "Niste prijavljeni (nema Authorization header-a)." },
      { status: 401 }
    )
  }

  if (user.uloga !== "RESTORAN") {
    return NextResponse.json(
      { error: "Samo RESTORAN može dodavati stavke." },
      { status: 403 }
    )
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json(
      { error: "Neispravan JSON." },
      { status: 400 }
    )
  }

  const { naziv, opis, cena, restoranId } = body

  if (!naziv || !cena || !restoranId) {
    return NextResponse.json(
      { error: "Nedostaju obavezni podaci (naziv, cena, restoranId)." },
      { status: 400 }
    )
  }

  const numericRestoranId = Number(restoranId)
  const numericCena = Number(cena)

  if (Number.isNaN(numericRestoranId) || Number.isNaN(numericCena)) {
    return NextResponse.json(
      { error: "Neispravni podaci (restoranId ili cena)." },
      { status: 400 }
    )
  }

  // Provera da restoran pripada ovom korisniku
  const restoran = await prisma.restoran.findFirst({
    where: {
      id: numericRestoranId,
      vlasnikId: user.id,
    },
  })

  if (!restoran) {
    return NextResponse.json(
      { error: "Nemate pristup ovom restoranu." },
      { status: 403 }
    )
  }

  const novaStavka = await prisma.stavkaMenija.create({
    data: {
      naziv,
      opis: opis ?? "",
      cena: numericCena,
      restoranId: numericRestoranId,
      dostupna: true,
    },
  })

  return NextResponse.json(
    { message: "Stavka menija dodata.", stavka: novaStavka },
    { status: 201 }
  )
}
