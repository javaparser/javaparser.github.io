---
layout: post
title:  "Making strings in JavaParser"
date:   2018-03-03 09:58:46 +0100
categories: [blog]
tags: [guide, danny]
permalink: /making-strings-in-javaparser/
---

## Printing the AST in JavaParser

There are various options for printing source code in JavaParser, and not all of them well explained.

### Node.toString / PrettyPrinter

Probably the most commonly used printer. It uses the `PrettyPrintVisitor` with its default configuration to create its output. A variant, `Node.toString(PrettyPrinterConfiguration)` will use your configuration instead. A prettier facade for pretty printing is the `PrettyPrinter` class, it shows your intention to print _pretty_ more clearly.

### asString

These methods are available on some nodes. We noticed that many people were using the output of the pretty printer for comparisons, like `name.toString.equals("a.b.C")`. This can easily lead to bugs, since the pretty printer will also output comments and annotations associated with the node, so its output could be easily be `/*hello*/a.b.C`! Oops! `asString` is defined as "the output you probably want when you want to represent this node as a string." It is quite arbitrary, but mostly means "what toString does, but without formatting, comments, or annotations."

### ConcreteSyntaxModel.genericPrettyPrint

A well hidden feature, the concrete syntax model holds a description of what a certain AST node looks like when it is found in source code. A bit like the opposite of a parser, which takes source code and generates AST nodes from it. It has been extended with information on the usual places for whitespace and comments, and is in use by the `LexicalPreservingPrinter` to create new source code when the user adds a new node to the AST. A nice side effect is that it can also be used to pretty print. The output is more or less the same as from the PrettyPrintVisitor.

### getDeclarationAsString

A few nodes support `getDeclarationAsString`, which is meant to give a string representation of declaration. Be careful: this is not well maintained and might even disappear, unless someone finds a good reason to keep it :-)

### LexicalPreservingPrinter

The `LexicalPreservingPrinter` is different from all of the above in that it intends to keep the source code it prints as close as possible to the source code that was parsed. Once it has been set up for an AST, it will respond to every change in the AST by carefully adjusting the tokens of the original source code too. (Actually, it's an inbetween representation, so you won't see the tokens in TokenRange change.)