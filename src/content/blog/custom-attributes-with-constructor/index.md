---
title: "Custom attributes with constructor"
description: "nanoFramework just got support for these. You can now have custom attributes with a constructor and access the value on the constructor."
date: 2020-03-13T15:30:10Z
author: jose-simoes
tags: [engineering]
cover: ./custom-attributes-constructor-scaled.jpg
coverAlt: ""
wordpressId: 828
---

Yes, you read that correctly!

**nanoFramework** just got support for these. You can now have custom attributes with a constructor _and_ access the value on the constructor.

Let's see some code to illustrate this.

Consider these two classes defining attributes.

```csharp
public class AuthorAttribute : Attribute
{
    private readonly string _author;
    public string Author => _author;
    public AuthorAttribute(string author)
    {
        _author = author;
    }
}
```

```csharp
public class MaxAttribute : Attribute
{
    private readonly uint _max;
    public uint Max  => _max;
    public MaxAttribute(uint m)
    {
        _max = m;
    }
}
```

Now a class using the above attributes on a given field.

```csharp
public class MyClass1
{
    [Attribute1]
    [Attribute3]
    public void MyMethod1(int i)
    {
        return;
    }
    [Ignore("I'm ignoring you!")]
    public void MyMethodToIgnore()
    {
    }
    private readonly int _myField;
    [Ignore("I'm ignoring you!")]
    public int MyField => _myField;
    [Max(0xDEADBEEF)]
    [Author("William Shakespeare")]
    public int MyPackedField;
}
```

And finally reaching those attributes.

```csharp
var myClass = new MyClass1();

var myFieldAttributes = myClass.GetType().GetField("MyPackedField").GetCustomAttributes(true);
Debug.WriteLine($"\nThe custom attributes of field 'MyPackedField' are:");

MaxAttribute attMax = (MaxAttribute)myFieldAttributes[0];
Debug.WriteLine($"MaxAttribute value is: 0x{attMax.Max.ToString("X8")}");

AuthorAttribute attAuthor = (AuthorAttribute)myFieldAttributes[1];
Debug.WriteLine($"AuthorAttribute value is: '{attAuthor.Author}'");
```

The above code will output something like this:

```
The custom attributes of field 'MyPackedField' are:
MaxAttribute value is: 0xDEADBEEF
AuthorAttribute value is: 'William Shakespeare'
```

Looks pretty simple and trivial doesn't it? And can be very useful too!  
Get the full project on our samples repo [here](https://github.com/nanoframework/Samples/tree/master/samples/Reflection).

And what are you waiting for? Go write some code and have fun with **nanoFramework**! :)

PS: make sure you join our lively [Discord community](https://discord.gg/gCyBu8T) and follow us on [Twitter](https://twitter.com/nanoFramework).
