---
title: "Mobile Testing Milestones & Mini-Projects"
description: "Tasks with expected results for each of the six mobile testing milestones — device matrix, Playwright mobile-web tests, a manual mobile pass, command-line device control, Appium native automation, and a device-cloud run with a report."
sidebar_position: 2
level: intermediate
tags: [mobile-testing, appium, learning-path, projects]
---

# Mobile Testing Milestones & Mini-Projects

**In short:** six projects. The mobile-**web** ones (Milestone 2) run on your
machine and are shown with real, passing tests; the **native** ones use real
commands and config you run when you have an emulator, device or device cloud.

:::tip How to use this page
First read each milestone in the [Roadmap](/docs/learning-path/mobile-testing/implementation-roadmap).
For the native milestones, a free device-cloud trial works if you don't have
Android Studio or Xcode installed.
:::

## Contents

- [Milestone 1: Build a device matrix](#milestone-1)
- [Milestone 2: Mobile-web tests](#milestone-2)
- [Milestone 3: Manual mobile pass](#milestone-3)
- [Milestone 4: Command-line device control](#milestone-4)
- [Milestone 5: Appium native automation](#milestone-5)
- [Milestone 6: Cloud run + report](#milestone-6)
- [Final project](#final-project)

---

## Milestone 1: Build a device matrix {#milestone-1}

**Practises:** turning usage data into a test plan.

| # | Task | Expected result |
|---|---|---|
| 1 | Pick an app and a market (e.g. a shopping app in India) | Chosen |
| 2 | Find current OS-version and device-share data (StatCounter, your analytics) | A short data list |
| 3 | Build a matrix with "must / should / edge" tiers | A table |
| 4 | Justify each device in one line | Reasons written |
| 5 | State the OS-version support range | e.g. iOS 16–18, Android API 30–35 |

<details>
<summary>Example matrix (illustrative — use current data)</summary>

| Tier | Device | Why |
|---|---|---|
| Must | Latest iPhone, iOS latest & latest−1 | Large, high-spending share |
| Must | Samsung Galaxy A-series (mid-range), Android latest & −1 | Best-selling Android tier in the market |
| Should | A 3-year-old iPhone on the oldest supported iOS | Still common; oldest we support |
| Should | Google Pixel (clean Android) | Reference Android behaviour |
| Edge | A low-end Android (1–2 GB RAM) | Performance bugs appear here first |
| Edge | An iPad / a foldable | Different layouts |

Support: iOS 16–18; Android API 30–35. Review each release.

</details>

**Try it:** how would the matrix differ for a banking app used mostly by older
users? (Hint: older devices, larger fonts, accessibility.)

---

## Milestone 2: Mobile-web tests {#milestone-2}

**Practises:** device emulation, touch, orientation — runnable now.

| # | Task | Expected result |
|---|---|---|
| 1 | Playwright project with iPhone 15, Pixel 7 and iPad Pro 11 | 3 projects |
| 2 | Test: the device is emulated as mobile, narrow viewport | Passes on all 3 |
| 3 | Test: add todos via the keyboard; the counter updates | Passes |
| 4 | Test: rotate to landscape; the app stays usable | Passes |
| 5 | Run all | 9 passed (3 tests × 3 devices) |
| 6 | Add Galaxy S9+ (320px); check nothing breaks at the narrowest width | Passes or a finding |

**Check:** `npx playwright test` — 9 passed.

<details>
<summary>Solution</summary>

```ts title="playwright.config.ts"
// playwright.config.ts — mobile-web testing with device emulation (real devices need a device cloud)
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'https://demo.playwright.dev/' },
  projects: [
    { name: 'iPhone 15', use: { ...devices['iPhone 15'] } },
    { name: 'Pixel 7', use: { ...devices['Pixel 7'] } },
    { name: 'iPad Pro 11', use: { ...devices['iPad Pro 11'] } },
  ],
});
```

```ts title="tests/mobileweb.spec.ts"
// tests/mobileweb.spec.ts — the same web app, checked on emulated phones and a tablet
import { test, expect } from '@playwright/test';

test('device is emulated as mobile with touch', async ({ page, isMobile }) => {
  await page.goto('/todomvc/');
  const width = page.viewportSize()!.width;
  console.log(`viewport ${width}px, isMobile=${isMobile}`);
  expect(width).toBeLessThan(900);          // all our devices are narrow
});

test('add todos with the on-screen keyboard', async ({ page }) => {
  await page.goto('/todomvc/');
  const box = page.getByPlaceholder('What needs to be done?');

  await box.fill('Buy milk');
  await box.press('Enter');
  await box.fill('Walk the dog');
  await box.press('Enter');

  await expect(page.getByText('Buy milk')).toBeVisible();
  await expect(page.getByText('Walk the dog')).toBeVisible();
  await expect(page.getByText('2 items left')).toBeVisible();
});

test('rotating to landscape changes the viewport', async ({ page }) => {
  await page.goto('/todomvc/');
  const portrait = page.viewportSize()!;
  await page.setViewportSize({ width: portrait.height, height: portrait.width });   // rotate
  const landscape = page.viewportSize()!;
  expect(landscape.width).toBeGreaterThan(landscape.height);   // now wider than tall
  await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible();       // still usable
});
```

Real result: `9 passed`. This exercises a real browser engine at each device's
size and touch settings. It is mobile **web** — not a native app, not real
hardware.

</details>

**Watch out for:** `baseURL` with a path plus `page.goto('/')` — `/` goes to the
site root and drops the path. Use the full path in `goto`, as here.

**Try it:** the TodoMVC toggle checkbox is hidden until hover — try to `tap()` it
on the iPhone project. It times out. Why is that a real mobile bug?

---

## Milestone 3: Manual mobile pass {#milestone-3}

**Practises:** the manual mobile layer — do this on a real phone (your own app,
or any app you use).

| # | Task | Expected result |
|---|---|---|
| 1 | Interruptions: take a call / get a notification mid-flow; switch apps; lock/unlock | State preserved each time |
| 2 | Permissions: deny camera/location, then grant, then revoke in Settings | Graceful handling, no crash |
| 3 | Network: turn on airplane mode mid-action; then reconnect | Clear message; actions sync, no duplicates |
| 4 | Orientation: rotate on key screens and mid-typing | No lost data, sensible layout |
| 5 | Large font: max out display/font size in Settings | Layout still works |
| 6 | Log each issue as a mobile bug report | A list of findings |

<details>
<summary>What good findings look like</summary>

- "Rotating during checkout clears the address form (Android 14, Pixel 7)."
- "Denying location shows a blank map with no explanation (iOS 18)."
- "Actions taken in airplane mode are lost on reconnect instead of syncing."
- "At the largest font size, the 'Pay' button is pushed off-screen."

Each names the device and OS, and says what should happen instead.

</details>

**Try it:** put your phone in battery-saver mode and use a social app. Does
anything stop working (background refresh, notifications)?

---

## Milestone 4: Command-line device control {#milestone-4}

**Practises:** adb / simctl to install, set conditions and fire deep links.

Needs an Android emulator/device (adb) or an iOS simulator (simctl).

| # | Task | Expected result |
|---|---|---|
| 1 | List connected devices | Your device/emulator shown |
| 2 | Install an APK / .app | Installed |
| 3 | Grant, then revoke, a permission from the command line | App reflects the change |
| 4 | Fire a deep link to a specific screen | The app opens that screen |
| 5 | Simulate low battery (Android) or set location | App responds |

<details>
<summary>Commands</summary>

```bash
# Android
adb devices
adb install -r app.apk
adb shell pm grant <pkg> android.permission.CAMERA
adb shell pm revoke <pkg> android.permission.CAMERA
adb shell am start -a android.intent.action.VIEW -d "myapp://order/12"
adb shell dumpsys battery set level 5
adb shell dumpsys battery reset            # undo

# iOS simulator
xcrun simctl boot "iPhone 15"
xcrun simctl install booted App.app
xcrun simctl privacy booted grant location <bundle-id>
xcrun simctl openurl booted "myapp://order/12"
```

Full list: [quick reference](/docs/fundamentals/mobile-testing/mobile-testing-quick-reference#adb).

</details>

**Try it:** fire a deep link to a screen that needs login, while logged out. Does
the app send you to login and then to the right screen?

---

## Milestone 5: Appium native automation {#milestone-5}

**Practises:** capabilities, accessibility-id locators, a screen object, a gesture.

Needs an emulator/device, or a device-cloud session. Use a sample app (e.g. the
Sauce Labs demo app, or your own).

| # | Task | Expected result |
|---|---|---|
| 1 | Install Appium + the uiautomator2 (or xcuitest) driver; start the server | Server on :4723 |
| 2 | Write capabilities for your device + app | Session starts |
| 3 | A `LoginScreen` object using **accessibility ids** | Reusable |
| 4 | Test: log in and reach the products screen | Passes |
| 5 | Add a swipe/scroll gesture to reach an item lower in a list | Item found |
| 6 | Background the app 5 s and resume; state preserved | Passes |

<details>
<summary>Solution shape</summary>

Capabilities:

```json title="capabilities/android.json"
{
  "platformName": "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "Pixel_7_API_34",
  "appium:app": "/path/to/app.apk",
  "appium:autoGrantPermissions": true
}
```

Screen object + test (Java, abbreviated):

```java
class LoginScreen {
  private final AppiumDriver driver;
  LoginScreen(AppiumDriver d) { this.driver = d; }
  void loginAs(String user, String pass) {
    driver.findElement(AppiumBy.accessibilityId("username")).sendKeys(user);
    driver.findElement(AppiumBy.accessibilityId("password")).sendKeys(pass);
    driver.findElement(AppiumBy.accessibilityId("login_button")).click();
  }
}

@Test void userCanLogIn() {
  new LoginScreen(driver).loginAs("standard_user", "secret_sauce");
  assertTrue(driver.findElement(AppiumBy.accessibilityId("products_title")).isDisplayed());
}
```

Backgrounding for interruptions:

```java
driver.executeScript("mobile: backgroundApp", Map.of("seconds", 5));
```

Full walkthrough with a runnable project: the [Appium guide](/docs/sdet-skills/appium/appium-guide).

</details>

**Watch out for:** locating by text — it breaks under translation. Ask developers
to add accessibility ids (they double as screen-reader labels).

---

## Milestone 6: Cloud run + report {#milestone-6}

**Practises:** device-cloud coverage, performance, store readiness, reporting.

| # | Task | Expected result |
|---|---|---|
| 1 | Run your Milestone 5 tests on a device cloud across 3 devices | Results on 3 devices |
| 2 | Measure cold-start time on a flagship and a low-end device | Two numbers; low-end slower |
| 3 | Run the [store-readiness checklist](/docs/fundamentals/mobile-testing/mobile-testing-quick-reference#store) | iOS + Android checks |
| 4 | Do a VoiceOver/TalkBack pass on the main journey | Notes |
| 5 | Write a mobile test report | Verdict + coverage + findings |

<details>
<summary>Report outline</summary>

```text
Verdict:   GO WITH RISKS — 1 major open (form clears on rotation, Android)
Coverage:  iOS 16–18 (iPhone 12, 15), Android 12–15 (Pixel 7, Galaxy A54, low-end X)
            emulator for functional; 3 real/cloud devices for sign-off
Performance: cold start 1.2s (flagship) vs 3.8s (low-end) — investigate on low-end
Store:     iOS review checklist ✓; Android data-safety form needs updating
Accessibility: TalkBack completes checkout; 2 unlabeled icons
Findings:  <list, each with device + OS>
```

</details>

**Try it:** compare your cold-start numbers with the app's competitors on the
same device. Where do you stand?

---

## Final project {#final-project}

Test a mobile app end to end — your own, a React Native/Flutter sample, or a
public demo app on a device cloud.

**Done when:**

- [ ] Device matrix from current data, with tiers and reasons
- [ ] Mobile-web (if applicable) tested with emulation across 3 devices
- [ ] Manual pass on a real device: interruptions, permissions, networks, orientation, large font
- [ ] Core journeys automated with Appium and run on ≥ 3 devices (cloud is fine)
- [ ] Update-from-live-version path tested
- [ ] Performance measured on a low-end device vs a baseline
- [ ] Store-readiness checklist complete; a11y pass with a screen reader
- [ ] A report with a verdict, coverage and findings — proof you can deliver
      mobile testing
