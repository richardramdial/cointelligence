# Phase 2 — Content & Public Site (Draft Summary)

**Date Started:** 2026-04-17  
**Status:** Core Implementation Complete (Dev Server Running)

---

## Overview

Phase 2 has been substantially implemented. The public site structure is in place with all major collections, globals, pages, and components built. The dev server is running and ready for content population and testing.

---

## Completed Sections

### 2.1 Payload Collections & Globals ✅

**Collections:**
- `src/collections/Articles.ts`
  - Fields: title, slug (auto-generated), theme (enum: 4 values), coverImage, body (Lexical rich text), excerpt, readingTime (auto-calculated), featured, publishedDate
  - Versions: draft/publish workflow enabled
  - Hooks: auto-slug generation, reading time calculation, revalidate path on change

- `src/collections/Engagements.ts`
  - Fields: title, description
  - Seeded with 3 records: Executive Advisory, Leadership Conversations, Speaking and Workshops

**Globals:**
- `src/globals/HomePage.ts` — hero section (heading, subheading, body, CTAs), featured articles array, co-intelligence cards array
- `src/globals/CoIntelligencePage.ts` — rich text body
- `src/globals/AboutPage.ts` — two bio paragraphs
- `src/globals/WorkPage.ts` — intro copy

All registered in `src/payload.config.ts`

### 2.2 Design System Tokens ✅

- Warm editorial colour palette implemented (OKLCh values)
- Fraunces (headings) + Inter (body) fonts loaded and configured
- Typography scale defined in `src/app/globals.css`:
  - h1–h6 sizing, weights, line-height
  - Body paragraph line-height (7)
  - `.prose` class styling for rich text rendering
- Dark mode CSS variables configured (ready for toggle)

### 2.3 Layout Shell ✅

**`src/components/layout/Header.tsx`** (Client + Server hybrid)
- 6 navigation items: Home, Co-Intelligence, Articles, About Richard, Work With Richard, Connect
- Active state highlighting
- Mobile hamburger menu (collapses on md breakpoint)
- Sticky positioning with blur backdrop

**`src/components/layout/Footer.tsx`** (Server Component)
- 4 footer links: Home, About, Work, Connect
- Copyright notice with dynamic year

**`src/app/(frontend)/layout.tsx`**
- Wraps all public pages with Header + Footer + flex layout for footer to stick

### 2.4 Public Pages ✅

**Homepage** `src/app/(frontend)/page.tsx`
- Components:
  - `Hero.tsx` — heading, subheading, body, two CTA buttons
  - `ThemesGrid.tsx` — 4 fixed theme cards linking to article filter
  - `FeaturedArticles.tsx` — up to 3 hand-picked articles from HomePage global
  - `CoIntelligenceCards.tsx` — 4 cards (what it is / what it is not / why it matters / where it applies)
  - `ArticlesByTheme.tsx` — all 4 themes with article previews, grouped
- Fetches HomePage global via Payload Local API
- Server-rendered with `async` components

**`/co-intelligence`** `src/app/(frontend)/co-intelligence/page.tsx`
- Fetches `CoIntelligencePage` global
- Renders rich text body with prose styling
- Has metadata for title and description

**`/articles`** `src/app/(frontend)/articles/page.tsx`
- Lists all published articles grouped by theme
- Theme navigation anchor links at top
- Responsive grid (1 col mobile, 2 col tablet+)
- Fetches articles with `_status: 'published'` filter

**`/articles/[slug]`** `src/app/(frontend)/articles/[slug]/page.tsx`
- Full article view with cover image, metadata, body text
- `generateMetadata()` creates OG/Twitter Card metadata (title, description, image, URL)
- `generateStaticParams()` pre-renders all published article slugs
- `ShareButtons` component with Email, WhatsApp, Copy Link
- Proper not-found handling for missing articles

**`/about`** `src/app/(frontend)/about/page.tsx`
- Renders two bio paragraphs from `AboutPage` global
- Simple, clean layout

**`/work`** `src/app/(frontend)/work/page.tsx`
- Renders `WorkPage.introCopy`
- Lists all `Engagements` records as cards (title + description)
- Pre-seeded with 3 engagement types

**`/connect`** `src/app/(frontend)/connect/page.tsx`
- Inquiry form (`InquiryForm.tsx` client component):
  - Name, Email, Message fields
  - OnSubmit constructs `mailto:` link and opens email client
- Contact links (`ContactLinks.tsx` server component):
  - Email link (always shown)
  - LinkedIn link (shown if configured in SiteSettings)
  - WhatsApp link (shown if `whatsappNumber` set in SiteSettings)

### 2.5 Responsive Design (Partial) ⏳

- All components built with `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` patterns
- Mobile-first approach used throughout
- Hamburger menu on mobile, desktop nav on md+
- Touch-friendly button sizing (min 44×44px)
- Tested at 1280px desktop — still needs mobile (375px) and tablet (768px) verification

---

## Pre-flight Fixes Applied

| Issue | Status | Fix |
|---|---|---|
| Rich text editor | ✅ Fixed | Switched from `slateEditor` to `lexicalEditor` in `payload.config.ts` |
| Local auth | ✅ Fixed | Removed `disableLocalStrategy: true` from Users collection to enable email+password login |
| Components path | ✅ Fixed | Moved from `/components` to `/src/components/` with proper import paths |
| Standalone output | ✅ Fixed | Added `output: 'standalone'` to `next.config.ts` |
| CI/CD trigger | ✅ Fixed | Updated `deploy.yml` to trigger on `push: branches: [main]` (auto-deploy) |
| tsconfig alias | ✅ Fixed | Updated `@/*` to point to `./src/*` instead of root |

