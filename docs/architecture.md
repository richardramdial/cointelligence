# Cointelligence — Architecture Document

**Version:** 1.0  
**Date:** 2026-04-17  
**Author:** Richard Ramdial  
**Status:** Approved for Phase 1

---

## 1. Architecture Overview

Cointelligence is a **monorepo, single-process application**: Next.js 16 and Payload CMS v3 run in the same Node.js process, share the same Docker container, and are deployed as one unit. There is no separate API server, no microservices, and no CDN in the POC.

```
┌─────────────────────────────────────────────────────────┐
│                      Azure VM                           │
│                                                         │
│  ┌──────────┐    ┌─────────────────────────────────┐   │
│  │  Traefik │    │           app container          │   │
│  │  :80/443 │───▶│  Next.js 16 + Payload CMS v3    │   │
│  │  (TLS)   │    │  Node.js 20   port 3000          │   │
│  └──────────┘    │                                  │   │
│                  │  /app/media ──▶ media_data vol    │   │
│                  └───────────────┬──────────────────┘   │
│                                  │ DATABASE_URI          │
│                  ┌───────────────▼──────────────────┐   │
│                  │         db container             │   │
│                  │      PostgreSQL 16               │   │
│                  │  /var/lib/postgresql/data        │   │
│                  │        ──▶ postgres_data vol      │   │
│                  └──────────────────────────────────┘   │
│                                                         │
│  Named volumes (persistent across restarts):            │
│    postgres_data   media_data                           │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Application Layer

### 2.1 Next.js + Payload — Co-located Architecture

Payload v3 is designed to run **inside** a Next.js App Router project. Both share the same process, the same `node_modules`, and the same build output.

```
src/
├── app/
│   ├── (frontend)/          # Public-facing Next.js routes
│   │   ├── page.tsx                  # /
│   │   ├── co-intelligence/page.tsx  # /co-intelligence
│   │   ├── articles/
│   │   │   ├── page.tsx              # /articles
│   │   │   └── [slug]/page.tsx       # /articles/[slug]
│   │   ├── about/page.tsx            # /about
│   │   ├── work/page.tsx             # /work
│   │   └── connect/page.tsx   # /connect
│   ├── (payload)/           # Payload admin routes (Next.js handles routing)
│   │   └── admin/[[...segments]]/page.tsx
│   └── api/
│       └── [...payload]/route.ts    # Payload REST + GraphQL API handler
├── payload.config.ts        # Payload configuration root
├── collections/
│   ├── Users.ts
│   ├── Media.ts
│   ├── Articles.ts
│   └── Engagements.ts
├── globals/
│   ├── SiteSettings.ts
│   ├── HomePage.ts
│   ├── CoIntelligencePage.ts
│   ├── AboutPage.ts
│   └── WorkPage.ts
└── middleware.ts            # Next.js middleware (retained; proxy.ts not used)
```

### 2.2 Request Routing

```
Incoming request
       │
       ▼
  Traefik (TLS termination, header forwarding)
       │
       ▼
  Next.js router (port 3000)
       │
       ├─▶ /admin/*          → Payload Admin UI (React SPA served by Next.js)
       ├─▶ /api/[...payload] → Payload REST API (collections, globals, auth)
       └─▶ /*                → Next.js App Router pages (RSC + SSG/ISR)
```

### 2.3 Rendering Strategy

| Route | Strategy | Rationale |
|---|---|---|
| `/` | ISR (revalidate on publish) | Homepage content changes when articles are published |
| `/co-intelligence` | Static (SSG) | Rarely changes |
| `/articles` | ISR | Updated when articles are published/unpublished |
| `/articles/[slug]` | ISR per slug | Each article revalidates independently |
| `/about` | Static (SSG) | Rarely changes |
| `/work` | Static (SSG) | Rarely changes |
| `/connect` | Static (SSG) | Contact links only; no server data at runtime |

Payload's `afterChange` hooks trigger Next.js **on-demand revalidation** (`revalidatePath` / `revalidateTag`) when content is published, so the public site reflects CMS changes without a full redeploy.

---

## 3. Data Layer

### 3.1 Database

- **PostgreSQL 16** running as a dedicated Docker container (`db` service)
- Accessed by the `app` container via the internal Docker network on `db:5432`
- Connection string: `postgresql://<user>:<password>@db:5432/<dbname>`
- ORM: **Drizzle** (bundled with Payload's `@payloadcms/db-postgres` adapter) — schema is auto-managed by Payload migrations

### 3.2 Schema Management

Payload generates and applies Drizzle migrations automatically. The migration files live in `src/migrations/` and are committed to the repository. On container startup, the app runs `payload migrate` before accepting traffic.

### 3.3 Media Storage

Uploaded files (article cover images) are stored on the **local filesystem** inside the `app` container, at `/app/media`. This path is mounted from the `media_data` Docker named volume, so files persist across container restarts and image updates.

```
app container: /app/media  ←──  media_data (named volume on VM disk)
```

The Payload Media collection is configured with `staticDir: '/app/media'` and `staticURL: '/media'`. Next.js serves the files from that URL path.

> **Post-POC:** Migrate to Azure Blob Storage + a CDN before handling real client traffic at scale.

### 3.4 Persistence Guarantee

| Data | Storage | Survives container restart | Survives image rebuild |
|---|---|---|---|
| CMS content, users, settings | `postgres_data` named volume | Yes | Yes |
| Uploaded media | `media_data` named volume | Yes | Yes |
| Payload session cookies | Browser (HTTP-only cookie) | N/A | N/A |
| OAuth credentials | `.env` on VM disk | Yes | Yes (not in image) |

Named volumes are managed by Docker on the VM's disk. They are **not** destroyed by `docker compose down` (only by `docker compose down -v`, which must never be run in production).

---

## 4. Authentication & Authorisation

### 4.1 Admin Login Flow (Google OAuth)

Richard is the sole administrator. Login uses Google OAuth via **Auth.js (NextAuth 5)** integrated into Payload v3 through `payload-authjs`.

```
Richard clicks "Sign in with Google"
        │
        ▼
Google OAuth consent screen
        │  Authorization code
        ▼
/api/auth/callback/google   (Auth.js callback route)
        │
        ├─ Verify: is email === richard.ramdial@gmail.com?
        │    └─ No  → reject, redirect to /admin/login?error=unauthorized
        │    └─ Yes ↓
        ▼
Look up or create User record in Payload `users` collection
        │
        ▼
Payload issues session cookie (HTTP-only, Secure, SameSite=Lax)
        │
        ▼
Redirect to /admin  (Payload admin panel, fully accessible)
```

### 4.2 Session Management

- Payload manages its own session via a signed HTTP-only cookie
- Cookie is set by the `app` container and must be forwarded unchanged through Traefik (no stripping of `Set-Cookie` headers)
- Session expiry and rotation are handled by Payload's built-in auth logic

### 4.3 Access Control Rules

| Resource | Rule |
|---|---|
| Payload admin (`/admin/*`) | Requires valid Payload session; session only granted to `richard.ramdial@gmail.com` |
| Payload REST API (`/api/*`) | Read operations on published content are public; write operations require session |
| All public pages (`/*`) | No authentication — fully public |

### 4.4 Credentials & Secrets

All secrets are environment variables loaded from `.env` on the VM. They are never committed to the repository and never stored in the database.

| Variable | Purpose |
|---|---|
| `GOOGLE_CLIENT_ID` | OAuth app identity |
| `GOOGLE_CLIENT_SECRET` | OAuth app secret |
| `NEXTAUTH_SECRET` | Auth.js session signing key |
| `NEXTAUTH_URL` | Canonical origin (must match Google Cloud Console redirect URI) |
| `PAYLOAD_SECRET` | Payload JWT signing key |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Database credentials |
| `DATABASE_URI` | Full Postgres connection string |

---

## 5. Infrastructure & Networking

### 5.1 Docker Compose Services

```yaml
services:

  traefik:
    image: traefik:v3
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik/traefik.yml:/traefik.yml:ro
      - ./traefik/acme.json:/acme.json          # Let's Encrypt certificates
    networks:
      - web

  app:
    image: ghcr.io/richardramdial/cointelligence:latest
    expose:
      - "3000"
    env_file: .env
    volumes:
      - media_data:/app/media
    depends_on:
      - db
    networks:
      - web
      - internal
    labels:
      # Traefik routing labels (HTTPS, domain, cookie forwarding)

  db:
    image: postgres:16
    env_file: .env
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - internal                                # Not exposed to web network

networks:
  web:        # Traefik ↔ app
  internal:   # app ↔ db only (db not reachable from outside)

volumes:
  postgres_data:
  media_data:
```

### 5.2 Network Isolation

- `db` is on the `internal` network only — it has no path to the internet and is not reachable from Traefik
- `app` is on both networks: it can reach `db` internally and receive traffic from Traefik on `web`
- Traefik only receives traffic from the public internet on ports 80 and 443

### 5.3 TLS

Traefik handles TLS termination using **Let's Encrypt** (ACME HTTP-01 challenge). Certificates are stored in `./traefik/acme.json` on the VM (bind-mounted into the Traefik container). Internal container-to-container traffic is plain HTTP.

### 5.4 Traefik Configuration Points

| Config | Value | Why |
|---|---|---|
| `forwardedHeaders.trustedIPs` | VM's IP / Traefik network CIDR | So `X-Forwarded-*` headers are trusted by the app |
| Pass-through `Set-Cookie` | Enabled (do not strip) | Payload session cookie must reach the browser |
| HTTPS redirect | 80 → 443 | All HTTP redirected to HTTPS |
| `entryPoints.websecure.http.tls` | Let's Encrypt resolver | Auto-renewing certificates |

---

## 6. CI/CD Pipeline

### 6.1 Flow

```
Developer (local)
    │  git push origin main
    ▼
GitHub (main branch)
    │  triggers workflow
    ▼
GitHub Actions runner
    │  1. docker build --platform linux/amd64
    │  2. docker push ghcr.io/richardramdial/cointelligence:latest
    │  3. SSH into Azure VM
    │     └─ docker compose pull
    │     └─ docker compose up -d
    ▼
Azure VM — new app container running, old one stopped
```

### 6.2 GitHub Actions Secrets Required

| Secret | Value |
|---|---|
| `SSH_PRIVATE_KEY` | Private key matching deploy user on VM |
| `VM_HOST` | VM public IP or hostname |
| `VM_USER` | SSH user on VM (e.g. `azureuser`) |
| `GHCR_TOKEN` | GitHub PAT with `packages:write` to push to GHCR |

### 6.3 Zero-Downtime Consideration

`docker compose up -d` performs a rolling replacement of the `app` container. During the brief startup period (Next.js build is pre-compiled into the image, so startup is fast), Traefik may return 502 for a few seconds. For the POC this is acceptable. Pre-production, consider a health-check with Traefik retry or a blue-green approach.

### 6.4 Database Migrations

The `app` container entrypoint runs `node_modules/.bin/payload migrate` before starting the Next.js server. This applies any pending Drizzle migrations generated by Payload. Migrations are committed to the repo and are idempotent.

---

## 7. CMS Architecture (Payload v3)

### 7.1 Collections & Globals

See [design-and-requirements.md §7](./design-and-requirements.md#7-cms-data-model-payload-3) for the full field-level data model.

Summary:

| Type | Name | Role |
|---|---|---|
| Collection | `Users` | Admin user records (one: Richard) |
| Collection | `Media` | Uploaded images; files on `media_data` volume |
| Collection | `Articles` | Editorial content |
| Collection | `Engagements` | Work With Richard engagement types |
| Global | `SiteSettings` | Site-wide config (name, tagline, contact links) |
| Global | `HomePage` | Hero, featured articles, co-intelligence cards |
| Global | `CoIntelligencePage` | Full page body |
| Global | `AboutPage` | Bio paragraphs |
| Global | `WorkPage` | Intro copy |

### 7.2 Payload Hooks

| Hook | Collection/Global | Action |
|---|---|---|
| `beforeValidate` | Articles | Auto-generate `slug` from `title` if not set |
| `beforeChange` | Articles | Calculate `readingTime` from body word count |
| `afterChange` | Articles | Call `revalidatePath('/articles')` and `revalidatePath('/articles/[slug]')` |
| `afterChange` | HomePage global | Call `revalidatePath('/')` |

### 7.3 Draft / Publish Workflow

Payload's built-in **Versions** feature is enabled on the `Articles` collection. Articles have a `_status` field: `draft` or `published`. Only `published` articles are returned by the public-facing data fetching functions. Richard can save drafts, preview them in the admin, and publish when ready.

---

## 8. Frontend Architecture

### 8.1 Data Fetching Pattern

Public pages fetch data from Payload's **Local API** (direct in-process function calls, not HTTP) — available because Next.js and Payload share the same process. This eliminates network overhead for server-rendered pages.

```typescript
// Example: fetching published articles (server component)
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const { docs: articles } = await payload.find({
  collection: 'articles',
  where: { _status: { equals: 'published' } },
  sort: '-publishedDate',
})
```

### 8.2 Component Structure

```
src/
└── components/
    ├── layout/
    │   ├── Header.tsx          # Navigation bar
    │   └── Footer.tsx          # Footer with shortened labels
    ├── articles/
    │   ├── ArticleCard.tsx     # Used in listings and homepage
    │   ├── ArticleGrid.tsx     # Theme-grouped grid
    │   └── ShareButtons.tsx    # Email, WhatsApp, copy-link
    ├── home/
    │   ├── Hero.tsx
    │   ├── ThemesGrid.tsx
    │   ├── CoIntelligenceCards.tsx
    │   └── FeaturedArticles.tsx
    └── connect/
        ├── InquiryForm.tsx     # mailto: form, client component
        └── ContactLinks.tsx    # mailto, LinkedIn, WhatsApp (conditional)
```

### 8.3 Client vs Server Components

| Component | Type | Reason |
|---|---|---|
| All page-level layout | Server | Data fetched via Local API; no interactivity needed |
| `InquiryForm` | Client (`'use client'`) | Form state + `mailto:` URI construction on submit |
| `ShareButtons` | Client | Copy-to-clipboard requires browser API |
| `Header` | Server (nav links static) | No dynamic state needed |
| Everything else | Server | Default; better performance |

### 8.4 Open Graph & Social Sharing

Each `/articles/[slug]` page exports a Next.js `generateMetadata` function that populates:

- `og:title`, `og:description`, `og:image` (cover image URL), `og:url`
- `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

This ensures rich previews render on WhatsApp, LinkedIn, iMessage, and Twitter/X when an article link is shared.

---

## 9. Middleware

`middleware.ts` is retained at the project root (not migrated to `proxy.ts`) due to known Payload v3 incompatibilities with Next.js 16's `proxy.ts`. This is a deliberate, documented decision.

Current middleware responsibilities:
- Pass-through only (no auth gating on public routes)
- Potential future use: redirect `/admin` requests that lack a valid session back to `/admin/login` (Payload handles this natively, so middleware may remain minimal)

---

## 10. Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Next.js + Payload co-located | Single process | Eliminates a network hop for data fetching; simpler deployment |
| Local API for data fetching | In-process calls | Faster than HTTP; type-safe; no auth token management needed |
| ISR with on-demand revalidation | Per-route | Pages stay fast (served from cache) and update promptly on publish |
| Docker named volumes | `postgres_data`, `media_data` | Data survives container and image lifecycle without bind-mount complexity |
| `middleware.ts` (not `proxy.ts`) | Compatibility | Payload v3 incompatible with Next.js 16 `proxy.ts` |
| PostgreSQL 16 | Stability | PG 18 has documented bugs with Payload v3; PG 16 is confirmed stable |
| Traefik v3 | Current stable | v2 is security-only; v3 has active development |
| Google OAuth only (no password login) | Simplicity + security | Single admin; eliminates password management and brute-force risk |
| No transactional email | Reduce dependencies | `mailto:` client-side approach is sufficient for a single-admin POC |

---

## 11. Post-POC Architecture Considerations

The following are out of scope for the POC but should be addressed before real client traffic:

| Concern | Current (POC) | Recommended post-POC |
|---|---|---|
| Media storage | Docker named volume on VM disk | Azure Blob Storage + CDN |
| Volume backups | Manual operator responsibility | Automated backup job (cron + Azure Blob) |
| Zero-downtime deploys | Brief 502 during container swap | Traefik health-check + retry, or blue-green |
| Analytics | None | Plausible (self-hosted or cloud) |
| Multi-author | Not supported | Payload roles + additional `Users` records |
| RSS feed | None | Generated from published articles |
