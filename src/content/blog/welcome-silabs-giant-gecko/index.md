---
title: "Welcome Silabs Giant Gecko!"
description: "We are expanding (again) the list of hardware platforms on which .NET nanoFramework can run. We are also excited to announce a new supported RTOS."
date: 2023-02-06T16:02:42Z
author: jose-simoes
tags: [releases, hardware]
wordpressId: 1276
---

We are expanding (again) the list of hardware platforms on which .NET **nanoFramework** can run. We are also excited to announce a new supported RTOS.

Ladies and gentlemen please welcome **Silicon Labs [Giant Gecko S1](https://www.silabs.com/mcu/32-bit-microcontrollers/efm32-giant-gecko-gg11)**, running .NET nanoFramework on top of **[Azure RTOS](https://github.com/azure-rtos) ThreadX**.

This announcement is even more important to the project, because all of this was made possible by the sole sponsorship of [**Skyworks**](https://www.skyworksinc.com/).

Let’s unpack all these and take a closer look at each one.

##### Silabs Giant Gecko S1

SiLabs [Giant Gecko S1](https://www.silabs.com/mcu/32-bit-microcontrollers/efm32-giant-gecko-gg11) is a highly integrated and performant ARM Cortex-M4+ 32bit MCU. Packed with a numerous features suitable for IoT and low power usage applications. It has a generous 2M of flash and 512k of RAM, making it perfect to run more demanding embedded applications. Adding support for Giant Gecko paves the way for other SiLabs series, like their Wi-Fi and Matter capable MCUs in the future.

##### Azure RTOS

Azure RTOS has been on our radar for quite some time. Work to add support for this RTOS was started a long time ago; however, work was progressing rather slowly due to lack of time and investment . With the sponsorship of Skyworks, it’s now real: we now have official support for Azure RTOS in .NET **nanoFramework** and the very first supported target is SiLabs Giant Gecko S1.

Along with [ThreadX](https://learn.microsoft.com/azure/rtos/threadx/?WT.mc_id=DT-MVP-5004179), other companion Azure RTOS components are available: [NetX Duo](https://learn.microsoft.com/azure/rtos/netx-duo/?WT.mc_id=DT-MVP-5004179) for networking, [FileX](https://learn.microsoft.com/azure/rtos/filex/?WT.mc_id=DT-MVP-5004179) for file system, [USBX](https://learn.microsoft.com/azure/rtos/usbx/?WT.mc_id=DT-MVP-5004179) for USB host and devices, and more. We’ll be wrapping up the work on these in the coming months as we add more targets that leverage the functionalities they offer.

Now some details on the context on how all this happened and was made possible.

##### SKYWORKS comes into play

Early in 2022 we were approached by the Mixed Signal Solutions Timing division of [Skyworks](https://www.skyworksinc.com/). They were working on a new generation of the evaluation boards (EVBs) for their timing semiconductors, moving from an 8- to 32-bit MCU. The team has a .NET centric device toolchain, all the way from lab APIs to help validate and characterize devices to customer centric tools such as their industry leading [ClockBuilder Pro](https://www.skyworksinc.com/cbpro)™ desktop tool.

While the team was competent in C development for the MCU, the simplicity of C# and the .NET framework was desired. The team also considered code sharing between desktop and MCU code bases a plus. Portability of firmware to other MCUs is also a benefit, ensuring less churn long term.

The team evaluated several options, and landed on the open source **nanoFramework** project as the best fit. The team chose the Giant Gecko MCU for their project due to robust feature set, top notch tools, excellent support, and robust supply chain to ensure MCU availability.

Because time to market was important to Skyworks and the fact that the chosen platform (Silabs Giant Gecko S1) wasn’t supported by **nanoFramework**, they approached us to make this happen. This is of importance to story here for a number of reasons.

The fact that a company like Skyworks finds it reliable to depend on nanoFramework for a product of this importance to them (the evaluation boards for their timing semiconductors), is a clear indication of the project’s high quality. This is both an honor and a privilege for us!

.NET **nanoFramework** is an Open-Source project and it would have been easy for them to take what’s there and develop their product on top of it. Another possibility was to have reached out to us and have a custom project developed specifically for them.

Instead, Skyworks choose another, very responsible approach to this: "Hey, we need support for this device for our new product and we also want to give back to the project. We’ll sponsor the work required to make this happen and we’ll also need a couple of libraries specific to this platform. All of this can be released in public domain, become available as part of the project for the benefit of everyone."

Wow! How refreshing this approach is!

Work on this was started and, in about 8 months’ time, we have added:

-   Support for a new MCU platform: Silabs Giant Gecko S1 and paved way to add new Silabs MCU series;
-   Support for a new RTOS: Azure RTOS ThreadX and other Azure RTOS components;
-   A new target board the [SLSTK3701A](https://www.silabs.com/development-tools/mcu/32-bit/efm32gg11-starter-kit?tab=overview): EFM32 Giant Gecko S1, GG11 Starter Kit (firmware image available [here](https://github.com/nanoframework/Home#silicon-labs-giant-gecko-boards));
-   A new .NET [nanoFramework library](https://github.com/nanoframework/nanoFramework.Hardware.GiantGecko) adding support for EFM32 hardware specifics;
-   Another .NET [nanoFramework library](https://github.com/nanoframework/nanoFramework.GiantGecko.Adc) with support for EFM32 ADC (a key component for Skyworks EVB);
-   Another .NET [nanoFramework library](/?page_id=1277) adding support for USB devices through WinUSB and USB CDC;
-   .NET nanoFramework firmware image for Skyworks new EVB designed in parallel with their new hardware.

Skyworks now has a future proof platform for their EVBs, with plenty of room for improvements. Because of the flexibility .NET **nanoFramework** allows and the abstraction it provides on top of the hardware and low level layers, it’s rather easy to come up with variations, redesigns and keeping development and updates going smoothly with the consequent productivity increase, high quality testability and a short cycles in time to market.

On a broader picture, all this is a fantastic synergy. Skyworks is also benefiting of a constantly evolving framework, tools and libraries, with an incredible community that provides extensive (and speedy) testing, feedback, bug reporting and fixing.  

We, at [Eclo Solutions](https://www.eclo.solutions/en/home-en/), as the keeper of .NET **nanoFramework**, are very grateful to Skyworks for supporting the project on this so effective manner. Let’s hope others follow their lead and example and contribute to the growth of this amazing framework that brings .NET C# to the embedded systems world.

I’ll wrap up with a well-known quote from Casablanca “I think this is the beginning of a beautiful friendship.”
