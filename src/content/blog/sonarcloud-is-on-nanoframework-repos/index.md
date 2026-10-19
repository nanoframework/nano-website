---
title: "SonarCloud is on nanoFramework repos!"
description: "Code quality is something that is high in our priority list at nanoFramework."
date: 2019-06-12T17:38:39Z
author: jose-simoes
tags: [tooling, engineering]
wordpressId: 662
---

Code quality is something that is high in our priority list at **nanoFramework**.

Though, being on the list is not of much use, it must be measurable and comparable against an accepted standard.

For this reason, since last week we’ve been busy adding the awesome [SonarCloud](https://sonarcloud.io) tool to all our class libraries repositories on [GitHub](https://github.com/nanoframework).

[SonarCloud](https://sonarcloud.io/) is an analysis tool that checks code for issues and defects that aren’t caught by the compiler but are problems none the less. These can be for many reasons, like code that hides an unintended behaviour, a potential security breach, a violation of the .NET principles and good practices, unit test coverage and many others. These are grouped into bugs, vulnerabilities, code smells, coverage and duplications. A global classification of the project is then computed into a score.

The [SonarCloud](https://sonarcloud.io/) folks are supporting Open Source projects by offering their tool free of charge. Nice!

It's setup is straightforward and takes only a few minutes per project. [SonarCloud](https://sonarcloud.io/) provides an [Azure Pipelines task](https://marketplace.visualstudio.com/items?itemName=SonarSource.sonarcloud) which is great for **nanoFramework** and it allows us to analyse PRs as they are submitted. The same goes for commits that show the various scores and metrics right after being built.

This has already pointed a few code smells and bugs that were luring in our code.

All in all, we are in very good shape! Just check it out! Most of our repos have their quality gate showing a green “pass” and score “A” in most of the categories. We do have some Cs and Ds, mostly because of code complexity, which is something that can be improved, but nothing serious.

One area that we are not performing that well in (and to be completely honest, are not performing at all) is code coverage. Our class libraries are still lacking unit tests. Mostly because we still haven’t worked out a sufficient way of running tests and collecting results when they require deployment to real hardware, But we’ll get there (feel free to contribute)!

WE ARE HIRING! ;) make sure you join our [Discord community](https://discord.gg/gCyBu8T)...
