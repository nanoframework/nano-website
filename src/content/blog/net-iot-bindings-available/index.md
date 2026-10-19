---
title: ".NET IoT \"bindings\" available"
description: "As we have announced, work is underway to align .NET nanoFramework and .NET Core IoT APIs. A bonus coming out of this effort was to be able to use the huge number of “bindings” that exist in the…"
date: 2021-05-26T09:38:16Z
author: jose-simoes
tags: [releases, tooling]
wordpressId: 1006
---

As we have announced, work is underway to align [.NET nanoFramework](https://github.com/nanoframework) and [.NET Core IoT](https://github.com/dotnet/iot) APIs. A bonus coming out of this effort was to be able to use the huge number of [“bindings”](https://github.com/dotnet/iot/tree/main/src/devices) that exist in the [.NET Core IoT](https://github.com/dotnet/iot) repository.

During last week, an enthusiastic and relentless team made that happen and, at the time of this writing, there are now more than 50 of those “bindings” available as [NuGet packages](https://www.nuget.org/packages?q=nanoFramework.iot.device). A “binding” can be one or multiple sensor, display or other embedded elements from the same family. And, of course, samples and schematics are available too. ;)

This was during an “One CSE Week“ event, which is held twice a year with the goal to work on a project, to learn and to bring positive impact in the community. CSE stands for [Commercial Software Engineering](https://devblogs.microsoft.com/cse/), a division of Microsoft.

Part of the preparation work for the event was developing a converter to speed up the process. Basically, the tool grabs an existing .NET IoT “binding”, creates the corresponding .NET nanoFramework solution, parses the code file to replace obvious code patterns, replaces the references to the appropriate NuGets and writes the nuspec that allows packaging the “binding” as a NuGet ready to use in a .NET nanoFramework project. This transformation includes as well the basis for the test projects.

Despite this converter being tremendously helpful, it can not do all the work. Depending on the complexity of the code, it requires more or less work (and brain power) to replace things like generics and other language features that are not available in .NET nanoFramework.

The “conversion” process is an interesting exercise in a matter that it allows developers to become familiar with the API, coding patterns and limitations imposed by the reduced API and features available in .NET nanoFramework. All this can be very challenging at times!

Besides the joy of seeing the error count eventually reaching zero, it can also be fun as one can see the code you’re working doing things like controlling a motor, blink lights, read a sensor or output to a display.

Also, as part of this event, we now have [System.IO.Ports](https://docs.nanoframework.net/api/System.IO.Ports.html) namespace which brought back the good old SerialPort that’s replacing the Windows.Devices.SerialCommunication library. System.Device.Pwm library will follow shortly.

A huge thanks to [Anders](https://github.com/AndersTh), [Konstantin](https://github.com/gukoff), [Marco](https://github.com/CaronteDemonio), [Max](https://github.com/zeier), [Laurent](https://github.com/Ellerbach), [Robb](https://github.com/rschiefer) and [Sascha](https://github.com/TechPreacher) that made this happen!

This is an ongoing effort and there are still several “bindings” that need to be ported. This is a great learning opportunity for anyone that wants to learn more about .NET nanoFramework or contribute to the project. So, if you fit into one of these categories, or are just looking for a coding challenge, by all means, clone the [nanoFramework.IoT.Device](https://github.com/nanoframework/nanoFramework.IoT.Device) repo, grab one of [pending](https://github.com/nanoframework/nanoFramework.IoT.Device/tree/develop/src/devices_generated) “bindings” and have fun! :)
