---
title: "Improved support for ESP32"
description: "Today I’m proud to announce something that was due for quite some time: ESP32 firmware for .NET nanoFramework is now building from ESP-IDF 4.3.1. Yes, that’s the latest and greatest from Espressif!"
date: 2021-10-12T18:26:26Z
author: jose-simoes
tags: [hardware, tooling]
wordpressId: 1070
---

Today I’m proud to announce something that was due for quite some time: ESP32 firmware for .NET **nanoFramework** is now building from [ESP-IDF 4.3.1](https://github.com/espressif/esp-idf). Yes, that’s the latest and greatest from [Espressif](https://www.espressif.com/)!

A bit of history here: support for ESP32 devices was added quite sometime ago by [Adrian Soundy](https://github.com/AdrianSoundy). At that time ESP-IDF was on version 3.1 and was using plain make files. It was quite an adventure to integrate our build system with pre-built libraries from ESP-IDF. As ESP-IDF moved forward, we’ve manged to keep up until we got trapped on v3.3. Then v4 came and we where dead in the water... :(

Besides the obvious and clamorous technical debt that we were incurring, there was too the pressure for being able to add support for features like BLE and take advantage of the bug fixes and improvements that kept happening in ESP-IDF.

At a first glance, because v4 brought along a [CMake](https://cmake.org/) build system for ESP-IDF, it would look trivial to make that move, right?

Just that it isn’t that simple! For various reasons.

-   Despite being CMake, ESP-IDF build system, under the hood, it’s based on Python scripts. This makes it virtually impossible to mimic in another pure CMake build system. Not to mention that it would require constant updates to port changes introduced in the official build system.

-   The network component for .NET **nanoFramework** also uses [lwIP](http://savannah.nongnu.org/projects/lwip/). But we have some modified sources as we need to get notifications on some events that are required to make the sockets layer work smoothly and integrated with the C# code.

-   Running a build with ESP-IDF requires setup a specific Python version; install the Python packages that the various components depend on; install Espressif GCC toolchain. This is a challenge on its own because we have to support local builds for developers working on their machines, we rely on [Azure Pipelines](https://azure.microsoft.com/en-us/services/devops/pipelines/) for our CI-CD and we also provide Docker containers.

-   Considering that all the above is properly setup, ESP-IDF requires a specific configuration file that’s ideally composed “on the fly” as the very step of the build. That’s even more pertinent as we have several build options to choose which features are added to the build and variants on different chip versions and memory configurations that we choose to support.

-   The way ESP-IDF build system is architected, it allows library builds or pre-compiled builds which is great. The downside is that no matter how you approach it, it’s always the ESP-IDF that must be “in charge” of the build. That poses a serious challenge for .NET **nanoFramework** build system.

-   With a new major version, like it’s customary on our industry, APIs change. And some of those are breaking changes. ESP-IDF is no exception so the APIs .NET **nanoFramework** was calling had to be brought up to date with the current ones.

The first step to tackle all this was to be able to build the various .NET **nanoFramework** components as libraries. This allows those libraries to be integrated in the ESP-IDF build system and to better control build and compile options in order to match the ones used by ESP-IDF.

Next, we had to _hijack_ ESP-IDF build in order to replace their source files with ours, for the components that we needed to use our modified versions.

On top of that, we need to take care of the integration of external libraries that our components depend on, and that ESP-IDF also uses. The challenge here is that we don’t use the same versions and, to make things worth, on most of them ESP-IDF has tweaks and changes on the original source code. This brings in clash on declarations, different versions, and different code base.

These where the high-level elements that had to be addressed to make this happen. A myriad of several other tiny minutia and details popped along the journey, but that would be tedious to describe (and to read about! ;) ).

Moving along to a more appealing topic: what got changed as far as .NET **nanoFramework** is concerned?

-   We are now fully in sync with ESP-IDF build system, meaning that we can now easily follow up their releases with little or minimal effort.

-   The seamless integration that we now have with ESP-IDF build system allows us to add support for all ESP32 series! Yes, that’s correct **all**: ESP32\_S2, ESP32\_S3, ESP32\_C3 and whatever comes next. How cool is that? 8-)

-   To a similar extent, the build system integration allows us to easily add new libraries and features that are available or provided by the ESP-IDF.

In the rework process we took the time to improve, tweak and fine tune numerous configurations and aspects. Here’s a list of the more relevant ones.

-   For ESP32 chips that have two cores, we are now running on both cores taking advantage of the extra processing power.

-   Memory management was optimized too, by tweaking and combining all possible configuration options and to take advantage of PSRAM when that’s available. This led to the fact that, from now on, there will be firmware images with and without support for PSRAM.

-   Security it’s high on our concern list. The TLS provider on .NET **nanoFramework** and on ESP-IDF it’s [mbedTLS](https://tls.mbed.org/). The version that ships along with ESP-IDF it’s typically outdated. We’ve managed to completely extract the mbedTLS component from ESP-IDF without losing the optimizations and the hardware connection that it has (for crypto calculations, random numbers generation and such). This allows us to (unlike what happened until now) to update mbedTLS to the latest version on all platforms, ESP32 included!

-   Configuration management is now fully aligned with the other platforms. Meaning that network configurations, Wi-Fi profiles, CA root certificate bundles and device X509 certificates are now available to use also on ESP32.

We’ll be updating the .NET **nanoFramework** [documentation website](https://docs.nanoframework.net/) and [nanoff](https://github.com/nanoframework/nanoFirmwareFlasher) to make better use of all these new goodies, features and possibilities. And, of course, add new .NET **nanoFramework** targets from other ESP32 series. Stay tuned! :D
