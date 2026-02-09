import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { StatusPorudzbine } from "@prisma/client"

type TokenUser = { id: number; uloga: string; email: string }

function getUserFromAuth(req: NextRequest): TokenUser | null {
  const auth = req.headers.get("authorization")
  if (!auth?.startsWith("Bearer ")) return null

  const token = auth.slice("Bearer ".length)
  const secret = process.env.JWT_SECRET
  if (!secret) return null

  try {
    return jwt.verify(token, secret) as TokenUser
  } catch {
    return null
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Ako secret fali u env, nema smisla dalje
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: "Nedostaje JWT_SECRET u environment variables." },
        { status: 500 }
      )
    }

    const user = getUserFromAuth(req)
    if (!user) {
      return NextResponse.json(
        { error: "Niste prijavljeni (nema Authorization header-a / token nevažeći)." },
        { status: 401 }
      )
    }

    if (user.uloga !== "RESTORAN") {
      return NextResponse.json(
        { error: "Samo RESTORAN može da prihvati/odbije porudžbinu." },
        { status: 403 }
      )
    }

    const { id } = await params
    const orderId = Number(id)
    if (!id || Number.isNaN(orderId)) {
      return NextResponse.json({ error: "Neispravan id." }, { status: 400 })
    }

    const body = await req.json().catch(() => ({} as any))
    const akcija = String(body?.akcija ?? "")

    if (akcija !== "PRIHVATI" && akcija !== "ODBIJ") {
      return NextResponse.json(
        { error: 'Pošalji: { akcija: "PRIHVATI" } ili { akcija: "ODBIJ" }.' },
        { status: 400 }
      )
    }

    // Nađi restoran ovog vlasnika
    const restoran = await prisma.restoran.findFirst({
      where: { vlasnikId: user.id },
      select: { id: true },
    })

    if (!restoran) {
      return NextResponse.json(
        { error: "Restoran za ovog korisnika ne postoji." },
        { status: 404 }
      )
    }

    // Nađi porudžbinu i proveri da pripada ovom restoranu
    const order = await prisma.porudzbina.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, restoranId: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Porudžbina ne postoji." }, { status: 404 })
    }

    if (order.restoranId !== restoran.id) {
      return NextResponse.json(
        { error: "Nemate dozvolu za ovu porudžbinu." },
        { status: 403 }
      )
    }

    if (order.status !== StatusPorudzbine.KREIRANA) {
      return NextResponse.json(
        { error: "Porudžbina je već obrađena." },
        { status: 409 }
      )
    }

    const newStatus =
      akcija === "PRIHVATI"
        ? StatusPorudzbine.PRIHVACENA
        : StatusPorudzbine.OTKAZANA

    const updated = await prisma.porudzbina.update({
      where: { id: orderId },
      data: { status: newStatus },
    })

    return NextResponse.json(
      {
        message:
          newStatus === StatusPorudzbine.PRIHVACENA
            ? "Porudžbina prihvaćena."
            : "Porudžbina otkazana.",
        porudzbina: updated,
      },
      { status: 200 }
    )
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Greška na serveru." }, { status: 500 })
  }
}
