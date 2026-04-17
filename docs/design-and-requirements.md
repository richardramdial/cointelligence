# Cointelligence — Design & Requirements Document

**Version:** 1.0  
**Date:** 2026-04-17  
**Author:** Richard Ramdial  
**Status:** Approved for Phase 1

---

## 1. Project Overview

**Cointelligence** is a personal editorial and thought-leadership platform for Richard Ramdial. It is a public-facing publishing site — not a SaaS product, authenticated app, or client portal.

### 1.1 Primary Objectives

1. **Publish and distribute articles** across four intellectual themes, with rich social-preview sharing (WhatsApp, LinkedIn, iMessage).
2. **Articulate the Co-Intelligence idea** — a dedicated page expanding what the concept means, what it is not, why it matters, and where it applies.
3. **Invite professional engagement** — a connect page combining a simple inquiry form with direct contact links (email, WhatsApp, LinkedIn).

### 1.2 Scope (POC)

| In scope | Out of scope |
|---|---|
| Public-facing editorial site | Authenticated user-facing features / client portal |
| Payload CMS admin for Richard | Auth.js, Strapi, or any separate backend |
| Google OAuth for Richard's admin login | Social API integrations (YouTube, X, LinkedIn feed) |
| Article sharing with OG/Twitter Card previews | Plausible or any analytics |
| Simple contact/connect page | Transactional email (Resend or similar) |
| Docker-based deployment on Azure VM | Multi-tenant or multi-author workflows |

---

## 2. Design System

### 2.1 Typography

| Role | Font | Style |
|---|---|---|
| Headings | Fraunces | Serif — editorial, authoritative |
| Body | Inter | Sans-serif — readable, neutral |

### 2.2 Visual Language

- **Palette:** Warm tones — editorial/print feel, not tech-corporate
- **Layout:** Content-first, generous whitespace, wide editorial columns
- **Aesthetic:** Resembles a high-quality long-form publication (think The Atlantic, not a SaaS dashboard)

### 2.3 Component Library

- **shadcn/ui** components built on Tailwind CSS
- Mobile-first responsive behaviour throughout
- No custom component framework — shadcn primitives extended as needed

---

## 3. Site Structure

### 3.1 Navigation

Six top-level items, consistent across all pages:

```
Home  |  Co-Intelligence  |  Articles  |  About Richard  |  Work With Richard  |  Connect
```

Footer uses shortened labels where space is limited: `About`, `Work`.

### 3.2 Routes & Page Purposes

| Route | Page | Purpose |
|---|---|---|
| `/` | Homepage | Hero, themes grid, featured articles (≤3), co-intelligence explainer (4 cards), articles by theme, about preview, work preview |
| `/co-intelligence` | Co-Intelligence | Full expansion of the central concept |
| `/articles` | Articles | Full listing grouped by all 4 themes |
| `/articles/[slug]` | Article detail | Individual article, share buttons, OG metadata |
| `/about` | About Richard | Bio (two paragraphs) |
| `/work` | Work With Richard | Three engagement types |
| `/connect` | Connect | Inquiry form + contact links |

### 3.3 Homepage Sections (in order)

1. **Hero** — heading, subheading, body text, CTA buttons
2. **Themes grid** — the four article themes displayed as cards
3. **Featured articles** — up to 3 hand-picked articles (selected in CMS)
4. **Co-Intelligence explainer** — 4 cards: *What it is / What it is not / Why it matters / Where it applies*
5. **Articles by theme** — previews grouped under each theme
6. **About preview** — short bio excerpt with link to `/about`
7. **Work preview** — brief engagement types teaser with link to `/work`

---

## 4. Article Themes

Fixed enum — not a CMS collection, stored directly on each Article record:

1. **Leadership and Perception**
2. **Systems and Transformation**
3. **Thinking in the Age of AI**
4. **The Craft of Leadership**

---

## 5. Connect Page

No server-side email sending. The page contains four elements in this order:

### 5.1 Inquiry Form

Fields: **Name**, **Email**, **Message**

On submit, the form constructs a `mailto:` URI pre-filled with all field values and opens the visitor's default email client. The `to` address is pulled from `SiteSettings.contactEmail`. No data is stored or transmitted server-side.

### 5.2 Mailto Link

A standalone "Send an email" link (`mailto:<contactEmail>`) for visitors who prefer not to use the form.

### 5.3 LinkedIn Connector Link

Links to `SiteSettings.linkedinUrl`. Always rendered.

### 5.4 WhatsApp Deep-Link

`https://wa.me/<SiteSettings.whatsappNumber>`

