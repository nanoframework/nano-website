---
title: "Real Hardware Tests in Azure DevOps Pipelines for .NET nanoFramework PR: IoT TestStream"
description: "This article will go through what we've put in place for .NET nanoFramework to add real hardware tests in various devices from our Azure DevOps pipelines. It's a kind of dream coming true after…"
date: 2024-12-26T07:55:02Z
author: laurent-ellerbach
tags: [hardware, engineering]
wordpressId: 1612
---

This article will go through what we've put in place for .NET nanoFramework to add real hardware tests in various devices from our Azure DevOps pipelines. It's a kind of dream coming true after years of adding what's needed to be able to set this up properly. I remember a discussion we had with José Simões when I joined .NET nanoFramework back in August 2016 where he explained to me the vision he had. Part of this was to be able to run real hardware test when a PR is raised. And to get there, we needed quite a few elements including the [Test Framework](https://devblogs.microsoft.com/dotnet/show-dotnet-build-your-own-unit-test-platform-the-true-story-of-net-nanoframework/). We needed as well to move to [release nugets](/updates-in-release-strategy/) instead of previews, which happened once the Test Framework was released as it helped catch quite some issues and drastically improve the quality. Another important element was to move the nanoff CLI and everything else possible to cross platform even if some components like Microsoft Test which is used by our test framework are Windows only. But we will see this later in detail.

And we already had AZDO pipelines, and all what's needed to run tests in cloud pipelines, without real hardware. This part came with the Test Framework by adjusting a virtual device to run the same code as a device will run.

