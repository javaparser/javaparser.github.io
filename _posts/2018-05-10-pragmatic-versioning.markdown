---
layout: post
title:  "Pragmatic Versioning"
date:   2018-05-10 09:58:46 +0100
categories: [blog]
tags: [guide, danny]
permalink: /pragmatic-versioning/
---
At JavaParser we use a variation of [Semantic Versioning](https://semver.org/) that we might call "Pragmatic Versioning."

### Why?

First, why not just use the Semantic Versioning? Well, simply because we want to keep the project moving forward with the small amount of manpower we have. That means the (huge!) API and functionality are constantly being worked on, and incompatabilities with the last version are often introduced. If we used Semantic Versioning, we would either be at version 438.0.0 by now, or we would have littered the code with backwards compatability hacks, or maybe we would simply not have improved the library! You can draw a parallel with the Java programming language itself: in the beginning it was fine, but after a while you could see how Sun was struggling to add new features: anonymous objects instead of adding anonymous functions, type erasure for generics, three date API's, a somewhat uncomfortable lambda implementation. The amount of effort put into keeping all of this backwards compatible is enormous, and _hurts the product_ because they cannot choose the best implementation.

### What can you expect from a certain version?

If it's a MAJOR version increase, expect to spend some time with the [migration guide](https://github.com/javaparser/javaparser/wiki/Migration-Guide), because we took the time to take existing pain points and completely refactor them. Functionality may have been moved, removed, improved, and the whole approach to some tasks may have changed. When the MINOR version increases, some significant new functionality was introduced. It might break some things here and there, but the release notes and Javadoc should send you in the right direction. When the PATCH version increases it should be a smooth upgrade, although a look at the release notes might be useful:

*   the API was broken but the transition is pretty easy, or
*   something obscure has been refactored, or
*   something that was released in the last month has been refactored (becauses we assume it hasn't got many users yet,) or
*   a bug was fixed that needed an API break

So in short: MINOR is updated when we want your attention, and MAJOR is updated when we _need_ your attention.