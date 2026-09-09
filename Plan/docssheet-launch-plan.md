# docssheet.com — Launch Plan

Companion to `docssheet-launch-spec.md`. Ordered, actionable steps.

**Scope note:** This plan has been rewritten as a real gap analysis after
auditing the repo at `../abhishekgupta1.github.io` on 2026-09-09. Phase 1 was
almost entirely done already — what's left is a handful of cleanup items plus
DNS verification and the AdSense application. Content selection for the review
lives in `adsense-content-shortlist.md`.

**Where things live:** These planning docs (`Plan/`) are the *only* contents of
the `docssheet/` repo. The actual Docusaurus site — every file referenced below
(`docusaurus.config.js`, `src/data/site.js`, `docs/intro.md`, `static/CNAME`,
`static/ads.txt`) — lives in the separate sibling repo
`../abhishekgupta1.github.io`, which is what GitHub Pages builds and deploys.
All Phase 1 code edits happen there, not in this repo. The ✅ items below were
audited against that repo on 2026-09-09.

---

## Phase 1 — Code changes (Docusaurus repo)

Already done (verified in the repo):

- ✅ `docusaurus.config.js`: `title: 'docssheet'`, tagline, `url:
  https://docssheet.com`, `baseUrl: '/'`, favicon, navbar + footer branding.
- ✅ Projects / Articles / Resume / Certificates removed from navbar and footer.
- ✅ `static/CNAME` = `docssheet.com`.
- ✅ `static/robots.txt` allows all + points at the sitemap.
- ✅ `static/ads.txt` present as an inert placeholder (correct pre-approval).
- ✅ Legal + info pages: `about`, `contact`, `privacy`, `cookie-policy`,
  `terms`, `disclaimer` — all live and footer-linked.
- ✅ Consent Mode v2 + `ConsentBanner`; AdSense gated by `ADS_ENABLED = false`
  in `src/data/site.js`.
- ✅ Sitemap config, OG image metadata, per-page OG image plugin, local search.

Remaining Phase 1 work:

1. **Rebrand `docs/intro.md`.** It still reads "Knowledge Base" /
   "Abhishek Gupta Knowledge Base" in the front-matter `title`, the `<h1>`, the
   `description`, and the SVG diagram node. Update to "docssheet" wording so the
   docs landing page matches the rest of the site. (Spec R7.)

2. **Fix the Search Console meta.** In `docusaurus.config.js` →
   `themeConfig.metadata`, the `google-site-verification` entry has the literal
   value `REPLACE_WITH_SEARCH_CONSOLE_TOKEN`. Either paste the real token (after
   Phase 5) or delete the entry now so an invalid tag isn't shipped site-wide.
   (Spec R14.)

3. **Broken-link build.** `onBrokenLinks` is `'warn'`. Run `npm run build`,
   read the warnings, fix broken internal links (at minimum on the shortlist
   pages), then consider switching to `onBrokenLinks: 'throw'` so future
   regressions fail the build. (Spec R22.)

4. **Confirm SEO plumbing after build.** `sitemap.xml` is emitted and lists the
   shortlist URLs; it's reachable at `/sitemap.xml`. Spot-check `title` /
   `description` front matter on the 15 flagship docs + 8 cheat sheets in
   `adsense-content-shortlist.md`.

5. **Per-page QA.** Work through `adsense-content-shortlist.md` §4 for each
   shortlisted page — no WIP markers, no broken links, mobile-clean, code
   blocks intact, nothing that trips AdSense content policy.

6. **Build and serve locally.** `npm run build` clean of new errors →
   `npm run serve` → click through nav, footer, a few docs, a few cheat sheets,
   the Learn tools, and the 404 page.

## Phase 2 — GitHub repo & Pages settings

7. Commit and push the Phase 1 changes to the branch GitHub Pages deploys from
   (this repo deploys `main` via GitHub Actions; `deploymentBranch: gh-pages`).
8. Repo **Settings → Pages**:
   - "Custom domain" shows `docssheet.com` (GitHub reads `static/CNAME` in the
     build output). Re-enter and save if it's blank.
   - Leave "Enforce HTTPS" unchecked until DNS (Phase 3) has propagated and
     GitHub has issued a certificate.

## Phase 3 — DNS configuration (GoDaddy)

