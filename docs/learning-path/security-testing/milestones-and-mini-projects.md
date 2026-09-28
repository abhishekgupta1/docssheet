---
title: "Security Testing Milestones & Mini-Projects"
description: "Authorised-practice tasks with expected results for each of the six security testing milestones on OWASP Juice Shop — recon and baseline, injection, access control and auth, XSS and logic, scanners in CI, and a findings report."
sidebar_position: 2
level: intermediate
tags: [security-testing, owasp, appsec, learning-path, projects]
---

# Security Testing Milestones & Mini-Projects

**In short:** six projects on **OWASP Juice Shop**, running on your own
machine. Tasks show the **expected result**; answer keys are folded away. The
results shown were captured from Juice Shop v20.2.0 — the app is updated often,
so your version and details may differ.

:::danger Legal targets only
Every task here is on Juice Shop (built for this) on `localhost`, or on the
free PortSwigger Academy. Never run these against systems you don't own or have
written permission to test.
:::

:::tip How to use this page
Start Juice Shop (`docker run --rm -d -p 3001:3000 --name juice bkimminich/juice-shop`),
open `http://localhost:3001`, and find the hidden scoreboard (`/#/score-board`)
— it tracks the challenges you solve. First read each milestone in the
[Roadmap](/docs/learning-path/security-testing/implementation-roadmap).
:::

## Contents

