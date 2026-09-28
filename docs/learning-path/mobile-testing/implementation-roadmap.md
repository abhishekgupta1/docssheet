---
title: "Mobile Testing Learning Path: Start Here"
description: "How to learn mobile testing in six milestones — device matrix, mobile-web emulation with Playwright, the manual mobile layer (interruptions, permissions, networks), device commands, Appium native automation, and a device-cloud CI run with a report."
sidebar_position: 1
level: intermediate
tags: [mobile-testing, appium, android, ios, learning-path]
---

# Mobile Testing Learning Path: Start Here

**In short:** you learn mobile testing in **6 milestones**. The mobile-**web**
parts run on your machine with Playwright device emulation; the **native** parts
(adb, simctl, Appium) use real config you run when you have an emulator, a
device, or a device-cloud account.

:::tip How to use this page
Read this page once to see the plan. Then, for each milestone, follow the same
four steps: **learn → do → check → commit**. Come back here whenever you're
unsure what to do next.
:::

## Before you start {#before}

- Node.js 20+ (for the mobile-web milestones).
- A phone with VoiceOver or TalkBack for manual checks.
- For native automation (Milestone 5): **either** Android Studio (emulator +
  adb) / Xcode (simulator + simctl), **or** a free trial on a device cloud
  (BrowserStack, Sauce Labs, LambdaTest).
- Helpful: the [test automation cheat sheet](/cheatsheets/test-automation) (page objects, locators).

## The pages in this learning path {#pages}

| Page | What it's for | When to open it |
|---|---|---|
| **This roadmap** | The plan and self-checks | At the start of each milestone |
| [Mobile testing cheat sheet](/cheatsheets/mobile-testing) | Learn each idea; mobile-web examples run | The "learn" step |
| [Milestones & Mini-Projects](/docs/learning-path/mobile-testing/milestones-and-mini-projects) | Tasks, expected results, solutions | The "do" and "check" steps |
| [Quick Reference](/docs/fundamentals/mobile-testing/mobile-testing-quick-reference) | Device matrix, adb/simctl, Appium, checklists | Any time |
| [Best Practices](/docs/fundamentals/mobile-testing/best-practices) | Habits for effective mobile testing | After Milestone 2, then every release |
| [Appium guide](/docs/sdet-skills/appium/appium-guide) | Native automation in depth | Milestone 5 |

## The milestones {#milestones}

