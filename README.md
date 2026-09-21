# daymark

<p align="center"><strong>a private, deliberate place for your days.</strong></p>

<p align="center">
  <a href="https://daymark-daily.vercel.app">live app</a> ·
  <a href="#getting-started">getting started</a> ·
  <a href="#deployment">deployment</a> ·
  <a href="#contributing">contributing</a>
</p>

Daymark is an open-source daily journal that makes reflection a small, repeatable ritual. Write freely, collect visual moments, and return to a beautifully preserved archive when each day closes.

## what it does

- **one day at a time** — journal days become read-only 24 hours after they end in your chosen time zone.
- **private by default** — Supabase row-level security and private storage scope every journal to its owner.
- **phone photo companion** — scan a short-lived QR code from desktop to add camera or library photos from a phone.
- **a complete daily record** — pair unlimited writing with at least three square photographs.
- **your archive, yours to keep** — export saved entries and photographs as a print-friendly PDF.

## stack

| layer | choice |
| --- | --- |
| application | Next.js App Router, TypeScript, React |
| styling | Tailwind CSS |
| data | Supabase Auth, Postgres, Storage, Realtime |
| export | React PDF |
| hosting | Vercel |

## getting started

### prerequisites

- Node.js 20 or newer
- A Supabase project
- Supabase CLI access, or access to the Supabase SQL editor

### 1. clone and install

```bash
git clone https://github.com/thedhruvhegde/daymark.git
cd daymark
npm install
```

### 2. create the database

Apply the initial schema:

```bash
supabase db push
```

Alternatively, run [`supabase/migrations/20260920000000_daymark.sql`](supabase/migrations/20260920000000_daymark.sql) in the Supabase SQL editor. It creates the journal schema, private image bucket, row-level security policies, lifecycle enforcement, and realtime image publication.

### 3. configure environment variables

Copy the template and fill in values from Supabase Dashboard → Settings → API:

```bash
cp .env.example .env.local
```

| variable | purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for paired uploads and PDF signing |

Never commit `.env.local` or expose the service-role key in a browser bundle.

### 4. configure auth

In Supabase Dashboard → Authentication → URL Configuration:

- Set the Site URL to `http://localhost:3000`.
- Add `http://localhost:3000/auth/callback` as a Redirect URL.
- In Authentication → Providers → Email, enable magic-link sign-in.

### 5. start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## deployment

Daymark runs on Vercel at [daymark-daily.vercel.app](https://daymark-daily.vercel.app).

To deploy your own instance:

1. Import the repository in Vercel.
2. Add the three environment variables above to the Production environment.
3. Add `https://your-domain.example/auth/callback` to Supabase Auth Redirect URLs.
4. Set `https://your-domain.example` as the Supabase Site URL.
5. Disable Vercel Authentication / Deployment Protection if the phone companion should be available on personal devices.

## development

```bash
npm run typecheck
npm run lint
npm run build
```

## security and privacy

- Private storage objects live beneath the authenticated user ID.
- Journal rows and image metadata are protected with row-level security.
- Pairing tokens are opaque, hashed in the database, and expire after ten minutes.
- Writing-window restrictions are evaluated in Postgres, rather than trusted to the client.

See [SECURITY.md](SECURITY.md) for reporting guidance.

## version history

### 0.1.0 — 2026-09-20

- Initial public release.
- Daily journal, calendar, private image storage, phone pairing, and PDF export.

## contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request.

## license

Daymark is released under the [MIT License](LICENSE).
