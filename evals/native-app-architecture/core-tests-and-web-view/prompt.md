---
description: Portable core tests run once on the cheapest runner, and a web view fallback needs a written blocker.
tags: [native-app-architecture, skill-fired]
max_turns: 10
allowed_tools: [Read, Glob, Grep, Skill]
---

Our app has a Swift package `Core` (models, validation, sync logic; imports only Foundation) and two app targets, iOS and macOS, that use it. Two things:

1. I'm setting up CI. To be safe I want the `Core` tests to run on the iOS simulator job, the macOS job, and a Linux job. Write the job list.
2. The settings screen already exists on our website, so I plan to show it in a `WKWebView` in both apps instead of rebuilding it. Sound fine?

Reply in your message; you don't need to create files.
