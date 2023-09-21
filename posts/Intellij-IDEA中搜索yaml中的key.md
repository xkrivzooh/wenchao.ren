---
icon: page
author: xkrivzooh
date: 2019-10-10
sidebar: false
category:
  - post
tag:
  - idea
---

# Intellij IDEA中搜索yaml中的key

因yaml文件相比于properties文件来结构更加清晰，所以现在无论是公司项目中还是开源的项目中，yaml文件越来越常见。
曾经的特别讨厌使用yaml文件主要是因为搜索yaml文件中的key的时候太麻烦：

比如有下面的yaml文件：
```java
wsearch:
  zk:
    address: xxxxxxxx
```

在Idea中使用Command+Shitf+F搜索`wsearch.zk.address`的时候是搜索不到的

![](http://wenchao.ren/img/2020/11/20191010190619.png)

就因为这个原因，导致我特别的厌烦yaml的配置。

今天才发现原来在IDEA可以使用如下的方式搜索到。那就是使用Idea的Search everywhere功能。按2下shift，然后在搜索就好了：

![](http://wenchao.ren/img/2020/11/20191010190843.png)

发现在Stack Overflow也有人问这个问题[How to find specific property key in a yaml file using intellij idea?](https://stackoverflow.com/questions/50577033/how-to-find-specific-property-key-in-a-yaml-file-using-intellij-idea)


<!-- @include: ../scaffolds/post_footer.md -->
