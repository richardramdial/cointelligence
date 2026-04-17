# Cointelligence — Implementation Plan

**Version:** 1.0  
**Date:** 2026-04-17  
**Author:** Richard Ramdial  
**Status:** Ready for execution

References: [design-and-requirements.md](./design-and-requirements.md) · [architecture.md](./architecture.md)

---

## Overview

Three sequential phases, each ending with a checkpoint. The next phase does not begin until Richard verifies the deliverables and explicitly approves.

| Phase | Name | Goal |
|---|---|---|
| 1 | Foundation | Payload admin live on Azure VM, Google OAuth working, data persists |
| 2 | Content & Public Site | All pages built, design applied, publish-and-share flow end-to-end |
| 3 | SEO & Polish | Production-ready: sitemap, metadata, Lighthouse 90+, accessibility clean |

---

## Phase 1 — Foundation

**Goal:** Richard can log into `/admin` via Google OAuth on the live Azure VM, edit SiteSettings, and confirm that Postgres data and uploaded media survive a container restart.

### 1.1 Repository & Local Setup

- [x] Confirm GitHub repo (`richardramdial/cointelligence`) is accessible with PAT
- [x] Configure local git credential helper for PAT-based pushes
- [x] Create `.gitignore` covering `node_modules/`, `.env`, `.next/`, `src/migrations/` snapshots

### 1.2 Next.js + Payload Scaffold

- [ ] Scaffold Next.js 16.2.4 with App Router (`create-next-app`)
- [ ] Install Payload 3.x (`npx create-payload-app` into existing repo, or manual install)
- [ ] Install `@payloadcms/db-postgres` adapter
- [ ] Configure `payload.config.ts` with Postgres adapter and `DATABASE_URI` from env
- [ ] Verify `src/app/(payload)/admin/[[...segments]]/page.tsx` is present (Payload admin route)
- [ ] Verify `src/app/api/[...payload]/route.ts` is present (Payload API handler)
- [ ] Keep `middleware.ts` at project root (do **not** migrate to `proxy.ts`)

### 1.3 Tailwind CSS & shadcn/ui

- [ ] Install and configure Tailwind CSS
- [ ] Initialise shadcn/ui (`npx shadcn-ui@latest init`)
- [ ] Set up `tailwind.config.ts` with Fraunces and Inter font references
- [ ] Add Google Fonts import (Fraunces, Inter) to `src/app/layout.tsx`

### 1.4 Payload Collections & Globals (skeleton)

Only the minimum required for Phase 1 admin verification:

- [ ] `src/collections/Users.ts` — email, role field; access restricted to `richard.ramdial@gmail.com`
- [ ] `src/collections/Media.ts` — local disk upload, `staticDir: '/app/media'`, `staticURL: '/media'`
- [ ] `src/globals/SiteSettings.ts` — `siteName`, `tagline`, `contactEmail`, `linkedinUrl`, `whatsappNumber`
- [ ] Register all collections and globals in `payload.config.ts`

Remaining collections and globals (`Articles`, `Engagements`, `HomePage`, etc.) are scaffolded in Phase 2.

### 1.5 Google OAuth (Admin Login)

- [ ] Install `payload-authjs` + `next-auth` (Auth.js v5)
- [ ] Configure Auth.js with Google provider in `src/app/api/auth/[...nextauth]/route.ts`
- [ ] Write OAuth callback handler:
  - Verify `session.user.email === 'richard.ramdial@gmail.com'` — reject all others
  - Look up or create User record in Payload `users` collection
  - Issue Payload session (call `payload.auth()` or equivalent bridge)
- [ ] Replace Payload default login UI with "Sign in with Google" button
- [ ] Store `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` in `.env`
- [ ] Document required Google Cloud Console setup in README (Authorized redirect URIs)

### 1.6 Docker Configuration

