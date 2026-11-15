---
name: native-app-architecture
description: Structure a native app (Swift, Kotlin, .NET MAUI) around a portable core library with thin platform views. Use when writing or reviewing native app code, deciding where logic lives, adding a web view, setting up native project files, or planning native CI.
---

# Native app architecture

Read every applicable `AGENTS.md` first. Repository-local policy overrides these defaults.

Keep what the app knows apart from how a platform shows it. The first part is cheap to test and
shared; the second is expensive to test and differs per platform.

## Portable core

- Put business logic, state, and validation in a core library that imports no UI, persistence,
  or platform framework. In Swift that means no SwiftUI, UIKit, AppKit, or Core Data in the core
  target.
- Give the core protocols for what it needs from the platform (storage, network, clock, secure
  storage). The app target supplies the implementations.
- A core with no platform imports builds and tests on any machine, and its tests need no
  simulator.

## Views

- Views and pages bind to view models from the core. They hold layout and presentation only.
- Do not put a business decision in a view: no validation rules, no state machines, no request
  building. Logic in a view can only be tested by driving the interface.

## Web views

Do not fall back to a web view for a feature the platform can build natively, unless a specific
blocker is written down: what was tried and what prevented it. A web view gives up platform
navigation, accessibility, offline behavior, and secure storage, and the cost shows up later.

## Project files

Do not commit a generated project file such as `.xcodeproj`. Commit the specification it is
generated from and generate it in setup and CI. Generated project files conflict on almost every
merge and hide real changes in noise.

## CI

Run the portable core's tests once, on the cheapest runner that can build it. Do not repeat them
on every operating system; the code has no platform dependency to vary. Spend the expensive
platform runners on the app targets and interface tests.
