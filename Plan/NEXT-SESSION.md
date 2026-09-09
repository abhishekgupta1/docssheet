# docssheet.com — Session handoff

**Written:** 2026-09-09 · **For:** the next working session · **Companions:**
`docssheet-launch-spec.md` (requirements + status), `docssheet-launch-plan.md`
(ordered steps), `adsense-content-shortlist.md` (the content set + QA checklist).

---

## Where things stand

The docssheet site lives in **this repo** (`github.com/abhishekgupta1/docssheet`),
imported at **shortlist scope**. **It is live at `https://docssheet.com`** —
`import-docssheet-site` was merged via PR #1 (`5a529f1`), GitHub Pages is on,
DNS is set, HTTPS enforced. AdSense code is wired on a **new branch
`adsense-onboarding`** (not yet merged — see PENDING-6).

```
7f92718  Initial commit
38bdb1c  Add launch planning docs
1a6b226  Import docssheet site (shortlist scope)
59b3d7e  Set onBrokenLinks: throw; sync Plan docs to the import
85d5743  Add Plan/NEXT-SESSION.md handoff
43b2f64  Update handoff: record local build + run verification
5a529f1  Merge PR #1 -> main   (site goes live)
b1d306f  Add Plan/GO-LIVE.md               \
9d8b512  Wire AdSense verification + D2     |  branch adsense-onboarding
<next>   Second content import (D8)         /  (PR #2, open, not merged)
```

**Content imported:** two batches — the shortlist (15 guides + 8 cheat sheets)
then a second batch — now **~42 guides + ~32 cheat sheets** across SDET/SRE/SDE/AI
+ the two landing pages + 6 info pages. Still **not** imported: MBA/leadership
library, the `test-automation-tooling-landscape` sub-topic subtree, the blog,
the Learn tools (roadmap/skills/quiz/dashboard/start).

**Source site:** `../abhishekgupta1.github.io` — left untouched, will become a
personal portfolio later. It still holds the full ~200-page catalogue; pull
more guides from there if needed (see PENDING-1).

**Build state:** `npm run build` is clean — **zero broken-link warnings**,
`onBrokenLinks: 'throw'`. Sitemap lists all 23 pages + intro + info pages under
`https://docssheet.com`. No "Knowledge Base" / portfolio wording in `build/`.
Consent Mode v2 defaults to `denied`.

**AdSense state (branch `adsense-onboarding`):** account created, `docssheet.com`
added — "Requires review". Publisher ID `ca-pub-1394375154476572`. In the repo:
the adsbygoogle **loader** is emitted site-wide (config `ADSENSE_ON` flag, true
whenever `ADSENSE_CLIENT` is real); `src/data/site.js` `ADSENSE_CLIENT` set;
`static/ads.txt` has the real DIRECT line; `google-site-verification`
placeholder removed (D2). **`ADS_ENABLED` stays `false`** → the loader loads
but zero `<AdSlot>` units render. Verified in a local build.

**Run state (verified locally 2026-09-09):** `npm run serve` on `:3210`, then
smoke-tested. Every route 200 (all 23 pages, the 6 info pages, `sitemap.xml` /
`robots.txt` / `CNAME` / `ads.txt`); `/` redirects to `/docs/intro`;
`/nonexistent` → 404. Screenshots (desktop 1280px + mobile 390px) confirm:
docssheet branding, navbar = Docs / Cheat Sheets only, footer = Content / Site
/ Legal, sidebar = SDET/SRE/SDE only, redrawn 3-track intro SVG, mental-model
diagrams render, code highlighting intact, consent banner shows and reflows on
mobile, page HTML carries `ad_storage:"denied"`. Titles are `<Page> | docssheet`.
(This run predates the `adsense-onboarding` branch — that branch adds the
adsbygoogle loader but still renders no ad units.)

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
- ✅ **Live on `https://docssheet.com`** — PR #1 merged, Pages on, DNS set,
  HTTPS enforced (spec R1–R3, R23)
- ✅ AdSense loader + `ads.txt` + `ADSENSE_CLIENT` wired on branch
  `adsense-onboarding`, `ADS_ENABLED` still false (spec R19, R20)
- ✅ `google-site-verification` placeholder removed (spec R14, decision D2)

---

## PENDING — do these next

### DONE since first draft
- **PENDING-3/4/5 → done.** `import-docssheet-site` merged (PR #1); GitHub Pages
  on (Source: GitHub Actions); GoDaddy DNS set (4 A on `@` + `www` CNAME →
  `abhishekgupta1.github.io`); custom domain + Enforce HTTPS. `https://docssheet.com`
  serves; `https://www.docssheet.com` 301s to apex.
- **PENDING-2 (D2) → done** on branch `adsense-onboarding` — placeholder meta removed.

### PENDING-6 — Ship the AdSense verification (decision D3)
Repo side is done on branch **`adsense-onboarding`**: loader emitted site-wide
(config `ADSENSE_ON`), `ADSENSE_CLIENT = 'ca-pub-1394375154476572'`,
`static/ads.txt` real line, `ADS_ENABLED` still `false`. Left to do (🧑):
1. Merge `adsense-onboarding` → `main` (auto-deploys).
2. Confirm live: `curl -s https://docssheet.com/ | grep adsbygoogle` and
   `curl -s https://docssheet.com/ads.txt`.
3. In AdSense: **Verify** / "I've placed the code", then **Submit for review**.
4. On approval → flip `ADS_ENABLED = true` in `src/data/site.js` + add ad units.

### PENDING-1 — Content volume (decision D8) — ✅ DONE
Second import batch on branch `adsense-onboarding`: ~27 guides + ~23 cheat
sheets added (SDET tool guides — Selenium/Appium/JUnit/TestNG/JMeter/Robot
Framework/Postman/Java/REST Assured/Cucumber; SRE — networking, chaos,
cloud-infra, MCP & AI agents, AI-assisted workflows, the 10-page
incident-response cluster; AI track — Kiro, Claude). `sidebars.js` AI category
restored; `docs/intro.md` + `cheatsheets/intro.md` updated to four tracks.
Site is now ~80 pages. `npm run build` clean, `onBrokenLinks: 'throw'` passed
first try (no MDX components used in the batch; no broken cross-links).

More still available in `../abhishekgupta1.github.io` if a reviewer still flags
thin content: the MBA/leadership library, and the ~60-page
`test-automation-tooling-landscape` sub-topic subtree (denser cross-linking —
budget time for `throw` cleanup).

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
- `static/ads.txt` / `ADSENSE_CLIENT` — already set to the real
  `pub-1394375154476572`. On approval, the only change is
  `src/data/site.js` `ADS_ENABLED = true` + adding ad units.
- **`CLAUDE.md` is stale** — copied from the source site; still describes the
  5-track / Learn-dropdown / claude-masterclass structure. Refresh to the
  shortlist scope.

---

## Fast resume checklist

1. `git checkout adsense-onboarding` (has everything on `main` + the AdSense
   wiring). `main` itself is live at `https://docssheet.com`.
2. `npm install` if needed, then `npm run build` — `[SUCCESS]`, no broken
   links; built HTML has the `adsbygoogle` loader and **no** `class="adsbygoogle"`
   ad units.
3. Ship PENDING-6 + D8: merge `adsense-onboarding` (PR #2) → `main`, wait for
   deploy, then owner clicks Verify + Submit in AdSense.
4. After that: PENDING-7 (external-link + content-policy read — now ~80 pages,
   heavier) and PENDING-8 (real-phone check on the live domain).
