import { PrismaClient, Uloga } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Brisem stare podatke...")

  // redosled brisanja zbog FK veza
  await prisma.stavkaPorudzbine.deleteMany()
  await prisma.dostava.deleteMany()
  await prisma.porudzbina.deleteMany()
  await prisma.stavkaMenija.deleteMany()
  await prisma.restoran.deleteMany()

  // vlasnik (RESTORAN) - sa hashovanom lozinkom
  const hash = await bcrypt.hash("dummy", 10)

  const vlasnik = await prisma.korisnik.upsert({
    where: { email: "restoran@test.com" },
    update: {
      lozinka: hash, // da uvek bude ispravno za login
      uloga: Uloga.RESTORAN,
      aktivan: true,
    },
    create: {
      ime: "Test",
      prezime: "Restoran",
      email: "restoran@test.com",
      lozinka: hash,
      uloga: Uloga.RESTORAN,
      aktivan: true,
    },
  })

  console.log("Kreiram restorane...")

  const r1 = await prisma.restoran.create({
    data: {
      naziv: "Pasta House",
      adresa: "Bulevar 1, Beograd",
      telefon: "+381 60 111 111",
      aktivan: true,
      prosecnoVremeDostave: 30,
      vlasnikId: vlasnik.id,
      stavke: {
        create: [
          { naziv: "Carbonara", opis: "Pasta, jaja, panceta", cena: 890, dostupna: true },
          { naziv: "Arrabiata", opis: "Ljuto-paradajz sos", cena: 790, dostupna: true },
        ],
      },
    },
  })

  const r2 = await prisma.restoran.create({
    data: {
      naziv: "Burger Lab",
      adresa: "Nemanjina 12, Beograd",
      telefon: "+381 60 222 222",
      aktivan: true,
      prosecnoVremeDostave: 45,
      vlasnikId: vlasnik.id,
      stavke: {
        create: [
          { naziv: "Classic Burger", opis: "Juneće, cheddar", cena: 950, dostupna: true },
          { naziv: "Pomfrit", opis: "Hrskav", cena: 290, dostupna: true },
        ],
      },
    },
  })

  const r3 = await prisma.restoran.create({
    data: {
      naziv: "Sushi Go",
      adresa: "Knez Mihailova 5, Beograd",
      telefon: "+381 60 333 333",
      aktivan: true,
      prosecnoVremeDostave: 60,
      vlasnikId: vlasnik.id,
      stavke: {
        create: [
          { naziv: "California Roll", opis: "Kraba, avokado", cena: 1190, dostupna: true },
          { naziv: "Miso supa", opis: "Tradicionalna", cena: 250, dostupna: true },
        ],
      },
    },
  })

  console.log("Seed OK ✅")
  console.log("Login test user:")
  console.log("  email: restoran@test.com")
  console.log("  lozinka: dummy")
  console.log("Restorani ID-jevi:", r1.id, r2.id, r3.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
