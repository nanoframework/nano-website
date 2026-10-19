---
title: "What It Took to Implement VS Code Debugging for .NET nanoFramework"
description: "A journey through wire protocols, symbol files, and bridging two worlds"
date: 2026-02-09T08:46:54Z
author: laurent-ellerbach
tags: [tooling, engineering]
wordpressId: 1702
---

_A journey through wire protocols, symbol files, and bridging two worlds_

---

## Introduction

Quite some of our .NET nanoFramework users are fans of VS Code or are using Mac OS or Linux. Having the ability to bring the debugging feature that was, so far, Visual Studio on Windows only was pressing more. When we set out to bring debugging support to VS Code for .NET nanoFramework, we knew it wouldn't be a simple port. The existing Visual Studio extension had years of development behind it, using COM-based debug engine interfaces (`ICorDebug`) that are fundamentally incompatible with VS Code's Debug Adapter Protocol (DAP). This is the story of what it took to make it happen.

## The Challenge

VS Code uses the **Debug Adapter Protocol (DAP)**–a JSON-based, language-agnostic protocol that defines how development tools communicate with debug adapters. Meanwhile, nanoFramework devices speak their own **Wire Protocol**, a binary protocol designed for resource-constrained embedded systems. The challenge was clear: we needed to build a translation layer between these two worlds.

The good news? We discovered that **no changes to the device firmware were required**. The existing Wire Protocol already supported everything we needed:

-   Breakpoints (set, clear, conditional),
-   Stepping (in, over, out),
-   Thread management and call stacks,
-   Variable inspection and modification,
-   Exception handling.

All we needed was the right bridge.

## Standing on the Shoulders of Giants: The Visual Studio Extension

