---
layout: post
title:  "Less Casting in JavaParser"
date:   2018-03-03 09:58:46 +0100
categories: [blog]
tags: [guide, danny]
permalink: /less-casting-in-javaparser/
---
A common pattern in code using JavaParser looks as follows:

```java
// We get a field that has a pretty wide type: Expression
Expression condExpr = ifStmt.getCondition();
// We want to know if it happens to be a BinaryExpr, so instanceof
if (condExpr instanceof BinaryExpr) {
    // Yeah, we already know it is a BinaryExpr, 
    // but Java wants you to cast it anyway... 
    BinaryExpr cond = (BinaryExpr) condExpr;
    // Now we can use cond...
}
```

Federico Tomassetti, who maintains Java Symbol Solver, suggested we move some helpful methods from that project to JavaParser so that we can do this:

```java
Expression condExpr = ifStmt.getCondition();
// Use a special method to avoid instanceof
if (condExpr.isBinaryExpr()) {
    // Use a special method to avoid the cast
    BinaryExpr cond = condExpr.asBinaryExpr();
    // Now we can use cond...
}
```

Not only is this much more pleasing to the eye, your IDE will suggest these methods for you, so you can pick the correct sub-node without having to go through the class hierarchy.

I thought we could use Java 8 to improve it even more:

```java
ifStmt.getCondition().ifBinaryExpr(cond ->
    // Now we can use cond...
);
```

cond has the correct type and is ready to be used right away :-)

These methods are available at most nodes. I did not implement them on Node or other very wide types because the amount of methods would explode, and that would not be helpful to anyone. (statement.isExpression()?!)

Have fun cleaning up your code!

## Addendum :-)

From 3.5.6 on, there are "to" methods that return an Optional, so now you can do this kind of trickery:

```java
// If the condition is a binary expression, get the operator. Otherwise it's empty.
Optional operator = ifStmt.getCondition().toBinaryExpr().map(BinaryExpr::getOperator);

// Same thing, but we throw a disappointed exception when there is no binary expr in the condition:
BinaryExpr.Operator operator = ifStmt
        .getCondition()
        .toBinaryExpr()
        .map(BinaryExpr::getOperator)
        .orElseThrow(() -> new RuntimeException("Oh, I was expecting a BinaryExpr here..."));
```

This will help you get rid of .get()'s everywhere.