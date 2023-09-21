---
icon: page
author: xkrivzooh
date: 2022-08-13
category:
  - post
tag:
  - java
---

# JDK12新特性

JDK12 在 2019 年 3 月 19 号正式发布，不同于JDK11，JDK12并不是一个LTS版本。作为一个中间版本，JDK12版本特性增加较少。

![JDK12新特性](http://wenchao.ren/img/2022/08/1660402166-7bd0cb5822273870c7c220fb8fcb1dbe-20220813224924.png)

## JPE 344: G1的可中断 mixed GC

此功能通过将Mixed GC集拆分为强制部分和可选部分，使G1垃圾收集器更有效地中止垃圾收集过程。通过允许垃圾收集过程优先处理强制集，g1可以更多满足满足暂停时间目标。

G1是一个垃圾收集器，设计用于具有大量内存的多处理器机器。由于它提高了性能效率，g1垃圾收集器最终将取代cms垃圾收集器。

G1垃圾收集器的主要目标之一是满足用户设置的暂停时间。G1采用一个分析引擎来选择在收集期间要处理的工作量。此选择过程的结果是一组称为GC集的区域。一旦GC集建立并且GC已经开始，那么G1就无法停止。

如果G1发现GC集选择选择了错误的区域，它会将GC区域的拆分为两部分（强制部分和可选部分）来切换到处理Mix GC的增量模式。如果未达到暂停时间目标，则停止对可选部分的垃圾收集。

## JEP 346: G1归还不使用的内存

此功能的主要目标是改进G1垃圾收集器，以便在不活动时将Java堆内存归还给操作系统。 为实现此目标，G1将在低应用程序活动期间定期生成或持续循环检查完整的Java堆使用情况。 

这将立即归还未使用的部分Java堆内存给操作系统。 用户可以选择执行FULL GC以最大化返回的内存量。

## 新功能的预览和实验

### JEP 189: Shenandoah：低暂停时间垃圾收集器（实验）

> JDK 12 引入的回收算法（实验阶段），该算法通过与正在运行的 Java 线程同时进行疏散工作来减少 GC 暂停时间。Shenandoah 的暂停时间与堆大小无关，无论堆栈是 200 MB 还是 200 GB，都具有相同的一致暂停时间。 

*Shenandoah适用于高吞吐和大内存场景，不适合高实时性场景*。Shenandoah算法设计目标主要是响应性和一致可控的短暂停顿，对于垃圾回收生命周期中安全点停顿（TTSP)和内存增长监控的时间开销并无帮助。 

Shenandoah算法为每个Java对象添加了一个间接指针，使得GC线程能够在Java线程运行时压缩堆。标记和压缩是同时执行的，因此我们只需要暂停Java线程在一致可控的时间内扫描线程堆栈以查找和更新对象图的根。 

怎么形容Shenandoah和ZGC的关系呢？异同点大概如下：

- 相同点：性能几乎可认为是相同的 
- 不同点：ZGC是Oracle JDK的。而Shenandoah只存在于OpenJDK中，因此使用时需注意你的JDK版本 

打开方式：使用`-XX:+UseShenandoahGC`命令行参数打开。

### JEP 325: Switch 表达式 (预览版本)

在 Java 12 中引入了 Switch 表达式作为预览特性。在 Java 12 之前，传统 Switch 语句写法为：
```java
private static String getText(int number) {
    String result = "";
    switch (number) {
        case 1, 2:
            result = "one or two";
            break;
        case 3:
            result = "three";
            break;
        case 4, 5, 6:
            result = "four or five or six";
            break;
        default:
            result = "unknown";
            break;
    };
    return result;
}
```
在 Java 12 之后，关于 Switch 表达式的写法改进为如下：
```java
private static String getText(int number) {
    String result = switch (number) {
        case 1, 2 -> "one or two";
        case 3 -> "three";
        case 4, 5, 6 -> "four or five or six";
        default -> "unknown";
    };
    return result;
}
```
但是不得不说，相对于Scala来说弱爆了。

## JEP334: JVM常量API

每个Java类文件都有一个常量池，该池存储该类中字节码指令的操作。广义上讲，常量池中的条目要么描述运行时artifacts（例如类和方法），要么描述简单值（例如字符串和整数）。

所有这些条目都称为可加载常量，因为它们可以用作ldc指令的参数（“加载常量”）。它们也可能出现在invokedynamic指令的引导方法的静态参数列表中。执行ldc或invokedynamic指令会导致将可加载常量解析为标准Java类型（如Class，String或int）的“实时”值。 

处理类文件的程序需要对字节码指令进行建模，然后对可加载常量进行建模。但是，使用标准Java类型对可加载常量进行建模是不够的。

描述一个字符串（一个CONSTANT_String_info条目）的可加载常量可能是可以接受的，因为生成一个“live” String对象是很简单的，但是对于描述一个类（一个CONSTANT_Class_info条目）的一个可加载常量来说，这是有问题的，因为生成一个“live”类对象依赖于类加载的正确性和一致性。

在实际应用中，类加载具有许多环境依赖性和失败的情况，例如：所需的类不存在或请求者可能无法访问；类加载的结果随上下文而变化；加载类具有副作用；有时根本不可能加载类。

因此，处理可加载常量的程序如果能够操纵类和方法，并且以纯名义上的符号形式操纵诸如方法句柄和动态计算的常量之类的artifacts，则它们将变得更加简单。

JDK12在新包`java.lang.invoke.constant`中定义了一系列基于值的符号引用（JVMS 5.1）类型，它们能够描述每种可加载常量。符号引用以纯字面的形式描述了可加载常量，与类加载或可访问性上下文分开。某些类可以充当自己的符号引用（例如String）；对于可链接常量，JDK12定义了一系列符号引用类型（`ClassDesc`，`MethodTypeDesc`，`MethodHandleDesc`和`DynamicConstantDesc`），来包含描述这些常量的信息。 

## JEP341: 默认CDS归档

通过在64位平台上的默认类列表的帮助下生成CDS归档来改进JDK构建过程，从而有效地消除了运行java `-Xshare：dump`。 
此功能的目标包括： 
- 改进开箱即用的启动时间 
- 摆脱使用-Xshare：dump

## JEP230: Microbenchmark测试套件

此功能为JDK源代码添加了一套Microbenchmark测试（大约100个），简化了现有Microbenchmark测试的运行和新基准测试的创建过程。 它基于`Java Microbenchmark Harness（JMH）`并支持JMH更新。 

此功能使开发人员可以轻松运行当前的Microbenchmark测试并为JDK源代码添加新的Microbenchmark测试。 可以基于Java Microbenchmark Harness（JMH）轻松测试JDK性能。 它将支持JMH更新，并在套件中包含一组（约100个）基准测试。

## JEP340: 移除多余ARM64实现 

Java 12将只有一个ARM 64位实现（aarch64）。 目标是删除所有与arm64实现相关的代码，同时保留32位ARM端口和64位aarch64实现。 这将把重点转移到单个64位ARM实现，并消除维护两个实现所需的重复工作。 当前的JDK 11实现中有两个64位ARM实现。

<!-- @include: ../scaffolds/post_footer.md -->