Our first critical resource was the [nf-Visual-Studio-extension](https://github.com/nanoframework/nf-Visual-Studio-extension) repository. This battle-tested extension had been providing debugging support for years, and its source code became our Rosetta Stone.

### What We Learned from the VS Extension

The Visual Studio extension implements debugging through several key components:

1.  **CorDebug Engine** (`CorDebug.cs`, `CorDebugProcess.cs`, `CorDebugThread.cs`) - Implements the COM interfaces that Visual Studio expects.
2.  **Debug Launch Provider** - Handles session initialization and configuration.
3.  **Wire Protocol Integration** - Bridges to the nf-debugger library.

Studying this codebase revealed the debugging workflow:

-   How assemblies are deployed to devices.
-   How breakpoints are translated to device-understandable locations.
-   How variable inspection traverses the device's runtime value system.
-   How stepping operations coordinate between host and device.

Without access to this source code, we would have been flying blind.

## The Wire Protocol: Speaking the Device's Language

The [nf-debugger](https://github.com/nanoframework/nf-debugger) library is the crown jewel that makes debugging possible. This .NET library implements the complete Wire Protocol–the binary communication layer between host and device. There is a low level C/C++ implementation on the device itself, part of the native code.

### Key Wire Protocol Commands

| Command | Purpose |
| --- | --- |
| `Debugging_Execution_Breakpoints` | Set and clear breakpoints |
| `Debugging_Execution_ChangeConditions` | Pause/resume execution |
| `Debugging_Thread_List` | Enumerate active threads |
| `Debugging_Thread_Stack` | Get call stack frames |
| `Debugging_Value_GetStack` | Read local variables |
| `Debugging_Value_GetField` | Read object fields |
| `Debugging_Value_GetArray` | Read array elements |
| `Debugging_Resolve_Type` | Resolve type metadata |
| `Debugging_Resolve_Method` | Resolve method metadata |

The `Engine` class in nf-debugger orchestrates all device communication, handling:

-   Connection management (serial, USB, network),
-   Message framing and acknowledgment,
-   Timeout and retry logic,
-   State synchronization.

### The Bridge Decision

We faced a critical architectural decision: how do we use this .NET library from a Node.js/TypeScript debug adapter?

| Option | Pros | Cons |
| --- | --- | --- |
| **Port to TypeScript** | Native Node.js, single runtime | 4000+ lines to reimplement, two codebases to maintain, we're C# developers |
| **.NET Bridge Process** | 100% code reuse, proven implementation | Extra process, IPC overhead |
| **Edge.js interop** | Single process | Platform issues, complex setup |

We chose the **.NET Bridge Process** approach. A separate .NET process runs the actual nf-debugger library, communicating with the TypeScript debug adapter via JSON-RPC over stdin/stdout. This gave us:

-   Zero Wire Protocol reimplementation,
-   Automatic compatibility with nf-debugger updates,
-   Battle-tested communication code,
-   Faster time to working debugger.

## The Metadata Processor: Cracking the Symbol Code

Perhaps the most challenging aspect was understanding how nanoFramework represents code internally. This is where the [nf-Metadata-Processor](https://github.com/nanoframework/nf-metadata-processor) became essential.

### The Token System

nanoFramework uses a token-based system to reference types, methods, and fields. But here's the catch: **nanoFramework tokens are different from standard .NET CLR tokens**. This first debugger implementation is for the current version which does not supports generics. A new implementation will have to be done once the generics will be supported. And to better understand the token in .NET nanoFramework, read the excellent blog post from [José Simões](/hello-here-generics-are-here-for-nanoframework/).

When you compile a .NET nanoFramework application, the build process:

1.  Compiles C# to standard .NET IL using MSBuild from the "old" .NET framework generation.
2.  Runs the metadata processor to transform it to nanoFramework's PE format.
3.  Generates new tokens optimized for the embedded runtime.
4.  Creates mapping files between the two token systems.

This means a method token like `0x06000001` in your .NET assembly becomes something entirely different in the deployed nanoFramework assembly.

### The IL Offset Problem

Similarly, IL (Intermediate Language) offsets don't match between the two formats. The nanoFramework runtime uses a more compact IL representation, so instruction offsets shift.

When the debugger reports "stopped at IL offset 0x0012 in method token 0x0600003", we need to:

1.  Map the nanoFramework token back to the CLR token
2.  Map the nanoFramework IL offset back to the CLR IL offset
3.  Look up the CLR IL offset in the portable PDB to find the source line

### The .pdbx Files

The build process generates `.pdbx` files–XML-based symbol files that contain these crucial mappings:

```xml
<Method clrToken="0x06000001" nanoToken="0x06000002">
  <ILMap>
    <IL clr="0x0000" nano="0x0000" />
    <IL clr="0x0007" nano="0x0005" />
    <IL clr="0x000E" nano="0x000A" />
    <!-- ... -->
  </ILMap>
</Method>
```

We implemented a complete `.pdbx` parser and built a symbol resolution system that:

1.  Loads `.pdbx` files to get token and IL mappings.
2.  Loads portable PDB files to get source line information.
3.  Combines both to translate device positions to source code locations.

### Symbol Resolution Flow

```
Device Reports: "Stopped at nanoIL=0x000A in nanoToken=0x06000002"
        │
        ▼
┌───────────────────────────────────┐
│  .pdbx Lookup                     │
│  nanoToken → clrToken (0x06000001)│
│  nanoIL → clrIL (0x000E)          │
└───────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────┐
│  Portable PDB Lookup              │
│  clrToken + clrIL → source.cs:42  │
└───────────────────────────────────┘
        │
        ▼
VS Code shows: "Stopped at Program.cs, line 42"
```

This same process works in reverse for setting breakpoints–user clicks line 42, we trace back through the PDBs to find the exact nanoFramework IL offset to set.

## The Architecture

Here's what we ended up building:

```
┌─────────────────────────────────────────────────────────────────┐
│                         VS Code                                 │
│         Debug UI │ Breakpoints │ Variables/Watch/Stack          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                    Debug Adapter Protocol (DAP)
                              │
┌─────────────────────────────┴───────────────────────────────────┐
│               TypeScript Debug Adapter                          │
│  nanoDebugSession.ts ─── nanoRuntime.ts ─── nanoBridge.ts       │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                        JSON-RPC (stdin/stdout)
                              │
┌─────────────────────────────┴───────────────────────────────────┐
│               .NET Debug Bridge                                 │
│ ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│ │DebugBridgeSession│  │ Symbol Resolution│  │ Assembly Mgmt  │  │
│ │ (wraps Engine)   │  │ (pdbx + PDB)     │  │ (CRC matching) │  │
│ └─────────┬────────┘  └──────────────────┘  └────────────────┘  │
│           │                                                     │
│  ┌────────┴────────┐                                            │
│  │  nf-debugger    │ ◄── NuGet: nanoFramework.Tools.Debugger    │
│  │  (Engine class) │                                            │
│  └────────┬────────┘                                            │
└───────────┼─────────────────────────────────────────────────────┘
            │
            │ Wire Protocol (Binary)
            │
┌───────────┴─────────────────────────────────────────────────────┐
│                  nanoFramework Device                           │
│                     (Unchanged!)                                │
└─────────────────────────────────────────────────────────────────┘
```

## Key Components We Built

### 1\. TypeScript Debug Adapter

This component is as light as possible in TypeScript, it's still overall more than 1200 lines of code but those are mainly wrappers and raising the events, things like this:

-   **nanoDebugSession.ts** - Handles all DAP requests/responses,
-   **nanoRuntime.ts** - Coordinates debug state,
-   **nanoBridge.ts** - JSON-RPC communication with .NET bridge.

### 2\. .NET Debug Bridge

This is the main part and as we are C# developers, we're happy about writing C# code! It's about 8300 lines of code all included with comments, spacing between functions. So, not just pure code:

-   **DebugBridgeSession.cs** - Wraps nf-debugger Engine class.
-   **SymbolResolver.cs** - Source ↔ IL offset resolution.
-   **PortablePdbReader.cs** - Parses portable PDB files.
-   **PdbxModels.cs** - XML models for .pdbx files.
-   **AssemblyManager.cs** - Tracks deployed vs. local assemblies.

### 3\. VS Code Integration

-   Debug configuration provider for smart defaults,
-   Device auto-detection and selection,
-   Workspace state persistence for device preferences,
-   Debug output forwarding (`Debug.WriteLine` support).

## The Secret Weapon: GitHub Copilot as Implementation Partner

Here's where this story takes an unexpected turn. What would traditionally have been a **months-long development effort** was completed in **just a few days**. The secret? **GitHub Copilot** served as our implementation partner throughout the entire process.

### Building the Plan

The first step was creating a comprehensive implementation plan. Rather than spending days researching DAP specifications, Wire Protocol documentation, and symbol file formats separately, we worked with Copilot to:

1.  **Analyze the existing Visual Studio extension** - Copilot helped navigate the large codebase, identifying the key classes and patterns used for debugging.
2.  **Map DAP requests to Wire Protocol commands** - We collaboratively built the translation table showing exactly which Wire Protocol commands corresponded to each DAP request.
3.  **Design the architecture** - The bridge process approach emerged from discussing trade-offs with Copilot, weighing options like TypeScript ports vs. .NET interop.
4.  **Create the work breakdown** - The detailed phase-by-phase plan in our `work-debug-todo.md` was developed iteratively through conversation.

The planning document became our living roadmap–updated after each session to track progress and capture decisions.

### Executing the Plan

With the plan in place, execution followed a tight iterative loop:

```
┌─────────────────────────────────────────────────────────────┐
│                    Development Cycle                         │
│                                                              │
│   1. Discuss next component with Copilot                     │
│              │                                               │
│              ▼                                               │
│   2. Copilot generates implementation                        │
│              │                                               │
│              ▼                                               │
│   3. Review, test, identify issues                           │
│              │                                               │
│              ▼                                               │
│   4. Iterate with Copilot on fixes                           │
│              │                                               │
│              ▼                                               │
│   5. Mark phase complete, move to next                       │
│              │                                               │
│              └──────────► Repeat                             │
└──────────────────────────────────────────────────────────────┘
```

Each component followed this pattern:

-   **TypeScript Debug Adapter**: Described the DAP interface requirements, Copilot generated the session handler with all request/response mappings.
-   **.NET Bridge Protocol**: Defined the JSON-RPC message format, Copilot implemented both the C# and TypeScript sides consistently.
-   **Symbol Resolution**: Explained the .pdbx format and the mapping problem, Copilot built the complete parser and resolver.

### The Heavy Lifting

Copilot handled the genuinely tedious parts that would have consumed most development time:

#### 1\. Boilerplate and Protocol Implementation

The DAP protocol requires implementing dozens of request handlers, each with specific request/response types. Copilot generated:

-   All 20+ DAP request handlers in `nanoDebugSession.ts`,
-   Matching command handlers in the .NET bridge,
-   Type definitions ensuring TypeScript and C# stayed in sync.

#### 2\. Complex Parsing Logic

The `.pdbx` parser and Portable PDB reader required understanding binary formats and XML schemas. Copilot:

-   Generated the complete XML model classes for .pdbx,
-   Implemented the binary search algorithm for IL offset mapping,
-   Built the System.Reflection.Metadata-based PDB reader.

#### 3\. Error Handling and Edge Cases

Rather than discovering edge cases through painful debugging, we discussed scenarios upfront:

-   "What if the device disconnects mid-debug?"
-   "What if symbols don't match deployed assemblies?"
-   "What if breakpoints are set before symbols load?"

Copilot implemented defensive handling for each case. All those would have been long to implement manually but with a good brief and few iterations, all becomes possible much quickly.

#### 4\. Runtime Value Traversal

Inspecting variables on a nanoFramework device means traversing a complex type system with primitives, strings, arrays, objects, and value types. The `RuntimeValue` handling code–normally a week of work–was generated in a single session.

### The Iteration Process

Nothing worked perfectly on the first try. The real power was in rapid iteration.

Example: Breakpoint Symbol Resolution:

1.  **First attempt**: Copilot generated a straightforward lookup.
2.  **Problem discovered**: IL offsets weren't matching–nanoFramework uses compact IL.
3.  **Discussed with Copilot**: Explained the CLR vs. nano IL offset problem.
4.  **Second attempt**: Copilot added the .pdbx IL mapping layer.
5.  **Problem discovered**: Binary search was off-by-one in interpolation.
6.  **Third attempt**: Fixed algorithm, added unit test scenarios.
7.  **Working**: Breakpoints now resolve correctly.

This cycle that might take a week of solo development happened in **few hours**. The secret is using small focused iteration, asking Copilot to add logging to understand what's happening and then analyze and fix things step by step.

### What Copilot Did Best

| Task | Traditional Time | With Copilot |
| --- | --- | --- |
| DAP protocol implementation | 2-3 weeks | 2-3 hours |
| .NET bridge JSON-RPC layer | 1 week | 1-2 hours |
| Symbol file parsing | 2 weeks | 3-4 hours |
| Variable inspection logic | 1-2 weeks | 2-3 hours |
| Error handling & edge cases | Ongoing | Built-in from start |
| Documentation | Days | Generated alongside code |

### What Still Required Human Expertise

Copilot isn't magic. Critical decisions still required human judgment:

-   **Architecture choices**: The bridge process approach was a human decision based on our team skills and maintenance concerns.
-   **Understanding the domain**: Someone had to understand what tokens and IL offsets _mean_ before Copilot could implement the mapping.
-   **Testing with real devices**: Copilot can't plug in hardware–actual device testing found real-world issues.
-   **Integration debugging**: When the TypeScript and C# sides disagreed (and obviously, they do time to time), human debugging was essential.
-   **Performance tuning**: Identifying bottlenecks required profiling and measurement.

### The Workflow That Worked

After creating a plan and having iterations on the plan, it's about executing the plan. And here as well, small steps are required:

1.  **Start each session by reviewing the plan** - What's next? What's blocked?
2.  **Provide rich context** - Share relevant code files, documentation, error messages.
3.  **Describe intent, not just syntax** - "I need to map source locations to device IL offsets" not "write a function".
4.  **Review generated code critically** - Copilot is confident but not always correct, your role moves from writing most of the code to reviewing, like in a PR the generated code.
5.  **Iterate rapidly** - Don't spend hours debugging; describe the problem and get a new approach, don't hesitate to discard the previous one.
6.  **Update the plan** - Track what's done, capture what was learned.

### From Months to Days

Let's be honest about the timeline:

-   **Traditional estimate**: 13-16 weeks (based on similar projects).
-   **Actual time with Copilot**: ~5-7 days of focused work, well, in my case mainly evenings and couple of short lunch breaks.

That's not an exaggeration–it's the difference between:

-   Writing every line manually vs. generating and refining.
-   Researching APIs alone vs. asking and getting answers.
-   Debugging blindly vs. discussing problems and solutions.
-   Documenting after the fact vs. documentation as a byproduct.

The code quality wasn't sacrificed either. Copilot-generated code followed consistent patterns, included error handling, and was well-commented. In many ways, it was _more_ consistent than typical human-written code.

## Lessons Learned

### 1\. Open Source is Essential

Without access to the Visual Studio extension, nf-debugger, and metadata processor source code, this project would have been nearly impossible. Every piece of the puzzle was available because nanoFramework is fully open source. **This also enabled Copilot to be effective**–when you can share actual source code as context, AI assistance becomes dramatically more useful.

### 2\. Don't Reinvent the Wheel

The decision to create a bridge process instead of reimplementing the Wire Protocol saved significant development time. The existing code was battle-tested and handled edge cases we never would have anticipated. Copilot helped us recognize this pattern early by analyzing the scope of what a TypeScript port would require.

### 3\. Symbol Resolution is the Hard Part

Getting breakpoints to work is straightforward. Getting them to work at the _right line_ requires understanding multiple layers of symbol translation. The token and IL mapping systems were the most challenging aspect of the entire project–but also where Copilot's ability to generate complex parsing and mapping code shined brightest.

### 4\. The Device Already Supports Everything

We initially worried about limitations in the Wire Protocol. Instead, we found it was remarkably complete. The nanoFramework team had already implemented everything needed for a full debugging experience–we just needed to expose it properly.

### 5\. AI Changes the Development Economics

The most profound lesson: **AI pair programming fundamentally changes what's feasible**. Projects that would require dedicated teams and months of effort can now be tackled by smaller teams in days. The barrier isn't coding speed anymore–it's understanding the problem deeply enough to guide the AI effectively. It's like having a team of junior developers you have to coach properly. You are the very senior in the room, you take the decisions, you review, you analyze the situation, you test the code.

### 6\. Planning Matters More with AI

Paradoxically, having an AI that can generate code quickly makes _planning_ more important, not less. A clear plan means you can execute rapidly. Without a plan, you generate code that doesn't fit together. The detailed work breakdown document was essential for maintaining direction. Adjusting the plan as you go is also important. Don't miss that in your prompts.

### 7\. Domain Knowledge is the Bottleneck

Copilot can write code all day, but it can't understand your specific domain without help. The time spent learning about Wire Protocol, tokens, and IL offsets wasn't wasted–it was _essential context_ that made AI assistance effective. Invest in understanding before asking AI to implement.

## What's Next

The core debugging functionality is complete. Future enhancements include:

-   Merging some of this bridge code with the Visual Studio extension. Quite some of the code is the same or very similar.
-   Multi-device debugging support.
-   Remote debugging over network.
-   Performance profiling integration.
-   Conditional breakpoints with complex expressions.
-   Setting complex variables like strings (they require a memory allocation).
-   Generics debug once it will be released.

## Conclusion

Implementing VS Code debugging for nanoFramework was a journey through multiple codebases, protocols, and file formats. The key insight was recognizing that this was fundamentally a **translation problem**–not a reimplementation problem. By leveraging existing open-source components and building focused bridges between them, we achieved full debugging support without modifying a single line of device firmware.

But the real story here is about **how** we built it. Using GitHub Copilot as an implementation partner transformed a multi-month project into a week-long sprint. The combination of:

-   **Open source access** - Full visibility into existing implementations.
-   **AI pair programming** - Rapid code generation and iteration.
-   **Detailed planning** - Clear roadmap guiding AI-assisted development.
-   **Domain expertise** - Human understanding directing AI capabilities.

...created a development experience unlike anything before. We didn't just build a debugger–we demonstrated a new way of building complex software.

The nanoFramework community's commitment to open source made this possible. Every critical piece of documentation and code was available, searchable, and forkable. Combined with AI assistance, that openness enabled a small team to accomplish what would previously have required significant resources.

**The future of embedded development isn't just open source–it's AI-augmented open source.**

---

## Resources

-   [VS Code Debug Adapter Protocol](https://microsoft.github.io/debug-adapter-protocol/)
-   [nf-Visual-Studio-extension](https://github.com/nanoframework/nf-Visual-Studio-extension)
-   [nf-debugger](https://github.com/nanoframework/nf-debugger)
-   [nf-Metadata-Processor](https://github.com/nanoframework/nf-metadata-processor)
-   [nf-interpreter](https://github.com/nanoframework/nf-interpreter)
-   [.NET nanoFramework Documentation](https://docs.nanoframework.net/)
