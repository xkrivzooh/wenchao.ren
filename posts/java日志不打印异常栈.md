---
icon: page
author: xkrivzooh
date: 2019-03-11
category:
  - post
tag:
  - java
---

# java日志不打印异常栈

## 问题描述

今天在排查一个问题的时候发现在日志输出中，只有异常的Message,并没有详细的异常堆栈。

## 问题解释

对于这个问题的官方解释为:

> The compiler in the server VM now provides correct stack backtraces for all "cold" built-in exceptions. For performance purposes, when such an exception is thrown a few times, the method may be recompiled. After recompilation, the compiler may choose a faster tactic using preallocated exceptions that do not provide a stack trace. To disable completely the use of preallocated exceptions, use this new flag: -XX:-OmitStackTraceInFastThrow.

简单的描述就是：

**它跟JDK5的一个新特性有关,对于一些频繁抛出的异常,JDK为了性能会做一个优化,即JIT重新编译后会抛出没有堆栈的异常， 
而在使用-server模式时,该优化选项是开启的,因此在频繁抛出某个异常一段时间后,该优化开始起作用,即只抛出没有堆栈的异常信息**

## 问题验证

比如下面的程序：

```java
public class TestCompile {
	private static final int count = 1000000;

	public static void main(String[] args) throws Exception {
		int index = count;
		while (index-- > 0) {
			try {
				work();
			}
			catch (Exception e) {
				e.printStackTrace();
			}
		}
	}

	private static void work() {
		String value = null;
		value.length();
	}
}
```

编译后使用`java -server -XX:-OmitStackTraceInFastThrow TestCompile`运行，发现一直都是类似的stacktrace。
                                                                        

```java
java.lang.NullPointerException
at TestCompile.work(TestCompile.java:25)
at TestCompile.main(TestCompile.java:17)
```


换成`java -server -XX:+OmitStackTraceInFastThrow TestCompile`运行一段时间后就会出现

```java
java.lang.NullPointerException
java.lang.NullPointerException
java.lang.NullPointerException
java.lang.NullPointerException
```

这样的exception，说明stacktrace 该优化已经起作用。`-XX:+OmitStackTraceInFastThrow`选项在`-server`情况下默认开启。

## 如何解决

- 方法1：查看很早之前的日志，那个时候jit的优化还没生效
- 方法2：重启服务，在重启的以后的一段时间内jit的优化也暂时不会生效
- 方法3：配置参数`-XX:-OmitStackTraceInFastThrow`

<!-- @include: ../scaffolds/post_footer.md -->
