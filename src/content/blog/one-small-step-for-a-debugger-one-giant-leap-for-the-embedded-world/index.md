---
title: "One small 'step' for a debugger, one giant leap for the embedded world!!"
description: "Today the nanoFramework project hit a major milestone: we’ve released a new version of our Visual Studio extension. What's so special about that I hear you ask... Well it is the first one with the…"
date: 2017-12-12T18:36:25Z
author: jose-simoes
tags: [tooling]
cover: ./nf-moon.png
coverAlt: ""
legacyComments:
  - id: "2"
    author: "Simon"
    date: 2017-12-22T21:44:57Z
    body: "Amazing. I might wanna give embedded C# another go. Good job, guys, really good job."
  - id: "3"
    parent: "2"
    author: "José Simões"
    date: 2017-12-26T09:48:04Z
    body: "Thank you for your comment Simon!  \nThat's exactly one of our motivations: enabling the power and simplicity of using C# in the embedded world.  \nDo give it try and let us know how you are getting along with it."
wordpressId: 307
---

Today the **nanoFramework** project hit a major milestone: we’ve released a new version of our [Visual Studio extension](https://marketplace.visualstudio.com/items?itemName=vs-publisher-1470366.nanoFrameworkVS2017Extension). What's so special about that I hear you ask... Well it is the first one with the capability of debugging managed code!

![nanoframework-debug-session-01](./nanoframework-debug-session-01.png)

Many will think that this is not a big feat, but it is. It has taken a year of hard work during which a lot of code was rewritten, cleaned-up and brought up to modern coding standards. There are still some rough edges to improve, but it’s very usable now.

The way **nanoFramework** interacts with Visual Studio when compared with the original .NETMF has changed quite substantially. Here’s a brief summary.

1\. The project system was completely rewritten and it’s now based in the new Visual Studio Project System Extensibility.

![nanoframework-new-project-01](./nanoframework-new-project-01.png)

2\. There is no SDK to install. Everything is packaged inside the Visual Studio extension. That’s all a developer needs to start coding and debugging with **nanoFramework**.

3\. All libraries are distributed as Nuget packages. This make it so much easier to consume, distribute, update and manage dependencies and versioning.

![nanoframework-nuget-packages-01](./nanoframework-nuget-packages-01.png)

4\. The Wire Protocol component, used to communicate with target devices, was completely rewritten and is now using modern WinRT APIs. The current version supports USB but it can be easily expanded to support legacy UART COM ports and also networked connected devices. This communication component is also responsible for a huge performance improvement making all the operations lightning fast. For example, the deployment of a managed project takes just a few seconds.

5\. There is no MFDeploy anymore. A developer can perform all the required interactions with connected devices without leaving the comfort of Visual Studio using the Device Explorer Window.

![nanoframework-device-explorer-01](./nanoframework-device-explorer-01.png)

6\. The debug engine and the Wire Protocol components are now available as Nuget packages making them very easy to reuse in third party applications, production automation and other uses.

Now there is one less excuse to start delving into **nanoFramework**, please pull the repos and contribute with some PRs. 😉

Happy holidays and happy coding with **nanoFramework**!
