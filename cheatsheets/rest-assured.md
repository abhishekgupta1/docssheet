---
title: "Rest Assured Cheat Sheet"
description: "Quick reference for Rest Assured — the given/when/then DSL, request specs, JSON assertions, and schema validation."
tags: [rest-assured, sdet, api-testing, cheat-sheet]
hide_table_of_contents: true
---

# Rest Assured cheatsheet

A one-page reference for Rest Assured. For POJO serialization and advanced
filters, see the [complete guide](/docs/sdet-skills/rest-assured/rest-assured-guide).

<a class="topic-crosslink" href="/docs/sdet-skills/rest-assured/rest-assured-guide">📖 Full guide: Rest Assured →</a>

<div class="cheat-sheet cheat-sheet--sdet">

<div class="cheat-card">

#### given/when/then DSL

```java
given()
  .baseUri("https://api.example.com")
  .header("Content-Type", "application/json")
.when()
  .get("/users/1")
.then()
  .statusCode(200)
  .body("name", equalTo("Abhishek"));
```

</div>

<div class="cheat-card">

#### Request specifications

```java
RequestSpecification spec = new RequestSpecBuilder()
  .setBaseUri("https://api.example.com")
  .addHeader("Authorization", "Bearer " + token)
  .build();

given().spec(spec).when().get("/orders").then().statusCode(200);
```

Reuse one spec across a whole test class — no repeated boilerplate.

</div>

<div class="cheat-card">

#### JSON path & Hamcrest

```java
.then()
  .body("data.size()", equalTo(3))
  .body("data[0].id", notNullValue())
  .body("data.name", hasItem("Widget"));
```

</div>

<div class="cheat-card">

#### Authentication

```java
given().auth().oauth2(token)...
given().auth().basic("user", "pass")...
given().auth().preemptive().basic("user", "pass")...
```

</div>

<div class="cheat-card">

#### Serialization with POJOs

```java
User user = new User("Abhishek", 30);

given().contentType(ContentType.JSON).body(user)
  .when().post("/users")
  .then().statusCode(201)
  .extract().as(User.class);
```

</div>

<div class="cheat-card">

#### JSON Schema validation

```java
.then().body(matchesJsonSchemaInClasspath("user-schema.json"));
```

Catches structural contract breaks (missing/renamed fields), not just value assertions.

</div>

<div class="cheat-card">

#### Logging & debugging

```java
given().log().all()          // log request
  .when().get("/users")
  .then().log().ifError();   // log response only on failure
```

</div>

<div class="cheat-card">

#### Rest Assured vs Postman

| | Rest Assured | Postman |
|---|---|---|
| Fits into | Java test suite, CI | standalone GUI tool |
| Diffs/review | clean, code-based | noisy JSON export |

<span class="cheat-see">See: Rest Assured vs Postman</span>

</div>

</div>
