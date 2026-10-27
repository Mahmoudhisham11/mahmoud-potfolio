# Mahmoud — Portfolio (Next.js)

## Run
```bash
npm install
npm run dev      # http://localhost:3000
```

## Edit your info
Everything lives in `lib/data.ts`:
- `CONFIG` — name, email, WhatsApp, stats, skills, socials, journey
- `PROJECTS` — title, description, live link, screenshot (put images in `public/images`)

Texts (English / Arabic) are in `lib/i18n.ts`.

## Contact form → Gmail
Copy `.env.example` to `.env.local` and fill `GMAIL_USER` + `GMAIL_APP_PASSWORD` (a Google App password).
On Vercel add the same two variables. Full steps: `SEO-GUIDE.md`.

## Deploy
Push to GitHub and import it on Vercel — no settings needed.
For a plain static site: `STATIC_EXPORT=1 npm run build` → the `out/` folder (the contact form then uses the FormSubmit fallback).
