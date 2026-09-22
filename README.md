# FlexJob

A platform for finding and posting flexible, part-time jobs, built with Next.js, Prisma (SQLite), and NextAuth.

## Getting started

```bash
npm install
npx prisma migrate dev   # creates the local SQLite database
npm run db:seed   # loads sample jobs, workers, and employers
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Authentication

Accounts are created and signed into through **Google only** — there's no separate
password. Configuration lives in `.env`:

```
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

To get these: go to the [Google Cloud Console credentials page](https://console.cloud.google.com/apis/credentials),
create an OAuth client ID of type "Web application", and add
`http://localhost:3000/api/auth/callback/google` as an authorized redirect URI
(add your production URL's equivalent when you deploy). Paste the resulting client ID
and secret into `.env`.

**Dev sign-in fallback:** until Google credentials are set, `.env` has
`ENABLE_DEV_LOGIN="true"`, which adds a "sign in with just an email" option on the
login page so you can test the app locally. **Set this to `"false"` (or remove the
provider in `src/auth.ts`) before deploying to production.**

## Roles & the control panel

- **Worker** / **Employer** — chosen by the user the first time they sign in (`/welcome`).
- **Manager** — read-only access to `/admin`: can view all users, jobs, and reviews, but
  every edit/delete button is hidden, and the underlying API routes independently reject
  mutation requests from managers (checked server-side, not just hidden in the UI).
- **Admin** (super admin) — full access to `/admin`: can delete jobs, delete reviews,
  delete user accounts, and toggle an employer's "Verified" badge.

Roles are assigned automatically by email on sign-in via `.env`:

```
ADMIN_EMAILS="you@example.com"
MANAGER_EMAILS="someone-else@example.com"
```

Comma-separate multiple addresses. Anyone not in either list picks Worker or Employer
themselves after their first sign-in.

## Database

Development uses SQLite (`dev.db`, gitignored) through Prisma. The schema is in
`prisma/schema.prisma`. For production scale, swap the datasource to Postgres (or
another Prisma-supported database) and update `DATABASE_URL` — no application code
needs to change beyond the Prisma driver adapter in `src/lib/prisma.ts`.

Useful commands:

```bash
npx prisma studio          # browse/edit the database in a GUI
npx prisma migrate dev     # apply schema changes
npm run db:seed     # re-seed sample data (safe to re-run)
```
