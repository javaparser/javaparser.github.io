---
layout: post
title:  "Analysing an entire project in one go"
date:   2018-04-05 09:58:46 +0100
categories: [blog]
tags: [guide, danny]
permalink: /setting-up-for-analysing-a-whole-project/
---

JavaParser works great to analyse java code and provides a way to process a source directory in one go. But it was lacking a way to analyse a project, which might consists of multiple source directories. Previously the answer was to manually create all SourceRoots, which you could then analyse. Let's review the following example for the JavaParser repository. In order to parse all files within the repository, you had to manually define the roots of each module and then create a SourceRoot with each source root, which you could then process further.

```java
    Path projectRoot = path-to-project-root;
    String[] roots = new String[]{
            "javaparser-core/src/main/java",
            "javaparser-core-testing/src/test/java",
            "javaparser-core-generators/src/main/java",
            "javaparser-core-metamodel-generator/src/main/java",
            "javaparser-symbol-solver-core/src/main/java",
            "javaparser-symbol-solver-logic/src/main/java",
            "javaparser-symbol-solver-model/src/main/java",
            "javaparser-symbol-solver-testing/src/test/java"
    };
    for (String root : roots) {
        SourceRoot sourceRoot = new SourceRoot(projectRoot.resolve(root));
        List<ParseResult> parseResults = sourceRoot.tryToParse();
    }
```

We needed a way to achieve this automatically, saving everyone the trouble of reinventing the wheel. For this we introduce `ProjectRoot`and `CollectionStrategy`. If you only require to parse java files, it is sufficient enough to only collect the SourceRoots within the project. However, if you also want to resolve symbols within the java files, you need to collect jar files as well. With either `ParserCollectionStrategy` or `SymbolSolverCollectionStrategy` you can specify whether you want to parse or resolve respectively. The following examples show how to initialise the ProjectRoot:

```java
    // only parsing
    private final ProjectRoot projectRoot = 
        new ParserCollectionStrategy()
        .collect(root);
    // parsing and resolving
    private final ProjectRoot projectRoot = 
        new SymbolSolverCollectionStrategy()
        .collect(root);
```

