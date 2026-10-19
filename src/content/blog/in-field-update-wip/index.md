---
title: "In-field update [WIP]"
description: "New features and bug fixes are bread and butter in the software industry and embedded systems are no exception. These are made available in releases, which all need to be published and deployed.…"
date: 2020-10-19T15:59:30Z
author: jose-simoes
tags: [community]
wordpressId: 919
---

New features and bug fixes are bread and butter in the software industry and embedded systems are no exception. These are made available in releases, which all need to be published and deployed. Quite often, the last step is the most challenging of all given that the capabilities and available resources of the device subjected to the update process decrease, the difficulty increases inversely.

To be fair, it is not usually a big deal when you have the device sitting on your desktop bench, connected to a cable and just need to type into a command line tool to get the new imaged flashed, or (even better!) using a GUI tool.

But what about when you have the device sitting in a hard to reach (remote) location? Or when there are a bunch of them spread geographically apart? Or devices that maybe using a spotty and/or intermittent network connection. Or even not connected at all because there is no network available or it is too expensive. And what happens if the update process hangs? Or if there is a power glitch? Or if the image gets corrupted? There are a thousand ways that can make remote updates on micro-controller scenarios head south...

Nevertheless, being able to remotely update a device deployed in the field is a feature that most likely will be high placed on the "must-have-feature-list" of a company evaluating an embedded system framework.

Currently .NET **nanoFramework** is missing this feature, but that is about to change!

The specification and design of the _in-field update_ (that’s what we’ll be calling it because the update can reach the target device not only over the air, but though a wired connection or a storage device) is mature and closed, ready to be coded.

Despite being what could be easily classified as a premium feature, it will be (just like everything else in **nanoFramework**) made available to everyone for free, in full.

Being a high value and commercially relevant feature, it’s more than fair that especially commercial users, contribute monetarily to the development effort. For this purpose, a sponsoring campaign is being launched through **GitHub Sponsors** program [here](https://github.com/sponsors/josesimoes).

Feel free to jump into the conversation about this topic, ask questions, get updates, and provide feedback. All that will be happening in the _#in-field-update_ channel at the .NET **nanoFramework** [Discord community](https://discord.gg/gCyBu8T).
