---
title: "NuGet, assembly and native versions"
description: "nanoFramework C# class libraries are distributed as NuGet packages to be consumed by projects. This has been like this since day one. NuGet packages are practical, easy to distribute, easy to…"
date: 2019-06-25T10:06:07Z
author: jose-simoes
tags: [tooling]
wordpressId: 742
---

**nanoFramework** C# class libraries are distributed as [NuGet packages](https://docs.microsoft.com/en-us/nuget/what-is-nuget) to be consumed by projects. This has been like this since day one. NuGet packages are practical, easy to distribute, easy to consume, easy to update.

But they had a …minor… problem. Actually, make that two… ;)

One was that the dependency between the managed assembly version and the corresponding version of the native end. The initial approach on this (inherited from .NETMF) was that the native version numbering had to follow the managed version. The main reason being that, at deployment time, there is the need to check if the device has support for what is about to be deployed to it. Nothing against this check that is perfectly reasonable. But - and this is a big but – this check is too strict. A detailed explanation on this has already been provided in [this other](/2019/04/23/to-deploy-or-not-to-deploy-thats-the-question/) blog post. Basically, what happened was this: even if the native code hadn’t any change whatsoever, it was forced to “change” just because the version had to bump in order to follow the managed one. This led to a consequence that is kind of severe in our context: forces to update the firmware on the target devices, which is something to be avoided at all costs!

This was improved a few weeks ago with the addition of the AssemblyNativeVersion attribute to our class libraries. This attribute is there to decouple the version numbers in the managed assembly and the native implementation. With it, the check on the required version on the target device at deployment time is possible and, by decoupling it from the managed version, made it possible to keep improving and changing the manged assembly as needed without forcing the native one to follow. Only when there is a real need to change the native part it's version will have to be bumped

The second problem was that, because of that strict versioning dependency, whenever the version of an assembly changed all the dependent ones had to follow. The consequence is that this required massive and cascading updates that are time consuming and force everyone and everything to follow upon. If the version of mscorlib changed, guess what? All other class libs had to change along just to follow it!!

This too has been improved. Because of all the above, there is no need for this strict dependency anymore. The native versions have been bumped to a high number to make it clear to developers that the versions do not need to be matched. So, please, no more attempts to match these, OK?

Along with this, the NuGets have been updated too and the dependencies are not strict versions anymore. Check bellow what is showing in Visual Studio package manager for a NuGet package before and after.

![](https://nanoframework.net/wp-content/uploads/2019/06/nuget-dependencies.jpg)

Another improvement in the NuGets is that the required native version is now showing on the NuGet description. Making this visible removes the obscurity behind it and this can be checked visually and programmatically.

![](https://nanoframework.net/wp-content/uploads/2019/06/nuget-native-version-info.png)

This native version is what the target device has to have support for. The native version available can be checked in the Device Explorer in Visual Studio. Bellow you can see the device capabilities of a target that has support for the above NuGet.

![](https://nanoframework.net/wp-content/uploads/2019/06/native-version-dev-caps.png)

Every class library is now free from this slave dependency and, from now on, will have its version bumped only when there is a real need to.

The outcome of all this is that now we can start dealing with **nanoFramework** NuGets like we usually do with any other NuGet package: consume as needed and update when needed, not because we are forced to.

Trust all this will make everyone's life easier and remove a lot of the friction that was around **nanoFramework** NuGets.

Have fun! :)
