---
title: dubbo对异常的一些处理
toc: true
date: 2020-05-29 12:23:53
tags: ['dubbo']
draft: false
---

看了一下这个文章[《Dubbo如何处理业务异常，这个一定要知道哦》](https://www.toutiao.com/i6802107821417562631/?tt_from=android_share&utm_campaign=client_share&timestamp=1590069558&app=news_article&utm_medium=toutiao_android&use_new_style=1&req_id=20200521215917010129036132045C9481&group_id=6802107821417562631)，但是不赞同文章中的一些论点，这里整理一下dubbo源码中Provider端的ExceptionFilter中
对异常的处理逻辑。


在Dubbo的provider端的`com.alibaba.dubbo.rpc.filter.ExceptionFilter`中，有如下几个规则：

- 如果是checked异常，直接抛出
- 在方法签名上有声明，直接抛出, 未在方法签名上定义的异常，在Provider端打印ERROR日志
- 异常类和接口类在同一jar包里，直接抛出
- 是JDK自带（以java.或者javax.开头）的异常，直接抛出
- 是Dubbo本身的异常（RpcException），直接抛出
- 如果以上几个规则都不满足的话，则将异常包装为RuntimeException抛给Consumer端


其中一个比较有意思的点就是如何根据一个class判断他所属的jar：

在`ExceptionFilter`中的逻辑是如下的：

```java
// 异常类和接口类在同一jar包里，直接抛出
String serviceFile = ReflectUtils.getCodeBase(invoker.getInterface());
String exceptionFile = ReflectUtils.getCodeBase(exception.getClass());
if (serviceFile == null || exceptionFile == null || serviceFile.equals(exceptionFile)){
    return result;
}
```

其中` ReflectUtils.getCodeBase`的代码如下：

```java
public static String getCodeBase(Class<?> cls) {
    if (cls == null)
        return null;
    ProtectionDomain domain = cls.getProtectionDomain();
    if (domain == null)
        return null;
    CodeSource source = domain.getCodeSource();
    if (source == null)
        return null;
    URL location = source.getLocation();
    if (location == null)
        return null;
    return location.getFile();
}
```