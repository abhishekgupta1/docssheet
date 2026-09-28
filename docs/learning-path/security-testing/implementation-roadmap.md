---
title: "Security Testing Learning Path: Start Here"
description: "How to learn authorised security testing in six milestones on OWASP Juice Shop — permission and baseline checks, injection, access control and auth, XSS and logic, scanners in CI, and a full assessment report."
sidebar_position: 1
level: intermediate
tags: [security-testing, owasp, appsec, learning-path]
---

# Security Testing Learning Path: Start Here

**In short:** you learn security testing in **6 milestones** on **OWASP Juice
Shop**, an app built to be broken into for practice. You start with the checks
any tester can do and end with a full assessment report — always on a legal
target on your own machine.

:::danger Legal targets only
This path uses Juice Shop (deliberately vulnerable, made for this) and the free
PortSwigger Web Security Academy. Never use these techniques on systems you
don't own or have written permission to test. See
[permission and scope](/cheatsheets/security-testing#scope).
:::

## Before you start {#before}

- Docker, to run [Juice Shop](/cheatsheets/security-testing#practice-app): `docker run --rm -d -p 3001:3000 bkimminich/juice-shop`.
- Comfort with HTTP, JSON and `curl` — the [API testing cheat sheet](/cheatsheets/api-testing), sections 1–9.
- A free [PortSwigger Web Security Academy](https://portswigger.net/web-security) account (used from Milestone 2).
- For scanners (Milestone 5): Docker images for ZAP, Semgrep, Trivy.

## The pages in this learning path {#pages}

| Page | What it's for | When to open it |
|---|---|---|
| **This roadmap** | The plan and self-checks | At the start of each milestone |
| [Security cheat sheet](/cheatsheets/security-testing) | Learn each idea, with real Juice Shop results | The "learn" step |
| [Milestones & Mini-Projects](/docs/learning-path/security-testing/milestones-and-mini-projects) | Tasks, expected results, answer keys | The "test" and "check" steps |
| [Quick Reference](/docs/fundamentals/security-testing/security-testing-quick-reference) | Checklists, payloads, scanner commands, templates | Any time |
| [Best Practices](/docs/fundamentals/security-testing/best-practices) | Safe, legal, useful habits | After Milestone 1, then every engagement |
| Security testing guide | The service and penetration-test phases | For the deeper "why" |

## The milestones {#milestones}

| Milestone | You learn | You work on | Rough time |
|---|---|---|---|
| [1](#milestone-1) | Scope, headers, errors, baseline | Recon + baseline on Juice Shop | 1 week |
| [2](#milestone-2) | Injection, SQLi | Login bypass + search SQLi | 1–2 weeks |
| [3](#milestone-3) | Broken access control, auth | BOLA, JWT, brute force | 1–2 weeks |
| [4](#milestone-4) | XSS, business logic | Reflected/stored XSS, price/coupon abuse | 1–2 weeks |
| [5](#milestone-5) | Scanners in CI (ZAP, SAST, SCA, secrets) | An automated pipeline | 1 week |
| [6](#milestone-6) | CVSS, reporting, a full assessment | A findings report | 1–2 weeks |

Times assume about 5 hours a week.

**For each milestone:** learn (cheat-sheet sections) → test (the tasks) →
check (answer key) → commit your findings and scripts.

### Milestone 1: Recon & baseline {#milestone-1}

**Learn:** [Permission & scope](/cheatsheets/security-testing#scope) ·
[What security testing is](/cheatsheets/security-testing#what-is-it) ·
[Think like an attacker](/cheatsheets/security-testing#threats) ·
[OWASP Top 10](/cheatsheets/security-testing#owasp) ·
[Security headers](/cheatsheets/security-testing#headers) ·
[Reading errors](/cheatsheets/security-testing#errors) ·
[Baseline checks](/cheatsheets/security-testing#baseline)

**Work on:** [Recon + baseline](/docs/learning-path/security-testing/milestones-and-mini-projects#milestone-1)

**Then read:** [Best Practices](/docs/fundamentals/security-testing/best-practices), sections 1–2.

**Check yourself:**
- [ ] What must you have before testing any real system?
- [ ] Which two security headers is Juice Shop missing?
- [ ] Why is a 500 with a SQL error a finding on its own?

### Milestone 2: Injection {#milestone-2}

**Learn:** [HTTP & auth recap](/cheatsheets/security-testing#http) ·
[Injection & SQLi](/cheatsheets/security-testing#injection) ·
Quick Reference: [Safe test inputs](/docs/fundamentals/security-testing/security-testing-quick-reference#payloads)

**Work on:** [Login bypass + search SQLi](/docs/learning-path/security-testing/milestones-and-mini-projects#milestone-2)

**Check yourself:**
- [ ] Why does `' OR 1=1--` log you in as admin?
- [ ] What is the real fix for SQLi?
- [ ] How do you spot a SQLi point without breaking anything?

### Milestone 3: Access control & auth {#milestone-3}

**Learn:** [Broken access control](/cheatsheets/security-testing#access-control) ·
[Authentication](/cheatsheets/security-testing#authentication) ·
Quick Reference: [curl recipes](/docs/fundamentals/security-testing/security-testing-quick-reference#curl),
[JWT](/docs/fundamentals/security-testing/security-testing-quick-reference#jwt)

**Work on:** [BOLA, JWT, brute force](/docs/learning-path/security-testing/milestones-and-mini-projects#milestone-3)

**Then read:** [Best Practices](/docs/fundamentals/security-testing/best-practices), sections 6–7.

**Check yourself:**
- [ ] What is BOLA/IDOR, and how do you test for it?
- [ ] What's in a JWT payload, and is it encrypted?
- [ ] Why test with two accounts per role?

### Milestone 4: XSS & business logic {#milestone-4}

**Learn:** [XSS](/cheatsheets/security-testing#xss) ·
[Business logic](/cheatsheets/security-testing#business-logic) ·
[Common mistakes](/cheatsheets/security-testing#gotchas)

**Work on:** [XSS + price/coupon abuse](/docs/learning-path/security-testing/milestones-and-mini-projects#milestone-4)

**Check yourself:**
- [ ] What's the difference between reflected and stored XSS?
- [ ] Which header reduces XSS impact — and does Juice Shop set it?
- [ ] Why can't a scanner find business-logic flaws?

### Milestone 5: Scanners in CI {#milestone-5}

**Learn:** [Secrets in code](/cheatsheets/security-testing#secrets) ·
[Vulnerable dependencies](/cheatsheets/security-testing#dependencies) ·
[Automated scanning (ZAP)](/cheatsheets/security-testing#zap) ·
[SAST & dependency scans in CI](/cheatsheets/security-testing#sast) ·
Quick Reference: [Scanner commands](/docs/fundamentals/security-testing/security-testing-quick-reference#scanners)

**Work on:** [An automated pipeline](/docs/learning-path/security-testing/milestones-and-mini-projects#milestone-5)

**Then read:** [Best Practices](/docs/fundamentals/security-testing/best-practices), sections 3–5.

**Check yourself:**
- [ ] What's the difference between a ZAP baseline and full scan?
- [ ] Why gate CI on *new* HIGH/CRITICAL only?
- [ ] Why must a leaked secret be rotated, not just deleted?

### Milestone 6: Assessment & report {#milestone-6}

**Learn:** [Burp Suite](/cheatsheets/security-testing#burp) ·
[API & cloud](/cheatsheets/security-testing#api-cloud) ·
[CVSS & severity](/cheatsheets/security-testing#cvss) ·
[Reporting](/cheatsheets/security-testing#reporting) ·
Quick Reference: [CVSS](/docs/fundamentals/security-testing/security-testing-quick-reference#cvss),
[Finding template](/docs/fundamentals/security-testing/security-testing-quick-reference#finding)

**Work on:** [A findings report](/docs/learning-path/security-testing/milestones-and-mini-projects#milestone-6)

**Then read:** [Best Practices](/docs/fundamentals/security-testing/best-practices), sections 8–11.

**Check yourself:**
- [ ] What makes a finding "Critical"?
- [ ] What goes in the first page of a report?
- [ ] When do you report a critical, and how?

## When you get stuck {#stuck}

| Problem | What to do |
|---|---|
| Juice Shop won't start | Check the port (`-p 3001:3000`); `docker logs juice`; wait ~30 s for it to boot |
| A challenge won't solve | Open `/#/score-board`; Juice Shop has hints and an official companion guide ("Pwning OWASP Juice Shop") |
| A scanner floods you with findings | Filter to HIGH/CRITICAL; confirm by hand before believing |
| Not sure if something's a bug | Ask: could an attacker gain access, data, or control? If unclear, log it as info |

## What's next {#next}

- API-specific security: [API testing cheat sheet](/cheatsheets/api-testing#security).
- Cloud and infrastructure: [AWS](/docs/sre-skills/aws/aws-guide) and [Terraform](/docs/sre-skills/terraform/terraform-guide) guides.
- Certifications: PortSwigger BSCP, eJPT, OSCP; ISTQB Security Tester (CT-SEC).

**Good resources:** OWASP [Top 10](https://owasp.org/Top10/), [WSTG](https://owasp.org/www-project-web-security-testing-guide/)
and [Cheat Sheet Series](https://cheatsheetseries.owasp.org/); the free
PortSwigger Web Security Academy; the book *The Web Application Hacker's Handbook*.
