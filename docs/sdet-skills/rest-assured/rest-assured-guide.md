---
title: "Rest Assured: The Complete Guide"
description: "End-to-end reference for Rest Assured — given/when/then DSL, request specs, JSON/XML assertions, auth, schema validation, and interview-ready Q&A."
sidebar_position: 1
tags: [rest-assured, sdet, api-testing, java]
---

# Rest Assured — The Complete Guide

A single-read, end-to-end reference for Rest Assured: enough to stand up a
new API test suite, write idiomatic assertions against a JSON/XML response,
or walk into an SDET interview. Organized as a lookup you can also read
top-to-bottom.

<a class="topic-crosslink" href="/cheatsheets/rest-assured">📋 Quick reference: Rest Assured →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 230" role="img" aria-labelledby="mm-restassured-title mm-restassured-desc">
<title id="mm-restassured-title">The given / when / then flow of a Rest Assured test</title>
<desc id="mm-restassured-desc">A test declares setup in Given, performs the HTTP action in When, and asserts on the response in Then; values extracted in Then can feed back into the When of a chained follow-up request.</desc>
<defs>
  <marker id="mm-restassured-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n3" x="60" y="80" width="200" height="80" rx="10"/>
<text class="mm-node-title" x="160" y="112" text-anchor="middle">Given</text>
<text class="mm-node-sub" x="160" y="129" text-anchor="middle">baseUri, headers, auth</text>
<path class="mm-arrow" d="M260,120 L306,120" marker-end="url(#mm-restassured-arrow)"/>

<rect class="mm-n2" x="310" y="80" width="200" height="80" rx="10"/>
<text class="mm-node-title" x="410" y="112" text-anchor="middle">When</text>
<text class="mm-node-sub" x="410" y="129" text-anchor="middle">the HTTP action</text>
<path class="mm-arrow" d="M510,120 L556,120" marker-end="url(#mm-restassured-arrow)"/>

<rect class="mm-n4" x="560" y="80" width="200" height="80" rx="10"/>
<text class="mm-node-title" x="660" y="112" text-anchor="middle">Then</text>
<text class="mm-node-sub" x="660" y="129" text-anchor="middle">assert status, JSON path</text>

<path class="mm-arrow" d="M660,160 C660,200 410,200 410,160" marker-end="url(#mm-restassured-arrow)"/>
<text class="mm-flow-label" x="535" y="195" text-anchor="middle">extract value, chain next request</text>
</svg>

<p class="mental-model__caption">Every Rest Assured test reads as one sentence: Given sets up the request with a base URI, headers, and auth, When performs the actual HTTP call, and Then asserts on the response using status codes, JSON path expressions, or schema validation — values extracted in Then can feed straight back into the When of the next chained request.</p>
</div>

## 1. What Rest Assured Is, in Practical Terms

Rest Assured is a **Java DSL (domain-specific language) library** for
testing REST APIs. It wraps HTTP client plumbing (Apache HttpClient under
the hood) and JSON/XML parsing (Jackson/Gson, XmlPath) behind a fluent,
BDD-flavored `given().when().then()` syntax so tests read like the request
they describe rather than boilerplate connection code.

