# docssheet.com — Launch Spec

**Project:** Rebrand and launch the existing Docusaurus consulting/documentation site as `docssheet.com`, on GitHub Pages, and submit for Google AdSense approval.

**Where the code lives (updated 2026-09-09):** The docssheet site lives in **this repo** (`github.com/abhishekgupta1/docssheet`) and is **live at `https://docssheet.com`**. It was seeded by importing curated content from the source site `../abhishekgupta1.github.io` — that sibling repo is left alone for the personal portfolio. File paths below refer to this repo; `../abhishekgupta1.github.io` is read-only reference for further content imports.

**Current state (2026-09-09):** Branded `docssheet`, live on the domain, all six legal/info pages footer-linked, Consent Mode v2 wired, AdSense loader on (verification) with `ADS_ENABLED = false`. `npm run build` clean, `onBrokenLinks: 'throw'`. **Content: ~42 guides + ~32 companion cheat sheets** across four tracks (SDET, SRE, SDE, AI) + the two landing pages + six info pages — two import batches (the shortlist, then a second batch — see `adsense-content-shortlist.md`). Still not imported: the MBA/leadership library, the `test-automation-tooling-landscape` sub-topic pages, the blog, and the Learn tools.

> **Content volume (D8) — resolved.** After the shortlist-only import left ~23 pages, a second batch brought it to ~80. Still smaller than the source site's ~200 but a solid original-content base (guides 2.5k–19k words). If AdSense still flags thin content, more guides remain in `../abhishekgupta1.github.io`.

**Out of scope:** Rewriting content, redesigning the theme. This is a *launch-readiness* pass — go live on the domain and pass AdSense review.

**Status legend:** ✅ done · ⚠️ partially done / needs a check · ❌ not started

---

## 1. Goals

1. Site is reachable at `https://docssheet.com` (and `https://www.docssheet.com`) with valid HTTPS, served via GitHub Pages.
2. Site correctly reflects the "docssheet" brand (name, nav, metadata) rather than the personal-portfolio identity.
3. Site meets Google AdSense's content and policy prerequisites, and the application is submitted.

## 2. Requirements

