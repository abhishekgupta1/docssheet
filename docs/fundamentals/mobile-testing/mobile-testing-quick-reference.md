---
title: "Mobile Testing Quick Reference"
description: "Copy-paste mobile testing reference — device matrix template, mobile checklists, Playwright device emulation, adb and simctl commands, Appium capabilities and locators, gesture commands, network/permission controls, and store-readiness checks."
sidebar_position: 1
level: intermediate
tags: [mobile-testing, appium, android, ios, fundamentals, cheat-sheet]
---

# Mobile Testing Quick Reference

A lookup page for mobile testing: device planning, the commands to drive
devices, Appium config, and the mobile-specific checklists.

:::tip How to use this page
New to mobile testing? Start with the [mobile testing cheat sheet](/cheatsheets/mobile-testing).
For the ordered plan, see the [mobile learning path](/docs/learning-path/mobile-testing/implementation-roadmap).
:::

## Quick Navigation

**Plan:** [Device matrix](#device-matrix) · [Emulator vs real](#emulator-vs-real) · [Checklists](#checklists)

**Drive devices:** [Playwright emulation](#playwright) · [adb](#adb) · [simctl](#simctl)

**Appium:** [Capabilities](#capabilities) · [Locators](#locators) · [Gestures](#gestures)

**Reference:** [Network & permissions](#conditions) · [Store readiness](#store) · [Tools](#tools)

---

## Device matrix {#device-matrix}

```text
Source: <analytics / market share>, <date range>
Tier "must":   <top iOS device> <latest & latest-1 iOS> | <top Android> <latest & latest-1 Android>
Tier "should": <mid-range Android> | <oldest supported iOS>
Tier "edge":   <low-end Android> | <tablet> | <foldable>
OS support:    iOS <min>–<latest> | Android <min API>–<latest>
```

Playwright emulated-device sizes (from the built-in descriptors):

| Device | Viewport (CSS px) | DPR | Mobile | Touch |
|---|---|---|---|---|
| iPhone 15 / 15 Pro | 393 × 659 | 3 | yes | yes |
| Pixel 7 | 412 × 839 | 2.625 | yes | yes |
| Galaxy S9+ | 320 × 658 | 4.5 | yes | yes |
| iPad Pro 11 | 834 × 1194 | 2 | yes | yes |

## Emulator vs real {#emulator-vs-real}

| Use | Emulator/Simulator | Real device | Device cloud |
|---|---|---|---|
| Functional, layout, CI | ✅ | ✅ | ✅ |
| Performance, battery | ❌ | ✅ | ✅ |
| Camera, GPS, biometrics, sensors | ⚠️ limited | ✅ | ⚠️ varies |
| Wide model coverage | ❌ | ❌ | ✅ |
| Offline / deep hardware | ⚠️ | ✅ | ⚠️ |

## Checklists {#checklists}

**Mobile-specific:**
```text
[ ] Fresh install; update from live store version (data kept); uninstall
[ ] Interruptions: call, notification, app switch, lock, OS-kill
[ ] Permissions: grant / deny / ask-later / revoke-after-grant
[ ] Network: slow, Wi-Fi↔cellular, airplane, offline→sync
[ ] Orientation: portrait/landscape; rotate mid-flow
[ ] Screens: small, large, notch, foldable, large font/display size
[ ] Resources: low battery, low storage, low-end memory
[ ] Push: received, tapped opens right screen, app-killed
[ ] Deep links open the right screen, logged in or out
[ ] Gestures: tap, long-press, swipe, pinch, pull-to-refresh
```

**Store readiness:** see [below](#store).

---

## Playwright emulation {#playwright}

```ts
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  projects: [
    { name: 'iPhone 15', use: { ...devices['iPhone 15'] } },
    { name: 'Pixel 7',   use: { ...devices['Pixel 7'] } },
  ],
});
// in a test:
test('mobile', async ({ page, isMobile }) => { /* isMobile true; page.tap() works */ });
await page.setViewportSize({ width: h, height: w });   // rotate
```

Mobile **web** only. For native apps, use Appium.

## adb {#adb}

```bash
adb devices                                   # list
adb install -r app.apk                         # install/replace
adb uninstall <package>
adb shell pm grant <pkg> android.permission.CAMERA     # grant permission
adb shell pm revoke <pkg> android.permission.CAMERA    # revoke
adb shell input tap 500 1200                   # tap x y
adb shell input swipe 500 1500 500 500 300     # swipe (x1 y1 x2 y2 ms)
adb shell input text "hello"                    # type
adb shell input keyevent KEYCODE_HOME|BACK|26  # 26 = power/lock
adb logcat --pid $(adb shell pidof <pkg>)      # app logs
adb shell dumpsys battery set level 5           # fake low battery
adb shell cmd connectivity airplane-mode enable # airplane mode
adb shell am start -W -n <pkg>/<activity>       # cold-start timing
adb shell am start -a android.intent.action.VIEW -d "myapp://order/12"   # deep link
adb emu geo fix <lon> <lat>                     # set emulator GPS
```

## simctl {#simctl}

```bash
xcrun simctl list devices                       # list simulators
xcrun simctl boot "iPhone 15"                    # boot
xcrun simctl install booted App.app              # install
xcrun simctl launch booted <bundle-id>           # launch
xcrun simctl openurl booted "myapp://order/12"   # deep link
xcrun simctl privacy booted grant camera <bundle-id>   # grant permission
xcrun simctl push booted <bundle-id> payload.json      # test a push notification
xcrun simctl io booted screenshot shot.png       # screenshot
```

---

## Appium capabilities {#capabilities}

```json
// Android
{ "platformName": "Android", "appium:automationName": "UiAutomator2",
  "appium:deviceName": "Pixel_7_API_34", "appium:app": "/path/app.apk",
  "appium:autoGrantPermissions": true, "appium:language": "en", "appium:locale": "US" }

// iOS
{ "platformName": "iOS", "appium:automationName": "XCUITest",
  "appium:deviceName": "iPhone 15", "appium:platformVersion": "17.5", "appium:app": "/path/App.app" }
```

```bash
appium driver install uiautomator2   # Android driver
appium driver install xcuitest       # iOS driver
appium                               # start server (http://127.0.0.1:4723)
```

## Appium locators {#locators}

| Strategy | Appium (Java) | Prefer? |
|---|---|---|
| Accessibility id | `AppiumBy.accessibilityId("login_button")` | ✅ cross-platform, stable |
| Android id | `AppiumBy.id("com.app:id/login")` | Android only |
| iOS predicate | `AppiumBy.iOSNsPredicateString("label == 'Login'")` | iOS only |
| Class chain (iOS) | `AppiumBy.iOSClassChain("**/XCUIElementTypeButton[`label == 'Login'`]")` | iOS |
| UiAutomator (Android) | `AppiumBy.androidUIAutomator("new UiSelector().text(\"Login\")")` | Android, scrolling |
| XPath | `AppiumBy.xpath("//android.widget.Button")` | last resort (slow) |

Common actions: `.click()`, `.sendKeys("text")`, `.clear()`, `.getText()`, `.isDisplayed()`.

## Appium gestures {#gestures}

```java
// Appium 2 "mobile:" commands
driver.executeScript("mobile: swipeGesture", Map.of("left",100,"top",800,"width",200,"height",400,"direction","up","percent",0.75));
driver.executeScript("mobile: longClickGesture", Map.of("elementId",el.getId(),"duration",1000));
driver.executeScript("mobile: pinchCloseGesture", Map.of("elementId",el.getId(),"percent",0.5));
driver.executeScript("mobile: scrollGesture", Map.of("left",100,"top",300,"width",200,"height",800,"direction","down","percent",1.0));
// background the app to test interruptions
driver.executeScript("mobile: backgroundApp", Map.of("seconds",5));
```

---

## Network & permissions {#conditions}

| Condition | Emulator/real | Appium / cloud |
|---|---|---|
| Slow network | Emulator settings; `adb` shaping | Cloud network profiles |
| Airplane / offline | `adb shell cmd connectivity airplane-mode enable` | `driver.setConnection(...)` (Android) |
| Wi-Fi toggle | `adb shell svc wifi disable/enable` | cloud controls |
| Permission grant/deny | `adb shell pm grant/revoke`; `simctl privacy` | capability `autoGrantPermissions` |
| Low battery | `adb shell dumpsys battery set level 5` | limited |
| GPS location | `adb emu geo fix`; `simctl location` | cloud location |

## Store readiness {#store}

```text
iOS (App Store Review):
[ ] No crashes, no broken links, no placeholder/demo content
[ ] Sign-in works for the reviewer (or a demo account provided)
[ ] App Privacy details match what's collected; permission prompts have clear reasons
[ ] Screenshots and description current; correct age rating

Android (Play):
[ ] Target API level meets the current requirement
[ ] Data safety form accurate; permissions justified
[ ] Update from the live version keeps user data; no forced logout
[ ] Content rating questionnaire complete
```

## Tools {#tools}

| Need | Tools |
|---|---|
| Native automation | Appium; XCUITest (iOS), Espresso (Android); Maestro (low-code); Detox (React Native) |
| Device cloud | BrowserStack, Sauce Labs, LambdaTest, AWS Device Farm, Firebase Test Lab |
| Mobile web | Playwright / Selenium device emulation; real device via cloud |
| Debugging | Android Studio Logcat/Profiler; Xcode Instruments; Charles/Proxyman (network) |
| Accessibility | Android Accessibility Scanner; Xcode Accessibility Inspector |
| Performance | `adb` gfxinfo/am start; Instruments; Battery Historian |

**Need more detail?** [Cheat sheet](/cheatsheets/mobile-testing) ·
[Best practices](/docs/fundamentals/mobile-testing/best-practices) ·
[Learning path](/docs/learning-path/mobile-testing/implementation-roadmap) ·
[Appium guide](/docs/sdet-skills/appium/appium-guide)
