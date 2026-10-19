---
title: ".NET nanoFramework has joined the .NET Foundation!"
description: "We have some great news to share: .NET nanoFramework has reached an important milestone by joining the .NET Foundation!"
date: 2020-09-28T10:11:03Z
author: jose-simoes
tags: [community]
cover: ./dotnetfoundation_v4_horizontal.png
coverAlt: ""
legacyComments:
  - id: "93"
    author: "Peter"
    date: 2020-09-28T11:44:37Z
    body: "Awesome."
wordpressId: 900
---

We have some great news to share: .NET **nanoFramework** has reached an important milestone by joining the [.NET Foundation](https://dotnetfoundation.org/)!

This is kind of a “return home” for the project. Despite being, undoubtedly, connected to .NET because of its roots, the programming language, and the tools it uses, it was not exactly part of the family. Now it is.

The .NET ecosystem has grown a lot. From desktop to cloud, AI, IoT, and smaller devices, it is now virtually everywhere. Even though there are “official” solutions for embedded systems (from [Azure Sphere](https://azure.microsoft.com/pt-br/services/azure-sphere/) to, more recently, [Azure RTOS](https://azure.microsoft.com/en-us/services/rtos/) and friends) those are somewhat “out of ecosystem” in the sense that developers have to keep using the traditional C/C++ in order to code for such devices. If one wants to code in C#, the smallest you can aim to reach out to is a Raspberry PI.  
.NET **nanoFramework** extends .NET's ability use to really small and constrained devices. Yes, there are a couple of similar offers out there, but none are Open Source. And none of those allows coding for [Expressif ESP32](https://www.espressif.com/en/products/socs/esp32/overview); or ST Microelectronics [STM32F0](https://www.st.com/en/microcontrollers-microprocessors/stm32f0-series.html)/[L0](https://www.st.com/en/microcontrollers-microprocessors/stm32l0-series.html)/[F4](https://www.st.com/en/microcontrollers-microprocessors/stm32f4-series.html) (to name just a few); or Texas Instruments [CC3220](https://www.ti.com/product/CC3220S) and [CC1352](https://www.ti.com/product/CC1352R); or NXP [MIMXRT1060 EVK](https://www.nxp.com/design/development-boards/i-mx-evaluation-and-development-boards/mimxrt1060-evk-i-mx-rt1060-evaluation-kit:MIMXRT1060-EVK); or any other new target device that can easily be added.

It is our expectation that this will boost the project in many ways. Such has:

-   Visibility. This is one is kind of obvious, right? Considering that this is one of the goals of the .NET Foundation, more developers will become aware of the project, will start to use it and, hopefully, in the good spirit of Open Source, will give back to the project, ultimately allowing us to move faster and increase the overall quality.
-   Easier access to the .NET teams that we depend most upon, or that have impact on the project. These are Visual Studio, VS extensibility, .NET project system and such. Every now and then we bump into bugs/changes that break stuff and being able to report and discuss things quicker and easily is invaluable. Being able to pass along our suggestions and “needs” can only be positive for the continuous grow and overall quality of the project.
-   Tighter integration with the .NET ecosystem. As it is now, .NET nanoFramework is perfectly usable and integrated in the key aspects and tools including Visual Studio, libraries available through NuGet etc. But we, admittedly, have some pain points that could easily go away providing that such integration can happen. Starting with the Project System, having a dedicated target framework identifier would make our life so much easier. Extend Unit Testing framework so that we can have it on our projects and finally unifying APIs. We have already started walking down this path with conversations with the .NET Core IoT team, so the first visible changes are due shortly.

A thank you note is due to all the people that paved the way and made this possible. When .NET Micro Framework was launched a long time ago and showed that writing C# code for microcontrollers was possible. And, of course, open sourced it! .NET **nanoFramework** sure is a lot different from what was .NETMF back then, but we are standing on the shoulders of giants and we owe a lot to those very smart and talented people.

All in all, it is a positive event that can only bring good things for the project. We are very happy that it is happening, and it sure feels like a recognition for all the immense effort that a handful of people have poured into .NET **nanoFramework** for the last 4 years.

A lot of great achievements are ahead of us for sure. Let’s make that happen!

PS: We hate to see wasted talent and positive energy! Join our [Discord community](https://discord.gg/gCyBu8T). Fork our [samples repo](https://github.com/nanoframework/Samples). Grab open [issues](https://github.com/nanoframework/Home/issues). Fix bugs. Contribute with new features. Write a project for [Hackster.io](https://www.hackster.io/nanoframework). Have fun with .NET **nanoFramework**!
