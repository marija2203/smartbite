-- CreateEnum
CREATE TYPE "Uloga" AS ENUM ('KUPAC', 'RESTORAN', 'DOSTAVLJAC', 'ADMIN');

-- CreateEnum
CREATE TYPE "StatusPorudzbine" AS ENUM ('KREIRANA', 'PRIHVACENA', 'U_PRIPREMI', 'NA_PUTU', 'DOSTAVLJENA', 'OTKAZANA');

-- CreateEnum
CREATE TYPE "StatusDostave" AS ENUM ('DODELJENA', 'PREUZETA', 'U_TOKU', 'DOSTAVLJENA', 'OTKAZANA');

-- CreateTable
CREATE TABLE "Korisnik" (
    "id" SERIAL NOT NULL,
    "ime" TEXT NOT NULL,
    "prezime" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lozinka" TEXT NOT NULL,
    "uloga" "Uloga" NOT NULL DEFAULT 'KUPAC',
    "aktivan" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Korisnik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Restoran" (
    "id" SERIAL NOT NULL,
    "naziv" TEXT NOT NULL,
    "adresa" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "aktivan" BOOLEAN NOT NULL DEFAULT true,
    "vlasnikId" INTEGER NOT NULL,

    CONSTRAINT "Restoran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StavkaMenija" (
    "id" SERIAL NOT NULL,
    "naziv" TEXT NOT NULL,
    "opis" TEXT NOT NULL,
    "cena" DOUBLE PRECISION NOT NULL,
    "dostupna" BOOLEAN NOT NULL DEFAULT true,
    "restoranId" INTEGER NOT NULL,

    CONSTRAINT "StavkaMenija_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Porudzbina" (
    "id" SERIAL NOT NULL,
    "adresaDostave" TEXT NOT NULL,
    "status" "StatusPorudzbine" NOT NULL DEFAULT 'KREIRANA',
    "ukupnaCena" DOUBLE PRECISION NOT NULL,
    "vremeKreiranja" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kupacId" INTEGER NOT NULL,
    "restoranId" INTEGER NOT NULL,

    CONSTRAINT "Porudzbina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dostava" (
    "id" SERIAL NOT NULL,
    "status" "StatusDostave" NOT NULL DEFAULT 'DODELJENA',
    "procenjenoVreme" INTEGER NOT NULL,
    "porudzbinaId" INTEGER NOT NULL,
    "dostavljacId" INTEGER NOT NULL,

    CONSTRAINT "Dostava_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StavkaPorudzbine" (
    "id" SERIAL NOT NULL,
    "porudzbinaId" INTEGER NOT NULL,
    "stavkaMenijaId" INTEGER NOT NULL,
    "kolicina" INTEGER NOT NULL,
    "jedinicnaCena" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "StavkaPorudzbine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Korisnik_email_key" ON "Korisnik"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Dostava_porudzbinaId_key" ON "Dostava"("porudzbinaId");

-- AddForeignKey
ALTER TABLE "Restoran" ADD CONSTRAINT "Restoran_vlasnikId_fkey" FOREIGN KEY ("vlasnikId") REFERENCES "Korisnik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StavkaMenija" ADD CONSTRAINT "StavkaMenija_restoranId_fkey" FOREIGN KEY ("restoranId") REFERENCES "Restoran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Porudzbina" ADD CONSTRAINT "Porudzbina_kupacId_fkey" FOREIGN KEY ("kupacId") REFERENCES "Korisnik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Porudzbina" ADD CONSTRAINT "Porudzbina_restoranId_fkey" FOREIGN KEY ("restoranId") REFERENCES "Restoran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dostava" ADD CONSTRAINT "Dostava_porudzbinaId_fkey" FOREIGN KEY ("porudzbinaId") REFERENCES "Porudzbina"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dostava" ADD CONSTRAINT "Dostava_dostavljacId_fkey" FOREIGN KEY ("dostavljacId") REFERENCES "Korisnik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StavkaPorudzbine" ADD CONSTRAINT "StavkaPorudzbine_porudzbinaId_fkey" FOREIGN KEY ("porudzbinaId") REFERENCES "Porudzbina"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StavkaPorudzbine" ADD CONSTRAINT "StavkaPorudzbine_stavkaMenijaId_fkey" FOREIGN KEY ("stavkaMenijaId") REFERENCES "StavkaMenija"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