9. In DNS management for `docssheet.com`:
   - Four **A records** for `@` → GitHub Pages IPs:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - One **CNAME** for `www` → `abhishekgupta1.github.io`.
   - Remove any parked-domain A record or forwarding rule.
10. Verify propagation:
    `dig docssheet.com +noall +answer` and `dig www.docssheet.com +noall +answer`.

## Phase 4 — Go live

11. Once DNS resolves, **Settings → Pages → Enforce HTTPS**.
12. Confirm `https://docssheet.com` and `https://www.docssheet.com` both load
    with a valid certificate. (Spec R1–R3.)
13. Run the manual smoke test (Phase 1 step 6) again on the live domain.
    (Spec R23–R24.)

## Phase 5 — Search visibility (recommended, not blocking)

14. Add `docssheet.com` as a **domain property** in Google Search Console,
    verified via a DNS TXT record — or paste the HTML-tag token into the
    `google-site-verification` meta from Phase 1 step 2.
15. Submit `sitemap.xml`.

## Phase 6 — Google AdSense application

16. At https://www.google.com/adsense/, sign up and add `docssheet.com`.
17. **Add the verification tag without turning ads on.** AdSense gives either a
    `<script src="…adsbygoogle.js?client=ca-pub-…">` loader or a
    `<meta name="google-adsense-account" content="ca-pub-…">` tag. Simplest
    here: add it as an unconditional entry in `docusaurus.config.js`
    `headTags` (not inside the `ADS_ENABLED` block), redeploy. Leave
    `ADS_ENABLED = false` — no ad slots render during review.
18. Submit for review. Turnaround: a few days to a few weeks.
19. **Rejection-risk pre-check** (do before submitting):
    - Branding consistency — Phase 1 steps 1–2 close the known gaps.
    - Privacy policy present and complete — ✅ done.
    - Sufficient original content — ✅ 200+ pages; not a concern.
    - Thin / placeholder pages a reviewer might hit — mitigated by the
      `adsense-content-shortlist.md` QA pass.

## Phase 7 — After approval

20. Google issues `pub-XXXXXXXXXXXXXXXX`. Then, in one change:
    - `src/data/site.js`: `ADS_ENABLED = true`, `ADSENSE_CLIENT =
      'ca-pub-XXXXXXXXXXXXXXXX'`.
    - `static/ads.txt`: replace the comment block with
      `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`.
    - `lighthouserc.json`: drop the performance budget to ~0.8 (ads cost score).
    - Swap the hand-rolled `ConsentBanner` for a Google-certified CMP / Funding
      Choices for EEA/UK.
21. Add ad units / Auto ads, redeploy, confirm `ads.txt` validates in AdSense.

---

## Open items not owned by this repo
- **All Phase 1 code edits** — they land in `../abhishekgupta1.github.io`, not in
  the `docssheet/` (Plan) repo.
- DNS records at the registrar (Phase 3) — confirm the registrar first; the plan
  assumes GoDaddy.
- GitHub Pages custom-domain + Enforce HTTPS toggles (Phase 2, 4).
- AdSense and Search Console account setup (Phases 5–6).

## Open decisions to resolve (spec §2.6, D1–D7)
Record an answer for each before submitting the AdSense application:
- **D1** Which registrar holds `docssheet.com`; verify the apex A-records + `www`
  CNAME are actually live (`dig` — no repo proves the current state). Gates Phase 3–4.
- **D2** Create a Search Console domain property for a real token, **or** delete
  the `google-site-verification` meta entry. Do before Phase 6. (Phase 1 step 2 / Phase 5.)
- **D3** Confirm a Google AdSense account exists; pick the verification-tag form
  (`<script>` loader vs `<meta name="google-adsense-account">`). Real `ca-pub-…`
  ID required — the `ca-pub-0000000000000000` placeholder will not verify. (Phase 6 step 17.)
- **D4** After the broken-link build is clean, decide whether to flip
  `onBrokenLinks` `'warn'` → `'throw'`. (Phase 1 step 3.)
- **D5** When to swap `ConsentBanner` for a certified CMP / Funding Choices
  (EEA/UK) — currently pinned to post-approval, unscheduled. (Phase 7 step 20.)
- **D6** GA4 property and/or `GOATCOUNTER_CODE` at launch, or stay dark. (Non-requirements.)
- **D7** Who owns the AdSense submission, and by when.
