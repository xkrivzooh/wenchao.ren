---
icon: page
author: xkrivzooh
date: 2019-02-15
category:
  - post
tag:
  - java
---

# java中创建Completed future

在Java中如何创建Completed future呢？

Java8中可以`Future future = CompletableFuture.completedFuture(value);`
Guava中可以`Futures.immediateFuture(value)`
Apache commons Lang中可以`Future<T> future = ConcurrentUtils.constantFuture(T myValue);`

<!-- @include: ../scaffolds/post_footer.md -->
