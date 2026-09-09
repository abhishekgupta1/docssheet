---
title: "Appium Cheat Sheet"
description: "Quick reference for Appium — capabilities, locators, gestures, device farms, and flakiness pitfalls."
tags: [appium, sdet, mobile, cheat-sheet]
hide_table_of_contents: true
---

# Appium cheatsheet

A one-page reference for Appium. For architecture, driver internals, and
interview Q&A, see the [complete guide](/docs/sdet-skills/appium/appium-guide).

<a class="topic-crosslink" href="/docs/sdet-skills/appium/appium-guide">📖 Full guide: Appium →</a>

<div class="cheat-sheet cheat-sheet--sdet">

<div class="cheat-card">

#### Desired capabilities

```json
{
  "platformName": "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": "Pixel_7",
  "appium:app": "/path/to/app.apk"
}
```

</div>

<div class="cheat-card">

#### Android vs iOS drivers

| | Android | iOS |
|---|---|---|
| Driver | UiAutomator2 | XCUITest |
| Locator id | resource-id | accessibility id |
| Tooling | Android SDK | Xcode |

</div>

<div class="cheat-card">

#### Locator strategies

```python
driver.find_element(AppiumBy.ACCESSIBILITY_ID, "Login")
driver.find_element(AppiumBy.ANDROID_UIAUTOMATOR,
  'new UiSelector().text("Login")')
driver.find_element(AppiumBy.IOS_CLASS_CHAIN,
  '**/XCUIElementTypeButton[`label == "Login"`]')
```

Prefer accessibility id — most stable, cross-platform.

</div>

<div class="cheat-card">

#### Real device vs emulator vs cloud farm

- Emulator/simulator — fast, free, good for CI smoke tests.
- Real device — catches OS/hardware quirks emulators miss.
- Cloud farm (BrowserStack, Sauce Labs) — real-device matrix at scale, no lab to maintain.

</div>

<div class="cheat-card">

#### Native, hybrid, web contexts

```python
driver.contexts                       # ['NATIVE_APP', 'WEBVIEW_1']
driver.switch_to.context('WEBVIEW_1')  # now driving a webview via CSS/XPath
driver.switch_to.context('NATIVE_APP')
```

</div>

<div class="cheat-card">

#### Gestures

```python
TouchAction(driver).press(x=100, y=800).move_to(x=100, y=200).release().perform()
# or the W3C Actions API for swipe/pinch/multi-touch
```

</div>

<div class="cheat-card">

#### Common flakiness pitfalls

- Fixed sleeps instead of explicit waits for app-ready state.
- Not resetting app state between tests (`noReset`/`fullReset` capability).
- Hardcoded coordinates for gestures instead of element-relative gestures.
- Ignoring platform differences in the same test (Android/iOS require different locators).

<span class="cheat-see">See: Common Flakiness Pitfalls</span>

</div>

<div class="cheat-card">

#### Framework & CI notes

- Appium server + emulator/device farm both needed in CI — device farms remove the local-lab bottleneck.
- Pair with a real assertion library (JUnit/TestNG/pytest), Appium only drives the app.
- Parallelize across multiple emulators/devices for suite speed.

</div>

</div>
