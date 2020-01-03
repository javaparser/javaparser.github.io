---
layout: post
title:  "Parse error recovery"
date:   2018-03-03 09:58:46 +0100
categories: [blog]
tags: [guide, danny]
permalink: /parse-error-recovery/
---

## Parse error recovery

Since JavaParser 3.2.7, JavaParser is able to recover from parse errors. What does this mean?

### It's not about semantic errors

This is _not_ about semantic errors. The following code will parse correctly, but `ParseResult` will tell you parsing was not successful because the class extends from more than one super class. This is a semantic error. The parser is pretty flexible in what it will accept, so it will accept that there is more than one super class. Afterwards, a validation will inspect the resulting `CompilationUnit`, check the amount of super classes, and add a `Problem` to the `ParseResult` if there is more than one.

    class X extends Y,Z {
        //
    }

How do we, the JavaParser developers, choose if a certain error should be a parse error or semantic error? Well, there is not hard rule, but we prefer to let the grammar construct an AST and nothing else, since semantic validation are much easier to write and maintain.

### Parse errors: `CompilationUnit` level

Here is a parse error:

    class X {

Uh oh, where is the `}`? Oops! Up until version 3.2.6, this would result in no AST at all. The parser would throw an exception, we would add a problem for that exception, but we had no AST in our hands. We have started to implement [JavaCC's Deep Error Recovery](https://www.cs.purdue.edu/homes/hosking/javacc/doc/errorrecovery.html). Currently we use it in two places, the first being `CompilationUnit`. Now we handle exceptions _inside_ the parser. `CompilationUnit` is the highest level of `Node`, so we should be handling all parse errors now. That means you will never get an empty AST! When we get a parse error, we handle it as follows:

*   add the error as a `Problem`
*   skip source code until we find a place where we _hope_ the current node ends.
*   create a node with `parsed` set to `UNPARSABLE`. When this is encountered, its other properties (except `range` and `tokenRange`) should be considered invalid.
*   continue parsing as if nothing happened.

So to recover from a parse error on the `CompilationUnit` level, we can't do much else but skip to `<EOF>`. That means that without more work, every parse error will result in an AST consisting of one node: a `CompilationUnit` with no fields set except `range` and `tokenRange`. This situation is already a step forward: we still have all the tokens, so a user can still see what the source file looked like.

### Parse errors: `Statement` level

In 3.2.7, one more level of recovery was added: the `Statement` level.

    class X{
        int x(){
            X X X;
        }
    }

Okay, `X X X` makes no sense to Java. To recover, we skip to `;` this time, because every statement ends with a `;`. To stay consistent with `CompilationUnit` we should add a `Statement` node now, but here we have a problem: `Statement` is abstract and should stay that way. Now we could add a specific concrete statement like `WhileStmt`, but that makes no sense, so here we created a new AST node: `UnparsableStmt`. When asked if it is parsed, it will always return `UNPARSABLE`. Here we can see the advantage of handling parse errors: you will get a more or less complete AST:

    - CompilationUnit
        - ClassOrInterfaceDeclaration X
            - MethodDeclaration x
                - BlockStmt
                    - UnparsableStmt "X X X;"

### Conclusion

Although the implementation in 3.2.7 is very, very basic, it defines the pattern to follow when implementing other parse error recovery points. If you're interested in more thoughts, check the [PR](https://github.com/javaparser/javaparser/pull/952)