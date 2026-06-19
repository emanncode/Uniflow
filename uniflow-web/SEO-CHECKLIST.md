# Uniflow SEO checklist (technical + what you do personally)

Your production site: **https://uniflowapp.xyz**

Target branded searches: **uniflow**, **uniflowapp**, **uniflow app**

> Ranking #1 for a brand name takes time. These steps stack technical SEO (done in code) with authority signals only you can build.

---

## Already implemented in code (after deploy)

- [x] Page titles, descriptions, keywords (`src/lib/seo.ts`)
- [x] Open Graph + Twitter cards + auto-generated share image (`/opengraph-image`)
- [x] `robots.txt` — indexes marketing pages, blocks `/dashboard`, `/u`, `/api`
- [x] `sitemap.xml` — `/` and `/register`
- [x] JSON-LD structured data (Organization, WebSite, SoftwareApplication)
- [x] Canonical URLs on landing + register
- [x] `noindex` on admin dashboards and university portals
- [x] `metadataBase` set to `uniflowapp.xyz`

After deploy, verify:

- https://uniflowapp.xyz/robots.txt
- https://uniflowapp.xyz/sitemap.xml
- https://uniflowapp.xyz/opengraph-image

---

## Week 1 — Search engines (do these first)

### 1. Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://uniflowapp.xyz`
3. Verify via DNS TXT record (recommended) or HTML tag
4. If using HTML tag, copy the verification code into Vercel env:
   ```
   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-code-here
   ```
5. Submit sitemap: `https://uniflowapp.xyz/sitemap.xml`
6. Use **URL Inspection** → Request indexing for `/` and `/register`

### 2. Bing Webmaster Tools

1. [Bing Webmaster](https://www.bing.com/webmasters)
2. Add site + verify
3. Optional env var:
   ```
   NEXT_PUBLIC_BING_SITE_VERIFICATION=your-code-here
   ```
4. Submit the same sitemap

### 3. Domain consistency

Pick **one** canonical host and stick to it:

- Recommended: `https://uniflowapp.xyz` (no `www`)
- In Vercel → Domains: set apex as primary; redirect `www` → apex if you add `www`

All links everywhere should use the same URL.

---

## Week 1–2 — Brand presence (high impact for “uniflow” searches)

### 4. Social profiles (use exact brand name **Uniflow**)

Create and complete profiles; link to `https://uniflowapp.xyz` in every bio:

| Platform | Handle suggestion | Link in bio |
|----------|-------------------|-------------|
| X (Twitter) | `@uniflowapp` | uniflowapp.xyz |
| LinkedIn | Company: **Uniflow** | uniflowapp.xyz |
| GitHub | Org/repo already exists | Add website URL |
| Instagram (optional) | `@uniflowapp` | uniflowapp.xyz |

Then add URLs to Vercel env (feeds JSON-LD `sameAs`):

```
NEXT_PUBLIC_SOCIAL_GITHUB=https://github.com/Emann-Code-01/Uniflow
NEXT_PUBLIC_SOCIAL_LINKEDIN=https://linkedin.com/company/your-page
NEXT_PUBLIC_SOCIAL_TWITTER=https://x.com/uniflowapp
```

Redeploy after setting env vars.

### 5. Google Business Profile (optional)

If you have a registered business name **Uniflow**, create a [Google Business Profile](https://business.google.com) with website `https://uniflowapp.xyz`. Helps branded local searches.

---

## Ongoing — Content & links (what moves rankings)

### 6. Use the brand name on-page

Naturally include in copy (not spam):

- “**Uniflow**” and “**UniflowApp**” on the landing page
- “Register on **uniflowapp.xyz**” in university outreach emails
- App store listing title: **Uniflow — University Timetable**

### 7. Get backlinks (most important long-term)

Each link from a real site helps Google trust `uniflowapp.xyz`:

- [ ] Add website URL to GitHub repo **About** section
- [ ] Pin README badge/link at top of [Uniflow repo](https://github.com/Emann-Code-01/Uniflow)
- [ ] University partners: “Powered by Uniflow” on their site or student handbook PDF
- [ ] Submit to education/startup directories (Product Hunt, BetaList, Nigerian tech blogs)
- [ ] Guest post or interview mentioning Uniflow + link
- [ ] Personal LinkedIn/Twitter posts linking to launch

### 8. Content (blog / docs)

Add a `/blog` or `/docs` later with posts like:

- “How universities can publish timetables in one day with Uniflow”
- “Uniflow vs manual Excel timetables”

Each post targets long-tail keywords and links back to home.

### 9. App store SEO (when live)

- **Title:** Uniflow — University Timetable
- **Subtitle:** Campus schedules & class updates
- **Keywords:** uniflow, uniflowapp, university, timetable, campus
- **Support URL:** https://uniflowapp.xyz

---

## Technical checks (monthly)

- [ ] [PageSpeed Insights](https://pagespeed.web.dev/) on `uniflowapp.xyz` — aim 90+ mobile
- [ ] [Rich Results Test](https://search.google.com/test/rich-results) on homepage
- [ ] [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) — refresh OG cache after deploy
- [ ] Search Console → **Coverage** — fix any crawl errors
- [ ] Search Console → **Performance** — track impressions for “uniflow” / “uniflowapp”

---

## What affects “uniflow” vs “uniflowapp” ranking

| Factor | You control? | Notes |
|--------|--------------|-------|
| Exact brand in title/meta | ✅ Code | Done |
| Domain contains `uniflowapp` | ✅ | Strong signal for “uniflowapp” |
| Search Console submission | ✅ | Required for fast indexing |
| Social + `sameAs` schema | ✅ | Ties brand entities together |
| Backlinks | ✅ | Biggest lever over 3–6 months |
| Competitors named “Uniflow” | ❌ | May outrank until your authority grows |
| Search volume / age | ⏳ | New domains take weeks–months |

---

## Quick wins checklist (copy & tick off)

```
[ ] Deploy latest code to uniflowapp.xyz
[ ] Verify site in Google Search Console
[ ] Submit sitemap.xml
[ ] Request indexing for homepage
[ ] Set GitHub repo website = https://uniflowapp.xyz
[ ] Create LinkedIn company page “Uniflow”
[ ] Create X account @uniflowapp
[ ] Add social URLs to Vercel env + redeploy
[ ] Share launch post with link to uniflowapp.xyz
[ ] Ask first university partner to mention Uniflow on their site
```

---

## Files reference

| File | Purpose |
|------|---------|
| `src/lib/seo.ts` | Titles, OG, keywords, JSON-LD data |
| `src/app/robots.ts` | Crawl rules |
| `src/app/sitemap.ts` | Public URLs for Google |
| `src/app/opengraph-image.tsx` | Share preview image |
| `src/components/seo/JsonLd.tsx` | Structured data on homepage |

Questions or new pages to index? Add paths to `publicSitemapPaths` in `src/lib/seo.ts`.