-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Dostava" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'DODELJENA',
    "procenjenoVreme" INTEGER NOT NULL,
    "porudzbinaId" INTEGER NOT NULL,
    "dostavljacId" INTEGER NOT NULL,
    CONSTRAINT "Dostava_porudzbinaId_fkey" FOREIGN KEY ("porudzbinaId") REFERENCES "Porudzbina" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Dostava_dostavljacId_fkey" FOREIGN KEY ("dostavljacId") REFERENCES "Korisnik" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Dostava" ("dostavljacId", "id", "porudzbinaId", "procenjenoVreme", "status") SELECT "dostavljacId", "id", "porudzbinaId", "procenjenoVreme", "status" FROM "Dostava";
DROP TABLE "Dostava";
ALTER TABLE "new_Dostava" RENAME TO "Dostava";
CREATE UNIQUE INDEX "Dostava_porudzbinaId_key" ON "Dostava"("porudzbinaId");
CREATE TABLE "new_Korisnik" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ime" TEXT NOT NULL,
    "prezime" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lozinka" TEXT NOT NULL,
    "uloga" TEXT NOT NULL DEFAULT 'KUPAC',
    "aktivan" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Korisnik" ("aktivan", "email", "id", "ime", "lozinka", "prezime", "uloga") SELECT "aktivan", "email", "id", "ime", "lozinka", "prezime", "uloga" FROM "Korisnik";
DROP TABLE "Korisnik";
ALTER TABLE "new_Korisnik" RENAME TO "Korisnik";
CREATE UNIQUE INDEX "Korisnik_email_key" ON "Korisnik"("email");
CREATE TABLE "new_Porudzbina" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "adresaDostave" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'KREIRANA',
    "ukupnaCena" REAL NOT NULL,
    "vremeKreiranja" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kupacId" INTEGER NOT NULL,
    "restoranId" INTEGER NOT NULL,
    CONSTRAINT "Porudzbina_kupacId_fkey" FOREIGN KEY ("kupacId") REFERENCES "Korisnik" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Porudzbina_restoranId_fkey" FOREIGN KEY ("restoranId") REFERENCES "Restoran" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Porudzbina" ("adresaDostave", "id", "kupacId", "restoranId", "status", "ukupnaCena", "vremeKreiranja") SELECT "adresaDostave", "id", "kupacId", "restoranId", "status", "ukupnaCena", "vremeKreiranja" FROM "Porudzbina";
DROP TABLE "Porudzbina";
ALTER TABLE "new_Porudzbina" RENAME TO "Porudzbina";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
