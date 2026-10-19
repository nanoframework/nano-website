---
title: "Unit Test Framework? Yes, we have that too."
description: "Today, I am extremely excite to announce that we have just released the initial version of our Unit Test framework! Yes, Unit Test, like in… Unit Tests! Because it is powered by Visual Studio Test…"
date: 2021-02-25T17:54:16Z
author: jose-simoes
tags: [tooling, engineering]
wordpressId: 977
---

Today, I am extremely excite to announce that we have just released the initial version of our Unit Test framework! Yes, Unit Test, like in… Unit Tests! Because it is powered by [Visual Studio Test Platform](https://github.com/microsoft/vstest), you’ll find the attributes that you’re used to decorate your test classes. Neat!

I believe you will find this familiar:

![](https://nanoframework.net/wp-content/uploads/unit-test-project.png)

Such as this:

![](https://nanoframework.net/wp-content/uploads/test-success.jpg)

And, of course, this one too:

![](https://nanoframework.net/wp-content/uploads/test-integration-vs-failed.jpg)

Knowing how important this can be for developers serious about Quality Assurance, this was high on our concern list from the beginning of the project. The initial effort on this, dates to October 2018. Back then, we were stopped in our tracks because of the lack of extensibility support of the VS Test platform. There was only VS2017 and we were told by the good folks in the VSTest team that what we were trying to accomplish would be possible with the coming VS 2019. So, we put this project on halt.

Time is always an issue, and this is no different! Up until now there was no one on the team or on the community that was up to it. A couple of weeks ago that changed: [Laurent Ellerbach](https://github.com/Ellerbach) (who has been a great friend of the project) and has made several relevant code contributions, revisited this, and picked it up from where it was left.

Updating it from the old MS Test framework version was the first step. Then bring in VS 2019 and after that the real fun begun!

As with many other aspects in the .NET ecosystem, from NuGet to the VS Project system, we often bump into hard walls because .NET nanoFramework does not have a Target Framework Moniker, and there’s a limit to what we can “hijack” from the existing tools. Fortunately, enough the VS Test platform extensibility is extremely well designed and it's usable for us.

That does not necessarily mean that this was a walk in the park! No sir. There was still A LOT of plumbing and workarounds that had to be implemented. But, in the end, we have made it and the Unit Test framework is real and ready to be used!

As usual, simplicity is the key here. To use this feature, one just has to reference the respective NuGet package:

![](https://nanoframework.net/wp-content/uploads/test-nuget-test-framework.jpg)

Hit build and go to the Test Explorer window to see the magic happen (and let me assure you that seeing this in action does look like magic)!

The next steps are to add this to all our class libraries so we can improve another notch the project global quality.

Now that we have this freaking awesome tool, next on the queue for the Test framework are integration tests. Yes, you read it well, we will be able to plug into a real target, deploy something from the build pipeline, run unit tests and collect back the results.

We have prepared a sample project to demo this. You can find it are our sample repo [here](https://github.com/nanoframework/Samples/tree/master/samples/UnitTest).

Feedback is welcome along with constructive comments and, of course, Pull Requests! (we love Pull Requests).
