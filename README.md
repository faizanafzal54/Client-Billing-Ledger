# Asghar Ali Chemicals — Client Billing Ledger

Mobile-responsive invoicing and sales ledger for **Asghar Ali Chemicals**. Only two accounts can sign in:

- `asgharumair809@gmail.com`
- `faizanafzal2924@gmail.com`

## Features

- Dashboard with monthly sales, outstanding balances, and top products
- Invoices with two numbers: company-wide `Inv1`, `Inv2` and client-wise `Turk1`, `Dura1`
- Create clients and products on their own pages **or** while making an invoice
- Client ledger (invoices, payments, running balance) and per-client reports
- Printable tax invoice for Asghar Ali Chemicals
- MongoDB Atlas (free shared cluster) so both users share the same data

## MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user (username + password)
3. Network Access → **Allow Access from Anywhere** (`0.0.0.0/0`) so both of you can connect
4. Click **Connect** → **Drivers** and copy the URI
5. Put it in `.env` as `DATABASE_URL`, with database name `asghar-ledger`:

```
DATABASE_URL="mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/asghar-ledger?retryWrites=true&w=majority"
```

## Run it

```bash
npm install
npx prisma db push
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Default password for both users: `AsgharAli@2026`  
Change it after first login in **Settings**, and update `APP_PASSWORD` in `.env` only if you re-seed.

Copy `.env.example` to `.env` if needed. `SESSION_SECRET` should stay a long random string.

## First setup in the app

1. Sign in
2. Open **Settings** and fill address, phone, NTN, STRN, and bank details — they print on invoices
3. TurkPlast and DuraFlow are already seeded as clients, with common chemical products
4. Create an invoice. Numbers are assigned automatically

## Phone access on the same Wi‑Fi

On the computer running the app:

```bash
npm run dev -- --hostname 0.0.0.0
```

Then open `http://YOUR-PC-IP:3000` from a phone.

## Invoice layout

The printed invoice follows a standard Pakistani commercial format (M/S, dual invoice numbers, goods table, amount in words, signature). If you share a photo of your existing sample, the layout can be matched more closely.
