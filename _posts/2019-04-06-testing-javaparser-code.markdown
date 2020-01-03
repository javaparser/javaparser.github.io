---
layout: post
title:  "Testing JavaParser Code"
date:   2019-04-06 09:58:46 +0100
categories: [blog]
tags: [guide, danny]
permalink: /testing-javaparser-code/
youtubeId: IW5FsUGenNs
---

## Test approach

Several styles of testing have been used in JavaParser over the years,
and although it is appreciated if you reuse existing tests and utilities,
we're already pretty happy if you are writing tests at all.

Most tests are written using JUnit 5.
Some are written using JBehave, as described below.
Choose what you like.

## Behavior Driven Development

[JBehave](http://jbehave.org/) is for Behavior Driven Development defined with a given-when-then syntax.
The key aspect however is the ability to define scenarios in plain text, and have the ability to _reuse_ the same expectations `then’s` once defined in Java.

The other key aspects are that JBehave is POJO orientated and and not
 a large leap away from regular JUnit; which is perhaps more suitable 
for casual committers rather than something like Spock.

The test cases reside in the `javaparser-core-testing-bdd` module.

## Video Demo

A demonstration video is available to introduce testing with JBehave and the JavaParser

{% include youtubePlayer.html id=page.youtubeId %}

## Contributing

If you would like to contribute to the project, but have a question  about JBehave based testing please raise create a question in [issues](https://github.com/javaparser/javaparser/issues).
