---
title: "Stable releases are out!"
description: "Today we have completed the publishing of our latest stable releases. This includes all of the firmware images and class libraries."
date: 2020-06-17T14:32:10Z
author: jose-simoes
tags: [releases]
wordpressId: 867
---

Today we have completed the publishing of our latest stable releases. This includes all of the firmware images and class libraries.

This happens after deep rework on some key components, like the metadata processor (which is responsible for processing the .NET IL and make usable by the .NET **nanoFramework** CLR & execution engine) and the [Visual Studio extension](https://marketplace.visualstudio.com/items?itemName=nanoframework.nanoFramework-VS2019-Extension).

The Visual Studio extension is now much more stable and all of those nasty crashes and hangs when interfacing with a device in Visual Studio are now gone.

The firmware updater tool ([nanoff](https://github.com/nanoframework/nanoFirmwareFlasher)) is now able to update STM32 targets with both JTAG and DFU connections, along with the new TI XDC targets.

Too many features were added and bug fixes made to list them all, but the full list can be found in the check-in history on out various repos. The following lists some of the highlights:

-   ESP32 RMT and Gpio​Change​Counter,
-   New platforms and targets like the TI CC1352 and NXP MIMXRT1060\_EVK,
-   Several fixes and improvements deep on the execution engine and CLR,
-   ESP32 moved to IDF 3.3.1,
-   TI CC3220 SimpleLink move to 4.10,
-   Output of target boot and assembly details are shown at Visual Studio output window,
-   Start of debug sessions are now smoother on all targets and platforms,
-   A completely new Json C# library with improved and new features.

It is worth mentioning that since the last stable release, some of the community involvement has been excellent. There were a few outstanding collaborations that has made it possible for some of this releases features and improvements to happen. A big thank you to those developers!

For the next iteration, the plan is ambitious:

-   Improving nanoff to allow updates over USB,
-   Release a C# unit test framework,
-   Improve general QA by adding unit tests to native and managed code,
-   Add IFU capability to all platforms.

And who knows what other goodies we can pick up along the journey…

The .NET **nanoFramework** project is growing and becoming more feature rich. The stability and overall quality is increasing too. All this requires a lot of effort and time from the maintainers. We sure could use more people coding, reviewing stuff, writing documentation and creating walk-through guides along with answering questions from developers and help with the daily chores with Azure Pipelines, GitHub, CD/CI.

Have fun with .NET **nanoFramework**!
