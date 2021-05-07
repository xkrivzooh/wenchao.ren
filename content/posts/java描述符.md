---
title: "java描述符"
date: 2021-04-22T14:12:09+08:00
draft: false
tags: ['asm']
---

## 类型描述符

基元类型的描述符是单个字符:Z 表示 boolean，C 表示 char，B 表示 byte，S 表示 short， I 表示 int，F 表示 float，J 表示 long，D 表示 double。一个类类型的描述符是这个类的 内部名，前面加上字符 L，后面跟有一个分号。例如，String 的类型描述符为 Ljava/lang/String;。而一个数组类型的描述符是一个方括号后面跟有该数组元素类型的描述符。


| Java类型   |      类型描述符    |
|----------|:-------------:|
| boolean |     Z  |
| char |     C  |
| byte |     B  |
| short |     S  |
| int |     I  |
| float |     F  |
| long |     J  |
| double |     D  |
| Object | Ljava/lang/Object;  |
| int[] |   [I |
| Object[][] |  [[Ljava/lang/Object; | 
|String | Ljava/lang/String; |

## 方法描述符

方法描述符是一个类型描述符列表，它用一个字符串描述一个方法的参数类型和返回类型。 方法描述符以左括号开头，然后是每个形参的类型描述符，然后是一个右括号，接下来是返回类 型的类型描述符，如果该方法返回 void，则是 V(方法描述符中不包含方法的名字或参数名)。

| 源文件中的方法声明   |      方法描述符    |
|----------|:-------------:|
|void m(int i, float f) | (IF)V |
|int m(Object o)    | (Ljava/lang/Object;)I|
|int[]m(inti,Strings) | (ILjava/lang/String;)[I |
| Object m(int[] i) |([I)Ljava/lang/Object;|

一旦知道了类型描述符如何工作，方法描述符的理解就容易了。例如，`(I)I`述一个方法，它接受一个 int 类型的参数，返回一个 int。