- [ ] Write `Dockerfile` (multi-stage: builder → runner)
  - Builder: `npm ci && npm run build`
  - Runner: copy `.next/`, `public/`, `node_modules/`
  - Entrypoint: `payload migrate && node server.js`
- [ ] Write `docker-compose.yml` with three services:
  - `traefik` — image `traefik:v3`, ports 80/443, Docker socket mount, `acme.json` mount
  - `app` — GHCR image, `env_file: .env`, `media_data:/app/media`, depends on `db`
  - `db` — `postgres:16`, `env_file: .env`, `postgres_data:/var/lib/postgresql/data`, `internal` network only
- [ ] Declare named volumes: `postgres_data`, `media_data`
- [ ] Declare networks: `web` (Traefik ↔ app), `internal` (app ↔ db)
- [ ] Write `traefik/traefik.yml` with:
  - HTTP → HTTPS redirect
  - Let's Encrypt ACME resolver
  - `forwardedHeaders.trustedIPs` for `X-Forwarded-*`
  - Pass-through `Set-Cookie` (no stripping)
- [ ] Create empty `traefik/acme.json` with `chmod 600`
- [ ] Add Traefik routing labels to `app` service in compose file

### 1.7 Environment & Secrets

- [ ] Write `.env.example` documenting every required variable (no values)
- [ ] Create `.env` on the VM with real values (not committed to repo)

```
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=
PAYLOAD_SECRET=
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
DATABASE_URI=postgresql://<user>:<password>@db:5432/<db>
PAYLOAD_PUBLIC_UPLOAD_DIR=/app/media
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

### 1.8 CI/CD Pipeline

- [ ] Write `.github/workflows/deploy.yml`:
  - Trigger: push to `main`
  - Steps: `docker build --platform linux/amd64` → `docker push ghcr.io/richardramdial/cointelligence:latest` → SSH → `docker compose pull && docker compose up -d`
- [ ] Add GitHub Actions secrets: `SSH_PRIVATE_KEY`, `VM_HOST`, `VM_USER`, `GHCR_TOKEN`

### 1.9 VM Provisioning (Richard's tasks)

- [ ] Provision Azure VM (Ubuntu 22.04 LTS recommended), open ports 80 and 443
- [ ] Install Docker and Docker Compose on the VM
- [ ] Add deploy SSH public key to `~/.ssh/authorized_keys`
- [ ] Copy `.env` file to VM home directory
- [ ] Create `traefik/acme.json` with `chmod 600`
- [ ] Point domain DNS A record at VM public IP (required for Let's Encrypt)
- [ ] Add GitHub Actions secrets

### 1.10 Seed Script

- [ ] Write `scripts/seed.ts` to create the initial admin User record (if not created via OAuth on first login)
- [ ] Document how to run: `docker compose exec app npx ts-node scripts/seed.ts`

### 1.11 README

- [ ] Write `README.md` covering:
  - Local development setup
  - VM provisioning checklist (from 1.9)
  - Google Cloud Console OAuth setup (redirect URIs)
  - How to run the seed script
  - How to back up volumes manually
  - How to deploy (git push to main)

---

### Phase 1 Checkpoint

**Richard verifies:**
- [ ] Navigate to `https://<domain>/admin`
- [ ] "Sign in with Google" button is present
- [ ] Login completes and redirects to admin dashboard
- [ ] Edit `SiteSettings.siteName` → save → refresh → value persists
- [ ] Upload a test image to Media → restart containers → image still accessible
- [ ] Run `docker compose ps` — all three services `Up`

**Approval required before Phase 2 begins.**

---

## Phase 2 — Content & Public Site

**Goal:** All public pages are live, design is applied, and Richard can publish an article end-to-end and share it with a working social preview.

### 2.1 Remaining Payload Collections & Globals

