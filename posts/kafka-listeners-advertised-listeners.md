---
icon: page
author: xkrivzooh
date: 2019-01-21
category:
  - post
tag:
  - kafka
---

# kafka listeners & advertised.listeners

今天在日常使用`spring-kafka`消费kafka数据时发现连接不是kafka，出现下面的异常：

```java
2019-01-21 16:55:58,675 WARN wtraceId[] wtracer[] [org.springframework.kafka.KafkaListenerEndpointContainer#0-0-C-1] c.w.f.w.k.LogConsumerConfiguration:45 - [wcollect]batch pull data from kafka error
java.lang.IllegalStateException: No entry found for connection 30
	at org.apache.kafka.clients.ClusterConnectionStates.nodeState(ClusterConnectionStates.java:330)
	at org.apache.kafka.clients.ClusterConnectionStates.disconnected(ClusterConnectionStates.java:134)
	at org.apache.kafka.clients.NetworkClient.initiateConnect(NetworkClient.java:921)
	at org.apache.kafka.clients.NetworkClient.ready(NetworkClient.java:287)
	at org.apache.kafka.clients.consumer.internals.ConsumerNetworkClient.trySend(ConsumerNetworkClient.java:474)
	at org.apache.kafka.clients.consumer.internals.ConsumerNetworkClient.poll(ConsumerNetworkClient.java:255)
	at org.apache.kafka.clients.consumer.internals.ConsumerNetworkClient.poll(ConsumerNetworkClient.java:236)
	at org.apache.kafka.clients.consumer.KafkaConsumer.pollForFetches(KafkaConsumer.java:1243)
	at org.apache.kafka.clients.consumer.KafkaConsumer.poll(KafkaConsumer.java:1188)
	at org.apache.kafka.clients.consumer.KafkaConsumer.poll(KafkaConsumer.java:1164)
	at org.springframework.kafka.listener.KafkaMessageListenerContainer$ListenerConsumer.run(KafkaMessageListenerContainer.java:728)
	at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)
	at java.util.concurrent.FutureTask.run$$$capture(FutureTask.java:266)
	at java.util.concurrent.FutureTask.run(FutureTask.java)
	at java.lang.Thread.run(Thread.java:748)
```

从上面的异常中大致可以看到是初始化`NetworkClient`连接时出现问题，基本可以证明是连接不是kafka broker。

后来排查发现是因为我在我本地的代码中是通过ip+port的形式访问的，而我们的kafka broker配置了下面的参数：

```shell
############################# Socket Server Settings #############################

# The address the socket server listens on. It will get the value returned from
# java.net.InetAddress.getCanonicalHostName() if not configured.
# FORMAT:
# listeners = listener_name://host_name:port
# EXAMPLE:
# listeners = PLAINTEXT://your.host.name:9092
listeners=PLAINTEXT://xxx.xx.xxx.xxx.xxx.com:9092
advertised.listeners=PLAINTEXT://xxx.xxx.xxx.xxx:9092
```
因此导致我连接不上kafka的broker。解决办法也很简单，使用

因此我们需要研究一下这几个参数的作用

## listeners

官网的解释如下：

> Listener List - Comma-separated list of URIs we will listen on and their protocols. **Specify hostname as 0.0.0.0 to bind to all interfaces. Leave hostname empty to bind to default interface**. Examples of legal listener lists: PLAINTEXT://myhost:9092,TRACE://:9091 PLAINTEXT://0.0.0.0:9092, TRACE://localhost:9093

string类型，默认值为`null`， 都好分隔的url列表。例子：`PLAINTEXT://myhost:9092,TRACE://:9091 PLAINTEXT://0.0.0.0:9092, TRACE://localhost:9093`

## host.name

> DEPRECATED: only used when `listeners` is not set. Use `listeners` instead. hostname of broker. If this is set, it will only bind to this address. If this is not set, it will bind to all interfaces	

string类型，默认值为`""`

## advertised.listeners	

> Listeners to publish to ZooKeeper for clients to use, if different than the listeners above. In IaaS environments, this may need to be different from the interface to which the broker binds. If this is not set, the value for `listeners` will be used.

string类型，默认值为`null`

## advertised.port	

> DEPRECATED: only used when `advertised.listeners` or `listeners` are not set. Use `advertised.listeners` instead. The port to publish to ZooKeeper for clients to use. In IaaS environments, this may need to be different from the port to which the broker binds. If this is not set, it will publish the same port that the broker binds to.

int类型，默认值为`null` 。如果在IaaS的环境下（IaaS 是云服务的最底层，相当于只提供了基础服务器），可能要为broker配置不同的接口绑定（以免端口冲突等问题），如果是这种情况，并没有设置`advertised.port`, 那么就会使用和broker绑定的端口一样的端口

## advertised.host.name	

> DEPRECATED: only used when `advertised.listeners` or `listeners` are not set. Use `advertised.listeners` instead. Hostname to publish to ZooKeeper for clients to use. In IaaS environments, this may need to be different from the interface to which the broker binds. If this is not set, it will use the value for `host.name` if configured. Otherwise it will use the value returned from java.net.InetAddress.getCanonicalHostName().

string类型，默认值为`null`

这个参数已经不推荐使用了，一般使用`advertised.listeners` 和 `listeners` 

## 参考资料

- [brokerconfigs](http://kafka.apache.org/0100/documentation.html#brokerconfigs)
- [Kafka集群无法外网访问问题解决攻略](https://blog.csdn.net/fengcai19/article/details/54695874)
- [Kafka Broker Advertised.Listeners属性的设置](http://www.javacoder.cn/?p=849)
- [kafka问题解决：生产者消费者不能连接远程kafka集群](https://blog.csdn.net/maoyuanming0806/article/details/80555979)

<!-- @include: ../scaffolds/post_footer.md -->
