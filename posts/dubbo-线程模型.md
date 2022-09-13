---
icon: page
author: xkrivzooh
sidebar: false
date: 2019-08-07
category:
  - post
tag:
  - dubbo
---

# dubbo 线程模型
dubbo的线程模型设计的算是非常不错的了，值得我们学习。下图是dubbo的线程模型图：

![dubbo线程模型图](http://wenchao.ren/img/2020/11/20190807120617.png)

## IO线程和业务线程的选择原则

在官方文档中，对于线程模型的选择说的比较清楚：

- **如果事件处理的逻辑能迅速完成，并且不会发起新的 IO 请求，比如只是在内存中记个标识，则直接在 IO 线程上处理更快，因为减少了线程池调度。**
- **但如果事件处理逻辑较慢，或者需要发起新的 IO 请求，比如需要查询数据库，则必须派发到线程池，否则 IO 线程阻塞，将导致不能接收其它请求。如果用 IO 线程处理事件，又在事件处理过程中发起新的 IO 请求，比如在连接事件中发起登录请求，会报“可能引发死锁”异常，但不会真死锁。**

我们平时在编写代码的时候，也需要遵循这个大原则。

dubbo的线程模型配置起来也是比较简单的：

```xml
<dubbo:protocol name="dubbo" dispatcher="all" threadpool="fixed" threads="100" />
```

比如上面的配置中，dubbo协议使用了`all` Dispatcher，内部使用固定100大小的线程池。

根据上面的线程模型图来看，当dubbo provider收到dubbo consumer的请求以后，会通过`Dispather`模块来进行请求分发，在这个`Dispather`模块中决定了dubbo的部分功能使用哪个线程池。然后在`ThreadPool`模块中提供了好几个线程池实现。基本上算是覆盖到了绝大多数场景。


## dubbo Dispatcher分类

- all 所有消息都派发到线程池，包括请求，响应，连接事件，断开事件，心跳等。
- direct 所有消息都不派发到线程池，全部在 IO 线程上直接执行。
- message 只有请求响应消息派发到线程池，其它连接断开事件，心跳等消息，直接在 IO 线程上执行。
- execution 只请求消息派发到线程池，不含响应，响应和其它连接断开事件，心跳等消息，直接在 IO 线程上执行。
- connection 在 IO 线程上，将连接断开事件放入队列，有序逐个执行，其它消息派发到线程池。

默认情况下的dispatcher为`all`，这样的话可以尽可能的提示吞吐量。

## dubbo的ThreadPool

- fixed 固定大小线程池，启动时建立线程，不关闭，一直持有。(缺省)
- cached 缓存线程池，空闲一分钟自动删除，需要时重建。
- limited 可伸缩线程池，但池中的线程数只会增长不会收缩。只增长不收缩的目的是为了避免收缩时突然来了大流量引起的性能问题。
- eager 优先创建Worker线程池。在任务数量大于corePoolSize但是小于maximumPoolSize时，优先创建Worker来处理任务。当任务数量大于maximumPoolSize时，将任务放入阻塞队列中。阻塞队列充满时抛出RejectedExecutionException。(相比于cached:cached在任务数量超过maximumPoolSize时直接抛出异常而不是将任务放入阻塞队列)

从dispatcher和threadpool模块可以看出，dubbo之所以搞这么多dispatcher和threadpool的实现，就是基于线程模型的选择大原则，使得可以针对不同的业务场景，业务使用方可以自主选择不同的实现。从这一点上来说，作为一个rpc框架，dubbo在这方面的考量和实现算是非常不错的了。

## 源码阅读

dubbo的线程模型相关的代码，我们从`org.apache.dubbo.remoting.transport.netty4.NettyServer`这个类开始看，在`NettyServer`中：

```java
    public NettyServer(URL url, ChannelHandler handler) throws RemotingException {
        // you can customize name and type of client thread pool by THREAD_NAME_KEY and THREADPOOL_KEY in CommonConstants.
        // the handler will be warped: MultiMessageHandler->HeartbeatHandler->handler
        super(url, ChannelHandlers.wrap(handler, ExecutorUtil.setThreadName(url, SERVER_THREAD_POOL_NAME)));
    }
```

这里有一个很有意思的点就是`ChannelHandlers.wrap`，他对`ChannelHandler`做了2层wrapper，也就是注释中描述的：MultiMessageHandler->HeartbeatHandler->handler。因此当dubbo provider收到消息以后，消息的处理顺序是：MultiMessageHandler->HeartbeatHandler->handler。

在默认配置情况下，无论是请求还是响应的处理顺序都是：

```java
MultiMessageHandler
-->handler: HeartbeatHandler
   -->handler: AllChannelHandler
         -->url: providerUrl
         -->executor: FixedExecutor
         -->handler: DecodeHandler
            -->handler: HeaderExchangeHandler
               -->handler: ExchangeHandlerAdapter（DubboProtocol.requestHandler）
```

在`org.apache.dubbo.remoting.transport.dispatcher.ChannelHandlers`类中可以看到：

```java
protected ChannelHandler wrapInternal(ChannelHandler handler, URL url) {
        return new MultiMessageHandler(new HeartbeatHandler(ExtensionLoader.getExtensionLoader(Dispatcher.class)
                .getAdaptiveExtension().dispatch(handler, url)));
    }
```

我们先来看看这个`MultiMessageHandler`，它的作用其实很简单，就是当`ChannelHandler#received`方法被调用的时候，首先判断消息是否是`MultiMessage`类型，如果是的话则循环处理。这一点在`MultiMessageHandler`代码中可以看到：

```java
public class MultiMessageHandler extends AbstractChannelHandlerDelegate {

    public MultiMessageHandler(ChannelHandler handler) {
        super(handler);
    }

    @SuppressWarnings("unchecked")
    @Override
    public void received(Channel channel, Object message) throws RemotingException {
        if (message instanceof MultiMessage) {
            MultiMessage list = (MultiMessage) message;
            for (Object obj : list) {
                handler.received(channel, obj);
            }
        } else {
            handler.received(channel, message);
        }
    }
}
```
从上面的代码中可以看到，如果收到的消息是`MultiMessage`类型的话，因为是循环调用`handler.received`, 而且此处并没有在for循环内部进行try-cache，因此如果handler内部处理抛出异常的话，那么这里的for循环会终止。

在`MultiMessageHandler`内部其实调用的是`HeartbeatHandler#received`方法，而这个方法的实现为：

```java
    @Override
    public void received(Channel channel, Object message) throws RemotingException {
        setReadTimestamp(channel);
        if (isHeartbeatRequest(message)) {
            Request req = (Request) message;
            if (req.isTwoWay()) {
                Response res = new Response(req.getId(), req.getVersion());
                res.setEvent(Response.HEARTBEAT_EVENT);
                channel.send(res);
                if (logger.isInfoEnabled()) {
                    int heartbeat = channel.getUrl().getParameter(Constants.HEARTBEAT_KEY, 0);
                    if (logger.isDebugEnabled()) {
                        logger.debug("Received heartbeat from remote channel " + channel.getRemoteAddress()
                                + ", cause: The channel has no data-transmission exceeds a heartbeat period"
                                + (heartbeat > 0 ? ": " + heartbeat + "ms" : ""));
                    }
                }
            }
            return;
        }
        if (isHeartbeatResponse(message)) {
            if (logger.isDebugEnabled()) {
                logger.debug("Receive heartbeat response in thread " + Thread.currentThread().getName());
            }
            return;
        }
        handler.received(channel, message);
    }
```

这个实现有一个很有意思的点就是receive方法的第一行的`setReadTimestamp(channel);`:

```java
  private void setReadTimestamp(Channel channel) {
       //KEY_READ_TIMESTAMP = "READ_TIMESTAMP";
        channel.setAttribute(KEY_READ_TIMESTAMP, System.currentTimeMillis());
    }
```

简单的说这个setReadTimestamp就是为了记录dubbo provider最后一次收到请求的时间。
一般读写不分离，因此在`HeartbeatHandler`类中也存在：
```java
  private void setWriteTimestamp(Channel channel) {
        channel.setAttribute(KEY_WRITE_TIMESTAMP, System.currentTimeMillis());
    }
```
而这个`setWriteTimestamp`方法就是为了记录dubbo provider最后一次写请求的时间，这个方法是被下面2个方法调用的：

- HeartbeatHandler#connected
- HeartbeatHandler#sent

因此我们可以知道,在`HeartbeatHandler`中存在下面的逻辑：

- 连接完成时：设置lastRead和lastWrite
- 连接断开时：清空lastRead和lastWrite
- 发送消息时：设置lastWrite
- 接收消息时：设置lastRead

这个实现其实挺精巧的，因为`HeartbeatHandler`就是处理心跳的，除过正常的心跳包，正常的连接建立，消息的发送其实在一定程度上也可以看做是心跳包。关于dubbo的心跳机制，此处就不多提了，我计划用专门的文章来说一下dubbo的心跳。

从上面我们知道，如果收到的不是心跳消息的话，那么HeartbeatHandler会委托给`Dispatcher`来处理：

```java
/**
 * ChannelHandlerWrapper (SPI, Singleton, ThreadSafe)
 */
@SPI(AllDispatcher.NAME) //all
public interface Dispatcher {

    /**
     * dispatch the message to threadpool.
     *
     * @param handler
     * @param url
     * @return channel handler
     */
    @Adaptive({Constants.DISPATCHER_KEY, "dispather", "channel.handler"})
    // The last two parameters are reserved for compatibility with the old configuration
    ChannelHandler dispatch(ChannelHandler handler, URL url);

}
```
此处使用了dubbo的spi机制，默认加载的是`org.apache.dubbo.remoting.transport.dispatcher.all.AllDispatcher`:

```java
/**
 * default thread pool configure
 */
public class AllDispatcher implements Dispatcher {

    public static final String NAME = "all";

    @Override
    public ChannelHandler dispatch(ChannelHandler handler, URL url) {
        return new AllChannelHandler(handler, url);
    }

}
```

而在`AllChannelHandler`的代码中：

```java
public class AllChannelHandler extends WrappedChannelHandler {

    public AllChannelHandler(ChannelHandler handler, URL url) {
        super(handler, url);
    }

    @Override
    public void connected(Channel channel) throws RemotingException {
        ExecutorService executor = getExecutorService();
        try {
            executor.execute(new ChannelEventRunnable(channel, handler, ChannelState.CONNECTED));
        } catch (Throwable t) {
            throw new ExecutionException("connect event", channel, getClass() + " error when process connected event .", t);
        }
    }

    @Override
    public void disconnected(Channel channel) throws RemotingException {
        ExecutorService executor = getExecutorService();
        try {
            executor.execute(new ChannelEventRunnable(channel, handler, ChannelState.DISCONNECTED));
        } catch (Throwable t) {
            throw new ExecutionException("disconnect event", channel, getClass() + " error when process disconnected event .", t);
        }
    }

    @Override
    public void received(Channel channel, Object message) throws RemotingException {
        ExecutorService executor = getExecutorService();
        try {
            executor.execute(new ChannelEventRunnable(channel, handler, ChannelState.RECEIVED, message));
        } catch (Throwable t) {
            //TODO A temporary solution to the problem that the exception information can not be sent to the opposite end after the thread pool is full. Need a refactoring
            //fix The thread pool is full, refuses to call, does not return, and causes the consumer to wait for time out
        	if(message instanceof Request && t instanceof RejectedExecutionException){
        		Request request = (Request)message;
        		if(request.isTwoWay()){
        			String msg = "Server side(" + url.getIp() + "," + url.getPort() + ") threadpool is exhausted ,detail msg:" + t.getMessage();
        			Response response = new Response(request.getId(), request.getVersion());
        			response.setStatus(Response.SERVER_THREADPOOL_EXHAUSTED_ERROR);
        			response.setErrorMessage(msg);
        			channel.send(response);
        			return;
        		}
        	}
            throw new ExecutionException(message, channel, getClass() + " error when process received event .", t);
        }
    }

    @Override
    public void caught(Channel channel, Throwable exception) throws RemotingException {
        ExecutorService executor = getExecutorService();
        try {
            executor.execute(new ChannelEventRunnable(channel, handler, ChannelState.CAUGHT, exception));
        } catch (Throwable t) {
            throw new ExecutionException("caught event", channel, getClass() + " error when process caught event .", t);
        }
    }
}
```
可以看到，**AllChannelHandler重写了`ChannelHandler`中的除`sent`之外的所有方法**。在重写的这些实现里面, 无一例外的都调用了：

```java
ExecutorService executor = getExecutorService();
```

这个方法的实现为：

```
  public ExecutorService getExecutorService() {
        return executor == null || executor.isShutdown() ? SHARED_EXECUTOR : executor;
    }
```

而此处executor的实现是在`WrappedChannelHandler`类的构造函数中通过sp加载的：

```java
executor = (ExecutorService) ExtensionLoader.getExtensionLoader(ThreadPool.class).getAdaptiveExtension().getExecutor(url);
```

`ThreadPool`扩展点的定义为：

```java
/**
 * ThreadPool
 */
@SPI("fixed")
public interface ThreadPool {

    /**
     * Thread pool
     *
     * @param url URL contains thread parameter
     * @return thread pool
     */
    @Adaptive({THREADPOOL_KEY})
    Executor getExecutor(URL url);

}
```

可以看到默认的实现为`FixedThreadPool`:

```java
  @Override
    public Executor getExecutor(URL url) {
        String name = url.getParameter(THREAD_NAME_KEY, DEFAULT_THREAD_NAME);
        int threads = url.getParameter(THREADS_KEY, DEFAULT_THREADS);
        int queues = url.getParameter(QUEUES_KEY, DEFAULT_QUEUES);
        return new ThreadPoolExecutor(threads, threads, 0, TimeUnit.MILLISECONDS,
                queues == 0 ? new SynchronousQueue<Runnable>() :
                        (queues < 0 ? new LinkedBlockingQueue<Runnable>()
                                : new LinkedBlockingQueue<Runnable>(queues)),
                new NamedInternalThreadFactory(name, true), new AbortPolicyWithReport(name, url));
    }
```

因此默认情况下200个线程，此处的DEFAULT_QUEUES默认为0。

关于`AllChannelHandler`有一个有意思的点就是`received`方法：

```java
    @Override
    public void received(Channel channel, Object message) throws RemotingException {
        ExecutorService executor = getExecutorService();
        try {
            executor.execute(new ChannelEventRunnable(channel, handler, ChannelState.RECEIVED, message));
        } catch (Throwable t) {
            //TODO A temporary solution to the problem that the exception information can not be sent to the opposite end after the thread pool is full. Need a refactoring
            //fix The thread pool is full, refuses to call, does not return, and causes the consumer to wait for time out
        	if(message instanceof Request && t instanceof RejectedExecutionException){
        		Request request = (Request)message;
        		if(request.isTwoWay()){
        			String msg = "Server side(" + url.getIp() + "," + url.getPort() + ") threadpool is exhausted ,detail msg:" + t.getMessage();
        			Response response = new Response(request.getId(), request.getVersion());
        			response.setStatus(Response.SERVER_THREADPOOL_EXHAUSTED_ERROR);
        			response.setErrorMessage(msg);
        			channel.send(response);
        			return;
        		}
        	}
            throw new ExecutionException(message, channel, getClass() + " error when process received event .", t);
        }
    }
```
为什么有意思呢，我们之前提了：

> all 所有消息都派发到线程池，包括请求，响应，连接事件，断开事件，心跳等。

因此如果dubbo provider端的fixed线程池处理不过来了，而请求是`TwoWay`请求的时候（也就是需要响应），那么如何处理呢？因为此时fixed线程池已经处理不过来了，所以为了避免consumer端傻等超时的问题，此处有特殊处理：

```java
	if(message instanceof Request && t instanceof RejectedExecutionException){
        		Request request = (Request)message;
        		if(request.isTwoWay()){
        			String msg = "Server side(" + url.getIp() + "," + url.getPort() + ") threadpool is exhausted ,detail msg:" + t.getMessage();
        			Response response = new Response(request.getId(), request.getVersion());
        			response.setStatus(Response.SERVER_THREADPOOL_EXHAUSTED_ERROR);
        			response.setErrorMessage(msg);
        			channel.send(response);
        			return;
        		}
        	}
```

根据顺序:

```java
MultiMessageHandler
-->handler: HeartbeatHandler
   -->handler: AllChannelHandler
         -->url: providerUrl
         -->executor: FixedExecutor
         -->handler: DecodeHandler
            -->handler: HeaderExchangeHandler
               -->handler: ExchangeHandlerAdapter（DubboProtocol.requestHandler）
```
此处直接使用了底层的`DubboProtocol.requestHandler`来处理, 也就是使用了io线程来发送response。

## 参考资料

- [线程模型](http://dubbo.apache.org/zh-cn/docs/user/demos/thread-model.html)
