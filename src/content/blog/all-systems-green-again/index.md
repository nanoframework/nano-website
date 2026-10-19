---
title: "All systems green! (again)"
description: "After the release of v1.0 we turned a page and that is true on what concerns our GitHub repositories history. Release means tagging a point in the repository commit history. And suddenly after…"
date: 2018-11-07T19:35:25Z
author: jose-simoes
tags: [tooling, engineering]
wordpressId: 532
---

After the release of v1.0 we turned a page and that is true on what concerns our GitHub repositories history. Release means tagging a point in the repository commit history. And suddenly after that all hell breaks loose on our versioning system!

_Continuous deployment_ and _continuous delivery_ are great, but we must make sure that all that actually works… Specially all by itself and not requiring constant baby-sitting and tweaking. This was not happening with this…

To give you an insight: we are using [AppVeyor](https://www.appveyor.com) as the build platform (a big thanks to them for making it available for Open Source project such as nanoFramework) and (until last week) on [GitVersion](https://github.com/GitTools/GitVersion) to figure out the next version that will be used when running a build. Out of nothing GitVersion went nuts and suddenly wasn’t able to compute the next version on some PRs and specially on git tags! After an insane number of hours spent trying to reach to the root cause of it (including AppVeyor support, asking for help on the project page - help that never came - and looking at other projects using it) it was decided that the best course of action was to switch to a better alternative. Switching tools carries a degree of uncertainty and the need to change stuff that was working, so it's not something to be taken lightly... :?

Surprisingly a quick search didn’t reveal much options. At least that looked credible and reliable. One option popped tough: [Nerdbank.GitVersioning](https://github.com/AArnott/Nerdbank.GitVersioning). Digging a bit deeper it seems that this is the tool that Microsoft is using lately on some of their major repositories. MSBuild included. So, if it’s good enough for taking care of MSBuild it should be suited to our modest requirements… :cool:

Since you ask, between nf-interpreter, debugger and class libraries there are now 27 repositories. That’s a lot to maintain!! 8O

Moving forward and up to climb the learning curve that comes along with each new tool!

After making the required adjustments and tweaking on Yaml, PowerShell, config files and VS projects we (finally) have all system green again.

Now, back to coding which is a lot more fun!! ;)
