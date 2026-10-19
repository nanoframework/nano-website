---
title: "PalThree board becomes Azure Certified Device"
description: "Today we're very proud to announce that the very 1st device running .NET nanoFramework has achieve the status of Azure Certified Device and is also certified for IoT Plug and Play! That’s the…"
date: 2022-05-25T12:13:05Z
author: jose-simoes
tags: [hardware, engineering]
wordpressId: 1260
---

Today we're very proud to announce that the very 1st device running .NET **nanoFramework** has achieve the status of [Azure Certified Device](https://docs.microsoft.com/en-us/azure/certification/program-requirements-azure-certified-device/?WT.mc_id=DT-MVP-5004179) and is also certified for [IoT Plug and Play](https://docs.microsoft.com/en-us/azure/iot-develop/overview-iot-plug-and-play/?WT.mc_id=DT-MVP-5004179)! That’s the [PalThree](https://www.orgpal.com/palthree-iot-azure) board from Orgpal.

![](https://nanoframework.net/wp-content/uploads/palthree_cert.png)

PalThree features an STM32F7, with external RAM and flash storage and packs a lot of features in a small board, like a temperature sensor, Ethernet connector, USB, SD Cards, Modbus, and expansion connectors to extend its functionalities, like adding a satellite modem for example.

This is a significant milestone for the project as another testament of the production quality that we’ve reached and thrive to maintain, not to mention the maturity of the firmware and libraries that we are delivering.

If we look carefully this is actually a double certification. Not only the awesome board from Orgpal is certified but also .NET **nanoFramework** libraries, in particular the [Azure IoT library](https://github.com/nanoframework/nanoFramework.Azure.Devices), which plays a key role in all this allowing the _magic_ to happen.

A lot of work has been poured into our Azure IoT library. Our API got some inspiration from the Azure IoT [official C# library](https://docs.microsoft.com/en-us/dotnet/api/overview/azure/iot/?WT.mc_id=DT-MVP-5004179), but we’ve ended up offering a cleaner and more effective API. Much better suited for the embedded applications that .NET **nanoFramework** targets.

All this without sacrificing any of the features that one expects to find there!

Here’s a summary of what’s available:

-   Device Provisioning Client
-   Authentication with symmetric key or X.509 certificates
-   Support for DTDL models
-   Full IoT Plug and Play
-   Full support for Device Twins
-   C2D and D2C messages
-   Method callbacks
-   Support for Module

PalThree is now on the [Azure Certified Device catalog](https://devicecatalog.azure.com/devices/2048f711-a4f9-4a3c-be0f-75c5f747f7f7) and that is awesome! The board is used as part of [Orgpal telemetry offering](https://www.orgpal.com/) and it’s also available to third parties as an ODM component.

![](https://nanoframework.net/wp-content/uploads/orgpal_telemetry.png)

Orgpal is a long-time supporter of .NET **nanoFramework**. They are one of those companies that have embraced Open Source, fully understand the model, and appreciate how that’s meant to work showing a responsible attitude towards it. They not only sponsor the project with a monthly contribution but during the past years have also sponsored the development of several features and libraries that everyone uses on a daily basis.

Thank you for that and congratulations on this important achievement!
