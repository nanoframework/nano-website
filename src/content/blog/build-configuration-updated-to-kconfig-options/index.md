---
title: "Build Configuration Updated To Kconfig Options"
description: "Keeping a great build system for .NET nanoFramework firmware is something that has been high on our list since the very beginning of the project. One of the reasons for that is simple: the easier…"
date: 2026-03-31T14:37:06Z
author: jose-simoes
tags: [engineering]
cover: ./kconfig-migration.png
coverAlt: ""
wordpressId: 1714
---

Keeping a great build system for **.NET nanoFramework** firmware is something that has been high on our list since the very beginning of the project. One of the reasons for that is simple: the easier it is to build firmware locally, the lower the barrier for anyone wanting to experiment with the code, fix a bug, add a feature, work on a new target, or create a custom image.

We’ve now taken the next step in that journey and moved target configuration from [CMake](https://cmake.org/) presets to [Kconfig](https://www.kernel.org/doc/html/latest/kbuild/kconfig-language.html).

Yes, this is a breaking change. But it’s also a very deliberate one, and one that we believe puts the build experience on a much more appropriate and future-proof foundation.

### **Why move away from CMake presets?**

CMake presets have served us very well and they still have an important role in our build system. They remain the right place for build-system settings such as toolchains, generators, output folders, SDK paths, tool locations, and similar build-related concerns.

But as the project evolved, presets also started carrying target configuration details such as hardware capabilities, enabled APIs, Wire Protocol options, feature flags, and platform-specific switches.

That worked, of course. But it wasn't really the ideal fit.

Those settings are not about the build system itself. They describe the firmware image being built, and that comes with a different set of requirements. Options depend on each other, some features must automatically enable other components, invalid combinations should be rejected early, and developers need a clean and discoverable way to inspect and change configuration.

That is exactly the sort of problem Kconfig was made to solve.

### **Why Kconfig?**

Kconfig is a widely used and well accepted tool for configuration in the embedded systems industry. It is familiar to developers working with embedded platforms, RTOSes, SDKs, and low-level firmware stacks, and it has proven itself time and time again in projects where configuration grows in complexity over time.

So this move is not only about changing tools. It’s about adopting a more standard approach, one that many embedded developers already know and expect.

That brings an obvious benefit for long-time contributors, but it is especially valuable for newcomers too. When the configuration model looks familiar from day one, it becomes much easier to understand how the pieces fit together and how to get productive faster.

With Kconfig we now have a configuration system built for:

-   expressing dependencies directly;
-   interactive configuration workflows;
-   keeping minimal defconfig files per target;
-   validating configuration at configure time;
-   separating build-system settings from firmware settings.

In short, CMake presets keep doing what they are good at, and Kconfig now handles what it is clearly better suited for. How cool is that? ;)

### **A good moment to clean up configuration names**

Because this was already a breaking-change moment, we also took the opportunity to rename a number of configuration options.

Some names were updated to be more consistent, easier to understand, and better aligned with the Kconfig model. Breaking changes are never something we introduce lightly, but when making a transition of this size it makes sense to fix historical inconsistencies instead of dragging them along for a few more years.

The result is a cleaner and more coherent configuration surface, which should make life easier for everyone working with target definitions and custom builds.

### **What are the benefits?**

Actually, there are quite a few.

First, configuration is now much easier to understand and explore. Kconfig gives options structure and context in a way that feels natural for embedded development.

Second, dependencies are handled in a far more robust way. Instead of relying on scattered logic and manual coordination of variables, configuration rules can now live where they belong: in the configuration system itself.

Third, target definitions become leaner. Each board can keep a minimal defconfig file with only the non-default values, while the remaining settings are filled in automatically.

Fourth, developers get a more standard interactive workflow to inspect, tweak, and validate configuration. This is especially handy when creating a new target, adjusting an existing one, or simply exploring what is available.

Fifth, maintainability improves for the project as a whole. Keeping firmware configuration separate from build-system configuration makes the entire setup easier to reason about, easier to evolve, and easier to keep consistent across local builds and CI.

And, of course, developers can now benefit from the visual tooling that usually comes with Kconfig workflows too. Instead of juggling raw variables by hand all the time, it becomes much easier to inspect available options, understand what depends on what, and make changes with a lot more confidence. Nice!

