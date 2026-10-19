---
title: "nanoFirmawareFlasher is here!"
description: "The nanoFramework toolbox just got a new addition: nanoFramework Firmware Flasher."
date: 2019-07-04T18:10:37Z
author: jose-simoes
tags: [releases, tooling]
legacyComments:
  - id: "7"
    author: "sg"
    date: 2019-07-05T10:59:51Z
    body: "Hi, does this mean we can build application targeting dotnet core instead of .NET FW? If yes, is it possible for you to share some resource please?"
  - id: "8"
    parent: "7"
    author: "José Simões"
    date: 2019-07-05T13:21:08Z
    body: "Hi @sg  \nThis is about nano Firmware Flasher which is a .NET Core Tool. Nothing to do with the build system. We are not changing our target platform, which is nanoFramework."
wordpressId: 757
---

The **nanoFramework** toolbox just got a new addition: [nanoFramework Firmware Flasher](https://github.com/nanoframework/nanoFirmwareFlasher).

This new tool is a CLI provided as a [.NET Core Global Tool](https://docs.microsoft.com/en-us/dotnet/core/tools/global-tools).

And why is this so special you may ask!

A [.NET Core Global Tool](https://docs.microsoft.com/en-us/dotnet/core/tools/global-tools) is a special NuGet package that contains a console application. It gets installed on the developer’s machine in the default location and is made globally available in the command prompt.

The install is made with a simple call to the [dotnet CLI](https://docs.microsoft.com/en-us/dotnet/core/tools/?tabs=netcore2x) and updates are provided through NuGet (just like any other NuGet package we are used to).

Check out how easy it is to install:

```shell
dotnet tool install -g nanoff
```

How cool is that! 😊

It supports targets for both ESP32 and STM32 platforms (the remaining ones will be added shortly).

Now, let’s drill down into the tool functionalities.

With it, one can update the firmware image right from the official Bintray repositories. This is valid for all development, stable and community targets. The fw version can be specified, or the latest available package can be used. Just like this:

```shell
nanoff --update --platform esp32 --serialport COM31
```

Along with the firmware package that includes both the nanoCLR and nanoBooter (except for ESP32 targets that have their own bootloader) it can also include a deployment package (C# program). This means that the full programming of a device can be easily be accomplished for example in a production environment. Because this is a CLI tool, the full process can be completely automated!

It also allows the backing up the deployment area for ESP32 targets (support for other platforms will be added).

Restoring a deployment image is also possible for all targets.

Specifically for STM32 targets, it works with both JTAG and DFU connected devices. One can even list the connected devices on any of these options. Again, this can be handy for production environments.

As usual let us know if you find any glitches and what features you’re missing.

If you haven’t done so, make sure you join our [Discord community](https://discord.gg/gCyBu8T) and follow us on [Twitter](http://www.twitter.com/nanoframework).

Have fun with nanoFramework!

PS: we are "hiring"! If you like to develop for embedded systems join our team.
