---
icon: page
author: xkrivzooh
date: 2019-09-03
sidebar: false
category:
  - post
tag:
  - java
---

# gc Roots对象有哪些

JVM的垃圾自动回收是我们经常说的一个话题，这里的**垃圾**的含义是：

> 内存中已经不再被使用到的对象就是垃圾

## 要进行垃圾回收，如何判断一个对象是否可以被回收？

一般有两种办法：

- 引用计数法        
    - 实现简单，但是没法解决对象之间的循环引用问题
- 枚举根节点做可达性分析       
    -  通过一系列名为“GC Roots”的对象作为起始点，从“GC Roots”对象开始向下搜索，如果一个对象到“GC Roots”没有任何引用链相连，说明此对象可以被回收

常见的常见的GC Root有如下：

- 通过System Class Loader或者Boot Class Loader加载的class对象，通过自定义类加载器加载的class不一定是GC Root
- 处于激活状态的线程
- 栈中的对象
- 本地方法栈中 JNI (Native方法)的对象
- JNI中的全局对象
- 正在被用于同步的各种锁对象
- JVM自身持有的对象，比如系统类加载器等。

<!-- @include: ../scaffolds/post_footer.md -->
