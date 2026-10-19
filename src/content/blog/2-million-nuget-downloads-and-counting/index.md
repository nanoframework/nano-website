---
title: "2 million nuget downloads and counting"
description: ".NET nanoFramework NuGet downloads have reached on the last 7<sup>th</sup> of May the symbolic milestone of 2 million downloads. Statistics the 12<sup>th</sup> of May shows clearly more than the 2…"
date: 2022-05-16T08:30:22Z
author: laurent-ellerbach
tags: [tooling, engineering]
wordpressId: 1229
---

.NET **nanoFramework** [NuGet downloads](https://www.nuget.org/profiles/nanoframework) have reached on the last 7<sup>th</sup> of May the symbolic milestone of 2 million downloads. Statistics the 12<sup>th</sup> of May shows clearly more than the 2 million:

![](https://nanoframework.net/wp-content/uploads/nuget1.jpg)

The first million was reached on the 9<sup>th</sup> of August 2021. It took 5 years to reach the first million and only 9 months to reach out the second million!

So let’s have a look at those numbers and dig into some of the trends.

## Methodology

All this data have been pulled up directly from the NuGet statistics. Now, it’s  not an easy task! NuGet does not provide direct statistics but allows accessing catalogs and then work with those. The good news is that the [NuGet Trends](https://www.nugettrends.com/) site is here to help! I gathered all the catalogs, all the details and all the elements needed for statistics. There is a UI and you can get those kind of graphs:

![](https://nanoframework.net/wp-content/uploads/nuget2.jpg)

Nice but when you have 187 packages and on top you want to get the statistics from the [UnitsNet](https://www.nuget.org/packages?q=UnitsNet.nanoFramework) ones, you add things up to more than 200 packages!

Good news, there is a hidden API that is used by the client that can be used like this: [https://www.nugettrends.com/api/package/history/nanoFramework.System.Device.Dac?months=72](https://www.nugettrends.com/api/package/history/nanoFramework.System.Device.Dac?months=72)

That will give you a Json file with this format (a lot of data was removed from the example):

```json
{"id":"nanoFramework.System.Device.Dac","downloads":[{"count":null,"week":"2016-05-08T00:00:00"},{"count":null,"week":"2016-05-15T00:00:00"},{"count":7112,"week":"2022-05-01T00:00:00"},{"count":7286,"week":"2022-05-08T00:00:00"}]}
```

The key challenge is then to be able to have proper weekly data because obviously, this will allow to get some proper trends. Cumulative data is nice but it always grows!

First challenge as well is to extract all the **nanoFramework** NuGets. And while there is a search API, it doesn’t seems to offer a way to pull all the ones for the same organization. At least I did not managed to find it. So I’ve been building a json file with our nugets and I took the opportunity to categorize them:

```
[
  {
    "Id": "nanoFramework.CoreLibrary",
    "Category": "CoreLibrary"
  },
  {
    "Id": "nanoFramework.Runtime.Events",
    "Category": "System"
  }
]
```

This is, of curse, just an extract!

So after some thoughts and experiment, I’ve seen that is was easier to have the math done in C# while extracting the data later on with PowerBi or Excel.

All up, 50 lines of codes later, you can get a nice json with the cumulative and weekly updates. The computation for the weekly updates is done in the code. The json is cleaned as well from the empty data:

```csharp
using GetNugetStats;
using Newtonsoft.Json;

const string UrlApi = "https://www.nugettrends.com/api/package/history/";
const string NumberMonths = "?months=72";

Console.WriteLine("Hello, nuget stats :-)!");

string result;
using HttpClient client = new HttpClient();
string url;
List<NugetElement> nanoNugets;
List<NugetElement> nanoStats = new List<NugetElement>();

var allContent = File.ReadAllText("nanoFramework.json");
nanoNugets = JsonConvert.DeserializeObject<List<NugetElement>>(allContent);

foreach (var nuget in nanoNugets)
{
    url = $"{UrlApi}{nuget.Id}{NumberMonths}";
    Console.WriteLine($"Reading {url}");
    using HttpResponseMessage response = await client.GetAsync(url);
    using HttpContent content = response.Content;
    result = await content.ReadAsStringAsync();
    Console.WriteLine($"Downloade size: {result.Length}");

    NugetElement res = JsonConvert.DeserializeObject<NugetElement>(result);
    if (res != null && res.Downloads != null)
    {
        res.Downloads = res.Downloads.Where(m => m.Count != null).OrderBy(m => m.Week).ToList();
        for (int i = 0; i < res.Downloads.Count; i++)
        {
            if (i == 0)
            {
                res.Downloads[i].Weekly = res.Downloads[i].Count;
            }
            else
            {
                res.Downloads[i].Weekly = res.Downloads[i].Count - res.Downloads[i - 1].Count;
            }
        }
    }

    Console.WriteLine("Processed weekly data.");
    res.Category = nuget.Category;
    nanoStats.Add(res);
}

result = JsonConvert.SerializeObject(nanoStats);
File.WriteAllText("nanoStats-all-included.json", result);
```

## PowerBI, my dear friend

Now we have a generated json file which looks like:

```
[{"Id":"nanoFramework.CoreLibrary","Category":"CoreLibrary","Downloads":[{"Count":2667,"Week":"2017-12-10T00:00:00","Weekly":2667}]},{"Id":"nanoFramework.Windows.Devices.SerialCommunication","Category":"Windows.Devices","Downloads":[{"Count":46,"Week":"2018-02-11T00:00:00","Weekly":46}]}]
```

In PowerBI, you can happily import a json source and all will be automatically recognized.

![](https://nanoframework.net/wp-content/uploads/nuget3.jpg)

Then the tip is to set the column type. Making sure that the numbers are numbers, dates are dates and so on:

![](https://nanoframework.net/wp-content/uploads/nuget4.jpg)

Apply the changes and you’ll get all your data imported.

## The cumulative growing curse

So now we have our data ready, the goal is to get some insights. The first graph I’ve built was the cumulated view. So having the dates, and the “count” which is the cumulated values:

![](https://nanoframework.net/wp-content/uploads/nuget5.jpg)

This graph will always grow because it’s a cumulative view. Now, you can see a clear acceleration of the growth: from a solid linear from 2019 to mid 2020, up to a more exponential growth starting in 2021.

That we knew already as it took us a bit more than 5 years to reach the first million and only 9 months for the second one, as already pointed out.

## Weekly growth

Another way of looking at the data is using the the weekly downloads. This is what we’ve been calculated while downloading the data.

![](https://nanoframework.net/wp-content/uploads/nuget6.jpg)

And this is the same view, this time with the data exported to Excel to be able to create tendency graphs. I’m using here a polynomial of order 5:

![](https://nanoframework.net/wp-content/uploads/nuget7.jpg)

This clearly shows the acceleration of the growth and the trend.

## Data quality and side effects

Before going further, there are few things to take into consideration.

First, the data quality from NuGet.org. No system is perfect and even if all up the data looks quite clean, some weeks have been missing. Some older statistics like the one related to .NET Microframework NuGets do not have weekly data for the older ones, only yearly ones. That does explain the various spikes you see before 2018. Also, the data from April and May are not complete, so they will always show lower than the reality. They’ll be consolidated moving next month.

Second, you have to keep few things in mind: the number of NuGet downloads is just a bias to understand the adoption. Once downloaded in a project, they won’t be downloaded again for example. Some are in cache as well and may not be reflected properly.

Third, all the pipeline runs will download the needed NuGets. They are put in cache as well in the pipeline build, so when the docs are built for example, the CoreLibrary from which all depends will only be downloaded once. That is good news as it’s now going to have too much impact on the numbers. We do have a lot of automation in the .NET **nanoFramework** organization and everything is running with pipelines. Now, looking at some concrete numbers, we are speaking about few tens thousands downloads maximum per year! So we are speaking about 1 or 2% impact on the all up numbers. Even if that number would be 5%, **the impact of pipelines is still very limited**! And some NuGets are not downloaded into a pipeline, like the ones which have no dependencies at all like the M5Stack ones.

We’ve grouped NuGets by categories, with 187 packages, plus more than 20 more related to UnitsNet, grouping them is the way to get a bit of clarity.

## Platform adoption: ESP32 is the winner, M5Stack is the fastest growing!

One of the first comparison we can do is looking at platform specific nugets. So let’s compare on the same scales 4 different categories which are exclusive: ESP32, TI, STM32 and M5Stack.

![](https://nanoframework.net/wp-content/uploads/nuget8.jpg)

What we can learn from this comparison is that ESP32 is the clear winner with the highest adoption with a cumulated number of nugets which is more than 40K, followed by the M5Stack platform with about 25K (also ESP32 based but those are excluding the other category) and then STM32 platform with around 20K.

In terms of pure growth, the M5Stack arrived in late 2021 and shows the highest growth with a current weekly download rate around 1.8K, doubling the ESP32 rate.

Those statistics are not surprising for me as we’ve been investing a lot on the ESP32 platform with a full [migration to the latest IDF platform](/improved-support-for-esp32/) back in December 2021 and also a bet on the M5Stack boards and a solid release of dedicated board support packages starting in October with continuous additions of new packages.

![](https://nanoframework.net/wp-content/uploads/nuget9.jpg)

This work added as well multiple screen drivers natively allowing anyone to have native screen support for most of the popular screen and building their own .NET **nanoFramework** image to support them.

Back in Excel, with a tendency graph, you can see the inflection point of the graphic libraries while adding those drivers:

![](https://nanoframework.net/wp-content/uploads/nuget10.jpg)

And looking at more details on the M5Stack boards, here is a view with all of them, in a weekly download view:

![](https://nanoframework.net/wp-content/uploads/nuget11.jpg)

The most popular board is the M5Core2. Others are quite egalitarian with weekly variation from one to another. The nuget called nanoFramework.M5Stack has been deprecated, that’s the reason why it has disappeared from starting in February 2022. Once originally created, it only included very minimum support with no real native support neither the screen.

## Windows.Devices and System.Device migration impact

One of the strategic decisions for the project was the decision to align the .NET IoT and .NET nanoFramework APIs for everything related with GPIO, I2C, SPI, PWM, Serial Port, etc. This was a yearly long project where we had to make both API still available at the native level where the develop was able to install the NuGets that are required. With time, we’ve started by marking the Windows.Devices NuGets as deprecated and ultimately, they were completely removed from the firmware images and samples code.

Here is the view:

![](https://nanoframework.net/wp-content/uploads/nuget12.jpg)

And the associated tendency:

![](https://nanoframework.net/wp-content/uploads/nuget13.jpg)

![](https://nanoframework.net/wp-content/uploads/nuget14.jpg)

While the cumulated numbers for the Windows.Devices nugets is impressive and still have a decent number of weekly downloads, the tendency is very clear: the Windows.Devices is logically fading while the System.Device one is raising fast.

![](https://nanoframework.net/wp-content/uploads/nuget15.jpg)

This tells us as well that despite Windows.Devices being deprecated and for the last month they aren't available in the official firmware images, they are clearly still being used with devices that have older firmware images. We expect this tendency to continue within the next few months. And most likely we’ll get a close to 0 downloads as we approach the end of the year.

## IoT.Device and UnitsNet: make it easy to use sensors

Part of the goal to migrate Widows.Devices to System.Device was to allow easy migration of the .NET IoT bindings. Here as well, a year effort has been put in place (and still going on) to migrate as many bindings as possible while the support of each of the core System.Device namespace has been added. [UnitsNet](https://github.com/angularsen/UnitsNet) is a great addition as well! Developers do not have to think too much about the units. The simplest example: Celsius or Fahrenheit conversion is done for you or to any other temperature unit with the same simplicity.

Let’s put things in perspective here:

![](https://nanoframework.net/wp-content/uploads/nuget16.jpg)

Bringing back in the view the previous one with Windows.Devices and System.Device with the IoT.Device and UnitsNet downloads.

First thing which strikes is the number of downloads just for UnitsNet and the huge spike in December. This one is related to few updates we’ve been doing and also the fact that most IoT.Device bindings are using multiple UnitsNet nuget. Temprature, Humidity are sitting in different ones, so if your sensor has both, you’ll pull both. And a lot have 3 or 4 different ones. Also, note that the UnitsNet downloads are not part of the .NET **nanoFramework** organization. They’ve been added for completion of the picture.

The other great news is that the 250K+ accumulated downloads of the IoT.Device bindings! And this has been achieved in just one year.

## CoreLibrary and Tools: sustainable growth

The CoreLibrary is the base for every other library. It has to be referenced in any project. It's the projects's corner stone. All other .NET nanoFramework NuGets depends on it. It is, therefore, an excellent proxy to understand the adoption. Now, think about the warning in the data section. If downloaded once, it will be used all over. So even if you add 20 other NuGets like in some of the M5Stack board packages, it will count for one maximum.

The category is made by 2 nugets: CoreLibrary and CoreLibrary.NoReflection. In this weekly view where both downloads are cumulated, you can clearly see that the vast majority is the regular CoreLibrary:

![](https://nanoframework.net/wp-content/uploads/nuget17.jpg)

It has nothing surprising, the no reflection one has been built to fit very small and constraints environment, so it is rarely used.

Looking at the weekly download rate and the trajectory, it does logically follow the rest of the trends 😊

![](https://nanoframework.net/wp-content/uploads/nuget18.jpg)

We can as well look at the tools section that does regroup what’s needed to flash the device, for the Visual Studio extension and the new VS Code extension.

![](https://nanoframework.net/wp-content/uploads/nuget20.jpg)

As you may now guess, the trend is the same with a nice cumulated download of the tools around 180K and a weekly trend around 75K if averring the last few months.

One question that can be raised while looking at all those nugets is the impact of moving to stable versions. The answer is most likely limited. Moving to stable releases should not really impact the trend. It is clear that the rhythm of releases may impact the numbers as once there is nothing to update or new to download, it will stay stable.

## Azure, AWS, MQTT and other networking: yes, most devices are connected!

This views shows other comparisons:

![](https://nanoframework.net/wp-content/uploads/nuget21.jpg)

On the top part, you can see the adoption of the AWS library vs Azure. Azure seems 2 times more popular than AWS with more than 10k cumulative downloads.

The Json library is used a lot in those cloud scenarios and connected scenarios. The growth is sustainable and is kept strong.

Now, let’s look at the logging and test framework. Those are 2 elements which are used more to drive quality developments in commercial companies, running in the pipelines. We, of course, use the Test Framework in as many of our pipelines as possible. And we expect to use them even more as we add end to end hardware tests.

Here too, the usage is solid, the growth more linear than for other elements but with a stick curve if you consider those are only 1 year old!

![](https://nanoframework.net/wp-content/uploads/nuget22.jpg)

## Conclusion: a good and sustainable growth

.NET **nanoFramework** NuGet downloads shows a clearly sustainable growth with rock solid fundamentals from this analysis. Whatever graphs you look at, the weekly trends are excellent, growing over and over.

Some of the bets like the M5Stack board support package has paid off and drove a sustainable usage of .NET **nanoFramework**. The all up winning platform is ESP32 and still growing. Their current availability and their low price compared to STM32 most likely played a role here as well. The M5Stack devices are well integrated, the screens and the easy connectors are driving new developers to .NET nanoFramework and the beauty of C#.

The alignment with the .NET IoT API allowed to bring easy reuse between .NET nanoFramework and .NET IoT. That drove new usage, new developers and simplicity for code sharing and reuse.

The Azure and AWS libraries brought new usage as well, allowing to connect directly those MCU to the Cloud.

All the hard work, the improvements, the fundamentals like the logging, the test framework, the improvement of the quality, the new additions, the enlargement of the platforms is paying off. And, as a result, the growth continues in a very sustainable way.
