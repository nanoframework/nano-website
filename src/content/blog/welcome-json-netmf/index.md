---
title: "Welcome Json.NetMF"
description: "If you come from the .NETMF age and at some point worked with json, you’re probably familiar with Matt Weimer's library: Json.NetMF."
date: 2019-03-16T17:17:32Z
author: jose-simoes
tags: [releases, tooling]
wordpressId: 538
---

If you come from the .NETMF age and at some point worked with [json](https://en.wikipedia.org/wiki/JSON), you’re probably familiar with [Matt Weimer](https://github.com/mweimer)'s library: Json.NetMF.

Making a bit of history: that library started as a modification of Mike Jones's JSON Serialization and Deserialization library. It was available as [NuGet](https://www.nuget.org/packages/Json.NetMF/) for .NETMF v4.2 and v4.3. It was never brought up to date with v4.4. Now it is.

Despite doing what was expected from it, the library never got any improvements and has been stalled for years.

Well, this is bound to change! Matt has decided to transfer the library to under the nanoFramework’s umbrella and since last week, that’s [where it now is](https://github.com/nanoframework/Json.NetMF) .

The plan is to keep the .NETMF NuGet package available and also provide an additional one for nanoFramework. The work to make this happen has been completed then nanoFramewotk version is available [here](https://www.nuget.org/packages/nanoFramework.Json/).

It seems unfair to leave this nice tool inaccessible to other C# embedded developers so, at some point in the future, we could be seeing a NuGet for [TinyCLR](https://ghielectronics.com/tinyclr/features) and another one for [Meadow](https://www.wildernesslabs.co/meadow). Who knows?...

As for improvements: lets’ hear from the community, tackle the open issues and see where all this takes us. Of course, being open source, everyone is welcome to contribute!

Thank you Matt for your work on this. Rest assured it’s in good hands and we’ll be taking good care of it.
