import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, lozinka } = body;

    if (!email || !lozinka) {
      return NextResponse.json(
        { error: "Email i lozinka su obavezni." },
        { status: 400 }
      );
    }

    const user = await prisma.korisnik.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "Pogresan email ili lozinka." },
        { status: 401 }
      );
    }

    if (!user.aktivan) {
      return NextResponse.json(
        { error: "Nalog je deaktiviran." },
        { status: 403 }
      );
    }

    const ok = await bcrypt.compare(lozinka, user.lozinka);
    if (!ok) {
      return NextResponse.json(
        { error: "Pogresan email ili lozinka." },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "JWT_SECRET nije podesen u .env fajlu." },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      { id: user.id, uloga: user.uloga, email: user.email },
      secret,
      { expiresIn: "2h" }
    );

    // Set cookie (simple auth)
    const res = NextResponse.json({
      message: "Prijava uspesna.",
      user: { id: user.id, ime: user.ime, prezime: user.prezime, email: user.email, uloga: user.uloga },
      token,
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 2, // 2h
    });

    return res;
  } catch {
    return NextResponse.json({ error: "Greska na serveru." }, { status: 500 });
  }
}
