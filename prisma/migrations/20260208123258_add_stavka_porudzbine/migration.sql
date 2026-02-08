-- CreateTable
CREATE TABLE "StavkaPorudzbine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "porudzbinaId" INTEGER NOT NULL,
    "stavkaMenijaId" INTEGER NOT NULL,
    "kolicina" INTEGER NOT NULL,
    "jedinicnaCena" REAL NOT NULL,
    CONSTRAINT "StavkaPorudzbine_porudzbinaId_fkey" FOREIGN KEY ("porudzbinaId") REFERENCES "Porudzbina" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StavkaPorudzbine_stavkaMenijaId_fkey" FOREIGN KEY ("stavkaMenijaId") REFERENCES "StavkaMenija" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
