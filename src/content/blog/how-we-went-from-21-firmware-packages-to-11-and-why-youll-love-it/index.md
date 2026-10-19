---
title: "How we went from 21 firmware packages to 11, and why you'll love it"
description: "If you've ever stared at the list of ESP32 firmware packages in nanoFramework and thought \"wait, which one do I actually need?\" - you're not alone. And today, we're here to fix that."
date: 2026-06-03T08:11:41Z
author: jose-simoes
tags: [hardware]
wordpressId: 1726
---

If you've ever stared at the list of ESP32 firmware packages in nanoFramework and thought "wait, which one do I actually need?" - you're not alone. And today, we're here to fix that.

## The problem: too many flavors of the same ice cream

Over time, the ESP32 family has quietly accumulated quite the collection. The root of the confusion? Different dev boards expose their USB port differently:

-   Some boards expose only the classic **USB/UART** port
-   Others expose the newer **USB/JTAG** port
-   And some, the overachievers, expose **both**

For the ESP32-S3 and ESP32-P4, the USB/JTAG port can even double as a USB OTG interface via TinyUSB. This meant we ended up building and publishing separate firmware variants for each combination - one for UART, one for USB - effectively doubling up on packages that were nearly identical under the hood.

The result? A confusing list of 21 firmware targets that had even seasoned users doing a double-take. For newcomers, it was the firmware equivalent of walking into a coffee shop and being handed a 12-page menu when all you wanted was an espresso.

## The solution: smart auto-detection

Thanks to some excellent work by our ESP32 guru Adrian Soundy, the firmware now automatically detects which port you've plugged into and configures itself accordingly. Just plug into whatever connector your board has - USB/JTAG or UART - and it works. No more guessing which firmware variant matches your cable.

For the ESP32-S2, TinyUSB CDC is used, and the firmware detects whether a USB host is present at boot time. For all other targets with USB/JTAG support, the auto-selection kicks in seamlessly between USB/JTAG and UART.

## The new naming: clean and simple

Here's the full before-and-after:

| Old Names | New Name | Notes |
| --- | --- | --- |
| `ESP32_S2_USB`, `ESP32_S2_UART` | `ESP32_S2` | Auto-selects via TinyUSB detection |
| `ESP32_S3`, `ESP32_S3_BLE`, `ESP32_BLE_UART` | `ESP32_S3_QUAD` | Quad PSRAM, uses USB/JTAG |
| `ESP32_S3_ALL`, `ESP32_ALL_UART` | `ESP32_S3_OCTAL` | Octal PSRAM, uses USB/JTAG |
| `ESP32_C3` | `ESP32_C3_BETA` | Older C3 beta silicon |
| `ESP32_C3_REV3`, `XIAO_ESP32C3` | `ESP32_C3` | Mainline C3 |
| `ESP32_C5_THREAD_USB`, `ESP32_C5_THREAD_UART` | `ESP32_C5_THREAD` |     |
| `ESP32_C6_THREAD` | `ESP32_C6_THREAD` | Will gain USB/JTAG & UART auto-select |
| `ESP32_C61_USB`, `ESP32_C61_UART` | `ESP32_C61` |     |
| `ESP32_H2_THREAD` | `ESP32_H2_THREAD` | Will gain USB/JTAG & UART auto-select |
| `ESP32_P4_USB`, `ESP32_P4_UART` | `ESP32_P4` | For P4 rev 3 and above |
| `ESP32_P4_USB_REV_LESS3`, `ESP32_P4_UART_REV_LESS3` | `ESP32_P4_REV_LESS3` | For P4 revisions below 3 |

21 packages down to 11. That's a 48% reduction - practically half the list, gone.

## What this means for you

**If you're a newcomer:** Welcome! You just avoided a confusing rite of passage. Pick your ESP32 variant by chip series and PSRAM type, plug in your cable (either one!), and flash away.

**If you're an existing user:** You'll need to update the firmware name you're targeting - the old `_USB` and `_UART` suffixes are going away. The new names in the table above are your guide. [nanoff](https://github.com/nanoframework/nanoFirmwareFlasher) default firmware names have been updated to match.

**For everyone:** No more "wait, do I have the UART board or the USB/JTAG board?" paralysis. You have one firmware. It figures it out.

## A word on our CI pipeline (and the planet 🌍)

Halving the firmware count also means halving the number of builds in our Azure pipeline. We're deeply committed to reducing the carbon footprint of our virtual machines - those CPU cycles aren't going to waste themselves. We figure this change will save enough electricity to power a small LED for a meaningful fraction of a second. Every milliwatt counts, people!

(In all seriousness, shorter pipeline runs mean faster feedback cycles and lower costs - a genuine win for the project's sustainability. And developer's patience. 😉)

## We want your feedback!

This is a significant change, and while we've tested across ESP32, S3, C3, C5, C6, C61, P4, and H2 series, we'd love to hear from you as you try it out in the wild. If something doesn't behave as expected - wrong port selected, unexpected resets, or anything else - please open an issue in our [GitHub Home repo](https://github.com/nanoframework/Home/issues) with your board details and observations.

Head over to our [Discord server](https://discord.gg/gCyBu8T) or the [GitHub discussions](https://github.com/nanoframework/Home/discussions) to share your experience.

Happy flashing and have fun with .NET nanoFramework! 🚀
