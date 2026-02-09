import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { porudzbinaId, status } = body;

    if (!porudzbinaId || !status) {
      return NextResponse.json(
        { error: "Nedostaju podaci." },
        { status: 400 }
      );
    }

    // Provera da li dostava postoji
    const dostava = await prisma.dostava.findUnique({
      where: { porudzbinaId: Number(porudzbinaId) },
    });

    if (!dostava) {
      return NextResponse.json(
        { error: "Dostava nije pronadjena." },
        { status: 404 }
      );
    }

    // Azuriranje statusa dostave
    const updated = await prisma.dostava.update({
      where: { porudzbinaId: Number(porudzbinaId) },
      data: { status },
    });

    return NextResponse.json({
      message: "Status dostave azuriran.",
      dostava: updated,
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Greska na serveru." },
      { status: 500 }
    );
  }
}
