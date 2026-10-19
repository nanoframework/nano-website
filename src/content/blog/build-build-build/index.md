---
title: "Build, build, build…"
description: "Here’s a quick overview on one of the key aspects of any software project: the build. nanoFramework is no different and we all know how critical this is, so we’ve put a lot of attention and care…"
date: 2017-04-01T10:32:53Z
author: nanoframework-team
tags: [engineering]
wordpressId: 246
---

Here’s a quick overview on one of the key aspects of any software project: the build. **nanoFramework** is no different and we all know how critical this is, so we’ve put a lot of attention and care on this matter.

The goal was to make it highly configurable (because there are a lot of features and components that a developer may want to include or leave out of a particular image) and, of course, being very easy to setup.

The choice was to use [CMake](https://cmake.org/) a well-known and proven build system (available for Windows, Linux and MAC).

Another reason for it is that are a couple of nice extensions that make it very easy to work with [CMake](https://cmake.org/) on [VS Code](http://code.visualstudio.com/). Why is this relevant? Well, because we’ve been using [VS Code](http://code.visualstudio.com/) as the official IDE for developing the native side of **nanoFramework**.

The only pre-requisites for running a build are the [GNU ARM Embedded Toolchain](https://developer.arm.com/open-source/gnu-toolchain/gnu-rm/downloads) and [CMake](https://cmake.org/).

There is a [document](https://github.com/nanoframework/nf-interpreter/blob/master/docs/build-instructions.md) in our GitHub repo detailing all this: how to setup it up and how to start the build.

To prove that this is really easy (and that it works!) know that even a machine can do it. Yes, that’s true! ;)

As part of our QA and DevOps each _pull request_ commit and _merge_ commit into the master branch goes through an automated process that builds the image for each of the reference target boards. Only after an “all green” condition the commit is merged or accepted. We are using [Travis CI](https://travis-ci.org/) for running these automated builds (a big "thank you" for the folks at [Travis CI](https://travis-ci.org/) for providing free accounts for Open Source projects).

To make my point here (about how easy it to setup and run the build) let’s take a brief look on what happens on each of those builds:  

  
2.  [Travis CI](https://travis-ci.org/) spins up a virtual machine with a clean image of Ubuntu
  
4.  [GNU ARM Embedded Toolchain](https://developer.arm.com/open-source/gnu-toolchain/gnu-rm/downloads) is installed
  
6.  [CMake](https://cmake.org/) package is installed
  
8.  **nanoFramework** sources are pulled from GitHub
  
10.  [ChibiOS](https://github.com/ChibiOS/ChibiOS) sources are pulled from GitHub
  
12.  A build starts for each of the reference target boards
  

  
See? If a machine can do it so can a human. :)

The same can be done “manually” right from [VS Code](http://code.visualstudio.com/). We’ve tried to make that very easy by providing templates for the configuration files required by the [CMake Tools](https://marketplace.visualstudio.com/items?itemName=vector-of-bool.cmake-tools) extension.

So, after this (and if you haven’t done it already) what are waiting? Go and setup your machine to run a nanoFramework build. Next, who knows, you’ll be making your way into the code and submit some pull requests…
