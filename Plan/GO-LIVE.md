# docssheet.com — Go-live action plan

**Written:** 2026-09-09 · **Scope:** getting `docssheet.com` served from the
`docssheet` repo on GitHub Pages. Companion to `NEXT-SESSION.md` (broader
handoff) and `docssheet-launch-plan.md` (full launch plan).

Legend: 🧑 = owner does it (GitHub/GoDaddy UI) · 🤖 = can be done in-repo.

---

## Target architecture — two independent sites

| Repo | Serves | URL | Pages custom domain |
| ---- | ------ | --- | ------------------- |
| `abhishekgupta1/abhishekgupta1.github.io` | personal **portfolio** (to be rebuilt) | `https://abhishekgupta1.github.io` | **none** — github.io hostname |
| `abhishekgupta1/docssheet` | **docssheet** (this repo) | `https://docssheet.com` + `https://www.docssheet.com` | `docssheet.com` (via `static/CNAME`) |

They do not collide: GitHub routes each request by its `Host` header to the
repo whose `CNAME` file matches. `www.docssheet.com` → CNAME
`abhishekgupta1.github.io` is the correct value and does **not** send traffic
to the portfolio — GitHub matches `Host: www.docssheet.com` to the `docssheet`
repo.

---

## ⚠️ Guard rail — keep `docssheet.com` out of the portfolio repo

The `abhishekgupta1.github.io` working tree currently has an **untracked
`static/CNAME` = `docssheet.com`** (leftover from the rebrand experiment). If
that is ever committed or deployed, GitHub will treat the portfolio repo as
claiming `docssheet.com` and **reject or misroute** one of the two sites.

When that repo is rebuilt as the portfolio:
- [ ] 🧑 delete `static/CNAME` there (`git clean -fd static/` or remove the file — it is untracked)
- [ ] 🧑 **Settings → Pages → Custom domain: leave empty**

`docssheet.com` is configured in exactly one place: the `docssheet` repo's
`static/CNAME`.

---

## Ordered steps — `docssheet.com`

### Step 1 — Merge the import branch 🤖
- [ ] Merge `import-docssheet-site` → `main` in the `docssheet` repo.
- Effect: triggers `.github/workflows/deploy.yml`. Nothing is published until
  Step 2 enables Pages.
- PR: https://github.com/abhishekgupta1/docssheet/pull/new/import-docssheet-site

### Step 2 — Enable GitHub Pages on the `docssheet` repo 🧑
- [ ] `github.com/abhishekgupta1/docssheet` → **Settings → Pages**
- [ ] **Build and deployment → Source: `GitHub Actions`** (NOT "Deploy from a branch")
- [ ] Custom domain: leave blank for now (set in Step 4)
- [ ] Check the **Actions** tab — "Deploy to GitHub Pages" run should be green

### Step 3 — GoDaddy DNS for `docssheet.com` 🧑
GoDaddy → **DNS → Manage DNS** for `docssheet.com`:

| Type  | Name | Value                       |
| ----- | ---- | --------------------------- |
| A     | `@`  | `185.199.108.153`           |
| A     | `@`  | `185.199.109.153`           |
| A     | `@`  | `185.199.110.153`           |
| A     | `@`  | `185.199.111.153`           |
| CNAME | `www`| `abhishekgupta1.github.io`  |

- [ ] Add the four `A` records on `@`
- [ ] Add the `www` CNAME → `abhishekgupta1.github.io` (trailing `.github.io`, not the domain)
- [ ] **Delete** GoDaddy's default parked `A @ → <GoDaddy IP>` and any parked `CNAME www`
- [ ] Turn **Domain Forwarding** OFF
- [ ] Leave `NS` and `SOA` records alone

### Step 4 — Point Pages at the domain 🧑
- [ ] `docssheet` repo → **Settings → Pages → Custom domain**: enter `docssheet.com`, Save
- [ ] Wait for **"DNS check successful"** (minutes–hours)
- [ ] Tick **Enforce HTTPS** (certificate issuance can take up to ~24h)

### Step 5 — Verify live 🧑
- [ ] `https://docssheet.com` loads with a valid padlock
- [ ] `https://www.docssheet.com` loads (redirects to apex or serves the same site)
- [ ] `/` lands on `/docs/intro`; nav + footer links work; 404 page works
- Closes spec **R1–R3**, **R23**.

### Step 6 — AdSense (only after Step 5) 🧑 + 🤖
- [ ] 🧑 Create a Google AdSense account at https://www.google.com/adsense/, add `docssheet.com`
- [ ] 🧑 Copy the verification snippet it issues (a `<script>` loader or
      `<meta name="google-adsense-account" content="ca-pub-…">`), with the real `ca-pub-…` ID
- [ ] 🤖 Add it as an **unconditional** entry in `docusaurus.config.js` `headTags`
      (NOT inside the `ADS_ENABLED` block); keep `ADS_ENABLED = false`
- [ ] 🧑 Merge/redeploy, then submit for review in AdSense
- Spec **R20**, decision **D3**.

---

## Do-now in-repo cleanups 🤖

- [ ] **D2** — delete the `google-site-verification: REPLACE_WITH_SEARCH_CONSOLE_TOKEN`
      entry from `docusaurus.config.js` → `themeConfig.metadata`. Re-add a real
      token later only if a Search Console property is created. *Recommended.*
- [ ] **D8** — no change needed now. Going live with 23 pages is acceptable; if
      AdSense flags thin content, import more guides from `../abhishekgupta1.github.io`.

---

## Status

| Step | Owner | Done |
| ---- | ----- | ---- |
| 1 — merge branch | 🤖 | ☐ |
| 2 — enable Pages (docssheet repo) | 🧑 | ☐ |
| 3 — GoDaddy DNS | 🧑 | ☐ |
| 4 — custom domain + HTTPS | 🧑 | ☐ |
| 5 — verify live | 🧑 | ☐ |
| 6 — AdSense account + verification tag | 🧑 + 🤖 | ☐ |
| Guard rail — strip `docssheet.com` from portfolio repo | 🧑 | ☐ |
| D2 — remove Search Console placeholder | 🤖 | ☐ |
