---
title: "High Level Programming Languages for Embedded Projects"
description: "Industry expert Mark Harris just published an article on its Altium blog about \"High Level Programming Languages for Embedded Projects\". The article includes a thorough analysis on the topic on…"
date: 2019-06-14T13:27:11Z
author: nanoframework-team
tags: [tooling]
cover: ./mark-harris-altium-programming-languages.png
coverAlt: ""
wordpressId: 673
---

Industry expert Mark Harris just published an article on its [Altium blog](https://resources.altium.com/pt) about "[High Level Programming Languages for Embedded Projects](https://resources.altium.com/pcb-design-blog/high-level-programming-languages-for-embedded-projects)". The article includes a thorough analysis on the topic on which .NET **nanoFramework** plays a key role as an excellent framework for embedded projects.

Follows a copy of the original article published in June 2019, for your convenience.

«In today’s vastly growing market, employees of small businesses, small divisions of larger companies, and especially freelance engineers are being asked to fill more roles than ever as part of their job responsibilities. Often, an electronics engineer will not only design the schematic and circuit board, but also may be required to develop embedded firmware for it, and build computer, web, or mobile software. On the other hand, there are web/mobile/desktop developers who branch out into designing and programming hardware because they are passionate about electronics.

With the additional responsibilities, there can be a substantial shortage of time needed to complete projects punctually. With low volume or prototype projects, this might be two-fold to keep the total project costs down. C and C++ are fantastic programming languages, but if they're not your primary skill/role, they aren't necessarily the fastest languages to use for developing firmware. Embedded development can have a significantly steeper learning curve than desktop, web or mobile software development, especially when interacting with hardware peripherals and setting registers. For complex projects, C/C++ can get intricate quickly, making debugging and maintaining code expensive components of the total project cost.

The rise of open source hardware abstraction layers and libraries such as Arduino, MBed, and even vendor specific libraries such as LPCOpen has made developing embedded systems a lot easier. These libraries can be utilized instead of an expensive toolchain, which offers a compiler and an extensive range of libraries, such as Keil or IAR. Keil, IAR, and other commercial tools have fantastic compilers; however, for a startup or a small business, they might be out of their initial budget before the project has become profitable. These abstraction layers and libraries can substantially speed up firmware development, however, for a new or infrequent firmware developer, these still have the considerably steep learning curve of C/C++. Furthermore, they may lack sufficient debugging features, such as stepping through the code line by line with an attached debugger with full state inspection, as they are web-based or use a limited development environment.

Getting a product to market quickly can significantly impact sales volume. Conversely, if you're only building a one-off or doing a minimal production run, every hour spent developing firmware can dramatically increase the cost-per-unit of the device. The same goes for making a proof-of-concept device you might take to an investor, to upper management or, as a freelancer, to your client. The longer you spend writing firmware, the higher the cost and project risk become.

Running a high-level language such as C#, Java, Python, LUA, or even JavaScript can markedly reduce development time for both simple and very complex projects. Higher level languages handle memory management and protection (overflow of arrays, for example), and some languages, like C#, provide an incredibly comfortable debugging experience. Not to mention, finding tutorials for the general language features of these languages is typically easy given their extensive user communities. Debugging capabilities are especially important for an inexperienced embedded developer, as debugging a project could be more time consuming than actually writing the code if the debugging tools are sub-par.

ARM Cortex processors are incredibly powerful at economical prices and come with plenty of RAM, flash space, and high clock speeds. You can pick up an ARM Cortex M0+ which runs code at around three times the speed as the old (23 years!) ATMega AVR that is popular with the Arduino community for about a third of the price at the same volume. These characteristics have led to their enormous popularity in the industry and amongst hobbyists alike. While ARM Cortex-based processors can be much easier to debug than older devices, potentially offering tremendous time savings, they can be more complex to write code for, even with libraries like MBed and Arduino's ARM ports.

If you spend a little more money on the microcontroller (just a couple of extra dollars), you can get some truly powerful systems that are more than capable of running higher level languages like Java, C#, Python, LUA, and Javascript. These languages are likely to be more familiar and simpler to use, and therefore offer shorter development times for inexperienced or non-embedded developers. Looking back to the low volume/prototype use case, an extra $1 to the per-device cost won't break the budget, as it could be much cheaper than even a single day of additional firmware development time. With the slightly more expensive microcontroller, you can run .NET nanoFramework and develop in C# with the full Visual Studio debugging experience, complete memory management, and ultra powerful language features that notably reduce the amount of code to be written (and debugged!)

There are some drawbacks to running a high-level language on a microcontroller or microprocessor compared to writing C/C++ code. Depending on your project, these drawbacks could be a significant problem or have no impact at all.  

  
-   Execution Speed: High-level languages will typically run on an interpreter rather than compile to native code. If you’re building a real-time system or need incredibly exact timing, then this rules out high-level languages from the start. However, this won’t be an issue if you consider a five to ten millisecond response time acceptably fast. Some languages support running native C, C++, or assembly code along with the high-level language code, which may mitigate this issue almost entirely.
  
-   Code Size: Because you need to include the interpreter and potentially a large number of library functions and features, the code size can be substantial before you even blink an LED. Compiled code size typically won't be an issue as a microcontroller variant with more flash space is not much more expensive.
  
-   Memory Usage: Again, because of the interpreter you’re likely going to be using much more memory than the same functionality implemented in a language which compiles down to a native format. Also, a processor variant with more memory isn’t much more expensive.
  
-   Hardware Features: You’re limited to the hardware peripherals on your device that the community or project team have implemented for the platform you’re running. If your device has Bluetooth hardware, but the language and libraries don’t support Bluetooth, you might not be able to use it at all.
  
-   Supported Microcontrollers: Only specific microcontrollers/microprocessors are supported by each platform, as the platform code generally needs to be ported to each new target. You probably need to decide on a programming language before you start hardware development to know which processor you’ll be using in the project.
  

  
That being said, there are some considerable advantages to running a high-level language on a microcontroller too.  

  
-   Development Time: The time to write an application will typically be shorter, especially for an inexperienced developer. The amount of code that needs to be written is reduced, making it easier to maintain.
  
-   Debugging Experience: This doesn’t apply to all platforms/languages, but those that do support debugging over USB will typically offer a good developer experience. This allows the developer to inspect variable values, step through the code line by line, and control execution. You can do this with C/C++ on an ARM Cortex processor using a hardware debugger (Single Wire Debug - SWD), but you’ll need to be using Eclipse or another desktop IDE rather than Arduino, MBed or any web-based IDE.
  
-   Memory Management: Correctly managing memory can be difficult, especially in complex projects. High-level languages take care of this for you.
  
-   Software Feature Availability: In contrast to the lacking hardware features, software features such as graphics on a screen or networking might be very well supported, linking back to Development Time.
  
-   Code Sharing: If you’re developing a web service to work with the embedded device in the same language, you can probably share code for objects and business logic between the two.
  

  
If you’re new to embedded development or don’t have any programming experience and feel as though you have been thrown in the deep end, a high-level language can save your project. Those languages are easier to pick up, get the job done faster, and allow for fewer bugs. The tutorials available for them running on a desktop environment are usually wholly applicable to the embedded environment, so there is no shortage of educational material.

I feel C# via the [.NET nanoFramework](/) (.NET nF) is one of the most powerful languages you can run on a microcontroller. This is the community successor to Microsoft’s .NET Micro Framework, which is no longer maintained. The .NET nF allows _interop_, which means you can run native code on the microcontroller for processor intensive or real-time functions.

Currently, the cheapest and most resource-constrained microcontroller that .NET nanoFramework runs on is the STM32F091, at a bit under US$2.50@100qty depending on your distributor and exact model. That gives you a 32bit 48MHz processor with 128kB of flash and 32kB of RAM. By comparison, an ATMEGA328 will set you back around $1.10 to $1.25 depending on package and distributor for an 8bit 20MHz processor with 32kB of flash and 2kB of RAM. Compared to the Arduino IDE, Visual Studio has the highest market share of any development environment and is incredibly powerful. The .NET nF integrates fully with Visual Studio, including the free community edition, so you can have the full debugging experience over USB, allowing you to catch exceptions, step through code and inspect (and change!) object values.

C# is one of the top five programming languages in use today, and arguably the most used in professional environments in all of web, desktop, and even mobile. So there’s an excellent chance a developer on your team has more experience with C# than with C or C++. You can likely use data classes written for a web or desktop application directly in an embedded project if they are both written in C#.

While certainly not lacking in features, the .NET nanoFramework doesn’t have the complete functionality of the ‘full’, ‘standard’ or ‘core’ Common Runtime Language (CLR). The heavily constrained resources of a microcontroller relative to a full computer mean some features are not feasible to implement. The .NET nF community is primarily working to implement mscorlib and the Universal Windows Platform (UWP) features. In addition to the aforementioned, some language/library features that I feel will save a large amount of time in an average project are:  

  
-   Very easy string manipulation and handling.
  
-   Parsing and building XML and JSON.
  
-   Accessing device storage (SD card and flash memory devices)
  
-   Networking (direct sockets, web requests, etc.)
  
-   WiFi (with external modules, or directly on an ESP32)
  
-   Hardware ‘drivers’ and other libraries available via NuGet
  

  
Using a language like C# via the .NET nanoFramework can greatly accelerate project development for IoT devices, sensors, wearables, and many other devices. While you couldn’t build a three-phase brushless motor controller with C# due to the timing constraints, the vast majority of projects can benefit from its rapid development pace. 

Upcoming projects on this blog will make good use of the .NET nanoFramework and serve as getting started guides and real-world project examples. While it’s a fantastic high-level language to use, there are many other languages you can run on a microcontroller. If you’d like to see some projects or articles focusing on them, let me know in the comments below!»

Check it out and join our [Discord community](https://discord.gg/gCyBu8T) for discussion.