- [Milestone 1: Recon & baseline](#milestone-1)
- [Milestone 2: Injection](#milestone-2)
- [Milestone 3: Access control & auth](#milestone-3)
- [Milestone 4: XSS & business logic](#milestone-4)
- [Milestone 5: Scanners in CI](#milestone-5)
- [Milestone 6: A findings report](#milestone-6)
- [Final project](#final-project)

Throughout, `J=http://localhost:3001`.

---

## Milestone 1: Recon & baseline {#milestone-1}

**Practises:** scoping mindset, headers, error leaks, the baseline checklist.

| # | Task | Expected result |
|---|---|---|
| 1 | Get the app version | `{"version":"20.2.0"}` (or newer) |
| 2 | Check security headers on `/` | `X-Content-Type-Options` and `X-Frame-Options` present; **CSP and HSTS missing** |
| 3 | Trigger an error in product search | 500 with a **SQLite** error message |
| 4 | Run the whole [baseline checklist](/cheatsheets/security-testing#baseline) | Several issues noted |
| 5 | Find and open the hidden scoreboard | `/#/score-board` loads |

<details>
<summary>Answer key</summary>

```bash
J=http://localhost:3001
curl -s $J/rest/admin/application-version           # {"version":"20.2.0"}
curl -sI $J/ | grep -iE 'content-security-policy|strict-transport|x-frame|x-content-type'
# X-Content-Type-Options: nosniff
# X-Frame-Options: SAMEORIGIN        (no CSP, no HSTS)
curl -s "$J/rest/products/search?q=test')--" -w " [%{http_code}]\n" | head -c 90
# <title>Error: SQLITE_ERROR: incomplete input</title>  [500]
```

Findings so far: missing CSP (A05), missing HSTS (A02), verbose SQL error (A05,
and a hint of A03). These alone are a useful baseline report.

</details>

**Try it:** check the cookies Juice Shop sets (`curl -sI $J/ | grep -i set-cookie`).
Do they have `HttpOnly`, `Secure`, `SameSite`?

---

## Milestone 2: Injection {#milestone-2}

**Practises:** finding and confirming SQL injection.

| # | Task | Expected result |
|---|---|---|
| 1 | Log in with email `' OR 1=1--` and any password | HTTP 200; logged in as `admin@juice-sh.op` |
| 2 | Explain, in one sentence, why it works | The email breaks out of the SQL string |
| 3 | Confirm the search SQLi from Milestone 1 by varying the payload | Different SQL errors for different inputs |
| 4 | Write the finding for the login bypass | Steps + proof + impact + fix |
| 5 | (Bonus) PortSwigger Academy: solve the first "SQL injection" lab | Lab solved |

<details>
<summary>Answer key</summary>

```bash
J=http://localhost:3001
curl -s -X POST $J/rest/user/login -H 'Content-Type: application/json' \
  -d '{"email":"'"'"' OR 1=1--","password":"anything"}' \
  | python3 -c "import json,sys;a=json.load(sys.stdin)['authentication'];print('logged in as', a['umail'], '| token', len(a['token']), 'chars')"
# logged in as admin@juice-sh.op | token 717 chars
```

Why: the login query is built by joining strings, roughly
`... WHERE email = '<input>' AND password = '...'`. The input `' OR 1=1--`
closes the email string, adds `OR 1=1` (always true), and `--` comments out the
password check — so the first row (admin) matches. **Fix:** parameterised
queries, so input is only ever data.

Finding: this is the SEC-01 example in the
[cheat sheet](/cheatsheets/security-testing#reporting) — Critical, full account takeover.

</details>

**Watch out for:** the shell quoting of `' OR 1=1--`. The `'"'"'` sequence in
the examples is how you put a single quote inside a single-quoted string.

---

## Milestone 3: Access control & auth {#milestone-3}

**Practises:** BOLA/IDOR, JWT inspection, brute-force/rate-limit checks.

| # | Task | Expected result |
|---|---|---|
| 1 | With one token, read baskets 1, 2 and 3 | All return **200** — a BOLA flaw |
| 2 | Decode the JWT payload | You see the user's email and role, base64-only (not encrypted) |
| 3 | Check `GET /api/Users` without a token | **401** — correctly protected |
| 4 | Send 5 wrong logins quickly; note status and timing | No lockout (a rate-limit finding) |
| 5 | Write findings for #1 and #4; note the pass from #3 | 2 findings + 1 pass |

<details>
<summary>Answer key</summary>

```bash
J=http://localhost:3001
TOKEN=$(curl -s -X POST $J/rest/user/login -H 'Content-Type: application/json' \
  -d '{"email":"'"'"' OR 1=1--","password":"x"}' | python3 -c "import json,sys;print(json.load(sys.stdin)['authentication']['token'])")
for id in 1 2 3; do curl -s -o /dev/null -w "basket $id -> %{http_code}\n" "$J/rest/basket/$id" -H "Authorization: Bearer $TOKEN"; done
# basket 1 -> 200 / basket 2 -> 200 / basket 3 -> 200      ← BOLA
echo "$TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null; echo   # payload: email, role, etc.
curl -s -o /dev/null -w "GET /api/Users -> %{http_code}\n" "$J/api/Users"   # 401 (good)
```

Finding (BOLA): any authenticated user can read any basket by id — no ownership
check. Fix: verify `basket.userId == currentUser.id` server-side.

Note the pass: listing all users needs a token. Report both — coverage matters.

</details>

**Try it:** decode the JWT header (`cut -d. -f1`). What signing algorithm does
it use? What would happen if the app accepted `alg: none`?

---

## Milestone 4: XSS & business logic {#milestone-4}

**Practises:** spotting reflected input, thinking about stored XSS, abusing rules.

| # | Task | Expected result |
|---|---|---|
| 1 | Send `<iframe>` in the search query; check the response | The tag is reflected in the JSON body |
| 2 | In the browser, try the DOM XSS challenge in the search box | Understand where output is rendered |
| 3 | Note whether a CSP would reduce the impact (from Milestone 1) | CSP is missing — so XSS is more dangerous |
| 4 | Add an item to the basket, then change its quantity to a negative number via the API | See what happens to the total |
| 5 | Write findings; suggest fixes (output encoding + CSP; server-side validation) | 2 findings |

<details>
<summary>Answer key</summary>

```bash
J=http://localhost:3001
curl -s "$J/rest/products/search?q=%3Ciframe%3E" | grep -o "iframe" | head -1
# iframe        ← reflected; whether it executes depends on how the page renders it
```

XSS: input is reflected; because there's **no Content-Security-Policy**
(Milestone 1), an executing script has free rein. Fix: encode output for its
context **and** add a restrictive CSP.

Business logic: quantities and totals must be validated on the **server** —
never trust a value the client can change. Juice Shop has several such
challenges (tampered basket totals, applying another user's coupon).

:::warning
Use only harmless proofs like `alert(1)`. Never run real attack scripts, even
on a practice app.
:::

</details>

**Try it:** in Juice Shop, post product feedback and see whether your name/comment
is shown to others unescaped (stored XSS). Use a harmless `alert(1)` proof only.

---

## Milestone 5: Scanners in CI {#milestone-5}

**Practises:** DAST, SAST, dependency and secret scanning; a pipeline.

| # | Task | Expected result |
|---|---|---|
| 1 | Run a ZAP **baseline** (passive) scan against Juice Shop | ~88 URLs; WARNs incl. "CSP Header Not Set" |
| 2 | Clone the Juice Shop source; run `npm audit` | A list of dependency advisories |
| 3 | Run Trivy filesystem scan for vulns and secrets | HIGH/CRITICAL findings listed |
| 4 | Run Gitleaks on the repo | Any committed secrets reported |
| 5 | Write a `security.yml` workflow (SAST + deps/secrets + ZAP baseline); lint it | Passes `actionlint` |

<details>
<summary>Answer key</summary>

```bash
# DAST baseline (from the host, reaching the container)
docker run --rm --add-host=host.docker.internal:host-gateway ghcr.io/zaproxy/zaproxy \
  zap-baseline.py -t http://host.docker.internal:3001
# Total of 88 URLs
# WARN-NEW: Content Security Policy (CSP) Header Not Set [10038] x 5
# WARN-NEW: Cross-Domain Misconfiguration [10098] x 5
# ... FAIL-NEW: 0  WARN-NEW: 8  PASS: 59
```

The baseline confirms, automatically, the missing CSP you found by hand in
Milestone 1 — plus cross-domain misconfiguration, cacheable content and more.

The CI workflow is the one in the
[cheat sheet](/cheatsheets/security-testing#sast) / [quick reference](/docs/fundamentals/security-testing/security-testing-quick-reference#ci).
Gate on **new** HIGH/CRITICAL only.

</details>

**Watch out for:** an **active** full scan (`zap-full-scan.py`) sends real
attacks — fine against your local Juice Shop, never against production or
anything you don't own.

---

## Milestone 6: A findings report {#milestone-6}

**Practises:** CVSS, prioritising, writing a report a team can act on.

| # | Deliverable | Expected result |
|---|---|---|
| 1 | Collect your findings from Milestones 1–5 | 8–12 findings |
| 2 | Rate each with CVSS + business context | Severity per finding |
| 3 | Write each in the [finding template](/docs/fundamentals/security-testing/security-testing-quick-reference#finding) | Repro + impact + fix |
| 4 | Executive summary: top 3 risks, counts by severity | Half a page |
| 5 | Note what was correctly protected | Coverage shown |

<details>
<summary>What a strong summary looks like</summary>

```text
Target:    OWASP Juice Shop v20.2.0 (local), <date>. Authorised practice.
Summary:   11 findings — 2 critical, 2 high, 5 medium, 2 low.
Top risks: 1) SQLi auth bypass → full admin takeover (Critical)
           2) SQLi in product search + verbose SQL errors (Critical/Medium)
           3) BOLA: any user reads any basket (High)
Also:      Missing CSP and HSTS; reflected input; no login rate limiting.
Protected: Listing all users requires a token (401) — correct.
Fix first: Parameterise all queries; enforce object ownership server-side;
           add CSP + HSTS; rate-limit auth endpoints.
```

Your numbers depend on how much you found. What matters: criticals first, each
finding reproducible, fixes concrete, and passes noted.

</details>

**Try it:** write the one-paragraph version for a non-technical manager: what's
the worst that could happen, and what are the top two fixes?

---

## Final project {#final-project}

Do a mini-assessment of a **legal** target end to end: Juice Shop challenges
across all OWASP categories, or a run through several PortSwigger Academy topics
(access control, SQLi, XSS, authentication).

**Done when:**

- [ ] Written scope (even self-authored) naming the target and allowed methods
- [ ] Findings across at least 5 OWASP categories, each reproduced with a proof
- [ ] Baseline (passive) scanner run included and triaged
- [ ] CVSS + business context per finding; no unconfirmed scanner output
- [ ] A `security.yml` CI workflow (SAST + deps/secrets + ZAP baseline)
- [ ] A report with an executive summary and prioritised fixes
- [ ] Public repo (findings on a practice target only) — proof you can deliver the
      security testing service
