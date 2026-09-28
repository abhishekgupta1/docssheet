---
title: "API Testing Best Practices"
description: "Habits that make API tests find real bugs and stay reliable — start from the contract, test every layer of a response, negative and auth tests, data ownership, schemas, environments and secrets, idempotency, contracts and mocks, CI, reporting, and a pre-merge checklist."
sidebar_position: 2
level: intermediate
tags: [api-testing, rest, fundamentals, best-practices]
---

# API Testing Best Practices

This page lists good habits for testing APIs, whether you click through
Postman or write suites in code. They help your tests catch the bugs that
matter — wrong data, broken rules, security holes — and keep the suite
reliable enough to block a release.

Each practice has:
- **Do** – the good way.
- **Why** – the reason in simple words.
- An example, where it helps. Examples use the
  [practice APIs](/cheatsheets/api-testing#practice-apis).

:::tip How to use this page

Read it once after you finish Part 2 of the [API testing cheat sheet](/cheatsheets/api-testing),
then use [the checklist at the end](#12-short-checklist-before-you-merge) on
every pull request that adds API tests.

:::

---

## Contents

1. [Start From the Contract](#1-start-from-the-contract)
2. [Check the Whole Response](#2-check-the-whole-response)
3. [Negative Tests First-Class](#3-negative-tests-first-class)
4. [Auth and Permissions](#4-auth-and-permissions)
5. [Own Your Test Data](#5-own-your-test-data)
6. [Schemas and Contracts](#6-schemas-and-contracts)
7. [Environments and Secrets](#7-environments-and-secrets)
8. [Reliability](#8-reliability)
9. [Mocks, Used Carefully](#9-mocks-used-carefully)
10. [Organising the Suite](#10-organising-the-suite)
11. [Reporting API Bugs](#11-reporting-api-bugs)
12. [Short Checklist Before You Merge](#12-short-checklist-before-you-merge)

---

## 1. Start From the Contract

**In short:** read the API's specification first, then test that reality matches it.

- **Do** get the OpenAPI/Swagger file (or write down the contract from the team) before testing.
  **Why:** you can't say a response is wrong without knowing what's right.
- **Do** build an **endpoint inventory**: method, path, auth needed, owner.
  **Why:** it's your coverage map — untested endpoints are obvious.
- **Do** test that undocumented behaviour doesn't exist (hidden endpoints, extra fields).
  **Why:** undocumented endpoints are rarely protected as carefully.

---

## 2. Check the Whole Response

**In short:** status, body, schema, headers and saved state — a 200 alone proves very little.

- **Do** assert specific values, not just that a field exists.
  **Why:** `totalprice` existing doesn't mean it's the price you sent.
- **Do** read data back with a `GET` after every write.
  **Why:** some APIs echo your input in the response without saving it.
- **Do** check `Content-Type` and important headers.
  **Why:** clients break when the format changes silently.

```python
# Weak
assert res.status_code == 200
# Strong
assert res.status_code == 200
assert res.json() == sent                                            # stored exactly what we sent
assert requests.get(f"{BASE_URL}/booking/{booking_id}").json() == sent   # and it's really saved
```

---

## 3. Negative Tests First-Class

**In short:** most API bugs hide in invalid input — give negative tests the same care as happy paths.

- **Do** test each required field missing, one at a time.
  **Why:** on Restful Booker, a missing field returns **500** — a crash found in one test.
- **Do** test wrong types and impossible values (`"abc"` for a price, check-out before check-in).
  **Why:** silent acceptance (price stored as `null`) corrupts data far from where it started.
- **Do** expect a specific 4xx and a helpful message.
  **Why:** "400 — lastname is required" lets clients fix their request; a 500 doesn't.
- **Do** write the test for the *correct* behaviour even when the API is wrong.
  **Why:** the failing test is the bug report; mark it as a known failure until it's fixed.

---

## 4. Auth and Permissions

**In short:** test every protected endpoint with no user, the wrong user and the wrong role.

- **Do** keep test accounts for **two users of each role**.
  **Why:** you can't test "user A can't see user B's data" with one user.
- **Do** try another user's ids on every endpoint that takes an id.
  **Why:** broken object-level authorization (BOLA) is the most common serious API flaw.
- **Do** check tokens expire and that logout really invalidates them.
  **Why:** a stolen token that works forever is a permanent breach.
- **Do** fetch fresh tokens in a fixture, never hard-code them.
  **Why:** hard-coded tokens expire and make tests fail for the wrong reason.

---

## 5. Own Your Test Data

**In short:** each test creates the data it needs and doesn't rely on anything already there.

- **Do** create data in the test (or a fixture) with a unique value.
  **Why:** shared demo data like "booking 1" is changed or deleted by others — Restful Booker's booking 1 doesn't always exist.
- **Do** use builders with valid defaults and override one field per test.
  **Why:** readers see instantly which field the test is about.
- **Do** clean up what you created when the environment is shared.
  **Why:** thousands of leftover test records slow everyone down.

---

## 6. Schemas and Contracts

**In short:** validate shapes automatically, and let consumers and providers agree contracts in code.

- **Do** validate every response against a JSON Schema (or the OpenAPI spec).
  **Why:** one line catches wrong types and missing fields on every call.
- **Do** keep schemas in version control next to the tests.
  **Why:** a schema change shows up in review, not in production.
- **Do** use consumer-driven contract tests (Pact) between internal services.
  **Why:** the provider learns it's about to break a consumer before deploying.

---

## 7. Environments and Secrets

**In short:** the same tests run anywhere by changing configuration, never code.

- **Do** put base URLs and credentials in environment variables or Postman environments.
  **Why:** switching from staging to a local build is one setting.
- **Don't** commit tokens, API keys or real passwords — in code or in exported Postman collections.
  **Why:** exported collections are often shared publicly by accident.
- **Do** mark destructive tests (deletes, bulk updates) and never run them against production.
  **Why:** a test that deletes "all test users" is one wrong URL away from deleting real ones.

---

## 8. Reliability

**In short:** API suites should be the most stable part of your testing — keep them that way.

- **Do** set timeouts on every request.
  **Why:** a hanging call shouldn't hang the whole CI job.
- **Do** make tests independent and safe to run in parallel.
  **Why:** fast suites get run on every change.
- **Don't** retry failed requests inside tests to "make them pass".
  **Why:** retries hide real errors — unless you're *testing* retry behaviour.
- **Do** check an environment health endpoint before the suite starts.
  **Why:** "environment down" is reported once, not as 300 failures.

---

## 9. Mocks, Used Carefully

**In short:** mock what you don't own; test what you do own for real.

- **Do** mock third parties (payments, email, SMS) in most tests.
  **Why:** sandboxes are slow, rate-limited, and hard to put into error states.
- **Do** keep a small set of tests against the real integration.
  **Why:** mocks don't notice when the real provider changes.
- **Do** generate mocks from the contract (OpenAPI → Prism) where possible.
  **Why:** hand-written mocks drift away from reality.

---

## 10. Organising the Suite

**In short:** group by resource, tier by speed, and keep helpers in one place.

- **Do** organise tests by resource (`bookings/`, `auth/`, `payments/`).
- **Do** tag a small smoke tier (health, auth, one CRUD flow) for every deploy.
- **Do** wrap endpoints in a client class/module, so tests call `create(booking)`, not raw URLs.
  **Why (all):** a new team member finds and adds tests quickly, and a path change is a one-line fix.

---

## 11. Reporting API Bugs

**In short:** an API bug report is a runnable request plus expected vs actual.

- **Do** include a copy-pasteable `curl` command.
  **Why:** developers reproduce it in seconds, without your tools.
- **Do** include the timestamp (with time zone) and any request/correlation id header.
  **Why:** developers can find the exact server log line.
- **Do** mask tokens and personal data.
  **Why:** bug trackers are widely shared.

See the [API bug report example](/docs/fundamentals/api-testing/api-testing-quick-reference#api-bug-report).

---

## 12. Short Checklist Before You Merge

- [ ] Every endpoint touched has happy, negative and auth tests
- [ ] Writes are read back; values and schema asserted, not just status
- [ ] Tests create their own data with unique values
- [ ] No tokens, keys or passwords in code or collections
- [ ] Base URL and credentials come from configuration
- [ ] Timeouts set; no retries hiding failures
- [ ] Runs in parallel and in any order
- [ ] Known API bugs are marked as expected failures with a ticket id
- [ ] Smoke tier tagged and fast
- [ ] Endpoint inventory / coverage updated

**Need more detail?** [Cheat sheet](/cheatsheets/api-testing) ·
[Quick reference](/docs/fundamentals/api-testing/api-testing-quick-reference) ·
Full guide
