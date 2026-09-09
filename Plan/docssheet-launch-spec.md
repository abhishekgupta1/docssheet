# docssheet.com — Launch Spec

**Project:** Rebrand and launch the existing Docusaurus consulting/documentation site as `docssheet.com`, on GitHub Pages, and submit for Google AdSense approval.

**Where the code lives:** This spec and its companions (`Plan/`) are the *only* contents of the `docssheet/` repo. The actual Docusaurus site — every file cited below (`docusaurus.config.js`, `src/data/site.js`, `docs/intro.md`, `static/CNAME`, `static/ads.txt`) — is in the separate sibling repo `../abhishekgupta1.github.io`, which is what GitHub Pages builds and deploys. All code fixes happen there; none of the ✅ claims here can be verified from the `docssheet/` repo.

**Current state (audited 2026-09-09 against the local repo at `../abhishekgupta1.github.io`):** Most of the launch-readiness work is already done. The site is branded `docssheet`, `static/CNAME` is `docssheet.com`, `url`/`baseUrl` are set, all legal + info pages exist and are footer-linked, Google Consent Mode v2 is wired, and AdSense is gated behind an `ADS_ENABLED` flag that is currently `false`. The site has **163 docs + 44 cheat sheets** of original content across SDET / SRE / SDE / MBA / AI tracks. What remains is a short list of cleanup items, plus the AdSense application itself.

**Out of scope:** Rewriting content, redesigning the theme, adding new documentation sections. This is a *launch-readiness* pass — the minimum set of changes needed to go live on the new domain and pass AdSense review.

**Status legend:** ✅ done · ⚠️ partially done / needs a check · ❌ not started

---

## 1. Goals

1. Site is reachable at `https://docssheet.com` (and `https://www.docssheet.com`) with valid HTTPS, served via GitHub Pages.
2. Site correctly reflects the "docssheet" brand (name, nav, metadata) rather than the personal-portfolio identity.
3. Site meets Google AdSense's content and policy prerequisites, and the application is submitted.

## 2. Requirements

### 2.1 Domain & hosting
- **R1** ⚠️ `docssheet.com` resolves to the GitHub Pages site (apex domain via A/ALIAS records). *DNS is configured outside the repo — verify with `dig`.*
- **R2** ⚠️ `www.docssheet.com` redirects or resolves to the same site (CNAME record). *Verify.*
- **R3** ⚠️ HTTPS is enforced (GitHub Pages "Enforce HTTPS" checkbox, only available once DNS is verified). *Repo setting — verify in GitHub Settings → Pages.*
- **R4** ✅ `static/CNAME` contains exactly `docssheet.com`. Docusaurus copies it into the build output.

### 2.2 Docusaurus configuration
- **R5** ✅ `docusaurus.config.js` — `url` is `https://docssheet.com`, `baseUrl` is `/`.
- **R6** ✅ `organizationName: abhishekgupta1` / `projectName: abhishekgupta1.github.io` match the actual repo. `trailingSlash: false`.
- **R7** ⚠️ Site title (`docssheet`), tagline, favicon, navbar, and footer all reflect "docssheet" branding. **Gap:** `docs/intro.md` still uses "Knowledge Base" / "Abhishek Gupta Knowledge Base" in its `title`, `<h1>`, `description`, and SVG diagram — the docs landing page hasn't been rebranded.
- **R8** ✅ Navbar and footer no longer show Projects, Articles, Resume, or Certificates. Nav is Docs / Cheat Sheets / Learn dropdown (Roadmap, Skills Matrix, Quiz, Dashboard, Start).
- **R9** ✅ No stale old-domain links. The only `abhishekgupta1.github.io` strings left are legitimate GitHub repo/profile links in `contact.md` and `docusaurus.config.js` (`GITHUB_REPO`, `editUrl`), not the old site URL.

### 2.3 SEO / crawlability
- **R10** ⚠️ `sitemap.xml` — classic-preset `sitemap` block is configured (`filename: sitemap.xml`, weekly, priority 0.5). Confirm it builds and is reachable at `docssheet.com/sitemap.xml`.
- **R11** ✅ `static/robots.txt` is `User-agent: * / Allow: /` and references `https://docssheet.com/sitemap.xml`. No blanket disallow.
- **R12** ⚠️ Homepage, `about`, `contact`, `privacy` have front-matter `title`/`description`. Not every doc/cheat sheet does — acceptable, but spot-check the shortlist pages (see `adsense-content-shortlist.md`).
- **R13** ✅ Open Graph / Twitter card metadata set (`themeConfig.image: img/og-image.png`, `twitter:card`, `og:type`), plus per-page OG images via the `./plugins/og-image` plugin.
- **R14** ⚠️ `themeConfig.metadata` ships `google-site-verification` with the literal value `REPLACE_WITH_SEARCH_CONSOLE_TOKEN`. Replace with the real Search Console token or remove the entry.

