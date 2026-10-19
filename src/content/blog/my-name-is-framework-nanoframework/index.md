---
title: "I'm Framework, nanoFramework"
description: "Our vision for it is to be a platform that enables the writing of managed code applications for constrained embedded devices. Developers can harness a familiar IDE such as Visual Studio and their…"
date: 2017-01-23T18:04:40Z
author: nanoframework-team
tags: [community]
cover: ./nanoframework-initial-post1.jpg
coverAlt: ""
wordpressId: 32
---

You're probably thinking: "what the heck is nanoFramework?"

Our vision for it is to be a platform that enables the writing of managed code applications for constrained embedded devices. Developers can harness a familiar IDE such as Visual Studio and their .NET (C#) knowledge to quickly write applications without having to worry about the low level hardware intricacies of a microcontroller.

Now you are probably thinking: "hum... this sounds familiar... isn't there already a framework like this?"  
Well, you are correct! There is one: the [.NET Micro Framework](https://github.com/NETMF/netmf-interpreter) (NETMF).

Your next - probably - obvious question would be: "if there is already one, why are you doing this? Don't you have better things to do with your time?"

On this, we beg to differ... :)

NETMF was a great move from Microsoft to bring the ease and simplicity of managed .NET coding (C#) to the embedded world. The potential of this concept was (and still is) incredible and immensely powerful!  
It started as a closed source, licensed product and later it moved to an open source model with a CodePlex repository.  
Along it's journey NETMF began to receive less and less love from Microsoft until it reached the point of being completely abandoned. The community around it was never what we would call a strong and thriving one. Along the way several attempts were made to revive the project and put it under the community management. Unfortunately without success...

Given this, nanoFramework emerges from the combination of several aspects:  

  
-   The frustration of seeing the incredible potential of NETMF misunderstood.
  
-   Contemplating the waste of work and effort over many years by letting NETMF stay abandoned.
  
-   The firm belief in the concept and how it can fulfil such a vast amount of use case/scenarios such as: a learning platform, rapid prototyping system or even a fully fledged framework capable of powering a commercial product.
  

  
A group of like minded people gathered around these ideas and decided to take the matter into their own hands. We started by shaping our vision for it should look like and what would be the ideal experience for working with and developing using it. We Identified what the short-comings of NETMF were and what aspects were worth keeping or should be improved. We then drafted a plan of action before rolling up our sleeves and started testing ideas and validating proof of concepts.

Without trying to be exhaustive here's our initial "whish list" for nanoFramework:  

  
-   a decent and working build system
  
-   improved PAL (Platform Abstraction Layer)
  
-   easy porting process
  
-   ability to go through the full development cycle for native code
  
-   leveraging an existing RTOS for embedded systems
  
-   core code hardware agnostic and to ease port
  
-   easy process for developing a nanoFramework board (NETMF Solution)
  
-   architected to make it easy to add new features
  
-   provide enough documentation to allow newcomers and veterans to understand the code and the design decisions behind it
  

  
We are currently making all this to happen by:  

  
-   working on a revised CLR (Common Language Runtime) and interpreter
  
-   working on a build system based on CMake (proof of concept already validated)
  
-   working on a reference implementation based in ChibiOS (proof of concept already validated)
  
-   providing a full development cycle experience (coding to debug, including build) without leaving VS Code (freely available)
  

  
The goal is to have a minimal working nanoFramework in the coming weeks. This will allow to accomplish two objectives:  

  
2.  To show a working example that fully validates the approach.
  
4.  To reach a point were any willing person can start contributing code and other work.
  

  
We would very much like to be able to create a thriving community around this project! There are a lot of ways that one can contribute to the project and coding is not the only one. Writing documentation, reporting issues and bugs, testing features, making suggestions, working on the web site and many others are just as valuable to us. Even just mentioning/promoting nanoFramework on social networks/forums can help towards improving the visibility of the project, so please, spread the word!

Feel free to take a look at our GitHub [repo](https://github.com/nanoframework/nf-interpreter) and/or join the Slack community [here](https://nanoframework.wordpress.com/slack-invite-form/).

Welcome to nanoFramework and looking forward to your contributions!
