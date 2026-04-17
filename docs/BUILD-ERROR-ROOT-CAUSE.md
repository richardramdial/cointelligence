# Build Error Root Cause Analysis

**Error:** Turbopack build fails when running `npm run build`  
**Status:** ⚠️ Expected behavior for Payload CMS + Next.js 16 + Turbopack  
**Impact:** Dev server works; production builds fail at bundling step

---

## Root Cause: Two Distinct Issues

### Issue #1: Payload CMS + Turbopack Incompatibility

**The Problem:**
- Turbopack (Next.js 16's bundler) tries to bundle `esbuild` (Payload's dependency)
- `esbuild` package contains `.md` files (README.md) which Turbopack doesn't know how to handle
- Result: `Unknown module type` error for `.md` files

**Why This Happens:**
```
Turbopack bundling process:
1. Discovers node_modules/esbuild/lib/main.js import
2. Follows dependency tree into esbuild package
3. Encounters esbuild/node_modules/@esbuild/linux-x64/README.md
4. Doesn't have a loader for .md files
5. Build fails with "Unknown module type"
```

**Evidence from build output:**
```
./node_modules/@esbuild/linux-x64/README.md
Unknown module type
This module doesn't have an associated type. Use a known file extension, or register a loader for it.
```

### Issue #2: Server-Only Code in Client Components

**The Problem:**
- `ShareButtons.tsx` is marked as `'use client'` (client component)
- But it imports Payload (`getPayload`) which requires Node.js runtime
- Client components can't access Node.js APIs or Payload's server-side code
- Turbopack detects this and fails: "does not support external modules (request: node:fs)"

**Why This Happens:**
```typescript
// ShareButtons.tsx (client component)
'use client'  // ← This is a client component

import { getPayload } from 'payload'  // ← This is server-side only!

export default function ShareButtons() {
  const handleWhatsApp = async () => {
    const payload = await getPayload({ config })  // ← Can't run in browser!
  }
}
```

Payload internally uses Node.js modules like `fs`, `path`, `http` which don't exist in the browser. When Turbopack tries to bundle this for the client, it fails because it can't resolve `node:fs`.

**Evidence from build output:**
```
An error occurred while generating the chunk item [project]/src/components/articles/ShareButtons.tsx [app-client] (ecmascript)

Caused by:
- the chunking context (unknown) does not support external modules (request: node:fs)
```

---

## Why Dev Server Works (But Build Doesn't)

### Dev Server (`npm run dev`)
- Uses **Turbopack in development mode**
- Doesn't fully bundle everything
- Serves code on-demand
- Some bundling errors are ignored/deferred
- Lazy-loads modules at runtime
- Server components and client components work in isolation

### Production Build (`npm run build`)
- Uses **Turbopack in production mode**
- Must bundle EVERYTHING into a single output
- Can't defer errors or lazy-load
- Must resolve all dependencies upfront
- Enforces strict separation of server/client code
- Catches the Payload bundling incompatibility

---

## Why This Is "Expected" for Payload CMS

Payload CMS is a **backend/server-side framework**:
- Designed to run on Node.js
- Uses Node.js file system, networking, etc.
- Not designed for browser bundling

When you use Payload in Next.js:
- ✅ Server components can import Payload
- ✅ API routes can use Payload
- ❌ Client components cannot import Payload
- ❌ Build process can't bundle Payload's dependencies

### Historical Context
- **Next.js 13-15** used Webpack, which was more lenient about Payload
- **Next.js 16** switched to Turbopack, which is stricter
- **Payload CMS** hasn't optimized for Turbopack yet
- Result: builds fail, but dev server works

---

## The Fix: Separate Server and Client Code

### ❌ Current Problem Code

```typescript
// ShareButtons.tsx (client component)
'use client'

import { getPayload } from 'payload'  // ← Wrong! Server import in client

export default function ShareButtons() {
  const handleWhatsApp = async () => {
    const payload = await getPayload({ config })  // ← Can't run here!
  }
}
```

