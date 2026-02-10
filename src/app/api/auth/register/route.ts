import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any))

    const ime = (body?.ime ?? "").trim()
    const prezime = (body?.prezime ?? "").trim() // opcionalno
    const email = (body?.email ?? "").trim().toLowerCase()
    const lozinka = (body?.lozinka ?? "").toString()
    const uloga = body?.uloga

    if (!ime || !email || !lozinka || !uloga) {
      return NextResponse.json({ error: "Nedostaju obavezna polja." }, { status: 400 })
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      return NextResponse.json(
        { error: "JWT_SECRET nije podesen u environment variables." },
        { status: 500 }
      )
    }

    const existing = await prisma.korisnik.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Nalog sa ovom email adresom već postoji." },
        { status: 409 }
      )
    }

    const hash = await bcrypt.hash(lozinka, 10)

    const user = await prisma.korisnik.create({
      data: {
        ime,
        prezime, // ostaje "" ako nije poslato
        email,
        lozinka: hash,
        uloga,
        aktivan: true,
      },
      select: {
        id: true,
        ime: true,
        prezime: true,
        email: true,
        uloga: true,
      },
    })

    const token = jwt.sign(
      { id: user.id, uloga: user.uloga, email: user.email },
      secret,
      { expiresIn: "2h" }
    )

    const res = NextResponse.json(
      { message: "Registracija uspešna.", user, token },
      { status: 201 }
    )

    // cookie je ok za Vercel (Node runtime)
    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 2,
    })

    return res
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Greška na serveru." }, { status: 500 })
  }
}
