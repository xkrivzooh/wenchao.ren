---
title: 几个有意思的java小题目
toc: true
date: 2019-02-22 19:56:10
tags: ['java']
draft: false
---

## null + String

写出下面代码执行结果: 

```java
// 1. 打印 null String
String s = null;
System.out.println(s);

String str = null;
str = str + "!";
System.out.println(str);
```

这个片段程序不会出现NPE，正常输出：

```java
null
null!
```

我一开始以为第二个输出会抛出NPE。google了一下，看到了这篇文章[Java String 对 null 对象的容错处理](http://www.importnew.com/27601.html), 里面有解释：

对于代码片段：

```java
String s = null;
s = s + "!";
System.out.print(s);
```

编译器生成的字节码为：

```java
L0
 LINENUMBER 27 L0
 ACONST_NULL
 ASTORE 1
L1
 LINENUMBER 28 L1
 NEW java/lang/StringBuilder
 DUP
 INVOKESPECIAL java/lang/StringBuilder.<init> ()V
 ALOAD 1
 INVOKEVIRTUAL java/lang/StringBuilder.append (Ljava/lang/String;)Ljava/lang/StringBuilder;
 LDC "!"
 INVOKEVIRTUAL java/lang/StringBuilder.append (Ljava/lang/String;)Ljava/lang/StringBuilder;
 INVOKEVIRTUAL java/lang/StringBuilder.toString ()Ljava/lang/String;
 ASTORE 1
L2
 LINENUMBER 29 L2
 GETSTATIC java/lang/System.out : Ljava/io/PrintStream;
 ALOAD 1
 INVOKEVIRTUAL java/io/PrintStream.print (Ljava/lang/String;)V
 ```

 这其中涉及到+字符串拼接的原理了：编译器对字符串相加会进行优化，首先实例化一个StringBuilder，然后把相加的字符串按顺序append，最后调用toString返回一个String对象。不信你们看看上面的字节码是不是出现了StringBuilder。因此：

 ```java
 String s = "a" + "b";
//等价于
StringBuilder sb = new StringBuilder();
sb.append("a");
sb.append("b");
String s = sb.toString();
```

再回到我们的问题，现在我们知道秘密在`StringBuilder.append`函数的源码中:

```java
//针对 String 对象
public AbstractStringBuilder append(String str) {
    if (str == null)
        return appendNull();
    int len = str.length();
    ensureCapacityInternal(count + len);
    str.getChars(0, len, value, count);
    count += len;
    return this;
}
//针对非 String 对象
public AbstractStringBuilder append(Object obj) {
    return append(String.valueOf(obj));
}
 
private AbstractStringBuilder appendNull() {
    int c = count;
    ensureCapacityInternal(c + 4);
    final char[] value = this.value;
    value[c++] = 'n';
    value[c++] = 'u';
    value[c++] = 'l';
    value[c++] = 'l';
    count = c;
    return this;
}
```

## null cast 

下面程序的输出结果为：`Hello` ：

```java
public class Example {
    private static void sayHello() {
        System.out.println("Hello");
    }
 
    public static void main(String[] args) {
        ((Example)null).sayHello();
    }
}
```

`null`作为非基本类型，可以做类型转换，转换后调用静态方法输出字符串。
基本类型，比如`int`，类型转换时会报告空指针异常，比如 `int a = (Integer)null`; 原因就是转换过程中会调用`intValue()`，因此会报告异常。

## String 常量池

`String s3 = new String(“Cat”)` 这句代码会创建几个 String 对象

如果在执行语句之前String常量池中没有`Cat`字符串，那么会创建2个String；反之只创建1个 String对象。这里涉及到String的常量池。

[深入java字符串常量池](https://blog.csdn.net/neweastsun/article/details/82728323)

## 参考文章：
- [Java String 对 null 对象的容错处理](http://www.importnew.com/27601.html)
- [深入java字符串常量池](https://blog.csdn.net/neweastsun/article/details/82728323)
