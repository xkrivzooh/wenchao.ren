---
icon: page
author: xkrivzooh
date: 2019-01-14
category:
  - post
tag:
  - es
---

# ES集群NoNodeAvailableException

## 问题描述

今天在操作es的过程中出现了异常: 

```shell
org.elasticsearch.client.transport.NoNodeAvailableException: None of the
  configured nodes are available
```

而我创建es client的代码也很简单，核心是：

```java
 Settings settings = Settings.builder()
                    .put("cluster.name", esClusterInfo.getClusterName())
                    .put("client.transport.sniff", true) //自动嗅探整个集群的状态，把集群中其他ES节点的ip添加到本地的客户端列表中
                    .build();
```

## 我的排查步骤

记录一下我当时的排查过程：

- 看异常第一反应是集群有问题，但是排查集群的节点以后，发现集群的节点都是没问题的。
- 而后开始检查`settings`中设置的`cluster.name`的是否正确发现也是正确的
- google发现很多人是因为将es集群的端口写错，也就是`9300`错写为`9200`，但是检查我的数据以后发现也是没问题的。
- 而后开始怀疑我设置的`client.transport.sniff`的缘故，因为这个参数的作用是：
  
> 使客户端去嗅探整个集群的状态，把集群中其它机器的ip地址加到客户端中。这样做的好处是，一般你不用手动设置集群里所有集群的ip到连接客户端，它会自动帮你添加，并且自动发现新加入集群的机器

但是这个参数有一个问题就是：

> 当ES服务器监听（publish_address ）使用内网服务器IP，而访问（bound_addresses ）使用外网IP时，不要设置client.transport.sniff为true。不设置client.transport.sniff时，默认为false(关闭客户端去嗅探整个集群的状态)。因为在自动发现时会使用内网IP进行通信，导致无法连接到ES服务器。因此此时需要直接使用addTransportAddress方法把集群中其它机器的ip地址加到客户端中。

但是检查我的环境，发现我的环境全部是内网，所以设置不设置这个`client.transport.sniff`是没区别的。

最后持续google许久，也没发现问题，喝杯茶刷了一会手机突然想起印象中es client的版本和es集群的版本不一致也有可能
出问题，于是google了一波`es 版本不一致`这个关键字，果然是因为版本不一致导致的。

## ES client和ES集群版本不一致的问题

我遇到的这个问题是es集群的版本比我使用的es client的版本低，相当于我使用高版本的client去访问低版本的集群，所以出现`org.elasticsearch.client.transport.NoNodeAvailableException: None of the configured nodes are available`问题。

因此我们平时需要注意es的版本问题。