### 2.1 Domain & hosting
- **R1** ⚠️ `docssheet.com` resolves to the GitHub Pages site (apex domain via A/ALIAS records). *DNS is configured outside the repo — verify with `dig`.* See D1.
- **R2** ⚠️ `www.docssheet.com` redirects or resolves to the same site. CNAME target is still `abhishekgupta1.github.io` (the user's Pages host serves this project repo too). *Verify.*
- **R3** ⚠️ HTTPS is enforced. GitHub Pages for the **`docssheet` repo** must be enabled (Settings → Pages → Source: GitHub Actions) *and* the custom domain re-entered; "Enforce HTTPS" only after DNS verifies.
- **R4** ✅ `static/CNAME` contains exactly `docssheet.com`; copied into the build output (confirmed in `build/CNAME`).

### 2.2 Docusaurus configuration
- **R5** ✅ `docusaurus.config.js` — `url` is `https://docssheet.com`, `baseUrl` is `/`.
- **R6** ✅ `organizationName: abhishekgupta1` / `projectName: docssheet` (updated on import) match this repo. `GITHUB_REPO`/`editUrl` point at `abhishekgupta1/docssheet`. `trailingSlash: false`.
- **R7** ✅ Site title (`docssheet`), tagline, favicon, navbar, footer, and **both landing pages** (`docs/intro.md`, `cheatsheets/intro.md`) are docssheet-branded. The "Knowledge Base" wording is gone (verified absent from `build/`).
- **R8** ✅ Navbar is Docs / Cheat Sheets only. Footer is Content / Site / Legal. Projects/Articles/Resume/Certificates and the Learn dropdown (Roadmap/Skills/Quiz/Dashboard/Start) are all gone — the Learn pages were not imported.
- **R9** ✅ No stale old-domain links. The only `abhishekgupta1.github.io` strings are the legitimate GitHub repo/profile links and the `www` CNAME target.

### 2.3 SEO / crawlability
- **R10** ✅ `sitemap.xml` builds (confirmed in `build/sitemap.xml`) — lists all 23 shortlist pages + intro + the six info pages + tag/category pages, all under `https://docssheet.com`.
- **R11** ✅ `static/robots.txt` is `User-agent: * / Allow: /` and references `https://docssheet.com/sitemap.xml`. No blanket disallow.
- **R12** ✅ All 15 flagship docs + 8 cheat sheets + both landing pages carry unique front-matter `title` and `description` (checked on import). Info pages too.
- **R13** ✅ Open Graph / Twitter card metadata set (`themeConfig.image: img/og-image.png`, `twitter:card`, `og:type`), plus per-page OG images via `./plugins/og-image` (24 generated in the last build). Doc pages also emit BreadcrumbList JSON-LD (trimmed `DocItem/Content` swizzle).
- **R14** ✅ `google-site-verification` placeholder removed from `themeConfig.metadata` (branch `adsense-onboarding`). Add a real token later via a DNS TXT record or a fresh meta entry (D2).

### 2.4 AdSense prerequisites
- **R15** ✅ A **Privacy Policy** page (`/privacy`) exists, discloses cookies/`localStorage` and third-party processing including future Google AdSense, and carries a "Last updated" date.
- **R16** ✅ **About** (`/about`) and **Contact** (`/contact`) pages exist, name the real owner (Abhishek Gupta), describe the site's purpose and how content is made, and give GitHub + LinkedIn contact routes. Also present: Terms, Cookie Policy, Disclaimer — all footer-linked.
- **R17** ✅ Original, substantive content: **~80 pages** live (~42 guides 2.5k–19k words + ~32 dense cheat sheets) across SDET/SRE/SDE/AI, all original. Public + indexable on `docssheet.com`. (D8 resolved — second import batch.)
- **R18** ⚠️ No "under construction" / Lorem Ipsum on the imported paths (front-matter + WIP-marker scan was clean on import; the only "TODO" hit was inside a `grep` code example). Still run the full per-page QA in `adsense-content-shortlist.md` §4 (mobile render, code highlighting, dead external links) before submitting.
- **R19** ✅ `static/ads.txt` = `google.com, pub-1394375154476572, DIRECT, f08c47fec0942fa0` (branch `adsense-onboarding`). Clears the "ads.txt not found" warning once deployed. (`ADS_ENABLED` still false — no ads serve until approval.)
- **R20** ✅ AdSense verification wired (branch `adsense-onboarding`): the adsbygoogle loader `<script>` is emitted site-wide via a new `ADSENSE_ON` flag in `docusaurus.config.js` (true whenever `ADSENSE_CLIENT` is real), `src/data/site.js` `ADSENSE_CLIENT = 'ca-pub-1394375154476572'`. `ADS_ENABLED` stays `false` so no `<AdSlot>` renders. Merge → deploy → click Verify in AdSense (D3).
- **R21** ✅ Consent infrastructure is in place ahead of ads: Google Consent Mode v2 defaults to `denied` for all ad/analytics storage in `docusaurus.config.js` headTags; `src/components/ConsentBanner` flips them on acceptance; `CONSENT_REQUIRED = true`. Note for later: for full EEA/UK compliance a Google-certified CMP (or Funding Choices) should replace the hand-rolled banner once approved.

### 2.5 Verification
- **R22** ✅ `npm run build` is clean with **zero** broken-link warnings, and `onBrokenLinks` is `'throw'` (D4 resolved). Cross-links to non-imported pages were de-linked on import.
- **R23** ⚠️ `https://docssheet.com` verified via `curl`: all routes 200, `/` → `/docs/intro`, `www` 301s to apex, `/CNAME` correct. A real click-through in a browser on the live domain still recommended.
- **R24** ⚠️ Mobile checked at 390px viewport locally (hamburger nav, TOC collapse, banner reflow, redrawn SVG). A real-device pass on the live domain still recommended.

### 2.6 Open decisions
- **D1** ✅ **Resolved.** Domain at GoDaddy; apex A-records + `www` CNAME → `abhishekgupta1.github.io` set; GitHub Pages on for the `docssheet` repo (Source: GitHub Actions); custom domain + Enforce HTTPS. `https://docssheet.com` is live.
- **D2** ✅ **Resolved.** `google-site-verification` placeholder removed (branch `adsense-onboarding`). Search Console itself not set up — add later via DNS TXT if wanted.
- **D3** ⚠️ AdSense. Account exists; `docssheet.com` added ("Requires review"); ID `ca-pub-1394375154476572`. Repo wiring done on branch `adsense-onboarding`. **Left:** merge that branch → `main`, then click Verify + Submit in AdSense (R20).
- **D4** ✅ **Resolved.** `onBrokenLinks: 'throw'` is set; build is clean.
- **D5** ❌ Consent. When to replace the hand-rolled `ConsentBanner` with a Google-certified CMP / Funding Choices for EEA/UK — targeted post-approval, unscheduled (R21).
- **D6** ❌ Analytics. GA4 property and/or `GOATCOUNTER_CODE` at launch, or stay dark (see §3).
- **D7** ❌ Ownership. Who submits the AdSense application, and by when.
- **D8** ✅ **Resolved.** Second import batch added ~27 guides + ~23 cheat sheets (SDET tools, SRE guides incl. the incident-response cluster, AI track). Site is ~80 pages. Build clean.
- **D9** ✅ **Resolved.** `import-docssheet-site` merged to `main` via PR #1; site auto-deployed.

## 3. Non-requirements / explicitly deferred
- Google Analytics / GA4 — `gtag` preset block is present but commented out; enable after launch with a real property ID. GoatCounter (cookieless) is wired but `GOATCOUNTER_CODE` is empty.
- Search Console property — recommended, not required for AdSense.
- Ad unit placement/styling — only possible after approval. `<AdSlot>` output is fully gated by `ADS_ENABLED`.
- `static/ads.txt` / `ADSENSE_CLIENT` — already set to the real `pub-1394375154476572`; only `ADS_ENABLED` flips on approval.
- Content expansion — deferred, not ruled out. If a reviewer flags thin content, import more of the existing guides from `../abhishekgupta1.github.io` (see D8).

## 4. Acceptance criteria
- [x] `https://docssheet.com` loads over HTTPS; `https://www.docssheet.com` 301s to it. (Browser click-through still recommended.)
- [x] `docs/intro.md` (and `cheatsheets/intro.md`) rebranded — no "Knowledge Base" / personal-portfolio wording in visible content or metadata.
- [x] `google-site-verification` placeholder removed.
- [x] Hidden nav sections (Projects, Articles, Resume, Certificates, Learn tools) are gone from navbar and footer.
- [x] Privacy Policy, About, Contact (+ Terms, Cookie Policy, Disclaimer) are present and linked from the footer.
- [x] `sitemap.xml` builds, lists the shortlist URLs, and points at `docssheet.com`; `robots.txt` is correct.
- [x] `npm run build` clean of broken-link warnings; `onBrokenLinks: 'throw'`.
- [ ] Per-page QA (`adsense-content-shortlist.md` §4) passed on the flagship docs + cheat sheets.
- [x] `import-docssheet-site` merged to `main`; GitHub Pages enabled for the `docssheet` repo.
- [x] Content volume raised to ~80 pages (D8).
- [ ] `adsense-onboarding` merged; AdSense "Verify" clicked and application submitted with `docssheet.com`.
- [ ] Remaining open decisions (D5–D7, §2.6) each have a recorded answer before/around submission.