### 2.4 AdSense prerequisites
- **R15** ✅ A **Privacy Policy** page (`/privacy`) exists, discloses cookies/`localStorage` and third-party processing including future Google AdSense, and carries a "Last updated" date.
- **R16** ✅ **About** (`/about`) and **Contact** (`/contact`) pages exist, name the real owner (Abhishek Gupta), describe the site's purpose and how content is made, and give GitHub + LinkedIn contact routes. Also present: Terms, Cookie Policy, Disclaimer — all footer-linked.
- **R17** ✅ The site has a large body of original, substantive content already published (163 docs + 44 cheat sheets; many guides 3k–19k words). Confirm it's public and indexable after the live-domain cutover.
- **R18** ✅ No "under construction" / Lorem Ipsum on the main paths. **Action:** run the per-page QA in `adsense-content-shortlist.md` §4 against the flagship pages before submitting.
- **R19** ⚠️ `static/ads.txt` exists but is an inert comment block (no real publisher line — correct, since the pub ID is issued only after approval). Google will show an "ads.txt not found / not authorized" warning until then; not a launch blocker.
- **R20** ❌ AdSense **verification tag** is not on the site. `src/data/site.js` has `ADS_ENABLED = false` and `ADSENSE_CLIENT = 'ca-pub-0000000000000000'`, so no AdSense code is injected. Adding the verification snippet (loader `<script>` or `<meta name="google-adsense-account">`) is part of starting the application — without enabling ad slots.
- **R21** ✅ Consent infrastructure is in place ahead of ads: Google Consent Mode v2 defaults to `denied` for all ad/analytics storage in `docusaurus.config.js` headTags; `src/components/ConsentBanner` flips them on acceptance; `CONSENT_REQUIRED = true`. Note for later: for full EEA/UK compliance a Google-certified CMP (or Funding Choices) should replace the hand-rolled banner once approved.

### 2.5 Verification
- **R22** ⚠️ Site builds (`npm run build`). `onBrokenLinks` is `'warn'`, **not** `'throw'` — the build will not fail on broken internal links. Run a build, review the warning list, fix broken links on shortlisted pages, and consider switching to `'throw'` once clean.
- **R23** ❌ Manual smoke test on the live domain: homepage, nav links, footer links, docs pages, cheat sheets, Learn tools, 404 page.
- **R24** ❌ Mobile responsiveness spot-check after the branding fix to `docs/intro.md`.

### 2.6 Open decisions (unresolved as of 2026-09-09)
Not "deferred" — these shape or block the steps above and need an answer:
- **D1** ❌ Registrar / DNS. Confirm which registrar holds `docssheet.com` (the plan assumes GoDaddy) and that the apex A-records + `www` CNAME are actually in place. Nothing in either repo proves the current DNS state (R1–R3).
- **D2** ❌ Search Console. Create a domain property to obtain a real verification token, **or** delete the `google-site-verification` meta entry entirely. Choose before shipping (R14). The property itself is recommended, not required.
- **D3** ❌ AdSense account. Confirm a Google AdSense account exists (or create one), then pick the verification-tag form — `<script>` loader vs `<meta name="google-adsense-account">`. The tag must carry the account's real `ca-pub-…` ID; the `ca-pub-0000000000000000` placeholder in `src/data/site.js` will not verify (R20).
- **D4** ❌ `onBrokenLinks`. After the broken-link build is clean, decide whether to flip `'warn'` → `'throw'` so future regressions fail CI (R22).
- **D5** ❌ Consent. When to replace the hand-rolled `ConsentBanner` with a Google-certified CMP / Funding Choices for EEA/UK — targeted for post-approval, currently unscheduled (R21).
- **D6** ❌ Analytics. Whether to create a GA4 property and/or set `GOATCOUNTER_CODE` at launch, or stay dark (see §3).
- **D7** ❌ Ownership. Who submits the AdSense application, and by when. No owner or date is assigned to any acceptance-criteria item.

## 3. Non-requirements / explicitly deferred
- Google Analytics / GA4 — `gtag` preset block is present but commented out; enable after launch with a real property ID. GoatCounter (cookieless) is wired but `GOATCOUNTER_CODE` is empty.
- Search Console property — recommended, not required for AdSense.
- Ad unit placement/styling — only possible after approval. `<AdSlot>` output is fully gated by `ADS_ENABLED`.
- `static/ads.txt` real publisher line — requires the post-approval pub ID.
- Content expansion — not needed; the site is well past the "sufficient content" bar.

## 4. Acceptance criteria
- [ ] `https://docssheet.com` and `https://www.docssheet.com` load over HTTPS with no certificate warnings.
- [ ] `docs/intro.md` is rebranded — no "Knowledge Base" / personal-portfolio wording in visible content or metadata.
- [ ] `google-site-verification` placeholder is replaced or removed.
- [x] Hidden nav sections (Projects, Articles, Resume, Certificates) are gone from navbar and footer.
- [x] Privacy Policy, About, Contact (+ Terms, Cookie Policy, Disclaimer) are live and linked from the footer.
- [ ] `sitemap.xml` builds, lists the shortlist URLs, and is public; `robots.txt` is correct (already is).
- [ ] `npm run build` reviewed for broken-link warnings; shortlist pages have none.
- [ ] Per-page QA (`adsense-content-shortlist.md` §4) passed on the 15 flagship docs + 8 cheat sheets.
- [ ] AdSense verification tag added (ads still disabled), then application submitted with `docssheet.com` as the site.
- [ ] Open decisions D1–D7 (§2.6) each have a recorded answer before submission.
