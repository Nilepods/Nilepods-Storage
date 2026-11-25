# Nilepods website

Responsive booking site for Nilepods podcast & video studios. Built with React + Vite, data in Supabase, hosted on Hostinger.

## Run it locally

```
npm install
cp .env.example .env    # then fill in the two Supabase values
npm run dev             # http://localhost:5173  (admin: /admin/)
npm run build           # production build in dist/
npm run preview         # serve the production build at http://localhost:4173
```

## How it is put together

| Path | What it is |
|---|---|
| `design/` | The Claude Design source (Nilepods Website v5) |
| `tools/convert-design.mjs` | Turns the design into React files (`npm run convert`) |
| `src/site/` | The public website: `View.jsx` (markup, generated), `Logic.js` (behaviour, editable), `styles.css` (generated) |
| `src/admin/` | Team dashboard. **Not in the production build yet**: its login is still a prototype |
| `src/lib/supabase.js` | Supabase client (public key only) |
| `public/` | Photos and the Hostinger `.htaccess` |
| `.github/workflows/deploy.yml` | Builds and uploads to Hostinger on every push to `main` |

## Deployment

Every push to `main` runs **Actions → Deploy to Hostinger**: it builds the site and uploads `dist/` to `public_html/` over FTPS.
It needs these repository secrets (Settings → Secrets and variables → Actions):
`HOSTINGER_FTP_SERVER`, `HOSTINGER_FTP_USERNAME`, `HOSTINGER_FTP_PASSWORD`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## Secrets

- `.env` files are git-ignored; only `.env.example` (no values) is committed.
- Only the Supabase **publishable/anon** key is used in the site. The `service_role` / secret key must never be put in this repo or in any `VITE_` variable.
- FTP credentials live only in GitHub secrets.

## Before launch

- Replace `[PHONE NUMBER]`, `[EMAIL]`, `[STUDIO ADDRESS]` on the Contact page.
- Bookings, sign-in, contact and tour forms are still prototype-only (nothing is saved). Connect them to Supabase.
- The checkout collects card details on the page; replace it with a payment provider's hosted checkout (e.g. Paymob) before taking real payments.
- Give the admin dashboard a real Supabase Auth login, then add `admin/index.html` to the build inputs in `vite.config.js`.
