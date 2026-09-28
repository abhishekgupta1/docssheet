---
title: "AI & LLM Testing Learning Path: Start Here"
description: "How to learn AI and LLM testing in six milestones — build an evaluation harness, test accuracy and hallucination, prompt injection and safety, structured output and promptfoo, RAG and agents, and a full evaluation report — runnable offline."
sidebar_position: 1
level: intermediate
tags: [ai-testing, llm, evaluation, learning-path]
---

# AI & LLM Testing Learning Path: Start Here

**In short:** you learn AI testing in **6 milestones** by building one
**evaluation harness** for a support bot and growing it — golden answers,
attack prompts, structured-output checks, RAG and agent tests. It runs
**without an API key** (the "model" is a stand-in), so you can swap in a real
model whenever you like.

:::tip How to use this page
Read this page once to see the plan. Then, for each milestone, follow the same
four steps: **learn → build → check → commit**. Come back here whenever you're
unsure what to do next.
:::

## Before you start {#before}

- Python 3.10+ (for pytest); Node.js 20+ from Milestone 3 (for promptfoo).
- Basic Python: functions, dicts, `assert`.
- The [lab](/cheatsheets/ai-llm-testing#lab) — `evals/bot.py` and friends.
- Optional, for real-model milestones: an API key for Anthropic or OpenAI.
- Helpful: the [API testing cheat sheet](/cheatsheets/api-testing) if you'll call a model's API.

## The pages in this learning path {#pages}

| Page | What it's for | When to open it |
|---|---|---|
| **This roadmap** | The plan and self-checks | At the start of each milestone |
| [AI/LLM testing cheat sheet](/cheatsheets/ai-llm-testing) | Learn each idea, with runnable code | The "learn" step |
| [Milestones & Mini-Projects](/docs/learning-path/ai-llm-testing/milestones-and-mini-projects) | Tasks, expected results, solutions | The "build" and "check" steps |
| [Quick Reference](/docs/fundamentals/ai-llm-testing/ai-llm-testing-quick-reference) | Assertions, OWASP LLM Top 10, metrics, attacks, tools | Any time |
| [Best Practices](/docs/fundamentals/ai-llm-testing/best-practices) | Habits that make evals trustworthy | After Milestone 2, then before shipping |
| AI product & LLM testing guide | The service and AI-augmented QA | For the deeper "why" |

## The milestones {#milestones}

| Milestone | You learn | You build | Rough time |
|---|---|---|---|
| [1](#milestone-1) | Why AI differs, golden datasets, the harness | Accuracy tests | 1 week |
| [2](#milestone-2) | Hallucination, prompt injection, OWASP LLM Top 10 | An attack set | 1–2 weeks |
| [3](#milestone-3) | Structured output, determinism, promptfoo | Config-based evals | 1 week |
| [4](#milestone-4) | RAG: retrieval, groundedness, citations | RAG tests | 1–2 weeks |
| [5](#milestone-5) | Agents, tool limits, LLM-as-judge | Agent + judge tests | 1–2 weeks |
| [6](#milestone-6) | Regression, cost, an evaluation report | A CI eval and report | 1 week |

Times assume about 5 hours a week.

**For each milestone:** learn (cheat-sheet sections) → build (the tasks) →
check (run the tests / solution) → commit.

### Milestone 1: The harness {#milestone-1}

**Learn:** [Why AI testing is different](/cheatsheets/ai-llm-testing#why-different) ·
[What to test](/cheatsheets/ai-llm-testing#what-to-test) ·
[Evaluation, not pass/fail](/cheatsheets/ai-llm-testing#evaluation) ·
[Golden datasets](/cheatsheets/ai-llm-testing#golden) ·
[Metrics](/cheatsheets/ai-llm-testing#metrics) ·
[The harness](/cheatsheets/ai-llm-testing#harness)

**Build:** [Accuracy tests](/docs/learning-path/ai-llm-testing/milestones-and-mini-projects#milestone-1)

**Check yourself:**
- [ ] Why can't you assert `output == expected` for an LLM?
- [ ] Why store facts instead of exact strings in the golden set?
- [ ] What does the `must_not_include` list protect against?

### Milestone 2: Attacks & safety {#milestone-2}

**Learn:** [Accuracy & hallucination](/cheatsheets/ai-llm-testing#hallucination) ·
[Prompt injection & the OWASP LLM Top 10](/cheatsheets/ai-llm-testing#injection) ·
Quick Reference: [Attack prompts](/docs/fundamentals/ai-llm-testing/ai-llm-testing-quick-reference#attacks),
[OWASP LLM Top 10](/docs/fundamentals/ai-llm-testing/ai-llm-testing-quick-reference#owasp-llm)

**Build:** [An attack set](/docs/learning-path/ai-llm-testing/milestones-and-mini-projects#milestone-2)

**Then read:** [Best Practices](/docs/fundamentals/ai-llm-testing/best-practices), sections 1–4.

**Check yourself:**
- [ ] What two things must you check for each attack prompt?
- [ ] What is indirect prompt injection?
- [ ] Why is injection resistance a 100% threshold, not 95%?

### Milestone 3: Output & promptfoo {#milestone-3}

**Learn:** [Structured output](/cheatsheets/ai-llm-testing#structured) ·
[Determinism & temperature](/cheatsheets/ai-llm-testing#determinism) ·
[promptfoo](/cheatsheets/ai-llm-testing#promptfoo) ·
Quick Reference: [promptfoo](/docs/fundamentals/ai-llm-testing/ai-llm-testing-quick-reference#promptfoo)

**Build:** [Config-based evals](/docs/learning-path/ai-llm-testing/milestones-and-mini-projects#milestone-3)

**Check yourself:**
- [ ] How do you check JSON output properly?
- [ ] Why run each case several times with a real model?
- [ ] When would you choose promptfoo over pytest?

### Milestone 4: RAG {#milestone-4}

**Learn:** [RAG testing](/cheatsheets/ai-llm-testing#rag) ·
Quick Reference: [RAG](/docs/fundamentals/ai-llm-testing/ai-llm-testing-quick-reference#rag)

**Build:** [RAG tests](/docs/learning-path/ai-llm-testing/milestones-and-mini-projects#milestone-4)

**Check yourself:**
- [ ] Why test retrieval and the answer separately?
- [ ] What is groundedness?
- [ ] What should a RAG bot do when no document matches?

### Milestone 5: Agents & judges {#milestone-5}

**Learn:** [Agents & tool use](/cheatsheets/ai-llm-testing#agents) ·
[LLM-as-a-judge](/cheatsheets/ai-llm-testing#judge) ·
Quick Reference: [Agents](/docs/fundamentals/ai-llm-testing/ai-llm-testing-quick-reference#agents),
[Judge rubric](/docs/fundamentals/ai-llm-testing/ai-llm-testing-quick-reference#judge)

**Build:** [Agent + judge tests](/docs/learning-path/ai-llm-testing/milestones-and-mini-projects#milestone-5)

**Then read:** [Best Practices](/docs/fundamentals/ai-llm-testing/best-practices), sections 6–7.

**Check yourself:**
- [ ] Why enforce agent limits in code, not the prompt?
- [ ] How do you calibrate an LLM judge?
- [ ] When must a human review, not a judge?

### Milestone 6: Regression, cost & report {#milestone-6}

**Learn:** [Regression after changes](/cheatsheets/ai-llm-testing#regression) ·
[Cost & latency](/cheatsheets/ai-llm-testing#cost) ·
[Bias & safety](/cheatsheets/ai-llm-testing#bias) ·
[AI-augmented QA](/cheatsheets/ai-llm-testing#ai-augmented)

**Build:** [A CI eval and report](/docs/learning-path/ai-llm-testing/milestones-and-mini-projects#milestone-6)

**Then read:** [Best Practices](/docs/fundamentals/ai-llm-testing/best-practices), sections 5, 8–11.

**Check yourself:**
- [ ] Why pin the model version?
- [ ] How can a new model improve overall but still be a regression?
- [ ] What belongs in an evaluation report?

## When you get stuck {#stuck}

| Problem | What to do |
|---|---|
| Tests pass but feel too easy | The stand-in bot is deterministic and careful by design — swap in a real model to see failures |
| A real model's answers vary | Test facts/meaning, not exact text; run each case several times |
| No API key | Everything here runs on the stand-in; add a key only for the real-model tasks |
| promptfoo can't find the provider | Use `python:provider.py` with the path relative to the config file |
| Judge disagrees with you | Tighten the rubric; calibrate on more human-graded samples |

## What's next {#next}

- Security of AI features: [security cheat sheet](/cheatsheets/security-testing#api-cloud) and OWASP LLM Top 10.
- Load-test AI endpoints: [performance cheat sheet](/cheatsheets/performance-testing).
- Build with models: the [Claude cheat sheet](/docs/ai-skills/claude/claude-cheatsheet) and [MCP & AI agents guide](/docs/sre-skills/mcp-ai-agents/mcp-ai-agents-guide).
- Certifications: ISTQB **CT-AI** (AI Testing) and **CT-GenAI** (Testing with Generative AI).

**Good resources:** OWASP [Top 10 for LLM Applications](https://genai.owasp.org/),
the [promptfoo docs](https://www.promptfoo.dev/docs/), and Anthropic's and OpenAI's
own guides on evaluating models.
