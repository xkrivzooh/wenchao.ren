---
icon: page
author: xkrivzooh
date: 2023-06-02
sidebar: false
category:
  - java
tag:
  - java
---

# 忘记Jdk中的Timer

在Java开发中，我们经常需要执行定时任务。JDK中提供了两种常用的定时任务工具：`Timer`和`ScheduledExecutorService`。虽然它们都可以用来执行定时任务，但是它们之间有很大的区别。在本文中，我们将比较`Timer`和`ScheduledExecutorService`之间的区别，并解释为什么我们应该尽可能地使用`ScheduledExecutorService`。

## Timer的缺陷

`Timer`是JDK 1.3中引入的一个定时任务工具。它通过一个单独的线程来执行定时任务。`Timer`有一些缺陷:

- `Timer`只有一个线程来执行所有的定时任务。如果有多个定时任务需要执行，它们会排队等待`Timer`线程的执行。这意味着如果一个任务执行时间过长，将会影响其他任务的执行时间。
- 如果定时任务抛出未捕获的异常，Timer线程也会被终止，从而导致所有任务都无法执行
- Timer只能接受TimerTask类型的任务，这意味着如果我们需要执行Runnable类型的任务，就必须将其包装成TimerTask类型。这种包装可能会导致代码不够优雅和可读


## 为什么使用`ScheduledExecutorService`

`ScheduledExecutorService`是JDK 1.5中引入的一个定时任务工具。

- 它通过线程池来执行定时任务。因此，它可以执行多个定时任务，每个任务都在自己的线程中执行。这意味着如果一个任务执行时间过长，不会影响其他任务的执行时间。
- `ScheduledExecutorService`是线程安全的。如果一个任务抛出异常，`ScheduledExecutorService`将会继续执行其他任务，而不会中断整个线程池的执行。
- `ScheduledExecutorService`还提供了更多的灵活性。它可以执行定时任务，也可以执行周期性任务，并且可以设置任务的延迟时间和执行间隔时间。

## 结论

虽然`Timer`是一个简单易用的定时任务工具，但是它存在很多缺陷，特别是在多个定时任务的情况下。因此，我们应该尽可能地使用`ScheduledExecutorService`来执行定时任务。`ScheduledExecutorService`是线程安全的，可以执行多个定时任务，并且提供了更多的灵活性。
