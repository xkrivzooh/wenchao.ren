---
title: '从Netty的ResourceLeakDetector#Lavel的设计的一些感想'
toc: true
date: 2020-06-03 00:37:35
tags: [java, netty, 系统设计]
draft: false
---

Netty中的`ResourceLeakDetector#Level`有4个级别：

- DISABLED 这种模式下不进行泄露监控。
- SIMPLE 这种模式下以1/128的概率抽取ByteBuf进行泄露监控。
- ADVANCED 在SIMPLE的基础上，每一次对ByteBuf的调用都会尝试记录调用轨迹，消耗较大
- PARANOID 在ADVANCED的基础上，对每一个ByteBuf都进行泄露监控，消耗最大。

一般而言，在项目的初期使用SIMPLE模式进行监控，如果没有问题一段时间后就可以关闭。否则升级到ADVANCED或者PARANOID模式尝试确认泄露位置。

结合自己做中间件开发的一些感触吧：


- client端新增加的功能，最好都有一个对应的开关，便于出问题的时候及时调整，给自己留个后路
- client的功能尽量支持动态升级和降级，非核心功能不要影响业务功能，分清楚主次。
- client端的功能代码必要的时候一定需要辅有排查问题的辅助代码
- 非核心功能，能异步就异步，尽可能快，异步处理的时候，尤其是异步回调的时候，一定要风清楚代码是在哪个线程池中执行的。