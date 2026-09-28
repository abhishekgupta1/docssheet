---
title: "AI & LLM Testing Best Practices"
description: "Habits that make AI feature testing trustworthy — evaluate not assert, build golden and attack sets with experts, test meaning not text, pin versions and run regression, calibrate judges, enforce agent limits in code, watch cost and data handling, keep humans accountable, and a pre-release checklist."
sidebar_position: 2
level: advanced
tags: [ai-testing, llm, evaluation, fundamentals, best-practices]
---

# AI & LLM Testing Best Practices

This page lists good habits for testing AI and LLM features. They help you
measure real quality (not a single lucky answer), catch the failures that
matter — wrong facts, leaks, unsafe actions — and keep confidence as models and
prompts change. They apply to SDETs, ML engineers and product teams.

Each practice has:
- **Do** – the good way.
- **Why** – the reason in simple words.

:::tip How to use this page
Read it once after Part 2 of the [AI/LLM testing cheat sheet](/cheatsheets/ai-llm-testing),
then use [the checklist at the end](#11-checklist-before-release) before shipping an AI feature.
:::

---

## Contents

1. [Evaluate, Don't Assert Once](#1-evaluate-dont-assert-once)
2. [Build the Dataset With Experts](#2-build-the-dataset-with-experts)
3. [Test Meaning, Not Exact Text](#3-test-meaning-not-exact-text)
4. [Make Injection Testing Standard](#4-make-injection-testing-standard)
5. [Pin Versions and Run Regression](#5-pin-versions-and-run-regression)
6. [Calibrate Your Judges](#6-calibrate-your-judges)
7. [Enforce Agent Limits in Code](#7-enforce-agent-limits-in-code)
8. [Watch Cost, Latency and Data](#8-watch-cost-latency-and-data)
9. [Keep Humans Accountable](#9-keep-humans-accountable)
10. [Test the Non-AI Parts Too](#10-test-the-non-ai-parts-too)
11. [Checklist Before Release](#11-checklist-before-release)

---

## 1. Evaluate, Don't Assert Once

**In short:** one green run proves nothing about a system that varies.

- **Do** run a dataset of cases and report rates per category, with thresholds.
  **Why:** "94% of golden answers correct, 100% injection resistance" is a
  quality signal; a single passing test isn't.
- **Do** run each case several times.
  **Why:** the same prompt can pass once and fail the next time.
- **Do** set a threshold per category, not one overall number.
  **Why:** injection must be 100%; a 90% "overall" score can hide total failure on safety.

---

## 2. Build the Dataset With Experts

**In short:** your eval is only as good as its cases.

- **Do** write golden cases with people who know the domain (support, legal, medical).
  **Why:** only they know the *right* answer and the dangerous wrong ones.
- **Do** store must-include and must-not-include **facts**, not just questions.
  **Why:** the must-not list is your hallucination guard.
- **Do** grow the set from real usage: every complaint and odd answer becomes a case.
  **Why:** the dataset comes to represent what users actually ask.
- **Do** cover edge cases: empty, very long, other languages, ambiguous, adversarial.
  **Why:** that's where models fail.

---

## 3. Test Meaning, Not Exact Text

**In short:** correct answers can be worded many ways; wrong ones can be worded like right ones.

- **Do** check for required facts, or compare by meaning (embeddings / a judge).
  **Why:** `== "expected string"` fails on a correct paraphrase and passes on a confident lie with the right words.
- **Do** use `must_not_include` for the specific wrong facts you fear.
  **Why:** it catches hallucinations precisely.
- **Do** validate structured output by parsing and schema, not string match.
  **Why:** models add stray prose around JSON; parse it.

---

## 4. Make Injection Testing Standard

**In short:** every AI feature that takes user input (or reads documents) needs an attack set.

- **Do** keep a red-team set of injection and jailbreak prompts; run it every build.
  **Why:** prompt injection is the #1 LLM risk and it regresses easily.
- **Do** test **indirect** injection: hide instructions in a document/email/page the AI reads.
  **Why:** it's the attack teams forget, and RAG systems are exposed to it.
- **Do** check two things per attack: the secret/instructions don't leak, and the model doesn't **act** on the injection.
  **Why:** a refusal that still performs the injected action is a fail.
- **Do** treat model output as untrusted when it's rendered or executed (XSS, SQL).
  **Why:** LLM05 — output handling is where injection becomes a normal web vuln.

---

## 5. Pin Versions and Run Regression

**In short:** AI behaviour changes when the model, prompt or data changes — even with no code change.

- **Do** pin the exact model version, not "latest".
  **Why:** a silent model update can change every answer.
- **Do** re-run the full eval set on every model, prompt or knowledge-base change.
  **Why:** that's the only thing that changed, and it changed behaviour.
- **Do** compare per-category scores against the last release.
  **Why:** a new model can improve overall while getting worse where it matters.

---

## 6. Calibrate Your Judges

**In short:** an LLM judge is useful but not automatically right.

- **Do** give the judge a clear rubric, a small scale, and ask for a reason.
  **Why:** vague rubrics give inconsistent scores.
- **Do** check the judge against human grades on a sample before trusting it.
  **Why:** an uncalibrated judge can be confidently wrong, like any model.
- **Do** use a different or stronger model as the judge where possible.
  **Why:** a model judging itself is biased toward its own style.
- **Don't** let a judge be the only gate on high-stakes answers.
  **Why:** medical/legal/financial answers need human review.

---

## 7. Enforce Agent Limits in Code

**In short:** a prompt can be talked around; code can't.

- **Do** enforce hard limits in the tool implementation (refund ≤ order total, allowed actions).
  **Why:** "never refund more than the total" in the prompt is a suggestion, not a guarantee (LLM06).
- **Do** require confirmation for destructive actions.
  **Why:** an agent shouldn't delete or email on a misread instruction.
- **Do** give agents least privilege — only the tools the task needs.
  **Why:** limits the damage of any single mistake or injection.
- **Do** test tool-error handling and termination.
  **Why:** agents loop or crash when a tool fails unexpectedly.

---

## 8. Watch Cost, Latency and Data

**In short:** "works" for an AI feature includes fast enough, cheap enough, and private.

- **Do** measure latency (p95/p99) and cost per request in tests.
  **Why:** a correct answer that takes 30 s or costs a fortune isn't shippable.
- **Do** test caps and timeouts against huge prompts and loops (LLM10).
  **Why:** unbounded consumption is a real denial-of-wallet risk.
- **Do** agree what data may be sent to which model/eval tool; mask personal data.
  **Why:** prompts and eval runs can leak customer data to third parties.

---

## 9. Keep Humans Accountable

**In short:** AI assists; people decide.

- **Do** have a named human sign off tests, releases and any AI-drafted work.
  **Why:** accountability can't be delegated to a model.
- **Do** review AI-written test code and cases like any pull request.
  **Why:** AI produces plausible-but-wrong tests too.
- **Do** measure whether AI assistance actually helps (time saved, escaped bugs).
  **Why:** keep what works, drop what doesn't — don't adopt on faith.

---

## 10. Test the Non-AI Parts Too

**In short:** an AI feature is still software.

- **Do** test the surrounding functional, integration, security and accessibility behaviour.
  **Why:** the bug is often in the plumbing, not the model.
- **Do** test fallbacks: model down, slow, or returns garbage.
  **Why:** the feature must degrade gracefully, not crash.

---

## 11. Checklist Before Release

- [ ] Golden dataset (built with experts) passes its accuracy threshold
- [ ] Hallucination guards (must-not-include) in place and passing
- [ ] Injection/red-team set at 100%, including indirect injection
- [ ] Structured output parsed and schema-validated
- [ ] Each case run multiple times; results stable enough
- [ ] Model version pinned; full eval re-run after the latest change
- [ ] RAG (if any): retrieval, groundedness, citations, "unknown" handling, permissions
- [ ] Agents (if any): tool correctness, hard limits in code, confirmation, termination
- [ ] Latency and cost within budget; caps/timeouts tested
- [ ] Data-handling agreed; personal data masked in prompts and eval runs
- [ ] Judges calibrated against humans; high-stakes answers human-reviewed
- [ ] Fallback behaviour tested; a human signed off

**Need more detail?** [Cheat sheet](/cheatsheets/ai-llm-testing) ·
[Quick reference](/docs/fundamentals/ai-llm-testing/ai-llm-testing-quick-reference) ·
Full guide
