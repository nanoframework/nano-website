---
title: "Security is a foundation, not a last-minute feature"
description: "TLS, identity, hardware-backed secrets and update design: security foundations in .NET nanoFramework. Part 4 of an 8-post series on engineering fundamentals."
author: laurent-ellerbach
date: 2026-11-19
tags: [engineering, networking]
cover: ./security-foundations.png
coverAlt: "A C# microcontroller rests on four security foundations: peer verification, protected keys, update design and failure handling, with target support and product validation called out."
---

In [part one](/small-devices-serious-engineering-code-quality-in-nanoframework/), we explored code quality. [Part two](/embedded-development-shouldn-t-mean-starting-from-scratch/) focused on developer experience, and [part three](/ci-cd-and-dependency-management/) covered repeatable builds and releases. This time, we're looking at the security foundations those engineering practices help support, and the decisions that remain yours.

"It's just a sensor, who would attack it?" Famous last words. 🔐

A connected device may send boring measurements. It may also hold credentials, accept commands or control real equipment. A tiny memory budget doesn't make the consequences of a compromise tiny.

So security belongs in the platform conversation from day one. .NET nanoFramework gives you networking and certificate building blocks to protect connections. Let's be clear though: they are foundations for a secure design, not a magic "secure by default" switch.

## Security starts in how the platform is built

Developing with security in mind also means looking at how changes reach the platform, not just which APIs it exposes. nanoFramework uses review and automated checks to help catch defects before they reach your device:

