---
icon: page
author: xkrivzooh
date: 2019-02-13
sidebar: false
category:
  - post
tag:
  - dubbo
---

# dubbo-SPI扩展(二)

本篇文章主要描述一下dubbo的扩展点中的一些基本概念和常见的一些注解

## 基本概念

### 扩展点(Extension Point)

扩展点其实就是一个Java的接口。比如dubbo中的`LoadBalance`接口其实就是一个扩展点

```java
@SPI(RandomLoadBalance.NAME)
public interface LoadBalance {

    @Adaptive("loadbalance")
    <T> Invoker<T> select(List<Invoker<T>> invokers, URL url, Invocation invocation) throws RpcException;
}
```

### 扩展(Extension)
扩展其实扩展点的实现类。比如以扩展点`LoadBalance`来说，`RandomLoadBalance`其实就是他的一个实现类，也是一个扩展。

```java
package org.apache.dubbo.rpc.cluster.loadbalance;

import org.apache.dubbo.common.URL;
import org.apache.dubbo.rpc.Invocation;
import org.apache.dubbo.rpc.Invoker;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

/**
 * random load balance.
 *
 */
public class RandomLoadBalance extends AbstractLoadBalance {

    public static final String NAME = "random";

    @Override
    protected <T> Invoker<T> doSelect(List<Invoker<T>> invokers, URL url, Invocation invocation) {
        int length = invokers.size(); // Number of invokers
        boolean sameWeight = true; // Every invoker has the same weight?
        int firstWeight = getWeight(invokers.get(0), invocation);
        int totalWeight = firstWeight; // The sum of weights
        for (int i = 1; i < length; i++) {
            int weight = getWeight(invokers.get(i), invocation);
            totalWeight += weight; // Sum
            if (sameWeight && weight != firstWeight) {
                sameWeight = false;
            }
        }
        if (totalWeight > 0 && !sameWeight) {
            // If (not every invoker has the same weight & at least one invoker's weight>0), select randomly based on totalWeight.
            int offset = ThreadLocalRandom.current().nextInt(totalWeight);
            // Return a invoker based on the random value.
            for (int i = 0; i < length; i++) {
                offset -= getWeight(invokers.get(i), invocation);
                if (offset < 0) {
                    return invokers.get(i);
                }
            }
        }
        // If all invokers have the same weight value or totalWeight=0, return evenly.
        return invokers.get(ThreadLocalRandom.current().nextInt(length));
    }

}
```

### 扩展实例(Extension Instance)

扩展实例其实就是扩展点实现类的实例。比如`new RandomLoadBalance()`其实就可以得到`LoadBalance`扩展点的一个扩展实例

### 扩展自适应实例(Extension Adaptive Instance)

这个自适应实例需要好好理解一下，这个很重要。

## 常见注解

TODO

## 基本使用

TODO

