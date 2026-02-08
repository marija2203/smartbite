-- CreateTable
CREATE TABLE "Korisnik" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ime" TEXT NOT NULL,
    "prezime" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lozinka" TEXT NOT NULL,
    "uloga" TEXT NOT NULL,
    "aktivan" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Restoran" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "naziv" TEXT NOT NULL,
    "adresa" TEXT NOT NULL,
    "telefon" TEXT NOT NULL,
    "aktivan" BOOLEAN NOT NULL DEFAULT true,
    "vlasnikId" INTEGER NOT NULL,
    CONSTRAINT "Restoran_vlasnikId_fkey" FOREIGN KEY ("vlasnikId") REFERENCES "Korisnik" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StavkaMenija" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "naziv" TEXT NOT NULL,
    "opis" TEXT NOT NULL,
    "cena" REAL NOT NULL,
    "dostupna" BOOLEAN NOT NULL DEFAULT true,
    "restoranId" INTEGER NOT NULL,
    CONSTRAINT "StavkaMenija_restoranId_fkey" FOREIGN KEY ("restoranId") REFERENCES "Restoran" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Porudzbina" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "adresaDostave" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "ukupnaCena" REAL NOT NULL,
    "vremeKreiranja" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kupacId" INTEGER NOT NULL,
    "restoranId" INTEGER NOT NULL,
    CONSTRAINT "Porudzbina_kupacId_fkey" FOREIGN KEY ("kupacId") REFERENCES "Korisnik" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Porudzbina_restoranId_fkey" FOREIGN KEY ("restoranId") REFERENCES "Restoran" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Dostava" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL,
    "procenjenoVreme" INTEGER NOT NULL,
    "porudzbinaId" INTEGER NOT NULL,
    "dostavljacId" INTEGER NOT NULL,
    CONSTRAINT "Dostava_porudzbinaId_fkey" FOREIGN KEY ("porudzbinaId") REFERENCES "Porudzbina" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Dostava_dostavljacId_fkey" FOREIGN KEY ("dostavljacId") REFERENCES "Korisnik" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Korisnik_email_key" ON "Korisnik"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Dostava_porudzbinaId_key" ON "Dostava"("porudzbinaId");
