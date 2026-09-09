---
title: "Selenium Cheat Sheet"
description: "Quick reference for Selenium — locators, waits, Page Object Model, Grid, and the Actions API."
tags: [selenium, sdet, e2e, cheat-sheet]
hide_table_of_contents: true
---

# Selenium cheatsheet

A one-page reference for Selenium. For WebDriver architecture and interview
Q&A, see the [complete guide](/docs/sdet-skills/selenium/selenium-guide).

<a class="topic-crosslink" href="/docs/sdet-skills/selenium/selenium-guide">📖 Full guide: Selenium →</a>

<div class="cheat-sheet cheat-sheet--sdet">

<div class="cheat-card">

#### Locator strategies

```java
driver.findElement(By.id("username"));
driver.findElement(By.cssSelector(".btn-primary"));
driver.findElement(By.xpath("//button[text()='Submit']"));
```

Prefer `id`/CSS over XPath — faster, more resilient to markup changes.

</div>

<div class="cheat-card">

#### Waits (avoid the classic flakiness bug)

```java
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
wait.until(ExpectedConditions.elementToBeClickable(By.id("submit")));
```

Never mix `Thread.sleep()` with explicit waits — and never set both an
implicit and explicit wait globally, they compound unpredictably.

<span class="cheat-see">See: Waits — and the Classic Flakiness Bug</span>

</div>

<div class="cheat-card">

#### Page Object Model

```java
public class LoginPage {
  private WebDriver driver;
  private By username = By.id("username");

  public void login(String user, String pass) {
    driver.findElement(username).sendKeys(user);
    driver.findElement(By.id("submit")).click();
  }
}
```

</div>

<div class="cheat-card">

#### Frames, alerts, windows

```java
driver.switchTo().frame("payment-frame");
driver.switchTo().alert().accept();
for (String handle : driver.getWindowHandles()) {
  driver.switchTo().window(handle);
}
```

</div>

<div class="cheat-card">

#### Selenium Grid

```bash
docker run -d -p 4444:4444 selenium/hub
docker run -d --link hub selenium/node-chrome
```

```java
new RemoteWebDriver(new URL("http://hub:4444"), capabilities);
```

Distributes tests across many browsers/machines in parallel.

</div>

<div class="cheat-card">

#### Actions API

```java
Actions actions = new Actions(driver);
actions.dragAndDrop(source, target).perform();
actions.moveToElement(menu).click(subItem).perform();
```

</div>

<div class="cheat-card">

#### Common flakiness pitfalls

- Hardcoded sleeps instead of explicit waits.
- Stale element references after a page re-render.
- Not isolating test data — parallel tests colliding on shared state.

<span class="cheat-see">See: Common Flakiness Pitfalls</span>

</div>

<div class="cheat-card">

#### Framework & CI notes

- Pair with TestNG/JUnit for assertions and parallel execution.
- Run headless in CI (`--headless=new` Chrome flag) for speed.
- Screenshot on failure — the highest-leverage CI debugging aid.

</div>

</div>
