# Je Hour — POS & Inventory

Ultra-simple, senior-friendly point-of-sale and inventory app for a home
appliances & kitchen tools shop. React + Tailwind CSS frontend, Google Sheets
(via Google Apps Script) as the database. Dual language: English & Khmer.

## Run it locally

```bash
npm install
npm run dev
```

The app works immediately with no setup — it runs in **offline demo mode**
using sample products stored in your browser (`localStorage`), so you can try
the whole flow before connecting a real Google Sheet.

## Connect it to a Google Sheet (your database)

1. Create a new Google Sheet with two tabs, named exactly:
   - **Products** — header row: `ID | NameEn | NameKm | Category | PriceUsd | Stock | ImageUrl | Sku`
   - **Sales** — header row: `Timestamp | ItemsJson | Total`
2. Fill the **Products** tab with your catalog (or copy the demo data from
   `src/data/seedProducts.js`). `Category` should be one of: `kitchen`,
   `appliances`, `cleaning`, `cooling`.
3. In the Sheet, open **Extensions → Apps Script**.
4. Delete the default `Code.gs` content and paste in the contents of
   [`google-apps-script/Code.gs`](google-apps-script/Code.gs) from this repo.
5. Click **Deploy → New deployment**, choose type **Web app**, and set:
   - **Execute as:** Me
   - **Who has access:** Anyone
6. Copy the deployment's web app URL (ends in `/exec`).
7. Copy `.env.example` to `.env` and paste the URL into `VITE_GAS_URL`:
   ```
   VITE_GAS_URL=https://script.google.com/macros/s/XXXXXXXX/exec
   ```
8. Restart the dev server (`npm run dev`). The amber "offline mode" banner
   should disappear.

If the app ever can't reach the sheet (no internet, quota, etc.), it keeps
working from its local cache and queues the sale to retry — nothing is lost.

## How it works

- **Sell tab** — large product cards with images (or an emoji placeholder if
  no image is set), price shown in both USD and KHR at once. Tap a card to
  add it to the bill. A bottom bar is always visible with the running total
  and a big green **Checkout** button; tapping it opens the cart drawer with
  large `+` / `−` buttons per line item, or checks out immediately.
- **Stock tab** — shows every product with big `+` / `−` stock controls, and
  a form to add a brand-new appliance (name in both languages, category,
  price, starting quantity, optional image URL).
- **Language toggle** — top-right button switches every label and the
  product names shown throughout the app between English and Khmer instantly.

## Project structure

```
src/
  components/       UI components (ProductGrid, CartDrawer, AdminTab, ...)
  i18n/              Language context + English/Khmer translation strings
  lib/               api.js (Google Apps Script client), currency.js
  data/seedProducts.js   Demo catalog used offline / as a starting sheet import
google-apps-script/
  Code.gs            Paste into Apps Script — the entire backend
```

## Customize

- **Exchange rate**: set `VITE_KHR_RATE` in `.env` (defaults to 4100 ៛ per $1).
- **Categories**: edit the `categories` object in
  `src/i18n/translations.js` (both `en` and `km`) and the `CATEGORY_OPTIONS`
  array in `src/components/AdminTab.jsx`.
- **Branding**: the app name/logo letter live in `src/components/Header.jsx`.

## Build for production

```bash
npm run build
```

Outputs a static site to `dist/` — deploy it anywhere that serves static
files (Netlify, Vercel, GitHub Pages, etc.). It talks directly to your Google
Apps Script endpoint from the browser, so no server is needed.