- [ ] `src/collections/Articles.ts` — all fields per spec:
  - `title`, `slug` (auto), `theme` (enum), `coverImage`, `body` (rich text), `excerpt`, `readingTime` (auto), `featured`, `publishedDate`, `_status`
  - Enable Versions (draft/published)
  - `beforeValidate` hook: auto-generate slug from title
  - `beforeChange` hook: calculate reading time from word count
  - `afterChange` hook: `revalidatePath('/articles')` + `revalidatePath('/articles/' + slug)`
- [ ] `src/collections/Engagements.ts` — `title`, `description`
- [ ] `src/globals/HomePage.ts` — all fields per spec (hero, CTAs, `featuredArticles`, `coIntelligenceCards`)
  - `afterChange` hook: `revalidatePath('/')`
- [ ] `src/globals/CoIntelligencePage.ts` — rich text body
- [ ] `src/globals/AboutPage.ts` — two bio paragraph fields
- [ ] `src/globals/WorkPage.ts` — intro copy
- [ ] Register all in `payload.config.ts`
- [ ] Run `payload generate:types` to produce TypeScript types
- [ ] Seed `Engagements` with 3 records: Executive Advisory, Leadership Conversations, Speaking and Workshops

### 2.2 Design System Tokens

- [ ] Configure Tailwind with custom colour palette (warm tones)
- [ ] Add Fraunces and Inter via `next/font/google` in root layout
- [ ] Define base typography styles in `globals.css` (heading sizes, body line-height, prose width)
- [ ] Install and configure `@tailwindcss/typography` for rich text body rendering

### 2.3 Layout Shell

- [ ] `src/components/layout/Header.tsx` — nav bar with 6 items, active state, mobile hamburger menu
- [ ] `src/components/layout/Footer.tsx` — shortened labels (About, Work), copyright
- [ ] `src/app/layout.tsx` — wrap all pages in Header + Footer, apply fonts, set default metadata

### 2.4 Public Pages

Build each page as a React Server Component fetching data via Payload Local API.

#### Homepage (`/`)
- [ ] `Hero.tsx` — heading, subheading, body, primary + secondary CTA buttons (from `HomePage` global)
- [ ] `ThemesGrid.tsx` — 4 theme cards, each linking to `/articles?theme=<slug>`
- [ ] `FeaturedArticles.tsx` — up to 3 articles from `HomePage.featuredArticles`
- [ ] `CoIntelligenceCards.tsx` — 4 cards from `HomePage.coIntelligenceCards`
- [ ] Articles by theme section — all 4 themes with previews
- [ ] About preview section — excerpt + link to `/about`
- [ ] Work preview section — teaser + link to `/work`

#### `/co-intelligence`
- [ ] Render `CoIntelligencePage.body` rich text with prose typography

#### `/articles`
- [ ] `ArticleGrid.tsx` — groups all published articles by theme
- [ ] Theme anchor links at top for quick navigation

#### `/articles/[slug]`
- [ ] `ArticleCard.tsx` — cover image, title, theme tag, reading time, published date, excerpt (used in grids)
- [ ] Full article page: cover image hero, body rich text, share buttons
- [ ] `ShareButtons.tsx` (client component): Email (`mailto:`), WhatsApp (`wa.me`), Copy link (clipboard API)
- [ ] `generateMetadata()`: `og:title`, `og:description`, `og:image`, `og:url`, Twitter Card tags
- [ ] `generateStaticParams()`: pre-render all published article slugs at build time

#### `/about`
- [ ] Render `AboutPage.bioParagraphOne` and `bioParagraphTwo`

#### `/work`
- [ ] Render `WorkPage.introCopy`
- [ ] List all `Engagements` records (title + description cards)

#### `/connect`
- [ ] `InquiryForm.tsx` (client component):
  - Fields: Name, Email, Message
  - On submit: construct `mailto:<contactEmail>?subject=Inquiry&body=...` URI and open with `window.location.href`
- [ ] `ContactLinks.tsx` (server component):
  - Standalone `mailto:` link (always shown)
  - LinkedIn link → `SiteSettings.linkedinUrl` (always shown)
  - WhatsApp link → `https://wa.me/<whatsappNumber>` (hidden if `whatsappNumber` is blank)

