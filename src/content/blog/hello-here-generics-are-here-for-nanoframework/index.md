---
title: "Hello, <T>here: generics are here for nanoFramework"
description: "A long‑awaited milestone is finally real: generics are supported in .NET nanoFramework, and the public preview starts today! 🥳"
date: 2025-12-17T17:49:51Z
author: jose-simoes
tags: [releases, engineering]
cover: ./generics-nanoframework-blog-header-3840x2160-1-scaled.jpg
coverAlt: ""
wordpressId: 1690
---

A long‑awaited milestone is finally real: **generics are supported in .NET nanoFramework**, and the public preview starts today! 🥳

This post is intentionally more than an announcement. It’s a behind-the-scenes tour of what it actually took to get here: the metadata and tooling work, the runtime and type system changes, and the many “small” edge cases that turned out not to be small at all. Some parts get unapologetically dense, because generics live right at the heart of the **ECMA-335 Common Language Infrastructure (CLI)**—the same specification that defines the execution model, metadata, and type system that .NET is built on. And because nanoFramework’s PE/metadata format is an **extended subset** of ECMA-335 (optimized for constrained devices), we’ll also talk about what had to be added and reshaped so the device can resolve and execute generic code correctly.

**TL;DR warning (with 💜):** if terms like _TypeSpec_, _MethodSpec_, _coded indices_, _token resolution_, and _generic context propagation_ sound like a pleasant afternoon, you’re in the right place. If they sound like a tax audit, you may want to skim the headings first—either way, if you’re up to it, let’s go.

## Generics in C# (Overview)

For those not familiar with what is generics in C#, here’s a quick overview.

**Generics** in C# allow you to define classes, methods, and data structures with **type parameters**, which are placeholders for specific types that are supplied when you use them ([Generic type parameters (C# Programming Guide)](https://learn.microsoft.com/dotnet/csharp/programming-guide/generics/generic-type-parameters?WT.mc_id=DT-MVP-5004179)). This enables **type-safe** code reuse: you can write a single class or method that works for any data type while still catching type errors at compile time. For example, the .NET `List<T>` class is generic – you can create a `List<int>` for integers or a `List<string>` for strings, and the compiler ensures that only the specified type is used in that list.

Key benefits of generics include:

-   **Type Safety:** They eliminate the need for casting or boxing by preserving type information.
-   **Reusability:** You can implement algorithms once, independently of specific data types, and reuse the code for different types.
-   **Performance:** They reduce runtime overhead by avoiding conversions; e.g., storing value types in a generic collection avoids boxing/unboxing.

**Example – Generic Method:** Below is a simple generic method that returns the larger of two values of any comparable type (e.g., numbers, strings). The type parameter `T` must implement `IComparable<T>` so that they can be compared:

```csharp
// Generic method to get the maximum of two values
static T Max<T>(T a, T b) where T : IComparable<T>
{
    return (a.CompareTo(b) >= 0) ? a : b;
}

// Usage:
int biggerInt = Max(10, 42);         // works with int
string laterString = Max("apple", "zebra"); // works with string
```

**Example – Generic Class:** You can also define generic classes. For instance, a minimal generic stack class could be defined as:

```csharp
public class Stack<T>
{
    private T[] _items;
    private int _count;
    public Stack(int size) => _items = new T[size];
    public void Push(T item) => _items[_count++] = item;
    public T Pop() => _items[--_count];
}
```

This `Stack<T>` can be used as `Stack<int>` for an integer stack or `Stack<string>` for a string stack, etc., each providing compile-time type enforcement.

However, due to the constraints of embedded devices, previous versions of .NET nanoFramework did not have support for generics. With this preview, .NET nanoFramework is introducing support for generics, closing the gap with standard C# capabilities. Developers can now write more flexible and reusable code on microcontrollers, just as they would on the full .NET runtime.

Keep in mind that this is a public preview following a closed preview with intensive testing quietly happening in the background. While most generic scenarios are expected to work, there may be limitations or bugs as this feature is brand new.

