# docssheet.com — Content shortlist for AdSense review

Companion to `docssheet-launch-spec.md` / `docssheet-launch-plan.md`.

**Status (2026-09-09):** this list was the **first** import batch (branch
`import-docssheet-site`, now on `main` / live). A **second batch** (branch
`adsense-onboarding`, PR #2) added ~27 more guides + ~23 cheat sheets — SDET
tool guides, more SRE guides incl. the incident-response cluster, and the AI
track — bringing the site to ~80 pages. The 23 pages below remain the ones to
**personally QA and point a reviewer at**; the rest are supporting depth. Fuller
catalogue still in `../abhishekgupta1.github.io`.

**Why this file exists:** AdSense reviewers don't read the whole site. They
sample a handful of pages plus the required "site info" pages (About, Contact,
Privacy). Originally the source site had **163 docs + 44 cheat sheets** — well
past the "sufficient content" bar — and this list picked the strongest pages to
point a reviewer at. Post-import the site *is* just these pages, so the volume
cushion is gone (spec R17 / decision D8); the per-page QA below matters more,
not less.

Word counts are body text, measured 2026-09-09.

---

## 1. Flagship docs (long-form, high-effort, evergreen)

These are the pages a reviewer should ideally land on. All are multi-thousand
word original guides with diagrams, worked examples, and failure modes — no
scraped content, no affiliate framing, no restricted topics.

| # | Page | URL | Words |
| - | ---- | --- | ----- |
| 1 | Test Automation Tools & Technology Landscape | `/docs/sdet-skills/test-automation-tooling-landscape/test-automation-tools-technology-landscape` | 18,900 |
| 2 | CI/CD Pipelines guide | `/docs/sre-skills/ci-cd-pipelines/ci-cd-pipelines-guide` | 7,500 |
| 3 | AWS guide | `/docs/sre-skills/aws/aws-guide` | 7,100 |
| 4 | Python guide | `/docs/sde-skills/python/python-guide` | 7,000 |
| 5 | Git guide | `/docs/sde-skills/git/git-guide` | 6,300 |
| 6 | Terraform guide | `/docs/sre-skills/terraform/terraform-guide` | 6,200 |
| 7 | Observability with Grafana & Prometheus | `/docs/sre-skills/observability-grafana-prometheus/observability-grafana-prometheus-guide` | 6,200 |
| 8 | Docker Basics guide | `/docs/sde-skills/docker-basics/docker-basics-guide` | 6,100 |
| 9 | Linux Administration guide | `/docs/sre-skills/linux-administration/linux-administration-guide` | 5,900 |
| 10 | System Performance guide | `/docs/sre-skills/system-performance/system-performance-guide` | 5,200 |
| 11 | Kubernetes guide | `/docs/sre-skills/kubernetes/kubernetes-guide` | 4,800 |
| 12 | Clean Architecture guide | `/docs/sde-skills/clean-architecture/clean-architecture-guide` | 4,400 |
| 13 | OpenTelemetry guide | `/docs/sre-skills/opentelemetry/opentelemetry-guide` | 4,100 |
| 14 | Playwright guide | `/docs/sdet-skills/playwright/playwright-guide` | 3,500 |
| 15 | SQL guide | `/docs/sdet-skills/sql/sql-guide` | 3,400 |

Coverage spread on purpose: SDET, SRE, SDE, and AI/tooling tracks are all
represented, so the site reads as a real multi-topic reference rather than one
narrow niche.

## 2. Companion cheat sheets (dense one-pagers)

Paired with the guides above. Each is a standalone reference page with real
lookup value — commands, snippets, gotchas — not a stub.

| Page | URL | Words |
| ---- | --- | ----- |
| Kubernetes | `/cheatsheets/kubernetes` | 560 |
| Playwright | `/cheatsheets/playwright` | 550 |
| Clean Architecture | `/cheatsheets/clean-architecture` | 550 |
| Python | `/cheatsheets/python` | 520 |
| Git | `/cheatsheets/git` | 520 |
| Docker | `/cheatsheets/docker` | 470 |
| AWS | `/cheatsheets/aws` | 460 |
| SQL | `/cheatsheets/sql` | 400 |

## 3. Required "site info" pages (reviewer always checks these)

| Page | URL | Status |
| ---- | --- | ------ |
| About | `/about` | ✅ Real owner named, content methodology described, ad disclosure present |
| Contact | `/contact` | ✅ GitHub + LinkedIn, response-time note |
| Privacy Policy | `/privacy` | ✅ Cookies + third-party (AdSense) disclosure, "Last updated" date |
| Cookie Policy | `/cookie-policy` | ✅ Linked in footer |
| Terms of Service | `/terms` | ✅ Linked in footer |
| Disclaimer | `/disclaimer` | ✅ Linked in footer |

All six are linked from the footer on every page (`docusaurus.config.js` →
`themeConfig.footer.links`).

---

## 4. Per-page pre-submission QA checklist

Run this against every page in sections 1–2 before submitting the application:

- [ ] Has a unique, descriptive front-matter `title` and `description`.
- [ ] No "TODO", "coming soon", "WIP", or Lorem Ipsum anywhere on the page.
- [ ] No broken internal links (see build note below) and no dead external links.
- [ ] At least a few internal links out to related docs/cheat sheets (shows site depth).
- [ ] Renders cleanly on mobile width (tables scroll, diagrams scale).
- [ ] Code blocks are syntax-highlighted and not truncated.
- [ ] Nothing that trips AdSense content policy: no copied third-party docs,
      no "download cracked / free premium" framing, no adult / violent / hateful
      examples in sample data, no medical or financial advice presented as fact.
- [ ] `Last updated` timestamp is recent enough to look maintained.

## 5. Site-wide checks that affect how reviewers see the shortlist

- [x] **Broken-link build.** `onBrokenLinks: 'throw'` is set; `npm run build` is
      clean with zero broken-link warnings. (Spec R22 / decision D4.)
- [x] **Landing pages rebranded.** `docs/intro.md` + `cheatsheets/intro.md` are
      docssheet-branded; the "Knowledge Base" wording is gone and the intro SVG
      was redrawn to the three shipped tracks. (Spec R7.)
- [ ] **`google-site-verification` meta is a placeholder**
      (`REPLACE_WITH_SEARCH_CONSOLE_TOKEN` in `docusaurus.config.js`
      `themeConfig.metadata`). Replace with the real Search Console token or
      remove the entry. (Spec R14 / decision D2.)
- [ ] **AdSense verification snippet is not on the site yet.** `ADS_ENABLED` is
      `false` in `src/data/site.js`, so no AdSense code loads. Onboarding needs
      either the `<script>` loader or a
      `<meta name="google-adsense-account" content="ca-pub-…">` tag present
      during review, carrying the account's real `ca-pub-…` ID — the
      `ca-pub-0000000000000000` placeholder will not verify. Add just the
      verification tag (not ad slots) when you start the application — plan
      Phase 6. (Spec R20 / decision D3.)
- [x] **`sitemap.xml`** builds and lists all 23 shortlist URLs + the intro and
      six info pages, all under `https://docssheet.com` (confirmed in `build/`).
- [x] **`robots.txt`** allows all and points to the sitemap. Correct.

---

## 6. Not imported (available in `../abhishekgupta1.github.io` if needed)

The MBA / leadership "response library" and "playbook" category pages
(~1,800–3,500 words each), the AI-skills track, the blog, and the remaining
SDET/SRE/SDE guides were **not** imported. They're original and policy-safe.
If a reviewer flags thin content (decision D8), importing a batch of the
remaining guides is the fastest fix — the content already exists.
