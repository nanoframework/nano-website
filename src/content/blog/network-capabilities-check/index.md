---
title: "Network capabilities in nanoFramework: check!!"
description: "As they say: better late than never! This post is a belated announcement of networking capabilities being added to nanoFramework. Some of you may already have noticed that during last week…"
date: 2018-09-14T16:02:56Z
author: jose-simoes
tags: [networking, tooling]
cover: ./nanoframework-networked.jpg
coverAlt: ""
legacyComments:
  - id: "1404"
    author: "Hector Barrera"
    date: 2021-10-20T00:43:10Z
    body: "Hi, I'm trying to test MQTT from \"Samples/samples/MQTT/BasicExample.WiFi/\", on my ESP32\\_WROOM, but when I debug the program it fails on: client.Connect(clientId);\n\nerror: Excepción no controlada del tipo 'nanoFramework.M2Mqtt.Exceptions.MqttCommunicationException' en nanoFramework.M2Mqtt.dll\n\nHope you could help me.\n\nThank you"
  - id: "1413"
    parent: "1404"
    author: "José Simões"
    date: 2021-10-25T09:12:49Z
    body: "Hi Hector,  \nPlease join our Discord community (https://discordapp.com/invite/gCyBu8T) to get help on these kind of issues. ;)"
wordpressId: 491
---

As they say: better late than never! This post is a belated announcement of networking capabilities being added to **nanoFramework**. Some of you may already have noticed that during last week networking capabilities were officially added to our development branch.

With this, **nanoFramework** has - definitely - reached a major milestone. I’m sure we are all in agreement that providing network connectivity is **_a must have_** for any decent framework out there that aims to compete in the IoT space.

A lot has already been accomplished and know that we are just getting started! :)  
Let me guide you on a tour of what’s available today.  

## Managed class libraries

  
The Nuget packages [nanoFramework.System.Net](https://www.nuget.org/packages/nanoFramework.System.Net/), [nanoFramework.Networking.Sntp](https://www.nuget.org/packages/nanoFramework.Networking.Sntp) and [Windows.Devices.WiFi](http://nanoFramework.) include already a ton of methods that allow developers to accomplish _a lot_. Without trying to be exhaustive, one can find there: interface management, DNS services, SNTP service, Sockets, Secure Sockets, Cryptography and Wi-Fi network management (this one for ESP32 targets only).  

## Security

  
This is probably one of the paramount features that are requested when embedded developers ask about networking. Yes, we’ve made it :cool: (and we are very proud of it)!  
Support for SSL v3.0, TLS 1.0, 1.1 and 1.2 is available right now!  

## Supported targets

  
We provide ready to burn images including network support for the following reference targets: [ST NUCLEO144 F746ZG](https://www.st.com/en/evaluation-tools/nucleo-f746zg.html), [ST STM32F769I DISCOVERY](https://www.st.com/en/evaluation-tools/32f769idiscovery.html) and (of course!) [ESP32 DevKit C](https://www.espressif.com/en/products/hardware/esp32-devkitc/overview).  

## Sample projects

  
Some work has been done here too. There are available samples showing how to [connect to a SSL server](https://github.com/nanoframework/Samples/tree/master/SSL/SecureClient); using a client certificate and validating the server certificate; resolve an address by querying a DNS service; adjust the RTC from an SNTP server; [scan Wi-Fi networks](https://github.com/nanoframework/Samples/tree/master/Wifi/ScanWiFi) in range and a couple of others.

Last but, by far, not the least we are working closely with the [AMQPNetLite](https://github.com/Azure/amqpnetlite) project to add support for **nanoFramework** and, very soon, an official Nuget package with this library will be published. Feel free to give it a try now, just go ahead and fork our [fork](https://github.com/Eclo/amqpnetlite/tree/nanoframework).  
A PR is also imminent to Paolo Patierno [MQTT library](https://github.com/eclipse/paho.mqtt.m2mqtt). Same goes with this one: feel free to give it a try and do so by forking our [fork](https://github.com/AdrianSoundy/paho.mqtt.m2mqtt/tree/nanoframework).

How cool is all this? And we are just getting started!! HTTP client and server, web sockets and others are queued up to add more network capabilities to **nanoFramework**.

What are you waiting for? Go get all this, connect your device and start coding your next networked project! ;)
