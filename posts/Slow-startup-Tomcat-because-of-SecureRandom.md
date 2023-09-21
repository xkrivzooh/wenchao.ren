---
icon: page
author: xkrivzooh
date: 2018-12-04
sidebar: false
category:
  - post
tag:
  - java
---

# Slow startup Tomcat because of SecureRandom

今天在新机器上启动tomcat应用的时候，发现巨慢，检查日志发现有如下信息：

```
Jan 09, 2018 8:44:35 PM org.apache.catalina.util.SessionIdGenerator createSecureRandom
INFO: Creation of SecureRandom instance for session ID generation using [SHA1PRNG] took [239,939] milliseconds.
```

这块初始化SecureRandom用了239,939毫秒，之前没遇到这个问题。查了一下发现在官方wiki [https://wiki.apache.org/tomcat/HowTo/FasterStartUp#Entropy_Source](https://wiki.apache.org/tomcat/HowTo/FasterStartUp#Entropy_Source)

> Entropy Source
> Tomcat 7+ heavily relies on SecureRandom class to provide random values for its session ids and in other places. Depending on your JRE it can cause delays during startup if entropy source that is used to initialize SecureRandom is short of entropy. You will see warning in the logs when this happens, e.g.:
> org.apache.catalina.util.SessionIdGenerator createSecureRandom
> INFO: Creation of SecureRandom instance for session ID generation using [SHA1PRNG] took [5172] milliseconds.
> There is a way to configure JRE to use a non-blocking entropy source by setting the following system property: -Djava.security.egd=file:/dev/./urandom
> Note the "/./" characters in the value. They are needed to work around known Oracle JRE bug #6202721. See also JDK Enhancement Proposal 123. It is known that implementation of SecureRandom was improved in Java 8 onwards.
> Also note that replacing the blocking entropy source (/dev/random) with a non-blocking one actually reduces security because you are getting less-random data. If you have a problem generating entropy on your server (which is common), consider looking into entropy-generating hardware products such as "EntropyKey".

## 解决办法
基于官方wiki，解决办法是在tomcat的startenv.sh脚本中增加

```
-Djava.security.egd=file:/dev/./urandom

```

不过tomcat的wiki中提到，如果使用这个非阻塞的`/dev/urandom`的话，会有一些安全方面的风险，说实话没看懂，不过写了一篇[Myths about /dev/urandom](https://www.2uo.de/myths-about-urandom)来证明使用`/dev/urandom`是没问题的，所以就先用着吧：-）

## 关于 熵源”(entropy source)

这篇文章：[JVM上的随机数与熵池策略](http://hongjiang.info/jvm-random-and-entropy-source/)说的比较清楚，推荐大家阅读

## 参考资料

- [How do I make Tomcat startup faster?](https://wiki.apache.org/tomcat/HowTo/FasterStartUp)
- [JVM上的随机数与熵池策略](http://hongjiang.info/jvm-random-and-entropy-source/)


<!-- @include: ../scaffolds/post_footer.md -->
