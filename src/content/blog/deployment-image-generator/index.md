---
title: "Deployment image generator"
description: "nanoFramework Visual Studio extension (both VS2017 and VS2019 versions) just got a new improvement: the ability to generate a “deployment image”. And what the heck is a “deployment image” you ask?…"
date: 2019-05-31T11:21:49Z
author: jose-simoes
tags: [hardware, tooling]
wordpressId: 642
---

**nanoFramework** Visual Studio extension (both [VS2017](https://marketplace.visualstudio.com/items?itemName=vs-publisher-1470366.nanoFrameworkVS2017Extension) and [VS2019](https://marketplace.visualstudio.com/items?itemName=nanoframework.nanoFramework-VS2019-Extension) versions) just got a new improvement: the ability to generate a “deployment image”. And what the heck is a “deployment image” you ask? Let me explain with a bit more detail.

To run a C# application a nanoDevice must have on its storage (which is a flash memory on all current target platforms) the following bits:  

  
-   The _nanoBooter_ responsible to perform the cold boot of the CPU and provide a mean to perform updates and a safe place when the CLR is messed up for some reason. This is valid unless the platform has to use it's own, which is the case with ESP32 and the recently added TI CC32200SF.
  
-   The _nanoCLR_ which comprises the IL execution engine, the CLR and the native parts of all the class libraries that the device has support for.
  
-   The _configuration block_. Optional and only required for devices that are network enabled to store network related stuff. Specifically, network configurations, certificates and Wi-Fi profiles.
  
-   The _PEs_ ([portable executable](https://en.wikipedia.org/wiki/Portable_Executable)) of the managed application and the assemblies it references, like class libraries or others.
  

  
All those are made available in different occasions and flashed using different tools.  

  
-   _nanoBooter_ and _nanoCLR_ are made available after compiling the [nf-interpreter](https://github.com/nanoframework/nf-interpreter) or by downloading them from our [Bintray](https://bintray.com/nfbot/nanoframework-images-dev) repository. These are flashed using the appropriate tool for the platform. This would be the nanoFramework [flasher tool](https://github.com/nanoframework/nf-tools/tree/master/EspFirmwareFlasher) for ESP32, [ST-LINK Utility](https://www.st.com/content/st_com/en/products/development-tools/software-development-tools/stm32-software-development-tools/stm32-programmers/stsw-link004.html) or [DfuSe](https://www.st.com/en/development-tools/stsw-stm32080.html) for STM32 and [Uniflash](http://www.ti.com/tool/uniflash) for TI.
  
-   The _configuration block_ is written by the C# application itself or by using the Network Configuration dialog box available in the Visual Studio extension.
  
-   The _PEs_ of the managed application (and referenced assemblies) are available upon a successful build of a Solution in Visual Studio. Those are deployed to the nanoDevice when hitting the “Deploy” option for the C# Project or when starting a debug session on Visual Studio.
  

  
If one is using **nanoFramework** to deploy stuff on a couple of boards the above is quite all right and works perfectly. Now, if you need to commission several boards on a production run or for a field test using a few dozen boards, things start to get complicated and time consuming. You’ll need to, at least, use a couple of different tools and possibly connect and disconnect each board a couple of times.

There is already a very handy feature which is the generation of a binary file with the bundle of all the _PEs_ (application and referenced assemblies) that can be used to flash the “application” on a target that has already been loaded with the _nanoBooter_ & _nanoCLR_. Yes, that’s the .bin file with the assembly name that you can find on the project output folder after a successful build.

![nf-app-binary](https://nanoframework.net/wp-content/uploads/2019/05/nf-app-binary.png)

We the recent improvement this was taken to the next level: generating a complete deployment image. Yes, you read it correctly, **COMPLETE**. With all the above: _nanoBooter_, _nanoCLR_, _PEs_ and _configuration block_.

The _nanoBooter_, _nanoCLR_ and _configuration block_ are dumped from the connected target flash and cached (because that’s a lengthy operation). When the deploy operation occurs (and the _PEs_ are generated and made available) the Visual Studio extension cooks everything together and spits a nice binary file with the full package.

![nf-deployment-image-bin.png](https://nanoframework.net/wp-content/uploads/2019/05/nf-deployment-image-bin.png)

This is working right now for STM32 targets only. Support for other platforms where this programming approach is suitable will follow.

The binary file can be flashed into the device using [ST-LINK Utility](https://www.st.com/content/st_com/en/products/development-tools/software-development-tools/stm32-software-development-tools/stm32-programmers/stsw-link004.html) or, if you’re working with an mbed enabled ST board (which all recent DISCOVERY and NUCLEO boards are), you can just drop it at the disk drive that shows on Windows Explorer and that’s burned in the flash in a couple of seconds. How cool is this?

Enough technicalities let’s see this working! :)

Enable the deployment image generation in the (new) settings dialog available in Device Explorer.

![nf-enable-deployment-image-generator.png](https://nanoframework.net/wp-content/uploads/2019/05/nf-enable-deployment-image-generator.png)

You can optionally include the configuration block coming from the “seed” device. If you don’t, the region corresponding to the configuration block will be flashed with an empty content.

Just bellow this, you can find the configurations about the flash dump files cache. The options are: caching to the project output folder (which is the default) or in a location that you can specify.

All the above settings are persisted in you Visual Studio user account.

When you hit deploy or start a debug session, the magic happens, and the image is generated.

Something worth noting: the flash contents need to be dumped when they are not available on cache and this can take a few seconds before it completes. So be patient and know that this will happen only once for each device.  
If you have a lot of devices and work on several projects at the same time, it’s probably wiser to use a central cache…

Now that we have the deployment image, let’s check it out.

Fire up [ST-LINK Utility](https://www.st.com/content/st_com/en/products/development-tools/software-development-tools/stm32-software-development-tools/stm32-programmers/stsw-link004.html) and connect the board. I’m using a [STM32F769I-DISCO](https://www.st.com/en/evaluation-tools/32f769idiscovery.html) for this example.

![nf-st-link-utility-connected](https://nanoframework.net/wp-content/uploads/2019/05/nf-st-link-utility-connected-1.png)

The board is already flashed with _nanoBooter_ and _nanoCLR_ and a debug session has been started previously with the [Blinky](https://github.com/nanoframework/Samples/tree/master/samples/Blinky) application (meaning that the required _PEs_ are there too). So, it has everything needed to blink the LED. Which it’s doing.

[Watch the video](https://videopress.com/v/JCaz3qT8)

Next let's load the file with the deployment image binary.

![nf-st-link-utility-open-file](https://nanoframework.net/wp-content/uploads/2019/05/nf-st-link-utility-open-file.png)

[ST-LINK Utility](https://www.st.com/content/st_com/en/products/development-tools/software-development-tools/stm32-software-development-tools/stm32-programmers/stsw-link004.html) has a nice comparing tool that we'll use to compare the contents of the deployment image binary and what's in the device flash.

![nf-stlink-compare.png](https://nanoframework.net/wp-content/uploads/2019/05/nf-stlink-compare.png)

We need to compare all the flash content so we'll enter the flash start address next, which is 0x08000000 for this device.

![nf-stlink-compare-start-address.png](https://nanoframework.net/wp-content/uploads/2019/05/nf-stlink-compare-start-address.png)

The file contents are loaded next and the compare operation starts. I'm guessing that ST-LINK is very thorough on this because the operation takes a lot of time to complete.

![nf-stlink-compare-progress.png](https://nanoframework.net/wp-content/uploads/2019/05/nf-stlink-compare-progress.png)

And _voilà_, if there were any doubts, the machine outputs it's conclusions and confirms that both contents are identical!

![nf-stlink-compare-success](https://nanoframework.net/wp-content/uploads/2019/05/nf-stlink-compare-success-1.png)

Last test with this: use the disk drive flashing method.

Start by wiping the flash content using the "Full Chip Erase" command in [ST-LINK Utility](https://www.st.com/content/st_com/en/products/development-tools/software-development-tools/stm32-software-development-tools/stm32-programmers/stsw-link004.html) toolbar.

![nf-stlink-full-chip-erase](https://nanoframework.net/wp-content/uploads/2019/05/nf-stlink-full-chip-erase.png)

After this you can disconnect the device.

Open Windows Explorer and locate the drive.

![nf-mbed-disk-drive.png](https://nanoframework.net/wp-content/uploads/2019/05/nf-mbed-disk-drive.png)

Now open the folder where the deployment image file is located (that should be the project output directory) and simply drag and drop it on the drive representing the connected target. The upload will take a few seconds. After that operation is completed the MCU is reset, _nanoBooter_ loads _nanoCLR_ and finally the managed application is executed.

[Watch the video on YouTube](https://www.youtube.com/watch?v=jPheVSzfxu0)

This can be useful in many situations, like in production runs to load a test application, testing a bunch of boards, keeping a snapshot of a deployment, etc.

If you have an idea on how any of this can be improved, let us know, just send us a [Tweet](http://tweeter.com/nanoFramework) or join our [Discord community](https://discord.gg/gCyBu8T). ;)

Have fun with **nanoFramework**!
