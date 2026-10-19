---
title: "Obfuscation? We have an app for that!"
description: "If you are in the .NET world for long enough, you’ve probably have come across with the term obfuscation at some point."
date: 2018-09-26T18:31:59Z
author: jose-simoes
tags: [tooling, engineering]
wordpressId: 497
---

If you are in the .NET world for long enough, you’ve probably have come across with the term _[obfuscation](https://www.google.pt/search?q=.net+obfuscation)_ at some point.

In a nutshell and paraphrasing Garry Trinder: “is the process of scrambling the symbols, code, and data of a program to prevent reverse engineering.”

As most of us are aware there are several tools available to decompile a .NET assembly and expose the code inside. **nanoFramework** assemblies, being .NET, are no exception.

Why is this a concern? Well, if you are a company and own IP that you don’t what to share publicly (for example a super-secret algorithm that took you years to fine tune) this could be of interest to you.

The main purpose of an obfuscator is precisely… obfuscating… the code so that it makes unreadable or at least very hard to understand. There are several techniques on how to accomplish this and some are more effective than others.  
Just to name a few: symbols renaming, overloaded renaming, cross assembly renaming, inline value and array encryption, control flow obfuscation, resource encryption. But that’s enough as these details are beyond the subject of this blog post. Check the pictures bellow so you can have an idea on how this looks.  
  
  
  
  
  
  
  
  
  
  
  

|     |     |
| --- | --- |
| _Before_ | _After_ |
| ![obfuscation\_before](https://nanoframework.net/wp-content/uploads/2018/09/renaming1.png) | ![obfuscation\_after](https://nanoframework.net/wp-content/uploads/2018/09/renaming2.png) |

  
We've worked together with the good folks of [babelfor.NET](http://www.babelfor.net) to add support for **nanoFramework** on their .NET obfuscation product: [Babel Obfuscator](http://www.babelfor.net/products/obfuscator). Early this week v9.0 of this tool was released being the first (and only!) obfuscation tool supporting **nanoFramework**.

So, if you have a commercial interest in **nanoFramework** and sharing your IP was preventing you from moving forward, you don't have an excuse any more!
