# docssheet.com — Session handoff

**Written:** 2026-09-09 · **For:** the next working session · **Companions:**
`docssheet-launch-spec.md` (requirements + status), `docssheet-launch-plan.md`
(ordered steps), `adsense-content-shortlist.md` (the content set + QA checklist).

---

## Where things stand

The docssheet site now lives in **this repo** (`github.com/abhishekgupta1/docssheet`),
imported at **shortlist scope** on branch **`import-docssheet-site`** (not yet
merged to `main`).

```
7f92718  Initial commit
38bdb1c  Add launch planning docs          # Plan/ committed
1a6b226  Import docssheet site (shortlist scope)
59b3d7e  Set onBrokenLinks: throw; sync Plan docs to the import
85d5743  Add Plan/NEXT-SESSION.md handoff
```

**Content imported:** 15 flagship guides + 8 cheat sheets (SDET/SRE/SDE) +
`docs/intro.md` + `cheatsheets/intro.md` + 6 info pages (About, Contact,
Privacy, Terms, Cookie Policy, Disclaimer). The MBA/AI tracks, the blog, and
the Learn tools (roadmap/skills/quiz/dashboard/start) were **not** imported.

**Source site:** `../abhishekgupta1.github.io` — left untouched, will become a
personal portfolio later. It still holds the full ~200-page catalogue; pull
more guides from there if needed (see PENDING-1).

**Build state:** `npm run build` is clean — **zero broken-link warnings**,
`onBrokenLinks: 'throw'`. Sitemap lists all 23 pages + intro + info pages under
`https://docssheet.com`. No "Knowledge Base" / portfolio wording in `build/`.
`ADS_ENABLED = false` (no ad code injected). Consent Mode v2 defaults to
`denied`.

**Run state (verified locally 2026-09-09):** `npm run serve` on `:3210`, then
smoke-tested. Every route 200 (all 23 pages, the 6 info pages, `sitemap.xml` /
`robots.txt` / `CNAME` / `ads.txt`); `/` redirects to `/docs/intro`;
`/nonexistent` → 404. Screenshots (desktop 1280px + mobile 390px) confirm:
docssheet branding, navbar = Docs / Cheat Sheets only, footer = Content / Site
/ Legal, sidebar = SDET/SRE/SDE only, redrawn 3-track intro SVG, mental-model
diagrams render, code highlighting intact, consent banner shows and reflows on
mobile, page HTML carries `ad_storage:"denied"` and **no** `adsbygoogle` /
`google-adsense-account`. Titles are `<Page> | docssheet`.

## Already done (do not redo)

- ✅ Site import + scaffold (config, sidebars, theme, ConsentBanner, AdSlot,
  og-image plugin, PWA, search, static assets)
- ✅ `projectName` → `docssheet`; `GITHUB_REPO`/`editUrl` → `abhishekgupta1/docssheet`
- ✅ Navbar/footer pruned (Learn dropdown gone); `sidebars.js` MBA/AI removed
- ✅ `docs/intro.md` + `cheatsheets/intro.md` rebranded to docssheet; intro SVG
  redrawn to 3 tracks (spec R7)
- ✅ Cross-links to non-imported pages de-linked (tooling-landscape guide,
  `privacy.md`, `cookie-policy.md`)
- ✅ `onBrokenLinks: 'throw'` (decision D4); build clean (spec R22)
- ✅ Front-matter `title`/`description` on all 23 pages + landings (spec R12);
  WIP-marker scan clean (spec R18 partial)
- ✅ `sitemap.xml` + `robots.txt` verified in `build/` (spec R10, R11)
- ✅ Built **and run** locally (`npm run serve`) — all routes 200, redirect +
  404 correct, desktop + mobile screenshots reviewed (see "Run state" above)

---

## PENDING — do these next

### In-repo, needs a decision from the owner first

**PENDING-1 — Content volume (decision D8).** The site is ~23 pages, down from
~200. This is the main risk the shortlist scope introduced: AdSense can reject
for "thin content" / "low-value content." Decide:
- (a) submit as-is (23 substantive pages, several 3k–19k words), or
- (b) import a batch more guides from `../abhishekgupta1.github.io` first.
If (b): the guides live under `../abhishekgupta1.github.io/docs/{sdet,sre,sde,mba,ai}-skills/`
and `../abhishekgupta1.github.io/cheatsheets/`. Copy the `.md` + each dir's
`_category_.json`, then `npm run build` (it will now **throw** on any broken
cross-link — fix or de-link them). Watch for custom MDX components
(`<InterviewQuestions>` etc.) — the imported `src/theme/MDXComponents.js` only
registers `AdSlot`, so either add the component back or the build fails.

