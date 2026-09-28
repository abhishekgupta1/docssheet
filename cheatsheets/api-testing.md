---
title: "API Testing Cheat Sheet"
description: "A beginner-to-advanced reference for API testing — HTTP, curl, status codes, JSON, auth, CRUD flows, negative and schema tests, Postman and Newman, tests in TypeScript and Python, contracts, mocking, GraphQL, API security and performance."
level: beginner
tags: [api-testing, rest, http, postman, sdet, cheat-sheet]
hide_table_of_contents: true
---

# API testing cheatsheet

Learn to test APIs — the services behind every app — step by step, from your
first `curl` request to automated suites with schema, security and performance
checks. Each section has three parts:

- **In short** — the idea in one sentence.
- **Example** — a real request, with the real response shown under it.
- **Try it** — a small exercise on a free practice API.

Every command and test on this page was run against the
[practice APIs](#practice-apis); the responses shown are real. Want the longer
story? The API testing guide
covers the service end to end.

<a class="topic-crosslink" href="/docs/sdet-skills/qa-services-delivery/api-testing">📖 Full guide: API testing →</a>

<LevelBadge level="beginner" />

<nav class="cheat-jump-nav" aria-label="API testing learning sections">
  <a class="button button--primary" href="/docs/learning-path/api-testing/implementation-roadmap">Learning Path</a>
  <a class="button button--primary" href="/docs/fundamentals/api-testing/api-testing-quick-reference">Quick Reference</a>
  <a class="button button--primary" href="/docs/fundamentals/api-testing/best-practices">Best Practices</a>
</nav>

:::tip How to use this page

Go through **Part 1** in order with a terminal open — `curl` is already
installed on macOS, Linux and Windows 10+. **Part 2** turns requests into
tests. **Part 3** covers contracts, mocking, GraphQL, security and performance.
Type the commands yourself; change one thing at a time and watch the response change.

:::

## Contents {#contents}

**[Practice APIs](#practice-apis)**

**[Part 1 — Beginner](#part-1)**:
[What an API is](#what-is-an-api) ·
[Request & response](#request-response) ·
[Methods](#methods) ·
[Status codes](#status-codes) ·
[JSON](#json) ·
[curl](#curl) ·
[Headers](#headers) ·
[Path & query parameters](#parameters)

**[Part 2 — Core](#part-2)**:
[Authentication](#auth) ·
[A CRUD test flow](#crud) ·
[What to check](#what-to-check) ·
[Negative testing](#negative) ·
[Schema validation](#schema) ·
[Postman & Newman](#postman) ·
[Tests in code](#tests-in-code) ·
[Lists & filters](#lists) ·
[Idempotency](#idempotency) ·
[Common mistakes](#gotchas)

**[Part 3 — Advanced](#part-3)**:
[Contract testing](#contracts) ·
[Mocking](#mocking) ·
[GraphQL](#graphql) ·
[API security](#security) ·
[API performance](#performance) ·
[Words you'll meet](#glossary)

## Practice APIs {#practice-apis}

**In short:** four free public APIs, each good for a different lesson.

| API | Base URL | Good for |
|---|---|---|
| **Restful Booker** | `https://restful-booker.herokuapp.com` | Full CRUD, auth, and **deliberate bugs** to find |
| **JSONPlaceholder** | `https://jsonplaceholder.typicode.com` | Simple reads, filters, fake writes (nothing is really saved) |
| **httpbin** | `https://httpbin.org` | Seeing exactly what you sent; auth and status-code practice |
| **Countries (GraphQL)** | `https://countries.trevorblades.com` | GraphQL queries |

Restful Booker's admin login is public on purpose: `admin` / `password123`.
These are shared demo services — keep request volumes small, and never send real personal data.

## Part 1 — Beginner {#part-1}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 1. What an API is {#what-is-an-api}

**In short:** an **API** (Application Programming Interface) is how programs
ask each other for data or actions — the app's screens are just one client of it.

```text
 Mobile app ─┐
 Web site  ──┼──▶  API (e.g. /booking)  ──▶  business rules  ──▶  database
 Partner   ──┘        ▲
                      └── API tests talk to it directly — no screen needed
```

Why test here: API tests are **faster** (milliseconds, no browser), **more
stable** (no UI changes) and find bugs **earlier** (before any screen exists).
Most business rules live behind the API, so that's where most bugs are.

**Try it:** open `https://jsonplaceholder.typicode.com/posts/1` in your browser.
That JSON text is an API response.

</div>

<div class="cheat-card">

#### 2. Request & response {#request-response}

**In short:** a **request** has a method, a URL, headers and maybe a body; a
**response** has a status code, headers and maybe a body.

```text
REQUEST                                     RESPONSE
POST /booking HTTP/1.1                      HTTP/1.1 200 OK
Host: restful-booker.herokuapp.com          Content-Type: application/json
Content-Type: application/json
Accept: application/json                    {"bookingid": 3240, "booking": {…}}

{"firstname": "Asha", "lastname": "Rao", …}
  ▲ method + path   ▲ headers   ▲ body        ▲ status   ▲ headers   ▲ body
```

Every API test is: send a request, then check the response — status, body,
headers — and sometimes check that the data was really saved.

</div>

<div class="cheat-card">

#### 3. Methods {#methods}

**In short:** the method says what you want to do with the resource.

| Method | Does | Example | Safe to repeat? |
|---|---|---|---|
| `GET` | Read | `GET /booking/42` | Yes |
| `POST` | Create / action | `POST /booking` | No — may create two |
| `PUT` | Replace all fields | `PUT /booking/42` (full body) | Yes |
| `PATCH` | Change some fields | `PATCH /booking/42` `{"firstname":"Asha"}` | Usually |
| `DELETE` | Remove | `DELETE /booking/42` | Yes |

"Safe to repeat" is called **idempotent** — see [section 17](#idempotency).

**Try it:** with the practice APIs table, guess which method creates a booking
and which updates just its first name. Check in section 10.

</div>

<div class="cheat-card">

#### 4. Status codes {#status-codes}

**In short:** the three-digit status tells you what happened: 2xx success,
4xx the client's mistake, 5xx the server's failure.

| Code | Meaning | You'll see it when… |
|---|---|---|
| 200 OK | Success with a body | Reading a booking |
| 201 Created | Created | Creating something (and, on Restful Booker, deleting — a quirk) |
| 204 No Content | Success, no body | Many APIs' delete |
| 400 Bad Request | Invalid input | Missing or wrong fields |
| 401 Unauthorized | Not logged in | No or bad credentials |
| 403 Forbidden | Logged in but not allowed (or bad token) | Deleting without a valid token |
| 404 Not Found | No such resource | A booking id that doesn't exist |
| 405 Method Not Allowed | That method isn't supported there | — |
| 409 Conflict | Clashes with current state | Email already registered |
| 422 Unprocessable | Valid format, invalid meaning | Checkout before check-in |
| 429 Too Many Requests | Rate limit hit | Too many calls too fast |
| 500 Internal Server Error | The server crashed | **Always a bug** |

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://jsonplaceholder.typicode.com/posts/9999
# 404
```

**Try it:** get a 401 from `https://httpbin.org/bearer` (send no token) and a
429 from `https://httpbin.org/status/429`.

</div>

<div class="cheat-card">

#### 5. JSON {#json}

**In short:** most APIs send data as **JSON** — objects `{}` with named
fields, lists `[]`, and simple values.

```json
{
  "firstname": "Asha",
  "totalprice": 150,
  "depositpaid": true,
  "additionalneeds": null,
  "bookingdates": { "checkin": "2026-10-01", "checkout": "2026-10-05" },
  "tags": ["family", "late-arrival"]
}
```

| JSON type | Example | Common bug to test |
|---|---|---|
| string | `"Asha"` | Empty, very long, non-English letters |
| number | `150`, `29.99` | Sent as a string `"150"`; negative; decimals |
| boolean | `true` | Sent as `"yes"` or `1` |
| null | `null` | Required field set to null |
| object | `{ … }` | Missing nested fields |
| array | `[ … ]` | Empty list, one item, huge list |

**Try it:** pipe a response into `python3 -m json.tool` (or `jq .`) to pretty-print it.

</div>

<div class="cheat-card">

#### 6. curl {#curl}

**In short:** `curl` sends HTTP requests from the terminal — the fastest way
to explore an API and the clearest way to write reproduction steps in a bug report.

```bash
curl https://jsonplaceholder.typicode.com/posts/1
```

```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
}
```

| Flag | Does |
|---|---|
| `-X POST` | Set the method |
| `-H 'Name: value'` | Add a header |
| `-d '{"a":1}'` | Send a body |
| `-i` / `-I` | Show response headers / only headers |
| `-s` | Silent (no progress bar) |
| `-o /dev/null -w "%{http_code}\n"` | Print only the status code |
| `-u user:pass` | Basic auth |
| `-v` | Verbose: see exactly what was sent |

**Try it:** create a post (JSONPlaceholder fakes it — nothing is saved):

```bash
curl -s -X POST https://jsonplaceholder.typicode.com/posts \
  -H 'Content-Type: application/json' \
  -d '{"title":"hi","body":"first post","userId":1}' -w " [%{http_code}]\n"
# {"title": "hi", "body": "first post", "userId": 1, "id": 101} [201]   (printed over several lines)
```

</div>

<div class="cheat-card">

#### 7. Headers {#headers}

**In short:** headers carry information *about* the request or response —
format, auth, caching — separate from the body.

```bash
curl -s -i https://jsonplaceholder.typicode.com/posts/1 | grep -iE '^(HTTP|content-type|cache-control)'
# HTTP/2 200
# content-type: application/json; charset=utf-8
# cache-control: max-age=43200
```

| Header | Direction | Meaning |
|---|---|---|
| `Content-Type: application/json` | Request / response | "The body I'm sending is JSON" |
| `Accept: application/json` | Request | "Please answer in JSON" |
| `Authorization: Bearer <token>` | Request | Who you are |
| `Cookie: token=…` | Request | Session or token as a cookie |
| `Cache-Control` | Response | How long the answer may be cached |
| `Location` | Response | URL of a newly created resource |

The `Accept` header really changes the answer: Restful Booker replies in XML
to `-H 'Accept: application/xml'` and in JSON by default. Set `Accept` and
`Content-Type` explicitly in every test, so results never depend on a tool's
defaults — a classic "works in Postman, fails in my test" cause.

</div>

<div class="cheat-card">

#### 8. Path & query parameters {#parameters}

**In short:** **path** parameters pick *which* resource (`/booking/42`);
**query** parameters filter or shape the result (`?firstname=Jim`).

```bash
curl -s "https://jsonplaceholder.typicode.com/posts?userId=1&_limit=2"   # posts by user 1, only 2
# → a list of 2 posts, ids 1 and 2
```

| Part | Example | Test ideas |
|---|---|---|
| Path | `/booking/42` | Existing id, missing id (404), `0`, `-1`, `abc`, very large |
| Query | `?firstname=Jim` | No match (empty list, not an error), special characters, repeated parameter |

Encode special characters in URLs: a space is `%20`, `'` is `%27`, `=` is `%3D`.

**Try it:** list bookings for first name `Jim` on Restful Booker:
`curl -s "https://restful-booker.herokuapp.com/booking?firstname=Jim"`.

</div>

</div>

## Part 2 — Core {#part-2}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 9. Authentication {#auth}

**In short:** APIs check who you are with a password, a token, or a key —
test that every protected endpoint refuses requests without valid credentials.

| Kind | How it's sent | Example |
|---|---|---|
| **Basic auth** | `Authorization: Basic base64(user:pass)` | `curl -u user:pass …` |
| **Token in a cookie** | `Cookie: token=…` | Restful Booker |
| **Bearer token** (often a JWT) | `Authorization: Bearer <token>` | Most modern APIs |
| **API key** | Header like `x-api-key: …` | Partner APIs |
| **OAuth 2.0** | Get a token from an auth server first, then Bearer | Google, GitHub, Microsoft APIs |

```bash
# get a token (Restful Booker)
curl -s -X POST https://restful-booker.herokuapp.com/auth \
  -H 'Content-Type: application/json' -d '{"username":"admin","password":"password123"}'
# {"token":"33c5c29c057e171"}          ← a new random token each time

# basic auth (httpbin): right and wrong password
curl -s -u user:pass https://httpbin.org/basic-auth/user/pass
# { "authenticated": true, "user": "user" }
curl -s -o /dev/null -w "%{http_code}\n" -u user:nope https://httpbin.org/basic-auth/user/pass
# 401

echo -n 'admin:password123' | base64      # what -u puts in the header
# YWRtaW46cGFzc3dvcmQxMjM=
```

Base64 is **encoding, not encryption** — anyone can decode it. Basic auth is
only safe over HTTPS.

**Try it:** call `https://httpbin.org/bearer` with and without
`-H 'Authorization: Bearer abc123'`. Compare the status codes.

</div>

<div class="cheat-card">

#### 10. A CRUD test flow {#crud}

**In short:** test the whole life of a resource — **C**reate, **R**ead,
**U**pdate, **D**elete — and read it back after every change.

```bash
B=https://restful-booker.herokuapp.com

# CREATE
curl -s -X POST $B/booking -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -d '{"firstname":"Test","lastname":"User","totalprice":150,"depositpaid":true,
       "bookingdates":{"checkin":"2026-10-01","checkout":"2026-10-05"}}'
# {"bookingid":3240,"booking":{…}}       ← note the id

# UPDATE part of it (PATCH) — needs auth
curl -s -X PATCH $B/booking/3240 -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -H 'Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=' -d '{"firstname":"Asha"}'
# {"firstname":"Asha","lastname":"User","totalprice":150,…}   ← only firstname changed

# READ it back, then DELETE with a token
curl -s $B/booking/3240 -H 'Accept: application/json'
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE $B/booking/3240 -H 'Cookie: token=<token>'
# 201
```

The "read it back" step is what proves the change was **saved**, not just
echoed back in the response.

**Try it:** run the whole flow yourself with your own booking id and token.
After the delete, what does `GET` return?

</div>

<div class="cheat-card">

#### 11. What to check {#what-to-check}

**In short:** check the status, the body, the headers and the saved state —
not just "it didn't crash".

| Check | Example |
|---|---|
| Status code | 200 for read, 201 for create, 404 for missing |
| Body values | `totalprice` is what we sent |
| Body shape | Required fields present, right types ([schema](#schema)) |
| No leaks | No password hashes, internal ids, stack traces |
| Headers | `Content-Type: application/json` |
| Saved state | Read back after create/update/delete |
| Side effects | Email sent? Stock reduced? Audit log written? |
| Time | Response within the agreed limit |

</div>

<div class="cheat-card">

#### 12. Negative testing {#negative}

**In short:** send wrong, missing and unexpected input; a good API answers
with a clear 4xx — never a 500, and never silently accepts nonsense.

Real results on Restful Booker (these are its deliberate bugs):

```bash
# wrong password → 200 instead of 401
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://restful-booker.herokuapp.com/auth \
  -H 'Content-Type: application/json' -d '{"username":"admin","password":"wrong"}'
# 200          body: {"reason":"Bad credentials"}

# missing fields → the server crashes
curl -s -X POST https://restful-booker.herokuapp.com/booking \
  -H 'Content-Type: application/json' -H 'Accept: application/json' -d '{"firstname":"A"}' -w " [%{http_code}]\n"
# Internal Server Error [500]

# price "abc" and check-out before check-in → accepted anyway
curl -s -X POST https://restful-booker.herokuapp.com/booking \
  -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -d '{"firstname":"T","lastname":"U","totalprice":"abc","depositpaid":true,
       "bookingdates":{"checkin":"2026-10-05","checkout":"2026-10-01"}}' -w " [%{http_code}]\n"
# {"bookingid":3269,"booking":{…,"totalprice":null,…"checkin":"2026-10-05","checkout":"2026-10-01"}} [200]
```

Negative ideas for every field: missing, `null`, empty, wrong type, too long,
out of range, special characters, extra unknown fields.

**Try it:** send `"depositpaid": "yes"`. What does the API store? Is that a bug?

</div>

<div class="cheat-card">

#### 13. Schema validation {#schema}

**In short:** a **schema** describes the agreed shape of a response — fields,
types, required — and a validator checks every response against it in one line.

```json
{
  "type": "object",
  "required": ["firstname", "lastname", "totalprice", "depositpaid", "bookingdates"],
  "properties": {
    "firstname": { "type": "string" },
    "totalprice": { "type": "number" },
    "depositpaid": { "type": "boolean" }
  }
}
```

A `"totalprice": null` response fails this schema immediately — the bug from
section 12 caught automatically. Tools: **Ajv** (JavaScript), **jsonschema**
(Python), REST Assured's `matchesJsonSchemaInClasspath` (Java). The full
TypeScript test is in the framework guide.

</div>

<div class="cheat-card">

#### 14. Postman & Newman {#postman}

**In short:** **Postman** is an app for sending requests and saving them as
**collections** with tests; **Newman** runs those collections from the command line and in CI.

A test script on a request (the **Tests** / **Scripts → Post-response** tab):

```js
pm.test('status is 200', () => pm.response.to.have.status(200));
const body = pm.response.json();
pm.test('token returned', () => pm.expect(body.token).to.be.a('string').and.not.empty);
pm.collectionVariables.set('token', body.token);      // later requests use {{token}}
```

```bash
npm i -D newman
npx newman run postman/booker.postman_collection.json -e postman/local.postman_environment.json
```

Real result (4 requests: token, create, delete without token, delete with token):

```text
│              requests │                   4 │                   0 │
│              assertions │                   6 │                   0 │
```

The full collection is in [Milestone 4](/docs/learning-path/api-testing/milestones-and-mini-projects#milestone-4).
See also the [Postman guide](/docs/sdet-skills/postman/postman-guide).

**Try it:** in Postman, save the token request, add the test script above, and
send it. Then use `{{token}}` in a delete request.

</div>

<div class="cheat-card">

#### 15. Tests in code {#tests-in-code}

**In short:** put API tests in code (TypeScript, Python, Java) when they must
live in Git, run in CI and share helpers with other tests.

**Python** — `pytest` + `requests` + `jsonschema`:

```python title="tests/test_booking.py"
# tests/test_booking.py — run with: pytest tests -v
import uuid

import pytest
import requests
from jsonschema import validate

BASE_URL = "https://restful-booker.herokuapp.com"
HEADERS = {"Accept": "application/json"}

BOOKING_SCHEMA = {
    "type": "object",
    "required": ["firstname", "lastname", "totalprice", "depositpaid", "bookingdates"],
    "properties": {
        "firstname": {"type": "string"},
        "totalprice": {"type": "number"},
        "depositpaid": {"type": "boolean"},
    },
}


def a_booking(**overrides):
    """Valid booking data; override only what the test is about."""
    booking = {
        "firstname": f"Test-{uuid.uuid4().hex[:6]}",   # unique, so parallel runs don't clash
        "lastname": "Automation",
        "totalprice": 150,
        "depositpaid": True,
        "bookingdates": {"checkin": "2026-10-01", "checkout": "2026-10-05"},
    }
    return booking | overrides


@pytest.fixture
def token():
    res = requests.post(f"{BASE_URL}/auth", json={"username": "admin", "password": "password123"})
    return res.json()["token"]


def test_create_then_read():
    sent = a_booking(totalprice=220)
    created = requests.post(f"{BASE_URL}/booking", json=sent, headers=HEADERS)
    assert created.status_code == 200
    booking_id = created.json()["bookingid"]

    read = requests.get(f"{BASE_URL}/booking/{booking_id}", headers=HEADERS)
    assert read.status_code == 200
    assert read.json() == sent                          # stored exactly what we sent
    validate(read.json(), BOOKING_SCHEMA)               # and in the agreed shape


def test_delete_needs_a_valid_token(token):
    booking_id = requests.post(f"{BASE_URL}/booking", json=a_booking(), headers=HEADERS).json()["bookingid"]

    denied = requests.delete(f"{BASE_URL}/booking/{booking_id}", cookies={"token": "wrong"})
    assert denied.status_code == 403

    deleted = requests.delete(f"{BASE_URL}/booking/{booking_id}", cookies={"token": token})
    assert deleted.status_code == 201                   # this API uses 201 for a delete
    assert requests.get(f"{BASE_URL}/booking/{booking_id}").status_code == 404


@pytest.mark.parametrize("field, bad_value", [
    ("totalprice", "abc"),
    ("depositpaid", "yes"),
])
def test_wrong_types_are_rejected(field, bad_value):
    res = requests.post(f"{BASE_URL}/booking", json=a_booking(**{field: bad_value}), headers=HEADERS)
    assert res.status_code == 400, f"accepted {field}={bad_value!r}: {res.text}"
```

```text
$ pytest tests -q
E       AssertionError: accepted totalprice='abc': {"bookingid":708,"booking":{…"totalprice":null,…}}
E       AssertionError: accepted depositpaid='yes': {"bookingid":722,"booking":{…"depositpaid":true,…}}
FAILED tests/test_booking.py::test_wrong_types_are_rejected[totalprice-abc]
FAILED tests/test_booking.py::test_wrong_types_are_rejected[depositpaid-yes]
2 failed, 2 passed in 10.29s
```

The two failures are **real bugs** found by the tests — that's the job. In a
real project you'd report them, then mark the tests as known failures
(`@pytest.mark.xfail(reason="BUG-12")`) until they're fixed.

**TypeScript** with Playwright's `request`: see the
framework guide.
**Java** with REST Assured: see the [REST Assured guide](/docs/sdet-skills/rest-assured/rest-assured-guide).

</div>

<div class="cheat-card">

#### 16. Lists & filters {#lists}

**In short:** list endpoints need their own tests — empty results, filters,
paging and size limits.

| Test | Example | Expected |
|---|---|---|
| Filter matches | `?userId=1` | Only user 1's items |
| Filter matches nothing | `?userId=99999` | `[]` with 200 — not 404 or 500 |
| Page size | `?_limit=2` | Exactly 2 items |
| Page past the end | `?_page=999` | Empty list |
| No paging at all | `GET /booking` | Does it return *everything*? How big can that get? |
| Sort | `?_sort=title` | Correct order, stable for ties |

Restful Booker's `GET /booking` returns every booking in one response, with no
paging — fine for a demo, a performance and security risk in production.

</div>

<div class="cheat-card">

#### 17. Idempotency {#idempotency}

**In short:** an **idempotent** request has the same effect however many times
it's sent — important because networks retry.

| Test | Expected |
|---|---|
| `PUT` the same body twice | Same result both times |
| `DELETE` twice | First deletes; second is 404 (or 204). Restful Booker answers **405** — a bug worth reporting |
| `POST` twice (double-click, retry after timeout) | Ideally one order — often needs an **idempotency key** header |

Payment APIs (for example Stripe) accept an `Idempotency-Key` header so a
retried payment isn't charged twice. Test that retries with the same key don't
create duplicates.

</div>

<div class="cheat-card">

#### 18. Common mistakes {#gotchas}

**In short:** the usual ways API tests give false confidence.

| Mistake | Fix |
|---|---|
| Checking only the status code | Check body, schema and saved state too |
| Not reading back after a write | `GET` after `POST`/`PUT`/`DELETE` |
| Only happy paths | Negative and auth tests for every endpoint |
| Tests depend on existing data (booking 1) | Create your own data in the test |
| Forgetting `Accept` / `Content-Type` | Set them in one helper for every request |
| Hard-coded tokens | Fetch a fresh token in a fixture |
| Asserting what the API does, not what it should do | Tests encode the requirement; failures become bug reports |

</div>

</div>

## Part 3 — Advanced {#part-3}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 19. Contract testing {#contracts}

**In short:** a **contract** is the agreed request and response shape between
a **consumer** (who calls the API) and a **provider** (who serves it);
contract tests catch breaking changes before release.

```text
 Consumer team (mobile app)            Provider team (booking API)
 ──────────────────────────            ───────────────────────────
 writes a test: "I call GET /booking/1  ──contract file──▶  provider CI replays it
 and need firstname (string),                               against the real API:
 totalprice (number)"                                        pass → safe to deploy
```

| Approach | Tool | Use when |
|---|---|---|
| Schema / OpenAPI validation | Ajv, jsonschema, Schemathesis | One public API with a spec |
| Consumer-driven contracts | **Pact** (+ Pact Broker) | Many internal services owned by different teams |

</div>

<div class="cheat-card">

#### 20. Mocking {#mocking}

**In short:** a **mock** (or **service virtualization**) is a fake API that
returns planned responses, so you can test when the real one is missing, slow,
costly or hard to put into an error state.

| Tool | Type |
|---|---|
| **WireMock** | Stand-alone mock server (Java, Docker) |
| **Prism** | Mock server generated from an OpenAPI file |
| **MSW** (Mock Service Worker) | Mocks inside JavaScript apps and tests |
| **Playwright `page.route`** | Mocks the API calls a web page makes — see the [automation cheat sheet](/cheatsheets/test-automation#mocking) |

Use mocks to test *your* side (how the app handles a 500, a timeout, an empty
list). Keep a few tests against the real API — mocks can't catch real integration changes.

</div>

<div class="cheat-card">

#### 21. GraphQL {#graphql}

**In short:** a **GraphQL** API has one URL; the client sends a query naming
exactly the fields it wants — and errors often come back with status **200**.

```bash
curl -s -X POST https://countries.trevorblades.com/ -H 'Content-Type: application/json' \
  -d '{"query":"{ country(code: \"IN\") { name capital currency } }"}'
# {"data":{"country":{"capital":"New Delhi","currency":"INR","name":"India"}}}

# a field that doesn't exist → an error in the body, but HTTP 200
curl -s -X POST https://countries.trevorblades.com/ -H 'Content-Type: application/json' \
  -d '{"query":"{ country(code: \"IN\") { nam } }"}' -w " [%{http_code}]\n"
# {"errors":[{"message":"Cannot query field \"nam\" on type \"Country\". Did you mean \"name\"?",…}]} [200]

# unknown code → null data, no error
# {"data":{"country":null}}
```

So in GraphQL tests, **always check the `errors` field**, not just the status.
Also test: deeply nested queries (can one query overload the server?), fields a
user shouldn't see, and mutations (writes) with bad input.

</div>

<div class="cheat-card">

#### 22. API security {#security}

**In short:** the most common API breach is **broken authorization** — one
user reaching another's data — so test every endpoint as the wrong user and as nobody.

| Test | How |
|---|---|
| No auth | Remove the token — every protected endpoint must refuse |
| Wrong user (BOLA) | User A requests user B's object by id |
| Wrong role | Normal user calls admin endpoints |
| Extra fields | Send `"role":"admin"` or `"price":0` — are they ignored? |
| Data exposure | Responses contain only what the caller should see |
| Rate limits | Many logins quickly → 429 or lockout |
| Token expiry | Old tokens stop working |

On Restful Booker: anyone can `GET /booking/{id}` **without logging in** and
read a guest's name and dates — for real personal data that would be a
serious finding. The full list is the
OWASP API Security Top 10.

</div>

<div class="cheat-card">

#### 23. API performance {#performance}

**In short:** a small, scripted load on an API shows how fast it answers and
whether errors appear under load — k6 thresholds turn that into pass/fail.

```js title="perf/api-smoke.js"
// perf/api-smoke.js — a tiny API performance check: 2 users for 10 seconds
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 2,
  duration: '10s',
  thresholds: {
    http_req_failed: ['rate<0.01'],          // under 1% errors
    http_req_duration: ['p(95)<2000'],       // 95% of requests under 2 s (a shared free demo is slow)
  },
};

const BASE_URL = 'https://restful-booker.herokuapp.com';

export default function () {
  const list = http.get(`${BASE_URL}/booking`);
  check(list, { 'list is 200': (r) => r.status === 200 });

  const one = http.get(`${BASE_URL}/booking/${list.json()[0].bookingid}`, {
    headers: { Accept: 'application/json' },
  });
  check(one, { 'booking is 200': (r) => r.status === 200 });

  sleep(1);
}
```

```text
✓ 'p(95)<2000' p(95)=533.88ms
✓ 'rate<0.01' rate=0.00%
```

Keep load tiny on shared demo APIs. For real load tests, see the
performance testing guide.

</div>

<div class="cheat-card">

#### 24. Words you'll meet {#glossary}

**In short:** the jargon, in one line each.

| Word | Meaning |
|---|---|
| **Endpoint** | One method + path, e.g. `GET /booking/{id}` |
| **Resource** | The thing an endpoint is about (a booking, a user) |
| **REST** | A style of HTTP API built around resources and methods |
| **Payload** | The body of a request or response |
| **JWT** | JSON Web Token — a signed token that carries user info |
| **OAuth 2.0** | A standard way to get tokens from an authorization server |
| **Idempotent** | Repeating it has the same effect as doing it once |
| **Schema** | A description of the shape of JSON data |
| **OpenAPI / Swagger** | A standard file describing every endpoint of an API |
| **Contract test** | A test that the agreed request/response shape still holds |
| **Mock** | A fake API that returns planned responses |
| **BOLA** | Broken Object Level Authorization — reaching another user's object by id |
| **Rate limit** | A cap on how many requests a client may send per time period |
| **Newman** | The command-line runner for Postman collections |

For the service end to end, see the
API testing guide.

</div>

</div>
