---
title: "Laurent Ellerbach: a year deeply in .NET nanoFramework"
description: "I’ve been using .NET Microframework since it appear and being sad when it’s been stopped. Since I’ve been watching nanoFramework. nanoFramework was not yet .NET nanoFramework when the initial fork…"
date: 2021-09-13T09:21:56Z
author: laurent-ellerbach
tags: [community]
wordpressId: 1031
---

I’ve been using [.NET Microframework](https://github.com/nanoframework/nanoFramework.Azure.Devices) since it appear and being sad when it’s been stopped. Since I’ve been watching nanoFramework. nanoFramework was not yet .NET nanoFramework when the initial fork happened almost 5 years ago. And thanks to José Simões, CEO of Eclo Solutions, co-founder of .NET nanoFramework and few others, nanoFramework has become a great platform to use in production for Micro Controllers Units. .NET nanoFramework a is fully community driven and independent.

When I started to contribute to .NET nanoFramework in September 2020, I was already one of the main [.NET IoT](https://github.com/dotnet/iot) contributor. And with others in the team, we saw a great potential of continuity between the work we were doing in .NET IoT and .NET nanoFramework. It’s all about helping C# developers to be more efficient and going to market in a shortest period of time for IoT devices. The potential is there, with all the hundreds of bindings, sensors, small screen available on .NET IoT, having them available for .NET nanoFramework will help to have as much reusable code as possible. Idea is to reuse as much code as possible between a .NET IoT application running on a Raspberry PI or equivalent and a .NET nanoFramework running on a small MCU like an ESP32 or STM32 chip.

Add in this story the great Azure IoT solutions and you can go to market very quickly using C# to manage, deploy and interact with your devices whatever they are, CPU or MCU based.

I slowly started my contributions on nanoFramework with some documentation improvements, and engaged discussions with José Simões. One of the first step to have the vision happening was to align the low level GPIO API, including SPI, I2C, UART and PWM. .NET nanoFramework was using a model based on Windows.Devices namespaces from the UWP time while .NET IoT uses System.Device namespaces. And the implementation behind each namespace is different. Meaning it’s not just a matter of naming but also a matter of API definition, enums and everything related.

My contributions on .NET nanoFramework has been very largely out of my work time. I means, I’ve been coding mainly early mornings, evenings, weekends and vacations. I only had few opportunities to do this on my working time. It’s been the same since I’ve been contributing to .NET IoT and continue to contribute. Some times has been more challenging than some others with a lot professional work, personal challenges in this complicated Covid situation. But it’s always been a moment of escape, pure and deep engineering, reenergizing, sometimes frustrating where I learned and found the best support of amazing community contributors, some colleagues and friendship with José even if we never met in person!

Adjusting core API is not never an easy task. You have to keep the old ones, have collaboration with the new ones, have some time for them to be stable, empty of bugs, port old elements to the new API and finally retire the old API.

.NET nanoFramework architecture looks like that:

![](https://docs.nanoframework.net/images/architecture.png)

_nanoFramework architecture_

Every low level API like System.Device.Gpio/Windows.Devices.Gpio on nanoFramework uses native C code. Meaning all the API which need to be adjusted in the core based image and on the C# level. And every single platform has different way of interacting with the low level part. So any adjustment that needs to be done needs to be executed for all platforms. And sometimes even on the same platform there are differences. The main ones for nanoFramework are ESP32, STM32, TI and NXP. Native code has to be changed, tested for all of the supported architectures and boards.

Every time you touch one of the low level API, you have to republish a full image and every time you change the signature of the high level corresponding API, you as well have to recreate a full image. Creating a new API implies as well testing on all platforms in real, at least on one representative image.

A year after, almost all API are aligned, the last one PWM is under work and should be here soon. And more than 50 bindings out of 70 interesting for .NET nanoFramework has been ported!

On the Azure connectivity, the work started with low level elements like HTTPS, MQTT broker, all the rest had to be done. Decision was to build the SDK using those existing elements in purely as managed code. Today, there is a full support to connect to Azure Device Provisioning Service (DPS) and Azure IoT Hub, with certificates or SAS token.

## Where to start

.NET nanoFramework is an exceptional piece of engineering build on .NET Microframework. It has evolved over now almost 10 years and solved a lot of problems that are still very common in the industry bringing a very straightforward way of developing using C#, Visual Studio 2019, placing breakpoints, debugging like any other .NET application. The ancestor, .NET Microframework has been designed by a Microsoft team and allowed to build and adjust a lot of elements in the fork when .NET Microframework stopped.

.NET nanoFramework internals are complicated when it comes to the low level part and can be overwhelming. You have a Real Time OS (RTOS), low level Hardware Abstraction Layer, low level Platform Abstraction Layer, all this in C, a bit of C++, a lot of CMake files, tons of headers and dependencies. Each MCU family is different so there are a lot of concepts to digest just for this part.

On top of this each founder comes with their own tools, always quite complex, never the same, building an image sometimes requires to clone 5 directories, install specific tools which sometimes only work on a specific OS.

The .NET code is interpreted, so there is a full CLR, a debug protocol called the Wire Protocol. And a lot of interaction with all those elements.

There are as well tools like nanoFramework flasher, hex2dfu, the nf-debugger, the Visual Studio Extension and great Azure pipelines to automate everything and GitHub actions.

The C# side is easier of course to handle as it’s just C# 😊Still, .NET nanoFramework does not support generics (yet), has no async, no linq and a subset of features compare to the big .NET brother.

I naturally started on the C# side. I started by coding the C# part of the new System.Device.Gpio. José did fully the native part. And it was still a bit of magic when I saw all what he had to adjust.

## nanoFramework.WebServer

One of my real first contribution was creating a [WebServer for nanoFramework](https://github.com/nanoframework/nanoFramework.WebServer). Quite some people asked for this to be able to have a simple REST API mechanism but as well a way to display webpages. In the embedded world, you may not have a screen to setup or interact with your device, so a simple web access is something nice to have.

SSL is well supported, so those little MCU deserved a real web server! I had from the .NET Microframework time and later on, during the UWP time, my own web server. It was quite basic but worked very efficiently. So I had the base to start. On top of that I wanted to be able to give the nice MVC way of creating webserver, and an authentication mechanism with keys or the traditional basic HTTP one.

I came up with a solution based on attributes. .NET nanoFramework like his big brother do support reflection. So here we are now with a lovely, very easy to use, and integrating great feature Web Server for .NET nanoFramework in Novembre 2020!

Then I wanted to go a bit deeper and build my own image. This is where I faced my real first challenges with .NET nanoFramework.

## The Dev Container

Building your own custom image requires a full tool chain, the board package from the chip vendors, the RTOS sources and couple of more repositories with tools and extensions. The great news is that [scripts are available to install what’s needed](https://github.com/nanoframework/nf-interpreter/tree/develop/install-scripts) on Windows. Repositories can be pulled up automatically when you build. And all is perfectly integrated in [VS Code](https://code.visualstudio.com/).

I started my first few builds happily and it’s once I’d like to give a try using Azure RTOS instead of ChibiOS for an STM32 chip that I faced hard challenges. First, the branch for Azure RTOS was very new, José just started and I wanted to help. Second, I was on vacations with a very slow internet connection. And third, I had challenges with some of the repositories cloned and tools installed. So I decided to go for [Dev Container](https://code.visualstudio.com/docs/remote/create-dev-container) and place all what’s needed to build in a container. Making it easy for developers to just connect, having all the tools, all the repositories, everything ready to just build anything. I asked a bit of help from one of my colleague who is a Dev Container master. The challenge here is that there are really a lot of things to clone, a lot of specific tools.

Dev Container is a great way to have a separation on your working device where you just need docker support and you just don’t have to install anything else directly on your machine. On a Windows 10 machine with WSL2, everything is setup automatically when installing Docker Desktop but you can achieve the exact same with few command lines. The tools and what’s needed will just be into the container keeping your normal working environment clean.

And when you add all those tools together, you rapidly arrive to few Giga bytes of container! Just that! Building it from scratch is taking a bit of time (count 25 minutes with a good internet connection). Second challenge is availability of some tools on the Linux platform. Yes, Dev Containers are Linux based. .NET nanoFramework is perfectly building on Windows for years, including in the Azure pipelines. I had to correct in the source code quite some lowercase and path issues.

Linux is file case sensitive, Windows as well but always find a way to take an existing file with the same name but not case sensitive. That’s the case for folders and files.

The path issue is the classic / and \\. While Windows is very tolerant with any of them, it’s not really the case for Linux which is super strict and only recognize /.

The more complicated part was to find the right tools from each chip vendors to work on Linux, adjust the CMake to run the correct one. While in Windows you specify .exe or .bat to run an executable, it’s more a matter or ./ on Linux with usually no extension.

And last, some of our internal .NET nanoFramework tool like [hex2dfu](https://github.com/nanoframework/hex2dfu) was only working on Windows. This tools was used to convert the created images in something that can be easily flashed. So I decided to fully reimplement this tool in .NET Core 3.1 (.NET 5 now).

After quite some efforts, the [Dev Container was working](https://github.com/nanoframework/nf-interpreter/tree/develop/.devcontainer) and a detailed [step by step documentation](https://docs.nanoframework.net/content/building/using-dev-container.html) available. Later in January, I’ve been using the GitHub Container Registry to prebuild images and reduce the time it takes to get ready with them. I’ve been building [GitHub Actions](https://github.com/nanoframework/nf-interpreter/tree/develop/.github/workflows) as well to rebuild them when needed.

## What about Tests?

I remember that I asked José about what would be really great to add the .NET nanoFramework on top of the API alignment work we’ve been started. His answer was straight forward: tests. In the fork of .NET Microframework, tests were lost. .NET Microframework had a lot of tests, running on a custom loader, packaging them in a Visual Studio digestible format. There’s been couple of attempt during the previous 4 years to have them back somehow. But none went to the end.

This one implied quite a chain of tools: the Visual Studio test platform, the [nano Debugger](https://github.com/nanoframework/nf-debugger*), some nanoFramework C# code and quite some ingenuity to find a way to run the tests both on your normal Windows development and on the device itself.

The full story is already available in this [Show Dotnet](https://devblogs.microsoft.com/dotnet/show-dotnet-build-your-own-unit-test-platform-the-true-story-of-net-nanoframework/) article. But in short, I’ve been learning a lot on how to write a Test Adapter and Executor for Visual Studio, that works as well in an Azure pipeline. To get the first prototype working, I coded almost a full weekend and took 2 days of vacations right in a row and with the usual great help of José, we made it! The first release uses only the nanoCLR Win32 application which is a command line application capable of running the exact same CLR as the one running on the MCU and loading the exact same code. That was perfect for the first target: mscorlib.

It came as well with the migration of tens of thousands lines of code tests. I remember I was so obsessed by having all of them available that I spent nights over weeks to migrate them all!

This allowed to find few problems into mscorelib and was great because it allowed to fix the quality of it. Demand quickly came to have the real device support, being able to run the test there as well. Here, I would have to interact with the device. Find the device, connect with it, check the capabilities, upload the files, run the tests. All those elements are part of the Visual Studio extension and one more time with the help of José, in a weekend, everything was implemented.

Every time I see those tests running either on my machine either on a real device, I feel very proud and something still feels very magic 😊. Here as well, the developer experience is what drove me. You just want to use the same tool as you are used to use. You want to write tests, see them in your Test Explorer, hit play, have them running, see the result, see the green or red mark in your code.

There is still some work to be done in this area to go further. Capacity to debug the tests and capacity to have some code coverage. Both involve more complicated scenarios and may be implemented in the future.

End of March, the current [Test Framework was fully available](https://github.com/nanoframework/nanoFramework.TestFramework). And it was time for me to move to the next challenge: continue the API alignment and play with low level C code.

## ESP32 LiLyGo target

To be able to understand deeply the platform, you need to go deep into rebuilding fully a target, adjusting low level code, adding some code. I did that for [ESP32 LiLyGo boards](http://www.lilygo.cn/prod_view.aspx?TypeId=50063&Id=1307&FId=t3:50063:3). Those boards are based out of ESP32 and have both a Wifi and Ethernet connectivity with POE available. I had a scenario for that at home. So let’s go, let’s build a target for it. The Ethernet controller was already present in the image, so it was mainly about aligning the CMake, few options, adjust the Azure build pipeline and here we go!

## System.Device.Spi and System.IO.Ports from C to C#

While in the low level, it was time for the big step and migration of [System.Device.Spi](https://github.com/nanoframework/System.Device.Spi). José worked on the native side of System.Device.I2c as well while I worked on the C# side. But now, was really time for low level coding.

So I jumped into this one and did the full stack from C code to C#, tested and adjusted for all platforms. This is the moment I loved my Dev Containers, was great to just count on something working, you just have to reference and magically contains all what’s needed and just works.

The other elements I liked was the Test Platform, I was able to write real hardware tests and deploy them into an ESP32 where I ran real hardware tests. In April, this one was done.

I continued the work with [System.IO.Ports](https://github.com/nanoframework/System.IO.Ports) in May. Same situation, same love of the Dev Containers and the Test Framework.

## From migrating.NET Microframework test to System.Text.RegularExpressions

Over time, I continued to migrate tests from .NET Microframework to .NET nanoFramework where it made sense. And found a forgotten part in there with Regular Expressions. I’ve been using regular expression for years without really taking the time to go deep and understanding how they are working. So it was a great opportunity for this.

The code was quite old and the lib used was clearly coming from C/C++ code. I’ve decided to clean the code, port it for .NET nanoFramework, adding tests with the Test Framework as well. There are many native C libs doing this which would have only require to expose the C# API but as this code was there, even if not perfect, it was a good opportunity to just reuse and adjust it. Usage of Regular Expressions in an MCU is limited to few scenarios usually involving a Web Server or equivalent and where you have to manipulate text. So that fits perfectly in a pure managed scenario.

The library is not perfect but does a very decent work for a complex usage even if there are few known limitations. [System.Text.RegularExpressions](https://github.com/nanoframework/System.Text.RegularExpressions) just appeared with quite some tests covering the main usual scenarios.

## Logging on top of Debug

When you write application, logging is an important element. A basic Debug one is available for .NET nanoFramework but you may want to log to a file or a serial port. And logging is used as well on .NET IoT in some of the bindings. So a compatible API was needed. The original one is based out of Microsoft Logging pattern. As always in this exercise, it’s about finding the right balance between being nano and having enough features.

The [nanoFramework Logging Platform](https://github.com/nanoframework/nanoFramework.Logging) is then compatible with the full .NET framework, as always, a bit of code has to be adjusted. But it does as well includes a way to have your own formatting, a factory to use one of the logging elements and an extensibility because you can as well write your own logger!

## NetworkHelper: make it easy and always working to connect to wifi

Being able to connect your MCU to wifi is one of the key scenarios. All samples had various helpers to make this happening but there was no pure nuget that will allow you to get it done in 1 line of code. And as I suffered a bit at some point and as there were with issues with the ESP32 platform, I took few hours to create the [helper](https://github.com/nanoframework/Windows.Devices.WiFi) and have something that will always work.

It was the occasion to enhance [System.Threading with support for CancellationToken](https://github.com/nanoframework/System.Threading). Those token are a nice way to cancel a loop. That’s something that will be needed in some of the bindings as well as in the Azure SDK. As usual, the Test Framework was the best help for the implementation.

## UnitsNet on the way!

.NET IoT uses [UnitsNet](https://github.com/angularsen/UnitsNet/) for any unit that any sensor exposes in the bindings. In short, all API expose Temperature, RelativeHumidity, Pressure and other units rather than Celsius or Kelvin or Farenhiet, Pascal or whatever you’re interested in.

As a developer, when consuming it, you can just ask to give you the proper unit you’re interested in. The challenge here is that nanoFramework has limited space. So rather than having a big nuget containing all the units and all the mechanism, we needed a way to get single ones. We would loose the possibility to write something like speed = meter / seconds. But that was a good enough compromise to get support for UnitsNet.

UnitsNet is a fully open source project and the way the .NET and UWP nuget are generated is with a code generator using templates. So I wrote the [templates and the code generator for .NET nanoFramework](https://github.com/angularsen/UnitsNet/tree/master/CodeGen/Generators) compatible nuget. The UnitsNet maintainer were supportive, especially [Andreas Gullberg](https://github.com/angularsen) the creator of UnitsNet, and allowed us to create and generate lots of nuget for each units we needed. For a better readability, it has been decided that all the nanoFramework nuget will be published by UnitsNet. As always José played a key role by helping to setup properly all the build pipeline, generating all the needed nugets. Even if this work on creating those nuget was started months back, the first ones were available in May right on time for the next step.

## .NET IoT bindings conversion to .NET nanoFramework

Two times per year, in my organization, [Commercial Software Engineering](https://devblogs.microsoft.com/cse/about/) at Microsoft, we have a hack week. A great opportunity to learn new technologies, work on Open Source projects, meet new colleagues. I took the opportunity to submit the project for the binding migration for the May session. If you arrived up to here in the reading, you’ve seen that almost all API are now available, the Logging framework as well, cancellation token, the test framework.

The challenges are complex when it comes to code transformation. Even if the code is all C#, due to the nano CLR, generics are not available (yet), no async, no await, enums are just numbers once compiled, there is no Console.Write and few other specificities. Also, creating a binding where memory and speed execution is not the main challenge is something very different on a small MCU where memory foot print and code optimization is important.

Take into account that the project types (csproj vs nfproj) are also different, the nuget used as well. It’s important to find a way to identify any possible UnitsNet in the code, associate on the generated code, the correct UnitsNet.nanoFramework nuget. Same for System.Device.\* as in .NET nanoFramework, everything is for size reasons in small nuget.

With a team of few motivated Microsoft colleagues and Robb from the .NET nanoFramework community, we worked on a [code converter](https://github.com/nanoframework/nanoFramework.IoT.Device/tree/develop/src/nanoFramework.IoT.Device.CodeConverter) and then started to tackle manual adjustments for each bindings. The test one has always been the [Bmxx80](https://github.com/nanoframework/nanoFramework.IoT.Device/tree/develop/devices/Bmxx80) as it’s complex and simple at the same time. Allowing to go through a lot of scenarios.

Some other needed namespaces has been made available as well, first as shared project and more recently as [independent nuget as well](https://github.com/nanoframework/nanoFramework.IoT.Device/tree/develop/devices#net-system-libraries). In a week of effort, we got our first binding available, some magic of José with the pipeline and new nugets were available. I continued to migrate more bindings, in a month, [more than 50](https://github.com/nanoframework/nanoFramework.IoT.Device/tree/develop/devices) were available.

There are still more to migrate, some needing PWM which will arrive soon, some needing either generics, either a lot of rework. Some are not perfect, some others not fully tested. Most of the Readme are still those from .NET IoT. But a large part of the hard work is now done.

That moment was a good opportunity to show how those binding code can be reused, how fast, simple and transparent it is for C# developers to use them. I decided to write a new article for [Show Dotnet](https://devblogs.microsoft.com/dotnet/show-dotnet-running-my-net-nanoframework-for-8-years-on-a-battery/), this time about how to run .NET nanoFramework on a battery for 8 years! The example I gave is a real one, I added in my garden for some time on a solar panel and battery, all connected to Azure.

## Azure, here we are!

Connecting .NET nanoFramework to Azure was already possible either through HTTPS, MQTT or AMQP. [Samples](https://github.com/nanoframework/Samples/tree/main/samples) in the repositories showed how to do this, how to connect, post and get information, use MQTT or AMQP. But nothing was really packaged in a nice way. You would still have to understand how to create a shared signature, all the back and forth mechanism for the communication with Azure.

It was time for me to work on a proper Azure SDK. I know quite a lot of colleagues working in the Azure IoT team and in the discussions, it was clear that if I built a SDK, it should be using MQTT. That’s the direction the Azure IoT team is taking.

First step was to clean, refresh and fix some issues in our [nano MQTT broker](https://github.com/nanoframework/nanoFramework.m2mqtt). Originally a fork from Eclipse Paho which was same code base for UWP and Phones with little updates over time. I then first cleaned, removed all non-necessary code, focused on keeping only the nanoFramework related one, removing the ability to be a MQTT Server because, well, the scenario is not really existing on such small MCU. The original port was only coming from C/C++ with all the const in capital letters, few enums. The first cleaning was about with a minimum of breaking changes in the external API a large cleanup of the code. It came as well with a rename of the namespace to be more clear.

The second step on the MQTT library came later with the addition of MQTT 5.0 support and the addition of [tests applications](https://github.com/nanoframework/nanoFramework.m2mqtt/tree/develop/TestMqtt/TestAppv5.0) connecting to public MQTT 5.0 servers including Azure IoT Hub with the current preview. I would have love to use the Test Framework but the nanoCLR win32 still doesn’t have networking support (that’s coming!).

There is still work to be done in this cleaning phase and improvement, the MQTT implementation is leaking memory when used intensively and those are complex problems to solve not to impact too much the performances. There is no memory leak issue when using to send or receive messages every second or so.

The good news is that on the Azure side, and in general on [docs.microsoft.com](https://docs.microsoft.com/), you can find lots of great documentation on how the [communications protocols are working between 2 components](https://docs.microsoft.com/en-us/azure/iot-hub/iot-hub-mqtt-support), the API, even [SDK are open source on GitHub](https://github.com/Azure/azure-iot-sdk-csharp).

To implement the Azure SDK, the nanoFramework example already had a lot of elements. It was then a matter of packaging everything, aligning the API with the .NET SDK. On the way, the [nanoFramework JSON library](https://github.com/nanoframework/nanoFramework.Json) had to be improved, José took care of this and we have now a rock solid JSON serializer, deserializer and a concept of JObject using Hashtable. The nano JSON class is a jewelry of ingenuity and really fast even if all is in managed code!

While implementing the SDK, I hit issues with SSL on low end ESP32 devices, this had to be fixed. Adrian who is the father of ESP32 support for nanoFramework did a first pass on this, José a second one later over the summer.

With a first version available, with IoT bindings available, it was time to [IoT Show](https://www.youtube.com/watch?v=TLYqRdmmj5k&list=PL1ljc761XCiYVaDEfS4X-f493capyL-cL&index=3) all this and record in July a show with Olivier. We had very positive feedbacks from developers and more requests for more shows with .NET nanoFramework. Also more developers joining the project. At this stage, the nanoFramework [Azure IoT Hub](https://azure.microsoft.com/services/iot-hub/#overview) SDK supports almost everything that you can do with the MQTT protocol: connecting using a certificate or SAS token, sending telemetry, reporting twins as well as receiving cloud to device messages, twins and function call back. So really everything you can do with the full .NET SDK and with aligned API requiring very little adjustments to reuse code.

[Device Provisioning Service](https://docs.microsoft.com/azure/iot-dps/about-iot-dps) (DPS) was the next Azure IoT service to be added. DPS is great as it allows to dynamically allocate a device caring as well its configuration and twins. For this one as well, all scenarios are supported, group and individual enrollments, certificate or SAS token based.

And that was the occasion to record another episode of the IoT Show with Olivier to be published very soon.

Azure plug and play support is what’s missing also advance DPS scenarios are missing when the device certificate or SAS token is changed on the fly in the allocated Azure IoT Hub. Something that will definitely going to be added soon.

The [nanoFramework SDK](https://github.com/nanoframework/nanoFramework.Azure.Devices) is very easy to use, in 2 lines of code, you are connected to DPS, in another 2 lines, to Azure IoT Hub. In 1 line you can get your twins, with another one to post telemetry.

## PyBStick a nice STM32 based community board

I bought some time ago a STM32 board which originally contained a micro python implementation, [PyBStick](https://github.com/mchobby/pyboard-driver/tree/master/PYBStick). That was for me the occasion to play with creating my own community board. I ended up creating a full detailed documentation on how to create your own [STM32 based community board](https://docs.nanoframework.net/content/stm32/create-community-board.html). .NET nanoFramework makes it super easy to do it. It was just not documented. I had quite some fun adding the support for it and learned on STM32 chips which I haven’t really played much with.

## Creating Board Package for M5 Stack, M5 Stick and MagicBit

Always thinking about the developers and always having in mind to make their life easier, the idea is to create board packages for the popular [M5 Stack and M5 Stick](https://m5stack.com/) based on ESP32. This will take the form of a nuget that you’ll install and will allow you to create the board with everything already setup. That does require development of few bindings and as well working on the screen support.

That’s the current project we’re currently working on. This time, I have my own engineering team working with me for few weeks. This is mainly because we are between 2 projects and have some spare time while closing everything from the previous one and preparing for the next one. A great opportunity for the team to discover low level development and the easiness of .NET nanoFramework. And as they are smart engineers to bring a lot of value for .NET nanoFramework. Stay tuned for the results!

[MagicBit](https://magicbit.cc/learn/) is the next to come for the support. This kit is ESP32 based, had a great success on Kickstarter.

In all the cases, the screens are the challenging part. So far, only few drivers in native nanoFramework are available and can only be setup when the image is build. I’m currently working on adjusting this, so making it possible to have support for different popular screen drivers, being able to set them up in the managed code as well as being able to set the screen size in the managed code. This is quite complex operation and requires some time. Once done, we will be able to issue few generic ESP32 images containing the various drivers, and anyone who want to use a screen will be able to do it fairly easily. The graphic part was more experimental so far and hopefully will become main stream in .NET nanoFramework.

## Conclusion

I learned a lot. Really a lot. I should write I learn tons of things! I had a lot of problems to solve, brought a lot of value to .NET nanoFramework in a year while continuing to bring value as well in .NET IoT creating more bindings, supporting developers, fixing issues. I love documentation as well and I cleaned and worked on [docs.nanoframework.net](https://docs.nanoframework.net/) as well all the way. I’ve been producing clean readme and samples to make it as easy and complete as possible on any repository I’ve been working on. On top, I gave a hand to José on the rework done on the nano Debugger to move from the Windows namespace to the System.IO.Ports one. A move needed to get closer to multiplate form and SDK.

I more than enjoyed my journey so far allowing me to bring my .NET, IoT and low level protocol development passion all together, making it easier and easier for C# developers to do embedded MCU based development. Being part of an open source project like .NET nanoFramework is about driving impact to many .NET developers. I can only encourage anyone to contribute, even just a little bit, even if it’s to correct a broken link. Everything starts somewhere.

Just [click here to start your journey](https://docs.nanoframework.net/content/getting-started-guides/getting-started-managed.html). It will quickly bring you [here in our GitHub repositories](https://github.com/nanoframework) and in our [Discord channels](https://discordapp.com/invite/gCyBu8T).

I found new friends on the way as well like José! I’ve been welcome as well in the .NET nanoFramework core team. And I can’t wait to meet all of them in person.

The good news is that there is work to be done for years on this platform. The vision is clear, the next big steps are around moving to SDK and better cross platform support while continuing to add more value to the C# developers.
