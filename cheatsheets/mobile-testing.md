---
title: "Mobile Testing Cheat Sheet"
description: "A beginner-to-advanced reference for mobile app testing — native vs hybrid vs web, the device matrix, emulators vs real devices, mobile-web emulation with Playwright, adb and simctl, Appium capabilities and locators, interruptions and permissions, gestures, performance and app-store readiness."
level: intermediate
tags: [mobile-testing, appium, android, ios, sdet, cheat-sheet]
hide_table_of_contents: true
---

# Mobile testing cheatsheet

Learn to test mobile apps — the extra risks of thousands of devices, OS
versions, interruptions, permissions and app stores on top of normal testing.
The runnable examples use **Playwright device emulation** for mobile web (which
runs anywhere); native automation with **Appium** is shown with real config but
needs a device or emulator to run. Each section has three parts:

- **In short** — the idea in one sentence.
- **Example** — code or a command; mobile-web examples were run on emulated devices.
- **Try it** — a small exercise.

The mobile-web tests here pass on emulated iPhone, Pixel and iPad. Want the
longer story? The web, mobile and desktop guide
covers the service, and the [Appium guide](/docs/sdet-skills/appium/appium-guide) goes deep on native automation.

<a class="topic-crosslink" href="/docs/sdet-skills/qa-services-delivery/web-mobile-desktop-testing">📖 Full guide: Web, mobile & desktop →</a>

<LevelBadge level="intermediate" />

<nav class="cheat-jump-nav" aria-label="Mobile testing learning sections">
  <a class="button button--primary" href="/docs/learning-path/mobile-testing/implementation-roadmap">Learning Path</a>
  <a class="button button--primary" href="/docs/fundamentals/mobile-testing/mobile-testing-quick-reference">Quick Reference</a>
  <a class="button button--primary" href="/docs/fundamentals/mobile-testing/best-practices">Best Practices</a>
</nav>

:::tip How to use this page

**Part 1** is what makes mobile different and how to choose devices. **Part 2**
is testing mobile web (runnable now) and the manual checks unique to mobile.
**Part 3** is native automation with Appium and app-store readiness. You can do
Part 1 and the mobile-web parts with just Node.js; native automation needs
Android Studio or Xcode, or a device-cloud account.

:::

## Contents {#contents}

