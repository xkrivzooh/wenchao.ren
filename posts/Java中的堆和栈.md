---
icon: page
author: xkrivzooh
date: 2019-02-15
category:
  - post
tag:
  - java
---

# Java中的堆和栈

堆和栈都是Java用来在RAM中存放数据的地方。

## 堆

- Java的堆是一个运行时数据区，类的对象从堆中分配空间。这些对象通过new等指令建立，通过垃圾回收器来销毁。

- 堆的优势是可以动态地分配内存空间，需要多少内存空间不必事先告诉编译器，因为它是在运行时动态分配的。但缺点是，由于需要在运行时动态分配内存，所以存取速度较慢。 
- 堆内存满的时候抛出`java.lang.OutOfMemoryError: Java Heap Space`错误
- 可以使用`-Xms`和`-Xmx` JVM选项定义开始的大小和堆内存的最大值
- 存储在堆中的对象是全局可以被其他线程访问的

## 栈

- 栈中主要存放一些基本数据类型的变量（byte，short，int，long，float，double，boolean，char）和对象的引用，但对象本身不存放在栈中，而是存放在堆（new 出来的对象）或者常量池中(对象可能在常量池里)（字符串常量对象存放在常量池中。）。
- 栈的优势是，存取速度比堆快，栈数据可以共享。但缺点是，存放在栈中的数据占用多少内存空间需要在编译时确定下来，缺乏灵活性。
- 当栈内存满的时候，Java抛出`java.lang.StackOverFlowError`
- 和堆内存比，栈内存要小的多
- 明确使用了内存分配规则（LIFO）
- 可以使用`-Xss`定义栈的大小
- 栈内存不能被其他线程所访问。

## 静态域

存放静态成员（`static`定义的）

## 常量池

存放字符串常量和基本类型常量（`public static final`）

## 举例说明栈数据可以共享

String 可以用以下两种方式来创建：

```java
String str1 = newString("abc");
String str2 = "abc";
```

第一种使用new来创建的对象，它存放在堆中。每调用一次就创建一个新的对象。 

第二种是先在栈中创建对象的引用str2，然后查找栈中有没有存放“abc”，如果没有，则将“abc”存放进栈，并将str2指向“abc”，如果已经有“abc”， 则直接将str2指向“abc”。
 
```java
public static void main(String[] args) {
        String str1 = newString("abc");
        String str2 = newString("abc");
        System.out.println(str1 == str2);
    }
```
输出结果为：false

```java
public static void main(String[] args) {
        String str1 = "abc";
        String str2 = "abc";
        System.out.println(str1 == str2);
    }
```
输出结果为：true