### **A bit more on the inner workings**

Since a few of you will want to know what actually changed under the hood, here is the short version.

Each target still has a CMake preset, but those presets are no longer the place where the firmware configuration itself lives. Instead, each preset now points to a target `defconfig` file through `NF_TARGET_DEFCONFIG`. In other words, the preset remains the entry point for the build, while the target configuration has moved to the right home.

That means the per-target configuration that used to sit in `CMakePresets.json` is now stored in `defconfig` files. For ChibiOS, FreeRTOS, TI SimpleLink, ThreadX, and other targets, those live alongside the target definition. For ESP32, where many targets are really SoC configuration variants, there is a flat `targets/ESP32/defconfig` folder with the different board and feature combinations.

There is also a dedicated validation script for this: `[validate_defconfigs.py](https://github.com/nanoframework/nf-interpreter/blob/ebdb60bc0b350eb4a3881d072f1d0500ca624479/scripts/validate_defconfigs.py)`. That script can validate all `defconfig` files in the repository, or just the one associated with a specific preset. It checks that files load correctly against the Kconfig schema, catches undefined symbols, and can even warn when a `defconfig` is not in its canonical minimal form. That gives us a much more robust safety net for both CI and day-to-day development.

On the CMake side, there is now a bridge module, `[NF_Kconfig.cmake](https://github.com/nanoframework/nf-interpreter/blob/ebdb60bc0b350eb4a3881d072f1d0500ca624479/CMake/Modules/NF_Kconfig.cmake)`, which ports the Kconfig-based configuration back into the existing CMake world. It loads the selected `defconfig`, optionally merges developer-local preferences from `user-kconfig.conf` through `nf_merge_config.py`, generates the final `.config` and `nf_config.h`, and then maps those Kconfig values back into CMake cache variables for the rest of the build. So yes, the configuration source changed, but the build pipeline still gets the values it needs. Cool, isn't it?

Another nice improvement is how the options are now organized. The root `Kconfig` file pulls together grouped configuration sections such as `Kconfig.build`, `Kconfig.features`, `Kconfig.apis`, `Kconfig.graphics`, `Kconfig.networking`, `Kconfig.serial`, and `Kconfig.wireprotocol`. On top of that, each platform can contribute its own specific options through files such as `targets/ESP32/Kconfig`, `targets/ChibiOS/Kconfig`, `targets/FreeRTOS/Kconfig`, `targets/TI_SimpleLink/Kconfig`, and `targets/ThreadX/Kconfig`.

This is one of the biggest wins of the whole migration. Kconfig has built-in validations, dependencies, and cross-checks, so rules can now be expressed directly in the configuration model itself. Options can _depends on_ other options, _select_ required capabilities, and _imply_ related settings when that makes sense. That adds real robustness to the process and helps catch invalid combinations much earlier.

And because this is Kconfig, developers also get access to familiar visual configuration tools such as `menuconfig` and `guiconfig`, making it much easier to browse, tweak, and validate configuration interactively. For anyone working regularly on firmware images, board bring-up, or custom targets, that is a pretty welcome upgrade.

### **Documentation and updated build instructions**

The documentation has been updated to reflect this new model.

If you want to read more about the current role of CMake presets, check [this page](https://docs.nanoframework.net/content/building/cmake-presets.html).

For the new Kconfig options documentation, head [here](https://docs.nanoframework.net/content/building/kconfig-options.html).

And all build instructions have been updated as well. You can find them [here](https://docs.nanoframework.net/content/building/index.html).

These pages explain the new separation of responsibilities between CMake presets and Kconfig, and document the updated workflows for configuring and building firmware images.

### **Looking ahead**

This migration does introduce breaking changes, no question about that. But we’re confident it will make the experience of building .NET nanoFramework images better for everyone.

For developers already working on custom builds, this should provide a clearer and more capable path for handling configurations.

For newcomers, it should make the whole thing feel more standardized, more familiar, and easier to approach.

Hopefully this gives everyone building their own images an easier path to manage configurations, while also making nanoFramework feel more aligned with the tooling and workflows commonly used across embedded systems development.

Have fun with **.NET nanoFramework**! :)
