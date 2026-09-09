# docssheet.com — Launch Spec

**Project:** Rebrand and launch the existing Docusaurus consulting/documentation site as `docssheet.com`, on GitHub Pages, and submit for Google AdSense approval.

**Where the code lives (updated 2026-09-09):** The docssheet site now lives in **this repo** (`github.com/abhishekgupta1/docssheet`), imported on branch `import-docssheet-site` (commit "Import docssheet site (shortlist scope)"). It is a **shortlist-scoped** copy of the source site at `../abhishekgupta1.github.io` — that sibling repo is now left alone and will be repurposed as a personal portfolio later. File paths below (`docusaurus.config.js`, `src/data/site.js`, `docs/intro.md`, `static/CNAME`, …) refer to this repo. `../abhishekgupta1.github.io` is read-only reference.

**Current state (2026-09-09):** The imported site is branded `docssheet`, `static/CNAME` is `docssheet.com`, `url`/`baseUrl` are set, all six legal/info pages exist and are footer-linked, Google Consent Mode v2 is wired, and AdSense is gated behind `ADS_ENABLED = false`. `npm run build` is clean and `onBrokenLinks` is now `'throw'`. **Content scope: 15 flagship guides + 8 companion cheat sheets** (SDET/SRE/SDE) + the two landing pages + the six info pages — see `adsense-content-shortlist.md`. The MBA/AI tracks, the blog, and the Learn tools (roadmap/skills/quiz/dashboard/start) were **not** imported.

> ⚠️ **Content-volume tradeoff:** the source site's ~200 pages were the shortlist doc's stated reason quantity "is not the risk." The imported site has ~23 substantive pages. That is still a real body of long-form original content (several guides 3k–19k words), but the "well past the sufficient-content bar" margin is gone. If AdSense pushes back on low-value/thin content, the fix is to import more of the existing guides from `../abhishekgupta1.github.io` — the content already exists.

**Out of scope:** Rewriting content, redesigning the theme, adding new documentation sections. This is a *launch-readiness* pass — the minimum set of changes needed to go live on the new domain and pass AdSense review.

**Out of scope:** Rewriting content, redesigning the theme, adding new documentation sections. This is a *launch-readiness* pass — the minimum set of changes needed to go live on the new domain and pass AdSense review.

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
- **R14** ⚠️ `themeConfig.metadata` still ships `google-site-verification: REPLACE_WITH_SEARCH_CONSOLE_TOKEN`. Replace with the real token or remove the entry — see D2.

### 2.4 AdSense prerequisites
- **R15** ✅ A **Privacy Policy** page (`/privacy`) exists, discloses cookies/`localStorage` and third-party processing including future Google AdSense, and carries a "Last updated" date.
- **R16** ✅ **About** (`/about`) and **Contact** (`/contact`) pages exist, name the real owner (Abhishek Gupta), describe the site's purpose and how content is made, and give GitHub + LinkedIn contact routes. Also present: Terms, Cookie Policy, Disclaimer — all footer-linked.
- **R17** ⚠️ Original, substantive content: **23 pages** imported (15 guides 3k–19k words + 8 dense cheat sheets), all original. Smaller than the source site — see the content-volume tradeoff note at the top. Confirm public + indexable after the live-domain cutover.
- **R18** ⚠️ No "under construction" / Lorem Ipsum on the imported paths (front-matter + WIP-marker scan was clean on import; the only "TODO" hit was inside a `grep` code example). Still run the full per-page QA in `adsense-content-shortlist.md` §4 (mobile render, code highlighting, dead external links) before submitting.
- **R19** ⚠️ `static/ads.txt` exists but is an inert comment block (no real publisher line — correct, since the pub ID is issued only after approval). Google will show an "ads.txt not found / not authorized" warning until then; not a launch blocker.
- **R20** ❌ AdSense **verification tag** is not on the site. `src/data/site.js` has `ADS_ENABLED = false` and `ADSENSE_CLIENT = 'ca-pub-0000000000000000'`, so no AdSense code is injected. Adding the verification snippet (loader `<script>` or `<meta name="google-adsense-account">`) is part of starting the application — without enabling ad slots.
- **R21** ✅ Consent infrastructure is in place ahead of ads: Google Consent Mode v2 defaults to `denied` for all ad/analytics storage in `docusaurus.config.js` headTags; `src/components/ConsentBanner` flips them on acceptance; `CONSENT_REQUIRED = true`. Note for later: for full EEA/UK compliance a Google-certified CMP (or Funding Choices) should replace the hand-rolled banner once approved.

