---
title: "API Testing Learning Path: Start Here"
description: "How to learn API testing in six milestones — explore with curl, CRUD and auth, a bug hunt with an answer key, Postman and Newman, automated tests in code, and GraphQL, security and performance — with a final project."
sidebar_position: 1
level: beginner
tags: [api-testing, rest, learning-path]
---

# API Testing Learning Path: Start Here

**In short:** you learn API testing in **6 milestones**, on free practice APIs
— one of which has **deliberate bugs** for you to find. You go from single
`curl` requests to a collection that runs in CI, an automated suite in code,
and security and performance checks.

:::tip How to use this page

Read this page once to see the plan. Then, for each milestone, follow the same
four steps: **learn → test → check → commit**. Come back here whenever you're
unsure what to do next.

:::

## Before you start {#before}

- A terminal with `curl` (built into macOS, Linux and Windows 10+).
- [Postman](https://www.postman.com/downloads/) (free) from Milestone 4.
- For Milestone 5: Python 3.10+ **or** Node.js 20+ — pick the language you use at work.
- Helpful: the [manual testing path](/docs/learning-path/manual-testing/implementation-roadmap)
  Milestones 1–3, for test design and bug reports.

## The pages in this learning path {#pages}

**In short:** each page has one job, so nothing is explained twice.

| Page | What it's for | When to open it |
|---|---|---|
| **This roadmap** | The plan: what each milestone covers and how to check yourself | At the start of each milestone |
| [API testing cheat sheet](/cheatsheets/api-testing) | Learn each idea: short explanation, real request and response, exercise | The "learn" step of every milestone |
| [Milestones & Mini-Projects](/docs/learning-path/api-testing/milestones-and-mini-projects) | Tasks with expected results, answer keys and solutions | The "test" and "check" steps |
| [Quick Reference](/docs/fundamentals/api-testing/api-testing-quick-reference) | Status codes, curl flags, checklists, the same request in five tools | Any time you're testing |
| [Best Practices](/docs/fundamentals/api-testing/best-practices) | Habits that find real bugs and keep suites reliable | After Milestone 3, then on every pull request |
| API testing guide | The whole service, including the OWASP API Top 10 | When you want the deeper "why" |

## The milestones {#milestones}

| Milestone | You learn | You work on | Rough time |
|---|---|---|---|
| [1](#milestone-1) | HTTP, methods, status codes, JSON, headers, parameters | Exploring two APIs with curl | 1 week |
| [2](#milestone-2) | Auth, CRUD, reading back | A booking's full life cycle | 1 week |
| [3](#milestone-3) | Negative testing, bug reports | Bug hunt: Restful Booker | 1 week |
| [4](#milestone-4) | Postman, variables, test scripts, Newman | A collection that runs from the command line | 1 week |
| [5](#milestone-5) | Tests in code, fixtures, builders, schemas, known bugs | An automated suite in Python or TypeScript | 1–2 weeks |
| [6](#milestone-6) | GraphQL, API security, API performance | Three short investigations | 1–2 weeks |

Times assume about 5 hours a week.

**For each milestone:**

1. **Learn** — read the cheat-sheet sections listed below and run their examples.
2. **Test** — do the tasks in [Milestones & Mini-Projects](/docs/learning-path/api-testing/milestones-and-mini-projects).
3. **Check** — compare with the expected results. Only then open the answer key or solution.
4. **Commit** — keep commands, collections and code in a repo:

```text
api-testing-portfolio/
├── m1-explore/requests.sh
├── m2-crud/crud.sh
├── m3-bug-hunt/bug-reports.md
├── m4-postman/booker.postman_collection.json
├── m5-suite/tests/…
└── m6-investigations/graphql.md, security.md, perf/api-smoke.js
```

### Milestone 1: Explore with curl {#milestone-1}

**Learn:** [What an API is](/cheatsheets/api-testing#what-is-an-api) ·
[Request & response](/cheatsheets/api-testing#request-response) ·
[Methods](/cheatsheets/api-testing#methods) ·
[Status codes](/cheatsheets/api-testing#status-codes) ·
[JSON](/cheatsheets/api-testing#json) ·
[curl](/cheatsheets/api-testing#curl) ·
[Headers](/cheatsheets/api-testing#headers) ·
[Path & query parameters](/cheatsheets/api-testing#parameters)

**Work on:** [Exploring two APIs](/docs/learning-path/api-testing/milestones-and-mini-projects#milestone-1)

**Check yourself:**
- [ ] What's the difference between a 401 and a 403?
- [ ] Why is a 500 always worth a bug report?
- [ ] What does the `Accept` header ask for?

### Milestone 2: CRUD & auth {#milestone-2}

**Learn:** [Authentication](/cheatsheets/api-testing#auth) ·
[A CRUD test flow](/cheatsheets/api-testing#crud) ·
[What to check](/cheatsheets/api-testing#what-to-check) ·
Quick Reference: [Auth](/docs/fundamentals/api-testing/api-testing-quick-reference#auth)

**Work on:** [A booking's life cycle](/docs/learning-path/api-testing/milestones-and-mini-projects#milestone-2)

**Check yourself:**
- [ ] Why read data back after a write?
- [ ] What's the difference between `PUT` and `PATCH`?
- [ ] Is Base64 encryption? Why does that matter for Basic auth?

### Milestone 3: Bug hunt {#milestone-3}

**Learn:** [Negative testing](/cheatsheets/api-testing#negative) ·
[Idempotency](/cheatsheets/api-testing#idempotency) ·
[Common mistakes](/cheatsheets/api-testing#gotchas) ·
Quick Reference: [Negative test ideas](/docs/fundamentals/api-testing/api-testing-quick-reference#negative-ideas),
[Bug report for an API](/docs/fundamentals/api-testing/api-testing-quick-reference#api-bug-report)

**Work on:** [Bug hunt: Restful Booker](/docs/learning-path/api-testing/milestones-and-mini-projects#milestone-3)

**Then read:** [Best Practices](/docs/fundamentals/api-testing/best-practices), sections 1–5.

**Check yourself:**
- [ ] What should an API return for a missing required field?
- [ ] Why is "silently accepted" often worse than "rejected"?
- [ ] What makes an API bug report reproducible in seconds?

### Milestone 4: Postman & Newman {#milestone-4}

**Learn:** [Postman & Newman](/cheatsheets/api-testing#postman) ·
Quick Reference: [Postman scripts](/docs/fundamentals/api-testing/api-testing-quick-reference#postman-scripts),
[Newman](/docs/fundamentals/api-testing/api-testing-quick-reference#newman) ·
[Postman guide](/docs/sdet-skills/postman/postman-guide)

**Work on:** [A collection that runs from the command line](/docs/learning-path/api-testing/milestones-and-mini-projects#milestone-4)

**Check yourself:**
- [ ] How does one request pass a value (like a token) to the next?
- [ ] Why keep credentials in an environment file, not the collection?
- [ ] How does Newman make a CI job fail?

### Milestone 5: Tests in code {#milestone-5}

**Learn:** [Schema validation](/cheatsheets/api-testing#schema) ·
[Tests in code](/cheatsheets/api-testing#tests-in-code) ·
[Lists & filters](/cheatsheets/api-testing#lists) ·
Quick Reference: [Same request, five tools](/docs/fundamentals/api-testing/api-testing-quick-reference#five-tools)

**Work on:** [An automated suite](/docs/learning-path/api-testing/milestones-and-mini-projects#milestone-5)

**Then read:** [Best Practices](/docs/fundamentals/api-testing/best-practices), sections 6–12.

**Check yourself:**
- [ ] Why should a test for a known API bug assert the *correct* behaviour?
- [ ] What does a schema check catch that value checks miss?
- [ ] Why fetch the token in a fixture?

### Milestone 6: GraphQL, security & performance {#milestone-6}

**Learn:** [Contract testing](/cheatsheets/api-testing#contracts) ·
[Mocking](/cheatsheets/api-testing#mocking) ·
[GraphQL](/cheatsheets/api-testing#graphql) ·
[API security](/cheatsheets/api-testing#security) ·
[API performance](/cheatsheets/api-testing#performance) ·
Quick Reference: [Security checks](/docs/fundamentals/api-testing/api-testing-quick-reference#security-checks)

**Work on:** [Three investigations](/docs/learning-path/api-testing/milestones-and-mini-projects#milestone-6)

**Check yourself:**
- [ ] Why isn't HTTP 200 enough to pass a GraphQL test?
- [ ] What is BOLA, and how do you test for it?
- [ ] Why keep load tiny on shared demo APIs?

## When you get stuck {#stuck}

| Problem | What to do |
|---|---|
| `curl` shows nothing | Add `-i` or `-v` to see status and headers |
| JSON error in your request | Validate the body: `echo '<json>' \| python3 -m json.tool` |
| 403 on update/delete | Get a new token — tokens expire; check the `Cookie: token=` header spelling |
| 404 for a booking you made earlier | Restful Booker resets its data regularly — create a fresh one |
| Postman works, code doesn't | Compare headers; Postman adds some automatically. Use `curl -v` from Postman's code view |

## What's next {#next}

- Put API tests into a full framework: [Test automation path](/docs/learning-path/test-automation/implementation-roadmap), Milestone 4.
- Load-test properly: Performance testing guide.
- Go deeper on security: Security testing guide.

**Good resources to use alongside:** the free
[OWASP API Security Top 10](https://owasp.org/API-Security/) and MDN's
[HTTP reference](https://developer.mozilla.org/en-US/docs/Web/HTTP) for status
codes and headers.
