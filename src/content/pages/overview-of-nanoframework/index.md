---
title: "Overview of nanoFramework"
description: ".NET nanoFramework is an open-source platform that enables the writing of managed code applications for constrained embedded devices. It is suitable for many types of projects including IoT…"
wordpressId: 511
---

## General overview

.NET **nanoFramework** is an open-source platform that enables the writing of managed code applications for constrained embedded devices. It is suitable for many types of projects including IoT sensors, wearables, academic proof of concept, robotics, hobbyist/makers creations or even complex industrial equipment. It makes the development for such platforms easier, faster and less costly by giving embedded developers access to modern technologies and tools used by desktop application developers.

## How does it work?

It includes a reduced version of the .NET Common Language Runtime (CLR) and features a subset of the .NET base class libraries along with the most common APIs included in the Universal Windows Platform allowing code reuse from desktop applications, IoT Core applications, thousands of code examples and open source projects.

Class libraries and other components are distributed as NuGet packages, making it very easy for developers to consume and keep them updated.

The IDE to code and debug a **nanoFramework** project is Microsoft Visual Studio 2022 on Windows 10. The free Community version is the minimum required. All the other editions, up to Enterprise, are supported as well.  

## Supported hardware

  
Currently we have reference targets ready to use for ARM Cortex-M SoC and ESP32 from Expressif. .NET **nanoFramework** code can run on any 32 bits CPU, so porting it to other vendors, or series is possible without too much work being involved.  

## Development experience

  
The development experience is as smooth as possible, and the developer doesn’t have to leave the comfortable and feature rich Visual Studio IDE.

Debugging happens in conjunction with real hardware. After building, the application is deployed on the target hardware and the execution happens on the CPU. Expected debug features like, single-step, step-in, step-out, conditional breakpoint, variables watch and even expression evaluation are all there.

A debug session starts within a couple of seconds making it “just” another step without breaking the developer productivity and concentration on the task at hand.  

## Customizing the firmware

  
Cooking a new firmware image is a simple process which makes the platform very suitable for commercial use as the development time to have a MVP for a new board is quite short.

The source code and build scripts are totally open source. The build is based in CMake and the compiler toolchain used is the GNU Arm Embedded Toolchain for Cortex-M CPUs and Espressif customized GCC version.