### 2.5 Responsive QA

- [ ] Test all pages at 375px (iPhone SE), 768px (tablet), 1280px (desktop)
- [ ] Verify navigation collapses correctly on mobile
- [ ] Verify article body prose is readable at all breakpoints
- [ ] Verify share buttons are tappable on mobile (min 44×44px touch target)

---

### Phase 2 Checkpoint

**Richard verifies:**
- [ ] Create a test article in `/admin` — assign theme, upload cover image, write body and excerpt, publish
- [ ] Visit `/articles/[slug]` — article renders correctly
- [ ] Share link on WhatsApp — rich preview shows cover image, title, excerpt
- [ ] Share link on LinkedIn — rich preview renders
- [ ] Check `/articles` — article appears under correct theme
- [ ] Check homepage — article appears in featured section (if marked featured)
- [ ] All pages render correctly on mobile (iPhone SE viewport)
- [ ] `/connect` WhatsApp link hidden (set `whatsappNumber` blank in SiteSettings to test)

**Approval required before Phase 3 begins.**

---

## Phase 3 — SEO & Polish

**Goal:** Production-ready. Metadata complete, sitemap and structured data in place, Lighthouse 90+ across all pages, zero critical accessibility issues.

### 3.1 Sitemap

- [ ] `src/app/sitemap.ts` — Next.js sitemap generator
  - Static routes: `/`, `/co-intelligence`, `/articles`, `/about`, `/work`, `/connect`
  - Dynamic routes: all published article slugs fetched from Payload Local API
  - Output at `/sitemap.xml`

### 3.2 robots.txt

- [ ] `src/app/robots.ts` — Next.js robots generator
  - Allow all crawlers on public routes
  - Disallow `/admin`
  - Point to sitemap URL

### 3.3 JSON-LD Structured Data

- [ ] Add `Article` JSON-LD schema to each `/articles/[slug]` page:
  - `@type: Article`
  - `headline`, `description`, `image`, `datePublished`, `author` (Richard Ramdial)
  - Injected via `<script type="application/ld+json">` in page `<head>`

### 3.4 Default & Global Metadata

- [ ] Set default `<title>` template in `src/app/layout.tsx`: `%s | Cointelligence`
- [ ] Set default `og:image` (site-level fallback) in root layout metadata
- [ ] Verify `<meta name="description">` is populated on every page from CMS content or static copy

### 3.5 Accessibility Audit

- [ ] Run axe DevTools against all public pages
- [ ] Fix all critical and serious issues before sign-off
- [ ] Targets:
  - All interactive elements have accessible labels
  - Colour contrast ratios meet WCAG 2.1 AA
  - Images have meaningful `alt` text (Payload Media collection has `alt` field)
  - Focus order is logical on all pages
  - Skip-to-content link present in Header

### 3.6 Performance Audit

- [ ] Run Lighthouse (Chrome DevTools or CLI) against production URL for all public pages
- [ ] Target: 90+ on Performance, Accessibility, SEO, Best Practices
- [ ] Common fixes to check:
  - Images served with `next/image` (automatic WebP, lazy loading, size hints)
  - No render-blocking scripts
  - Font display: `swap` for Fraunces and Inter
  - Largest Contentful Paint element is the hero image or heading

### 3.7 Final Content Pass (Richard's tasks)

- [ ] Populate About page (two bio paragraphs)
- [ ] Populate Work With Richard intro copy and verify 3 engagement types display correctly
- [ ] Populate Co-Intelligence page full body
- [ ] Populate Homepage hero copy, CTA labels, co-intelligence cards
- [ ] Set `SiteSettings`: site name, tagline, contact email, LinkedIn URL, WhatsApp number
- [ ] Write and publish at least one real article per theme (4 articles minimum)

