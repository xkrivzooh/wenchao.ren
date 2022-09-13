---
icon: page
author: xkrivzooh
date: 2019-03-04
category:
  - post
tag:
  - java
---

# java Unsafe介绍

`Unsafe`类对于并发编程来说是个很重要的类，J.U.C里的源码到处充斥着这个类的方法调用。

这个类的最大的特点在于，`它提供了硬件级别的CAS原子操作`。CAS可以说是实现了最轻量级的锁，当多个线程尝试使用CAS同时更新同一个变量时，只有其中的一个线程能成功地更新变量的值，而其他的线程将失败。然而，失败的线程并不会被挂起。

`CAS操作包含了三个操作数： 需要读写的内存位置，进行比较的原值，拟写入的新值`。

在`Unsafe`类中，实现CAS操作的方法是： `compareAndSwapXXX`

例如:

```java
public native boolean compareAndSwapObject(Object obj, long offset, Object expect, Object update);
```

- obj是我们要操作的目标对象
- offset表示了目标对象中，对应的属性的内存偏移量
- expect是进行比较的原值
- update是拟写入的新值。
- 
所以该方法实现了对目标对象obj中的某个成员变量（field）进行CAS操作的功能。

那么，要怎么获得目标field的内存偏移量offset呢？ Unsafe类为我们提供了一个方法：

```java
public native long objectFieldOffset(Field field);
```

该方法的参数是我们要进行CAS操作的field对象，要怎么获得这个field对象呢？最直接的办法就是通过反射了：

```java
Class<?> k = FutureTask.class;
Field stateField = k.getDeclaredField("state");
```

这样一波下来，我们就能对FutureTask的state属性进行CAS操作了o(￣▽￣)o

除了`compareAndSwapObject`，Unsafe类还提供了更为具体的对int和long类型的CAS操作：

```java
public native boolean compareAndSwapInt(Object obj, long offset, int expect, int update);
public native boolean compareAndSwapLong(Object obj, long offset, long expect, long update);
```

从方法签名可以看出，这里只是把目标field的类型限定成int和long类型，而不是通用的Object.

最后，FutureTask还用到了一个方法:

```
public native void putOrderedInt(Object obj, long offset, int value);
```

可以看出，该方法只有三个参数，所以它没有比较再交换的概念，某种程度上就是一个赋值操作，即设置obj对象中offset偏移地址对应的int类型的field的值为指定值。这其实是Unsafe的另一个方法`putIntVolatile`的有序或者有延迟的版本，并且不保证值的改变被其他线程立即看到，只有在field被`volatile`修饰并且期望被意外修改的时候使用才有用。

那么`putIntVolatile`方法的定义是什么呢？

```java
public native void putIntVolatile(Object obj, long offset, int value);
```

该方法设置obj对象中offset偏移地址对应的整型field的值为指定值，支持volatile store语义。由此可以看出:

`当操作的int类型field本身已经被volatile修饰时，putOrderedInt和putIntVolatile是等价的`





