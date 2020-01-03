---
layout: post
title:  "JavaParser’s logging framework in one file"
date:   2018-03-03 09:58:46 +0100
categories: [blog]
tags: [guide, danny]
permalink: /javaparsers-logging-framework-in-one-file/
---

## JavaParser's logging framework in one file

Ah, logging, the most important topic in the Java programming world if you look at the amount of time we spend on it! JavaParser started out without doing any logging at all, life was easy back then. Then, when we added `SourceRoot` which does a lot of file operations, and it became interesting to output some kind of progress to keep people entertained. We have a strict no-dependencies rule for javaparser-core, so, yes, we had to reinvent yet another logging framework. It was made to be as simple as possible and still meet our needs. 

The whole thing consists of two parts: the first is an API class called `com.github.javaparser.utils.Log` which has a minimal set of methods that can be seen in other logging frameworks: trace, info, error. In my experience, adding more of these only leads to organization wide fights over what should be logged at what level. 

The whole API is `static`. That means usage is incredibly simple: just type `Log.info("Processing starts.");` and there it goes. 

There it goes? Where does it go? Well, wherever you want it to go. The second part of the "framework" is `com.github.javaparser.utils.Log.Adapter`, an interface that takes strings to log (and a Throwable) that you can implement to go to your favourite logger. Once you implemented it, use `com.github.javaparser.utils.Log.setAdapter(...)`, and see JavaParser's logging go to your logging. Easy! 

Some adapters have been supplied, one that goes to the console, and another one that logs nothing at all - which is the default.