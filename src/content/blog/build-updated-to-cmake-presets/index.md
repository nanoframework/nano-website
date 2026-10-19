---
title: "Build updated to CMake Presets"
description: "Keeping a great build system for .NET nanoFramework firmware is something that is at the top of our concerns since the project foundation. One of the reasons for this is that it decreases the…"
date: 2022-04-26T14:50:24Z
author: jose-simoes
tags: [engineering]
wordpressId: 1216
---

Keeping a great build system for .NET **nanoFramework** firmware is something that is at the top of our concerns since the project foundation. One of the reasons for this is that it decreases the friction for anyone that wants to build it locally. Doesn’t matter the reason. It could be because they want to experiment and tinker with the code, fix a bug, add a new feature, start working on a port to a new platform or create their own custom image.

.NET **nanoFramework**'s build system uses the well known [CMake](https://cmake.org/) tool, which is constantly evolving. The "lower layer" development in .NET **nanoFramework** is typically done inside [VS Code](https://code.visualstudio.com/) or [Visual Studio](https://visualstudio.microsoft.com), which have now a seamless and tighter integration with this build system, fully supporting projects based on it.

One of the recent improvements there, was the introduction of CMake Presets, which allows storing and sharing build configurations in a very convenient way.

We’ve made a major move last week in our build system and CI-CD pipelines and migrate the build configurations of all our reference and community targets to use these.

And what's so exciting about all this, you may ask... Actually, a lot, I can tell you! Let’s go through it and understand the changes and implications.

## The past with cmake-variants.json

Until now the build configurations were stored using cmake-variants.json files. Worth mentioning that this was the only available mechanism to deal with these matters when the project was started.

Each target had its own configuration “template” file, stored in the respective folder. This was merely a storage because at that location, CMake couldn’t use it to perform the actual build. Neither was VS Code. The content had to be copied over to .vscode folder and concatenated with the templates for the other targets. This was useful for local builds and, upon any changes in the options, a developer had to copy over those changes from each template to the real cmake-variants.json file.

For the CI-CD pipeline builds (we’re using the awesome [Azure DevOps](https://azure.microsoft.com/services/devops/)), the build configurations for each target were stored in the Yaml file along with the pipeline configuration. Any changes in the configurations there had to be manually copied over to the respective template, which, in turn, had to be copied by developers (on their machines) to the real cmake-variants.json file, as already explained.

By now, it should be more than clear that all this was far from being practical. It was tedious (at best!) to maintain and pretty easy for changes in configurations to go unnoticed and, therefore, not being updated locally by developers.

## The present with CMake Presets

With the introduction of CMake Presets feature all this goes way!

In a nutshell: CMake Presets offer centralized storage of build configurations with json files that can inherit from other json files with unlimited levels. These json files go into version control and, all the sudden, everything gets updated and goes in sync, auto-magically.

Here's an example of a couple of our base presets:

![](https://nanoframework.net/wp-content/uploads/image.png)

  
Plus, there are also CMake User Presets which are meant to store “local” configurations that can be based on the official ones or contain entirely new sets. Powerful, isn’t it?

Here's how the presets for the local tools look like in the template, before being replaced with the correct values for the local configuration:

![](https://nanoframework.net/wp-content/uploads/image-1.png)

The next great thing about CMake Presets is that they can be passed directly to CMake CLI when building. With this, we’re now using those on our Azure DevOps pipelines. No more comparing yamls and local cmake-variants! There’s only one single source for build configurations and options.

Last, but not the least, CMake Presets allow for building CMake projects in both VS Code and Visual Studio. How coold is this?! Building locally or in one of our container? Well, it's fully transparent as well!  
There was already experimental support for building .NET **nanoFramework** firmware from within Visual Studio. With these changes in our build system, that’s now possible effortlessly and without the need for external tools and helper scripts, as it was before. There is still some work needed to smoothly start a debug session from Visual Studio, but that’s for another iteration.

If you want to read more about CMake Presets here are a few links:

\- Explanation about CMakePresets in CMake [official documentation](https://cmake.org/cmake/help/latest/manual/cmake-presets.7.html).

\- [Using CMakePresets in VS Code](https://github.com/microsoft/vscode-cmake-tools/blob/main/docs/cmake-presets.md).

\- [Using CMakePresets in Visual Studio](https://docs.microsoft.com/en-us/cpp/build/cmake-presets-vs?view=msvc-170)[.](https://docs.microsoft.com/en-us/cpp/build/cmake-presets-vs?view=msvc-170)

With this move we expect to lower the barrier of entry even further for those wanting to build .NET **nanoFramework** firmware locally and tinker with with the code.

Have fun with .NET **nanoFramework**!