### 2.5 Verification
- **R22** ✅ `npm run build` is clean with **zero** broken-link warnings, and `onBrokenLinks` is now `'throw'` (D4 resolved) so regressions fail the build. Cross-links to non-imported pages were de-linked on import.
- **R23** ❌ Manual smoke test on the live domain: homepage redirect → `/docs/intro`, nav, footer links, docs pages, cheat sheets, 404 page.
- **R24** ❌ Mobile responsiveness spot-check (the redrawn 3-track SVG on `docs/intro.md`, wide tables/code blocks in the guides).

### 2.6 Open decisions (unresolved as of 2026-09-09)
Not "deferred" — these shape or block the steps above and need an answer:
- **D1** ❌ Registrar / DNS + Pages. Confirm the registrar for `docssheet.com` and that apex A-records + `www` CNAME are in place. **New:** GitHub Pages must be turned on for the `docssheet` repo (Settings → Pages → Source: GitHub Actions) and the custom domain set — the imported `deploy.yml` runs on push to `main` but Pages itself isn't enabled yet. `www` CNAME still targets `abhishekgupta1.github.io`.
- **D2** ❌ Search Console. Create a domain property for a real verification token, **or** delete the `google-site-verification` meta entry. Choose before shipping (R14). Recommended, not required.
- **D3** ❌ AdSense account. Confirm an account exists (or create one), then pick the verification-tag form — `<script>` loader vs `<meta name="google-adsense-account">`. Must carry the real `ca-pub-…` ID; the `ca-pub-0000000000000000` placeholder in `src/data/site.js` will not verify (R20).
- **D4** ✅ **Resolved.** `onBrokenLinks: 'throw'` is set; build is clean.
- **D5** ❌ Consent. When to replace the hand-rolled `ConsentBanner` with a Google-certified CMP / Funding Choices for EEA/UK — targeted post-approval, unscheduled (R21).
- **D6** ❌ Analytics. GA4 property and/or `GOATCOUNTER_CODE` at launch, or stay dark (see §3).
- **D7** ❌ Ownership. Who submits the AdSense application, and by when.
- **D8** ❌ **New — content volume.** Decide whether 23 pages is enough to submit, or import more guides from `../abhishekgupta1.github.io` first. Cheapest hedge against a thin-content rejection (see top-of-doc note, R17).
- **D9** ❌ **New — merge `import-docssheet-site`.** The import is on a branch. Decide when it lands on `main` (which is also what triggers the deploy workflow).

## 3. Non-requirements / explicitly deferred
- Google Analytics / GA4 — `gtag` preset block is present but commented out; enable after launch with a real property ID. GoatCounter (cookieless) is wired but `GOATCOUNTER_CODE` is empty.
- Search Console property — recommended, not required for AdSense.
- Ad unit placement/styling — only possible after approval. `<AdSlot>` output is fully gated by `ADS_ENABLED`.
- `static/ads.txt` real publisher line — requires the post-approval pub ID.
- Content expansion — deferred, not ruled out. If a reviewer flags thin content, import more of the existing guides from `../abhishekgupta1.github.io` (see D8).

## 4. Acceptance criteria
- [ ] `https://docssheet.com` and `https://www.docssheet.com` load over HTTPS with no certificate warnings.
- [x] `docs/intro.md` (and `cheatsheets/intro.md`) rebranded — no "Knowledge Base" / personal-portfolio wording in visible content or metadata.
- [ ] `google-site-verification` placeholder is replaced or removed.
- [x] Hidden nav sections (Projects, Articles, Resume, Certificates, Learn tools) are gone from navbar and footer.
- [x] Privacy Policy, About, Contact (+ Terms, Cookie Policy, Disclaimer) are present and linked from the footer.
- [x] `sitemap.xml` builds, lists the shortlist URLs, and points at `docssheet.com`; `robots.txt` is correct.
- [x] `npm run build` clean of broken-link warnings; `onBrokenLinks: 'throw'`.
- [ ] Per-page QA (`adsense-content-shortlist.md` §4) passed on the 15 flagship docs + 8 cheat sheets.
- [ ] `import-docssheet-site` merged to `main`; GitHub Pages enabled for the `docssheet` repo.
- [ ] AdSense verification tag added (ads still disabled), then application submitted with `docssheet.com` as the site.
- [ ] Open decisions D1–D9 (§2.6) each have a recorded answer before submission.
