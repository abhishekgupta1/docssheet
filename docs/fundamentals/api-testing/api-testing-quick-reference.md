---
title: "API Testing Quick Reference"
description: "Copy-paste API testing reference — HTTP methods and status codes, curl flags, auth headers, the per-endpoint checklist, negative test ideas, Postman scripts, Newman, pytest/requests, Playwright request and REST Assured equivalents, GraphQL and handy one-liners."
sidebar_position: 1
level: beginner
tags: [api-testing, rest, http, fundamentals, cheat-sheet]
---

# API Testing Quick Reference

A lookup page for exploring and testing HTTP APIs: status codes, `curl`
flags, auth headers, checklists, and the same request in several tools.

:::tip How to use this page

This page is for **looking things up**, not for learning from scratch. New to
APIs? Start with the [API testing cheat sheet](/cheatsheets/api-testing), which
explains each idea with an exercise. For the ordered plan with projects, see
the [API testing learning path](/docs/learning-path/api-testing/implementation-roadmap).

:::

## Quick Navigation

**HTTP:** [Methods](#methods) · [Status codes](#status-codes) · [Headers](#headers) · [Auth](#auth)

**Tools:** [curl](#curl) · [Postman scripts](#postman-scripts) · [Newman](#newman) · [Same request, five tools](#five-tools) · [GraphQL](#graphql)

**Testing:** [Endpoint checklist](#endpoint-checklist) · [Negative test ideas](#negative-ideas) · [Security checks](#security-checks) · [Bug report for an API](#api-bug-report)

**Recipes:** [One-liners](#one-liners)

---

## Methods {#methods}

| Method | Purpose | Body? | Idempotent? | Typical success |
|---|---|---|---|---|
| `GET` | Read | No | Yes | 200 |
| `HEAD` | Headers only | No | Yes | 200 |
| `POST` | Create / action | Yes | No | 201 (or 200) |
| `PUT` | Replace | Yes | Yes | 200 / 204 |
| `PATCH` | Partial update | Yes | Not guaranteed | 200 / 204 |
| `DELETE` | Remove | Usually no | Yes | 204 / 200 |
| `OPTIONS` | Which methods are allowed (CORS preflight) | No | Yes | 204 / 200 |

## Status codes {#status-codes}

| Code | Name | Test that you get it when… |
|---|---|---|
| 200 | OK | A read or update succeeds |
| 201 | Created | A create succeeds (check `Location` header) |
| 204 | No Content | Success with no body |
| 301 / 302 / 307 / 308 | Redirects | Old URLs move; method kept on 307/308 |
| 304 | Not Modified | Caching with `If-None-Match` / `ETag` |
| 400 | Bad Request | Malformed or invalid input |
| 401 | Unauthorized | No / invalid credentials |
| 403 | Forbidden | Valid user, not allowed |
| 404 | Not Found | Unknown id or path |
| 405 | Method Not Allowed | Wrong method on a path |
| 409 | Conflict | Duplicate or state clash |
| 413 | Payload Too Large | Upload over the limit |
| 415 | Unsupported Media Type | Wrong `Content-Type` |
| 422 | Unprocessable Content | Valid JSON, invalid meaning |
| 429 | Too Many Requests | Rate limit (check `Retry-After`) |
| 500 | Internal Server Error | Never on purpose — always a bug |
| 502 / 503 / 504 | Gateway / unavailable / timeout | Dependency or infrastructure trouble |

## Headers {#headers}

| Header | Example |
|---|---|
| `Content-Type` | `application/json`, `multipart/form-data`, `application/x-www-form-urlencoded` |
| `Accept` | `application/json` |
| `Authorization` | `Basic dXNlcjpwYXNz`, `Bearer eyJhbGciOi…` |
| `Cookie` | `token=abc123` |
| `x-api-key` | `<YOUR_KEY>` |
| `Idempotency-Key` | `8e3f…` (unique per logical operation) |
| `If-None-Match` / `ETag` | Conditional requests, caching |
| `Retry-After` | Seconds to wait after 429/503 |
| Security (responses) | `Strict-Transport-Security`, `X-Content-Type-Options: nosniff` |

## Auth {#auth}

| Scheme | curl |
|---|---|
| Basic | `curl -u user:pass URL` |
| Bearer | `curl -H 'Authorization: Bearer <TOKEN>' URL` |
| API key header | `curl -H 'x-api-key: <KEY>' URL` |
| Cookie token | `curl -H 'Cookie: token=<TOKEN>' URL` |
| OAuth 2.0 client credentials | `curl -u <client_id>:<client_secret> -d 'grant_type=client_credentials' <TOKEN_URL>` → use the `access_token` as Bearer |

Decode a JWT's payload to check claims (expiry `exp`, roles) — for test
tokens only, never paste production tokens into websites:

```bash
echo '<JWT>' | cut -d. -f2 | base64 -d 2>/dev/null; echo
```

---

## curl {#curl}

| Flag | Does |
|---|---|
| `-X METHOD` | Method |
| `-H 'K: V'` | Header (repeatable) |
| `-d '…'` / `-d @body.json` | Body inline / from a file |
| `--json '…'` | Body + JSON headers in one (curl 7.82+) |
| `-F 'file=@photo.jpg'` | Multipart upload |
| `-G --data-urlencode 'q=a b'` | Encoded query parameter |
| `-i` / `-I` / `-v` | Headers + body / headers only / everything |
| `-s` / `-S` | Silent / but show errors |
| `-o file` / `-o /dev/null` | Save / discard body |
| `-w '%{http_code}\n'` | Print the status |
| `-w '%{time_total}\n'` | Print total time |
| `-L` | Follow redirects |
| `--max-time 10` | Give up after 10 s |
| `-k` | Ignore TLS errors (test environments only) |

## Postman scripts {#postman-scripts}

```js
pm.test('status is 200', () => pm.response.to.have.status(200));
pm.test('fast enough', () => pm.expect(pm.response.responseTime).to.be.below(1000));
pm.test('JSON body', () => pm.response.to.be.json);
const body = pm.response.json();
pm.test('has id', () => pm.expect(body).to.have.property('bookingid'));
pm.test('price is a number', () => pm.expect(body.booking.totalprice).to.be.a('number'));
pm.collectionVariables.set('bookingId', body.bookingid);   // use as {{bookingId}}
pm.environment.get('baseUrl');                               // read an environment variable
```

Variable scopes, narrowest wins: local → data → environment → collection → global.

## Newman {#newman}

```bash
npx newman run collection.json -e env.json                    # run
npx newman run collection.json -e env.json -n 3               # 3 iterations
npx newman run collection.json -d data.csv                    # data-driven: one iteration per row
npx newman run collection.json -r cli,junit --reporter-junit-export results/newman.xml   # JUnit for CI
npx newman run collection.json --folder "Smoke"              # one folder only
```

Newman exits with a non-zero code when any assertion fails, so CI fails too.

## Same request, five tools {#five-tools}

Create a booking and check the status:

```bash
# curl
curl -s -X POST https://restful-booker.herokuapp.com/booking \
  -H 'Content-Type: application/json' -H 'Accept: application/json' -d @booking.json
```

```python
# Python — requests + pytest
res = requests.post(f"{BASE_URL}/booking", json=booking, headers={"Accept": "application/json"})
assert res.status_code == 200
```

```ts
// TypeScript — Playwright request fixture
const res = await request.post('/booking', { data: booking, headers: { Accept: 'application/json' } });
expect(res.status()).toBe(200);
```

```java
// Java — REST Assured
given().contentType(ContentType.JSON).accept(ContentType.JSON).body(booking)
  .when().post("/booking")
  .then().statusCode(200).body("booking.firstname", equalTo("Asha"));
```

```js
// Postman — Tests tab
pm.test('created', () => pm.response.to.have.status(200));
```

## GraphQL {#graphql}

```bash
curl -s -X POST <URL> -H 'Content-Type: application/json' \
  -d '{"query":"query($c: ID!){ country(code: $c){ name } }","variables":{"c":"IN"}}'
```

| Check | Why |
|---|---|
| `errors` array is absent | Errors often come with HTTP 200 |
| `data` has exactly the requested fields | Over-fetching and leaks |
| Deep / repeated nesting is limited | One query can overload the server |
| Introspection off in production (if policy says so) | Hides the schema from attackers |
| Mutations validate input and permissions | Same as REST writes |

---

## Endpoint checklist {#endpoint-checklist}

```text
[ ] Happy path: right status, body values, types (schema), headers
[ ] Saved: read back after create / update / delete
[ ] Required fields: each one missing → 400/422 with a clear message
[ ] Types: string for number, number for string, null, array for object
[ ] Limits: empty, max length, max+1, negative, zero, huge numbers
[ ] Business rules: dates in order, totals match, states allowed
[ ] Auth: no token → 401; bad/expired token → 401; other user → 403/404; wrong role → 403
[ ] Not found: unknown id → 404; DELETE twice → 404/204, not 405/500
[ ] Idempotency: PUT/DELETE repeated; POST retried with the same idempotency key
[ ] Lists: empty result, paging, filters, sorting, maximum page size
[ ] Errors never show stack traces or internal details
[ ] Response time within the agreed limit
```

## Negative test ideas {#negative-ideas}

| Area | Try |
|---|---|
| Body | Empty body, invalid JSON (`{"a":`), JSON array instead of object, extra unknown fields |
| Strings | `""`, `" "`, 10,000 chars, emoji, `<script>`, `' OR 1=1 --`, `../../etc/passwd` |
| Numbers | `-1`, `0`, `0.001`, `1e309`, `"12"` (string), `NaN` |
| Booleans | `"true"` (string), `1`, `"yes"` |
| Dates | Wrong format, 31 April, end before start, far past/future, time zones |
| IDs | `0`, `-1`, `abc`, `999999999`, another user's id |
| Headers | Missing `Content-Type`, wrong `Content-Type`, huge headers |
| Methods | `PATCH` where only `PUT` exists, `DELETE` on a collection |

## Security checks {#security-checks}

```text
[ ] Every protected endpoint refuses no-token and bad-token requests
[ ] User A can't read/update/delete user B's objects (BOLA)
[ ] Normal users can't call admin functions
[ ] Sending "role", "isAdmin", "price" in a body doesn't change them
[ ] Responses don't leak other users' data, secrets, or internal fields
[ ] Rate limiting on login, sign-up, password reset
[ ] Tokens expire; logout invalidates them
[ ] HTTPS only; HTTP redirects or is refused
[ ] Old API versions (/v1) are removed or equally protected
```

## Bug report for an API {#api-bug-report}

```text
Title:     [POST /booking] Missing required fields return 500 instead of 400
Env:       https://restful-booker.herokuapp.com, <date/time UTC>
Request:   curl -s -X POST https://restful-booker.herokuapp.com/booking \
             -H 'Content-Type: application/json' -H 'Accept: application/json' -d '{"firstname":"A"}'
Expected:  400 with a list of missing fields
Actual:    500 "Internal Server Error"
Impact:    Clients can't tell users what's wrong; server errors trigger alerts
```

---

## One-liners {#one-liners}

```bash
curl -s URL | python3 -m json.tool                     # pretty-print JSON
curl -s URL | jq '.[0].bookingid'                      # pick a field (jq)
curl -s URL | jq 'length'                              # count items in a list
curl -s -o /dev/null -w '%{http_code} %{time_total}s\n' URL   # status + time
for i in $(seq 1 10); do curl -s -o /dev/null -w '%{http_code}\n' URL; done | sort | uniq -c   # quick repeat
curl -s -I -X OPTIONS URL | grep -i access-control      # CORS rules
```

**Need more detail?** [Cheat sheet](/cheatsheets/api-testing) ·
[Best practices](/docs/fundamentals/api-testing/best-practices) ·
[Learning path](/docs/learning-path/api-testing/implementation-roadmap) ·
Full guide
