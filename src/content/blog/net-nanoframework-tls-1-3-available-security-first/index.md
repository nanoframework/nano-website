---
title: ".NET nanoFramework: TLS 1.3 Available – Security First!"
description: "At .NET nanoFramework, security is always a top priority. We're constantly working to ensure your embedded applications are not only powerful but also secure against the latest threats. That's why…"
date: 2024-08-16T09:50:58Z
author: jose-simoes
tags: [releases, networking]
wordpressId: 1605
---

At .NET nanoFramework, security is always a top priority. We're constantly working to ensure your embedded applications are not only powerful but also secure against the latest threats. That's why we're thrilled to announce that we've migrated to Mbed TLS v3.6, the latest LTS branch of this essential security library. This upgrade brings several significant improvements and updates that we're excited to share with you.

### What's New?

**1\. Upgrade to Mbed TLS v3.6:**  
We've transitioned from Mbed TLS v2 to the latest v3.6, ensuring that we're aligned with the most current long-term support (LTS) branch. This migration is a big step forward in maintaining the robustness and security of your embedded applications.

**2\. Platform Alignment:**  
With this migration, all platforms network enabled – STM32, NXP, and ESP32 (following its recent update to IDF 5.2) – are now fully aligned. This means a more consistent and reliable experience across the board, whether you're working on an STM32 microcontroller, an NXP device, or an ESP32 module.

**3\. TLS 1.3 Support:**  
The highlight of this upgrade is the support for TLS 1.3, the latest and greatest in secure communication protocols. TLS 1.3 offers improved security, reduced latency, and a more streamlined handshake process. It's faster, safer, and the recommended standard for securing your data in transit.

**4\. Dropping TLS 1.0 and Deprecating TLS 1.1:**  
As part of its commitment to security, Mbed TLS has dropped support for TLS 1.0, which is now considered insecure. Following this trend, TLS 1.1 has been labeled as deprecated, and while it’s still available, we strongly recommend migrating your applications to TLS 1.2 or, even better, TLS 1.3. If for some reason you absolutely must use TLS 1.0, this migration won’t be suitable for your project.

**5\. Updated System.Net Class Library:**  
To reflect these changes, we've also updated the `[System.Net](https://github.com/nanoframework/System.Net)` class library. This update ensures that your applications can seamlessly leverage the new security features and enhancements provided by Mbed TLS v3.6.

### What Does This Mean for Your Projects?

These changes mean that your .NET nanoFramework-based projects will benefit from the latest security standards, with improved encryption and better performance. However, it's important to review your existing applications, especially if they're using TLS 1.0 or TLS 1.1. We recommend upgrading to TLS 1.2 or 1.3 to ensure your applications remain secure and future-proof.

### Get Started with the New Features!

You can explore the updated libraries and start migrating your projects today by checking out the latest versions in our repositories:

-   [Mbed TLS Library](https://www.trustedfirmware.org/projects/mbed-tls/)
-   .NET nanoFramework **[System.Net Class Library](https://github.com/nanoframework/lib-System.Net)**

We have already updated our samples and libraries depending on System.NET.

As always, we’re here to help! If you run into any issues or have questions about the migration process, feel free to reach out to our community. Let’s keep building secure, reliable, connected and innovative embedded solutions together! 🚀

Happy coding with .NET nanoFramework!