If you want to know the personal perspective about the details of the development of this feature, please read José Simões [blog post](https://jsimoesblog.wordpress.com/2025/12/15/the-long-road-to-generics-in-net-nanoframework-a-personal-story/) about this.

## Implementation technical details

As one can imagine, generics support had a huge impact and reach in nanoFramework code base. It touches the type system, assembly declarations, metadata, execution engine, interpreter and debugger. In practical terms, this means everything: firmware, libraries and the Visual Studio extension.

### A quick premise: “.NET semantics,” nano-sized metadata

Because .NET nanoFramework is a .NET execution engine, it deliberately honors the same CLI rules that govern C# execution: if code is supported, you should expect the _same observable outcome_ whether it runs on a desktop CLR or on a microcontroller. What changes is not the language contract—it is the _packaging_ and _shape_ of the metadata we deploy to a constrained device.

nanoFramework already shortens and adapts the standard PE/metadata model to keep footprint low and to reduce the amount of runtime crawling the device has to do. Concretely, parts of the PE headers are stripped, metadata tables are limited, indices are constrained, and (importantly) metadata tokens are 16-bit rather than 32-bit—so the IL stream itself differs from desktop .NET.

That approach (keep [ECMA 335](https://ecma-international.org/publications-and-standards/standards/ecma-335/) semantics, compress the representation) maps perfectly onto what generics demanded next: preserve the exact behavior, but extend the nano metadata model and runtime type system so the device can faithfully reproduce generic type/method behavior without turning boot and token resolution into a heavyweight process.

### From a simple C# example to what the runtime must actually do

Let’s use a deliberately small example that exercises both sides of generics: a **closed generic type** and a **closed generic method**.

```csharp
public sealed class Parcel<T>
{
    public static int Created;

    static Parcel() => Created++;

    public Parcel(T value) => Value = value;
    public T Value { get; }
}

public static class Ops
{
    public static T Echo<T>(T value) => value;
}

public static class Demo
{
    public static int Run()
    {
        var p = new Parcel<int>(42);
        return Ops.Echo<int>(p.Value);
    }
}
```

At the C# level, this looks straightforward. At runtime, however, it forces two non-negotiable capabilities:

1.  Materialize a **closed constructed type**: `Parcel<int>` must become a real runtime type identity (not just “Parcel + int” as a string).
2.  Bind and invoke a **generic method instantiation**: `Ops.Echo<int>(…)` must resolve to the correct method body _with the correct generic arguments applied_.

This is where generics stop being “syntax sugar” and become “metadata + type system + execution-flow”.

### The IL call that turns into a MethodSpec

A disassembler typically shows something close to the following (simplified for clarity):

```csharp
.method public static int32 Run() cil managed
{
  .maxstack 2

  IL_0000: ldc.i4.s   42
  IL_0002: newobj     instance void class Parcel`1<int32>::.ctor(int32)
  IL_0007: call       int32 class Ops::Echo<int32>(int32)
  IL_000C: ret
}
```

The key detail is the operand behind that call. On desktop .NET, the call operand is a metadata token that might reference a MethodDef, MemberRef, or—when the target is a **constructed generic method**—a **MethodSpec**. A [MethodSpec](https://learn.microsoft.com/dotnet/api/system.reflection.metadata.ecma335.metadatabuilder.addmethodspecification?view=net-10.0&WT.mc_id=DT-MVP-5004179) is, conceptually, “generic method + instantiation signature”.

ECMA-335 makes the “method + instantiation blob” model explicit: the **MethodSpec table** stores which generic method is being instantiated (a MethodDefOrRef coded index) and an **Instantiation** blob containing the signature of that instantiation.

That is exactly the contract you must honor at runtime: when the IL says “call `Echo<int>`”, the runtime is not merely choosing _a method_; it is choosing _a method plus a specific instantiation context_.

And you can see the same model reflected in the metadata writer APIs: `MetadataBuilder.AddMethodSpecification(...)` takes a handle to the generic method plus a blob handle representing the instantiation (the generic arguments encoded in signature form).

### Where TypeSpec comes in

The same story applies to constructed types like `Parcel<int>`. The **TypeSpec table** exists to provide a metadata token for a type _specified by a signature blob_ (rather than being a TypeDef/TypeRef), and ECMA explicitly calls out that TypeSpec tokens are used by many IL instructions that consume type tokens (e.g., `newarr`, `box`, `castclass`, `sizeof`, etc.).

That is why your “tokens become recipes” line is so important: once TypeSpec and MethodSpec exist in the model, resolution can no longer be “token → fully-known type/method.” It becomes “token → signature → bind under context → runtime identity.” we have generics.

Once you accept that both types and methods can be “described by signature blobs,” three metadata concepts become foundational and the metadata “triangle” generics forced us to add these:

-   **GenericParam**: defines the generic parameters owned by a type or method (the “`T`” itself).
-   **TypeSpec**: represents constructed types (like `Parcel<int>`) via signature blobs.
-   **MethodSpec**: represents constructed generic methods (like `Echo<int>`) as a method + instantiation blob.

### What had to change in MDP: still compressing, now also preserving generic shape

The Metadata Processor in nanoFramework has always been about two goals: reduce size and reduce complexity for the MCU at runtime. Generics didn’t change those goals—it raised the bar on what must be preserved during compression.

With generics, “dropping metadata you don’t need” becomes much harder, because generic behavior is _encoded in the relationships between tables and signature blobs_. The MDP now has to:

-   carry the additional generic constructs end-to-end (dropping them breaks binding),
-   remap and emit references that are frequently **TypeSpec/MethodSpec-based**, not just TypeDef/MethodDef-based,
-   and preserve the spirit of “give the runtime a hand” by keeping enough structure/hints that the device doesn’t need expensive crawling just to answer “what is `Parcel<int>`?” or “what does `Echo<int>` mean?”

From the nanoFramework side, this also intersects directly with the constrained PE/metadata format: limited tables, constrained indexes, and 16-bit tokens. Our PE files use both a regular metadata token and a more compact “BinaryToken”, which is part of how you keep the deployed representation efficient on-device.

### The type system shift: closed types must be stored and cached as first-class identities

A generic definition (`Parcel<T>`) is _not_ the thing you instantiate at runtime. What actually participates in execution is a **closed constructed type** (`Parcel<int>`), and that closed form needs:

-   a stable identity the runtime can compare quickly,
-   a link back to the open definition (so you can reuse method bodies and metadata),
-   and the concrete generic arguments used to close it.

Without that mapping, the runtime can’t reliably substitute placeholders in signatures, can’t build correct field layouts, and can’t guarantee consistent type identity across the application (which is a correctness issue, not an optimization detail).

This is also where you start to feel the practical consequences of TypeSpec: a TypeSpec is literally “a signature blob plus a token wrapper” — and the runtime must be able to decode it, bind it, and then cache the resulting “closed type” object so the rest of execution can treat it like any other type.

### Boot/type-resolution: signatures are now part of loading, not just parsing

Before generics, the loader can largely focus on “known tables” and straightforward linking. With generics, boot-time (or first-use) resolution must also be able to interpret signature blobs that represent:

-   constructed types (TypeSpec),
-   constructed generic methods (MethodSpec),
-   and signatures containing placeholders that only make sense once you know the current type/method instantiation context. we have generics

This is why, architecturally, generics pushes work into the **resolution stage** rather than just the “metadata read” stage. The runtime must be able to take a “spec” (TypeSpec/MethodSpec), interpret the signature, apply the right context, and then bind the result into a concrete runtime identity that the interpreter and debugger can refer to repeatedly.

### Statics: separate static fields and cctors per closed constructed type

This is a place where a generic implementation can be subtly wrong if it shortcuts semantics.

With generics, each distinct closed constructed type has its own static storage, and the static constructor must be tracked per closed type identity — not “once per open generic definition.” Your baseline already states the requirement crisply (and this is exactly the kind of detail worth emphasizing in a technical post). we have generics

Practically, this means the runtime must ensure that `Parcel<int>` is materialized early enough that:

-   its static storage can be allocated under the correct closed-type identity, and
-   its `.cctor` execution state can be tracked correctly, so “cctor runs once” remains true — but “once” is scoped to **each constructed type**, not to the open definition. we have generics

This also explains your point about execution-flow changes: in “non-generic land,” the engine can often treat statics as a straightforward type-level singleton. In “generic land,” the runtime has to treat statics as **per-instantiation**, which affects when types are created, when initialization runs, and how first access is detected.

### Token resolution and execution flow: why generic context must flow with the call

Once TypeSpec/MethodSpec enter the picture, resolution becomes context-dependent. The runtime must be able to answer:

-   “What does this type placeholder mean under the current closed type?”
-   “What does this method placeholder mean under the current generic method instantiation?” we have generics

That is why the execution engine must carry and pass **type context** and **method context** across calls: callees often need that context to resolve signatures, bind tokens, and interpret generic parameters correctly — especially for nested calls and member access where signatures include generic parameters. we have generics

A very concrete “desktop .NET corroboration” of this requirement shows up in reflection/emit APIs: if you try to resolve a TypeSpec token whose signature contains `VAR`/MVAR without supplying the necessary generic type and/or method arguments, resolution fails. In other words, the platform itself forces you to provide the same two contexts you’re describing.

Correct resolution of generic tokens is context dependent, so the execution engine must transport context across frames.

### What this means inside the interpreter: two mechanical changes you can _feel_ in the runtime

Once generics are in play, the interpreter can no longer treat “a token in IL” as something that always maps directly to a pre-known TypeDef/MethodDef. In practice, **token decoding becomes a two-step operation**:

1.  Decode the operand token from the IL stream (in nanoFramework this is already a compact world, with both a regular MetadataToken and an even more compact BinaryToken).
2.  If the token points to a _spec_ rather than a _definition_ (TypeSpec / MethodSpec), the interpreter must **follow the token into a signature blob**, decode that signature, and only then bind to a concrete runtime type or callable target.

These changes in the metada table even surfaces at the assembly header level: the header marker changes to a v2.0 marker.

### The second change: “first-time work” becomes more expensive, so caching becomes non-negotiable

The second mechanical change is where you really earn performance back: **generics introduces a lot of first-time work that must be paid once and then amortized**.

When the runtime encounters a TypeSpec/MethodSpec for the first time, it may need to:

-   materialize a closed constructed type identity (e.g., `Parcel<int>`),
-   bind a MethodSpec to a callable target (generic method + instantiation blob),
-   allocate per-instantiation static storage,
-   and ensure the `.cctor` behavior remains faithful to C# rules (“before the first instance is created or any static member is referenced”, and runs once for the relevant type).

This is why the steady-state execution story must be _cache-driven_. The interpreter cannot afford to repeatedly decode signature blobs, repeatedly substitute generic parameters, or repeatedly rebuild the same closed-type identities on every callsite hit. The hot path needs to look much closer to non-generic code: “resolve once, then reuse handles”.

A useful way to phrase the intent is:

-   **Cold path** (first encounter): decode → substitute → bind → allocate/init as needed → cache
-   **Hot path** (subsequent encounters): reuse cached runtime type/method handles with minimal overhead

That why we have a cache with a virtual methods table.

#### Why “context” must be carried explicitly in frames and calls

Finally, all of the above only works if resolution is provided the correct context. Desktop .NET makes this requirement explicit in reflection APIs: resolving a TypeSpec or MethodSpec whose signature depends on generic parameters requires you to supply the necessary generic type arguments and/or method arguments; otherwise it throws.

That is the same rule you are implementing in the interpreter: **frames and call dispatch must carry a type context and a method context**, so any downstream token/signature resolution can correctly substitute `VAR` / `MVAR`. This aligns cleanly with nanoFramework’s reduced signature/type model, which explicitly includes `Var`, `MVar`, and `GenericInst` as first-class element types.

### Type materialization and caching: how the runtime makes “closed generics” real

At this stage in the story, it helps to be explicit about _where_ nanoFramework draws the line between “desktop .NET compatibility” and “embedded pragmatism”:

-   We keep **CLI semantics** intact (same execution rules, same observable behavior).
-   We ship a **constrained PE/metadata format** that is intentionally smaller and easier to consume on-device (limited tables, limited indices, stripped PE32/COFF header), including the fact that **metadata tokens are 16-bit** in nanoFramework—so the IL stream is different from desktop .NET.
-   In the new PE format **v2.0**, generics becomes a first-class feature in that constrained format. The AssemblyHeader marker explicitly calls out that **`NFMRK2` is “version 2.0 (after adding support for generics)”**, and the table directory gains **GenericParam** and **MethodSpec**, alongside **TypeSpec**.

We had to have this v2.0 line clearly marked "in the sand” because it forces a runtime capability shift: the interpreter must be able to turn **specifications** (TypeSpec/MethodSpec + signature blobs) into **concrete runtime identities** (closed types and callable method instantiations), and then reuse them efficiently.

The key enabling detail is that signatures now contain generic element types. In nanoFramework’s reduced signature type system, v2.0 adds explicit element kinds for:

-   `Var` (generic parameter in a generic **type** definition),
-   `MVar` (generic parameter in a generic **method** definition),
-   `GenericInst` (generic type instantiation).

Those two facts—generic element types in signatures and compact coded tokens in IL—drive the rest of the implementation.

### Closed type materialization: resolving TypeSpec into a runtime type identity

With generics, a large portion of “type identity” stops being representable as a simple `(table, row)` pair. A constructed type like `Parcel<int>` is typically carried via **TypeSpec**, i.e., a token that points to a _signature blob_ describing the type. The PE v2.0 table layout makes TypeSpec a first-class table, and the format is explicitly built as an “extended subset” of ECMA-335, tuned for constrained systems.

In practice, the runtime’s “TypeSpec resolver” becomes a small engine that does three jobs:

1.  **Decode the signature blob**
    -   Recognize when the signature is a `GenericInst`.
    -   Recursively resolve each argument type (which may itself be another TypeSpec, an array/byref shape, etc.).
    -   Substitute `Var` / `MVar` placeholders when the signature is context-dependent.
2.  **Bind it to a canonical runtime identity**
    -   Construct a _key_ like:  
        **(generic definition handle, list of bound argument type handles)**  
        This key is what ensures `Parcel<int>` is “the same” closed type every time it appears.
3.  **Cache the result**
    -   The first time you see `Parcel<int>`, you pay the cost to materialize it.
    -   Every subsequent time, the type system returns the cached runtime handle without re-decoding the signature.

This caching step is not just an optimization—it’s a correctness enabler. Once you add per-instantiation statics (next section), you _need_ a stable identity for “this exact closed type” so you can hang initialization state and static storage off it.

### MethodSpec binding: turning “call Echo\<int>” into something callable

A constructed generic method call does not merely reference “a method”; it references “a method + a specific instantiation”. That is what **MethodSpec** represents in CLI metadata: a row that pairs a **MethodDefOrRef** coded index with an **Instantiation** blob (the generic arguments encoded in a signature).

On nanoFramework PE v2.0, MethodSpec appears as a first-class metadata table in the AssemblyHeader’s table directory.

Runtime-wise, the MethodSpec resolver mirrors the TypeSpec resolver:

1.  **Decode the MethodSpec row**
    -   Resolve the referenced generic method (MethodDef/MemberRef path).
    -   Decode the instantiation blob into a list of method generic argument types.
2.  **Apply context-aware substitution**
    -   If any argument type is expressed in terms of `Var`/`MVar`, it can only be resolved correctly when you know the current type/method context. nanoFramework’s own type encoding explicitly includes `Var` and `MVar`, which is the mechanism the interpreter uses to represent those placeholders.
3.  **Create a “method instantiation handle” and cache it**
    -   Keyed by something like:  
        **(generic method handle, list of method generic argument handles)**

At the end of that process, a `call` instruction no longer just points to “a method body”; it points to “a method body + a binding context”.

### The execution-model change: contexts become part of a stack frame

Once `Var`/`MVar` exist in signatures, resolution becomes context-dependent by definition. So the interpreter must treat _generic context_ as part of the execution state, not as a one-off detail of metadata parsing. Concretely, that means:

-   Every frame associated with a method that lives inside a constructed generic type must carry a **type context** (the closed type arguments).
-   Every call into an instantiated generic method must carry a **method context** (the closed method arguments).
-   Any token/signature resolver that can encounter `Var`/`MVar` must accept those contexts as inputs; otherwise, it cannot bind signatures deterministically.

This design also fits naturally with nanoFramework’s compact operand strategy: IL operands often use compact “BinaryTokens” (coded indices) that must be expanded into table + row and then interpreted—sometimes via TypeSpec/MethodSpec signature blobs.

### Per-instantiation statics and cctors: where closed type identity becomes mandatory

Now we reach the point where “materialization and caching” stop being architectural neatness and become a strict semantic requirement.

Two C# rules are load-bearing here:

-   **Each distinct closed constructed type has its own set of static fields.**
-   A **static constructor** runs automatically to initialize the type **before the first instance is created or any static members declared in that type are referenced**, and it runs only once for that type.

Combine those, and the runtime implications are immediate:

-   `Parcel<int>` and `Parcel<string>` must each have **separate static storage**.
-   Each must have **independent “cctor has run” state**.
-   Therefore the runtime must ensure the closed type is materialized early enough that static storage and initialization tracking attach to the _correct closed type identity_.

This is also why your earlier point about execution-flow changes matters: non-generic statics can often be treated as “one per TypeDef”. Generic statics must be treated as “one per closed constructed type”, which forces the runtime to allocate and initialize those statics as part of (or immediately after) closed-type materialization, not as a single global singleton attached to the open generic definition.

### Resolution flow on nanoFramework: boot-time staging vs first-use binding

With the “spec tokens” (TypeSpec/MethodSpec) and context propagation in place, the remaining work is making resolution _predictable_ and _cheap_ in the steady state. The pattern that emerges is a two-phase design:

-   **Boot-time staging**: build fast indexes and lightweight handles from the metadata tables that are always present.
-   **First-use binding**: only when IL actually touches a TypeSpec/MethodSpec do we decode the signature blob, apply context, and materialize a concrete runtime identity—then cache it aggressively.

This division aligns directly with the nanoFramework PE format goals: keep footprint low, keep tables bounded, and keep runtime crawling minimal.

### Boot-time staging: scan, validate, and build lookup surfaces

At boot (or when scanning the Deployment region), the runtime begins with the **AssemblyHeader**. The header provides verification markers/CRCs and—most importantly for performance—the offsets to every metadata table and blob stream.

A few details here matter for the resolution strategy:

-   The PE file starts with the **AssemblyHeader at offset 0**, and metadata immediately follows it; the device layout is designed for scanning multiple assemblies laid out back-to-back.
-   The header contains `StartOfTables` offsets for each table and blobs, plus an `EndOfAssembly` offset that makes it cheap to jump to the next assembly when scanning a DAT/Deployment region.
-   The header marker explicitly encodes the format version, and **`NFMRK2` is “version 2.0 (after adding support for generics)”**—this our clean “feature gate” for generics-aware resolution.
-   PE format “major differences” include: limited metadata tables, stripped PE32/COFF details, constrained indexes, and the fact that **metadata tokens are 16-bit**.

During this stage, the runtime can build fast, compact lookup structures without fully resolving everything:

1.  **Table base pointers / spans** (TypeDef, MethodDef, FieldDef, TypeRef, MethodRef, TypeSpec, MethodSpec, GenericParam, etc.), derived from `StartOfTables`.
2.  **Common coded-index helpers** for token decoding (because nanoFramework uses a compact 2-byte “BinaryToken” coded-index scheme following the ECMA-335 convention).
3.  **Lightweight definition handles** for TypeDef/MethodDef that are context-free (these can be registered early because they don’t depend on generic substitution).

This is the point where the runtime becomes “ready to execute” without having to pre-materialize every possible closed type.

### Execution-time binding: the token resolver becomes a small “binder”

Once the interpreter starts running IL, token resolution sits on the critical path. nanoFramework’s format makes this more interesting than desktop .NET in two ways:

-   Tokens are effectively **16-bit in the IL stream**, and many operands use the compact **BinaryToken** coded-index encoding.
-   Some tokens refer to **specifications** (TypeSpec/MethodSpec) that only become meaningful after decoding a signature blob (and possibly applying generic context).

So the resolver’s job becomes:

1.  **Decode the operand** (often a BinaryToken) into “table kind + index,” using the coded-index tag bits and index bits.
2.  **Dispatch by table kind**:
    -   **TypeDef/TypeRef/MethodDef/MethodRef** → mostly direct binding
    -   **TypeSpec/MethodSpec** → signature-driven binding path
3.  **If signature-driven**:
    -   Decode signature elements, including `Var`, `MVar`, and `GenericInst` (these are explicitly part of nanoFramework’s reduced `DataType` set in PE v2.0).
    -   Apply the **type context** and **method context** to substitute placeholders.
4.  **Return a bound runtime handle** (type identity or callable target).

This is where the earlier “two contexts” requirement becomes operational: the resolver is no longer pure metadata lookup; it is metadata lookup + signature evaluation under context.

### Boot vs first-use: what gets resolved when

A practical (and very nanoFramework-friendly) split looks like this:

**Resolve eagerly (boot/staging):**

-   Assembly list + header validation (marker/CRC)
-   Table boundaries / offsets
-   TypeDef and MethodDef registration for open definitions (including generic type/method definitions)
-   Any trivial mappings that don’t require signature evaluation

**Resolve lazily (first-use):**

-   **TypeSpec materialization** (closed constructed types, including nested instantiations)
-   **MethodSpec binding** (generic method instantiations)
-   Any signature-dependent field/method/constraint interpretation that needs context

This split is exactly what our earlier “cold path vs hot path” framing was setting up: signature decoding and substitution is inherently heavier, so one does it only on demand, then cache.

### Caching: keying, lifetime, and why invalidation is usually unnecessary

Once you decode a TypeSpec or MethodSpec under a specific context, you want the result to be reusable.

**Key choice (typical and effective):**

-   **Closed type cache** keyed by: _(TypeSpec row or signature blob)_ + _(bound type-argument handles)_
-   **Method instantiation cache** keyed by: _(MethodSpec row)_ + _(bound method-argument handles)_

**Lifetime / invalidation:**

-   In the nanoFramework PE model, assemblies live in a well-defined deployment layout (ROM/FLASH “Deployment region”), and the header has CRCs and a fixed table directory; the runtime is designed to scan and locate assemblies deterministically.
-   The runtime does not use versions to resolve references because **only one version of an assembly can be loaded at a time**, and PE references don’t include versions.

Given those constraints, it is generally safe (design inference) for caches to be **process-lifetime**: once a spec is bound, it remains valid until reboot/reset because the underlying assembly image does not mutate during execution.

### Static initialization under generics: tying caches to “cctor + static storage per closed type”

This is where caching and correctness intersect.

In C#, a static constructor is called automatically before the first instance is created or any static members are referenced, and it is called at most once.  
Also, the presence of an explicit static constructor prevents the relaxed `beforefieldinit` behavior, tightening when initialization is permitted to occur.

For generics, the runtime must enforce those rules **per closed constructed type identity** (e.g., `Parcel<int>` vs `Parcel<string>`). That makes the closed-type cache more than a performance structure: it becomes the natural anchor for:

-   the “cctor has run” flag, and
-   the per-instantiation static field storage.

This is also why PE v2.0 explicitly bounds GenericParam indexing (e.g., `GenericParamTableIndex` as an 8-bit index as it, by design won’t support more than 255 generic parameters. The system is engineered for predictable, bounded metadata and predictable runtime structures.

### How the resolver stays fast: shaping the cold path and hot path

With the pieces above, the runtime can make token resolution behave like this:

-   **Cold path (first time)**: decode BinaryToken → follow TypeSpec/MethodSpec → decode signature → substitute `Var/MVar` → bind → allocate/init statics if required → store in cache.
-   **Hot path (subsequent times)**: decode BinaryToken → hit cache → use bound handle directly (minimal overhead).

That is the essential “embedded-friendly” design: correctness is paid once, and the steady-state path is kept close to non-generic execution.

### End-to-end walkthrough: resolving a 'CALL' that targets a MethodSpec

To make this concrete, we will follow a single instruction—`call`—from the moment the interpreter fetches it, through token decoding, through MethodSpec binding, and into the actual call dispatch.

The C# we start from:

```csharp
public static class Ops
{
    public static T Echo<T>(T value) => value;
}

public static class Demo
{
    public static int Run(int x) => Ops.Echo<int>(x);
}
```

A desktop disassembler typically renders the intent like this:

```
IL_0000: ldarg.0
IL_0001: call int32 class Ops::Echo<int32>(int32)
IL_0006: ret
```

The important bit is not the opcode; it is the _operand_. In generic code, that “method reference” is frequently not a plain MethodDef/MemberRef. It can be a **MethodSpec**, i.e., a method _instantiation_.

#### Step 1: Fetch opcode and read the operand token

In nanoFramework PE files, many IL instructions carry a token operand that points back into metadata. Because nanoFramework constrains metadata table indexes, the interpreter reads a compact operand and then has to determine what it represents.

At this point the resolver has two broad cases:

-   **Direct reference**: token maps straight to MethodDef or MethodRef (fast path).
-   **Specification reference**: token maps to MethodSpec, which requires signature decoding (generic path).

MethodSpec exists as a first-class table in nanoFramework PE format v2.0.

#### Step 2: Identify “this is a MethodSpec token” and load the MethodSpec row

Once the operand identifies the **MethodSpec** table (table kind `MethodSpec` exists in the table-kind enumeration), the runtime retrieves:

-   the **Method** field (which points to the generic method definition/reference), and
-   the **Signature** blob (which encodes the generic arguments of the instantiation).

This shape is mirrored by the official metadata APIs as well: a `MethodSpecification` exposes a `Method` handle (MethodDef or MemberRef) plus a `Signature` blob handle.  
And when emitting metadata, `MetadataBuilder.AddMethodSpecification(...)` takes exactly those two things: the generic method entity handle and an instantiation blob that encodes the generic arguments.

So far, we have not _resolved_ anything—we have simply identified that this call site points to “generic method + instantiation blob.”

#### Step 3: Decode the Method field (MethodDefOrRef coded index)

Inside MethodSpec, the “which method is this an instantiation of?” pointer is not a single table reference; it is a coded index: **MethodDefOrRef**.

nanoFramework uses the ECMA-335 coded-index convention in its compact **BinaryToken** representation: for MethodDefOrRef, a 1-bit tag selects between **MethodDef** and **MemberRef** (the remaining bits are the row index).

So the interpreter does:

1.  Read the coded index.
2.  Extract the tag bit.
3.  Route to either:
    -   MethodDef table lookup (method defined in this assembly), or
    -   MemberRef/MethodRef table lookup (method referenced from elsewhere).

This yields the _generic method definition_ we will be instantiating (in our example: `Ops.Echo<T>`).

#### Step 4: Decode the instantiation signature blob

Now we decode the MethodSpec signature blob. Conceptually, this blob is “the generic method arguments” (for `Echo<int>`, it is a single argument: `int32`). That is precisely how Microsoft describes it in the metadata writer API: “The instantiation blob encoding the generic arguments of the method.”

On nanoFramework, signature decoding is performed using the interpreter’s reduced `DataType` encoding. For generics support type system explicitly includes:

-   `Var`: “Generic parameter in a generic type definition”
-   `MVar`: “Generic parameter in a generic method definition”
-   `GenericInst`: “Generic type instantiation”

So the blob decoder walks the encoded types and produces a list of argument type handles. For `Echo<int>`, the result list is simply `[System.Int32]`. For more complex cases you may see:

-   arguments that are themselves generic instantiations (`GenericInst`), which requires recursive type materialization, or
-   arguments expressed as placeholders (`Var`/`MVar`), which cannot be bound without context (next step).

#### Step 5: Apply generic context substitution (VAR/MVAR binding)

If the instantiation blob contains `MVar n`, it means “use the n-th generic parameter of the current method.” If it contains `Var n`, it means “use the n-th generic parameter of the enclosing type.” nanoFramework’s type encoding makes both cases explicit.

This is where the interpreter’s earlier architectural change becomes operational:

-   the current frame supplies a **type context** (closed type arguments), and
-   the call site supplies a **method context** (closed method arguments).

In our running example, the instantiation blob is concrete (`int32`), so substitution is trivial. But this step is mandatory in the general case because MethodSpec signatures and nested signatures can contain `Var`/`MVar` placeholders.

#### Step 6: Bind and cache the instantiated method target

At this point the runtime has:

-   the underlying generic method definition/reference (resolved from MethodDefOrRef), and
-   the fully bound list of instantiation argument type handles (post-substitution).

Now it can create (or reuse) an internal “instantiated method handle” keyed by something like:

> (generic method identity, bound method-argument list)

Caching here is non-negotiable for two reasons:

1.  Signature decoding is significantly more expensive than direct MethodDef lookup.
2.  Without caching, a hot callsite would repeatedly rebuild the same instantiation.

This is fully aligned with why nanoFramework is an “extended subset” of ECMA-335: keep metadata compact, avoid repeated runtime crawling, and pay the signature/instantiation costs once.

#### Step 7: Dispatch the call and propagate the method context to the callee

Finally, the interpreter dispatches the call:

-   pushes a new frame,
-   associates the callee with the instantiated method handle,
-   and attaches the **method context** so that any further token/signature resolution inside the callee can correctly resolve `MVar` (and `Var`, if the callee is within a constructed type).

This is the point where MethodSpec stops being “metadata structure” and becomes “execution reality”: the callee is invoked with the correct binding information to preserve CLI semantics.

## Closing the generic world: how the Metadata Processor decides what to emit (and why)

One question inevitably follows the “new tables + new resolution rules” story: _if the runtime can’t discover or manufacture new generic instantiations on-device, how do we ensure every required `TypeSpec`/`MethodSpec` is already present in the .pe?_

The answer is that the Metadata Processor (MDP) performs a deterministic “closure” over everything an application can reach, and then emits only that _reachable_ set into the nanoFramework PE format.

Why a “closure” is necessary on nanoFramework?

nanoFramework’s PE format is an **extended subset of ECMA-335**, shaped by MCU constraints: metadata tables are limited, indexes are bounded, and tokens are smaller.

Those constraints are precisely why we cannot rely on runtime “late discovery” patterns that desktop environments can sometimes tolerate. On nanoFramework, the runtime must be able to resolve everything from the deployed metadata, quickly and predictably. That means MDP must ensure that every generic instantiation used by the program is already materialized in metadata form.

Also worth highlighting: MDP isn’t an optional tool in this pipeline—it’s _the_ post-build transformer that takes the Roslyn-produced assembly and converts it into the nanoFramework `.pe` representation the device runs.

And what “closure” means in practice for generics?

For non-generic code, “reachable metadata” is mostly about ensuring referenced types/methods/fields make it into the reduced PE tables. For generics, there’s an additional rule:

> Every closed generic type and every instantiated generic method that the IL can reach must have a metadata representation.

That representation is exactly what `TypeSpec` and `MethodSpec` provide:

-   `TypeSpec` gives a token for a type described by a signature blob (which is how constructed types are represented).
-   `MethodSpec` ties a generic method (a MethodDef/MemberRef) to an instantiation signature (the generic arguments at the call site).

And this begs the question: how MDP discovers the required `TypeSpec`/`MethodSpec` rows?

The key is that MDP crawls the IL and the metadata references, building an instantiation graph.

Concretely, MDP scans for the constructs that _imply_ generic instantiations:

1.  **Member references whose “parent” is a `TypeSpec`**  
    In nanoFramework PE, many IL references use “coded indices” (compact 2-byte `BinaryToken`s). The `MemberRefParent` coded index explicitly includes `TypeSpec` as one of its possible parents, and `MethodDefOrRef` can be a `MemberRef`.  
    Translation: if IL references a method/field on a _constructed type_, the containing type is very often a `TypeSpec`, and MDP must carry that forward.
2.  **Method calls that go through `MethodSpec`**  
    A generic method invocation that supplies concrete type arguments needs a `MethodSpec` row (“which method” + “which instantiation signature”).
3.  **Nested/composed generic signatures**  
    Generic instantiations rarely appear “flat.” A constructed type can contain other constructed types in its signature (e.g., `Bucket<List<int>>`\-style nesting), and method/field references can embed these composite shapes.

This is where the closure work becomes recursive: discover one `TypeSpec`, then also discover the types used inside its signature, and the member refs that depend on it, and the method specs that reference those…

So, why crawling IL/member refs is essential? This can be condensed in the following bullet points:

-   If we **don’t crawl `MethodSpec`**, we'll miss generic method instantiations, and we’ll fail at runtime when a call site needs an instantiation context that isn’t in the PE.
-   If we **don’t expand nested `TypeSpec`**, we’ll emit a top-level constructed type token but miss its inner type arguments (and any dependent member references).
-   If we **don’t filter aggressively**, we inflate metadata—which is dangerous given the constrains on the storage space that the PE is expected to run.

This is a determinist process (and that matters) in the sense that:

-   **MDP does not “guess.”** It follows the references the compiled IL contains (plus whatever additional roots nanoFramework declares as required for execution/debugging).
-   **The output is deterministic for a given input assembly set.** That determinism is what lets the runtime stay simple and fast: it resolves tokens against tables that already contain the closed types/methods the program can actually reach.

This is also why the PE format leans so hard on compact tokens/coded indices: the runtime benefits from pre-shaped metadata, and the MDP is where the “heavy lifting” belongs.

## Virtual dispatch and generic interfaces: making **_callvirt_** work with TypeSpec/MethodSpec

So far, we have focused on `call` (often via `MethodSpec`) and `newobj` (often involving `TypeSpec`). To make the generics implementation feel complete, it is worth explicitly covering **virtual dispatch**—because the most interesting cases in real applications happen through `callvirt`, especially when interfaces are involved.

### The baseline: what _**callvirt**_ really means in the CLI

`callvirt` selects the target based on the **runtime type** of the instance, not just the compile-time type. It is the instruction used for virtual dispatch and is also commonly emitted for non-virtual instance calls (with the same “choose based on runtime type” semantics).

In CLI terms, virtual methods form an override chain, controlled by rules such as `newslot` vs overriding and explicit overrides via `MethodImpl` (`.override`).

#### How the type system “builds slots” (virtual) and “builds maps” (interfaces)

At load/type-construction time, the runtime builds two related structures:

1.  **Virtual method slots (vtable-like layout)**  
    Virtual methods participate in an inheritance hierarchy; `newslot` forces a new virtual member, while non-`newslot` methods can override inherited virtuals.
2.  **Interface dispatch tables (interface → candidate implementations)**  
    ECMA-335 specifies that the VES constructs an _interface table_ (per interface method, a list of candidate implementations) on the **open form of the class**, then uses a defined algorithm at invocation time to pick the correct target.  
    Importantly for generics, the invocation algorithm explicitly says it performs lookup starting from the runtime class and **substitutes generic arguments** specified on the invoking class.

This is exactly where nanoFramework’s earlier design decision (“carry generic context in frames/calls”) becomes necessary: interface/virtual dispatch may require matching signatures after substituting `VAR`/`MVAR` and applying the constructed type’s generic arguments.

#### The three generic scenarios that matter

##### 1) The target method is on a constructed generic type

When you `callvirt` a method declared on (or overridden by) a constructed generic type (e.g., `Bucket<int>`), the runtime still follows normal virtual dispatch rules—choose the most derived applicable implementation based on the runtime instance type.  
Where generics changes the mechanics is in **how the call site identifies the member**: in generic contexts, metadata often anchors member references to a _constructed_ declaring type, and the CLI model allows overriding/explicit mapping using constructs expressed with `TypeSpec` (see `.override` syntax referencing `TypeSpec::MethodName`).

##### 2) The interface is generic

For a generic interface (e.g., `IFoo<T>`), the dispatch problem is not just “find a method named M”; it is “find the implementation of `IFoo<T>::M` for this particular instantiation of the interface/type.”

ECMA-335 makes this concrete:

-   The VES constructs the interface table on the open type.
-   When an interface method is invoked, the runtime begins at the runtime class and uses that interface table **while substituting generic arguments** from the invoking class.
-   Ordering can matter when multiple implementations exist due to different type parameters; the spec explicitly notes that declaration order can affect which implementation is selected.

That “substitute generic arguments” clause is the key detail to state explicitly in your post, because it ties the CLI dispatch rules directly to nanoFramework’s requirement to carry and apply the type context during dispatch.

##### 3) A generic method is invoked through an interface reference

This is the “stacked” case: you have interface dispatch **and** a method instantiation.

Two things are worth stating succinctly:

-   Interface methods are virtual/abstract by nature, so they are invoked via the `callvirt` mechanism, and their resolution follows the interface table algorithm (including generic argument substitution).
-   When the target method is itself a _generic method instantiation_, the instantiation is represented by **MethodSpec** (“which generic method is being instantiated”) plus an instantiation signature (“with which generic arguments”).

In other words: for “generic method through interface,” nanoFramework must do **two bindings** correctly and in the right order: interface-target selection (using the runtime type + substituted type arguments), and then method instantiation binding (MethodSpec + method generic arguments). Both steps depend on having the correct generic context available at the point of dispatch.

## New generic types and interfaces: enabling real-world scenarios

Adding generics support to the runtime was only part of the story. To make generics _practical_ and idiomatic in C# code on tiny devices, we also needed to bring in the **fundamental generic types and interfaces** that people actually use in everyday .NET development. These are not arbitrary add-ons — they enable patterns and performance that are simply not achievable with their non-generic predecessors.

The following generic types were added to the base libraries as part of the generics support rollout:

-   **`Span<T>`** and **`ReadOnlySpan<T>`** — lightweight, type-safe views over contiguous memory. Because they don’t allocate on the heap and avoid boxing, they are essential for high-performance buffer manipulation and APIs that work with raw memory in a generic way.
-   **`List<T>`** — a dynamically resizable array of `T`, which replaces older non-generic collections like `ArrayList`. It allows safe, type-checked storage and retrieval of values without casting.
-   **`Stack<T>`** — a generic last-in, first-out (LIFO) collection that works with any `T` without the need for boxing or unsafe casting.

These generic collection types differ fundamentally from non-generic ones because they are _strongly typed at compile time_. The compiler knows what type they hold, and you get:

-   **Type safety enforced at compile time** — the compiler prevents invalid types from being inserted or retrieved.
-   **Better performance for value types** — because generics avoid boxing/unboxing when storing and retrieving value types.

By contrast, non-generic collections (e.g., `ArrayList`, non-generic `Stack`) work with `object`, forcing every value to be stored and retrieved as `object` and requiring casts at runtime, which is both less safe and less efficient.

Alongside the concrete types, we also added key generic interfaces:

-   **`IEnumerable<T>`** — represents a sequence of `T` that can be iterated over. It forms the backbone of collection traversal in .NET and enables patterns like `foreach` and LINQ, without the need to cast each item.
-   **`IList<T>`** — extends `IEnumerable<T>` with indexed access and mutability, providing a common foundation for list-like types.
-   **`IComparable<T>`** and **`IComparer<T>`** — strongly typed comparison contracts, allowing generic algorithms and collections (like sorting routines) to order `T` values without relying on untyped comparison interfaces.

These generic interfaces differ from their non-generic predecessors in that they carry a type parameter, letting the compiler know _exactly_ what type operations apply to. For instance, `IEnumerable<T>` means “a sequence of `T`,” whereas the legacy `IEnumerable` means “a sequence of `object`,” requiring casts for each element and risking runtime errors if misused.

Adding generics to the runtime without these core types would be like adding “2D drawing” to a graphics system but never implementing shapes — syntactically possible, but not usable in practice. These generic types and interfaces are the _building blocks_ for real generic code:

-   They **leverage generic type parameters** to enforce correctness at compile time.
-   They **avoid the performance costs** associated with boxing/unboxing and runtime casting.
-   They enable common programming patterns (iteration, sorting, collection manipulation) to work fluidly with generics, just as developers expect in full .NET.

Because of this foundation, generic APIs feel natural and efficient — whether you’re using spans, lists, stacks, or any other future generic collection.

One commonly expected generic type that is still in progress is **`Dictionary<TKey, TValue>`** — a strongly typed key/value map that is ubiquitous in .NET code. Work is underway to bring it to the generic preview, rounding out the collection story and giving embedded developers a familiar, high-performance associative container next.

## Stackalloc: ECMA-compliant semantics on a constrained CLR

To make `Span<T>`based, allocation-free patterns truly portable between “full” .NET and .NET nanoFramework, we also had to close a long-standing gap: `[stackalloc](https://learn.microsoft.com/dotnet/csharp/language-reference/operators/stackalloc?WT.mc_id=DT-MVP-5004179)`support. In C#, `stackalloc` is specified as allocating a temporary block whose lifetime is the current method invocation (it is reclaimed on method exit, and there is no explicit “free”).

Under the hood, C# compilers map `stackalloc` to the CIL instruction **`localloc`**, which allocates from the method’s _local memory pool_ (again, reclaimed when the method returns). The CLI also defines how initialization works: if the method has the _localsinit_ flag, the allocated block is **zero-initialized**; otherwise, its initial contents are unspecified.

Here's a concrete IL view: `localloc` feeding `Span<byte>`. If we start with a small, “portable” snippet:

```csharp
Span<byte> tmp = stackalloc byte[32];
tmp[0] = 0x42;
Process(tmp);
```

A representative IL shape (simplified for readability) looks like:

```
IL_0000: ldc.i4.s   32          // size in bytes
IL_0002: localloc               // allocate from local memory pool
IL_0004: ldc.i4.s   32
IL_0006: newobj     instance void valuetype System.Span`1<uint8>::.ctor(void*, int32)
IL_000B: stloc.0
// ...
IL_0010: ldloc.0
IL_0011: call       void Process(valuetype System.Span`1<uint8>)
```

That pattern—**`localloc` → construct `Span<T>` over a raw pointer**—is exactly what we needed to support to unlock many modern APIs (including real-world nanoFramework examples that already rely on `stackalloc` for temporary buffers).

On a desktop CLR, “stack” vs “heap” is a runtime implementation detail behind the CLI guarantees. On microcontrollers, the _physical_ call stack is typically small and tightly budgeted, so implementing `localloc` as “consume native stack bytes” would be fragile and would make correct programs fail unpredictably under real workloads.

So nanoFramework implements the **ECMA lifetime rules** (method-scoped allocation + deterministic reclamation), but backs the storage using the most robust option we have on MCU targets: **allocation from the C runtime heap**, with deterministic cleanup when the stack frame unwinds. This is also why `stackalloc` work appears in the generics effort backlog alongside other missing IL primitives (for example `localloc`/block-copy support) required to reach behavioral parity.

### Representing _**stackalloc**_ memory in the object model

Even though the storage originates outside the “managed heap,” the execution engine still needs a first-class way to _track, pass around, and bounds-check_ that buffer—especially because the common consumption pattern is via `Span<T>`/`SpanByte`\-like structures whose managed representation includes an **array reference plus slicing metadata** (array/start/length). nanoFramework already models arrays using the dedicated heap representation **`CLR_RT_HeapBlock_Array`**, which is the canonical way native code and the runtime reason about “array-like” memory.

To make `stackalloc` work seamlessly, we extended that mechanism so an “array heap block” can also **reference externally-owned storage** rather than only inline payload that lives inside the managed heap. This extension is critical for two scenarios that show up immediately once you bring in generics + spans:

1.  **Externally-backed buffers** (the `stackalloc` case): storage is native-heap allocated, but surfaced through the usual array/span abstractions.
2.  **Slicing/aliasing buffers**: spans and span-like structs must be able to point _into_ another buffer (including other arrays) without forcing copies—again matching desktop .NET behavior.

### Deterministic cleanup: honoring the CLI lifetime contract

Finally, we had to ensure the most important semantic point: **the memory is reclaimed when the method returns**. The CLI model for `localloc` is explicit that the local memory pool is reclaimed on method exit, and there is no instruction to free earlier.

In nanoFramework terms, that means tying the allocation to the **current stack frame’s lifetime**, so even though the bytes are obtained from the native heap, they behave like “stack memory” from a C# developer’s point of view: safe within the method, invalid after return, and consistent with the same code running on desktop .NET.

### Why this mattered in generics?

This “stackalloc closure” was not a nice-to-have. It was a prerequisite to deliver what developers actually expect when they hear “generics support” in modern C#:

-   `Span<T>`/`ReadOnlySpan<T>` usage patterns,
-   allocation-free temporary buffers,
-   deterministic lifetimes,
-   and predictable behavior across platforms.

In other words: **generics parity required `stackalloc` parity**—because the ecosystem uses them together everywhere.

## Preview tooling, versioning, and how to get set up (v2)

Because this is a _runtime_ feature, the generics public preview is deliberately versioned as **v2 across the stack**: **firmware (nanoCLR)**, **core libraries**, and the **tooling/debugger**. In practice, that means you should treat “generics support” as an _ecosystem switch_ rather than a single package update.

To run generics on-device, you must use **preview firmware that includes generics support (v2)**, and your application must reference the **2.0+ preview** NuGets that carry the matching metadata and BCL surface. Mixing **pre-generics (1.x)** libraries with **generics-enabled (2.x)** ones is not supported and will lead to resolution/deployment failures.

Flashing a generics-capable runtime is straightforward: use the **`--preview`** flag so `nanoff` pulls from the development feed. Example (ESP32 on COM4):

```shell
nanoff --target ESP32_WROOM_32 --serialport COM4 --update --preview
```

You can also list preview-ready targets (and filter by platform) to confirm what’s available for your board.

Building and debugging generics projects requires the **preview** .NET nanoFramework Visual Studio extension, because it includes the debugger and deployment updates needed to understand the new metadata and runtime behaviors. The preview VSIX is distributed via **Open VSIX Gallery**, with separate packages for:

-   **Visual Studio 2019 (preview)**
-   **Visual Studio 2022/2026 (preview)**

Important operational note: it’s **not possible** to support pre- and post-generics projects with the same installed extension. In other words: choose **preview extension for v2/generics** or **stable extension for v1**, but don’t expect them to coexist cleanly side-by-side. If you want to have both in the same machine, that is possible in Visual Studio 2022 and 2026. You can have one version installed in one and another in the other. 🤪

Once firmware + tooling are aligned, update your project’s nanoFramework NuGets to the latest **2.0.0-preview (or later)** versions (including core packages such as **nanoFramework.CoreLibrary** and the relevant **System.\*** assemblies). Ensure “Include prerelease” is enabled so those packages show up.

### Known limitations

One current caveat: **inspecting generic instances in the debugger isn’t yet 100%** (for example, watch windows may not always display generic type parameters correctly). This is an expected rough edge in the preview and is actively being addressed as the extension iterates.

### Where this is documented (and where to give feedback)

All of the above setup guidance is now documented directly in the **nf-interpreter repo** (the generics public preview [README](https://github.com/nanoframework/nf-interpreter/blob/main/README-GENERICS.md))

Most importantly: please _use_ it and tell us what breaks (or what feels great!). The fastest feedback loop is the dedicated [Discord](https://discordapp.com/invite/gCyBu8T) channel **`#generics-public-preview`**, and longer-form topics can go through the nanoFramework GitHub [Discussions](https://github.com/orgs/nanoframework/discussions/categories/generics-public-preview).

### A quick wrap-up

This is a major milestone for .NET nanoFramework: bringing a foundational C# feature to constrained devices in a way that preserves expected language/runtime semantics is a big step toward being genuinely feature-aligned with “full” .NET—earned through a long, complex development path.

Have fun with **.NET nanoFramework**!