**Conditionally rendered** — if `whatsappNumber` is blank in SiteSettings, this link does not appear on the page at all. No placeholder or disabled state is shown.

---

## 6. Article Detail Page

Each article at `/articles/[slug]` includes:

- Cover image
- Title, theme tag, reading time, published date
- Full body content (rich text)
- **Share buttons:** Email (`mailto:`), WhatsApp (`wa.me`), Copy link
- Open Graph and Twitter Card metadata so shared links render rich previews on WhatsApp, LinkedIn, and iMessage

---

## 7. CMS Data Model (Payload 3)

### 7.1 Collections

#### `Articles`

| Field | Type | Notes |
|---|---|---|
| `title` | Text | Required |
| `slug` | Text | Auto-generated from title via Payload hook; editable |
| `theme` | Select (enum) | One of the 4 fixed themes |
| `coverImage` | Upload (Media) | Required |
| `body` | Rich Text | Full article content |
| `excerpt` | Textarea | Optional; falls back to first ~160 chars of body if empty |
| `readingTime` | Number | Auto-calculated from body word count via hook; read-only in admin |
| `featured` | Checkbox | Marks article for homepage featured section |
| `publishedDate` | Date | Controls sort order |
| `_status` | Draft / Published | Payload built-in; only published articles appear on public site |

#### `Engagements`

| Field | Type | Notes |
|---|---|---|
| `title` | Text | e.g. "Executive Advisory" |
| `description` | Textarea | Short description of the engagement type |

Pre-seeded with 3 records: **Executive Advisory**, **Leadership Conversations**, **Speaking and Workshops**.

### 7.2 Globals

#### `SiteSettings`

| Field | Type | Notes |
|---|---|---|
| `siteName` | Text | e.g. "Cointelligence" |
| `tagline` | Text | Short site tagline |
| `contactEmail` | Email | Used in connect form `mailto:` and as reply-to reference |
| `linkedinUrl` | URL | Full LinkedIn profile URL; always shown on connect page |
| `whatsappNumber` | Text | International format without `+` (e.g. `27821234567`); leave blank to hide WhatsApp link |

#### `HomePage`

| Field | Type | Notes |
|---|---|---|
| `heroHeading` | Text | — |
| `heroSubheading` | Text | — |
| `heroBody` | Textarea | — |
| `primaryCtaLabel` | Text | — |
| `secondaryCtaLabel` | Text | — |
| `featuredArticles` | Relationship (Articles, max 3) | Hand-picked; displayed in featured section |
| `coIntelligenceCards` | Array (4 items) | Each card: `label` + `body`. Fixed labels: *What it is / What it is not / Why it matters / Where it applies* |

#### `CoIntelligencePage`

| Field | Type | Notes |
|---|---|---|
| `body` | Rich Text | Full page content for `/co-intelligence` |

#### `AboutPage`

| Field | Type | Notes |
|---|---|---|
| `bioParagraphOne` | Textarea | — |
| `bioParagraphTwo` | Textarea | — |

#### `WorkPage`

| Field | Type | Notes |
|---|---|---|
| `introCopy` | Textarea | Introductory paragraph above engagement types |

---

## 8. Admin Authentication (Google OAuth)

Richard is the sole admin. Login is via **Google OAuth only** — no username/password.

### 8.1 Architecture

Google handles the OAuth ceremony (PKCE, redirects, tokens). On a successful callback, the app resolves the verified Google identity to a record in Payload's `Users` collection and issues a Payload session cookie. Payload's own session management governs the admin panel from that point.

### 8.2 Access Control

Only Richard's Google account email (`richard.ramdial@gmail.com`) is permitted to log in. Any other Google account that attempts OAuth is rejected at the callback handler — no User record is created.

### 8.3 Implementation

- Library: **`payload-authjs`** (Auth.js / NextAuth 5 integration for Payload v3) as starting point
- Google OAuth credentials (Client ID, Client Secret, callback URL) are stored in `.env` only — never in the CMS database
- Authorized redirect URI in Google Cloud Console must match the callback URL exactly

### 8.4 Traefik Cookie Forwarding

Traefik must not strip the `Set-Cookie` header from Payload's response. This requires explicit configuration in the Traefik router/middleware config and must be verified during Phase 1 deployment.

