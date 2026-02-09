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
 * POST /api/orders
 * Body:
 * {
 *   restoranId: number,
 *   adresaDostave: string,
 *   stavke: Array<{ stavkaMenijaId: number, kolicina: number }>,
 *   dostavljacId?: number
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromAuth(req)
    if (!user) {
      return NextResponse.json(
        { error: "Niste prijavljeni (nema Authorization header-a)." },
        { status: 401 }
      )
    }
    if (user.uloga !== "KUPAC") {
      return NextResponse.json({ error: "Samo KUPAC može da kreira porudžbinu." }, { status: 403 })
    }

    const body = await req.json()

    const kupacId = user.id // ✅ iz tokena
    const restoranId = Number(body.restoranId)
    const adresaDostave = String(body.adresaDostave ?? "")
    const stavke = Array.isArray(body.stavke) ? body.stavke : []

    if (!restoranId || !adresaDostave.trim()) {
      return NextResponse.json(
        { error: "Nedostaju obavezna polja: restoranId, adresaDostave." },
        { status: 400 }
      )
    }

    if (stavke.length === 0) {
      return NextResponse.json(
        { error: "Porudzbina mora da sadrzi bar jednu stavku." },
        { status: 400 }
      )
    }

    for (const s of stavke) {
      const id = Number(s?.stavkaMenijaId)
      const kolicina = Number(s?.kolicina)
      if (!id || !Number.isFinite(kolicina) || kolicina <= 0) {
        return NextResponse.json(
          { error: "Neispravne stavke. Svaka stavka mora imati stavkaMenijaId i kolicina > 0." },
          { status: 400 }
        )
      }
    }

    // Spoji duplikate iste stavke (ako slučajno dođu)
    const merged = new Map<number, number>()
    for (const s of stavke) {
      const id = Number(s.stavkaMenijaId)
      const k = Number(s.kolicina)
      merged.set(id, (merged.get(id) ?? 0) + k)
    }

    const stavkaIds = [...merged.keys()]

    const meniStavke = await prisma.stavkaMenija.findMany({
      where: {
        id: { in: stavkaIds },
        restoranId,
      },
      select: { id: true, cena: true, dostupna: true, naziv: true },
    })

    if (meniStavke.length !== stavkaIds.length) {
      return NextResponse.json(
        { error: "Neke stavke menija ne postoje ili ne pripadaju izabranom restoranu." },
        { status: 400 }
      )
    }

    const nedostupne = meniStavke.filter((m) => !m.dostupna)
    if (nedostupne.length > 0) {
      return NextResponse.json(
        { error: `Neke stavke nisu dostupne: ${nedostupne.map((x) => x.naziv).join(", ")}` },
        { status: 400 }
      )
    }

    const cenaMapa = new Map<number, number>()
    meniStavke.forEach((m) => cenaMapa.set(m.id, m.cena))

    let ukupnaCena = 0
    const itemsToCreate = stavkaIds.map((stavkaMenijaId) => {
      const kolicina = merged.get(stavkaMenijaId) ?? 0
      const jedinicnaCena = cenaMapa.get(stavkaMenijaId) ?? 0
      ukupnaCena += jedinicnaCena * kolicina
      return { stavkaMenijaId, kolicina, jedinicnaCena }
    })

    const dostavljacId = Number(body.dostavljacId) || null

    const rezultat = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.porudzbina.create({
        data: {
          kupacId,
          restoranId,
          adresaDostave,
          status: "KREIRANA",
          ukupnaCena,
        },
      })

      await tx.stavkaPorudzbine.createMany({
        data: itemsToCreate.map((it) => ({
          porudzbinaId: createdOrder.id,
          stavkaMenijaId: it.stavkaMenijaId,
          kolicina: it.kolicina,
          jedinicnaCena: it.jedinicnaCena,
        })),
      })

      if (dostavljacId) {
        await tx.dostava.create({
          data: {
            porudzbinaId: createdOrder.id,
            dostavljacId,
            status: "DODELJENA",
            procenjenoVreme: 30,
          },
        })
      }

      const fullOrder = await tx.porudzbina.findUnique({
        where: { id: createdOrder.id },
        include: {
          restoran: true,
          kupac: true,
          dostava: true,
          stavke: { include: { stavkaMenija: true } },
        },
      })

      return fullOrder
    })

    return NextResponse.json({ message: "Porudzbina kreirana.", porudzbina: rezultat }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Greska na serveru." }, { status: 500 })
  }
}

/**
 * GET /api/orders
 * - KUPAC: svoje porudžbine
 * - RESTORAN: porudžbine svog restorana
 */
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromAuth(req)
    if (!user) {
      return NextResponse.json(
        { error: "Niste prijavljeni (nema Authorization header-a)." },
        { status: 401 }
      )
    }

    // KUPAC vidi samo svoje
    if (user.uloga === "KUPAC") {
      const porudzbine = await prisma.porudzbina.findMany({
        where: { kupacId: user.id },
        orderBy: { vremeKreiranja: "desc" },
        include: {
          restoran: true,
          dostava: true,
          stavke: { include: { stavkaMenija: true } },
        },
      })
      return NextResponse.json({ porudzbine }, { status: 200 })
    }

    // RESTORAN vidi porudžbine svog restorana
    if (user.uloga === "RESTORAN") {
      const restoran = await prisma.restoran.findFirst({
        where: { vlasnikId: user.id },
        select: { id: true },
      })
      if (!restoran) return NextResponse.json({ porudzbine: [] }, { status: 200 })

      const porudzbine = await prisma.porudzbina.findMany({
        where: { restoranId: restoran.id },
        orderBy: { vremeKreiranja: "desc" },
        include: {
          kupac: true,
          dostava: true,
          stavke: { include: { stavkaMenija: true } },
        },
      })
      return NextResponse.json({ porudzbine }, { status: 200 })
    }

    // Ostale uloge: zabrani (ili kasnije ADMIN)
    return NextResponse.json({ error: "Nemate dozvolu." }, { status: 403 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Greska na serveru." }, { status: 500 })
  }
}

