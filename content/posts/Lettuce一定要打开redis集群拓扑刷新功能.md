---
title: Lettuce一定要打开redis集群拓扑刷新功能
toc: true
date: 2020-06-03 00:21:22
tags: ['java', 'redis']
draft: false
---

在使用`Lettuce`访问Redis的时候，一定要记得打开它的Redis 集群拓扑刷新功能，否则他压根就不存在高可用。因为他的集群拓扑刷新功能是默认没开启的。

- [RedisCluster集群模式下master宕机主从切换期间Lettuce连接Redis无法使用报错Redis command timed out的问题](https://blog.csdn.net/ankeway/article/details/100136675)
- [SpringBoot2.X与redis Lettuce集成踩坑](https://juejin.im/post/5e12e39cf265da5d381d0f00)
- [SpringBoot2.1.X使用Redis连接池Lettuce踩坑](https://www.cnblogs.com/gavincoder/p/12731833.html)

上面的3个文章其实说的就是这个事情，在redis集群拓扑结构发生变化，比如Redis的master挂掉了后，lettuce的client端就会长时间不能恢复。因此可以通过下面的配置打开拓扑刷新功能：

```java
	//默认超时时间, lettuce默认超时时间为60s太长了，此处默认设置为15s
	private Long timeoutInMillis = Duration.ofSeconds(15).toMillis();

	static ClusterClientOptions.Builder initDefaultClusterClientOptions(ClusterClientOptions.Builder builder) {
		ClusterTopologyRefreshOptions defaultClusterTopologyRefreshOptions = ClusterTopologyRefreshOptions.builder()
				//开启集群拓扑结构周期性刷新，和默认参数保持一致
				.enablePeriodicRefresh(60, TimeUnit.SECONDS)
				//开启针对{@link RefreshTrigger}中所有类型的事件的触发器
				.enableAllAdaptiveRefreshTriggers()
				//和默认一样，30s超时，避免短时间大量出现刷新拓扑的事件
				.adaptiveRefreshTriggersTimeout(30, TimeUnit.SECONDS)
				//和默认一样重连5次先，然后在刷新集群拓扑
				.refreshTriggersReconnectAttempts(5)
				.build();

		return builder
				// 配置用于开启自适应刷新和定时刷新。如自适应刷新不开启，Redis集群变更时将会导致连接异常
				.topologyRefreshOptions(defaultClusterTopologyRefreshOptions)
				//默认就是重连的，显示定义一下
				.autoReconnect(true)
				//和默认一样最大重定向5次，避免极端情况无止境的重定向
				.maxRedirects(5)
				//Accept commands when auto-reconnect is enabled, reject commands when auto-reconnect is disabled.
				.disconnectedBehavior(ClientOptions.DisconnectedBehavior.DEFAULT)
				.socketOptions(SocketOptions.builder().keepAlive(true).tcpNoDelay(true).build())
				//取消校验集群节点的成员关系
				.validateClusterNodeMembership(false);
	}

	public static ClusterClientOptions.Builder getDefaultClusterClientOptionBuilder() {
		return initDefaultClusterClientOptions(ClusterClientOptions.builder());
	}
```

上面的配置其实就是修改默认的连接参数，打开集群拓扑刷新功能。其中有几个比较重要的地方，redis的默认超时时间是1分钟，其实这个时间太长了，很多的时候几秒钟就可以了，我这里是改为了15秒。
另外一个比较重要的参数就是`validateClusterNodeMembership`，这个大家一定要注意，默认这个属性是true的，也就是你的redis cluster集群增加一个redis节点，Lettuce默认是不信任这个节点的，
因此在内网的情况下，我们基本上都要关闭这个功能。也就是：`validateClusterNodeMembership(false);`
