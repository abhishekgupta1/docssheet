---
title: "Mobile Testing Best Practices"
description: "Habits that make mobile testing effective — choose devices from data, test on real hardware, cover interruptions and permissions, test updates not just installs, prefer accessibility ids, handle flaky networks, automate the stable core, watch performance on low-end devices, and pre-release and store checklists."
sidebar_position: 2
level: intermediate
tags: [mobile-testing, appium, fundamentals, best-practices]
---

# Mobile Testing Best Practices

This page lists good habits for testing mobile apps. They help you cover the
device and OS variety that matters, catch the interruptions and network issues
users hit, and keep automation stable across two platforms. They apply to
manual testers, SDETs and mobile developers.

Each practice has:
- **Do** – the good way.
- **Why** – the reason in simple words.

:::tip How to use this page
Read it once after Part 2 of the [mobile testing cheat sheet](/cheatsheets/mobile-testing),
then use [the checklist at the end](#10-pre-release-checklist) before each release.
:::

---

## Contents

1. [Choose Devices From Data](#1-choose-devices-from-data)
2. [Test on Real Hardware Too](#2-test-on-real-hardware-too)
3. [Cover Interruptions and Permissions](#3-cover-interruptions-and-permissions)
4. [Test Updates, Not Just Installs](#4-test-updates-not-just-installs)
5. [Design for Touch](#5-design-for-touch)
6. [Handle Flaky Networks](#6-handle-flaky-networks)
7. [Automate the Stable Core](#7-automate-the-stable-core)
8. [Watch Performance on Low-End Devices](#8-watch-performance-on-low-end-devices)
9. [Accessibility on Mobile](#9-accessibility-on-mobile)
10. [Pre-Release Checklist](#10-pre-release-checklist)

---

## 1. Choose Devices From Data

**In short:** test the devices your users actually have, not the ones you own.

- **Do** build the device matrix from analytics: model, OS version, screen size share.
  **Why:** the newest iPhone in the office may be 2% of your users.
- **Do** always include the **oldest OS** you support and one **low-end** Android.
  **Why:** that's where layout and performance bugs surface.
- **Do** re-check the matrix each release cycle.
  **Why:** OS adoption and device share shift constantly.

---

## 2. Test on Real Hardware Too

**In short:** emulators are for speed; real devices are for truth.

- **Do** use emulators/simulators for functional and layout testing and CI.
  **Why:** fast, free, parallelisable.
- **Do** use real devices for performance, camera, GPS, biometrics, gestures and final sign-off.
  **Why:** emulators don't reproduce real speed, sensors or "feel".
- **Do** use a device cloud for the long tail of models.
  **Why:** you can't own every device; clouds cover them per minute.

---

## 3. Cover Interruptions and Permissions

**In short:** the OS interrupting the app is where mobile-specific bugs live.

- **Do** test calls, notifications, app-switching, lock/unlock and OS-kill mid-flow.
  **Why:** apps that don't save and restore state lose users' work.
- **Do** test every permission in all states: grant, deny, ask-later, revoke-after-grant.
  **Why:** a denied camera permission should explain, not crash.
- **Do** test push notifications received, tapped (opens the right screen), and while the app is killed.
  **Why:** deep-link and notification routing bugs are common and visible.

---

## 4. Test Updates, Not Just Installs

**In short:** most users **update** the app; that path breaks in ways a fresh install doesn't.

- **Do** install the **live store version**, then update to the new build, and check data survives.
  **Why:** schema/migration bugs only appear on upgrade, not on a clean install.
- **Do** test updating from a few versions back, not just the previous one.
  **Why:** users skip versions; migrations must chain.
- **Do** check there's no forced logout or data loss after update.
  **Why:** it's one of the fastest ways to lose users.

---

## 5. Design for Touch

**In short:** touch has no hover and fat fingers — test accordingly.

- **Do** ensure everything works by tap; nothing hides behind hover.
  **Why:** hover-only menus and buttons are unreachable on phones.
- **Do** check target sizes (≥ 24×24, ideally 44×44 CSS px) and spacing.
  **Why:** small targets cause mis-taps, especially one-handed.
- **Do** test gestures **and** provide alternatives (swipe-to-delete also has a button).
  **Why:** accessibility (WCAG 2.5.1) and discoverability.
- **Do** confirm destructive swipe actions before acting.
  **Why:** an accidental swipe shouldn't delete data.

---

## 6. Handle Flaky Networks

**In short:** mobile networks drop, slow and switch — test those, not just full Wi-Fi.

- **Do** test slow networks, Wi-Fi↔cellular switches, airplane mode and offline→sync.
  **Why:** users are on trains, in lifts, on hotel Wi-Fi.
- **Do** check loading states, timeouts, retries and no duplicate submits.
  **Why:** a tap that seems to do nothing gets tapped again — and double-orders.
- **Do** test the offline queue: actions taken offline sync once, without duplicates.
  **Why:** sync bugs corrupt data.

---

## 7. Automate the Stable Core

**In short:** automate the repetitive, stable journeys; keep judgement and hardware testing manual.

- **Do** automate smoke and regression of core flows with Appium (or native frameworks) across iOS and Android.
  **Why:** the same journeys run every release on both platforms.
- **Do** prefer **accessibility ids** as locators; ask developers to add them.
  **Why:** stable across platforms and translations, and they help real users.
- **Do** use the page/screen-object pattern and run on a device cloud in CI.
  **Why:** maintainable tests, wide coverage, fast feedback.
- **Don't** try to automate every interruption and hardware case.
  **Why:** some things are faster and more reliable to check by hand on a real device.

---

## 8. Watch Performance on Low-End Devices

**In short:** measure where problems appear first — the cheap, old phone.

- **Do** measure cold-start time, memory, jank and battery on a low-end device.
  **Why:** a flagship hides what a budget phone reveals.
- **Do** watch app size.
  **Why:** large apps get fewer installs and updates, especially on limited data plans.
- **Do** compare against a baseline each release.
  **Why:** performance regresses gradually; trends catch it.

---

## 9. Accessibility on Mobile

**In short:** test with the built-in screen readers and large text.

- **Do** complete key journeys with VoiceOver (iOS) and TalkBack (Android).
  **Why:** it's a legal and ethical requirement, and it finds real bugs.
- **Do** test large font / display size settings.
  **Why:** layouts often break when text scales up.
- **Do** ensure the accessibility ids you use for tests also give good labels.
  **Why:** one attribute serves testing and accessibility.

See the [accessibility cheat sheet](/cheatsheets/accessibility-testing).

---

## 10. Pre-Release Checklist

- [ ] Device matrix from current data; oldest OS and a low-end device included
- [ ] Core journeys automated and green on iOS and Android
- [ ] Manual pass on real devices for performance, sensors and "feel"
- [ ] Interruptions and all permission states tested
- [ ] **Update** from the live store version tested; data preserved
- [ ] Networks: slow, switching, offline→sync
- [ ] Orientation and large-font layouts checked
- [ ] Push notifications and deep links route correctly
- [ ] Performance measured on a low-end device vs baseline
- [ ] VoiceOver/TalkBack pass on key journeys
- [ ] Store-readiness checklist complete (iOS review + Play policy)

**Need more detail?** [Cheat sheet](/cheatsheets/mobile-testing) ·
[Quick reference](/docs/fundamentals/mobile-testing/mobile-testing-quick-reference) ·
[Appium guide](/docs/sdet-skills/appium/appium-guide)
