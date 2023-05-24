---
icon: page
author: xkrivzooh
date: 2023-05-24
sidebar: false
category:
  - post
tag:
  - 杂记
---


# SIMD简介

## SIMD产生的背景是什么

其实这篇文章说的很直观：[【趣话计算机底层技术】一个故事看懂CPU的SIMD技术 - 轩辕之风 - 博客园 (cnblogs.com)](https://www.cnblogs.com/xuanyuan/p/16048303.html)：

其实是为了提升处理这类数据运算的能力，需要通过并行计算的方式来提效，于是在CPU层面增加对应的指令集。因为在图像、视频、音频处理等领域，有大量这样的计算需求。

## 什么是SIMD

SIMD的全称是：Single Instruction Multiple Data

我们把这种在一条指令中同时处理多个数据的技术叫做单指令多数据流（Single Instruction Multiple Data），简称SIMD。

SIMD（Single Instruction Multiple Data）指令集，指单指令多数据流技术，可用一组指令对多组数据通进行并行操作。SIMD指令可以在一个控制器上控制同时多个平行的处理微元，一次指令运算执行多个数据流，这样在很多时候可以提高程序的运算速度。SIMD指令在本质上非常类似一个向量处理器，可对控制器上的一组数据（又称“数据向量”） 同时分别执行相同的操作从而实现空间上的并行。SIMD是CPU实现DLP（Data Level Parallelism）的关键，DLP就是按照SIMD模式完成计算的。SSE和较早的MMX和 AMD的3DNow!都是SIMD指令集。它可以通过单指令多数据技术和单时钟周期并行处理多个浮点来有效地提高浮点运算速度。

​![simd示例](https://wenchao.ren/img/2023/05/1684916416-db415d7d0c497a759685d8bdf1f7d385-202305241620048.png​)​

如上图所示：

* 一个普通加法指令，一次只能对两个数执行一个加法操作。
* 一个 SIMD 加法指令，一次可以对两个数组（向量）执行加法操作。

# SIMD 简史

经过多年的发展，支持 SIMD 的指令集有很多。各种 CPU 架构都提供各自的 SIMD 指令集，本文的介绍以 x86 架构为主。

1997 年，Intel 推出了第一个 SIMD 指令集 —— MultiMedia eXtensions（MMX）。MMX 指令主要使用的寄存器为 MM0 ~ MM7，大小为 64 位。

1999 年，Intel 在 Pentium III 对 SIMD 做了扩展，名为 Streaming SIMD eXtensions（SSE）。SSE 采用了独立的寄存器组 XMM0 ~ XMM7，64位模式下为 XMM0 ~ XMM15 ，并且这些寄存器的长度也增加到了 128 位。

2000 年，Intel 从 Pentium 4  开始引入 SSE2。

2004年，Intel 在 Pentium 4 Prescott 将 SIMD 指令集扩展到了 SSE3。

2006 年，Intel 发布 SSE4 指令集，并在 2007 年推出的 CPU 上实现。

2008 年，Intel 和 AMD 提出了 Advanced Vector eXtentions（AVX）。并于 2011 年分别在 Sandy Bridge 以及 Bulldozer 架构上提供支持。AVX 对 XMM 寄存器做了扩展，从原来的128 位扩展到了256 位。

2013年，Intel 在发布的 Haswell 处理器上开始支持AVX2。同年，Intel 提出了 AVX-512。

2016 年，Xeon Phi x200 (Knights Landing) 是第一款支持了 AVX-512 的 CPU。如扩展名所示，AVX-512 主要改进是把 SIMD 寄存器扩展到了 512 位。

更加详细的发展历史可以翻看：[Single instruction, multiple data - Wikipedia](https://en.wikipedia.org/wiki/Single_instruction,_multiple_data)

## 判断当前设备CPU的支持能力

在命令行通过以下命令:`​ cat /proc/cpuinfo`​  在输出中查看flags一项，看是否包含avx、avx2等。

## Java中的SIMD

jdk对SIMD支持代码，主要位于`jdk.incubator.vector`​这个package下面。相关API如下：[Uses of Package jdk.incubator.vector (Java SE 17 &amp; JDK 17) (oracle.com)](https://docs.oracle.com/en/java/javase/17/docs/api/jdk.incubator.vector/jdk/incubator/vector/package-use.html)

‍

## 参考资料

* [【趣话计算机底层技术】一个故事看懂CPU的SIMD技术 - 轩辕之风 - 博客园 (cnblogs.com)](https://www.cnblogs.com/xuanyuan/p/16048303.html)
* [(26条消息) 一文读懂SIMD指令集 目前最全SSE/AVX介绍_simd sse_Axurq的博客-CSDN博客](https://blog.csdn.net/qq_32916805/article/details/117637192)
* [是什么让.NET7的Min和Max方法性能暴增了45倍？ - InCerry - 博客园 (cnblogs.com)](https://www.cnblogs.com/InCerry/p/how_to_use_simd_improve_dotnet7_min_max_performance.html)
* [JEP 338: Vector API (Incubator) --- JEP 338：矢量 API（孵化器） (openjdk.org)](https://openjdk.org/jeps/338)