It is the de facto standard for **code-first, Java-based API automation** —
the natural fit when your test suite already lives in Java/Kotlin alongside
TestNG or JUnit, versus tools like Postman which are better for exploratory
or manual API work (see [section 12](#12-rest-assured-vs-postman) for the
comparison).

```java
import static io.restassured.RestAssured.*;
import static org.hamcrest.Matchers.*;

@Test
public void getUser_returns200AndCorrectName() {
    given()
        .baseUri("https://api.example.com")
        .header("Accept", "application/json")
    .when()
        .get("/users/42")
    .then()
        .statusCode(200)
        .body("name", equalTo("Ada Lovelace"));
}
```

---

## 2. The `given()/when()/then()` DSL

The DSL mirrors Gherkin's BDD structure and maps directly onto the anatomy
of an HTTP test:

| Block | Purpose | Typical contents |
|---|---|---|
| `given()` | Arrange | Base URI, headers, path/query params, auth, request body, cookies |
| `when()` | Act | The HTTP verb + endpoint (`.get()`, `.post()`, `.put()`, `.patch()`, `.delete()`) |
| `then()` | Assert | Status code, headers, response body, response time |

```java
given()
    .contentType(ContentType.JSON)
    .pathParam("id", 42)
    .queryParam("expand", "orders")
    .body(newUserPayload)
.when()
    .post("/users/{id}")
.then()
    .statusCode(201)
    .header("Location", containsString("/users/42"))
    .time(lessThan(2000L));
```

- **Path params** (`{id}`) are substituted from `.pathParam()` — use these
  instead of manual string concatenation, which is error-prone and hard to
  read in diffs.
- **Query params** via `.queryParam(name, value)`; multiple values for the
  same key: `.queryParam("tag", "a", "b")`.
- `.log().all()` / `.log().body()` inside `given()` or `then()` prints the
  raw request/response — invaluable when a test fails and you need to see
  exactly what went over the wire (see [section 10](#10-loggingdebugging)).

---

## 3. Request Specifications (Reusable Setup)

Repeating `baseUri`, headers, and auth in every test is both noisy and a
maintenance hazard. `RequestSpecification` centralizes it once.

```java
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.specification.RequestSpecification;

public class ApiSpecs {
    public static RequestSpecification baseSpec() {
        return new RequestSpecBuilder()
            .setBaseUri("https://api.example.com")
            .setContentType(ContentType.JSON)
            .addHeader("X-Client-Id", "sdet-suite")
            .setRelaxedHTTPSValidation()   // skip cert checks — test envs only
            .build();
    }
}
```

```java
given()
    .spec(ApiSpecs.baseSpec())
    .body(payload)
.when()
    .post("/orders")
.then()
    .statusCode(201);
```

You can also set a **static default** so every request in the class picks it
up automatically without repeating `.spec(...)`:

```java
@BeforeClass
public void setup() {
    RestAssured.requestSpecification = ApiSpecs.baseSpec();
    RestAssured.baseURI = "https://api.example.com";
}
```

### Response specifications

Symmetrically, `ResponseSpecBuilder` centralizes common assertions (e.g.,
"every 2xx response must be JSON and respond within 3s") so they're not
duplicated across dozens of tests:

```java
ResponseSpecification successSpec = new ResponseSpecBuilder()
    .expectStatusCode(200)
    .expectContentType(ContentType.JSON)
    .expectResponseTime(lessThan(3000L))
    .build();

then().spec(successSpec);
```

---

## 4. JSON Path Assertions & Hamcrest Matchers

Rest Assured parses the response body and lets you assert on it using
**JsonPath** expressions combined with **Hamcrest matchers** — the same
matcher library JUnit uses, so the vocabulary transfers directly.

```json
{
  "id": 42,
  "name": "Ada Lovelace",
  "roles": ["admin", "editor"],
  "address": { "city": "London", "zip": "EC1" },
  "orders": [
    { "id": 1, "total": 25.50 },
    { "id": 2, "total": 99.99 }
  ]
}
```

```java
.then()
    .body("id", equalTo(42))
    .body("name", equalTo("Ada Lovelace"))
    .body("roles", hasItem("admin"))
    .body("roles.size()", is(2))
    .body("address.city", equalTo("London"))
    .body("orders[0].total", equalTo(25.50f))
    .body("orders.total.sum()", equalTo(125.49f))          // JsonPath aggregate function
    .body("orders.findAll { it.total > 50 }.id", hasItem(2)); // GPath filtering
```

### Common Hamcrest matchers used in API assertions

| Matcher | Checks |
|---|---|
| `equalTo(x)` | Exact equality |
| `containsString(x)` | Substring match |
| `hasItem(x)` / `hasItems(x, y)` | Collection contains element(s) |
| `hasSize(n)` | Collection size |
| `everyItem(matcher)` | Every element in a collection satisfies matcher |
| `notNullValue()` / `nullValue()` | Presence/absence |
| `greaterThan(n)` / `lessThanOrEqualTo(n)` | Numeric comparisons |
| `allOf(m1, m2)` / `anyOf(m1, m2)` | Combinators |

```java
.body("orders.total", everyItem(greaterThan(0f)))
.body("email", allOf(containsString("@"), endsWith(".com")));
```

### Extracting values for later use

```java
String userId = get("/users").then().extract().path("data[0].id");
Response response = get("/users/42");
int status = response.statusCode();
String body = response.asString();
UserDto user = response.as(UserDto.class);   // deserialize straight to a POJO
```

---

## 5. XML Responses

For SOAP/XML APIs, the same pattern applies via **XmlPath** and XPath
expressions instead of JsonPath:

```xml
<user id="42">
  <name>Ada Lovelace</name>
  <roles>
    <role>admin</role>
  </roles>
</user>
```

```java
.then()
    .body("user.@id", equalTo("42"))
    .body("user.name", equalTo("Ada Lovelace"))
    .body("user.roles.role", hasItem("admin"))
    .body(hasXPath("//user[@id='42']/name", equalTo("Ada Lovelace")));
```

---

## 6. Authentication

Rest Assured has first-class helpers for the auth schemes you'll actually
encounter in API test suites.

```java
// Basic auth
given().auth().basic("user", "pass")

// Preemptive basic (send Authorization header on the first request,
// don't wait for a 401 challenge — most REST APIs need this)
given().auth().preemptive().basic("user", "pass")

// Bearer token
given().auth().oauth2(accessToken)
// equivalent, explicit form:
given().header("Authorization", "Bearer " + accessToken)

// Digest auth
given().auth().digest("user", "pass")
```

### OAuth2 client-credentials flow (typical pattern)

Token acquisition is usually its own request, chained into subsequent calls:

```java
public class TokenProvider {
    public static String getAccessToken() {
        return given()
            .baseUri("https://auth.example.com")
            .formParam("grant_type", "client_credentials")
            .formParam("client_id", CLIENT_ID)
            .formParam("client_secret", CLIENT_SECRET)
        .when()
            .post("/oauth/token")
        .then()
            .statusCode(200)
            .extract().path("access_token");
    }
}

@BeforeClass
public void authenticate() {
    RestAssured.requestSpecification = new RequestSpecBuilder()
        .addHeader("Authorization", "Bearer " + TokenProvider.getAccessToken())
        .build();
}
```

**Best practice:** fetch the token once per test class/suite (cache it), not
once per test — token endpoints are rate-limited and re-authenticating
hundreds of times slows the suite and can trip throttling.

---

## 7. Serialization & Deserialization with POJOs

Rest Assured integrates with Jackson (default) or Gson to convert between
Java objects and JSON automatically — you rarely need to build request
bodies as raw strings.

```java
public class User {
    private String name;
    private String email;
    private List<String> roles;
    // getters/setters, or use Lombok @Data
}
```

```java
User newUser = new User("Grace Hopper", "grace@example.com", List.of("admin"));

User created = given()
        .contentType(ContentType.JSON)
        .body(newUser)                 // serialized to JSON automatically
    .when()
        .post("/users")
    .then()
        .statusCode(201)
        .extract().as(User.class);     // deserialized from JSON automatically

assertThat(created.getName(), equalTo("Grace Hopper"));
```

For lists: `response.jsonPath().getList("data", User.class)`.

**Why this matters:** POJO-based assertions catch structural drift (a field
renamed, a type changed from string to number) at compile time or via clean
`assertEquals` on objects, instead of brittle string-path assertions
scattered across dozens of tests.

---

## 8. JSON Schema Validation

Beyond asserting individual fields, validate the **entire response shape**
against a JSON Schema — catches contract-breaking changes (missing
required field, wrong type) that field-by-field assertions might miss.

```java
// build.gradle / pom.xml: io.rest-assured:json-schema-validator
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;

.then()
    .body(matchesJsonSchemaInClasspath("schemas/user-schema.json"));
```

```json
// schemas/user-schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "name", "email"],
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string" },
    "email": { "type": "string", "format": "email" },
    "roles": { "type": "array", "items": { "type": "string" } }
  }
}
```

Schema validation is especially valuable in **contract tests** run against
every deploy — it fails fast the moment a backend team ships a breaking
response shape change, before it reaches consumers.

---

## 9. Integration with TestNG / JUnit

Rest Assured is a library, not a runner — it plugs into whichever test
framework you already use.

```java
// TestNG
public class UserApiTest {
    @BeforeClass
    public void setup() {
        RestAssured.baseURI = "https://api.example.com";
    }

    @Test(groups = "smoke")
    public void getUser_returns200() {
        given().pathParam("id", 42)
        .when().get("/users/{id}")
        .then().statusCode(200);
    }

    @Test(dataProvider = "invalidIds")
    public void getUser_invalidId_returns404(int id) {
        given().pathParam("id", id)
        .when().get("/users/{id}")
        .then().statusCode(404);
    }

    @DataProvider
    public Object[][] invalidIds() {
        return new Object[][] { {-1}, {0}, {999999} };
    }
}
```

```java
// JUnit 5
class UserApiTest {
    @ParameterizedTest
    @ValueSource(ints = {-1, 0, 999999})
    void getUser_invalidId_returns404(int id) {
        given().pathParam("id", id)
        .when().get("/users/{id}")
        .then().statusCode(404);
    }
}
```

- **TestNG** brings native `groups` (smoke/regression tagging), parallel
  execution, and dependency ordering (`dependsOnMethods`) — common in larger
  API suites.
- **JUnit 5** brings `@ParameterizedTest`/`@Tag`, tighter Spring Boot test
  integration, and is the default for greenfield Java/Kotlin projects.
- Both pair with **Allure** or **ExtentReports** for HTML test reports, and
  with Maven/Gradle for CI execution (`mvn test -Dgroups=smoke`).

---

## 10. Logging/Debugging

```java
given()
    .log().all()          // log full request: method, headers, body, params
.when()
    .get("/users/42")
.then()
    .log().ifValidationFails()   // only log response if an assertion fails
    .statusCode(200);
```

| Log call | Logs |
|---|---|
| `.log().all()` | Everything (headers, body, params, cookies) |
| `.log().body()` | Body only |
| `.log().headers()` | Headers only |
| `.log().ifValidationFails()` | Only on assertion failure — keeps CI logs clean, still gives you what you need to debug |
| `.log().ifError()` | Only if status code is 4xx/5xx |

**Practical pattern:** use `.log().ifValidationFails()` in `then()` as the
default across the suite. Full `.log().all()` on every request is useful
locally while writing a test but floods CI logs at scale — dial it back
before merging.

Enable **Apache HttpClient wire-level logging** (`-Dorg.apache.http.wire=DEBUG`)
as a last resort when you need to see raw bytes on the wire — TLS handshake
issues, chunked encoding problems, redirect chains Rest Assured's own
logging doesn't show clearly.

---

## 11. Advanced: Filters, Multipart, and Relaxed Validation

```java
// Custom filter — runs on every request/response, e.g. to inject a correlation ID
given().filter((req, res, ctx) -> {
    System.out.println("Request to: " + req.getURI());
    return ctx.next(req, res);
})

// Multipart file upload
given()
    .multiPart("file", new File("avatar.png"))
    .multiPart("caption", "profile photo")
.when()
    .post("/upload")
.then()
    .statusCode(200);

// Self-signed cert / test environments
RestAssured.useRelaxedHTTPSValidation();
```

The bundled `io.restassured:rest-assured` also exposes a
**RequestLoggingFilter**/**ResponseLoggingFilter** pair and
**AllureRestAssured** filter for automatically attaching request/response
pairs to Allure reports per test — wire it once in the spec builder rather
than logging manually per test.

---

## 12. Rest Assured vs Postman

| | Rest Assured | Postman |
|---|---|---|
| Nature | Code-first Java library | GUI tool (+ scripting) |
| Best for | CI-integrated regression/contract suites, versioned in git alongside app code | Exploratory testing, manual API poking, quick collaboration with non-engineers |
| Assertions | Hamcrest matchers, JSON Schema, POJO equality — full Java type system | `pm.test()` JS assertions inside the app |
| CI execution | Native — it's just JUnit/TestNG tests | Needs Newman (CLI runner) to execute outside the GUI |
| Version control | Plain Java files — diffs cleanly in git | JSON collection exports — diffs are noisy |
| Team fit | Dev/SDET teams already writing Java | Cross-functional teams (PMs, manual QA) who want a UI |

In practice, teams often use **both**: Postman for fast manual exploration
and API design/documentation, Rest Assured for the durable, CI-gated
regression suite that lives in the codebase.

---

## 13. Interview-Ready Q&A

**Q: Walk me through the anatomy of a Rest Assured test.**
A: It follows the `given().when().then()` BDD pattern. `given()` sets up
the request — base URI, headers, auth, path/query params, body. `when()`
fires the HTTP call (`get`, `post`, etc.) against an endpoint. `then()`
asserts on the response — status code, headers, body content via
JsonPath/Hamcrest matchers, or response time. This mirrors how you'd
describe the test in plain English, which is why it reads well in code
review.

**Q: How do you avoid duplicating base URI/auth/headers across every test
in a large suite?**
A: `RequestSpecification`, built via `RequestSpecBuilder`, centralizes
common request setup (base URI, default headers, content type, auth) in one
place and is reused via `.spec(mySpec)` or set globally as
`RestAssured.requestSpecification`. Symmetrically, `ResponseSpecification`
centralizes common assertions like "always 2xx, always JSON, always under
3s" so they're not copy-pasted into every test method.

**Q: How would you validate that an API response's entire shape hasn't
changed, not just individual field values?**
A: JSON Schema validation via `matchesJsonSchemaInClasspath("schema.json")`
— it checks required fields, types, and structure against a schema file in
one assertion, catching contract-breaking changes (a field removed, a type
changed from string to int) that individual `.body("field", equalTo(...))`
assertions on specific fields wouldn't catch unless you enumerated every
field explicitly.

**Q: What's the difference between `.auth().basic()` and
`.auth().preemptive().basic()`?**
A: Plain `.auth().basic()` waits for the server to challenge with a 401 and
a `WWW-Authenticate` header before sending credentials on a retried request
— the standard HTTP basic-auth handshake. `.auth().preemptive().basic()`
sends the `Authorization` header on the very first request without waiting
for a challenge. Most REST APIs expect credentials immediately and don't
implement the challenge-response handshake, so preemptive is what you use
in practice almost every time.

**Q: How do you handle an API that requires a bearer token obtained from a
separate login/token endpoint?**
A: Make the token-acquisition call first (typically in `@BeforeClass`/
`@BeforeAll`), extract the token from that response, and inject it as a
default `Authorization: Bearer <token>` header via
`RestAssured.requestSpecification` or a shared `RequestSpecification` so
every subsequent test reuses it. Fetch it once per suite/class rather than
per test to avoid hammering the auth endpoint and hitting rate limits.

**Q: How do you deserialize a JSON response directly into a Java object,
and why would you prefer that over path-based assertions?**
A: `response.as(MyDto.class)` (Jackson/Gson under the hood) deserializes
the body into a POJO in one call, as long as field names match (or are
mapped via annotations). It's preferable when you need to do further logic
with the data, compare whole objects with `assertEquals`, or when the DTO
class is already shared with the application code — it catches structural
drift at compile/deserialization time instead of failing silently on a
typo'd JsonPath string.

**Q: A test passes locally but fails in CI. How do you debug it with Rest
Assured's built-in tooling, without adding print statements?**
A: Turn on `.log().ifValidationFails()` (or `.log().all()` temporarily) in
`then()` — it prints the full request and response only when an assertion
fails, which is usually enough to see a wrong status code, unexpected
header, or different response body between environments. If it's a
lower-level networking issue (TLS, redirects, encoding), enable Apache
HttpClient wire logging for byte-level detail.

**Q: When would you choose Rest Assured over Postman for a given testing
task, and vice versa?**
A: Rest Assured for anything that needs to run unattended in CI as part of
a regression or contract-test gate — it's just JUnit/TestNG code, versions
cleanly in git, and integrates with the rest of the Java test stack.
Postman for fast, ad hoc exploration of a new endpoint, manual sanity
checks, or collaborating with non-engineers (PMs, manual QA) who want a UI
rather than code — running that at scale in CI would still route through
Newman, but the day-to-day interaction model is GUI-first.

---

## 14. One-Line Summary

**Rest Assured turns HTTP API testing into readable Java code —
`given().when().then()` plus Hamcrest/JSON-Schema assertions and POJO
(de)serialization — so your API regression suite lives, versions, and runs
in CI right alongside the rest of your codebase.**
