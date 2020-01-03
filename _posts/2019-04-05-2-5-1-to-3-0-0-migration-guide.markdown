---
layout: post
title:  "2.5.1 to 3.0.0 migration guide"
date:   2019-04-05 09:58:46 +0100
categories: [blog]
tags: [guide, danny]
permalink: /2-5-1-to-3-0-0-migration-guide/
---

## Instantiating nodes

Many methods have been added that help with building AST nodes.
To help reuse, most of them are methods on interface called "NodeWith..."
The suggested way to instantiate a node is ...

- with a builder method on the parent (like `CompilationUnit#addClass(String name)`)
- if that doesn't exist, with a specific constructor for your case (like `ThrowStmt(Expression expression)`)
- if that doesn't exist, the default constructor.... and use the setters to finish setting up your new node.
Note that the setters return "this", so you can chain them.
- alternatively, you can use the `JavaParser.parse` methods to quickly construct a partial Node from a snippet of code.

## The new API 

The API has been thoroughly cleaned up.

### The quick API

The most straightforward API is to use the static methods on JavaParser. We have attempted to simplify exception handling, so that any problems are reported with an unchecked ParseProblemException. All of the static methods are shortcuts to the full API, which you get when you instantiate JavaParser.

### The full API

When you want to have full flexibility and a little speed up, use the full API, which means calling "parse" on an _instance_ of `JavaParser`. This API does not throw exceptions, it will collect all encountered problems in a list. For 3.0.0, this list will often contain only a single problem, but in the future the parser will be able to recover from a parse problem to report multiple parse problem.

```java
ParserConfiguration configuration = new ParserConfiguration();
JavaParser parser = new JavaParser(configuration);
// ParseStart gives flexibility for what you want to parse
// Providers gives you many ways to provide source code.
ParseResult<Expression> parseResult = parser.parse(ParseStart.EXPRESSION, Providers.provider("1+1"));
if (!parseResult.isSuccessful()) {
    System.out.println(parseResult.getProblems().toString());
}
// a failed parse does not always mean there is no result.
if (parseResult.getResult().isPresent()) {
    Expression expression = parseResult.getResult().get();
    System.out.println(expression);
}
if (parseResult.getCommentsCollection().isPresent()) {
    // ...
}
if (parseResult.getTokens().isPresent()) {
    // ...
}
```

Repeatedly parsing with a single instance should perform better.

### ASTHelper

The ASTHelper class has been removed. Its methods are now among the many "builder" methods that can be found in the nodes themselves. Example: if you are looking for `ASTHelper.addStmt(BlockStmt block, Expression expr)`, you should look in `BlockStmt#addStatement(Expression expr)`.

### InstanceParser

This class has been removed. Simply create an instance of JavaParser for the same effect: `new JavaParser()`

## Array support changes

Probably the biggest change is in how we support arrays. Where previously arrays were indicated by an inconspicuous integer telling you how many brackets there were, they are now in your face: every type that can have array dimensions may now be nested in `ArrayType`.

You will notice that for a declaration like `int a;`, there is no more getType(). This has moved to the VariableDeclarator for `a`. Why? Because in `int a[], b;` the types of a and b are different: a = ArrayType(int) and b = int. Therefore we cannot talk about the type of the whole declaration anymore. This will unfortunately make dealing with types a bit more complex, but we gain correctness (no more forgetting about that integer that indicates that there is a bracket pair in `int a()[] {}` ) and a more consistent API.

## ReferenceType

Where 2.5.1 created a reference type by instantiating "ReferenceType", then setting the type to refer to, this has now been simplified by simply making all reference types (ClassOrInterfaceType etc.) inherit from ReferenceType. No need for this indirection anymore.

## (User) Data

The Node#data field has become more structured. We copied it from Wicket, including their Javadoc, so it should be clear :-)

## TypeArguments

TypeArguments was a bit of an odd type, a list that stored an extra field. It has been mostly merged into the nodes that have type arguments, using the interface `NodeWithTypeArguments`, so the data you're looking for is not far away.

## Nulls

We now deal very strictly with nulls:

*   Any method that used to return nulls now returns an Optional.
*   Any method that does not return Optional never returns null.
*   Any parameter that takes nulls still does.
*   Any parameter that does not take nulls will throw an AssertionError when you pass it a null.

## NodeList

To avoid some issues with setting the parents of nodes, we have introduced NodeList. It behaves like a Java List, but takes care of setting the parent of nodes that you add.

## DumpVisitor

DumpVisitor has been upgraded to "PrettyPrinterVisitor." It has its own package and some support classes now. PrettyPrinter is the suggested class to use to access it.

## Names in the AST

Everything that has a name now uses SimpleName or Name. This makes names first class citizens in the AST. To reduce noise, you can find many shortcuts that use Strings. Methods called "...asString()" have been added that intend to return the node as a clean string, without comments or whitespace. (Remember that toString() uses the pretty printer and should not be used in comparisons etc.)

## Node naming

Many nodes and fields have been renamed for consistency.

## Observables

All nodes can be observed now, which makes it easier to build tools that need to track changes that are made to the AST.

## Empty....

We are slowly phasing out "Empty..." nodes, since these are just placeholders for meaningless constructs, mostly stray semi-colons.

## VariableDeclaratorId

VariableDeclaratorId became a wrapper for a SimpleName when we moved array information around, so from now on we're using `SimpleName name` instead of `VariableDeclaratorId id`