Our solution is called [nanoFramework IoT TestStream](https://github.com/nanoframework/nanoFramework.IoT.TestStream). While some elements are totally dedicated to .NET nanoFramework, the overall pattern, the scalability and security around the solution are elements that can be fully reused in any Open Source repository but as well for real hardware tests in private organizations where the environment is controlled.

![](https://nanoframework.net/wp-content/uploads/image-13.png)

## **What are the key features needed for IoT TestStream?**

In order to run real hardware tests on real devices, and to have a scalable and secure solution, we need to have:

-   **Support for Diverse IoT Hardware**: IoT TestStream should support a range of IoT hardware setups, ensuring tests are deployed, and executed precisely across a controlled set of environments.
-   **Robust Compatibility**: For devices using .NET nanoFramework, which require connectivity through intermediary hardware such as a PC or Raspberry Pi, IoT TestStream should provide a robust support for these configurations.
-   **Comprehensive Test Coverage**: The project handles complex setups involving external sensors and peripherals, ensuring comprehensive test coverage. At minimum, the test details should be accessible and visible for each device.
-   **Security**: Security is paramount; only designated devices are permitted to connect and execute tests, ensuring controlled and reliable operations. Token or keys used to connect should be rotated and easy to revoke.
-   **Continuous Monitoring and Improvement**: Test results are securely transmitted back to the pipeline, enabling continuous monitoring and improvement of IoT deployments.
-   **Scalability across our key contributors**: anyone who is a key contributor and can be trusted by the core team, should easily and securely be able to setup the solution with a clear documentation.

## **Why running hardware tests is important**?

You may think that because we do have a virtual device, we're good to go and there is no real reason to run real hardware tests. And that's actually a true statement for any class that does not rely on a specific native element. As an example, the [thousands of tests for corelib](https://github.com/nanoframework/CoreLibrary/tree/main/Tests), the library on which everything is based on, is working the same way for every device. There are elements which are related to the native platforms like string manipulations, float/double and many other elements like this but those are quite standards.

Where it starts to be interesting, is indeed to make sure those native elements work as expected. And when there is a migration in a version of the Microcontroler Unit (MCU) vendor, there may be things which will break. Spoiler alert: it does especially with the popular ESP32 as Espresif is known to make quite some breaking changes.

But the real interest is to be able to test what's specific to a device: access to the GPIO, SPI, I2C, networking, File system and anything else that is very specific.

## **Why is running hardware tests complicated?**

Well, the main reason is because the actual build pipelines are running in the Cloud and you cannot attach any hardware in the Cloud 😊 So, you have to find another solution. The good news is that this solution exists it's called self hosted agents. They are existing for [Azure DevOps](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/agents?view=azure-devops&tabs=yaml%2Cbrowser#install) and for [GitHub](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/about-self-hosted-runners).

Running self-hosted agents in a CI/CD pipeline environment like Azure DevOps has its own set of advantages and disadvantages. Here’s a balanced overview:

**Advantages of Self-Hosted Agents**:

-   **Customization**: You have full control over the environment, allowing you to install specific software, tools, or dependencies required for your builds and deployments. For us, it's not really the main element ut we will see later how to play this card.
-   **Performance**: Self-hosted agents can leverage machine-level caches and configurations, potentially speeding up your pipelines, especially for large files or data sets. We will see tht we will only run the tests, so actually, a limited computer is all perfect, it just needs to run .NET Framework (or mono, we will discuss this later) and .NET.
-   **Cost**: If your pipelines run frequently or for long duration, self-hosted agents can be more cost-effective as you avoid the additional minutes or parallel jobs costs associated with Microsoft-hosted agents. In our case, as we want some of our main community members to provide some hardware, this may be a challenge.
-   **Offline Capabilities**: Self-hosted agents are advantageous when the build or deployment environment requires access to resources that may not be available in the cloud. And that is the main one for us: we have specific hardware we want to connect to a machine.

**Disadvantages of Self-Hosted Agents**:

-   **Maintenance**: You are responsible for updating, securing, and scaling your agents, which can be time-consuming and costly. And that's even more complicated in our case as we want to have multiple machines all over the world hosting nanoFramework devices. Discovering them and checking the availability is yet another challenge.
-   **Infrastructure Management**: Managing the underlying infrastructure, including hardware, operating system, and configuration, adds complexity. And yes, that's definitely something we have to take into consideration for the design!
-   **Scalability**: Unlike Microsoft-hosted agents, self-hosted agents do not automatically scale based on demand, requiring manual intervention to accommodate varying workloads. In our case as we are running hardware tests, on .NET nanoFramework devices, this is not the main problem especially in a vision of having a galaxy of hardware all around the world.
-   **Consistency**: Ensuring a consistent environment across all self-hosted agents can be challenging, which might lead to discrepancies between development and production environments. So, we will have to put a specific attention to the documentation and how to install everything in the most transparent way.
-   **Security**: for public repositories, you expose the hardware where the tests are run and potentially expose the network where it's connected. Managing the keys to connect is another challenge.

Having more than on machine, split over the Internet, in the house or workplace of some of our main contributors definitely makes things complicated to maintain and to scale.

The security aspects are also very important. You don't want to have keys leaking or anything secret. And you also want to preserver as best as possible, with all the accepted risks, the machines and environments from your contributors who have accepted to give some of their machine power and devices to .NET nanoFramework.

We can achieve great consistency because we're already working with [templates for our Azure DevOps pipelines](https://github.com/nanoframework/nf-tools).

## **Azure DevOps self-hosted agents or GitHub self-hosted runners?**

Azure DevOps self-hosted agents and GitHub self-hosted runners both allow you to run CI/CD jobs on your own infrastructure. Azure DevOps agents are tightly integrated with Azure Pipelines, offering features like scale set agents for automatic scaling and capabilities for selecting agents based on specific requirements. They are particularly suitable for private projects due to security considerations as we've explained before. On the other hand, GitHub runners are designed for GitHub Actions and use labels to target specific runners for jobs. They offer a similar level of customization but require manual management for scaling. For our needs, we have to be able to select specific hardware and not having to care on which specific agent or hardware they run. Bonus point here for Azure DevOps. Not to mention that all our current build chain is integrated in Azure DevOps. We do have some GitHub Actions, they are mainly to update the dependencies.

Both solutions have their own advantages and disadvantages. Azure DevOps agents provide a more seamless setup and management experience within the Azure ecosystem, while GitHub runners offer a highly configurable way to run workflows in custom environments. However, they both require you to manage the underlying infrastructure, including updates, scaling, and security. It’s important to choose the one that aligns best with your project’s needs and your team’s expertise in managing CI/CD infrastructure.

So, with the previous bonus points and having in mind the security challenges, the exploration of Azure DevOps self-hosted agents have very quickly transformed into a definitive choice.

## **Azure DevOps Self-Hosted architecture**

![](https://nanoframework.net/wp-content/uploads/image-14.png)

The overall architecture looks simple, the self-hosted agent is connected using HTTPS to the Azure DevOps API. All the communications are through this channel, the agent is pulling everything, including long pulling for long operations. This makes it very easy to deploy anywhere as any firewall will let the communication pass through. Note that the mechanism used for GitHub is similar.

If we double click and look at an agent pool and on premise agents, then we can summarize as:

![](https://nanoframework.net/wp-content/uploads/image-15.png)

Looking at the scenario, we want to make sure that a trusted user can safely add an agent and install everything. We can try to summarize the scenario as following.

**Step 1: agent installation**

![](https://nanoframework.net/wp-content/uploads/image-16.png)

In this first step, there are two important options: native agent installation (available for Windows, MacOS and Linux) and containerized installation (Linux containers only supported out of the box).

## **Native agent vs Containerized agent**

Those two approaches are quite different, especially in terms of security, but also in terms of setting things up. We have to keep in mind we want to provide an as best as possible security support for our contributors. But we do as well have quite some constraints on the nanoFramework tool set as it's build only for Windows!

|     |     |     |
| --- | --- | --- |
| **Installation type** | Pros | Cons |
| Native | Out of the box for Linux, Mac, Windows,out of the box hardware access. | Still need to install specific additional tools: nanoff, build system, .NET, etc.  <br>Security concerns depending on how the system is installed (user, service). |
| Containerized | Existing containers for almost all platforms.  <br>Can be extended to create a proper image including some tools.  <br>Offers a good security isolation when setup properly (without --privilege flag and using tools like podman running in user context) | Need to install a container engine.  <br>Need to manage properly the security to access hardware.  <br>Complication accessing hardware in general in containers. |

From that list, because each is quite different and also because of the complexity for some hardware to run into containers, we will see this later on, we will go for both solutions! This approach will allow each user to choose the solution they are the more comfortable with. This will add some extra work as everything will have to be done in double or almost all efforts will have to be doubled.

The Linux containerized approach, which offers the best security, is also the most complex one to put in place mainly because of the hardware access and the support for the tool chain to run on Linux. We'll see all this in a further section.

## **Joining an agent to a pool: authentication approaches**

While joining the pool seems quite straight forward, it has some challenges. The first one is to choose the best method to join the pool. The second one is to find the best secure way to provide the information, either a token, either making sure the user is the proper one.

![](https://nanoframework.net/wp-content/uploads/image-17.png)

More information on the different options: [Self-hosted agent authentication options - Azure Pipelines | Microsoft Learn](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/agent-authentication-options?view=azure-devops).

For us, as we want to be able to give access to some of our main contributors to add their own agents, we will have to find a way to go with token or Entra ID (ex Azure Active Directory) authentication.

The device flow seems like a good idea as it does require the user to authenticate on a web page, a token is then sent back. But in practice, as we are using Azure DevOps (ADO), we will have to add the identity (GitHub ID or Entra ID) of our contributor to our ADO. And we will have to add all those contributors to specific security group to give the ability to managed a pool, which is also needed to add an agent to a pool. Still, the users will have to create and manage some elements themselves, and we don't really want this.

The option 3, in the context of Open Source projects this option can be removed. It is definitely not secure to give credentials of a super user that can do many things to anyone out, even if you trust them!

In short, the Personal Access Token (PAT) is what is left! It has the advantage of being able to be managed separately from the user identity. We will use this trick as it will allow a smoother management.

In all cases, revocation and management of the agent’s life-cycle is also something to properly focus on. In this first release, the PAT renewal is going to be manual. Providing the PAT token to a contributor manually as well to start.

The vision and next steps will involve an Azure Function where a hash of the token, the Github user ID and the expiration date will be sent to receive a new token with a new expiration date. This is going to be implemented in a second phase. The tools will automatically be able to connect to renew a token. This will allow a short rotation of the token as well improving the security.

Now, once an agent is setup, even if its token has expired, until it gets disconnect, it will stay connected. So far, again, in case of problem, we will manage this manually, in this first phase. Later on, the same Azure Function will take care of removing the agent in case of need.

For PAT creation via API, see [Manage personal access tokens using API - Azure DevOps | Microsoft Learn](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/manage-personal-access-tokens-via-api?view=azure-devops). Most likely another reason to author an article once this second phase is created.

## **Selecting an agent based on capabilities**

There are a few ways to select an agent, one is based on the name, but the main one is based on the capabilities. See a capability as a property that described what is installed as specific software or in our case, connected as specific device, which translates into specific firmware.

More information on how to set the capabilities and to select them is available here: [Azure Pipelines Agents - Azure Pipelines | Microsoft Learn](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/agents?view=azure-devops&tabs=yaml%2Cbrowser#capabilities)

In a YAML pipeline, the request for a capability and an agent looks like this:

```yaml
pool:
  name: TestStream
  demands: ESP32_REV0
```

In this case, in a specific pool called TestStream, you demand an agent with the capability called ESP32\_REV0. If you have multiple ones available, the first non-used one will be trigger. In this example, we ask only for one capability, but you can request multiple ones. You can also ask for specific versions of the agent OS or any environment variable and its value.

![](https://nanoframework.net/wp-content/uploads/image-18.png)

In this example, you can see some of the custom capabilities and the system ones. The system ones are populated automatically per the agent. Now, on this, it has quite some inconvenience as it will publish all the environment variables available on your system. While you can control this quite good on a container, it's much more complicated on a native agent. The good news is that you can use an environment variable to specify the environment variables that you don't want to publish. I call this the "privacy" mode. And it's definitely something we want to offer to our contributors. Here is an example of the script we're using to activate this mode:

```powershell
# Concatenate all environment variable names into a single string separated by commas
$envVars = Get-ChildItem Env:
$concatenatedNames = ($envVars | ForEach-Object { $_.Name }) -join ','

# Set the concatenated string to the VSO_AGENT_IGNORE environment variable
$env:VSO_AGENT_IGNORE = $concatenatedNames
```

With this, none of the environment variable will be published. Still, the agent will look at what is installed like .NET, MS Build, Java and others. But at least, the username, and other elements related to the machine are going to be protected.

Here is an example on how it looks like with a native Windows agent once this is put in place:

![](https://nanoframework.net/wp-content/uploads/image-19.png)

As you can see, except tools, there is nothing that is related to the machine except the machine name. And you can, in a setting not even report the tools to get an event better privacy and security around your machine.

On GitHub, the equivalent of the capabilities on ADO are labels. See [Using labels with self-hosted runners - GitHub Docs](https://docs.github.com/en/actions/hosting-your-own-runners/managing-self-hosted-runners/using-labels-with-self-hosted-runners). But this does not offer the same flexibility as labels are not a key pair value but just a single label. This offers less flexibility. And you can't select as granular as in ADO. So that's one more reason we've decided to go for ADO!

## **Secrets are secrets and should stay secret!**

In our build tool chain, we are using secrets. Everyone is! From the github token to clone a repository to signing elements for the nugets. You really don't want those secrets to be exposed and leaked. But you also want to be able to run your pipelines on forks. And for this, ADO allows you to expose them for the forks but without the ability to reveal them (easily). There are always ways, even on a non-fork, but reviews and manual trigger or trigger on known and trusted contributors can be put in place.

For GitHub, you can't have secrets exposed at fork. Not even in a protected way. So, that's also a reason we decided to use ADO. GitHub offers less flexibility and less features than ADO for our usage.

And one more good feature about ADO is that you can lock the YAML file you are using on agents which definitely reduces the risk of running malicious code by adjusting the YAML: [Create and manage agent pools - Azure Pipelines | Microsoft Learn](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/pools-queues?view=azure-devops&tabs=yaml%2Cbrowser#pipeline-permissions)

And finally, in order to reduce the risks, all the builds will be done in the Cloud, like we do currently. Only the artifact will be downloaded on the agent and the test run locally. Like this, we are sure that the secrets to adjust the repository for version bumping or the ones used to sign the nugets are not going to be exposed. It still requires us to be careful on potential secret injections in the artifacts, but we do not use this at all. So, so far, we are safe from this point of view.

## **How the full flow looks like**

The following picture represents the full flow of the pipelines run for .NET nanoFramework as an example. For .NET IoT, we will follow a similar approach having only the tests running locally based on artifacts as well.

![](https://nanoframework.net/wp-content/uploads/image-20.png)

This view gives an idea of how to go with testing on different hardware:

ADO pipelines do have limitations for how to select a self-hosted agent. You cannot specify that you want to run on different self-hosted agents with only one stage. You have to have one stage per agent/demands. It does imply the usage of variables for both the demand and a condition to run a stage or not.

If we want to run multiple hardware tests, then a simple way of looking at this can be summarize as:

![](https://nanoframework.net/wp-content/uploads/image-26.png)

The reality is a bit more complex as the test's stages do not necessarily execute in serial, they can, if run on different agents execute in parallel. In all cases, there is only one build, with published artifacts. And the exact same artifacts are downloaded on each agent (and cached) so that, they can run each test.

## **The chicken and egg problem and how to solve it**

ADO pipelines need to have all the definitions set up in advance, you can only use variables/parameters, and you cannot create dynamic stages. For designing dynamic stages, you can use a foreach and a template. [See this thread](https://stackoverflow.com/questions/72347947/azure-devops-pipeline-dynamic-created-stages-to-run-in-order-sequence-rather-par). That said, the variables/parameters must be global and the test tree is evaluated at build time, not at run time. It is then impossible to get a fully dynamic pipeline. The only way is to try to have this offloaded on the self-hosted agent but here as well, there are quite a few limitations as ADO will pick the first available one.

But what we really want is the ability to run the tests on any available hardware on any agent! And we want this dynamic setup. Imagine I shut down my machine for maintenance or just because I only turn it on during working hours. I still want to be able for a PR to run against available capabilities. And not hard coded taking the risk that a capability won't be available.

So, how to solve this chicken and egg problem? In short: with a bootstrap pipeline!

## **Calling a pipeline from a pipeline**

We will then just call a pipeline and adjust dynamically the parameters from another pipeline and that bootstrap pipeline will also report the status of the dynamically created pipeline. Before going into how to do this, here is how it looks like once put in place:

![](https://nanoframework.net/wp-content/uploads/image-22.png)

A specific .NET nanoFramework repository then needs 2 pipeline. A regular one where the build and hardware tests are setup. And a bootstrap one that will gather the available hardware and trigger the build and another for the test pipeline.

![](https://nanoframework.net/wp-content/uploads/image-21.png)

And this bootstrap pipeline is going to monitor the build and test pipeline and report if any issue happened. In the previous example, we had a successful pipeline, but we can also have a failed one:

![](https://nanoframework.net/wp-content/uploads/image-24.png)

The build and test pipeline result, in the first case of success will look like this:

![](https://nanoframework.net/wp-content/uploads/image-23.png)

You can see the build stage and every single test stage with every single required capability. In that case, all is nicely green, because all went well.

And when you look at the GitHub repository where the PR run, in case of success, you will only see the bootstrap pipeline:

![](https://nanoframework.net/wp-content/uploads/image-25.png)

Ho, wait, why don't we see the other build and test pipeline? It is also running on the same branch, and as the ADO/GitHub connection is created, it should appear here! Well, it does but only during the execution by default! During the execution, you can see all the executing stages and they will disappear once done. And that's the key reason we need the bootstrap pipeline to monitor the status. Otherwise, it won't be reported. This can be fixed by setting the proper PR branch:

```
# Replace 'merge' with 'head' in the $branch variable
branch=$(echo "$branch" | sed 's/merge/head/')
echo "Updated branch: $branch"
```

You then can see all the pipelines run and their status:

![](https://nanoframework.net/wp-content/uploads/image-38.png)

## **Double clicking on how to create the bootstrap pipeline**

ADO has a great set of API. You can almost do whatever you want. And that's perfect for our case. The UI is also using the exact same API. So, even if the documentation is really well done, you still may want how some elements are working and F12 will be your best friend with the networking monitoring.

We're working with templates, so, we have created a template for our bootstrap pipeline. It is located here: [nf-tools/azure-pipelines-templates/device-bootstrap.yml at main · nanoframework/nf-tools](https://github.com/nanoframework/nf-tools/blob/main/azure-pipelines-templates/device-bootstrap.yml)

Without going into the details of the YAML file, the core idea is to be able to list all the agents with all their capabilities and make a unique list. This is about calling few API:

```
# To get the pool ID
https://dev.azure.com/${organization}/_apis/distributedtask/pools?poolName=${poolName}&api-version=7.1

# To get all the capabilities
https://dev.azure.com/${organization}/_apis/distributedtask/pools/${poolId}/agents?includeCapabilities=true&api-version=7.1

# To call the build and run pipeline
https://dev.azure.com/${organization}/${project}/_apis/pipelines/${pipelineId}/runs?api-version=7.1
```

Each all return a JSON object that is parsed to get, for the [first](https://learn.microsoft.com/en-us/rest/api/azure/devops/distributedtask/pools/get?view=azure-devops-rest-7.1) on the pool ID based on the name. In all previous examples, TestStream. The [second](https://learn.microsoft.com/en-us/rest/api/azure/devops/distributedtask/pools/get?view=azure-devops-rest-7.1) one will return all the agents with all the capabilities. From there, you can create a list and create a specific parameter to [call the execution](https://learn.microsoft.com/en-us/rest/api/azure/devops/pipelines/runs/run-pipeline?view=azure-devops-rest-7.1) of the build and test pipeline. This will also return a JSON and from there, we are interested in the run ID so that we can after monitor the pipeline run.

```
https://dev.azure.com/${organization}/${project}/_apis/pipelines/${pipelineId}/runs/$(run_id)?api-version=7.1
```

This will also return a JSON with the status that can be monitored. The [API](https://learn.microsoft.com/en-us/rest/api/azure/devops/pipelines/runs/run-pipeline?view=azure-devops-rest-7.1) is called every 30 seconds for example. The overall script can be a bit overwhelming but it's mainly to extract the JSON values, check that all parameters are correct.

As you'll see also at the beginning of the YAML definition, the pipeline takes parameters. By default, the organization and the pool name are set. The pipeline ID is a static one, unique and created when the build and test pipeline is actually created in ADO. And obviously, the repository is also specific to the project.

Then for a project, creating this bootstrap YAML pipeline is very simple:

```yaml
# Copyright (c) .NET Foundation and Contributors
# See LICENSE file in the project root for full license information.

trigger:
  branches:
    include:
      - main
      - develop
      - release-*
  paths:
    exclude:
      - .github_changelog_generator
      - .gitignore
      - CHANGELOG.md
      - CODE_OF_CONDUCT.md
      - LICENSE.md
      - README.md
      - NuGet.Config
      - assets/*
      - config/*
      - .github/*

# PR always trigger build
pr:
  autoCancel: true

jobs:
- job: Trigger
  displayName: Trigger Azure Dev Ops build and test pipeline
  pool:
    vmImage: 'ubuntu-latest'

  steps:
  - template: azure-pipelines-templates/device-bootstrap.yml@templates
    parameters:
      AZURE_DEVOPS_PROJECT: nanoFramework.IoT.TestStream
      AZURE_DEVOPS_PIPELINE_ID: 111
```

## Skipping tests when not needed

When we do run bump nugets actions, we don't want to run the tests. For this, we will have to find out the author or the PR and also, we will check the content of the PR message. This can be achieved using GitHub APIs:

```shell
prUrl="https://api.github.com/repos/$BUILD_REPOSITORY_NAME/pulls/$SYSTEM_PULLREQUEST_PULLREQUESTNUMBER"
response=$(curl -s -w "%{http_code}" -H "Authorization: $auth" -X GET "$prUrl")
http_code=${response: -3}
content=${response::-3}

if [ $http_code -eq 200 ]; then  
  prDescription=$(echo "$content" | jq -r '.body')  
  if [ "$prDescription" = "null" ]; then  
    echo "Error: Failed to extract PR description from response"  
    exit 1  
  fi
else  
  echo "Error: Failed to fetch PR details. Status code: $http_code"  
  echo "Response: $content"  
  exit 1  
fi  

echo "PR description: $prDescription"

 # Get the PR creator
prCreator=$(echo "$content" | jq -r '.user.login')

echo "PR Creator: $prCreator"

# Check if the PR creator is nfbot AND description includes the version update tag, 
# and set skipHardwareTest accordingly
# This is to skip the hardware test for update PRs created by nfbot
if [ "$prCreator" == "nfbot" ] && [[ "$prDescription" == "[version update]"* ]]; then
  skipHardwareTest=true
else
  skipHardwareTest=false
fi
```

Now with the variable `skipHardwareTest`, we can then decided to gather all the capabilities requirement and run the tests or just using `none` to skip all the tests.

## **In depth in the build ans test pipeline**

The secret of this pipeline is a foreach in the YAML and using the [test template](https://github.com/nanoframework/nf-tools/blob/main/azure-pipelines-templates/device-test.yml):

```yaml
- ${{ each appComponents in parameters.appComponents }}:   
  - template: azure-pipelines-templates/device-test.yml@templates
    parameters:
      appComponents: ${{ appComponents }}
      unitTestRunsettings: 
        - 'UnitTestStream/nano.runsettings,UnitTestStream/bin/Release/NFUnitTest.dll'
```

ADO can take as parameters objects. And we love this as it will allow us to pass the firmware (capabilities) we need but as well pass with the same principal the tests to execute and where the settings are. Each test can indeed use different settings. In that case, there is only one test to run but you can have as many as you want with as many runsettings as you want as well.

There are only few adjustments to be made to any existing pipeline, this is explained in our [maintainer documentation](https://github.com/nanoframework/nanoFramework.IoT.TestStream/blob/main/maintainer.md). In short; it's about removing all PR trigger from the pipeline and setting it up only for manual (API) trigger.

And the other key element is the addition of a stage in the build pipeline to push the artifacts in ADO.

```yaml
    - task: PublishPipelineArtifact@1
      displayName: Publish Pipeline Artifact copy
      inputs:
        path: '$(System.DefaultWorkingDirectory)'
        artifactName: 'Artifacts'
```

And _voilà_ for the magic around the pipelines, how they can run, how to get a fully dynamic system with solving the chicken and egg problem.

## **.NET nanoFramework is Windows build but we want Linux containers as well**

Our test framework is based on Microsoft Test which is a Windows .NET Framework application. And obviously, this does not run natively on Linux. There is an answer: [mono](https://www.mono-project.com/)! As the build is done in the cloud and we just have to execute our tests, the only thing we need is to run the test framework with mono. We're doing this [here](https://github.com/nanoframework/nf-tools/blob/561525656235f2358a07b3f545c601d7e0e83bc8/azure-pipelines-templates/device-test.yml#L194). If you look at the script block, there are also quite a lot of elements around, mainly to check the status of the tests, adding a retry mechanism as when you are playing with hardware, not every time things will work the exact way you want!

What about flashing the device? Is this also a potential issue on Linux? The good news is no! For quite some time now, we've been adding multi platform support, namely x64 for Windows, MacOS (and ARM with the emulation) and Linux. So, flashing the device won't be an issue.

I read your mind here: good, then all should be smooth and easy! Reality: no. Why? Remember, we want to run all this in containers, not necessarily natively on Linux. And even more than that, we want our solution to work with [Windows Subsystem for Linux](https://learn.microsoft.com/en-us/windows/wsl/install) (WSL) on Windows. WSL has a real Linux kernel and runs directly on windows, in a separated virtual machine with interoperability between both.

## **WSL and hardware access: no native solution** **but USBIPD**

WSL offers very limited access to hardware especially USB. And this is where our problem starts. Luckily, there is an officially documented solution: [USBIPD](https://learn.microsoft.com/en-us/windows/wsl/connect-usb).

Here are the key elements on how this is working and what needs to be done to access USB ports in WSL2 with USBIPD. Also, note that a more detailed documentation is [available in our repository](https://github.com/nanoframework/nanoFramework.IoT.TestStream/blob/main/agent/README.md).

Each USB device has a vendor ID and product ID. You will then need to properly attach the vendor ID and product ID associated with your compatible .NET nanoFramework device in WSL. Two PowerShell sessions will be required: one to execute `lsusb` to list the connected USB devices and another to use `usbipd` to manage the USB device in WSL (note that `usbipd` requires an Elevated PowerShell window).

![](https://nanoframework.net/wp-content/uploads/image-27.png)

In order to bind and attach the USB device in WSL using `usbipd`, you'll need first to list the devices to find the USB bus id which will look like `x-y` where x and y are numbers then bind and attach it. So, running from an **elevated administrator prompt on Windows**:

-   `usbipd list` and find your USB device.
-   `usbipd bind --busid x-y` where x-y is the bus id you'll find in the list.
-   `usbipd attach --wsl --busid x-y` where x-y is the same as before.

If you list again, you'll see that your device is now "Attached" compare to "Not shared" initially.

**Important**: When you unplug and replug the device, it is **not** attached anymore but on a "Shared" state meaning, you have to rerun the attach command to share it again. You need to add `--auto-attach` in the attach command line. But this is a blocking process. So it's definitely something you should run on the background.

![](https://nanoframework.net/wp-content/uploads/image-28.png)

This is the basic principle. Of course, we want this totally transparent. So, we've been created an application that will take care of all this in the background! It's the [TestStream.Runner application](https://github.com/nanoframework/nanoFramework.IoT.TestStream/releases).

## **Accessing serial port from WSL in a container**[](https://github.com/nanoframework/nanoFramework.IoT.TestStream/blob/main/agent/README.md#accessing-serial-port-from-the-container)

Hardware access can be challenging in a container. For this, the user under which the container is running (root in a case of docker or the current user in the case of podman for example) should have access to the hardware. It's mainly about adding the user to the group.

Create a file named `/etc/udev/rules.d/99-serial.rules`. Add the following line to that file:

```
KERNEL=="ttyACM[0-9]*",MODE="0666"
KERNEL=="ttyUSB[0-9]*",MODE="0666"
```

This will give all users access to all the serial ports. You can be more selective of course. This is done for simplification. You can use `sudo nano /etc/udev/rules.d/99-serial.rules` to create/open the file for editing in the terminal. After adding the required content, press `Ctrl+X`, then press `Y` to confirm and save the file, followed by `Enter` to exit.

You will need then to exit WSL and restart WSL by running the command `wsl --shutdown` and then again `wsl` to reenter it.

Then, in the container, a volume pointing out on the hardware needs to to be set **and** the device cgroup rule needs to be adjusted.

As an example, the serial port from the previous example is mapped on `/dev/ttyACM0` or `/dev/ttyUSB0`. Running the following command will show in which group the port is and the type of access:

```
> ls -al /dev/* | grep ttyACM
crw-rw-rw- 1 root dialout 166,   0 Sep 10 10:58 /dev/ttyACM0
```

In that case, the group is 166 and the access is already granted. It means that we can pass the following arguments to the container to make sure the access will work: `--device-cgroup-rule='c 166:* rmw' -v /dev/ttyACM0:/dev/ttyACM0`.

In the case the root user or the current user depending on the container engine you are running, you may have to add a rule. [See this thread](https://stackoverflow.com/questions/24225647/docker-a-way-to-give-access-to-a-host-usb-or-serial-device) and jump to the summary to understand what needs to be done.

To export multiple ports, just add more rules and more volume mount.

## Setting up custom Capabilities

We've mentioned before that an agent can be selected on capabilities. Some are system one and some can be custom. The core idea is to be able to set custom capabilities dynamically during the creation of the agent. And obviously not through the UI but programmatically. One more time, we are saved by the ADO API and we have all what we need. Bellow is the [script used in the container](https://github.com/nanoframework/nanoFramework.IoT.TestStream/blob/283ae0acc3f6e01a1073bec2ad53113edefceb9b/agent/start.sh#L88C1-L107C41) when setting up the agent:

```
# setting up the capabilities
AZP_POOL_AGENTS=$(curl -LsS -u user:$(cat "${AZP_TOKEN_FILE}") \
  -H "Accept:application/json;" \
  "${AZP_URL}/_apis/distributedtask/pools?poolName=${AZP_POOL}&api-version=7.2-preview.1")
AZP_POOL_ID=$(echo "${AZP_POOL_AGENTS}" | jq -r ".value[0].id")

# URL encode the AZP_AGENT_NAME environment variable
encoded_name=$(jq -rn --arg v "$AZP_AGENT_NAME" '$v|@uri')

# Print the encoded name
AZP_POOL_AGENTS=$(curl -LsS -u user:$(cat "${AZP_TOKEN_FILE}") \
  -H "Accept:application/json;" \
  "${AZP_URL}/_apis/distributedtask/pools/${AZP_POOL_ID}/agents?agentName=${encoded_name}&api-version=7.2-preview.1")
AZP_AGENT_ID=$(echo "${AZP_POOL_AGENTS}" | jq -r ".value[0].id")

# Sending the custom capabilities
capabilities=$(cat /azp/config/configuration.json | jq -r ".capabilities")
AZP_POOL_AGENTS=$(curl -LsS -X PUT -u user:$(cat "${AZP_TOKEN_FILE}") \
  -H "Content-Type: application/json" \
  -d "${capabilities}" \ "${AZP_URL}/_apis/distributedtask/pools/${AZP_POOL_ID}/agents/${AZP_AGENT_ID}/usercapabilities?api-version=7.2-preview.1")
echo "Capabilities set: ${capabilities}"
```

It's using a [JSON configuration file](https://github.com/nanoframework/nanoFramework.IoT.TestStream/blob/main/agent/config/configuration-sample.json) containing the key-pairs. As the agent's and pool's names can be different, this is added in the URL and as parameter. The `AZP_URL` also contains the name of the organization, in our case: `nanoFramework`.

We do also have the equivalent in [PowerShell for the native Windows usage](https://github.com/nanoframework/nanoFramework.IoT.TestStream/blob/283ae0acc3f6e01a1073bec2ad53113edefceb9b/agent/capacities.ps1#L36-L56). API calls are the same, the logic is the same.

And in both cases, as a result, you can see in the agent, the capacities dynamically set:

![](https://nanoframework.net/wp-content/uploads/image-29.png)

So far, the value used is just the serial port name. We will extend this to add specific capabilities like networking, or storage for example. This will allow us to run specific types of hardware. Remember that you can select both a key and check its value. The value can be equal, different, or containing something specific. See in the [pool demand documentation](https://learn.microsoft.com/en-us/azure/devops/pipelines/yaml-schema/pool-demands?view=azure-pipelines). And that's indeed this last part we will use.

## Building and running the Linux container

A minimal [docker file is provided](https://learn.microsoft.com/en-us/azure/devops/pipelines/agents/docker?view=azure-devops#linux) to start with when using the agent in a container. We've made [some changes on it to add what we need extra](https://github.com/nanoframework/nanoFramework.IoT.TestStream/blob/main/agent/azp-agent-linux.dockerfile). The core idea is to install the missing tools like .NET, mono and prepare the security access on some folders where `nanoff` and other elements could be installed.

We'll just focus on couple of elements. The first one is installing the test platform. As you remember from above, .NET nanoFramework uses Microsoft Test which is a Windows only tool. So, we have to find a way to install it properly in the container. Using an ADO task will fail as it will check the OS version and obviously refuse to install it on Linux. The good news is that the test tools are packaged in a nuget. And nuget are just zip files.

```
# VSTest which needs to be extracted from the nuget
RUN wget -q https://www.nuget.org/api/v2/package/Microsoft.TestPlatform/17.11.1 -O /tmp/microsoft.testplatform.zip
RUN apt-get install -y unzip
RUN mkdir /tmp/microsoft.testplatform
RUN mkdir /azp/TestPlatform
RUN unzip /tmp/microsoft.testplatform.zip -d /tmp/microsoft.testplatform
RUN mv /tmp/microsoft.testplatform/tools/net462/Common7/IDE/Extensions/TestPlatform/* /azp/TestPlatform
RUN rm -rf /tmp/microsoft.testplatform && rm /tmp/microsoft.testplatform.zip
```

So, we will just download the nuget, rename it as zip, unzip it, and copy the needed folder to our local `azp` path where everything will be installed. And finally we will clean both the zip and the extracted folder.

Second important element, is that to decrease the security risks, we will run all the pipelines into a user, called `agent`. So, we need to give to this agent the proper permissions to the directory. And also create a directory and add it to the path where a pipeline task will install `nanoff`. This is needed to ensure we will always have the latest and greatest version of `nanoff` installed. Installing it in the container will add more security challenges and more complications.

```
# Create agent user and set up home directory
RUN useradd -m -d /home/agent agent
RUN chown -R agent:agent /azp /home/agent

USER agent
# Another option is to run the agent as root.
# ENV AGENT_ALLOW_RUNASROOT="true"

# nanoff tool installation in the azp directory
RUN mkdir /azp/tools
# RUN dotnet tool install nanoff --tool-path /azp/tools
ENV PATH="${PATH}:/azp/tools"
```

As you'll see, if for some reason, you need much more privileges, you can always set an environment variable to run as a root user. But that's not recommended.

Building the container is then simple, from the path of the docker file, it's just about building it and tagging it:

```shell
docker build -t azp-agent:linux -f ./azp-agent-linux.dockerfile .
```

Running the Linux container is then a matter of putting everything together from what we've seen:

```shell
docker run -e AZP_URL="https://dev.azure.com/nanoframework" -e AZP_TOKEN="supersecrettoken" -e AZP_POOL="TestStream" -e AZP_AGENT_NAME="Docker Agent - Linux" --device-cgroup-rule='c 166:* rmw' -v /dev/ttyACM0:/dev/ttyACM0 -v ./config:/azp/config azp-agent:linux
```

The container requires to pass couple of environment variables like the ADO organization URL, the token, the pool and the agent's name. Then, as we've pointed out before, we must mount each serial port and properly map the security group. Remember to do it for each of the ports. This example only shows one port.

Finally, as we will need it for the tasks, we need to pass the configuration file where the capacities are as they contain the firmware as keys and the serial port as value.

And obviously, we are running the version we have built and tagged. just before.

## Quick recap before moving to the tasks

What we've seen before are all the needed elements to:

-   Adjust a pipeline that is built in the cloud and to run hardware tests on the edge.
-   Pass dynamically the parameters to that build and test pipeline so that it can run on the needed firmware, using custom capabilities.
-   Have a bootstrap monitoring pipeline connected to the GitHub repository that is launched at PR time, including for the fork repositories.
-   All the needed elements with USBIPD to expose any serial port into WSL2 so that we can access the serial ports from a Linux running into WSL2 in Windows.
-   Have all the security mapping needed to access the serial port securely from WSL2 and more important, from the container.
-   A nice docker file where we have added all the needed tools, including the Microsoft Test framework which is Windows only.
-   Scripts to dynamically, upon the creation of the agent, add custom capabilities to the agent.
-   And for a native Windows agent solution, the necessary elements to have some privacy/security and custom capabilities published.

All this is the needed base to be now able to run tasks with what we need to install the tools, flash the devices and run the tests.

## Installing nanoff in a task

The template we have built contains for most of the tasks, two different versions: one for Linux, one for Windows. While PowerShell could be used for both cases, there are still some limitations and some specific issues with path. You know the annoying slash and back slash used for path separation. So, we have decided to create one task per OS. As an example, here are the ones installing `nanoff`:

```yaml
      - task: DotNetCoreCLI@2
        displayName: 'Linux Install nanoff'
        condition: eq(variables['Agent.OS'], 'Linux')
        inputs:
          command: custom
          custom: tool
          arguments: 'install nanoff --tool-path $(Agent.HomeDirectory)/tools'

      - task: DotNetCoreCLI@2
        displayName: 'Windows Install nanoff'
        condition: eq(variables['Agent.OS'], 'Windows_NT')
        inputs:
          command: custom
          custom: tool
          arguments: 'install nanoff --tool-path $(Agent.HomeDirectory)\tools'
```

There is almost no difference except this annoying path separator. That's a simple case which could have been solved by the creation of a local variable. But for others, it's much more complicated like running the tests.

## Flashing the devices

The devices are flashed before each test with a [foreach loop](https://github.com/nanoframework/nf-tools/blob/561525656235f2358a07b3f545c601d7e0e83bc8/azure-pipelines-templates/device-test.yml#L57).

And again here is a difference of treatment between Linux and Windows to extract from the configuration file the serial port. Here is the Linux version:

```powershell
            SerialPort=$(cat $(Agent.HomeDirectory)/config/configuration.json | jq -r '.capabilities.${{ parameters.appComponents }}')
```

And here is the Windows version:

```powershell
            $configPath = "$(Agent.HomeDirectory)\configuration.json"
            $configJson = Get-Content -Raw -Path $configPath | ConvertFrom-Json

            # Get the SerialPort value for the specified app component
            $appComponent = '${{ parameters.appComponents }}'
            $SerialPort = $configJson.capabilities.$appComponent
```

Again, differences with path and also because Linux uses bash, [JQ](https://jqlang.github.io/jq/) can be used to parse the JSON while the native PowerShell solution is used on Windows.

Something to consider when running hardware tests are retries. A lot of weird things can happen. So, it's important to be able to retry and also adjust the flashing speed or any other element like this when possible. That's what we are doing at every task like flashing but also running the tests. Here is the code for PowerShell, it's the exact same logic for Linux in Bash:

```powershell
# Maximum number of retries            
$MAX_RETRIES = ${{ parameters.MaxRetries }}

# Delay between retries in seconds
$DELAY = 2

# Initialize the counter
$attempt = 0

# Baud rates to try
$BAUD_RATES = @(1500000, 1000000, 500000, 250000, 150000)

# Initialize baud rate index
$baud_index = 0

# Loop to retry the function call
while ($attempt -lt $MAX_RETRIES) {
  $(Agent.HomeDirectory)\tools\nanoff --target $appComponent --update --masserase --serialport $SerialPort --baud $BAUD_RATES[$baud_index]
    $status = $LASTEXITCODE
    if ($status -eq 0) {
      break
    } else {
      $attempt++
      $baud_index++
      if ($baud_index -ge $BAUD_RATES.Length) {
        $baud_index = 0 # reset index to the minimum speed
      }
        Start-Sleep -Seconds $DELAY
    }
}

 if ($attempt -eq $MAX_RETRIES) {
   Write-Host "Flashing failed after $MAX_RETRIES attempts."
   exit 1
 }
```

The exit code from running the tool is gathered and checked. A non 0 code means failure. And this is where we adjust the speed of the flash. Some devices only support slower mode. So, in order to have a generic task, the most common speeds have been added.

Why not just using the failure and retry from ADO? Well, we are using it as well by adding `retryCountOnTaskFailure: 3` to the task. Both are complementary. The one implemented in the task will adjust the baud rate, wait and retry. The one implemented in ADO, will do an exponential back off and retry the task. So, in case a device needs more time for some reason, it will have that time with that logic.

## Adjusting the tests runnsettings

.NET nanoFramework leverages runsettings files to add specific parameters. This is how we can adjust how our tests are running, either on a hardware, either in a pipeline. Remember that we are passing a parameter containing the runsettings URI as well as the test to run. So, this is where we are using the first one. Here is the example in bash:

```powershell
# replace <IsRealHardware>False</IsRealHardware> by <IsRealHardware>True</IsRealHardware> in nano.runsettings
sed -i "s/<IsRealHardware>False<\/IsRealHardware>/<IsRealHardware>True<\/IsRealHardware>/g" $(System.DefaultWorkingDirectory)/Artifacts/${{ split(tests, ',')[0]}}
sed -i "s/<ResultsDirectory>.*<\/ResultsDirectory>/<ResultsDirectory>\.\/TestResults<\/ResultsDirectory>/g" $(System.DefaultWorkingDirectory)/Artifacts/${{ split(tests, ',')[0]}}
# replace the serial port by the one in the configuration for parameters.appComponents
SerialPort=$(cat $(Agent.HomeDirectory)/config/configuration.json | jq -r '.capabilities.${{ parameters.appComponents }}')
sed -i "s|<RealHardwarePort>.*<\/RealHardwarePort>|<RealHardwarePort>$(echo $SerialPort)<\/RealHardwarePort>|g" $(System.DefaultWorkingDirectory)/Artifacts/${{ split(tests, ',')[0]}}
cat $(System.DefaultWorkingDirectory)/Artifacts/${{ split(tests, ',')[0]}}
exit $?
```

Note that we are quite brutally replacing in the runsettings which is an XML file the needed values. This assumes that the XML is well formed. If not, the test will fail and the XML can be adjusted into the PR.

We are adjusting 3 different elements:

-   The fact we are running on a real hardware.
-   We set the serial port to the one associated with the firmware in the configuration file.
-   Where the results of the tests will be stored. We'll need that to be able to later on clean those when there is a failure and retry and ultimately to publish them.

Again, the logic is the same for PowerShell, so we will not explain it here for simplification.

## Running the test

In order to run the tests, we need few things:

-   The location of the runsettings: we have it from the parameter
-   The test to run: we have it from the parameter
-   The adapter used to the logic: this is the nanoFramework TestFramework! And this one is present in packages, where the nugets are extracted in the the artifacts, which has been downloaded and installed properly.
-   On Windows: the test task. On Linux: mono and the previously installed tools!

So, here are the few important elements required (example with Bash and Linux). Finding the test adapter:

```
# Define the base directory to search in
BASE_DIR=$(System.DefaultWorkingDirectory)/Artifacts

# Use the find command to search for paths starting with packages/nanoFramework.TestFramework
TESTADAPTER_PATH=$(find "$BASE_DIR" -type d -path "*/packages/nanoFramework.TestFramework*.*" | head -n 1)
```

Note that this should be improved to find the latest version of the adapter in case there are multiple ones. But, we tend to prevent this as we always check the usage of the latest version in our pipelines. That said, if there is a bump of version during the PR, it could be possible that the artifact will contain both. Bottom line: it does not happen often and this will leave space for improvement 😊.

```powershell
# Extract the directory path from the unitTestRunsettings parameter
UNIT_TEST_RUNSETTINGS_DIR=$(dirname "$BASE_DIR/${{ split(tests, ',')[0] }}")

RESULT_TEST=$(mono $(Agent.HomeDirectory)/TestPlatform/vstest.console.exe $BASE_DIR/${{ split(tests, ',')[1] }} /Settings:$BASE_DIR/${{ split(tests, ',')[0]}} /TestAdapterPath:$TESTADAPTER_PATH /Logger:trx)
```

The logic is more complex as, like for flashing the device, we are using multiple tries in case of failure and we also parse the result to find out if some failure are related to some edge cases. But you will find all the 4 elements mentioned above.

The Windows version looks similar:

```powershell
                    $RESULT_TEST = & "$(Agent.HomeDirectory)\_work\_tool\VsTest\17.11.1\x64\tools\net462\Common7\IDE\Extensions\TestPlatform\vstest.console.exe" "$BASE_DIR\${{ split(tests, ',')[1] }}" /Settings:"$BASE_DIR\${{ split(tests, ',')[0]}}" /TestAdapterPath:"$TESTADAPTER_PATH" /Logger:trx
```

As we were installing the tools with a task and a pinned version, we know exactly the path of the tool, the rest is similar, the elements are passed in the test. Similar to the Linux version, the result is parsed to find edge cases and facilitate the retries.

Note that in the [full scripts](https://github.com/nanoframework/nf-tools/blob/561525656235f2358a07b3f545c601d7e0e83bc8/azure-pipelines-templates/device-test.yml#L176-L269), we do delete any test result from a past failed attend. We only keep the last one regardless of the result.

## Publishing the tests results

That's the easiest task as we can use it for both Linux and Windows and it's a standard one:

```yaml
            - task: PublishTestResults@2
              inputs:
                testResultsFormat: 'VSTest'
                testResultsFiles: '**/*.trx'
```

As you remember, we've been cleaning the folders containing failed tests during the retries except the last one. So, we can definitely use this wild card pattern.

And finally, we do have a task cleaning all results and removing everything that is potentially left. This is because self-hosted agents use by default retention, meaning, you don't reclone everything and recreate everything every time.

## The TestStream.Runner application

In order to simplify how all the steps to setup the serial port, install WSL, install USBIPD, setup the configuration file, create the agent, build the docker, run everything, we've been building an application that will setup and run the containers for you.

Everything is explained in the [README from the repository](https://github.com/nanoframework/nanoFramework.IoT.TestStream?tab=readme-ov-file#automatic-configuration). In short, we've been using [Terminal.Gui](https://github.com/gui-cs/Terminal.Gui) to create a nice UI 😊 And, yes, even in a terminal, a lot of things are possible. The application helps setting everything. Here are couple of screen captures:

![](https://nanoframework.net/wp-content/uploads/image-30.png)

It will also automatically detect if WSL2 is installed and setup properly and do it for you:

![](https://nanoframework.net/wp-content/uploads/image-31.png)

And guide you for the manual steps:

![](https://nanoframework.net/wp-content/uploads/image-32.png)

It will also detect and add any device you'll plug, just let you guide:

![](https://nanoframework.net/wp-content/uploads/image-33.png)

And once detected, will setup the configuration, and do the plumbing:

![](https://nanoframework.net/wp-content/uploads/image-34.png)

And also, as we know, not everyone is a container expert, build the docker file for you!

![](https://nanoframework.net/wp-content/uploads/image-35.png)

It can also run everything for you later on including setting properly the custom capabilities based on the previous setup:

![](https://nanoframework.net/wp-content/uploads/image-36.png)

It also propose to install and run the program as login time. WSL can't be run as a service. It must be on a user context with the user log in. You can also setup auto login for a fully automated solution.

## The current prototype in production

The current prototype in production, running both the WSL2 Linux container and the Windows native self-hosted agent is a small all-in-one mini PC. In my case a [BMAX-B4 Plus Mini PC](https://www.aliexpress.com/item/1005005829346998.html) Windows 11, Intel N100, 16 Go DDR4, 512 Go SSD, 2 x HDMI, 1 x Type-C, 4K @60Hz, 750MHz, which offers for less than 150€ all what you need. And it also has the advantage of consuming a maximum of 16W!

![](https://nanoframework.net/wp-content/uploads/image-37.png)

Running the hardware test does not require many resources. Most of the time, the machine is not used at all, so it can also run in parallel of regular usage. Meaning, any of our key contributor can install the solution and run the self-hosted agent in a normal PC while they are using it. And because we do set dynamically the pipelines for the tests, in case the machine is off, the tests won't run on it. That's also something we wanted by design.

## Next steps

Moving forward, we still have some work ahead as we want to deploy this solution to more and more repositories. The goal is to deploy it and improve it as soon as we touch the configuration of a repository. The detailed maintainer documentation makes it easy to deploy in a new repository as well have having all packaged as templates.

Azure DevOps is an amazing tool and there is so much you can do for it. One of our next step is about to automate the management of the tokens as explained in a previous section. An Azure function and use of the token hash, its expiry date and the GitHub user ID will definitely add more security as well.

On the hardware side, some devices require to press some buttons to be flashed. In order to achieve this, we will have to simulate this before running `nanoff` to flash the device. The great news is that we can use an [FT232 or equivalent using .NET IoT](https://github.com/dotnet/iot/tree/main/src/devices/Ft232H). That will require additional wiring but that can be necessary for those scenarios. Also, the goal is to be able to add real sensors, to test I2C in real, similar to SPI. And for this scenario as well, we will require some wiring.

All this is now possible! And we will definitely continue to improve the solution based on the needs.

## Conclusion

As you've seen, there has been a lot of work, tips and tricks put together to arrive to a working solution where we have a fully, transparent, dynamic, scalable and as secure solution as possible!

We have been using a lot of possibilities from ADO, and self-agent are an amazing solution to run tests on real hardware in a scalable and secure way.

The key challenges to make the solution working both natively on Windows and Linux have been important. And there are a lot of details to pay attention to. From access to the hardware on WSL2 in a Linux container running on Windows to running Windows specific .NET Framework programs on Linux. Also, the overall pipeline setup has required quite some ingenuity to be able to have something truly dynamic. And to make it easy to use for our key contributors, we also develop a set of tools making things easy for anyone to adopt our solution.

The security concerns have been in our mind since the beginning and all the design has placed it at the center. While a 0-risk solution running hardware on a self-hosted agent does not exist, we have acknowledged and understand the risks and mitigated all of them.

And hardware tests are just amazing. Yes, they do involve quite some thoughts, some specific settings, but they definitely worth it! So, just go for them, keep them secure and scalable, easy to setup and as dynamic as possible. We hope that we showed you the way and unleashed a lot of secrets that will make your life much easier.
