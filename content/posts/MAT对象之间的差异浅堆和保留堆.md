---
title: MAT对象之间的差异浅堆和保留堆
toc: true
date: 2019-02-11 16:45:26
tags: ['java']
draft: false
---

原文地址：[SHALLOW HEAP, RETAINED HEAP](https://blog.gceasy.io/2019/01/03/shallow-heap-retained-heap/)

更贴切的标题应该是`Difference between Eclipse MAT objects Shallow Heap and Retained Heap`

Eclipse MAT (Memory Analyzer Tool) is a powerful tool to analyze heap dumps. It comes quite handy when you are trying to debug memory related problems. In Eclipse MAT two types of object sizes are reported:

- Shallow Heap
- Retained Heap

In this article lets study the difference between them. Let’s study how are they calculated?

![Shallow-heap-1.png](http://7niucdn.wenchao.ren/Shallow-heap-1.png)

It’s easier to learn new concepts through example. Let’s say your application’s has object model as shown in Fig #1:

- Object A is holding reference to objects B and C.
- Object B is holding reference to objects D and E.
- Object C is holding reference to objects F and G.
 
Let’s say each object occupies 10 bytes of memory. Now with this context let’s begin our study.

## Shallow Heap size

**Shallow heap of an object is its size in the memory**. Since in our example each object occupies 10 bytes, shallow heap size of each object is 10 bytes. Very simple.

## Retained Heap size of B

From the Fig #1 you can notice that object B is holding reference to objects D and E. So, if object B is garbage collected from memory, there will be no more active references to object D and E. It means D & E can also be garbage collected. Retained heap is the amount of memory that will be freed when the particular object is garbage collected. Thus, retained heap size of B is:

= B’s shallow heap size + D’s shallow heap size + E’s shallow heap size

= 10 bytes + 10 bytes + 10 bytes

= 30 bytes

Thus, retained heap size of B is 30 bytes.


## Retained Heap size of C

Object C is holding reference to objects F and G. So, if object C is garbage collected from memory, there will be no more references to object F & G. It means F & G can also be garbage collected. Thus, retained heap size of C is:

= C’s shallow heap size + F’s shallow heap size + G’s shallow heap size

= 10 bytes + 10 bytes + 10 bytes

= 30 bytes

Thus, retained heap size of C is 30 bytes as well

![shallow-heap-2-1.png](http://7niucdn.wenchao.ren/shallow-heap-2-1.png)

## Retained Heap size of A

Object A is holding reference to objects B and C, which in turn are holding references to objects D, E, F, G. Thus, if object A is garbage collected from memory, there will be no more reference to object B, C, D, E, F and G. With this understanding let’s do retained heap size calculation of A.

Thus, retained heap size of A is:

= A’s shallow heap size + B’s shallow heap size + C’s shallow heap size + D’s shallow heap size + E’s shallow heap size + F’s shallow heap size + G’s shallow heap size

= 10 bytes + 10 bytes + 10 bytes + 10 bytes + 10 bytes + 10 bytes + 10 bytes

= 70 bytes

Thus, retained heap size of A is 70 bytes.

## Retained heap size of D, E, F and G

Retained heap size of D is 10 bytes only i.e. their shallow size only. Because D don’t hold any active reference to any other objects. Thus, if D gets garbage collected no other objects will be removed from memory. As per the same explanation objects E, F and G’s retained heap size are also 10 bytes only.

## Let’s make our study more interesting

Now let’s make our study little bit more interesting, so that you will gain thorough understanding of shallow heap and retained heap size. Let’s have object H starts to hold reference to B in the example. Note object B is already referenced by object A. Now two guys A and H are holding references to object B. In this circumstance lets study what will happen to our retained heap calculation.

![Shallow-heap-3-1.png](http://7niucdn.wenchao.ren/Shallow-heap-3-1.png)

In this circumstance retained heap size of object A will go down to 40 bytes. Surprising? Puzzling? 🙂 continue reading on. If object A gets garbage collected, then there will be no more reference to objects C, F and G only. Thus, only objects C, F and G will be garbage collected. On the other hand, objects B, D and E will continue to live in memory, because H is holding active reference to B. Thus B, D and E will not be removed from memory even when A gets garbage collected.

Thus, retained heap size of A is:

= A’s shallow heap size + C’s shallow heap size + F’s shallow heap size + G’s shallow heap size

= 10 bytes + 10 bytes + 10 bytes + 10 bytes

= 40 bytes.

Thus, retained heap size of A will become 40 bytes. All other objects retained heap size will remain undisturbed, because there is no change in their references.

Hope this article helped to clarify Shallow heap size and Retained heap size calculation in Eclipse MAT. You might also consider exploring HeapHero – another powerful heap dump analysis tool, which shows the amount of memory wasted due to inefficient programming practices such as duplication of objects, overallocation and underutilization of data structures, suboptimal data type definitions,….