- **Pull-request review:** the [contribution workflow](https://docs.nanoframework.net/content/contributing/contributing-workflow.html) states that one or more nanoFramework team members review every PR before it is merged. It also asks contributors to add relevant tests and make sure they pass.
- **Static code analysis:** the [shared class-library build pipeline](https://github.com/nanoframework/nf-tools/blob/main/azure-pipelines-templates/class-lib-build-only.yml) integrates SonarCloud analysis and publishes its quality-gate result. [CoreLibrary's public analysis dashboard](https://sonarcloud.io/dashboard?id=nanoframework_lib-CoreLibrary) makes those results inspectable.
- **Automated tests:** the [CoreLibrary CI configuration](https://github.com/nanoframework/CoreLibrary/blob/main/azure-pipelines.yml) enables unit tests through that shared pipeline, unless explicitly skipped by a PR label. On the native side, the [POSIX nanoCLR workflow](https://github.com/nanoframework/nf-interpreter/blob/main/.github/workflows/posix-nanoclr.yml) builds multiple platform variants and runs a smoke test when the runner can execute the target binary.

These are practical layers of defence against bugs, including bugs that could affect security. They are not proof that every vulnerability has been eliminated, nor a substitute for validating your own product.

## Encryption and identity go together

TLS protects traffic. But encryption alone is not enough if your device never checked who it's talking to.

nanoFramework exposes [SslStream](https://docs.nanoframework.net/api/System.Net.Security.SslStream.html) and certificate APIs, and the [TLS sample pack](https://docs.nanoframework.net/samplesdetails/SSL/README.html) shows client and server scenarios for network-connected devices. The API also exposes [certificate verification options](https://docs.nanoframework.net/api/System.Net.Security.SslVerification.html). That flexibility is useful, and it comes with a responsibility: pick the right verification, and don't treat a successful handshake as proof of trust.

For production, use supported modern TLS settings, validate the peer you intend to talk to, manage your trusted certificates and handle failures explicitly. What's available depends on your target and firmware build. And yes, "SSL" in an API name is history, not a recommendation to use obsolete protocols.

## Stored is not the same as protected

SslStream can use a certificate stored on the device. Handy for provisioning. But storing something and protecting it are two different questions.

Can flash be read? Does your hardware offer protected storage? How do you provision devices, and what happens when a credential is compromised? The answers depend on the board, the firmware configuration and your product design. Anyone promising one universal answer for every microcontroller is selling something. 😉

What you do get is documented capabilities to build on, rather than a home-made connection-security layer.

### Secrets belong in hardware 🔒

Here's the golden rule of device security: the best place for a secret is somewhere software can't simply read it.

A private key, a device certificate's key or a long-lived credential sitting in ordinary flash is only as safe as your flash protection. Someone with physical access and a bit of patience may be able to dump it. So where the hardware allows it, **store secrets in a TPM or an equivalent secure element**, or in the secure storage feature of your microcontroller. Think of a dedicated crypto chip, or a hardware security module built into the chip itself.

And storing is only half of it. **Process secrets in that hardware too.** The ideal design never lets the private key leave the secure hardware. Instead of reading the key and signing in your application's memory, you ask the secure hardware to do the signing or the decryption and hand back the result. The key stays inside, so even a bug in your application code, or a memory dump, doesn't hand it over. Better still, generate the key inside the secure hardware at provisioning time, so it has never existed anywhere else.

A few practical points:

- **Check what your chosen board offers.** Secure elements, TPM-style chips and on-chip secure storage vary a lot between boards and chip families. Choose your hardware with this in mind, early. It's much harder to bolt on later.
- **Check what your firmware and libraries expose.** Having secure hardware on the board doesn't mean every API can use it today. This post doesn't promise a particular secure element is supported on nanoFramework: verify the support for your target and your use case.
- **If you can't use secure hardware,** minimize the damage. Use short-lived credentials, give each device its own identity instead of a shared secret, limit what a credential can do and have a plan to revoke it.

None of this is specific to nanoFramework, and that's the point. It's established security practice for any connected device. What matters is that the platform's networking and certificate building blocks leave room for you to design it properly, and that you decide on it before the first device ships.

## Make reverse engineering harder

Code protection has a place too. Babel Obfuscator supports .NET nanoFramework assemblies, with support introduced in version 9.0, as documented in the project's [official obfuscation announcement](https://nanoframework.net/obfuscation-we-have-an-app-for-that/). It gives you an option to make deployed application code harder to reverse engineer and help protect your intellectual property.

Obfuscation raises the effort needed to understand your code. It doesn't make embedded credentials safe, prevent flash extraction or replace authentication and access controls. Think of it as another layer, not a vault.

## Updates need a security story too

The project's [Azure IoT application-update article](https://nanoframework.net/over-the-air-net-nanoframework-code-update-using-azure-iot/) shows a pattern to distribute and load managed application code. It says clearly that this is not a native firmware update.

An example pattern is not a universal OTA service. Authenticating the content, protecting signing keys, surviving an interrupted update and deciding on rollback are still on your design list. A secure download channel doesn't solve all of that on its own.

More is on the way: work on in-field updates (IFU), including over-the-air (OTA) scenarios, is in progress and tracked in [nanoFramework Home issue #1709](https://github.com/nanoframework/Home/issues/1709). The linked [executive summary](https://github.com/nanoframework/nanoframework.github.io/blob/pages-source/IFU/Executive-Summary.md) proposes a modern, industry-established foundation using MCUboot for image validation and authentication, test-and-confirm upgrades and rollback, alongside mcumgr/SMP for standardised device management and update control. The goal is to bring secure, robust updates for both firmware and managed applications on supported targets. This is ongoing work, not a feature you should assume is available today; platform support and delivery details will depend on the implementation.

## And then there's safety

Security is about attackers. Safety asks what happens when things fail all by themselves.

A disconnected sensor shouldn't quietly turn into a valid reading. An output may need a safe state after a restart. Watchdogs, failure handling and hardware protections need to be chosen for your application. None of these networking features amounts to functional-safety certification.

What nanoFramework brings is useful building blocks inside an ecosystem you can actually inspect, so you know what's left for you to decide.

Security and safety remain the developer's responsibility. Start with what the platform provides out of the box on your chosen target, understand its guarantees and limitations, then design, configure and test the additional protections your application needs. Platform features are a foundation to build on, not a transfer of responsibility for the finished product.

**The best security story isn't "don't worry". It's "here are foundations you can understand, configure and test."**
