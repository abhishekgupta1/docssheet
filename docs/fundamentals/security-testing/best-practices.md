---
title: "Security Testing Best Practices"
description: "Habits that make security testing safe, legal and useful — permission and scope, non-destructive proofs, shift-left, combine scanners with manual testing, triage findings, test access control hardest, protect data, report responsibly, and a pre-engagement and pre-report checklist."
sidebar_position: 2
level: advanced
tags: [security-testing, owasp, appsec, fundamentals, best-practices]
---

# Security Testing Best Practices

This page lists good habits for security testing — the ones that keep you (and
the systems you test) safe, and that turn findings into fixes. They apply to
testers adding security checks, and to specialists running full assessments.

Each practice has:
- **Do** – the good way.
- **Why** – the reason in simple words.

:::danger The first rule
Only test systems you own or have **written permission** to test. Nothing on
this page overrides that.
:::

:::tip How to use this page
Read it once after Part 2 of the [security cheat sheet](/cheatsheets/security-testing),
then use [the checklists at the end](#11-checklists) before and after every engagement.
:::

---

## Contents

1. [Permission and Scope](#1-permission-and-scope)
2. [Do No Harm](#2-do-no-harm)
3. [Shift Left](#3-shift-left)
4. [Scanners Plus People](#4-scanners-plus-people)
5. [Triage Everything](#5-triage-everything)
6. [Test Access Control Hardest](#6-test-access-control-hardest)
7. [Protect the Data You Handle](#7-protect-the-data-you-handle)
8. [Report Responsibly](#8-report-responsibly)
9. [Prioritise and Re-test](#9-prioritise-and-re-test)
10. [Keep Learning Legally](#10-keep-learning-legally)
11. [Checklists](#11-checklists)

---

## 1. Permission and Scope

**In short:** written authorisation with a clear scope is what separates testing from crime.

- **Do** get rules of engagement in writing before touching anything: what's in
  and out of scope, allowed methods, time window, contacts.
  **Why:** verbal "sure, go ahead" doesn't protect you or the client.
- **Do** stay strictly inside scope, even when you spot something juicy next door.
  **Why:** out-of-scope testing breaks trust and the law.
- **Do** confirm who owns each system — cloud, third parties, domains you don't recognise.
  **Why:** a subdomain may belong to a vendor who hasn't agreed to be tested.

---

## 2. Do No Harm

**In short:** prove the vulnerability with the least impact possible.

- **Do** use harmless proofs: `alert(1)` for XSS, `7*7` for template injection,
  reading (not deleting) one record for access control.
  **Why:** you demonstrate risk without causing damage.
- **Don't** run denial-of-service, delete or modify data, or pivot deeper than
  needed, unless the scope explicitly allows it.
  **Why:** a "quick test" can take production down or destroy records.
- **Do** throttle automated tools and avoid full active scans on production.
  **Why:** scanners can hammer a site; active scans send real attacks.
- **Do** tell the on-call team before noisy tests.
  **Why:** otherwise your test becomes their 2 a.m. incident.

---

## 3. Shift Left

**In short:** the cheapest vulnerability is the one prevented in design or caught in CI.

- **Do** threat-model risky features during design.
  **Why:** an auth flaw found in a diagram costs a conversation, not a breach.
- **Do** run SAST, dependency and secret scans on every pull request.
  **Why:** they catch whole classes of issue the moment they're introduced.
- **Do** add security cases to normal test plans (auth, access control, input validation).
  **Why:** most security bugs are ordinary bugs with a security impact.

---

## 4. Scanners Plus People

**In short:** tools find the known and the shallow; people find logic and depth.

- **Do** use scanners for coverage and regressions (headers, CVEs, known patterns).
  **Why:** they're fast, consistent and tireless.
- **Don't** trust scanner output as-is — confirm every finding by hand.
  **Why:** scanners produce false positives; a report full of them loses credibility.
- **Do** test business logic and access control manually.
  **Why:** no scanner understands that a user shouldn't refund more than they paid.

---

## 5. Triage Everything

**In short:** a finding isn't real until you've reproduced it and judged its impact.

- **Do** reproduce each issue and capture the exact request and response.
  **Why:** "the scanner said so" won't get it fixed.
- **Do** remove duplicates and false positives before reporting.
  **Why:** developers stop reading reports that waste their time.
- **Do** rate with CVSS **and** business context.
  **Why:** the same bug matters more on a page holding medical or payment data.

---

## 6. Test Access Control Hardest

**In short:** broken access control is the most common serious flaw — spend the most time here.

- **Do** test every object-taking endpoint as the wrong user (BOLA/IDOR).
  **Why:** it's #1 on both the web and API OWASP lists, and scanners miss it.
- **Do** test function-level control: normal users calling admin actions.
  **Why:** hidden admin endpoints are often unprotected.
- **Do** test with two accounts per role.
  **Why:** you can't prove "A can't see B" with one account.
- **Do** record what's correctly protected, too.
  **Why:** it shows coverage and builds trust in the report.

---

## 7. Protect the Data You Handle

**In short:** security testing gives you access to sensitive things — treat them accordingly.

- **Do** minimise, mask and delete any real data you encounter.
  **Why:** your report and screenshots shouldn't become the next breach.
- **Don't** copy production data to your laptop or paste tokens into websites.
  **Why:** you'd be creating the exposure you're paid to find.
- **Do** store findings in an access-controlled place.
  **Why:** a vulnerability report is a map for attackers.

---

## 8. Report Responsibly

**In short:** report clearly, quickly for criticals, and through agreed channels.

- **Do** report critical findings immediately by phone/secure channel, before the written report.
  **Why:** an unauthenticated admin bypass can't wait a week.
- **Do** write each finding as steps + proof + impact + fix, tied to a standard (OWASP/CWE).
  **Why:** developers fix what they can reproduce and understand.
- **Do** follow coordinated disclosure for third-party or open-source issues.
  **Why:** public zero-days endanger everyone; give maintainers time to fix.
- **Don't** describe a working exploit chain in tickets more widely than needed.
  **Why:** limit who can weaponise it before it's fixed.

---

## 9. Prioritise and Re-test

**In short:** fix the worst first, then confirm the fix actually works.

- **Do** rank by real risk (impact × exploitability), not just CVSS.
- **Do** fix shared components (auth, an input library) once for many issues.
- **Do** re-test after fixes and add a regression test where you can.
  **Why:** fixes often miss edge cases, and the same flaw tends to return.

---

## 10. Keep Learning Legally

**In short:** build skills on targets made for it.

- **Do** practise on Juice Shop, PortSwigger Academy, WebGoat, DVWA, Hack The Box, TryHackMe.
  **Why:** real skills, zero legal risk.
- **Do** follow OWASP (Top 10, WSTG, cheat sheets) and CWE.
  **Why:** they're the shared language of the field.
- **Do** consider certifications: PortSwigger BSCP, eJPT, then OSCP for pentesting; ISTQB Security Tester for QA.

---

## 11. Checklists {#11-checklists}

**Before an engagement:**

- [ ] Written authorisation and scope signed
- [ ] Targets confirmed as owned by the client (domains, cloud, third parties)
- [ ] Allowed methods, time window and rate limits agreed
- [ ] Emergency contacts and critical-finding process in place
- [ ] Test accounts for two users per role
- [ ] Non-production target, or a production plan with rollback

**Before you send the report:**

- [ ] Every finding reproduced with an exact request/response
- [ ] False positives and duplicates removed
- [ ] Severity via CVSS + business context
- [ ] Concrete fix and a standard reference per finding
- [ ] Criticals already reported out-of-band
- [ ] Any real data masked; report stored securely
- [ ] Executive summary leads with the top risks
- [ ] Re-test plan agreed

**Need more detail?** [Cheat sheet](/cheatsheets/security-testing) ·
[Quick reference](/docs/fundamentals/security-testing/security-testing-quick-reference) ·
Full guide
