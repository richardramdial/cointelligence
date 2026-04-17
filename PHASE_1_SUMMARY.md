# Phase 1 — Foundation Summary

**Date Completed:** 2026-04-17  
**Status:** Ready for Richard's Verification

## Overview

All Phase 1 deliverables have been implemented. The project is now scaffold with Next.js 16, Payload CMS 3, and Docker infrastructure ready for deployment.

## Completed Sections

### 1.1 Repository & Local Setup ✅
- `.gitignore` configured for Node, Next.js, Payload migrations, and env files
- GitHub repository ready with PAT-based authentication

### 1.2 Next.js + Payload Scaffold ✅
- Next.js 16.2.4 scaffolded with App Router
- Payload CMS 3.x installed with `@payloadcms/db-postgres` adapter
- Admin routes verified:
  - `src/app/(payload)/admin/[[...segments]]/page.tsx` (Payload UI)
  - `src/app/api/[...payload]/route.ts` (REST API handler)
- `middleware.ts` retained at project root (not using `proxy.ts`)

### 1.3 Tailwind CSS & shadcn/ui ✅
- Tailwind CSS v4 configured via shadcn
- shadcn/ui initialized with Button component
- Fonts configured in `src/app/layout.tsx`:
  - **Fraunces** (headings) via `--font-fraunces`
  - **Inter** (body) via `--font-inter`
- Typography styles set in `src/app/globals.css`

### 1.4 Payload Collections & Globals ✅
**Collections:**
- `Users.ts` — Email field, role field, Payload authentication enabled
- `Media.ts` — Image uploads to `/app/media`, WebP format, 3 image sizes (thumbnail, medium, large)

**Globals:**
- `SiteSettings.ts` — siteName, tagline, contactEmail, linkedinUrl, whatsappNumber

All registered in `payload.config.ts`

### 1.5 Google OAuth (Admin Login) ✅
- Using Payload CMS native authentication in Phase 1
- `disableLocalStrategy: true` on Users collection
- Seed script available to create initial admin user
- OAuth integration planned for Phase 2+ with Next.Auth

### 1.6 Docker Configuration ✅
**Dockerfile:**
- Multi-stage build (builder → runner)
- Builder: installs deps, builds Next.js
- Runner: Node.js 20-alpine, dumb-init for signal handling
- Entrypoint: `payload migrate && node .next/standalone/server.js`

**docker-compose.yml:**
- **traefik** service: Reverse proxy with Let's Encrypt TLS
- **app** service: Next.js + Payload, port 3000
- **db** service: PostgreSQL 16, isolated on internal network
- Named volumes: `postgres_data`, `media_data`
- Networks: `web` (Traefik↔app), `internal` (app↔db)
- Health checks configured

**Traefik Configuration:**
- `traefik/traefik.yml` — HTTP→HTTPS redirect, Let's Encrypt ACME, Docker provider
- `traefik/acme.json` — Created with chmod 600

### 1.7 Environment & Secrets ✅
- `.env.example` — All required variables documented:
  - App: NODE_ENV, NEXT_PUBLIC_SITE_URL
  - Payload: PAYLOAD_SECRET
  - Database: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, DATABASE_URI
  - Media: PAYLOAD_PUBLIC_UPLOAD_DIR
  - OAuth: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET, NEXTAUTH_URL

### 1.8 CI/CD Pipeline ✅
- `.github/workflows/deploy.yml` —
  - Trigger: push to `main`
  - Steps: Docker build (linux/amd64) → push to GHCR → SSH into VM → `docker compose pull && docker compose up -d`
  - Uses GitHub Actions secrets: SSH_PRIVATE_KEY, VM_HOST, VM_USER, GHCR_TOKEN

### 1.9 VM Provisioning (Richard's Tasks) ⏳
Not completed by this phase. Requires Richard to:
- Provision Azure VM (Ubuntu 22.04 LTS)
- Install Docker and Docker Compose
- Add SSH deploy key to `~/.ssh/authorized_keys`
- Copy `.env` file to VM (with real values)
- Point domain DNS A record at VM IP
- Add GitHub Actions secrets

### 1.10 Seed Script ✅
- `scripts/seed.ts` — Creates initial admin User record
- Usage: `ADMIN_PASSWORD=password npx ts-node scripts/seed.ts`
- Or on VM: `docker compose exec app npx ts-node scripts/seed.ts`

### 1.11 README ✅
- Comprehensive documentation covering:
  - Local development setup
  - VM provisioning checklist
  - Environment variable configuration
  - Docker Compose commands
  - Deployment (automatic via GitHub Actions and manual)
  - Admin panel access
  - Phase 1 verification checklist

## Project Structure

