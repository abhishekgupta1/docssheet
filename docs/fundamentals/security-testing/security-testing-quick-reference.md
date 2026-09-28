---
title: "Security Testing Quick Reference"
description: "Copy-paste reference for authorised security testing — OWASP Top 10 checks, test payloads for practice targets, security headers, cookie flags, curl recipes, scanner commands (ZAP, Semgrep, Trivy, Gitleaks), JWT decoding, CVSS bands, finding template and practice targets."
sidebar_position: 1
level: intermediate
tags: [security-testing, owasp, appsec, fundamentals, cheat-sheet]
---

# Security Testing Quick Reference

A lookup page for security checks, safe test inputs, scanner commands and
reporting — for systems you are authorised to test.

:::danger Authorisation first
Everything here assumes written permission and a defined scope, or a legal
practice target (Juice Shop, PortSwigger Academy, DVWA, WebGoat). See the
[cheat sheet's scope section](/cheatsheets/security-testing#scope).
:::

:::tip How to use this page
New to security testing? Start with the [security cheat sheet](/cheatsheets/security-testing).
For the ordered plan, see the [security learning path](/docs/learning-path/security-testing/implementation-roadmap).
:::

## Quick Navigation

**Checklists:** [OWASP Top 10](#owasp-checklist) · [Baseline](#baseline) · [Headers & cookies](#headers) · [API security](#api)

**Testing:** [Safe test inputs](#payloads) · [curl recipes](#curl) · [JWT](#jwt)

**Scanners:** [Commands](#scanners) · [CI workflow](#ci)

**Reporting:** [CVSS](#cvss) · [Finding template](#finding) · [Practice targets](#targets)

---

## OWASP Top 10 checklist {#owasp-checklist}

| Risk (2021) | Check | How |
|---|---|---|
| A01 Broken Access Control | Change ids; call admin routes as a user; force-browse pages | Log in as A, request B's ids |
| A02 Cryptographic Failures | HTTPS everywhere; strong hashing; no secrets in transit/at rest | Check TLS, cookie flags, stored data |
| A03 Injection | `'`, `"`, `<>`, OS metacharacters in every input | Watch for 500s, SQL errors, script execution |
| A04 Insecure Design | Abuse the business rules | Refund > payment, skip payment, coupon abuse |
| A05 Security Misconfiguration | Verbose errors, default creds, missing headers, open dirs | Trigger errors; check headers |
| A06 Vulnerable Components | Known CVEs in dependencies | `npm audit`, Trivy, Dependency-Check |
| A07 Auth Failures | Rate limit, session expiry, password reset, MFA | Brute force, reuse old token, reset others' |
| A08 Integrity Failures | Unsigned updates, unsafe deserialization | Check update signing, CI provenance |
| A09 Logging Failures | Are attacks logged and alerted? | Do failed logins/permission errors appear? |
| A10 SSRF | URL inputs reaching internal addresses | Give a URL param an internal/metadata URL |

## Baseline {#baseline}

```text
[ ] HTTPS only; HTTP → HTTPS redirect
[ ] Security headers set (below)
[ ] Wrong login → 401, generic message
[ ] Change id in URL/body → can't see others' data
[ ] ' " < > in inputs → no 500, no SQL error, no script run
[ ] Errors generic (no stack trace / SQL / paths)
[ ] No secrets in URL, page source, localStorage
[ ] Cookies: Secure, HttpOnly, SameSite
[ ] Old/expired token rejected; logout ends session
```

## Headers & cookies {#headers}

```bash
curl -sI https://TARGET/ | grep -iE 'content-security-policy|strict-transport-security|x-frame-options|x-content-type-options|referrer-policy|permissions-policy|set-cookie'
```

| Header | Purpose | Good value |
|---|---|---|
| `Content-Security-Policy` | Limit script/resource sources (anti-XSS) | A restrictive policy, no `unsafe-inline` |
| `Strict-Transport-Security` | Force HTTPS | `max-age=31536000; includeSubDomains` |
| `X-Frame-Options` / CSP `frame-ancestors` | Anti-clickjacking | `DENY` / `SAMEORIGIN` |
| `X-Content-Type-Options` | No MIME sniffing | `nosniff` |
| `Referrer-Policy` | Limit referrer leakage | `strict-origin-when-cross-origin` |
| Cookies | Session protection | `Secure; HttpOnly; SameSite=Lax` (or `Strict`) |

## API security {#api}

```text
[ ] Every endpoint refuses no-token and bad-token requests (401)
[ ] User A can't act on user B's object ids (BOLA/IDOR) → 403/404
[ ] Normal user can't call admin functions (403)
[ ] Sending role/isAdmin/price in the body is ignored (mass assignment)
[ ] Responses contain only fields the caller may see
[ ] Rate limits on login, signup, password reset, OTP
[ ] Old API versions (/v1) removed or equally protected
[ ] Large page sizes / uploads are capped
```

Full list: [API testing cheat sheet](/cheatsheets/api-testing#security).

---

## Safe test inputs {#payloads}

Use these **only** on authorised/practice targets. They are proofs, not weapons.

| Class | Input to try | A vulnerable app… |
|---|---|---|
| SQLi (auth) | `' OR 1=1--` | logs you in / errors |
| SQLi (data) | `test')--`, `1;--` | returns extra rows / 500 SQL error |
| XSS (proof) | `<img src=x onerror=alert(1)>` | pops an alert / reflects unescaped |
| Path traversal | `../../etc/passwd` | returns file contents |
| Command injection | `; id`, `| whoami` (in fields that run commands) | returns command output |
| SSRF | `http://169.254.169.254/` (cloud metadata) | server fetches it |
| Template injection | `{{7*7}}`, `${7*7}` | renders `49` |
| Open redirect | `?next=https://evil.example` | redirects off-site |

Always start with the **harmless proof** (`alert(1)`, `7*7`), never a real attack.

## curl recipes {#curl}

```bash
J=http://localhost:3001
# login, capture JWT
TOKEN=$(curl -s -X POST $J/rest/user/login -H 'Content-Type: application/json' \
  -d '{"email":"a@b.com","password":"pass"}' | python3 -c "import json,sys;print(json.load(sys.stdin)['authentication']['token'])")
# authenticated request
curl -s "$J/rest/basket/1" -H "Authorization: Bearer $TOKEN"
# BOLA sweep: try many ids
for id in $(seq 1 10); do curl -s -o /dev/null -w "$id %{http_code}\n" "$J/rest/basket/$id" -H "Authorization: Bearer $TOKEN"; done
# check a header quickly
curl -sI $J/ | grep -i content-security-policy || echo "CSP missing"
# time a request (auth brute-force throttling)
for i in $(seq 1 5); do curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" -X POST $J/rest/user/login -H 'Content-Type: application/json' -d '{"email":"a@b.com","password":"wrong"}'; done
```

## JWT {#jwt}

```bash
echo "<JWT>" | cut -d. -f1 | base64 -d 2>/dev/null; echo   # header (alg)
echo "<JWT>" | cut -d. -f2 | base64 -d 2>/dev/null; echo   # payload (claims, exp)
```

Check: `alg` is not `none`; signature is verified server-side; `exp` is set and
short; no sensitive data in the payload (it's only base64, not encrypted).

---

## Scanner commands {#scanners}

```bash
# DAST — OWASP ZAP baseline (passive, safe)
docker run --rm ghcr.io/zaproxy/zaproxy zap-baseline.py -t https://TARGET
# DAST — ZAP full scan (ACTIVE — non-prod, with permission only)
docker run --rm ghcr.io/zaproxy/zaproxy zap-full-scan.py -t https://TARGET

# SAST — Semgrep
docker run --rm -v "$PWD:/src" semgrep/semgrep semgrep scan --config auto /src

# Dependencies + secrets + images — Trivy
docker run --rm -v "$PWD:/src" aquasec/trivy fs --scanners vuln,secret --severity HIGH,CRITICAL /src
docker run --rm -v "$PWD:/src" aquasec/trivy config /src        # IaC misconfig

# Secrets in git history — Gitleaks
docker run --rm -v "$PWD:/repo" zricethezav/gitleaks detect --source=/repo

# Dependencies by ecosystem
npm audit --audit-level=high
pip-audit
```

## CI workflow {#ci}

```yaml
# .github/workflows/security.yml (excerpt)
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - name: SAST
        run: docker run --rm -v "$PWD:/src" semgrep/semgrep semgrep scan --config auto --error /src
      - name: Dependencies & secrets
        run: docker run --rm -v "$PWD:/src" aquasec/trivy fs --scanners vuln,secret --severity HIGH,CRITICAL --exit-code 1 /src
      - name: DAST baseline (passive) against staging
        run: docker run --rm ghcr.io/zaproxy/zaproxy zap-baseline.py -t https://staging.example.com
```

Gate on **new** HIGH/CRITICAL only; baseline existing issues while you fix them.

---

## CVSS {#cvss}

| Score | Rating | Fix urgency |
|---|---|---|
| 9.0–10.0 | Critical | Now / hotfix |
| 7.0–8.9 | High | This release |
| 4.0–6.9 | Medium | Planned |
| 0.1–3.9 | Low | Backlog |
| 0 | None / Info | Note it |

Use the [FIRST CVSS calculator](https://www.first.org/cvss/calculator/) for a
base score; adjust for your data sensitivity and exposure.

## Finding template {#finding}

```text
ID / Title:   SEC-01 — <one-line what and where>
Severity:     <Critical/High/Medium/Low> (CVSS <score> <vector>)
Affected:     <method + path / component>, <build / environment>
Steps:        <exact curl / request an engineer can run>
Result:       <actual response / proof, e.g. 200 logged in as admin>
Impact:       <what an attacker gains>
Fix:          <concrete change: parameterised queries, ownership check, header…>
Reference:    <OWASP id, CWE>
```

## Practice targets {#targets}

| Target | Format |
|---|---|
| OWASP Juice Shop | Docker, full app with a scoreboard |
| PortSwigger Web Security Academy | Free online labs, per-topic |
| OWASP WebGoat | Docker, guided lessons |
| DVWA | Docker, adjustable difficulty |
| Hack The Box / TryHackMe | Online, gamified |
| VulnHub | Downloadable vulnerable VMs |

**Need more detail?** [Cheat sheet](/cheatsheets/security-testing) ·
[Best practices](/docs/fundamentals/security-testing/best-practices) ·
[Learning path](/docs/learning-path/security-testing/implementation-roadmap) ·
Full guide
