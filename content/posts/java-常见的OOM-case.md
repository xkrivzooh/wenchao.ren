---
title: java 常见的OOM case
toc: true
date: 2019-08-06 18:32:50
tags: ['java']
draft: false
---

`OOM`是`java.lang.OutOfMemoryError`异常的简称，在日常工作中oom还算是比较常见的一种问题吧。出现OOM意味着jvm已经无法满足新对象对内存的申请了，本文整理了一下oom的常见case和一般情况下的解决方法。

处理OOM问题，绝大多数情况下`jmap`和`MAT`工具可以解决99%的问题。

## Java heap space 

表现现象为：

```java
java.lang.OutOfMemoryError: Java heap space
```

### 可能的原因

- 内存泄漏
- 堆大小设置不合理
- JVM处理引用不及时，导致内存无法释放
- 代码中可能存在大对象分配

### 解决办法

- 一般情况下，都是先通过jmap命令，把堆内存dump下来，使用mat工具分析一下，检查是否因为代码问题，存在内存泄露
- 也可能是下游服务出问题，导致内存中的数据不能很快的处理掉，进而引起oom
- 调整-Xmx参数，加大堆内存 
- 还有一点容易被忽略，检查是否有大量的自定义的 Finalizable 对象，也有可能是框架内部提供的，考虑其存在的必要性


## PermGen space

永久代是HotSot虚拟机对方法区的具体实现，存放了被虚拟机加载的类信息、常量、静态变量、JIT编译后的代码等。

一般情况下的异常表现为：

```java
java.lang. OutOfMemoryError : PermGen space
```

### 可能的原因

- 在Java7之前，频繁的错误使用String.intern()方法 
- 运行期间生成了大量的代理类，导致方法区被撑爆，无法卸载

### 解决办法

- 检查是否永久代空间是否设置的过小 
- 检查代码中是否存错误的创建过多的代理类


## Metaspace

JDK8后，元空间替换了永久带，元空间使用的是本地内存，还有其它细节变化：

- 字符串常量由永久代转移到堆中
- 和永久代相关的JVM参数已移除

一般情况下的异常表现为：
```java
java.lang.OutOfMemoryError: Metaspace
```

### 可能的原因

类似`PermGen space`

### 解决办法

- 通过命令行设置 `-XX: MaxMetaSpaceSize` 增加 metaspace 大小，或者取消`-XX: maxmetsspacedize`
- 其他类似`PermGen space`

## unable to create new native Thread

这种情况的一般表现为：
```java
java.lang.OutOfMemoryError: unable to create new native Thread
```

### 可能的原因

出现这种异常，基本上都是创建的了大量的线程导致的

### 解决办法

程序运行期间，间隔多次打印jstack，然后查看线程数的变化情况，找出增长快速的线程。

## GC overhead limit exceeded

这种情况其实一般情况下遇到的不是太多，他的一般表现为：

```java 
java.lang.OutOfMemoryError：GC overhead limit exceeded
```

### 可能的原因

这个是JDK6新加的错误类型，一般都是堆太小导致的。Sun 官方对此的定义：**超过98%的时间用来做GC并且回收了不到2%的堆内存时会抛出此异常。**

### 解决办法

- 检查项目中是否有大量的死循环或有使用大内存的代码，优化代码。
- 添加参数`-XX:-UseGCOverheadLimit`禁用这个检查，其实这个参数解决不了内存问题，只是把错误的信息延后，最终出现 `java.lang.OutOfMemoryError: Java heap space`
- dump内存，检查是否存在内存泄露，如果没有，加大内存。

## java.lang.OutOfMemoryError: Out of swap space

```java
java.lang.OutOfMemoryError: request size bytes for reason. Out of swap space
```

Oracle的官方解释是，本地内存（native heap）不够用导致的。
错误日志的具体路径可以通过JVM启动参数配置。如：`-XX:ErrorFile=/var/log/java/java_error.log`

### 解决方法

- 其它服务进程可以选择性的拆分出去 
- 加大swap分区大小，或者加大机器内存大小

## stack_trace_with_native_method

```java
java.lang.OutOfMemoryError: reason stack_trace_with_native_method
```

一般出现该错误时，线程正在执行一个本地方法。也就是说执行本地方法时内存不足。一般需要结合其他系统级工具进行排查

## Compressed class space

```java
java.lang.OutOfMemoryError: Compressed class space
```

可通过JVM启动参数配置增大相应的内存区域。如：`-XX:CompressedClassSpaceSize=2g`

## Requested array size exceeds VM limit

```java
java.lang.OutOfMemoryError: Requested array size exceeds VM limit
```

程序试图创建一个数组时，该数组的大小超过了剩余可用（连续空间）的堆大小。
出现这种情况可能是堆设置得太小了。也有可能是程序在选择数组容量大小的逻辑有问题.




