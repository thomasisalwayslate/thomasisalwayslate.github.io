---
title: "I beat a 300,000-star GitHub repo with 7 tools and a hacked copy of Doom"
description: "On modified Doom: same answers as REA, 52% fewer tokens, 36% cheaper and 27% faster."
author: "thomasisalwayslate"
status: "published"
---

# I beat a 300,000-star GitHub repo with 7 tools and a hacked copy of Doom

*On modified Doom: same answers as REA, 52% fewer tokens, 36% cheaper and 27% faster.*

[REA](https://github.com/morluto/rea), short for Reverse Engineer Anything, has more than 300,000 stars on GitHub. The pitch is great: give your AI agent an app, and it works out how the app is built. I wanted to know one thing. Does it actually help, or would the agent do just as well with plain Ghidra?

So I spent a weekend finding out. Then I built my own version and put all three in the same fight.

## What these tools actually do

When an app is compiled, its readable code becomes machine instructions. [Ghidra](https://github.com/NationalSecurityAgency/ghidra), a free tool from the NSA, turns those instructions back into a rough, readable version of the logic. The names and comments are gone, but the math survives.

REA and tools like it sit between your AI agent and Ghidra. The agent asks "show me this function" or "where is this text used," and the tool answers. The agent does the detective work.

## Doom, with the answers changed

Here's the problem with testing on a famous game: the AI already knows it. Doom's source code has been public since 1997, and an agent can tell you the shotgun's damage without ever opening the program. That would test its memory, not the tool.

So I changed the answers. I built Chocolate Doom with eight gameplay rules secretly altered, then stripped out every function name. The agents only got the compiled program. An agent answering from memory gives the original values, and in my build, those are wrong.

My favorite trap: in my build, the BFG fires with **40 cells** once it's selected, but the game's automatic weapon switch won't pick it until you have **50**. Knowing Doom doesn't help. Finding one number doesn't help either. The agent has to follow both paths through the code.

The six questions covered armor, damage order, invulnerability, splash damage, the BFG's spray and ammo pickups. I locked the questions and the answer key before the first run, and the answer key comes from running the modified game code, not from me eyeballing it.

## Same answers. Different bills.

Every setup used the same model (gpt-6.1-sol, high effort) in fresh sessions, three runs each. REA ran the way people actually install it, with its bundled skill and its full tool catalog. The other contender was [LaurieWired's GhidraMCP](https://github.com/LaurieWired/GhidraMCP), the popular community option, untouched. All three started with the program already analyzed, outside the timer.

| Tool | Correct | Median time per run | Tokens, 3 runs | API-equivalent cost, 3 runs |
|---|---:|---:|---:|---:|
| **Every App Is Open Source 0.1.0 (mine)** | **18/18** | **121.8s** | **1,728,000** | **$0.70** |
| Community GhidraMCP | 18/18 | 146.2s | 2,337,886 | $0.84 |
| REA 6.7.0 + bundled skill | 18/18 | 166.7s | 3,603,877 | $1.09 |

Everybody got everything right, all 72 individual values. Across the three runs, mine used **52% fewer total tokens than REA: roughly half** (1,728,000 versus 3,603,877). That includes input and output tokens, with cached input counted too.

Mine was **16% cheaper and 17% faster than GhidraMCP**, and **36% cheaper and 27% faster than REA**. The token saving and dollar saving differ because cached input costs less. Those dollar figures are what the same usage would cost at API prices, with the cached-input discount, not what my subscription charged me.

The most popular tool was the slowest and the most expensive.

## I didn't build a better decompiler

Ghidra does the hard part for all three. The difference is the conversation around it.

My first version actually lost to GhidraMCP on cost. I went through the logs and found the problem: my tool kept sending repeated metadata and detail the agent hadn't asked for yet. Every extra line is tokens, and tokens are money.

So now it answers small first. The full evidence, caller lists and everything else are still there, the agent just has to ask. I retested on new questions and a newly modified build, so I couldn't accidentally tune it to the old test. I kept the round I lost, too.

There's one more thing I cared about. In REA 6.5.0's JavaScript analysis, I found two false positives labelled "observed, exact": a [Map lookup classified as a network endpoint](https://github.com/morluto/rea/issues/4853) and a [local class classified as SQLite storage](https://github.com/morluto/rea/issues/4854). Both have since been fixed on REA's main branch. Those findings came from an earlier JavaScript audit; the native benchmark here used REA 6.7.0.

In mine, every answer says whether it's a fact read from the binary, something computed from it, or a guess. A guess is never called exact.

## What this doesn't prove

All three scored 100%, so this doesn't show mine is smarter. It shows it's cheaper and faster on this test. It's one game, three runs per tool, and compiled programs only. REA also covers things mine doesn't yet, like Electron apps, Android and .NET.

I'd rather say exactly what I measured than claim more and get taken apart in the comments.

## Try it

[Every App Is Open Source](https://github.com/thomasisalwayslate/every-app-is-open-source) handles compiled programs right now. On an Apple Silicon Mac with [uv](https://docs.astral.sh/uv/) and Apple's Command Line Tools, one command sets it up:

```sh
uvx --python 3.13 --from every-app-is-open-source eaos setup
```

It downloads and checks Java and Ghidra, builds the Apple Silicon decompiler the official download is missing, and reuses all of it next time.

The [full results](https://github.com/thomasisalwayslate/every-app-is-open-source/blob/main/reports/round2/results.md) and [every individual run](https://github.com/thomasisalwayslate/every-app-is-open-source/blob/main/reports/round2/results.json) are in the repo. You can build a fresh modified Doom target using the [public preparation instructions](https://github.com/thomasisalwayslate/every-app-is-open-source/blob/main/docs/BENCHMARK.md); running the full three-tool comparison still requires manual setup described in that guide.

Next up is Ollama: a much bigger native program, secretly modified again, with its own hidden answer key. I'll publish the result either way, including anything I lose.
