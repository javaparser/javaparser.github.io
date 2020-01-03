---
layout: post
title:  "Code generation and Maven in JavaParser"
date:   2018-03-03 09:58:46 +0100
categories: [blog]
tags: [guide, danny]
permalink: /code-generation-and-maven-in-javaparser/
---

If you are not working on the JavaParser project itself, ignore this article. What's below is outdated starting from version 3.2.9\. Currently the build does not include any code generation phases anymore. They can be run manually with two scripts, one to generate the metamodel, and one to run the core generators. Sadly this will mean that we will have to run these by hand for every PR, but it sure is a lot clearer!

*   `run_metamodel_generator.sh` updates the metamodel when you modify (meaning: edit the source code of) one of JavaParser's node classes.
*   `run_core_generators.sh` uses the metamodel to generate a lot of code in javaparser-core.

## Outdated

Since version 3.1.0 I made a start on generating the repetitive parts of the JavaParser code, of which there are many. The way it is done is... _interesting_. I could have set up some kind of template project and generate code from that. We have a large amount of custom code in the nodes though, so that would have to be in the templates. That would put a code-generation step in the middle of developing _anything_ in the nodes. Any change there would need the generators to run before it could be tried or tested. It would be possible to keep the templates in working order, so development could be done on that, but that would mean the templates would have te be updated with the generated code all the time. This didn't sound like an effective, fail-safe way of working. I ended up with a trick: all code generators modifiy the source code _in-place_. Need a new field? Add it to a node, create a basic getter and setter, run the generators and suddenly the getter and setter contain generated code that checks all kinds of things, and the visitors are updated for your new field. Nice! What this did do is confuse the hell out of Maven... In case you are changing the AST structure (adding/removing/replacing nodes and their fields) this is the correct build order:

1.  build javaparser-core
2.  build javaparser-metamodel-generator
3.  build javaparser-core
4.  build javaparser-core-generators
5.  build javaparser-core

This should be done by calling `mvn clean install` separately for every step. But whyyy? Well, reasoning backwards:

*   To make sure all code in `core` is in the right place, we need to run the `core generators` (4) before we can run the final build (5). (Generators are run when their maven project is built, to make sure nobody opens a PR without running them.)
*   The `core generators` uses the meta model to know what has to be generated, and the meta model is in `core`. The `core generators` also parse and rewrite a lot of code using JavaParser itself, so it need `core` for this too. So, we need to build core (3)
*   `core generators` need an _up to date_ meta model, so we need to run the `metamodel generator` (2) before (3).
*   The metamodel generator uses JavaParser (`core`) to generate the metamodel classes in `core` by introspecting the nodes in `core`. Of course we need an up to date build of `core` for that (1)

In practice it looks like this: 

1.  you make a change to a node. 
2.  you build `core`, then `metamodel generator` and check if the output is correct. Optionally revert incorrectly generated code. Repeat (1) and (2) until done. 
3.  you build `core`, then `core generators` and check if the output is correct. Optionally revert incorrectly generated code. Repeat (3) or (1) (2) (3) until done. 
4.  build `core` once more to be sure. If you're developing a new core generator, you'll find yourself doing step (3) and (4) only. If you're developing anything else, you can ignore this whole article :-)