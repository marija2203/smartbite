import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const restoranId = Number(id);

    if (!restoranId) {
      return NextResponse.json({ error: "Neispravan ID restorana." }, { status: 400 });
    }

    const restoran = await prisma.restoran.findUnique({
      where: { id: restoranId },
      select: {
        id: true,
        naziv: true,
        adresa: true,
        telefon: true,
        aktivan: true,
        stavke: {
          where: { dostupna: true },
          select: { id: true, naziv: true, opis: true, cena: true, dostupna: true },
          orderBy: { id: "desc" },
        },
      },
    });

    if (!restoran) {
      return NextResponse.json({ error: "Restoran nije pronadjen." }, { status: 404 });
    }

    return NextResponse.json({ restoran }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Greska na serveru." }, { status: 500 });
  }
}
