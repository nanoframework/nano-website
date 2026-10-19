---
title: "Automatic firmware updates"
description: "Today we are proud to announce that our Visual Studio extension now supports automatic firmware updates! We hope you agree that this is a major, and much needed feature."
date: 2020-12-02T11:34:32Z
author: jose-simoes
tags: [hardware, tooling]
wordpressId: 946
---

Today we are proud to announce that our Visual Studio extension now supports **automatic firmware updates**! We hope you agree that this is a major, and much needed feature.

What do you have to do to have this working? Just update the Visual Studio extension to the latest version! Once that is done, just plug the board as usual and all will happen auto-magically when you next run a build. No kidding!

All this happens in the background, pretty much like Windows Update. As soon as a board is connected, its firmware version is checked against our database of compatible boards, and if there is a newer version, the update process is started before the program is deployed. No more tedious work of typing at the command line to keep your devices updated.

There are options to enable/disable the feature and to use preview or stable images. These are accessible in the setting dialog on Device Explorer.

![](https://nanoframework.net/wp-content/uploads/2020/12/nanoframework-auto-updates-options.png)

The initial version of this new feature is able update the CLR images for STM32 targets. We will be adding support for ESP32 and TI targets soon.

**_It is worth noting that this feature requires firmware version 1.6.0-preview.54 or higher_**. If the target is running an older version, you’ll have to do it manually using nanoff one last time.

We hope you find this amazing new feature in nanoFramework Visual Studio extension makes your development experience that much easier.

You can check a video demoing this functionality on our YouTube channel [here](https://youtu.be/hwQyk2q9ed0).

There is also an [FAQ](https://docs.nanoframework.net/content/faq/automatic-firmware-updates.html) about this feature, in case you have questions about it.

Make sure to report any issues and provide your feedback and suggestions for improvements.
