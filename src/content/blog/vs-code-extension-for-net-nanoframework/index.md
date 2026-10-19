---
title: "VS Code Extension for .NET nanoFramework"
description: "We’re just adding a brand new extension to VS Code to enjoy .NET nanoFramework on multiple platforms. When I write multiple platforms, read Windows, Linux and MacOS."
date: 2021-11-25T09:45:58Z
author: laurent-ellerbach
tags: [tooling]
wordpressId: 1124
---

We’re just adding a brand new extension to [VS Code](https://code.visualstudio.com/) to enjoy .NET nanoFramework on multiple platforms. When I write multiple platforms, read Windows, Linux and MacOS.

.NET nanoFramework was historically only working on Windows and with [Visual Studio](https://visualstudio.microsoft.com/vs/). That was it. The key reasons were historic, coming from .NET MicroFramework, as tools were only available for Windows. 5 years past, as the .NET community has been growing, as .NET has been embracing other platforms than Windows and as the developers can choose their preferred platform, it is time to go to other platforms as well. With VS Code - which became the most popular development tools on most platforms - we were getting more and more questions about non-Windows platform support and being prompted for a VS Code extension.

![](https://nanoframework.net/wp-content/uploads/nano-vs-code.gif)

_VS Code extension experience_

All this is coming to reality! The journey there brought a lot of technical challenges that we had to address one by one. Before going thru the challenges, the above gif shows a quick example on what can be accomplished with the current features offered by the extension. In short: flash a new firmware on a device, build code and deploy it to a device. Those 3 elements required a lot of work to put together in order to have the building blocks and then a great experience on a proper VS Code extension.

## First challenge: having a flashing tool that can run everywhere

_nanoff_ is the short name for nano Firmware Flasher, the tool to flash your device with .NET nanoFramework. It was the first element we needed. The tool is using other external libraries to flash the device.

Behind the single command of \`nanoff –platform esp32 --update --preview --serialport COM3\` a lot of magic happens for all the supported processors, ESP32, STM32, NXP and TI. They are all using external tools. And all those tools are packaged differently, sometimes even differently per platform.

As an example, the ESP32 flashing tools are python based. First challenge is to be able to package the tool and its dependencies, so not having to have python installed or anything else. And this is a work that has to be done on each platform. For this purpose, we’re using [PyInstaller](https://www.pyinstaller.org/). It allows to package all what’s needed in a single folder. The ESP tools need to be installed on each target platform and PyInstaller needs to run on each platform. Check the result in the [nanoFirmwareFlasher repository](https://github.com/nanoframework/nanoFirmwareFlasher/tree/develop/lib/esptool).

A similar approach was necessary for STM32. ST Microelectronics provide an application for each platform, then it’s about cherry picking every needed element and adjusting.

Drivers are coming with nanoff and they also need to be packaged. It’s easier on some platforms, more complicated on others. You can see all the packages per platform and tools [here](https://github.com/nanoframework/nanoFirmwareFlasher/tree/develop/lib).

Last challenge was the size. A NuGet package can’t get too fat: there is a limit of 250MB. So it’s really about optimizing some of those elements to fit into the maximum size! By having all three platforms in there, the size had drastically increased as well. nanoff is packaged as a .NET tool and written for .NET 5.0.

Finally, in the code it’s about branching depending on the OS. The _RuntimeInformation.IsOsPlatorm_ function is your best friend. Typical example:

```csharp
if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
{
    appName = "esptool.exe";
    appDir = Path.Combine(Program.ExecutingPath, "esptool", "esptoolWin");
}
else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
{
    appName = "esptool";
    appDir = Path.Combine(Program.ExecutingPath, "esptool", "esptoolMac");
}
else
{
    appName = "esptool";
    appDir = Path.Combine(Program.ExecutingPath, "esptool", "esptoolLinux");
}
```

And finally, all this does require a lot of manual tests. There is no other way. All has to be tested on native machines. Native Windows, native MacOS, native Linux. VMs are not good enough for those scenarios. And for all the targets we have!

## Second challenge: building .NET nanoFramework on all platforms

The way .NET nanoFramework code is build is through the normal msbuild tool chain and then with a specific application called _metadata processor_. The role of this application is crucial as it does transform the normal dll/exe with the Intermediate Language (IL) code into a Portable Executable (PE) code that can be interpreted on every device by nanoFramework's execution engine and .NET Base Class Library.

In short, extracting from the dll/exe the core part of .NET and stripping away all what is not necessary like reducing enums to their strict minimum: a simple number.

This code is currently in .NET 4.7.2. Why 4.7.2? Well, because this is used in the Visual Studio extension and Visual Studio extensions have to be coded using .NET Framework 4.7.2. Like all the debug elements are as well 4.7.2. We’ll get back to that later as well.

Here are the options: find a way to make the current components work on Linux and MacOS or adjust them to work on a more recent .NET version like .NET 5.0 or 6.0.

The last option would require to adjust some of the code, have multiple version of the same elements. Because there are other dependencies in all this, linked to the Visual Studio extension. The only logical option that was available: make the current .NET 4.7.2 version work on the other platforms.

[mono](https://www.mono-project.com/), my dear mono, you can most likely save us. You’re working on multiple platform, even old ones like armv6. And best of all this, you are here to run less modern versions of .NET like 4.7.2 on various platforms. And we know it’s possible as Micro Hobby, one of our .NET nanoFramework contributor has been playing with all the tool chain and has been proven that [it was possible to use](https://microhobby.com.br/blog/2021/06/24/how-to-run-net-nanoframework-on-linux/).

So it was now about making it industrial and working everywhere in a transparent way. .NET nanoFramework uses a specific project type called _nfproj_. If you look at those, they are just regular csproj (old version) with few more elements.

Opening one and you’ll get something specific like this:

```xml
<PropertyGroup Label="Globals">
    <NanoFrameworkProjectSystemPath>$(MSBuildExtensionsPath)\nanoFramework\v1.0\</NanoFrameworkProjectSystemPath>
</PropertyGroup>
<Import Project="$(NanoFrameworkProjectSystemPath)NFProjectSystem.Default.props" Condition="Exists('$(NanoFrameworkProjectSystemPath)NFProjectSystem.Default.props')" />
<PropertyGroup>
    <Configuration Condition=" '$(Configuration)' == '' ">Debug</Configuration>
    <Platform Condition=" '$(Platform)' == '' ">AnyCPU</Platform>
    <ProjectTypeGuids>{11A8DD76-328B-46DF-9F39-F559912D0360};{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}</ProjectTypeGuids>
    <ProjectGuid>{02118A19-3E52-45FE-A827-50814366F917}</ProjectGuid>
    <OutputType>Library</OutputType>
    <AppDesignerFolder>Properties</AppDesignerFolder>
    <FileAlignment>512</FileAlignment>
    <RootNamespace>Iot.Device.AD5328</RootNamespace>
    <AssemblyName>Iot.Device.AD5328</AssemblyName>
    <TargetFrameworkVersion>v1.0</TargetFrameworkVersion>
    <DocumentationFile>bin\$(Configuration)\Iot.Device.AD5328.xml</DocumentationFile>
    <LangVersion>9.0</LangVersion>
</PropertyGroup>
```

Important elements here are the NanoFrameworkProjectSystemPath, it gives the path to the elements from the Visual Studio extension. All what is needed to build properly .NET nanoFramework. There are few more elements here that is used by the meta processor to recognize the project like the guids and the target framework version. And few more elements that are later in the nfproj file.

As you can imagine, without Visual Studio, no $(MSBuildExtensionsPath) or like before Visual Studio 2022, $(MSBuildPath) we were using. And we just want a great experience. You clone our [samples](https://github.com/nanoframework/Samples) repository, you open it in VS Code, you select your project and build, all should just work. Good news is that when using MSBuild, you can pass parameters and override all those. That is what we will do with this path.

Let’s start putting all these together. We need to have mono develop installed, that will bring everything needed to build a .NET 4.7.2 project, so it will recognize properly the nfproj and with the MSBuild option compatibility gives what’s needed to override the path and give the needed one to the extension elements. That will translate into one of the build option:

```
/p:NanoFrameworkProjectSystemPath=path_to/nanoFramework/v1.0/
```

Oh, and don’t forget to restore your project before building! ;-) You know, all those NuGets you need to have available. Good news, NuGet is already cross platform. So it’s mainly about running it before building so it can do its magic, then MSBuild and we should be good to go! Few tests later on multiple platforms, MacOS M1, MacOS x64 and Linux x64, we are good to go! Windows will be handled in a different way, we don’t need mono as we can install the Visual Studio MSBuild tools! Still it all required a lot of testing and adjustments to have something fully functional.

And right, in short, that’s what you need. With few more options, you can adjust an output path, build in Release or Debug. And _voilà_!

## Third challenge: deploying on the device

Yes, we can flash the device, we can build, now it’s about deploying! First good news is that nanoff can flash code. When you build with the previous method, for all applications (not libraries), a binary file with the bin extension is created. And this file can be deployed on the device. Great, you’ll say. Yes but partially. Why? Because this method is quite brutal. It will not check what’s on the device, if the image is compatible, is a library missing, are the versions correct.

That’s a better than nothing solution and in the case the device may not be recognized, it’s a good alternative. So let’s keep it. But let’s investigate on what can be better.

Better is about using the actual extension code, in a similar way used for the [Unit Test platform](https://github.com/nanoframework/nanoFramework.TestFramework) to deploy the code and run it on the device. The code exists already in there, it’s mainly about extracting, adjusting and testing all this on all the platforms.

Other elements is that for unknown reasons, the build process did not always generated a .bin file. So we decided to add it the the tool. A new tool has then been added called [nanoFramework Deployer](https://github.com/nanoframework/nanoFrameworkDeployer) that will allow to have this deployment happening on any platform. Because of the dependencies explained earlier, the tool depends of .NET 4.7.2 elements, it has to be a .NET 4.7.2 application. Good news is our friend mono will allow us to run it without any issue. So few hundreds lines of code later, we have a deployment tool and a tool to generate .bin files as well. It has required as well to tweak the Visual Studio extension, more precisely the [.NET nanoFramework debugger](https://github.com/nanoframework/nf-debugger) to support the multi-platform serial port enumeration and usage.

A lot of manual tests later on all the 3 platforms, we have a solid tool, not perfect (unfortunately) but solid enough, every now and then some of the devices are not discovered properly. They can’t be deployed with this approach. A deep investigation is ongoing. But as you can image it’s a complicated one. You have .NET 4.7.2 code that you have to run and debug on a MacOS or Linux, using an already complicated tool chain where you have super time sensitive serial port communication.

In short, we kept the modern way and the old way allowing developers to upload their code in one way or the other. With time, things should get better. If you’re interested in helping making the deployment better on non-Windows platforms, please let us know!

## Fourth challenge: debugging

The debugging library is deeply linked to Visual Studio and the way all is implement in there. VS Code uses a more recent way: the [Debug Adapter Protocol](https://code.visualstudio.com/api/extension-guides/debugger-extension). And the Visual Studio one is still using the old library so it's not the same. Quite far I would say. It’s the challenge were we faced the biggest complications. In short, if we want to support debug on VS Code, all the debug library should be fully rewritten. And it has implications up to the native C/C++ code. Estimations shows that it’s a full time job for 1 developer during 6 months. With the current donations, it’s out of scope to fund it and looking at the scarce community contributions in this area, that's out of reach as well. So that’s the challenge we will postpone. So we are parking it.

Is that all? Not really. Even if you don’t have debug per say, you can get the Debug.Write(Line) message you are sending. Every .NET nanoFramework code, if build in Debug will output them into the serial port. In short, it’s about opening the serial port on which the device is attached and looking at the output. The default speed is 921600. Just open putty or any other serial watcher and you’ll get a minimum debug experience. As good as any other embedded platforms. Far from the Visual Studio one but better than nothing.

And keep in mind that for Windows, you still can use Visual Studio 2019 or even better 2022, any version, including the free Community version works perfectly!

[Donations will clearly help solving this issue](https://github.com/sponsors/nanoframework) which is currently out of reach for us.

## Fifth challenge: Making a proper VS Code extension

[VS Code extensions](https://code.visualstudio.com/api/get-started/your-first-extension) are Type Script (or javascript) base. When you are C/C++ and C# developer, you may not be the best TS/JS expert. So you’ll have to find one. Luckily, we found one: [Bart Jansen](https://github.com/bart-jansen). Bart participated as well in solving most of the previous challenges. He really managed to get a smooth and nice experience for the developer building this extension. As you’ve seen with the first gif, it’s extremely smooth to flash, build or deploy.

Working with the contextual menu, was one aspect, another one was with the right click on a solution where you just want his “Build project” options. Mentioning as well that when you choose the device to flash, all has to be dynamic. New images appear when new boards are added. Versions are dynamic. You may want a preview or a release and you just don’t want to care much of the rest.

Windows developers are quite used to find their serial port but on MacOS or Linux, we figured out that developers are less used to. So one of the challenge was to display available ports so you can chose easily in a limited choice.

Other challenges are the usage of the external tools and find the path for them. Each environment is different and you need to find them dynamically. As an example, on Windows, the build tools has to be installed. And this is coming with some Visual Studio components. The _vswhere.exe_ commands is allowing to find any Visual Studio component and this command, despite it’s not in the path, is installed in a predictable path.

```
"${env:ProgramFiles(x86)}\\microsoft visual studio\\installer\\vswhere.exe" -latest -prerelease -requires Microsoft.Component.MSBuild -find MSBuild\\**\\Bin\\MSBuild.exe | select-object -first 1;
```

As you may have multiple ones installed, we only then select the first one.

Rest is mainly about integrating everything together, documenting properly as in all our .NET nanoFramework repository to allow an easy maintenance.

## Sixth challenge: putting all together

In the first challenges, you’ve seen individual tools, the flasher, a command line tool, the elements to build coming from the Visual Studio extension and the deployer also a command line tool. Good news is they are all available as a NuGet packages. And to be blunt: a NuGet it's just a zip file. Rename a NuGet file with a zip extension and you’ll get what you need inside.

So to build the extension and have all what’s needed inside, is done in an Azure pipeline. A [dedicated script](https://github.com/nanoframework/nf-VSCodeExtension/blob/develop/scripts/build.ps1) is downloading the NuGets, extracting them, keeping what’s necessary and adding everything into the extension.

The extension is then packaged with the proper npm packages, code compiled, all put together and a _vsix_ package created. Similar as with NuGet and many other formats, it's _just_ a zip file. Download it, rename it, open it and you'll find all the plumbing inside.

And as always thanks to [José Simões](https://github.com/josesimoes) for the help and the pipelines!

## What’s next?

First, we’ll need feedback from developers, how they like it, what's broken and what can/should be improved. And we, as always, welcome PRs with improvements and fixes! As we move forward towards a proper SDK for .NET nanoFramework, as a TFM (Target Framework Moniker) has been approved, some of those challenges will be easier to tackle. And as soon as the build system can move to the latest 5.0 or 6.0, this will simplify a lot of things.

The debugger remains as the most complex challenge to solve and will require more than community work. [Donations are more than welcome](https://github.com/sponsors/nanoframework) to continue to support the project and make those big steps happening to provide the richest development experience of embedded development with .NET nanoFramework.

## How DO CAN YOU USE it?

The extension is available in [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=nanoframework.vscode-nanoframework), of couse. Which will also offer the usual update mechanism. You'll also find the latest releases in the [VS Code extension repository](https://github.com/nanoframework/nf-VSCodeExtension/releases) which you can install manually.

And finally, if you’re willing to help making it better, you can clone the repository and run it locally on your own machine following the installation steps to pull the tools to test and debug it.

Enjoy!
