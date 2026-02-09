import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET!

type TokenPayload = { userId: number }

export function signToken(userId: number) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

export async function getCurrentUser(req: NextRequest) {
  const token = req.cookies.get("token")?.value
  if (!token) return null

  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload
    return prisma.korisnik.findUnique({
      where: { id: payload.userId },
      select: { id: true, uloga: true, email: true, ime: true, prezime: true },
    })
  } catch {
    return null
  }
}