**PENDING-2 — Search Console meta (decision D2).** `docusaurus.config.js` →
`themeConfig.metadata` still ships
`{name: 'google-site-verification', content: 'REPLACE_WITH_SEARCH_CONSOLE_TOKEN'}`.
Either:
- delete that one array entry (safe default — no Search Console dependency), or
- create a Search Console **domain property** for `docssheet.com`, take the
  HTML-tag token, paste it in.
Do this before submitting to AdSense. Recommended default if the owner has no
preference: **delete the entry now**, add a real token later.

### Needs the owner / external accounts (cannot be done from the repo)

**PENDING-3 — Merge + deploy (decision D9).**
- Merge `import-docssheet-site` → `main` (PR: https://github.com/abhishekgupta1/docssheet/pull/new/import-docssheet-site).
- `main` is what `.github/workflows/deploy.yml` runs on.

**PENDING-4 — GitHub Pages (decision D1, part 1).**
- Repo **Settings → Pages** for `abhishekgupta1/docssheet`: **enable Pages**,
  Source = **GitHub Actions** (currently off).
- Set Custom domain = `docssheet.com` (GitHub reads `static/CNAME` from the
  build output).
- Leave "Enforce HTTPS" until DNS verifies.

**PENDING-5 — DNS (decision D1, part 2).**
- Confirm which registrar holds `docssheet.com` (plan assumed GoDaddy — unverified).
- Apex `@` → four A records: `185.199.108.153`, `185.199.109.153`,
  `185.199.110.153`, `185.199.111.153`.
- `www` → CNAME `abhishekgupta1.github.io`.
- Verify: `dig docssheet.com +noall +answer` / `dig www.docssheet.com +noall +answer`.

**PENDING-6 — AdSense verification tag (decision D3).**
- Confirm a Google AdSense account exists (or create one), add `docssheet.com`.
- AdSense issues a `<script>` loader or `<meta name="google-adsense-account"
  content="ca-pub-…">` with a **real** `ca-pub-…` ID (the
  `ca-pub-0000000000000000` placeholder in `src/data/site.js` will not verify).
- Add the tag as an **unconditional** entry in `docusaurus.config.js`
  `headTags` — NOT inside the `ADS_ENABLED` block. Keep `ADS_ENABLED = false`.
- Redeploy, then submit for review.

### Verification

**PENDING-7 — Per-page QA (spec R18, shortlist §4).** Partly done: local run
confirmed routing, rendering, code highlighting, and mobile reflow across the
shortlist. **Still to do:**
- dead **external** link check (`npm run linkcheck` skips `http(s)://` by
  design — run a link checker that follows them, or spot-check by hand);
- read all 23 pages for AdSense content-policy risks (copied third-party docs,
  "cracked/free premium" framing, unsafe sample data, advice-as-fact);
- "Last updated" timestamps — currently blank locally (files untracked in this
  branch until merged); they populate from git once on `main`.

**PENDING-8 — Live smoke test (spec R23–R24).** Local smoke test passed on
`localhost:3210`. **Still to do on the real domain:** `https://docssheet.com`
and `https://www.docssheet.com` load with a valid cert, `www` resolves, and a
quick click-through on an actual phone (not just a 390px viewport).

### Deferred (post-approval — not blockers)

- **D5** — replace the hand-rolled `ConsentBanner` with a Google-certified CMP /
  Funding Choices for EEA/UK.
- **D6** — GA4 property and/or `GOATCOUNTER_CODE` (both currently empty/off).
- **D7** — assign an owner + date to the AdSense submission.
- `static/ads.txt` real publisher line — needs the post-approval pub ID. When
  approved: `src/data/site.js` `ADS_ENABLED = true` + real `ADSENSE_CLIENT`;
  `static/ads.txt` → `google.com, pub-XXXX, DIRECT, f08c47fec0942fa0`.

---

## Fast resume checklist

1. `git checkout import-docssheet-site` in this repo.
2. `npm install` if `node_modules` is missing, then `npm run build`
   (`[SUCCESS]`, no broken links) and `npm run serve` — both already verified
   green on 2026-09-09, so this is just a sanity re-check.
3. Get the owner's answer on **PENDING-1** (content volume) and **PENDING-2**
   (Search Console meta) — everything else is mechanical once those are set.
4. Apply PENDING-2 (likely: delete the placeholder meta entry), commit.
5. Hand PENDING-3/4/5/6 to the owner (merge, Pages, DNS, AdSense account).
6. Once live: PENDING-7 (external-link + content-policy read) and PENDING-8
   (real-domain / real-phone check).