### 3.8 Audit Documentation

- [ ] Save Lighthouse report screenshots to `docs/audits/lighthouse/`
- [ ] Save axe DevTools report to `docs/audits/accessibility/`

---

### Phase 3 Checkpoint (Final)

**Richard verifies:**
- [ ] `/sitemap.xml` lists all public routes and published article slugs
- [ ] `/robots.txt` disallows `/admin`
- [ ] Article page source contains `<script type="application/ld+json">` with Article schema
- [ ] Lighthouse scores 90+ on Performance, Accessibility, SEO, Best Practices for all public pages
- [ ] axe DevTools reports zero critical or serious issues on all public pages
- [ ] All real content is populated in the CMS

**Domain cutover** (pointing a custom domain at the VM) is handled separately at Richard's discretion after Phase 3 is approved.

---

## Commit Style

One concern per commit. First line explains the **why**, not just the what.

```
feat(scaffold): initialise Next.js 16 + Payload 3 with Postgres adapter
feat(auth): add Google OAuth via payload-authjs, restrict to richard.ramdial@gmail.com
feat(docker): add multi-stage Dockerfile and compose with named volumes
feat(ci): add GitHub Actions deploy workflow on push to main
feat(collections): add Articles collection with draft/publish and auto-slug hooks
feat(globals): add HomePage global with featured articles and co-intelligence cards
feat(pages): build homepage with all 7 sections
feat(pages): build /articles listing grouped by theme
feat(pages): build /articles/[slug] with share buttons and OG metadata
feat(seo): add sitemap, robots.txt, and JSON-LD Article schema
fix(traefik): pass Set-Cookie header to prevent session cookie stripping
```

---

## File Checklist — Phase 1 Deliverables

```
/
├── .env.example
├── .gitignore
├── .github/
│   └── workflows/
│       └── deploy.yml
├── Dockerfile
├── docker-compose.yml
├── README.md
├── scripts/
│   └── seed.ts
├── traefik/
│   ├── traefik.yml
│   └── acme.json           (chmod 600, not committed)
└── src/
    ├── middleware.ts
    ├── payload.config.ts
    ├── app/
    │   ├── layout.tsx
    │   ├── api/
    │   │   ├── [...payload]/route.ts
    │   │   └── auth/[...nextauth]/route.ts
    │   └── (payload)/
    │       └── admin/[[...segments]]/page.tsx
    ├── collections/
    │   ├── Users.ts
    │   └── Media.ts
    └── globals/
        └── SiteSettings.ts
```

---

## File Checklist — Phase 2 Additions

```
src/
├── collections/
│   ├── Articles.ts
│   └── Engagements.ts
├── globals/
│   ├── HomePage.ts
│   ├── CoIntelligencePage.ts
│   ├── AboutPage.ts
│   └── WorkPage.ts
├── payload-types.ts          (generated)
└── app/
    ├── (frontend)/
    │   ├── page.tsx                        # /
    │   ├── co-intelligence/page.tsx
    │   ├── articles/
    │   │   ├── page.tsx
    │   │   └── [slug]/page.tsx
    │   ├── about/page.tsx
    │   ├── work/page.tsx
    │   └── connect/page.tsx
    └── components/
        ├── layout/
        │   ├── Header.tsx
        │   └── Footer.tsx
        ├── articles/
        │   ├── ArticleCard.tsx
        │   ├── ArticleGrid.tsx
        │   └── ShareButtons.tsx
        ├── home/
        │   ├── Hero.tsx
        │   ├── ThemesGrid.tsx
        │   ├── CoIntelligenceCards.tsx
        │   └── FeaturedArticles.tsx
        └── connect/
            ├── InquiryForm.tsx
            └── ContactLinks.tsx
```

---

## File Checklist — Phase 3 Additions

```
src/app/
├── sitemap.ts
└── robots.ts
docs/
└── audits/
    ├── lighthouse/
    └── accessibility/
```
