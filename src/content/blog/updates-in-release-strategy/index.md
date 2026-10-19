---
title: "Updates in release strategy"
description: "As part of our continued effort to provide quality libraries and reduce, as much as possible, any friction on consuming those libraries, we are announcing a major change in our release strategy:…"
date: 2022-03-30T17:16:14Z
author: jose-simoes
tags: [releases]
wordpressId: 1198
---

As part of our continued effort to provide quality libraries and reduce, as much as possible, any friction on consuming those libraries, we are announcing a major change in our release strategy: as of today, only stable versions of the libraries and firmware packages will be published.

We’re seeing a clear maturity on all .NET **nanoFramework** libraries, with increased usage numbers and very rare reports of bugs and/or issues. Most of those bugs are edge cases and code that is not covered (yet!) by Unit Tests. Adding to this, the vast majority of reported bugs are being fixed in a very short turn around. And this is something that we plan to keep on doing.  
Wanted to emphasize this to make it clear that, with this change, the code quality won't decrease and we're not lowering the bar on our commitment to the community.

In practice, this means that everyone’s life will become so much easier! There is no longer the need to keep looking for preview versions and then updating them to stable. The same goes with the “pairing” between C# libraries and devices’ firmware. Occasionally there were times where mismatches occurred, and it was hard to find the right combination to have a successful build and/or deployment. All that will go away with this change.

The exception to it (there is always one of these, isn't it?!) will be to have preview releases for new libraries or for broad feature changes, for which we’re experimenting with or need to gather feedback and usage data.

In what concerns the project GitHub repositories, the default branch is “main” for all libraries and we’re dropping “develop”. Except for those situations described above. This will make it very clear for everyone looking to contribute or just perusing the code.

At the time of this writing, all our pipelines and helper tools have been adjusted accordingly and “fresh” new versions of all the libraries and firmware packages have been published (or are queue up in the pipelines).

We’re confident that this change is in the best interest of the community, and everyone working with .NET **nanoFramework** and will make everyone’s life easier.

As usuall, feedback and suggestions are welcome!

If you haven’t done so, please follow us on [Twitter](https://twitter.com/nanoFramework), subscribe and star the projects’ [GtiHub repositories](https://github.com/nanoframework) and add a review to .NET **nanoFramework** extensions on [Visual Studio marketplace](https://marketplace.visualstudio.com/publishers/nanoframework).
