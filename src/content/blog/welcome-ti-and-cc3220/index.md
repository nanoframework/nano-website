---
title: "Welcome TI and CC3220!"
description: "The MCU family is growing larger by the day and it is time to celebrate a new vendor!"
date: 2019-05-06T09:43:04Z
author: jose-simoes
tags: [releases, hardware]
cover: ./cc3220sf-launchxl-e1557135752799.jpg
coverAlt: ""
wordpressId: 631
---

The MCU family is growing larger by the day and it is time to celebrate a new vendor!

Today we are adding TI [CC3220SF LaunchPad™](http://www.ti.com/tool/cc3220sf-launchxl) to the growing list of **nanoFramework** reference targets. Yes, we’ve seen new boards added before, so why all the fuss about this one? Looking closely and it is more to it than “just” a new target. Check this out:

\-        We are adding a new chip vendor to the supported list: [Texas Instruments](http://www.ti.com).

\-          A new HAL/PAL comes along with it: support for the TI [SimpleLink™](http://www.ti.com/wireless-connectivity/simplelink-solutions/overview/overview.html) platform is now available which means that more TI parts can be easily added.

\-          There is now another option for a 100% standalone wireless (Wi-Fi) MCU.

This means that there are now more options for people to choose from, and opens a variety of paths to follow. This is a clear sign of **nanoFramework**’s vitality and that it's making its way to be seriously considered as a viable option for both commercial and makers.

Let’s now look closely at the TI [CC3220SF](http://www.ti.com/product/CC3220SF) MCU.

It is a true wireless standalone MCU with a Arm® Cortex®-M dual-core architecture. One (M4 running at 80MHz) is dedicated to run the user application and the other (M0) acts as the Wi-Fi network processor. Both are highly integrated and live on the same chip.

This come along with a generous 256kB of RAM and 1MB of executable flash and external serial flash on 'SF' models.

All the usual hardware peripherals are there: GPIO, SPI, I2C, PWM, serial, I2C, timers, SD card, ADCs. There is also support for a camera and an LCD.

The Wi-Fi capabilities have everything that one can ask for: 802.11 b/g/n, station and access point modes, IPv6 all the WPA2 personal and enterprise security, hardware crypto engine, secure sockets (up to TLS1.2).

The chip (and the companion modules) are Wi-Fi Alliance® certified, which is something huge if you are considering this for a commercial product.

Speaking of commercial products, the MCU and the SimpleLink™ SDK provide some very interesting features that set it apart from it's competitors: unique device identity, secure key storage, file system security, software tamper detection, cloning protection and secure boot with integrity and authenticity of runtime.

The radio characteristics are pretty good. Check this out.

Wi-Fi TX Power:  

  
-   18.0 dBm at 1 DSSS
  
-   14.5 dBm at 54 OFDM
  

  
Wi-Fi RX Sensitivity:  

  
-   –96 dBm at 1 DSSS
  
-   –74.5 dBm at 54 OFDM
  

  
As the power management are, which is something that TI parts are very good at.

Advanced Low-Power Modes:  

  
-   Shutdown: 1 µA
  
-   Hibernate: 4.5 µA
  
-   Low-Power Deep Sleep (LPDS): 135 µA (Measured on CC3220R, CC3220S, and CC3220SF With 256KB RAM Retention)
  
-   RX Traffic (MCU Active): 59 mA (Measured on CC3220R and CC3220S; CC3220SF Consumes an Additional 10 mA) at 54 OFDM
  
-   TX Traffic (MCU Active): 223 mA (Measured on CC3220R and CC3220S; CC3220SF Consumes an Additional 15 mA) at 54 OFDM, Maximum Power
  
-   Idle Connected (MCU in LPDS): 710 µA (Measured on CC3220R and CC3220S With 256KB RAM Retention) at DTIM = 1
  

  
Looking at low level development, the landscape also looks nice: JTAG, sJTAG and SWD debug interfaces are available.

For applications where it makes more sense to use an existing module, instead of designing a board from scratch, TI has you covered as it offers a Wi-Fi [certified module](http://www.ti.com/product/CC3220MODA) with this chip. With or without antenna included.

The [CC3220SF LaunchPad™](http://www.ti.com/tool/cc3220sf-launchxl) development board, which is something developers used to TI parts are familiar with, is available for only 49,99 USD. It has everything that you can expect of a development kit: plenty of exposed pins, LED’s, buttons, sensors, jumpers to test with and debugging interface exposed through an USB connector.

So, what are you waiting for?! Grab one and start having fun with nanoFramework! :)
