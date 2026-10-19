---
title: "Welcome TI CC1352R"
description: "Today we have a great announcement to make: we are adding support for Texas Instruments SimpleLink™ multiprotocol and multi-band wireless MCUs."
date: 2019-12-03T02:22:52Z
author: jose-simoes
tags: [releases, hardware]
cover: ./simplelink-cc1352-launchpad-horizontal.png
coverAlt: ""
wordpressId: 809
---

Today we have a great announcement to make: we are adding support for Texas Instruments SimpleLink™ multiprotocol and multi-band wireless [MCUs](http://www.ti.com/wireless-connectivity/simplelink-solutions/multi-standard/overview.html).

The first ones to get onboard are the [CC1352R](http://www.ti.com/product/CC1352R) and the [CC1352P](http://www.ti.com/product/CC1352P).

These SimpleLink MCUs open a myriad of new possibilities as they bring along support for a bunch of radio protocols (not to mention the possibility to implement your own proprietary system). Check these out:

-   Thread
-   Zigbee®
-   Bluetooth® 5 Low Energy
-   IEEE 802.15.4g
-   IPv6-enabled smart objects (6LoWPAN)
-   Wireless M-Bus
-   Wi-SUN®
-   KNX RF
-   SimpleLink™ TI 15.4-Stack (Sub-1 GHz)

Like all the TI SimpleLink wireless MCUs these follow the same design approach: an Arm® Cortex®-M dual-core architecture. One (M4 running at 48MHz) is dedicated to run the user application and the other (M0) acts as the radio protocol processor. Both are highly integrated and live on the same chip.

They have 352kB of executable flash and 80kB of RAM. Quite enough to load any serious application that you can think of.

If you’re interested in developing _near the metal_ that’s OK too as all the parts in the family offer 2-Pin cJTAG and JTAG debugging.

For ready to use modules there are several [TI partners](http://www.ti.com/wireless-connectivity/certified-wireless-modules/overview/third-party-modules.html) offering all possible variants.

Regarding managed API we’ve started by adding the managed class library for [EasyLink](https://github.com/nanoframework/lib-nanoFramework.TI.EasyLink). Others will follow.

Again, just like with the other SimpleLink counterparts, you can find LaunchPad development boards for these MCUs starting at 39,99 USD.

There is an image ready to flash for the [CC1352R1](http://docs.nanoframework.net/content/reference-targets/ti-cc1352r1-launchxl.html) Launchpad and, if you’re looking into reaching greater distances, there is another one for the [CC1352P1](http://docs.nanoframework.net/content/community-targets/ti-cc1352p1-launchxl.html) Launchpad which has a built in PA.

To complete the starter package we've added a sample pack with two C# projects demoing how easy it is to build a radio link between two of these. One its a simplified node and the other a concentrator. Grab them from our samples repo [here](https://github.com/nanoframework/Samples/tree/master/samples/TI.EasyLink).

So, what are you waiting for? Go get your LaunchPad board and hit the radio waves with nanoFramework!
