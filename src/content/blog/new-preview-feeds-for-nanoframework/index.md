---
title: "New preview feeds for nanoFramework!"
description: "Until now nanoFramework has been using MyGet as its NuGet feed provider to host preview and test packages."
date: 2019-08-21T16:44:21Z
author: nanoframework-team
tags: [tooling, engineering]
wordpressId: 784
---

Until now nanoFramework has been using MyGet as its NuGet feed provider to host preview and test packages.

MyGet is a decent provider but _only_ offers 100MB storage on their free trier. Actually they offer 2GB to OSS projects (which is great) and for which we’ve applied, but it turns out that setting up the account for the OSS offer is an absolute pain! After more than two weeks and dozens of emails exchanged with their support we’ve decided to just move.

We already run most of our infrastructure on [Azure DevOps](https://azure.microsoft.com/services/devops/) and support for public feeds in [Azure Artifacts](https://azure.microsoft.com/services/devops/artifacts/) were recently announced at [Microsoft Build 2019](https://aka.ms/build19/azuredevops/artifacts). This has support for NuGet packages and the offer includes 2GB of storage. Considering all this, we’ve decided to move everything there.

How does this impact you as a C# developer consuming NuGet packages? Not much! It’s only a matter of editing the NuGet package source in visual studio to point to the new feed and you’re done.

The URL for the new feed is:

```
https://pkgs.dev.azure.com/nanoframework/feed/_packaging/sandbox/nuget/v3/index.json
```

This impacts the VS extension preview versions too. We are now publishing those on the [Open Vsix Gallery](http://vsixgallery.com/). Likewise, if you are eager to get the latest and greatest, and you’re already subscribed to the preview feed, you have to update the URL to:

```
http://vsixgallery.com/feed/author/nanoframework/
```

For a detailed description on how to setup all this in Visual Studio, please read the earlier blog post [here](/setup-visual-studio-to-access-preview-versions-feed/).

Have fun with **nanoFramework**!
