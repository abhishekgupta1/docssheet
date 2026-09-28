---
title: "API Testing Milestones & Mini-Projects"
description: "Tasks with expected results for each of the six API testing milestones — exploring with curl, a booking's CRUD life cycle, a Restful Booker bug hunt with a 9-bug answer key, a Postman collection run by Newman, an automated suite, and GraphQL, security and performance investigations."
sidebar_position: 2
level: beginner
tags: [api-testing, learning-path, projects]
---

# API Testing Milestones & Mini-Projects

**In short:** one small project per milestone on the
[practice APIs](/cheatsheets/api-testing#practice-apis). Every task shows the
**expected result**; answer keys and solutions are folded away. All results
below were captured from the real APIs while writing this page.

:::tip How to use this page

First read the milestone in the [Roadmap](/docs/learning-path/api-testing/implementation-roadmap)
and the cheat-sheet sections it links to. Then run each task yourself and
compare with the expected result. Open the answer key only after you have your
own answer. These are shared public demos: ids and tokens will differ, data is
reset from time to time, and behaviour may change — if it does, note it as a finding.

:::

## Contents

- [Milestone 1: Exploring two APIs](#milestone-1)
- [Milestone 2: A booking's life cycle](#milestone-2)
- [Milestone 3: Bug hunt — Restful Booker](#milestone-3)
- [Milestone 4: Postman & Newman](#milestone-4)
- [Milestone 5: An automated suite](#milestone-5)
- [Milestone 6: GraphQL, security & performance](#milestone-6)
- [Final project](#final-project)

---

## Milestone 1: Exploring two APIs {#milestone-1}

**Practises:** methods, status codes, JSON, headers, path and query parameters.

```bash
J=https://jsonplaceholder.typicode.com
B=https://restful-booker.herokuapp.com
```

| # | Task | Expected result |
|---|---|---|
| 1 | `GET $J/posts/1` | 200; fields `userId`, `id`, `title`, `body` |
| 2 | Show only the headers of task 1 | `content-type: application/json; charset=utf-8` |
| 3 | Posts by user 1, only 2 of them | 2 posts, ids 1 and 2 |
| 4 | A post that doesn't exist | 404 |
| 5 | Create a post (JSONPlaceholder fakes it) | 201 and `"id": 101` |
| 6 | Posts by a user that doesn't exist | `[]` with 200 |
| 7 | Which methods does `$J/posts` allow? (`OPTIONS`) | `GET,HEAD,PUT,PATCH,POST,DELETE` |
| 8 | Ping Restful Booker: `GET $B/ping` | 201 (an unusual choice for a health check — note it) |

<details>
<summary>Solutions</summary>

```bash
curl -s $J/posts/1                                                        # 1
curl -s -I $J/posts/1 | grep -i content-type                             # 2
curl -s "$J/posts?userId=1&_limit=2"                                      # 3
curl -s -o /dev/null -w "%{http_code}\n" $J/posts/9999                    # 4
curl -s -X POST $J/posts -H 'Content-Type: application/json' \
  -d '{"title":"hi","body":"first post","userId":1}' -w " [%{http_code}]\n"   # 5
curl -s "$J/posts?userId=99999" -w " [%{http_code}]\n"                    # 6
curl -s -I -X OPTIONS $J/posts | grep -i access-control-allow-methods     # 7
curl -s -o /dev/null -w "%{http_code}\n" $B/ping                          # 8
```

</details>

**Watch out for:** task 6 — an empty list with 200 is the *right* answer for
"no matches". A 404 there would be a design bug; a 500 a real bug.

**Try it:** request `$J/posts/1` with `-H 'Accept: application/xml'`. Does
JSONPlaceholder change format like Restful Booker does?

---

## Milestone 2: A booking's life cycle {#milestone-2}

**Practises:** token and Basic auth, create, read, update (`PUT` and `PATCH`),
delete, reading back.

| # | Task | Expected result |
|---|---|---|
| 1 | Get a token with `admin` / `password123` | `{"token":"…"}` |
| 2 | Create a booking; note the id | 200, `{"bookingid": <id>, "booking": {…}}` |
| 3 | Read it back | 200, same data you sent |
| 4 | `PATCH` only the first name, using **Basic** auth | 200; only `firstname` changed |
| 5 | `PUT` the full booking with a new price, using the **token** cookie | 200; new price |
| 6 | `PUT` with only a first name (not a full body) | 400 |
| 7 | Delete it with the token | 201 |
| 8 | Read it again | 404 |

<details>
<summary>Solutions</summary>

```bash
B=https://restful-booker.herokuapp.com
TOKEN=$(curl -s -X POST $B/auth -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"password123"}' | python3 -c "import json,sys; print(json.load(sys.stdin)['token'])")   # 1

BODY='{"firstname":"Test","lastname":"User","totalprice":150,"depositpaid":true,"bookingdates":{"checkin":"2026-10-01","checkout":"2026-10-05"}}'
ID=$(curl -s -X POST $B/booking -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -d "$BODY" | python3 -c "import json,sys; print(json.load(sys.stdin)['bookingid'])")                                   # 2

curl -s $B/booking/$ID -H 'Accept: application/json'                                                                     # 3
curl -s -X PATCH $B/booking/$ID -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -H 'Authorization: Basic YWRtaW46cGFzc3dvcmQxMjM=' -d '{"firstname":"Asha"}'                                            # 4
curl -s -X PUT $B/booking/$ID -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -H "Cookie: token=$TOKEN" -d "${BODY/150/999}"                                                                          # 5
curl -s -X PUT $B/booking/$ID -H 'Content-Type: application/json' -H 'Accept: application/json' \
  -H "Cookie: token=$TOKEN" -d '{"firstname":"OnlyName"}' -w " [%{http_code}]\n"                                         # 6
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE $B/booking/$ID -H "Cookie: token=$TOKEN"                              # 7
curl -s -o /dev/null -w "%{http_code}\n" $B/booking/$ID                                                                  # 8
```

`${BODY/150/999}` is a Bash substitution: the same body with 150 replaced by 999.

</details>

**Watch out for:** task 6 is a *good* result — `PUT` means "replace the whole
thing", so a partial body should be refused. Compare with `PATCH` in task 4.

**Try it:** script tasks 1–8 in one `crud.sh` file that prints `PASS` or
`FAIL` for each status code.

---

## Milestone 3: Bug hunt — Restful Booker {#milestone-3}

**Practises:** negative testing, idempotency, API bug reports.

Restful Booker has **deliberate bugs**. Use the
[negative test ideas](/docs/fundamentals/api-testing/api-testing-quick-reference#negative-ideas)
and the [endpoint checklist](/docs/fundamentals/api-testing/api-testing-quick-reference#endpoint-checklist)
on `POST /auth`, `POST /booking`, `GET /booking`, `GET /booking/{id}`,
`PATCH`/`PUT`/`DELETE /booking/{id}`.

| # | Task | Expected result |
|---|---|---|
| 1 | Wrong password on `/auth` | Find what's wrong with the status |
| 2 | Create with only a first name | Find what's wrong |
| 3 | Create with wrong types (string price, string boolean) | Find 2 problems |
| 4 | Create with check-out before check-in | Find what's wrong |
| 5 | `PATCH` and `DELETE` a booking id that doesn't exist; `DELETE` twice | Find what's wrong with the status |
| 6 | Read bookings **without** any token | Think about privacy |
| 7 | List all bookings | Think about size |
| 8 | Write a report for each bug in the [API bug format](/docs/fundamentals/api-testing/api-testing-quick-reference#api-bug-report) | 7+ reports |

<details>
<summary>Answer key — 9 findings</summary>

| # | Finding | Actual | Should be | Severity (suggested) |
|---|---|---|---|---|
| 1 | Wrong password returns **200** with `{"reason":"Bad credentials"}` | 200 | 401 | Major — clients checking only the status think login worked |
| 2 | Missing required fields **crash the server** | 500 | 400 + list of missing fields | Major |
| 3 | `"totalprice": "abc"` is **accepted and stored as `null`** | 200 | 400 | Critical — silent data corruption |
| 4 | `"depositpaid": "yes"` is **accepted and stored as `true`** | 200 | 400 | Major |
| 5 | **Check-out before check-in** is accepted | 200 | 400/422 | Major — impossible booking |
| 6 | `PATCH` on an id that doesn't exist, and `DELETE` a second time | 405 | 404 | Minor |
| 7 | Successful `DELETE` returns **201 Created** | 201 | 200 or 204 | Minor (misleading) |
| 8 | Anyone can **read any booking's name and dates without auth** | 200 | 401/403, or ownership checks | Critical for real personal data |
| 9 | `GET /booking` returns **every booking** in one response, no paging | ~12 KB and growing | Paged results with a maximum page size | Major at scale (performance and scraping risk) |

Also worth noting (not bugs): tokens do expire — a token from an hour earlier
got 403; and `PUT` with a partial body is correctly refused.

</details>

**Watch out for:** stopping at the status code. Findings 3 and 4 return a
"successful" 200 — you only find them by **reading the saved data**.

**Try it:** does `GET /booking?firstname=...` handle `' OR 1=1 --`? What
would a vulnerable API return, and what does this one return?

---

## Milestone 4: Postman & Newman {#milestone-4}

**Practises:** collections, variables passed between requests, test scripts,
environments, running from the command line.

| # | Task | Expected result |
|---|---|---|
| 1 | In Postman, make a collection with a `baseUrl` variable | Requests use `{{baseUrl}}` |
| 2 | "Get token" request saves `token` with a test script | Next requests use `{{token}}` |
| 3 | "Create booking" saves `bookingId` and checks the price | 2 assertions pass |
| 4 | "Delete without token" expects 403; "Delete with token" expects 201 | Both pass |
| 5 | Credentials in an **environment**, not the collection | Exported collection has no password |
| 6 | Export both and run with Newman | 4 requests, 6 assertions, 0 failed |

<details>
<summary>Solution</summary>

```json title="postman/booker.postman_collection.json"
{
  "info": {
    "name": "Restful Booker — smoke",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    { "key": "baseUrl", "value": "https://restful-booker.herokuapp.com" }
  ],
  "item": [
    {
      "name": "Get token",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "url": "{{baseUrl}}/auth",
        "body": { "mode": "raw", "raw": "{\"username\": \"{{username}}\", \"password\": \"{{password}}\"}" }
      },
      "event": [{
        "listen": "test",
        "script": { "exec": [
          "pm.test('status is 200', () => pm.response.to.have.status(200));",
          "const body = pm.response.json();",
          "pm.test('token returned', () => pm.expect(body.token).to.be.a('string').and.not.empty);",
          "pm.collectionVariables.set('token', body.token);"
        ] }
      }]
    },
    {
      "name": "Create booking",
      "request": {
        "method": "POST",
        "header": [
          { "key": "Content-Type", "value": "application/json" },
          { "key": "Accept", "value": "application/json" }
        ],
        "url": "{{baseUrl}}/booking",
        "body": { "mode": "raw", "raw": "{\"firstname\": \"Asha\", \"lastname\": \"Rao\", \"totalprice\": 150, \"depositpaid\": true, \"bookingdates\": {\"checkin\": \"2026-10-01\", \"checkout\": \"2026-10-05\"}}" }
      },
      "event": [{
        "listen": "test",
        "script": { "exec": [
          "pm.test('status is 200', () => pm.response.to.have.status(200));",
          "const body = pm.response.json();",
          "pm.test('stored the price we sent', () => pm.expect(body.booking.totalprice).to.eql(150));",
          "pm.collectionVariables.set('bookingId', body.bookingid);"
        ] }
      }]
    },
    {
      "name": "Delete booking without token is refused",
      "request": { "method": "DELETE", "url": "{{baseUrl}}/booking/{{bookingId}}" },
      "event": [{
        "listen": "test",
        "script": { "exec": ["pm.test('status is 403', () => pm.response.to.have.status(403));"] }
      }]
    },
    {
      "name": "Delete booking with token",
      "request": {
        "method": "DELETE",
        "header": [{ "key": "Cookie", "value": "token={{token}}" }],
        "url": "{{baseUrl}}/booking/{{bookingId}}"
      },
      "event": [{
        "listen": "test",
        "script": { "exec": ["pm.test('status is 201', () => pm.response.to.have.status(201));"] }
      }]
    }
  ]
}
```

```json title="postman/local.postman_environment.json"
{
  "name": "local",
  "values": [
    { "key": "username", "value": "admin", "enabled": true },
    { "key": "password", "value": "password123", "enabled": true }
  ]
}
```

```bash
npm i -D newman
npx newman run postman/booker.postman_collection.json -e postman/local.postman_environment.json
```

```text
→ Delete booking with token
  DELETE https://restful-booker.herokuapp.com/booking/2928 [201 Created, 755B, 259ms]
  ✓  status is 201

│              requests │                   4 │                   0 │
│              assertions │                   6 │                   0 │
```

</details>

**Watch out for:** request order matters in a collection — "Create booking"
must run before the deletes that use `{{bookingId}}`. That's fine for a
collection flow, but keep independent tests independent in code (Milestone 5).

**Try it:** add `-r cli,junit --reporter-junit-export results/newman.xml` and
open the XML — that's what a CI server reads.

---

## Milestone 5: An automated suite {#milestone-5}

**Practises:** fixtures, data builders, value + schema checks, negative tests,
marking known bugs. Pick **Python** (below) or **TypeScript** (the
[test automation path, Milestone 4](/docs/learning-path/test-automation/milestones-and-mini-projects#milestone-4)).

| # | Task | Expected result |
|---|---|---|
| 1 | Project with `pytest`, `requests`, `jsonschema` | `pytest --version` works |
| 2 | `a_booking(**overrides)` builder with a unique first name | Two calls give different names |
| 3 | `token` fixture | Tests receive a fresh token |
| 4 | Test: create, read back, equal to what was sent, matches the schema | Passes |
| 5 | Test: delete refused with a wrong token (403), works with a real one (201), then 404 | Passes |
| 6 | Parametrized test: wrong types are rejected with 400 | **Fails twice** — the bugs from Milestone 3 |
| 7 | Mark task 6 as known bugs so the suite is green but honest | `2 xfailed` |

<details>
<summary>Solution</summary>

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
$ pytest tests/test_booking.py -q
FAILED tests/test_booking.py::test_wrong_types_are_rejected[totalprice-abc]
FAILED tests/test_booking.py::test_wrong_types_are_rejected[depositpaid-yes]
2 failed, 2 passed in 10.29s
```

Task 7 — the same test, marked as known bugs:

```python title="tests/test_booking_known_bugs.py"
# tests/test_booking_known_bugs.py — Milestone 5: the same checks, marked as known bugs
import pytest
import requests

from test_booking import BASE_URL, HEADERS, a_booking


@pytest.mark.xfail(reason="BUG-API-03/04: wrong types are accepted", strict=True)
@pytest.mark.parametrize("field, bad_value", [
    ("totalprice", "abc"),
    ("depositpaid", "yes"),
])
def test_wrong_types_are_rejected(field, bad_value):
    res = requests.post(f"{BASE_URL}/booking", json=a_booking(**{field: bad_value}), headers=HEADERS)
    assert res.status_code == 400, f"accepted {field}={bad_value!r}: {res.text}"
```

```text
$ pytest tests/test_booking_known_bugs.py -q
2 xfailed in 2.44s
```

`strict=True` means: if the bug is fixed and the test starts passing, pytest
reports a failure — so you remember to remove the marker.

</details>

**Watch out for:** writing the test to expect **200** "because that's what the
API does". Then the test passes forever and the bug is never reported. Tests
assert what the API **should** do.

**Try it:** add a test for finding 5 (check-out before check-in) and mark it as a known bug too.

---

## Milestone 6: GraphQL, security & performance {#milestone-6}

**Practises:** GraphQL error handling, authorization testing, a small load check.

### A. GraphQL — `https://countries.trevorblades.com`

| # | Task | Expected result |
|---|---|---|
| 1 | Query India's name, capital and currency | `India`, `New Delhi`, `INR` |
| 2 | Query a country code that doesn't exist (`XX`) | `{"data":{"country":null}}` — no error |
| 3 | Query a field that doesn't exist (`nam`) | `errors` array with a "Did you mean name?" message, **HTTP 200** |

### B. Security — Restful Booker

| # | Task | Expected result |
|---|---|---|
| 4 | Read a booking with no token | Allowed — note as a privacy finding |
| 5 | Update a booking created by someone else, with your own admin token | Allowed — there is no ownership concept |
| 6 | Use a token that's more than an hour old | 403 — tokens expire (good) |
| 7 | Write a short security note: findings, risk, recommendation | 1 page |

### C. Performance

| # | Task | Expected result |
|---|---|---|
| 8 | Run a k6 check: 2 virtual users, 10 s, list + read a booking | Both thresholds pass |
| 9 | Change the p95 threshold to 200 ms and run again | The threshold fails and k6 exits non-zero |

<details>
<summary>Solutions</summary>

```bash
G=https://countries.trevorblades.com/
curl -s -X POST $G -H 'Content-Type: application/json' -d '{"query":"{ country(code: \"IN\") { name capital currency } }"}'   # 1
curl -s -X POST $G -H 'Content-Type: application/json' -d '{"query":"{ country(code: \"XX\") { name } }"}'                      # 2
curl -s -X POST $G -H 'Content-Type: application/json' -d '{"query":"{ country(code: \"IN\") { nam } }"}' -w " [%{http_code}]\n"   # 3
```

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

A good security note for B: *"Any caller can read every guest's name and
stay dates without authenticating (`GET /booking` and `GET /booking/{id}`), and
any valid token can change any booking. For real personal data this is a
critical exposure. Recommend: require auth for reads, enforce ownership per
booking, and page the list endpoint."*

</details>

**Watch out for:** in task 9, the k6 run *finishes* normally — the failure is
in the exit code and the ✗ next to the threshold. In CI, that exit code is what
fails the job.

**Try it:** a GraphQL query can ask for `countries { states { … } }` — how big
is the response? What limit would you recommend?

---

## Final project {#final-project}

Test the **Swagger Petstore** (`https://petstore3.swagger.io/api/v3`) — it
publishes its OpenAPI spec at `/api/v3/openapi.json`.

**Done when:**

- [ ] Endpoint inventory built from the spec (method, path, auth)
- [ ] Postman collection for the pet endpoints, run by Newman
- [ ] Automated suite (Python or TypeScript): happy, negative and schema tests for pets and the store
- [ ] Known bugs marked as expected failures with ids
- [ ] Bug reports with `curl` reproductions
- [ ] A small k6 check with thresholds
- [ ] README: how to run everything; a one-page summary with a verdict
- [ ] Public repo — proof you can deliver the
      API testing service
