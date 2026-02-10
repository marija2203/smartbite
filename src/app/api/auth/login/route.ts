import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
export const runtime = "nodejs"


export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const { email, lozinka } = body

    if (!email || !lozinka) {
      return NextResponse.json({ error: "Email i lozinka su obavezni." }, { status: 400 })
    }

    const user = await prisma.korisnik.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ error: "Pogresan email ili lozinka." }, { status: 401 })
    }

    if (!user.aktivan) {
      return NextResponse.json({ error: "Nalog je deaktiviran." }, { status: 403 })
    }

    const ok = await bcrypt.compare(lozinka, user.lozinka)
    if (!ok) {
      return NextResponse.json({ error: "Pogresan email ili lozinka." }, { status: 401 })
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      return NextResponse.json({ error: "JWT_SECRET nije podesen u environment variables." }, { status: 500 })
    }

    const token = jwt.sign(
      { id: user.id, uloga: user.uloga, email: user.email },
      secret,
      { expiresIn: "2h" }
    )

    const res = NextResponse.json(
      {
        message: "Prijava uspesna.",
        user: {
          id: user.id,
          ime: user.ime,
          prezime: user.prezime,
          email: user.email,
          uloga: user.uloga,
        },
        token,
      },
      { status: 200 }
    )

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
    return NextResponse.json({ error: "Greska na serveru." }, { status: 500 })
  }
}