### 8.5 Environment Variables (OAuth-related)

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=               # e.g. https://yourdomain.com
PAYLOAD_SECRET=
```

---

## 9. Technical Stack

### 9.1 Validated Versions

| Concern | Technology | Version |
|---|---|---|
| Runtime | Node.js | 20.9.0+ (LTS) |
| Framework | Next.js | **16.2.4** |
| CMS | Payload | **3.x latest** (~3.81) |
| Database | PostgreSQL | **16** |
| ORM | Drizzle (via Payload Postgres adapter) | Bundled with Payload |
| Reverse proxy | Traefik | **v3.x latest** |
| Containerisation | Docker + Docker Compose | Latest stable |
| Styling | Tailwind CSS + shadcn/ui | — |
| CI/CD | GitHub Actions | — |

### 9.2 Version Trade-offs & Decisions

| Decision | Rationale |
|---|---|
| `middleware.ts` retained (not migrated to `proxy.ts`) | Payload v3 has known incompatibilities with Next.js 16 `proxy.ts`; `middleware.ts` still works and is not yet removed |
| PostgreSQL 16 (not 17 or 18) | PostgreSQL 18 has documented bugs with Payload v3; 16 is the most stable confirmed choice |
| Traefik v3 (not v2) | v2 is security-only; v3 is current stable with active development |
| No Resend / transactional email | Connect page uses client-side `mailto:` only; eliminates an external dependency and API key management from the POC |

---

## 10. Infrastructure & Deployment

### 10.1 Overview

```
GitHub (main branch)
    │  push
    ▼
GitHub Actions
    │  SSH into Azure VM
    ▼
Azure VM
    ├── Traefik (reverse proxy, TLS termination)
    ├── app (Next.js + Payload, port 3000 internal)
    └── db (PostgreSQL 16, port 5432 internal)
```

### 10.2 Docker Compose Services

Three services: `traefik`, `app`, `db`.

### 10.3 Persistent Storage (Docker Named Volumes)

All stateful data uses Docker **named volumes** — not bind mounts. Named volumes survive container restarts and image rebuilds.

```yaml
volumes:
  postgres_data:    # PostgreSQL WAL + data directory
  media_data:       # Payload uploaded media files
```

Mapped into services:

```yaml
services:
  db:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    volumes:
      - media_data:/app/media   # must match PAYLOAD_PUBLIC_UPLOAD_DIR in .env
```

**Backup responsibility:** Volume backup before any VM rebuild is the operator's responsibility. Suggested command:

```bash
docker run --rm \
  -v postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres_data_backup.tar.gz /data
```

This is not automated in the POC. Before going to real client traffic, consider migrating media to Azure Blob Storage.

### 10.4 CI/CD Pipeline

- **Trigger:** Push to `main`
- **Action:** SSH into Azure VM → `docker compose pull && docker compose up -d`
- **Secrets required in GitHub Actions:** `SSH_PRIVATE_KEY`, `VM_HOST`, `VM_USER`

### 10.5 Environment Variables (full list)

Documented in `.env.example` in the repository root. Key variables:

```
# App
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=

# Payload
PAYLOAD_SECRET=

# Database
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
DATABASE_URI=postgresql://<user>:<password>@db:5432/<db>

# Media
PAYLOAD_PUBLIC_UPLOAD_DIR=/app/media

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

---

## 11. SEO & Metadata (Phase 3)

| Feature | Detail |
|---|---|
| Open Graph + Twitter Card | Per-article: title, excerpt, cover image, URL |
| Sitemap | Auto-generated from published Articles and static routes (`/sitemap.xml`) |
| `robots.txt` | Standard; disallows `/admin` |
| JSON-LD Article schema | On each `/articles/[slug]` page |
| Lighthouse targets | 90+ on Performance, Accessibility, SEO, Best Practices across all public pages |
| Accessibility target | Zero critical or serious issues (axe DevTools) |

---

## 12. Build Phases

| Phase | Goal | Success Criteria |
|---|---|---|
| **1 — Foundation** | Payload admin live on Azure VM | Richard can log in via Google OAuth; can edit and save SiteSettings; Postgres and media volumes confirmed persistent across restart |
| **2 — Content & public site** | All pages built, design applied | Richard can create and publish an article end-to-end; share link on WhatsApp shows cover image, title, and excerpt; all pages render correctly on mobile |
| **3 — SEO & polish** | Production-ready | Sitemap, robots.txt, JSON-LD in place; Lighthouse 90+ on all pages; zero critical a11y issues |

### Phase checkpoints

Each phase ends with a checkpoint: Richard verifies the deliverables, then explicitly approves the next phase before work begins.

---

## 13. Out-of-Scope (Future Considerations)

The following are explicitly deferred and will not be built in the POC:

- Azure Blob Storage for media (currently using local Docker volume)
- Plausible or any analytics
- Multi-author support
- RSS feed
- Newsletter / email list integration
- Client portal or any authenticated user-facing features
- Automated volume backups
