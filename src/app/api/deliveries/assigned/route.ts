import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

function getUserFromAuth(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET nije podesen u .env fajlu.");

  return jwt.verify(token, secret) as { id: number; uloga: string };
}

export async function GET(req: Request) {
  try {
    const user = getUserFromAuth(req);
    if (!user) return NextResponse.json({ error: "Niste prijavljeni." }, { status: 401 });
    if (user.uloga !== "DOSTAVLJAC")
      return NextResponse.json({ error: "Nemate pravo pristupa." }, { status: 403 });

    const dostave = await prisma.dostava.findMany({
      where: { dostavljacId: user.id },
      select: {
        id: true,
        status: true,
        procenjenoVreme: true,
        porudzbina: {
          select: {
            id: true,
            adresaDostave: true,
            status: true,
            ukupnaCena: true,
            vremeKreiranja: true,
            restoran: { select: { id: true, naziv: true, adresa: true } },
            kupac: { select: { id: true, ime: true, prezime: true, email: true } },
          },
        },
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ dostave }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Greska na serveru." }, { status: 500 });
  }
}
