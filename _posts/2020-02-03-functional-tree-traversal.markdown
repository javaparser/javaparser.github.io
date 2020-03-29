---
layout: post
title:  "Functional Tree Traversal"
date:   2020-02-03 17:58:46 +0100
categories: [blog]
tags: [guide, danny]
permalink: /functional-tree-traversal/
---

## Traversing the AST

When you read the book, you will learn about traversing the AST by using visitors.
Since 2017, there is an alternative that was suggested/inspired by Federico Tomassetti.
Instead of using the visitor pattern, 
this one walks through the AST in a pattern of your choosing,
and passes every node it finds to you for processing.

# The base: iterators

Various iterators have been defined in `Node`.
Here we use a breadth-first iterator:
```java
public class Test {
    public static void main(String[] args) {
        CompilationUnit cu = StaticJavaParser.parse("class X{void y(){int z;}}");
        Node.BreadthFirstIterator iterator = new Node.BreadthFirstIterator(cu);
        while (iterator.hasNext()) {
            System.out.println("* " + iterator.next());
        }
    }
}
```
What's nice here is that you are in control.
You explicitly ask for the next node,
and you can stop asking at any moment.

What's not so nice is that it's a smelly old iterator :-(
But it serves as a very generic base for the rest.

# The functional family

```java
public class Test {
    public static void main(String[] args) {
        CompilationUnit cu = StaticJavaParser.parse("class X{void y(){int z;}}");

        // "Walk" is a very general method that takes the pattern to walk, and the action to do for each walked node:
        cu.walk(Node.TreeTraversal.PREORDER, node -> System.out.println("* " + node));

        // And this is the familiar Java 8 stream API: 
        cu.stream(Node.TreeTraversal.PREORDER).forEach(node -> System.out.println("* " + node));

        // Now let's assume pre-order traversal. Much nicer:
        cu.walk(node -> System.out.println("* " + node));
        cu.stream().forEach(node -> System.out.println("* " + node));

        // Based on "walk" we have several useful variants that take care of filtering on instance,
        // which is a bit painful using streams.
        // We can find all nodes of a specific type:
        cu.findAll(VariableDeclarationExpr.class).forEach(node -> System.out.println("* " + node));
        // We can find the first node of a specific type:
        cu.findFirst(VariableDeclarationExpr.class).ifPresent(node -> System.out.println("* " + node));
        // ... and several other variations. Use your IDE to find them, or check the Javadoc.

        // Care has been taken to prevent trouble with modifying the AST while traversing it:
        cu.findAll(MethodDeclaration.class).forEach(Node::remove);
        // Tada! The method has been removed and everything worked just fine:
        System.out.println(cu);
    }
}
```
### The walking patterns

A nice list of patterns can be found in the `Node.TreeTraversal` enum.

*Pre-order* is very useful for walking the nodes in the AST in the order they were encountered in the source code.

*Post-order* is very useful for walking the nodes from the most distant children, slowly towards the start node.

Take a look at [this YouTube video](https://youtu.be/WLvU5EQVZqY) which does a great job of explaining these two.

*Breadth-first* traversal will visit the start node, then all its direct children, then these children's direct children, and so on.
It's honestly not very useful.

The *parents* pattern is pretty odd since it goes in an unexpected direction: it starts at the parent node of the start node,
then goes up towards the root node by walking through all the parents.
This is useful for finding a specific parent node, especially when you don't know how far "above" the start node it can be found.
So useful indeed, that it has its own set of methods called `findAncestor` .

*Direct-children* is a simple pattern: it takes all children of the start node and goes through them, but *not* through their children.
It is probably not very useful, but it is there when you need it. 

### Warnings!

- the start node is included in most patterns.
That means that if you are looking for a specific *child* node, you may want to exclude the start node with a well-placed `filter` call,
or predicate. 
- all of this code is based on `Node.getChildNodes()`, and since the list of child nodes gets mixed up when you mutate the AST,
it is a bad idea to expect the children of a node to get visited in a specific order if you, well, especially if you add nodes. 