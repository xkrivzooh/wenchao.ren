---
title: redis Pipeline
toc: true
date: 2019-07-31 12:42:29
tags: ['redis']
draft: false
---

在基于request-response的请求模型中，一般都会涉及下面几个阶段：

- client发送命令
- 命令在网络上传输
- server收到命令并开始执行
- server返回结果

在这个过程中我们可以看到有2次网络传输，而这两次网络传输的耗时成为：`RTT (Round Trip Time)`。例如，如果 RTT 时间是250毫秒（网络连接很慢的情况下），
即使服务端每秒能处理100k的请求量，那我们每秒最多也只能处理4个请求。如果使用的是本地环回接口，RTT 就短得多，但如如果需要连续执行多次写入，这也是一笔很大的开销。下面的图是传统的
N次request-response的交互图：

![传统的N次request-response的交互图](http://wenchao.ren/img/2020/11/20190731125102.png)

> 一般情况下我们为了解决rtt耗时太长的问题，会采样批处理的解决方案，也就是将请求参数批量发给server端，server端处理完这些请求以后，在一次性返回结果。

在redis中，已经提供了一些批量操作命令，比如mget，mset等命令。但是也有不少命令是没有批量操作命令的，但是为了解决这个问题，redis支持Pipeline。

Pipeline 并不是一种新的技术或机制，很多技术上都使用过。RTT 在不同网络环境下会不同，例如同机房和同机房会比较快，跨机房跨地区会比较慢。Redis 很早就支持 Pipeline 技术，因此无论你运行的是什么版本，你都可以使用 Pipeline 操作 Redis。如果客户端和服务端的网络延时越大，那么Pipeline的效果越明显。

Pipeline 能将一组 Redis 命令进行组装，通过一次 RTT 传输给 Redis，再将这组 Redis 命令按照顺序执行并将结果返回给客户端。上图没有使用 Pipeline 执行了 N 条命令，整个过程需要 N 次 RTT。下图为使用 Pipeline 执行 N 条命令，整个过程仅需要 1 次 RTT：

![Pipeline 示意图](http://wenchao.ren/img/2020/11/20190731125414.png)

## Pipeline 基本使用

我比较喜欢用的lettuce中对pipeline的使用方式（Asynchronous Pipelining）如下：

```java
StatefulRedisConnection<String, String> connection = client.connect();
RedisAsyncCommands<String, String> commands = connection.async();

// disable auto-flushing
commands.setAutoFlushCommands(false);

// perform a series of independent calls
List<RedisFuture<?>> futures = Lists.newArrayList();
for (int i = 0; i < iterations; i++) {
    futures.add(commands.set("key-" + i, "value-" + i));
    futures.add(commands.expire("key-" + i, 3600));
}

// write all commands to the transport layer
commands.flushCommands();

// synchronization example: Wait until all futures complete
boolean result = LettuceFutures.awaitAll(5, TimeUnit.SECONDS,
                   futures.toArray(new RedisFuture[futures.size()]));

// later
connection.close();
```

Jedis 也提供了对 Pipeline 特性的支持。我们可以借助 Pipeline 来模拟批量删除，虽然不会像 mget 和 mset 那样是一个原子命令，但是在绝大数情况下可以使用：

```java
public void mdel(List<String> keys){
  Jedis jedis = new Jedis("127.0.0.1");
  // 创建Pipeline对象
  Pipeline pipeline = jedis.pipelined();
  for (String key : keys){
    // 组装命令
    pipeline.del(key);
  }
  // 执行命令
  pipeline.sync();
}
```

## 批量命令与Pipeline对比

- redis的原生批量命令（如mget）是原子的，Pipeline 是非原子的。
- redis原生批量命令是一个命令对应多个key，Pipeline 支持多个命令。
- redis原生批量命令是Redis服务端支持实现的，而Pipeline需要服务端和客户端的共同实现。

## 参考资料

- [Using pipelining to speedup Redis queries](https://redis.io/topics/pipelining)
- [lettuce _pipelining_and_command_flushing](https://lettuce.io/core/release/reference/#_pipelining_and_command_flushing)