**[Part 1 — Beginner](#part-1)**:
[Why mobile is different](#why-different) ·
[App types](#app-types) ·
[The device matrix](#device-matrix) ·
[Emulators vs real devices](#emulators) ·
[What to test](#what-to-test)

**[Part 2 — Core](#part-2)**:
[Mobile web emulation](#mobile-web) ·
[Touch vs mouse](#touch) ·
[Orientation & viewport](#orientation) ·
[Interruptions](#interruptions) ·
[Permissions](#permissions) ·
[Network conditions](#network) ·
[Common mistakes](#gotchas)

**[Part 3 — Advanced](#part-3)**:
[adb & simctl](#adb) ·
[Appium set-up](#appium) ·
[Capabilities](#capabilities) ·
[Locators & the page object](#locators) ·
[Gestures](#gestures) ·
[Performance](#performance) ·
[App-store readiness](#store) ·
[Words you'll meet](#glossary)

## Part 1 — Beginner {#part-1}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 1. Why mobile is different {#why-different}

**In short:** mobile adds device fragmentation, OS versions, interruptions,
permissions, sensors, battery, flaky networks and app-store rules on top of
everything you already test.

| Web | Mobile adds |
|---|---|
| A few browsers | Thousands of device models |
| You control the runtime | The OS interrupts you (calls, notifications) |
| Stable network | Wi-Fi ↔ cellular, tunnels, offline |
| One screen size range | Notches, foldables, tiny and huge screens |
| Deploy anytime | App-store review before release |
| — | Camera, GPS, biometrics, battery, permissions |

**Try it:** list five ways your phone has interrupted an app this week (a call,
a low-battery warning, losing signal…). Each is a mobile test case.

</div>

<div class="cheat-card">

#### 2. App types {#app-types}

**In short:** the app type decides which tools you use and which bugs to expect.

| Type | Built with | Test impact |
|---|---|---|
| **Native** | Swift/SwiftUI (iOS), Kotlin (Android) | Two codebases; XCUITest/Espresso or Appium |
| **Cross-platform** | React Native, Flutter | One codebase, but platform bugs still differ |
| **Hybrid** | Web inside a native shell (WebView) | Web **and** native issues; context switching |
| **Mobile web / PWA** | A website in the phone browser; a PWA installs and works offline | Browser testing on phones + offline behaviour |

**Try it:** name one app of each type on your phone. How could you tell a native
app from a mobile-web one? (Hint: address bar, offline behaviour, feel.)

</div>

<div class="cheat-card">

#### 3. The device matrix {#device-matrix}

**In short:** you can't test every device — pick a small set from **real usage
data** that covers most users plus the risky edges.

Build it from analytics (device model, OS version, screen size share):

1. Cover the models/OS versions that make up most of the traffic.
2. Add the **oldest OS** you officially support.
3. Add at least one **low-end** Android (that's where performance bugs live).
4. Add the biggest and smallest screens, and a foldable/tablet if relevant.

| Tier | Example |
|---|---|
| Must | Latest iPhone, latest Pixel/Samsung, latest − 1 iOS/Android |
| Should | A mid-range Android, the oldest supported iOS |
| Edge | A low-end Android, a tablet, a foldable |

**Try it:** for a shopping app in India, which two Android devices would you put
in the "must" tier, and why? (Look up current market-share data.)

</div>

<div class="cheat-card">

#### 4. Emulators vs real devices {#emulators}

**In short:** emulators (Android) and simulators (iOS) are fast and free for
most functional testing; real devices are essential for performance, sensors
and final sign-off.

| | Emulator / Simulator | Real device | Device cloud |
|---|---|---|---|
| Speed / cost | Fast, free | Real, but costs money & upkeep | Wide range, pay per minute |
| Good for | Functional, layouts, CI | Performance, camera, biometrics, "feel", sign-off | Coverage, parallel runs |
| Not good for | Real performance, hardware, gestures nuance | Scaling to many models | Offline, deep hardware |

Device clouds: **BrowserStack**, **Sauce Labs**, **LambdaTest**, **AWS Device
Farm**, **Firebase Test Lab**. A common setup: emulators + a few real devices in
the office + a cloud for the long tail.

</div>

<div class="cheat-card">

#### 5. What to test {#what-to-test}

**In short:** all the normal testing, plus a mobile-specific layer.

```text
Mobile-specific checklist
[ ] Install fresh; update from the previous store version (data kept?); uninstall
[ ] Interruptions: call, notification, app switch, lock screen mid-flow
[ ] Permissions: allow, deny, "ask later", revoke in settings
[ ] Network: Wi-Fi ↔ cellular switch, weak signal, airplane mode, offline then sync
[ ] Orientation: portrait/landscape; rotate mid-flow
[ ] Screens: small, large, notch, foldable, large font / display size
[ ] Resources: low battery, low storage, memory on low-end devices
[ ] Push notifications: received, tapped (opens right screen), when app is killed
[ ] Deep links: from email/SMS open the right screen, logged in or not
[ ] Gestures: tap, long-press, swipe, pinch, pull-to-refresh
[ ] Store readiness (Part 3)
```

</div>

</div>

## Part 2 — Core {#part-2}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 6. Mobile web emulation {#mobile-web}

**In short:** for mobile **web**, Playwright can emulate a device's viewport,
pixel ratio, touch and user agent — enough for most layout and functional testing.

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

Real result: **9 passed** (3 tests × 3 devices). This tests mobile *web* — a
real browser engine at the device's size and touch settings. It does **not**
test a native app, real performance, or hardware; for those, see Part 3 and use
real devices.

**Try it:** add a `Galaxy S9+` project (320px wide, the narrowest common phone).
Does anything overflow?

</div>

<div class="cheat-card">

#### 7. Touch vs mouse {#touch}

**In short:** touch devices send touch events, not mouse events, and have **no
hover** — controls that appear only on hover are unreachable by touch.

| Playwright action | Sends | Needs |
|---|---|---|
| `.click()` | Mouse events | Works everywhere |
| `.tap()` | Touch events | `hasTouch: true` (set by the device descriptor) |
| `.hover()` | Mouse move | **Does nothing useful on touch** |

The classic mobile bug: a menu or a "delete" button revealed on hover works with
a mouse but not on a phone. On the TodoMVC demo, the item's toggle checkbox is
hidden until hover — so a hover-hidden control is a real touch failure to test for.

```ts
await page.getByRole('button', { name: 'Menu' }).tap();     // touch, not click
// a control that only appears on :hover cannot be tapped — that's a bug on mobile
```

**Try it:** find a website with a hover menu, open it in your phone browser, and
try to reach the submenu. Can you?

</div>

<div class="cheat-card">

#### 8. Orientation & viewport {#orientation}

**In short:** apps must work in portrait **and** landscape, and survive a
rotation mid-flow without losing data.

```ts
const p = page.viewportSize()!;
await page.setViewportSize({ width: p.height, height: p.width });   // rotate to landscape
await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible();
```

Test: rotate on every key screen; rotate **while** typing or mid-transaction
(does the form keep its data?); check landscape layout isn't just a stretched
portrait. Native apps often lock or mishandle orientation — a common bug.

</div>

<div class="cheat-card">

#### 9. Interruptions {#interruptions}

**In short:** the OS interrupts apps constantly — the app must pause, resume and
keep its state.

| Interruption | Test |
|---|---|
| Incoming call | Mid-checkout, take a call, return — data intact? |
| Notification | Tap a notification mid-flow; does it navigate correctly? |
| App switch | Switch away for minutes, come back — session, scroll position |
| Lock / unlock | Lock mid-form, unlock — still there? re-auth if needed? |
| App killed by OS | Force-stop in the background, reopen — restores state? |
| Low battery / battery saver | Background work throttled (common on Samsung/Xiaomi) |

These are hard to automate fully; do them manually on real devices, and script
what you can (app backgrounding via Appium).

</div>

<div class="cheat-card">

#### 10. Permissions {#permissions}

**In short:** test every permission in all states — granted, denied, "ask next
time", and revoked in settings after granting.

| State | Expected |
|---|---|
| Granted | Feature works |
| Denied | Graceful message, not a crash; a way to continue or re-request |
| Ask later / once | Prompt appears again next time |
| Revoked in Settings after use | App notices and handles it |

Permissions to check: camera, photos, location (while-using vs always),
microphone, notifications, contacts, biometrics. On Android, also **runtime**
vs install-time permissions.

**Try it:** in any app that uses the camera, deny the permission. Does it explain
what to do, or just break?

</div>

<div class="cheat-card">

#### 11. Network conditions {#network}

**In short:** mobile networks are unreliable — test slow, switching and offline,
not just full Wi-Fi.

| Condition | Test |
|---|---|
| Slow (2G/3G) | Loading states, timeouts, no duplicate submits |
| Wi-Fi ↔ cellular switch | In-flight requests survive or retry |
| Airplane mode / offline | Clear "no connection" message; queued actions |
| Offline → online | Queued actions sync; no duplicates |
| Captive portal (hotel Wi-Fi) | Detects it's not really online |

For mobile web, throttle in DevTools or with Playwright's CDP. For native,
device settings, Appium, or a device cloud's network controls.

</div>

<div class="cheat-card">

#### 12. Common mistakes {#gotchas}

**In short:** how mobile testing goes wrong.

| Mistake | Better |
|---|---|
| Testing only on the newest flagship | Include old OS and a low-end device |
| Emulator-only sign-off | Real devices for performance, sensors, "feel" |
| Ignoring interruptions & permissions | They're where mobile-specific bugs live |
| Hover-based UI | Everything must work by tap |
| Testing only fresh installs | Test **update** from the live store version |
| Full Wi-Fi only | Slow, switching and offline networks |
| Tiny test data | Long names, many items — check layout and scroll |

</div>

</div>

## Part 3 — Advanced {#part-3}

<div class="cheat-sheet cheat-sheet--sdet cheat-sheet--stack">

<div class="cheat-card">

#### 13. adb & simctl {#adb}

**In short:** `adb` (Android) and `simctl` (iOS simulators) drive devices from
the command line — install apps, set conditions, read logs.

```bash
# Android — adb (Android Debug Bridge, from Android Studio's platform-tools)
adb devices                              # list connected devices/emulators
adb install app.apk                      # install
adb shell pm grant <pkg> android.permission.CAMERA   # grant a permission
adb shell input tap 500 1200             # tap at x,y
adb shell input keyevent KEYCODE_HOME    # press Home
adb logcat | grep -i myapp               # live logs
adb shell dumpsys battery set level 5    # simulate low battery
adb shell svc wifi disable               # turn Wi-Fi off

# iOS simulators — simctl (comes with Xcode)
xcrun simctl list devices                # list simulators
xcrun simctl boot "iPhone 15"            # start one
xcrun simctl install booted App.app      # install
xcrun simctl openurl booted "myapp://order/12"   # test a deep link
```

These need the Android SDK / Xcode installed, so they aren't run on this page.

**Try it:** if you have Android Studio, run `adb devices` with an emulator
running. Then `adb shell input keyevent 26` to lock the screen.

</div>

<div class="cheat-card">

#### 14. Appium set-up {#appium}

**In short:** **Appium** automates native, hybrid and mobile-web apps with one
API in many languages, driving the same journeys as your users.

```bash
npm i -g appium
appium driver install uiautomator2       # Android
appium driver install xcuitest           # iOS
appium                                    # start the server (default http://127.0.0.1:4723)
appium driver doctor uiautomator2        # check your set-up
```

Appium speaks the same WebDriver protocol as Selenium, so if you know Selenium
or Playwright, the concepts transfer: you find elements and act on them. The
difference is **capabilities** (which device/app) and **mobile gestures**.

</div>

<div class="cheat-card">

#### 15. Capabilities {#capabilities}

**In short:** capabilities tell Appium which platform, device, driver and app to
use — the mobile equivalent of a Playwright project.

```json title="capabilities/android.json"
{
  "platformName": "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "Pixel_7_API_34",
  "appium:app": "/path/to/app-release.apk",
  "appium:autoGrantPermissions": true,
  "appium:language": "en",
  "appium:locale": "US"
}
```

```json title="capabilities/ios.json"
{
  "platformName": "iOS",
  "appium:automationName": "XCUITest",
  "appium:deviceName": "iPhone 15",
  "appium:platformVersion": "17.5",
  "appium:app": "/path/to/App.app"
}
```

Shown for structure — running them needs an emulator/simulator or a real device.
Full walkthrough in the [Appium guide](/docs/sdet-skills/appium/appium-guide).

</div>

<div class="cheat-card">

#### 16. Locators & the page object {#locators}

**In short:** on mobile, prefer the **accessibility id** — it's stable and it
also helps screen-reader users; the same page-object pattern as web applies.

| Locator | Android | iOS | Note |
|---|---|---|---|
| Accessibility id | `content-desc` | `accessibilityIdentifier` | **Preferred** — cross-platform, stable |
| Id | resource-id | name | Platform-specific |
| Text | UiSelector text | predicate `label ==` | Breaks with translations |
| XPath | supported | supported | Slow and brittle — last resort |

```java
// a mobile "screen object" — same idea as a web page object
driver.findElement(AppiumBy.accessibilityId("login_button")).click();
```

Ask developers to add accessibility ids to the elements tests need — it's the
mobile version of `data-testid`. See the [test automation cheat sheet](/cheatsheets/test-automation#page-objects)
for the pattern.

</div>

<div class="cheat-card">

#### 17. Gestures {#gestures}

**In short:** mobile apps use gestures — tap, long-press, swipe, pinch,
scroll-to — which Appium performs with the W3C Actions API.

| Gesture | Use |
|---|---|
| Tap / double-tap | Buttons, items |
| Long-press | Context menus, drag start |
| Swipe (left/right/up/down) | Carousels, delete-on-swipe, navigation |
| Pinch / zoom | Maps, images |
| Scroll to element | Long lists |
| Pull-to-refresh | Feeds |

```java
// Appium 2 gesture plugin / driver command example
driver.executeScript("mobile: swipeGesture", Map.of(
  "left", 100, "top", 800, "width", 200, "height", 400, "direction", "up", "percent", 0.75));
```

Test that every gesture has an **alternative** for accessibility (WCAG 2.5.1),
and that swipe-to-delete asks before destroying data.

</div>

<div class="cheat-card">

#### 18. Performance {#performance}

**In short:** measure app start time, memory, battery, network and jank — on a
**low-end** device, where problems show first.

| Metric | Tool |
|---|---|
| Cold/warm start time | `adb shell am start -W`, Xcode Instruments |
| Memory | Android Studio Profiler, Xcode Instruments |
| Battery drain | Android Battery Historian, Xcode Energy log |
| Frame drops (jank) | Android GPU profiling, `dumpsys gfxinfo` |
| App size | Store limits; large apps get fewer installs |
| Network calls | Charles/Proxyman, device-cloud logs |

Compare a flagship and a low-end device — the flagship hides problems the low-end reveals.

</div>

<div class="cheat-card">

#### 19. App-store readiness {#store}

**In short:** before release, check the things that get apps **rejected** or
**uninstalled**.

| Area | Check |
|---|---|
| iOS review | No crashes, no broken links, no placeholder content, working sign-in, privacy details accurate |
| Android policy | Target API level met, data-safety form correct, permissions justified |
| Metadata | Screenshots current, description accurate, correct age rating |
| Privacy | Permission prompts match what's collected; privacy policy linked |
| Distribution | Builds install from TestFlight (iOS) / Play internal testing (Android) |
| Updates | Update from the live version keeps user data; no forced logout |

Rejections cost days — a pre-submission checklist saves a release cycle.

</div>

<div class="cheat-card">

#### 20. Words you'll meet {#glossary}

**In short:** the jargon, in one line each.

| Word | Meaning |
|---|---|
| **Emulator / Simulator** | Software imitating a phone (Android emulator, iOS simulator) |
| **Real device / device cloud** | Physical phones, in hand or rented over the internet |
| **Fragmentation** | The huge range of device + OS combinations |
| **adb** | Android Debug Bridge — the Android command-line tool |
| **simctl** | Xcode's command-line tool for iOS simulators |
| **Appium** | Cross-platform mobile automation tool (WebDriver protocol) |
| **Capabilities** | Settings telling Appium which device/app to use |
| **Accessibility id** | A stable, cross-platform locator (and a11y label) |
| **WebView** | A browser component embedded in a native app (hybrid apps) |
| **PWA** | Progressive Web App — a website that can install and work offline |
| **Deep link** | A URL that opens a specific screen in an app |
| **TestFlight** | Apple's beta-distribution tool |
| **Cold start** | Launching the app from not-running |

For the platform service, see the
web, mobile and desktop guide;
for native automation depth, the [Appium guide](/docs/sdet-skills/appium/appium-guide).

</div>

</div>
