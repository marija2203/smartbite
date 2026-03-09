# 🍔 SmartBite

SmartBite je web aplikacija za online poručivanje hrane.  
Omogućava korisnicima da pregledaju restorane i meni, kreiraju porudžbine, dok restorani i dostavljači upravljaju procesom isporuke.

---

## 🚀 Tehnologije

- Next.js 15 (App Router)
- TypeScript
- Prisma ORM
- SQLite baza podataka
- JWT autentifikacija
- REST API arhitektura

---

## 📦 Funkcionalnosti

- Registracija i prijava korisnika
- Role-based pristup (RBAC)
- Upravljanje restoranima i menijem
- Kreiranje porudžbina
- Praćenje statusa porudžbine
- Upravljanje dostavom

---

## 👤 Uloge korisnika

Sistem koristi **Role-Based Access Control**.

Enum `Uloga`:

- `KUPAC` – kreira porudžbine
- `RESTORAN` – upravlja menijem i porudžbinama
- `DOSTAVLJAC` – preuzima i realizuje dostave
- `ADMIN` – administracija sistema

Polje `uloga` u modelu `Korisnik` je tipa `Uloga` sa podrazumevanom vrednošću `KUPAC`.

---

## 📊 Statusi sistema

### StatusPorudzbine

- KREIRANA
- PRIHVACENA
- U_PRIPREMI
- NA_PUTU
- DOSTAVLJENA
- OTKAZANA

### StatusDostave

- DODELJENA
- PREUZETA
- U_TOKU
- DOSTAVLJENA
- OTKAZANA

---

## 🗄 Baza podataka

Projekat koristi **SQLite** bazu (`dev.db`).

Struktura baze je definisana u:


Postoje najmanje **3 migracije** u:


---

## ⚙️ Pokretanje projekta

### 1️⃣ Kloniranje repozitorijuma

```bash
git clone https://github.com/marija2203/smartbite.git
cd smartbite


## Running with Docker
docker compose up --build

## API documentation
http://localhost:3000/api/swagger

## Pokretanje projekta
npm install
npm run dev

## Docker
docker compose up --build

## Swagger
/api/swagger