---
title: "Improvements on build system"
description: "The build system for all (preview) target images have just been updated to reduce complexity and aid interoperability. These changes are particularly relevant for those interested in local builds…"
date: 2020-07-02T09:08:20Z
author: jose-simoes
tags: [tooling, engineering]
legacyComments:
  - id: "1797"
    author: "Bernard Cherry"
    date: 2022-02-27T02:21:43Z
    body: "Did you test this before you uploaded this post?  \nIt does not work..... The install scripts are failing!  \nWe cloned the nf-interpreter from the GitHub page and installed vs-code, setup Espressif for  \nESP32 and followed your instructions for hours and this just continues to fail.  \nYou guys need to come up with something that works before uploading cut and paste instructions. The Windows Storage Devices for the ESP32 SD-Card has never worked."
  - id: "1802"
    author: "Laurent Ellerbach"
    date: 2022-02-28T06:30:12Z
    body: "We've still evolved a lot. Please check how to build from a Dev Container, it is simpler and you have all installed already: https://docs.nanoframework.net/content/building/using-dev-container.html  \nAlso, I can recommend you to join our Discord channel and ask questions there, you'll get anwsers: https://discord.gg/yVGmnEpp"
  - id: "1803"
    parent: "1797"
    author: "José Simões"
    date: 2022-02-28T11:42:17Z
    body: "Please join our Discord channel and you'll get help there from a friendly community. I think it's more effective than trying and trying again if it's not working for you and just complaining that's not working. Maybe you're missing something, maybe something has been improved...  \nAnyways, you'll be fully refunded for what you've paid so far to use nanoFramework."
wordpressId: 877
---

The build system for all (preview) target images have just been updated to reduce complexity and aid interoperability. These changes are particularly relevant for those interested in local builds and debugging of the interpreter.

Until this change, the following applied:

1.  The CD-CI pipeline (based on Azure Pipelines) was self-contained and completely autonomous.
2.  Local builds relied on developers following a recipe to download and install all the required tools. ESP32 developers where luckier than the rest as there were some PowerShell scripts that downloaded and installed some of the required tools.

The above lead to situations where developers struggled to follow the setup and configuration instructions, and became frustrated in their attempts to match between the scripts used by Azure Pipelines and the automated install scripts. Not to mention the build instructions/guides in the documentation continually falling behind.

Considering that we want to keep using the powerful Azure Pipelines (which is able to consume PowerShell scripts), the path seemed quite obvious. We should have a common base of PowerShell scripts, that are consumed by either Azure Pipelines or locally by the developer if needed.

Of course, there will still be variations on all this, mainly because the Azure Pipelines build agent already includes some pre-installed tools and the locations to download are different between the agent and a local machine where a developer has full control of where the tools should be installed. All of this can be factored into the PowerShell scripts and the various Pipelines yaml documents.

So what has changed?

Some wrapper scripts have been added to deal with differences in the required tools for the various target platforms.

New scripts were added to install ALL the required tools. This is now real (except for Visual Studio Code).

Also, a new script was added to wrap the calls to CMake providing a true “fire-and-forget” experience for those who prefer to build locally without having to worry about anything at all.

On top of this, bringing the build system a couple of notches up, there are now launch and build configurations per target living in each target folder. To make this really useful and developer friendly, a new script is now available to fully setup VS Code. This script sets all of the required entries in settings.json, composes the launch configuration and CMake variants by grabbing the individual configurations from the various targets. And I really mean ALL because the tool paths are also updated with the setups/install from the previous step.

The build guides have been updated to reflect and describe all this, But I will summarize it here to give a concise overview.

For example, to install all the required tools to build an ESP32 image in a specific location:

```powershell
.\install-nf-tools.ps1 -TargetSeries ESP32 -Path 'Z:\my-nftools'
```

To build an image for the STM32 F429 Discovery board:

```powershell
.\build.ps1 -Target ST_STM32F429I_DISCOVERY
```

To setup Visual Studio Code:

```powershell
.\Initialize-VSCode.ps1
```

Hopefully this is an important step forward in what concerns the setup stage. So, there are no more excuses to not setup a local build system and even debug it.

What are you waiting for? Go get it and have fun with .NET nanoFramework! ;)
