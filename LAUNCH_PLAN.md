# FlexJob — Launch Plan

Status snapshot: the core product works end-to-end (search + filters, availability
planner, Google/dev sign-in, worker & employer dashboards, reviews & ratings, admin
control panel with role-based permissions) on a local SQLite database. This document
tracks what's left before real users can sign up, and what to layer on after that.

Check items off as you go — nothing here has to happen in one sitting.

---

## Phase 1 — Required before going public

These are the items that would actively break things or create a security problem
if skipped.

- [ ] **Set up real Google OAuth credentials** and add them to `.env`
      (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`). Steps are in `README.md`.
- [ ] **Disable dev sign-in**: set `ENABLE_DEV_LOGIN="false"` in `.env` once Google
      login works — right now anyone can sign in as anyone by typing an email.
- [ ] **Move off SQLite to a hosted database** (Postgres is the easiest swap —
      Neon, Supabase, or Railway all have a free tier). SQLite is a single file on
      one machine; it won't survive most hosting platforms' deploys and can't handle
      concurrent writes at real scale.
      - Update `datasource` in `prisma/schema.prisma` from `sqlite` to `postgresql`.
      - Update `DATABASE_URL` in `.env` to the new connection string.
      - Swap the driver adapter in `src/lib/prisma.ts` (Postgres doesn't need
        `@prisma/adapter-better-sqlite3` — a plain `new PrismaClient()` works, or use
        `@prisma/adapter-pg` if you want the same adapter pattern).
      - Run `npx prisma migrate deploy` against the new database.
- [ ] **Generate a fresh `AUTH_SECRET`** for production (don't reuse the one
      committed during development) — `openssl rand -base64 32`.
- [ ] **Set `ADMIN_EMAILS` / `MANAGER_EMAILS`** to the real people who should hold
      those roles in production (currently seeded with your own email as admin).
- [ ] **Pick a hosting platform** and deploy (Vercel is the simplest fit for
      Next.js). Add all `.env` values as environment variables in the host's
      dashboard — never commit `.env` to git.
- [ ] **Point the Google OAuth redirect URI** at the production domain too
      (`https://yourdomain.com/api/auth/callback/google`), in addition to the
      localhost one.
- [ ] **Remove or re-seed demo data** — decide whether the sample jobs/workers/
      employers (`prisma/seed.ts`) go live as-is, get replaced, or get deleted
      before real users show up.

## Phase 2 — Strongly recommended before real users trust it with their data

- [ ] **Privacy policy & terms of service** — the platform stores personal data and
      CVs; most jurisdictions (and Google's OAuth review) expect at least a basic
      privacy policy linked from the site.
- [ ] **Error monitoring** (e.g. Sentry) so failed sign-ins, failed job posts, etc.
      surface somewhere instead of silently failing.
- [ ] **Rate limiting on API routes**, especially `/api/reviews` and `/api/jobs`,
      to prevent spam/abuse once the site is public.
- [ ] **Input validation/sanitization** on all form submissions server-side (job
      descriptions, reviews, profile bios) — currently only lightly checked.
- [ ] **Backups** for the production database (most hosted Postgres providers offer
      automatic daily backups — just confirm it's turned on).
- [ ] **Real CV uploads**: right now "CV" is just a text summary field. If you want
      actual file uploads (PDF), you'll need file storage (S3, Cloudflare R2, or
      Vercel Blob) plus a virus/type check on upload.

## Phase 3 — Feature completeness (from the original spec, not yet built)

The initial request also called for these; they're not required to launch but were
part of the original vision:

- [ ] **Messaging between employer and worker** — no chat/DM system exists yet;
      "Apply" is currently a one-click confirmation with no follow-up thread.
- [ ] **Notifications** (email and/or in-app) for new matching jobs, new messages,
      shift reminders, new reviews.
- [ ] **Real AI assistant**: the chat widget currently gives rule-based canned
      answers. Wiring it to the Claude API would let it actually reason over the
      user's real jobs/profile instead of keyword-matching.
- [ ] **Skill/competency assessments** for workers (quizzes/badges) — mentioned in
      the original spec's "evaluation system," not implemented.
- [ ] **Saved searches / job alerts** — filters exist, but there's no way to save a
      filter combination or get notified when a new match appears.

## Phase 4 — Scale hardening (once there's real traffic)

- [ ] **Dedicated search** (Elasticsearch or Algolia) once job listings grow large
      enough that in-browser filtering (current approach) gets slow.
- [ ] **Caching layer** (Redis) for the `/api/bootstrap` endpoint if it becomes a
      bottleneck under load.
- [ ] **Pagination** on jobs/users/reviews — everything currently loads in one
      request, fine for dozens of rows, not for thousands.
- [ ] **Automated tests** (the app has been manually verified with Playwright during
      development, but there's no repeatable test suite yet) — worth adding before
      the codebase gets much bigger.
- [ ] **CI pipeline** (GitHub Actions) to run lint/typecheck/build on every change.

---

## Suggested order to tackle this

1. Phase 1, top to bottom — the site isn't safe to share publicly until this is done.
2. Privacy policy + error monitoring from Phase 2 (fast, high-value).
3. Whichever Phase 3 feature matters most to your users first — messaging is
   probably the biggest gap since applying to a job currently goes nowhere.
4. Everything else, as traffic and time justify it.
