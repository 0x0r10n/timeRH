# TIME — The Most Valuable Asset

Landing site for **$TIME** (`0x8755c1f62cfb0fad7a3dfe6ee00585b594bcc981`), an interactive
scroll piece with a live price ticker.

- X: [@TIME_RH1](https://x.com/TIME_RH1)
- Community: [x.com/i/communities/2008924415724077152](https://x.com/i/communities/2008924415724077152)

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind v4.

## Local development

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

```bash
pnpm build && pnpm start   # production build
```

## Live price

`app/api/price/route.ts` proxies DexScreener and returns only the fields the page needs:

```
GET /api/price
→ { priceUsd, priceNative, change24h, marketCap, liquidity, volume24h, url }
```

Upstream is `https://api.dexscreener.com/latest/dex/tokens/<contract>`. Responses are cached
for 20s server-side; the client polls every 30s and pauses while the tab is backgrounded.
Routing through the API avoids browser CORS and rate-limit exposure, and keeps the client
payload small. If the feed is unreachable the route returns 502 and the ticker shows `—`
rather than breaking the page.

## Deploying to Vercel

The project is a stock Next.js app — Vercel auto-detects the framework, build command and
output. No `vercel.json` is required.

1. Push this repository to GitHub.
2. In Vercel: **Add New → Project → Import** the repo. Leave the build settings as detected.
3. Set the environment variable below, then deploy.

### Environment variables

| Name | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Absolute base URL (e.g. `https://time.xyz`) used to resolve the Open Graph / X card image. |

If unset, the app falls back to `VERCEL_PROJECT_PRODUCTION_URL`, which Vercel provides
automatically — so link previews still work, they just point at the `.vercel.app` domain.
Set `NEXT_PUBLIC_SITE_URL` once a custom domain is attached.

### Image optimization

Remote artwork is served through `next/image` (AVIF/WebP, per-breakpoint resizing), with the
blob host allow-listed in `next.config.mjs`. This runs on Vercel's image optimizer with no
extra setup. If you ever move the artwork to a different host, add it to `images.remotePatterns`.
