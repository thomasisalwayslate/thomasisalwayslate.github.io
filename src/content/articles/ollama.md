---
title: "I lost to GhidraMCP on cost. Then I tested again."
description: "Two modified Ollama builds. A first-round loss, then 5.6% lower cost than GhidraMCP with similar median times."
author: "thomasisalwayslate"
status: "published"
sharedArticle: true
cover: "/assets/research/ollama/cost-rounds.svg"
published: "2026-10-20"
versionNote: "Measured on EAOS 0.1.4, 19 October 2026, and 0.1.5, 20 October 2026."
articleType: "benchmark"
projectUrl: "https://github.com/thomasisalwayslate/every-app-is-open-source"
---

# I lost to GhidraMCP on cost. Then I tested again.

*Two Ollama rounds. The loss kept. A smaller bill the second time.*

> Measured on EAOS **0.1.4, 19 October 2026**, and **0.1.5, 20 October 2026**. Results for every version: [BENCHMARKS.md](https://github.com/thomasisalwayslate/every-app-is-open-source/blob/main/BENCHMARKS.md). Current version: [![Current version on PyPI](https://img.shields.io/pypi/v/every-app-is-open-source?style=flat-square&color=121212&label=eaos)](https://pypi.org/project/every-app-is-open-source/)

My reverse-engineering tool did well on Doom. Then I gave it Ollama, a bigger program written in Go, and it lost to the free community alternative on cost and speed.

I kept the loss, read the logs and changed how my tool answers inspection requests. Then I released **Every App Is Open Source 0.1.5**, or EAOS, and tested again with a newly modified Ollama build. This time it cost less than both alternatives, with similar median times.

<aside class="results-at-a-glance" aria-label="Results at a glance">

## Results at a glance

**Ollama, round 2:** six questions, three fresh sessions per tool. The exact-match scores are explained [below](#round-2).

| Tool | Exact cases | Median time | Tokens, 3 runs | API-equivalent cost, 3 runs |
|---|---:|---:|---:|---:|
| **EAOS 0.1.5** | **195/195** | **376.8s** | **7,475,587** | **$2.2770** |
| GhidraMCP 2.0.0 | 191/195 | 372.0s | 8,112,595 | $2.4120 |
| REA 6.7.0 + skill | 189/195 | 385.9s | 11,564,471 | $3.0191 |

**Ollama, round 1:** EAOS cost 27.8% more than GhidraMCP and took 23.4% longer.

**Modified Doom:** EAOS cost 36% less than REA and 16% less than GhidraMCP, with all three answering correctly.

</aside>

<figure>

![Cost across three runs per tool: in round 1 EAOS cost $3.10, GhidraMCP $2.43 and REA $3.59; in round 2 EAOS cost $2.28, GhidraMCP $2.41 and REA $3.02.](/assets/research/ollama/cost-rounds.svg)

<figcaption>API-equivalent cost across three full runs per tool, with cached input discounted. Lower is cheaper. The builds and inputs differ between rounds; this is a retest, not an isolated measurement of one code change.</figcaption>
</figure>

## Why Ollama?

[REA](https://github.com/morluto/rea), short for Reverse Engineer Anything, EAOS and [LaurieWired's GhidraMCP](https://github.com/LaurieWired/GhidraMCP) connect an AI agent to Ghidra. Ghidra turns machine instructions into rough, readable code. The agent searches, follows references and explains what the program does.

The question after Doom was whether my small-answer approach would hold up on something larger. Ollama's Apple Silicon command-line program and server gave me about 25 MB of compiled Go to investigate.

Its source is public. An agent might remember the defaults instead of finding them. So I privately changed request limits, runner aliases, host rules and configuration defaults before compiling. The answer key came from running each modified build twice. Both executions agreed; in each build, **41 of 65 cases differed from unmodified Ollama**.

One question followed a browser permission-check request, called a **preflight**, through two filters. It could finish before the host check, while an ordinary GET request continued and was rejected. Finding one string wasn't enough. The order mattered.

## Fair setup

Each round used six questions, 65 cases and **three fresh sessions per tool**, all on **gpt-6.1-sol at high effort**. I locked the questions, test inputs and execution-derived answer key before any session. Round 2 used new hidden values and inputs, matched to the same task families and case counts.

EAOS used its released package. REA kept its normally installed skill and all 207 tools. GhidraMCP kept its 28 stock tools. Nobody received source, the key, code addresses or permission to run the target. Every tool had initial Ghidra analysis completed before timing; order rotated across repetitions.

The tasks covered request and configuration behavior. They didn't involve downloading weights or running a model inside Ollama.

## Round 1

| Tool | Exact cases | Median time | API-equivalent cost, 3 runs |
|---|---:|---:|---:|
| EAOS 0.1.4 | 195/195 | 312.9s | $3.1003 |
| GhidraMCP | 192/195 | 253.6s | $2.4258 |
| REA + skill | 195/195 | 375.5s | $3.5901 |

GhidraMCP was fastest and cheapest. In its final session it predicted HTTP 400 for an empty-model request that returned 404, and shortened two error messages. Its other sessions matched the key. EAOS cost less than REA, but the community tool beat mine on both cost and speed.

The logs showed agents reading enormous Go functions, page after page. EAOS was making the model read too much to find the few lines it needed.

## Smaller answers

For **0.1.5**, I added outlines for large functions, focused slices, searches within a function and bounded pages. Instead of reading everything, an agent could ask where a particular value or call appeared and retrieve nearby lines. EAOS still had seven tools.

I checked historical requests locally. A diagnostic session on the old questions exposed more workflow problems; it isn't comparison evidence. The changes shipped before the fresh round. Its new questions weren't designed around the new inspection features.

That distinction matters: both the tool and the test build changed. The next result shows how they performed together; it cannot tell me how much of the difference came from the inspection changes alone.

## Round 2

The table at the top shows the fresh comparison. EAOS used **7.9% fewer tokens** and cost **5.6% less than GhidraMCP**. Against REA, it used **35.4% fewer tokens** and cost **24.6% less**.

**EAOS was the only tool with every scored case exactly right in both Ollama rounds: 195/195 in each.** Those are 65 cases repeated three times, not 195 independent problems.

**The round-2 misses were formatting differences.** GhidraMCP reordered the same header names in four cases. REA did that in four cases and omitted the quoted input suffix from two error strings. Every HTTP status prediction in this round matched. The locked scorer required header-list order and complete error text, so the misses remain. They don't establish that EAOS understands HTTP behavior better.

**Similar median times; no clear speed advantage.** EAOS took 376.8 seconds against GhidraMCP's 372.0, a 1.3% difference. Against REA it was 2.4% shorter. Three repetitions don't establish a statistical tie, and EAOS's own times ranged from 319.9 to 462.7 seconds.

## What went wrong

EAOS initially couldn't find five Go strings or three function names, although it could decompile at supplied addresses. The [0.1.4 Go-support fix and checks](https://github.com/thomasisalwayslate/every-app-is-open-source/pull/12) made those same checks work through discovery, without supplied addresses.

**My first full attempt stopped because the questions omitted hostname and local-interface conditions.** I added the same clarification sentence for all three tools and ran nine fresh sessions. **The binary and answer key didn't change.** The stopped runs remain outside the round-1 table. A separate GhidraMCP prediction of an extra response header is preserved in the report too.

**EAOS also gave a wrong explanation.** One session called an IP acceptance branch a link-local-unicast check. The inspected code actually used `IsUnspecified`, meaning a zero or unspecified address. No scored case distinguished those conditions. Its predictions passed; that explanation was wrong.

Tool errors, rejected arguments and a mistyped REA evidence reference also remain in the record, including their time and cost.

## Limits

This is one source-built Go program, two modified builds and three repetitions per tool. It tests neither a graphical app nor Ollama's model inference. The results don't establish broad accuracy or speed superiority. Detailed transcripts, source, binaries and keys remain private, which limits independent reproduction. Both rounds, including the loss, stay in [the benchmark record](https://github.com/thomasisalwayslate/every-app-is-open-source/blob/main/BENCHMARKS.md).

## Try it

[Every App Is Open Source is on GitHub](https://github.com/thomasisalwayslate/every-app-is-open-source). On Apple Silicon macOS, with [uv](https://docs.astral.sh/uv/) and Apple's Command Line Tools installed, this sets up the measured version:

```sh
uvx --python 3.13 --from 'every-app-is-open-source==0.1.5' eaos setup
```

Start with the [Doom comparison](https://thomasisalwayslate.github.io/research/same-answers-lower-cost/) for the original test. This Ollama retest is what happened when the easy win didn't carry over.

## Method notes

Ghidra stayed at 12.1.4. Ordinary Go symbols and debug information were stripped; embedded runtime function metadata remained. EAOS and GhidraMCP loaded clean copies of the same default-analyzed database; REA performed its own stock analysis. REA retained byte search, code-reference lookup and Go metadata, and reading its skill counted toward usage. No question-specific decompilation was prewarmed.

Cost uses the same normalized short-context API-equivalent rates in both rounds, including discounted cached input. It isn't a subscription bill. Initial analysis and backend shutdown are excluded from agent time. Each pilot used one question and is excluded from the full-run tables, although prior task exposure remains a limitation. Interface restrictions were audited; they weren't an operating-system sandbox.

Round 2 retained an EAOS read failure for a memory region initialized to zeros when the program loads, two calculator errors and five rejected arguments. One session still requested 54 full-output pages. REA's first answer mistyped an evidence ID despite having retrieved the corresponding evidence. All run summaries, accounting assumptions and retained failures are detailed in [BENCHMARKS.md](https://github.com/thomasisalwayslate/every-app-is-open-source/blob/main/BENCHMARKS.md#modified-ollama-round-2).