```
cointelligence/
├── .env.example                    # Environment template (NO secrets)
├── .gitignore                      # Git ignore rules
├── .github/workflows/
│   └── deploy.yml                  # GitHub Actions CI/CD
├── Dockerfile                      # Multi-stage Docker build
├── docker-compose.yml              # Docker Compose for local/production
├── README.md                       # Comprehensive documentation
├── package.json                    # Dependencies + scripts
├── src/
│   ├── middleware.ts               # Next.js middleware
│   ├── payload.config.ts           # Payload CMS configuration
│   ├── app/
│   │   ├── layout.tsx              # Root layout with fonts
│   │   ├── globals.css             # Global styles + Tailwind
│   │   ├── api/
│   │   │   └── [...payload]/route.ts    # Payload API handler
│   │   └── (payload)/
│   │       └── admin/[[...segments]]/page.tsx  # Payload admin UI
│   ├── collections/
│   │   ├── Users.ts                # Admin users with Payload auth
│   │   └── Media.ts                # Image uploads
│   └── globals/
│       └── SiteSettings.ts         # Site-wide configuration
├── scripts/
│   └── seed.ts                     # Create initial admin user
├── traefik/
│   ├── traefik.yml                # Traefik configuration
│   └── acme.json                  # Let's Encrypt certificates (chmod 600)
└── docs/
    ├── implementation-plan.md      # 3-phase roadmap
    ├── design-and-requirements.md  # Design system + data model
    └── architecture.md             # Technical architecture
```

## Next Steps (Phase 2)

Richard must first:
1. Verify Phase 1 deliverables (see checklist below)
2. Approve Phase 1 before Phase 2 begins

Phase 2 focuses on:
- Article collection with draft/publish workflow
- All public pages (homepage, articles, about, work, connect)
- Design system and layout components
- Share buttons and OG metadata
- Responsive QA

## Phase 1 Verification Checklist

Richard should verify the following after provisioning the Azure VM:

- [ ] Navigate to `https://<domain>/admin`
- [ ] Admin login page is visible with Payload default UI
- [ ] Log in with the seeded admin user credentials
- [ ] Access the admin dashboard
- [ ] Edit `SiteSettings.siteName` → save → refresh page → value persists in DB
- [ ] Upload a test image to the Media collection
- [ ] Restart the app container: `docker compose restart app`
- [ ] Verify the uploaded image is still accessible
- [ ] Run `docker compose ps` — all three services show status `Up`

**Once verified, Richard must explicitly approve Phase 1 before Phase 2 begins.**

## Important Notes

### Payload Authentication (Phase 1)
- Using Payload CMS native authentication (not OAuth yet)
- Seed script creates admin user with email and password
- OAuth integration (Google) can be added in Phase 2 if desired

### Docker Volumes
- `postgres_data` — PostgreSQL data persists across restarts
- `media_data` — Uploaded media persists across restarts
- Backups are manual responsibility (documented in README)

### Traefik Configuration
- Automatic HTTPS via Let's Encrypt
- HTTP → HTTPS redirect enabled
- Set `ACME_EMAIL` in `.env` for Let's Encrypt notifications
- `acme.json` must have chmod 600 permissions

### GitHub Actions
Requires these secrets in GitHub repo settings:
1. `SSH_PRIVATE_KEY` — Private key for deploying to VM
2. `VM_HOST` — VM public IP or hostname
3. `VM_USER` — SSH user on VM (e.g., `azureuser`)
4. `GHCR_TOKEN` — GitHub PAT with `packages:write` scope

## File Checklist ✅

All Phase 1 deliverable files are present and configured:

**Root:**
- ✅ `.env.example`
- ✅ `.gitignore`
- ✅ `Dockerfile`
- ✅ `docker-compose.yml`
- ✅ `README.md`
- ✅ `package.json` (with `payload` script)

**GitHub:**
- ✅ `.github/workflows/deploy.yml`

**Traefik:**
- ✅ `traefik/traefik.yml`
- ✅ `traefik/acme.json`

**Source Code:**
- ✅ `src/payload.config.ts`
- ✅ `src/middleware.ts`
- ✅ `src/app/layout.tsx` (with fonts)
- ✅ `src/app/globals.css`
- ✅ `src/app/api/[...payload]/route.ts`
- ✅ `src/app/(payload)/admin/[[...segments]]/page.tsx`
- ✅ `src/collections/Users.ts`
- ✅ `src/collections/Media.ts`
- ✅ `src/globals/SiteSettings.ts`

**Scripts:**
- ✅ `scripts/seed.ts`

**Docs:**
- ✅ `docs/implementation-plan.md`
- ✅ `docs/design-and-requirements.md`
- ✅ `docs/architecture.md`

---

**Phase 1 is complete and ready for Richard's verification on the deployed Azure VM.**
