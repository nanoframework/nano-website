---
title: "Overview of .NET nanoFramework"
description: ".NET nanoFramework is a production-grade, open-source platform for writing C# applications for constrained embedded devices, with standard .NET APIs, NuGet packages and real on-device debugging in Visual Studio and VS Code."
wordpressId: 511
---

## General overview

.NET **nanoFramework** is an open-source platform for building embedded applications in C# on microcontrollers and other constrained devices. It is used in production, in commercial products and industrial equipment, as well as in IoT devices, connected sensors, robotics, research and education.

It brings the productivity of modern .NET development to the embedded world: a familiar language, a rich set of class libraries, professional tooling and real hardware debugging. Teams spend their time on the application, not on reinventing infrastructure, which shortens development cycles, lowers costs and makes products easier to maintain over their lifetime.

## How does it work?

.NET nanoFramework includes a compact implementation of the .NET Common Language Runtime (CLR), designed to run on devices with as little as a few hundred kilobytes of memory. On top of it sits a subset of the standard .NET base class libraries, following the same namespaces and APIs that .NET developers already know. That means existing skills, code and samples carry over with little or no change.

Class libraries, device bindings and other components are distributed as NuGet packages, so adding a capability to a project, or keeping it up to date, works exactly as it does in any other .NET project.

Applications are written and debugged in **Visual Studio** (2019, 2022 and 2026, including the free Community edition) or in **VS Code** on Windows, macOS and Linux.

## Supported hardware

.NET nanoFramework runs on a wide range of 32-bit microcontrollers, with reference targets that the core team builds, tests and publishes for:

- **Espressif ESP32** family, including the S2, S3, C3, C5, C6, H2 and P4 series
- **Raspberry Pi** RP2040 and RP2350 (Pico and Pico 2)
- **STMicroelectronics STM32**
- **NXP** i.MX RT
- **Silicon Labs** Giant Gecko
- **Texas Instruments** SimpleLink

Many more boards are available as [community targets](https://github.com/nanoframework/nf-Community-Targets). The full, up-to-date list of reference targets and firmware packages is in the [Home repository](https://github.com/nanoframework/Home#firmware-for-reference-boards).

Because the runtime is portable, bringing .NET nanoFramework to a new board or silicon family is a well-defined engineering task.

## Development experience

Developers work in the IDE they already know. Extensions for both Visual Studio and VS Code provide project templates, device discovery, deployment and a full debugging experience.

Debugging happens on real hardware: after building, the application is deployed to the target and runs on its CPU. Everything you expect is there, including breakpoints (conditional too), single-step, step in and step out, variable watches and expression evaluation.

A debug session starts within a couple of seconds, so it is just another step in the workflow, without breaking the developer's focus.

Firmware updates are handled by [nanoff](https://github.com/nanoframework/nanoFirmwareFlasher), a cross-platform .NET tool that also fits naturally in CI pipelines and production flashing.

## Customizing the firmware

Building a custom firmware image for a new board is a straightforward process, which makes the platform well suited to commercial use: a proof of concept on new hardware can be up and running in a short time, and the same build carries through to production.

Behind it is a modern, solid build system based on standard, industry-proven tools that embedded developers already know:

- **CMake** drives the build, with CMake presets for toolchains, SDK paths and build settings, so firmware builds the same way from the command line, Visual Studio or VS Code.
- **Kconfig**, the configuration system used by Linux, RTOSes and vendor SDKs, defines each target. A minimal configuration file per target, options and dependencies that are explicit and validated at configure time, and features and APIs that can be included or left out to fit the device's resources.
- **GCC** compiles it all: the Arm GNU Toolchain for Cortex-M devices and Espressif's GCC toolchains, through ESP-IDF, for ESP32 devices.

The source code and build scripts are fully open source, and builds run the same way locally, in the provided development containers or in CI.
