---
title: "To deploy, or not to deploy, that's the question..."
description: "nanoFramework class libraries are composed of a managed part (written in C#) and the respective counterpart (written in C/C++) that is part of the firmware image that runs on the target."
date: 2019-04-23T16:20:26Z
author: jose-simoes
tags: [tooling]
wordpressId: 628
---

**nanoFramework** class libraries are composed of a managed part (written in C#) and the respective counterpart (written in C/C++) that is part of the firmware image that runs on the target.

As part of the usual development cycle there are improvements, bug fixes and changes. Some of those touch only the managed part, others only the native and others both. If the interface between them is not in sync: bad things happen.

In an effort to improve code quality and make developer’s life easier, two mechanisms have been implemented along the way. One was to have version numbers on both parts (that have to match) and the another was an improvement introduced on the deployment workflow that checks if the versions of the assemblies being deployed match the ones available in the target device. Pretty simple and straightforward, right?

Despite the simplicity of the mechanism, it has some draw backs. Occasionally it gets confusing because of apparent version mismatches caused by the fact that the develop branch is being constantly updated and the versions are bumped. Also, because the preview versions of the NuGet packages are always available in nanoFramework [MyGet feed](https://www.myget.org/feed/Packages/nanoframework-dev) and not always on [NuGet](https://www.nuget.org/packages?q=nanoframework).

The other aspect that is not that positive is the need to have the versions in sync, which means that whenever the class library assembly version changes the native version must be bumped too. And that requires flashing the target device again. Most of the time without any real reason except that a version number was changed.

This is changing for better!

As of today, the native version number is independent of its managed counterpart. Meaning that it will change when it makes sense and not just because it has to mirror the managed version. Some of you are probably thinking right now that this will be a step back and has the potential to cause trouble with obscure version mismatches and deployment hell. This won’t happen because of something else that we are introducing on all class libraries (and base class), an Egg of Columbus, actually. There is new assembly attribute on all of those that declares which native version is required. Simple but effective.

This is will be used from now on by the deployment provider to validate if the target has all the required assemblies and versions to safely deploy the application.

Because these introduce several breaking changes, make sure you update the VS extension ([2017](https://marketplace.visualstudio.com/items?itemName=vs-publisher-1470366.nanoFrameworkVS2017Extension) and [2019](https://marketplace.visualstudio.com/items?itemName=nanoframework.nanoFramework-VS2019-Extension) versions available) and the NuGet packages on the Solutions you’re working for a smooth transition.

Happy coding with **nanoFramework**!
