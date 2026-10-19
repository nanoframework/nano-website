---
title: "Network Helper to the rescue!"
description: "Network connectivity has been given a high priority since the early days of nanoFramework. Despite of that, there is one aspect that we’ve acknowledged as needing improvements: managing network…"
date: 2022-01-06T14:13:43Z
author: jose-simoes
tags: [networking]
cover: ./network-helper.png
coverAlt: ""
wordpressId: 1163
---

Network connectivity has been given a high priority since the early days of **nanoFramework**. Despite of that, there is one aspect that we’ve acknowledged as needing improvements: managing network connectivity.

Sometime last year, a first step was made to fix that with the release of the NetworkHelper library. For the first time ever, it was possible to deal with network connections with a single method call. But that library only had support for Wi-Fi networks and it was distributed on its own NuGet package.

Today we are taking another step to improve this with the introduction of, not one, but two _Network Helpers_; one for Ethernet connected devices and another one for Wi-Fi connected devices! :D And, because those are always needed when one is dealing with connected devices, they are now available as part of the respective libraries: [nanoFramework.System.Net](https://github.com/nanoframework/System.Net) and [nanoFramework.System.Device.WiFi](https://github.com/nanoframework/System.Device.WiFi). This makes it possible to manage the connectivity independently for each network type in devices that have both.

The API for each of them has been aligned to make their usage seamless. Of course, there are inevitable differences, derived from the different configurations that are available (and required) for each of those. For example, when connecting to a Wi-Fi network one has to provide the SSID and password which, obviously, aren’t required when dealing with an Ethernet connection.

Something like what is demonstrated on the code snippet below.

```csharp
const string Ssid = "YourSSID";
const string Password = "YourWifiPassword";

// Give 60 seconds to the wifi join to happen
CancellationTokenSource cs = new(60000);

var success = WiFiNetworkHelper.ConnectDhcp(Ssid, Password, requiresDateTime: true, token: cs.Token);

if (!success)
{
    // Something went wrong, you can get details with the ConnectionError property:
    Debug.WriteLine($"Can't connect to the network, error: {WiFiNetworkHelper.Status}");

    if (WiFiNetworkHelper.HelperException != null)
    {
        Debug.WriteLine($"ex: {WiFiNetworkHelper.HelperException}");
    }
}
```

Let’s look into the details. You’ll recognize with the above mentioned SSID and password, no further explanations are required. The parameter `requiresDateTime` is optional, and when set to true, will wait for the system to receive a valid date and time from an [SNTP](https://www.techopedia.com/definition/4539/simple-network-time-protocol-sntp) service. This is paramount, for example, on devices connecting to [Azure IoT Hub](https://azure.microsoft.com/services/iot-hub/) that need to validate the server certificate and maybe generate keys which depend on accurate date and time.

Likewise, the need to wait for the network to become ready in order to perform operations that depend on it, it’s also valid for Ethernet connected devices. In this case, and assuming the device will be receiving its network configuration details from a [DHCP](https://www.lifewire.com/what-is-dhcp-2625848) server, and also needs a valid date and time, the equivalent call will something like this.

```csharp
// Give 60 seconds to the wifi join to happen
CancellationTokenSource cs = new(60000);

var success = NetworkHelper.SetupAndConnectNetwork(requiresDateTime: true, token: cs.Token);

if (!success)
{
    // Something went wrong, you can get details with the ConnectionError property:
    Debug.WriteLine($"Can't connect to the network, error: {NetworkHelper.Status}");

    if (NetworkHelper.HelperException != null)
    {
        Debug.WriteLine($"ex: {NetworkHelper.HelperException}");
    }
}
```

You’ll notice the similarities with the previous code snippet.

Both methods are synchronous in their execution, meaning that they’ll return whenever the network as become available or in case a timeout occurs when waiting for the required conditions to be met.

What if the application you’re coding calls for an asynchronous execution of the network configuration and initialization? We’ve got you covered! For those situations there are similar APIs that return immediately. Like this:

```csharp
NetworkHelper.SetupNetworkHelper(requiresDateTime: true);
```

Wow! That was pretty simple wasn't it!? :o  
There is a `[ManualResetEvent](https://docs.nanoframework.net/api/System.Threading.ManualResetEvent.html)` available that you can subscribe and that will be set upon the network to become available with all the requested conditions met. Here’s a possible usage:

```csharp
bool networkAvailable = NetworkHelper.NetworkReady.WaitOne(10000, true);
```

Because it’s a `[ManualResetEvent](https://docs.nanoframework.net/api/System.Threading.ManualResetEvent.html)`, similarly to what’s offered in the sync APIs and it’s CancelationToken, one can set a timeout to wait for the event to be set and act according to the outcome. Very convenient, isn’t it?

Note that several overloaded methods of the above APIs are offered, along with variations to deal with DHCP, static IP configuration and pre-configured network connectivity. All those to make it as simple as possible to deal with network configuration and availability.

Another aspect worth mentioning and that you’ve probably already noticed is that the Windows.Devices.Wifi library was renamed to **System.Device.WiFi**. That’s part of our ongoing (and almost completed) effort to move away from the UWP namespaces and fully embrace and align with the .NET Core APIs.

Last but not the least, know that we’ve been also busy with fixing some tiny bugs in System.Net, adding some important methods that were missing in a couple of classes there and adding Unit Tests. All this it’s definitely contributing to improving the networking libraries and increase in their overall quality.

As usual, feedback is most welcomed and if you have any suggestions on how to improve these, we would love to hear from you.

Happy coding with .NET and nanoFramework! :-)