| Milestone | You learn | You do | Rough time |
|---|---|---|---|
| [1](#milestone-1) | Why mobile differs, app types, the device matrix | Build a device matrix | 1 week |
| [2](#milestone-2) | Mobile-web emulation, touch, orientation | Playwright mobile-web tests | 1 week |
| [3](#milestone-3) | Interruptions, permissions, networks | Manual mobile pass on a real phone | 1–2 weeks |
| [4](#milestone-4) | adb / simctl, deep links, conditions | Drive a device from the command line | 1 week |
| [5](#milestone-5) | Appium: capabilities, locators, gestures | Automate a native flow | 2 weeks |
| [6](#milestone-6) | Device cloud, performance, store readiness, report | A cloud CI run + report | 1–2 weeks |

Times assume about 5 hours a week.

**For each milestone:** learn (cheat-sheet sections) → do (the tasks) → check
(solution / your device) → commit.

### Milestone 1: The device matrix {#milestone-1}

**Learn:** [Why mobile is different](/cheatsheets/mobile-testing#why-different) ·
[App types](/cheatsheets/mobile-testing#app-types) ·
[The device matrix](/cheatsheets/mobile-testing#device-matrix) ·
[Emulators vs real devices](/cheatsheets/mobile-testing#emulators) ·
[What to test](/cheatsheets/mobile-testing#what-to-test)

**Do:** [Build a device matrix](/docs/learning-path/mobile-testing/milestones-and-mini-projects#milestone-1)

**Check yourself:**
- [ ] What are the four app types, and how do you test each?
- [ ] What three things must every device matrix include?
- [ ] When is an emulator enough, and when do you need a real device?

### Milestone 2: Mobile-web emulation {#milestone-2}

**Learn:** [Mobile web emulation](/cheatsheets/mobile-testing#mobile-web) ·
[Touch vs mouse](/cheatsheets/mobile-testing#touch) ·
[Orientation & viewport](/cheatsheets/mobile-testing#orientation) ·
Quick Reference: [Playwright emulation](/docs/fundamentals/mobile-testing/mobile-testing-quick-reference#playwright)

**Do:** [Playwright mobile-web tests](/docs/learning-path/mobile-testing/milestones-and-mini-projects#milestone-2)

**Then read:** [Best Practices](/docs/fundamentals/mobile-testing/best-practices), sections 1–2, 5.

**Check yourself:**
- [ ] What does `tap()` do that `click()` doesn't?
- [ ] Why is a hover-only menu a mobile bug?
- [ ] How do you emulate a rotation?

### Milestone 3: The manual mobile layer {#milestone-3}

**Learn:** [Interruptions](/cheatsheets/mobile-testing#interruptions) ·
[Permissions](/cheatsheets/mobile-testing#permissions) ·
[Network conditions](/cheatsheets/mobile-testing#network) ·
[Common mistakes](/cheatsheets/mobile-testing#gotchas)

**Do:** [Manual mobile pass](/docs/learning-path/mobile-testing/milestones-and-mini-projects#milestone-3)

**Then read:** [Best Practices](/docs/fundamentals/mobile-testing/best-practices), sections 3–4, 6.

**Check yourself:**
- [ ] Name four interruptions an app must survive.
- [ ] What are the four permission states to test?
- [ ] Why test the offline→online sync path?

### Milestone 4: Drive a device {#milestone-4}

**Learn:** [adb & simctl](/cheatsheets/mobile-testing#adb) ·
Quick Reference: [adb](/docs/fundamentals/mobile-testing/mobile-testing-quick-reference#adb),
[simctl](/docs/fundamentals/mobile-testing/mobile-testing-quick-reference#simctl),
[Network & permissions](/docs/fundamentals/mobile-testing/mobile-testing-quick-reference#conditions)

**Do:** [Command-line device control](/docs/learning-path/mobile-testing/milestones-and-mini-projects#milestone-4)

**Check yourself:**
- [ ] How do you grant and revoke a permission from the command line?
- [ ] How do you fire a deep link on Android and iOS?
- [ ] How do you simulate low battery or airplane mode?

### Milestone 5: Appium native automation {#milestone-5}

**Learn:** [Appium set-up](/cheatsheets/mobile-testing#appium) ·
[Capabilities](/cheatsheets/mobile-testing#capabilities) ·
[Locators & the page object](/cheatsheets/mobile-testing#locators) ·
[Gestures](/cheatsheets/mobile-testing#gestures) ·
the [Appium guide](/docs/sdet-skills/appium/appium-guide)

**Do:** [Automate a native flow](/docs/learning-path/mobile-testing/milestones-and-mini-projects#milestone-5)

**Then read:** [Best Practices](/docs/fundamentals/mobile-testing/best-practices), section 7.

**Check yourself:**
- [ ] Which locator strategy is best on mobile, and why?
- [ ] How do capabilities relate to Playwright projects?
- [ ] How do you background the app to test an interruption?

### Milestone 6: Cloud, performance & report {#milestone-6}

**Learn:** [Performance](/cheatsheets/mobile-testing#performance) ·
[App-store readiness](/cheatsheets/mobile-testing#store) ·
Quick Reference: [Store readiness](/docs/fundamentals/mobile-testing/mobile-testing-quick-reference#store)

**Do:** [Cloud run + report](/docs/learning-path/mobile-testing/milestones-and-mini-projects#milestone-6)

**Then read:** [Best Practices](/docs/fundamentals/mobile-testing/best-practices), sections 8–10.

**Check yourself:**
- [ ] Why measure performance on a low-end device?
- [ ] Name three things that get an app rejected from a store.
- [ ] What goes in a mobile test report?

## When you get stuck {#stuck}

| Problem | What to do |
|---|---|
| No Android SDK / Xcode | Do the mobile-web milestones now; use a device-cloud free trial for native |
| Emulator won't start | Enable virtualization; try a smaller system image; or use a real device over USB |
| `adb devices` shows nothing | Enable USB debugging on the phone; accept the trust prompt; check the cable |
| Appium can't find an element | Use Appium Inspector to read the tree; ask devs for accessibility ids |
| A test passes on Chromium but hangs on WebKit | Engine differences are real — test the mobile browsers your users have |

## What's next {#next}

- Native automation depth: [Appium guide](/docs/sdet-skills/appium/appium-guide).
- Mobile accessibility: [accessibility cheat sheet](/cheatsheets/accessibility-testing).
- Mobile app security: [security cheat sheet](/cheatsheets/security-testing) (OWASP MASVS/MASTG).
- Certification: ISTQB **Mobile Application Testing (CT-MAT)**.

**Good resources:** the [Appium docs](https://appium.io/docs/), the OWASP
**MASTG** (Mobile Application Security Testing Guide), and your device cloud's
own documentation.
