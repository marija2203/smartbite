// src/app/api/menu-items/[id]/route.ts
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

async function assertOwnerOfMenuItem(userId: number, itemId: number) {
  const item = await prisma.stavkaMenija.findUnique({
    where: { id: itemId },
    select: {
      id: true,
      restoran: { select: { vlasnikId: true } },
    },
  })

  if (!item) return { ok: false as const, status: 404, error: "Stavka nije pronađena." }
  if (item.restoran.vlasnikId !== userId) {
    return { ok: false as const, status: 403, error: "Nemate pristup ovoj stavci." }
  }

  return { ok: true as const }
}

function parseNumericId(id: string | undefined) {
  const numericId = Number(id)
  if (!id || Number.isNaN(numericId)) {
    return { ok: false as const, status: 400, error: "Neispravan id." }
  }
  return { ok: true as const, id: numericId }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromAuth(req)
  if (!user) {
    return NextResponse.json(
      { error: "Niste prijavljeni (nema Authorization header-a)." },
      { status: 401 }
    )
  }
  if (user.uloga !== "RESTORAN") {
    return NextResponse.json({ error: "Nemate dozvolu." }, { status: 403 })
  }

  const { id: idStr } = await params
  const idRes = parseNumericId(idStr)
  if (!idRes.ok) {
    return NextResponse.json({ error: idRes.error }, { status: idRes.status })
  }
  const id = idRes.id

  const ownership = await assertOwnerOfMenuItem(user.id, id)
  if (!ownership.ok) {
    return NextResponse.json({ error: ownership.error }, { status: ownership.status })
  }

  const body = await req.json()

  const hasAny =
    body.naziv !== undefined ||
    body.opis !== undefined ||
    body.cena !== undefined ||
    body.dostupna !== undefined

  if (!hasAny) {
    return NextResponse.json({ error: "Nema podataka za izmenu." }, { status: 400 })
  }

  const updated = await prisma.stavkaMenija.update({
    where: { id },
    data: {
      naziv: body.naziv,
      opis: body.opis,
      cena: body.cena !== undefined ? Number(body.cena) : undefined,
      dostupna: body.dostupna,
    },
  })

  return NextResponse.json({ message: "Stavka menija izmenjena.", stavka: updated })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUserFromAuth(req)
  if (!user) {
    return NextResponse.json(
      { error: "Niste prijavljeni (nema Authorization header-a)." },
      { status: 401 }
    )
  }
  if (user.uloga !== "RESTORAN") {
    return NextResponse.json({ error: "Nemate dozvolu." }, { status: 403 })
  }

  const { id: idStr } = await params
  const idRes = parseNumericId(idStr)
  if (!idRes.ok) {
    return NextResponse.json({ error: idRes.error }, { status: idRes.status })
  }
  const id = idRes.id

  const ownership = await assertOwnerOfMenuItem(user.id, id)
  if (!ownership.ok) {
    return NextResponse.json({ error: ownership.error }, { status: ownership.status })
  }

  await prisma.stavkaMenija.delete({ where: { id } })
  return NextResponse.json({ message: "Stavka menija obrisana." })
}