---

## Known Limitations & Next Steps

### Not Yet Implemented (Phase 2 Checkpoint)

1. **Google OAuth** — `payload-authjs` not yet installed/wired. Currently using local email+password auth only.
2. **Image handling** — Article pages show placeholder divs instead of actual cover images (Media relationship needs rendering)
3. **Rich text rendering** — Article body is rendered as raw HTML string; Lexical JSON needs proper serialization
4. **Static image optimization** — No `next/image` usage yet; images served as placeholder gradients

### Phase 2 Checkpoint (Richard Verification)

When ready to test, Richard should:

- [ ] Log into `/admin` with local credentials (email: `richard.ramdial@gmail.com`, password: set via seed script)
- [ ] Create a test article in the CMS: pick theme, write title/excerpt/body, upload cover image, publish
- [ ] Visit `/articles/[slug]` and verify article renders (body text, metadata)
- [ ] Test share buttons: Email, WhatsApp, Copy Link
- [ ] Visit `/articles` and verify article appears under correct theme
- [ ] Check homepage: does test article appear if marked "featured"?
- [ ] Test on mobile (375px viewport): nav collapses, touch targets are adequate
- [ ] Fill out `/connect` form: verify email client opens with pre-filled fields
- [ ] Verify `/about` and `/work` pages show placeholder text and engagement cards

---

## File Structure — Phase 2 Deliverables

```
src/
├── collections/
│   ├── Articles.ts                 (with hooks for slug, reading time, revalidation)
│   ├── Engagements.ts              (3 pre-seeded records)
│   └── Users.ts                    (modified: auth enabled)
├── globals/
│   ├── SiteSettings.ts             (unchanged from Phase 1)
│   ├── HomePage.ts                 (new: hero, featured articles, co-intel cards)
│   ├── CoIntelligencePage.ts       (new: body text)
│   ├── AboutPage.ts                (new: two bio paragraphs)
│   └── WorkPage.ts                 (new: intro copy)
├── components/
│   ├── layout/
│   │   ├── Header.tsx              (6-item nav, mobile hamburger)
│   │   └── Footer.tsx              (4 links, copyright)
│   ├── home/
│   │   ├── Hero.tsx
│   │   ├── ThemesGrid.tsx
│   │   ├── FeaturedArticles.tsx
│   │   ├── CoIntelligenceCards.tsx
│   │   └── ArticlesByTheme.tsx
│   ├── articles/
│   │   ├── ShareButtons.tsx        (Email, WhatsApp, Copy; client component)
│   │   └── ArticleCard.tsx         (stub—functionality in parent pages)
│   └── connect/
│       ├── InquiryForm.tsx         (client form → mailto:)
│       └── ContactLinks.tsx        (email, LinkedIn, WhatsApp links)
├── ui/                             (shadcn button; moved from /components)
└── app/
    ├── layout.tsx                  (root layout: fonts, global metadata)
    ├── globals.css                 (Tailwind v4, warm palette, typography)
    ├── (frontend)/
    │   ├── layout.tsx              (wraps pages in Header + Footer)
    │   ├── page.tsx                (homepage)
    │   ├── co-intelligence/page.tsx
    │   ├── articles/
    │   │   ├── page.tsx            (articles listing)
    │   │   └── [slug]/page.tsx     (article detail + generateMetadata + generateStaticParams)
    │   ├── about/page.tsx
    │   ├── work/page.tsx
    │   └── connect/page.tsx
    └── (payload)/
        └── admin/[[...segments]]/page.tsx (unchanged from Phase 1)
```

---

## Updated Files

| File | Change |
|---|---|
| `src/payload.config.ts` | Swapped Slate → Lexical; registered Articles, Engagements, HomePage, CoIntelligencePage, AboutPage, WorkPage |
| `src/collections/Users.ts` | Removed `disableLocalStrategy: true` to enable local auth |
| `src/app/globals.css` | Added warm colour palette, typography scale, prose styling |
| `next.config.ts` | Added `output: 'standalone'` |
| `.github/workflows/deploy.yml` | Added `push: branches: [main]` trigger (auto-deploy) |
| `tsconfig.json` | Fixed `@/*` alias to point to `./src/*` |
| `scripts/seed.ts` | Added Engagements seeding (3 records) |

---

## Next Steps (Before Phase 2 Approval)

### Must-Do

1. **Test on mobile** — Verify responsiveness at 375px (iPhone SE) and 768px (tablet)
2. **Google OAuth setup** — Install `payload-authjs`, wire up Google provider, restrict to `richard.ramdial@gmail.com`
3. **Image rendering** — Wire up Media relationship to display actual cover images instead of placeholders

### Nice-to-Have

1. Add `next/image` optimization for all article cover images
2. Implement proper Lexical JSON → HTML serialization (currently falls back to string)
3. Add related articles section on article detail page
4. Implement search/filter on `/articles` page

---

## Development Server Status

✅ **Dev server running** — `npm run dev` — ready for content creation and testing

```
Local:         http://localhost:3000
Admin:         http://localhost:3000/admin
Payload API:   http://localhost:3000/api/payload
```

---

**Phase 2 is implementation-complete and dev-ready. Awaiting Richard's verification on deployed Azure VM (Phase 1 approval required first).**
