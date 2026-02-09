import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const restorani = await prisma.restoran.findMany({
      where: { aktivan: true },
      select: {
        id: true,
        naziv: true,
        adresa: true,
        telefon: true,
        aktivan: true,
      },
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ restorani }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Greska na serveru." }, { status: 500 });
  }
}
