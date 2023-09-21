---
icon: page
author: xkrivzooh
sidebar: false
date: 2020-06-03
category:
  - post
tag:
  - av
  - ett
---

# 不在要Netty的Pinple的线程中乱设置拒绝策略

之前给业务同学排查问题时发现我们的Trace服务的某个地方当Trace的量特别大时，一个线程池会对业务层抛出`RejectedExecutionException`，
于是热心的我就顺手给这个地方加了一个`RejectedExecutionHandler`的实现，在这个里面加一个监控，然后就没了。这样是没问题的，但是
「手贱」的我看到本文件中另外一个地方的线程池也没有设置拒绝策略。他之前的代码如下：

```java
String name = nettyClientConfig.getString(nameKey);
String workerExecutorName = StringUtils.hasText(name) ? String.format("%s.NettyClientCodecThread", name) : "NettyClientCodecThread";
ThreadFactory threadFactory = new DefaultThreadFactory(workerExecutorName, false);
this.defaultEventExecutorGroup = new DefaultEventExecutorGroup(threadSize, threadFactory);
```

我修改之后为：
```java
String name = nettyClientConfig.getString(nameKey);
String workerExecutorName = StringUtils.hasText(name) ? String.format("%s.NettyClientCodecThread", name) : "NettyClientCodecThread";
ThreadFactory threadFactory = new NamedThreadFactory(workerExecutorName, false);
int maxPendingTasks = nettyClientConfig.getInteger(maxPendingTasksKey, 100);
this.defaultEventExecutorGroup = new DefaultEventExecutorGroup(threadSize, threadFactory, maxPendingTasks,
		(task, executor) -> Metrics.counter("NettyClientCodecThread.rejected.counter").get().inc());
```

心想着老子又做了一回活雷锋。但是后来这个改动坑了一波，因为这个`defaultEventExecutorGroup`线程池是在Netty的pipeline中使用的：

```java
		Bootstrap handler = this.bootstrap.group(this.eventLoopGroupSelector).channel(useEpoll() ? EpollSocketChannel.class : NioSocketChannel.class)//
				.option(TCP_NODELAY, true)
				.option(SO_KEEPALIVE, false)
				.option(CONNECT_TIMEOUT_MILLIS, nettyClientConfig.getInteger(connectTimeoutKey))
				.option(SO_SNDBUF, nettyClientConfig.getInteger(socketSndBufSizeKey))
				.option(SO_RCVBUF, nettyClientConfig.getInteger(socketRecBufSizeKey))
				.option(ChannelOption.WRITE_BUFFER_LOW_WATER_MARK, writeBufferLowWaterMark)
				.option(ChannelOption.WRITE_BUFFER_HIGH_WATER_MARK, writeBufferHighWaterMark)
				.handler(new ChannelInitializer<SocketChannel>() {
					@Override
					public void initChannel(SocketChannel ch) throws Exception {
						ch.pipeline().addLast(
                            //看这里
								defaultEventExecutorGroup,
								new NettyDecoder(nettyClientConfig),
								prependerHandler,
								encoderHandler,
								new IdleStateHandler(0, 0, nettyClientConfig.getInteger(NettyClientConfig.channelMaxIdleTimeSecondsKey)),
								connectManageHandler,
								clientHandler);
					}
				});
```

然后这部分的代码因为是单独抽取出来的，所以Netty的两端都会使用这份代码，出现的现象就是，当传输的数据量太大的时候，如果触发拒绝策略，那么相当于这个TCP包就被丢弃了。
如果丢弃的这个包是一个完整的包（其实tcp是流协议，没有包的概念，此处指的包是一段完整的数据字节流）那么就不会出问题。

为啥改动之前没问题呢，因为默认的`DefaultEventExecutorGroup`的代码为：

```java
    /**
     * Create a new instance.
     *
     * @param nThreads          the number of threads that will be used by this instance.
     * @param threadFactory     the ThreadFactory to use, or {@code null} if the default should be used.
     */
    public DefaultEventExecutorGroup(int nThreads, ThreadFactory threadFactory) {
        this(nThreads, threadFactory, SingleThreadEventExecutor.DEFAULT_MAX_PENDING_EXECUTOR_TASKS,
                RejectedExecutionHandlers.reject());
    }
```

也就是他的拒绝策略虽然也是`RejectedExecutionHandlers.reject()`，但是他的队列是无界的（Integer.MAX_VALUE，近乎无界），所以基本上在他OOM挂掉之前他一般不会触发这个rejeced。
在排查这个问题的时候，我压根就不会觉的这个地方有问题，知道后来实在想不出有啥其他原因了，抓包分析发现问题果然出现在这里。

<!-- @include: ../scaffolds/post_footer.md -->
