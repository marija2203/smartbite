import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { ime, prezime, email, lozinka, uloga } = body;

    if (!ime || !prezime || !email || !lozinka || !uloga) {
      return NextResponse.json(
        { error: "Nedostaju obavezna polja." },
        { status: 400 }
      );
    }

    const existing = await prisma.korisnik.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Nalog sa ovom email adresom vec postoji." },
        { status: 409 }
      );
    }

    const hash = await bcrypt.hash(lozinka, 10);

    const user = await prisma.korisnik.create({
      data: {
        ime,
        prezime,
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
    });

    return NextResponse.json(
      { message: "Registracija uspesna.", user },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Greska na serveru." }, { status: 500 });
  }
}
