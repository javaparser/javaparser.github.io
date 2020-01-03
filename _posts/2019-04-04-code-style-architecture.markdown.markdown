---
layout: post
title:  "Code Style/Architecture"
date:   2019-04-04 09:58:46 +0100
categories: [blog]
tags: [guide, danny]
permalink: /code-style-architecture/
---

## Optional<>, null

*   Nothing in JavaParser returns null. Instead an Optional is returned.
*   Nothing in JavaParser accepts an Optional. Instead a null is passed. (When retrieving this value, you will get Optional.empty)
*   Don't silently accept null where it is not allowed. Throw an exception.

Why? Because we used to get a lot of issues about NullPointerExceptions. Some of these were actual JavaParser bugs. Most of them were caused by people passing null where it wasn't allowed.

## Automatic parent node management

(talk about attaching/detaching/cloning)

## Parse errors, semantic validation

In JavaParser, the parser is asked to do as little as possible: just give us an AST for the code you see. For valid code, it should be a valid AST. For invalid code, it should be a invalid AST. After parsing there is a semantic validation phase where the invalid locations in the AST are found, and errors are created.

Why?

*   Because if the parser is strict, it will fail quickly, and it will only produce one error message and no AST. By being flexible during parsing, there are more situations in which we will get an AST.
*   Because we have one grammar for all Java versions. What's valid in Java 5 might not be valid in Java 1\. These checks are done in the validation phase - the parser always parses the superset of all Java versions.

## Use of exceptions

JavaParser limits itself to a few exceptions, most of them runtime. It is prefered to prevent the user from getting into a bad situation at compile time, but sadly there are a lot of hard to avoid holes.

*   To prevent bugs from API abuse there are IllegalArgumentException and IllegalStateException.
*   To signal invalid source code from StaticJavaParser, there is ParseProblemException.
*   To inform the user of unfinished parts of the symbol solver, there is NotImplementedException.
*   Where IOException is generated, it is passed on to the user.

## Deprecating code

The JavaParser project is quick to deprecate methods. When deprecating, there must always be an explanation in the Javadoc telling what the new way of doing things is. Every year or so all deprecated code is removed.

## What goes in the AST?

Everything that is meaningful in Java. A stray ";" is not meaningful. An empty statement in "while(true);" is.

Are comments meaningful in Java? No. (Javadoc is debatable) The comments are still in the AST, but they are second rate citizens: they get patched into their approximately correct positions in the AST after parsing.

Besides this, the AST is treated as an Abstract Syntax Christmas Tree, meaning it's full of nice utility methods, as long as they are somewhat general.

## Why JavaCC?

JavaParser is a "rescued project." The original author abandoned it, and new people picked it up and enhanced it. That means the reason is lost to time. There is a mild desire to move to ANTLR, but it would mean a lot of work. The discussion is over here:  
[https://github.com/javaparser/javaparser/issues/1813](https://github.com/javaparser/javaparser/issues/1813).

## Component diagram

![Component Diagram](/img/figures/component_diagram-1-1024x340.png)

## (little story about each of the components)

(Various things from  
[https://github.com/javaparser/javaparser/blob/master/javaparser-core/src/main/java/com/github/javaparser/ast/Node.java](https://github.com/javaparser/javaparser/blob/master/javaparser-core/src/main/java/com/github/javaparser/ast/Node.java) )

## Terminology

*   The **root of the AST** is the node that contains the rest of the AST, but is not itself contained in an AST. It has no parent. In JavaParser this will often be CompilationUnit, but it's also normal to have some arbitrary node as the root.
*   The **parent** of node x is the node directly above x, towards the root of the AST. For a PackageDeclaration, the parent will usually be a CompilationUnit.
*   The **ancestors** of node x are all the nodes above it, towards the root of the AST. The ancestors are x's parent, x's parent's parent, x's parent's parent's parent, and so on until there is no parent anymore.
*   The **children** of node x are the nodes directly below x.
*   The **descendants** of node x are all the nodes below x. For example: a CompilationUnit will have every node except itself as its descendants. An IfStatement has its conditions and its "then" and "else" blocks as its children. Those children, and all of their descendants, are descendants of the IfStatement.
*   **walk**: to go through a tree of nodes using some algorithm.