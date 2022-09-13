---
icon: page
author: xkrivzooh
date: 2019-12-27
category:
  - post
tag:
  - java
---

# 缩短class路径

如果有时候在打印一些class日志时，经常会遇到class full name太长的问题，这个时候可以借助logback中的`ch.qos.logback.classic.pattern.TargetLengthBasedClassNameAbbreviator`来缩短输出。 ​

![TargetLengthBasedClassNameAbbreviator](http://wenchao.ren/img/2020/11/20191227193236.png)
