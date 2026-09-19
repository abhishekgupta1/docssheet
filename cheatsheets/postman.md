---
title: "Postman Cheat Sheet"
description: "Quick reference for Postman — collections, pm.* scripts, Newman CI runs, and mock servers."
tags: [postman, sdet, api-testing, cheat-sheet]
hide_table_of_contents: true
---

# Postman cheatsheet

A one-page reference for Postman. For workspace organization and interview
Q&A, see the [complete guide](/docs/sdet-skills/postman/postman-guide).

<a class="topic-crosslink" href="/docs/sdet-skills/postman/postman-guide">📖 Full guide: Postman →</a>

<div class="cheat-sheet cheat-sheet--sdet">

<div class="cheat-card">

#### `pm.*` test scripts

```js
pm.test("status is 200", () => {
  pm.response.to.have.status(200);
});

pm.test("has user id", () => {
  const json = pm.response.json();
  pm.expect(json.id).to.be.a('number');
});
```

</div>

<div class="cheat-card">

#### Pre-request scripts

```js
pm.environment.set("timestamp", Date.now());
pm.request.headers.add({
  key: "X-Signature",
  value: computeHmac(pm.environment.get("secret"))
});
```

</div>

<div class="cheat-card">

#### Chaining requests

```js
// in a "Login" request's Tests tab
pm.environment.set("authToken", pm.response.json().token);
// next request uses {{authToken}} in its Authorization header
```

</div>

<div class="cheat-card">

#### Collection Runner (data-driven)

```
Runner → select collection → select CSV/JSON data file
→ each row runs the whole collection once, {{variables}} pulled from row
```

</div>

<div class="cheat-card">

#### Newman — CI execution

```bash
newman run collection.json -e env.json \
  --reporters cli,junit --reporter-junit-export results.xml
```

</div>

<div class="cheat-card">

#### Mock servers

```
New → Mock Server → pick collection
→ returns saved example responses without hitting the real backend
```

Useful for frontend teams to develop against before the API exists.

</div>

<div class="cheat-card">

#### Environments & variables

```
{{baseUrl}}/users/{{userId}}
```

Scope order (highest wins): Local → Environment → Collection → Global.

</div>

<div class="cheat-card">

#### Postman vs Rest Assured

| | Postman | Rest Assured |
|---|---|---|
| Authoring | GUI + JS | Java code |
| Version control | export JSON (noisy diffs) | native, clean diffs |
| Best for | exploratory, quick checks | CI-integrated regression suites |

<span class="cheat-see">See: Postman vs Rest Assured</span>

</div>

</div>