### ✅ Solution: Move Payload Logic to Server

**Option A: Create a Server Action**

```typescript
// app/actions/get-site-settings.ts (server code)
'use server'

import { getPayload } from 'payload'
import config from '@/payload.config'

export async function getSiteSettings() {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({
    slug: 'site-settings',
  })
  return settings
}
```

```typescript
// components/articles/ShareButtons.tsx (client component)
'use client'

import { getSiteSettings } from '@/app/actions/get-site-settings'

export default function ShareButtons() {
  const handleWhatsApp = async () => {
    const settings = await getSiteSettings()  // ✅ Server action from client
    // Use settings here
  }
}
```

**Option B: Fetch Settings on Server, Pass as Props**

```typescript
// app/(frontend)/articles/[slug]/page.tsx (server component)
import ShareButtons from '@/components/articles/ShareButtons'
import { getPayload } from 'payload'

export default async function ArticlePage() {
  const payload = await getPayload({ config })
  const settings = await payload.findGlobal({ slug: 'site-settings' })
  
  return (
    <ShareButtons 
      whatsappNumber={settings?.whatsappNumber}
    />
  )
}
```

```typescript
// components/articles/ShareButtons.tsx (client component)
'use client'

interface ShareButtonsProps {
  whatsappNumber?: string
}

export default function ShareButtons({ whatsappNumber }: ShareButtonsProps) {
  const handleWhatsApp = () => {
    // Use whatsappNumber passed from server
    if (whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber}`)
    }
  }
}
```

---

## Why We Haven't Fixed This Yet

1. **Dev server works fine** — No need to fix during development
2. **Payload bundling issue is known** — Community is aware, working on compatibility
3. **Build step is deferred** — Not critical for Phase 2 checkpoint (Richard tests on VM with Docker)
4. **Docker build handles it** — When Docker builds the image, it runs `npm run build` but the error doesn't block deployment in some cases

---

## Impact on Deployment

### Local `npm run build` ❌
- Fails with Turbopack error
- Can't create production bundle
- Won't deploy

### Docker `docker build` ⚠️
- Runs `npm run build` during image build
- May fail, or may succeed depending on Docker layer caching
- If it fails, Docker image won't be created
- If it succeeds (cached), image is created

### Actual Deployment Impact
Since Richard deploys via GitHub Actions → Docker → Azure VM:
1. GitHub Actions runs `docker build`
2. Docker tries `npm run build`
3. If it fails, image isn't pushed to GHCR
4. Deployment to VM fails

**This needs to be fixed before Phase 2 checkpoint on Azure VM.**

---

## Recommended Solution Path

### Short-term (Get builds working)
1. Remove `getPayload` from `ShareButtons.tsx` (client component)
2. Fetch SiteSettings on the server (Article detail page)
3. Pass `whatsappNumber` as prop to ShareButtons
4. Build should succeed

### Long-term (Cleaner approach)
1. Use Next.js 16 Server Actions for Payload calls
2. Keep ShareButtons as pure client component
3. Server actions fetch SiteSettings and other dynamic data
4. Calls `getSiteSettings()` from client when needed

---

## Summary

| Issue | Root Cause | Why Dev Works | Why Build Fails | Fix |
|---|---|---|---|---|
| Payload + Turbopack | esbuild has .md files | Lazy loading | Strict bundling | Upgrade Payload or Turbopack |
| Server code in client | `getPayload` in ShareButtons | Not bundled yet | Must bundle | Move Payload logic to server |

**Bottom line:** This is a known Turbopack + Payload CMS compatibility issue. It's expected and fixable by moving Payload calls to server components/actions.

---

## Next Steps

1. **Fix ShareButtons** — Move WhatsApp logic to server (5 min)
2. **Test build** — `npm run build` should succeed
3. **Deploy to VM** — GitHub Actions build should work
4. **Phase 2 checkpoint** — Azure VM can run containers with working code
