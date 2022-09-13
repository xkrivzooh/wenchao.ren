---
icon: page
author: xkrivzooh
date: 2019-12-25
category:
  - post
tag:
  - bistoury
---

# Bistoury源码阅读-Agent启动


我们先以Bistoury Agent在本地启动为例子，入口类是`bistoury-independent-agent`module中的`qunar.tc.bistoury.indpendent.agent.Main`或者
`qunar.tc.bistoury.indpendent.agent.MainTest`类。一般我们测试的时候，都是通过MainTest类。

同时通过MainTest的写法，我们其实可以看到BistouryAgent启动的几个核心配置项：

- bistoury.app.lib.class 其实就是指定一个class，然后基于这个class找它的classLoader，一般我们都会指定为公司所有项目都会有的一个基础类。
- bistoury.lib.dir bistoury的lib地址
- bistoury.store.path bistoury的store地址
- bistoury.proxy.host Bistoury Proxy的域名



从Main类中，我们可以看到一个方法，这个方法的功能倒是没啥说的，此处可以学习一下`java.lang.management.ManagementFactory`的API。

```java
    public static void log() {
        List<String> args = ManagementFactory.getRuntimeMXBean().getInputArguments();
        for (String arg : args) {
            logger.info("Command line argument: {}", arg);
        }
    }
```

Bistoury Agent的核心类其实就是`qunar.tc.bistoury.agent.AgentClient`类。这个类主要有下面几个功能：

- 通过HTTP形式的调用{bistoury.proxy.host}/proxy/config/foragent地址获取一个BistouryProxy server的基础信息，ip，port，heartbeatSec。
此处之所以通过这种HTTP形式的调用，有几个目的：
    - 一定程度上面的负载均衡，因为我们一般会给BistouryProxy分配一个域名，那么此处的LB其实就是依赖NGINX了。
    - 拉取BistouryProxy的一些基础信息，目前拉取到的信息比较少，核心的只有一个`heartbeatSec`
- 建立Bistoury Agent和Bistoury Proxy之间的Netty长连接。这部分的代码主要是在`qunar.tc.bistoury.agent.AgentNettyClient`类中
- 通过一个单线程的调度线程来启动FailoverTask。也就是如果Bistoury Agent和Bistoury Proxy之间的连接失败或者连接因为其他原因断开等，那么这个线程目前会没1分钟check一下。
这里之所以每分钟check一下，而不是立即尝试，我觉的考虑主要是防止连接proxy的突发流量过大，同时Bistoury的使用其实并不是一个高频的产品，所以很多时候没必要立即恢复。当然
这样也带来一个问题，就是如果发布或是某台宕机的话，那一个agent可能就要最大1分钟才能重新可用了。

接下来我们来看看`qunar.tc.bistoury.agent.AgentNettyClient`的代码，这个其实就是负责和Bistoury Proxy之间的连接建立工作。有下面几个核心点，只要摸清楚这几个关键点，那么Agent启动流程的东西就全搞明白了。

- AgentInfoRefreshTask
    - 定时给BistouryProxy发送获取Bistoury Agent相关配置信息的请求。内部是基于`SingleThreadScheduledExecutor`实现，默认间隔10分钟请求一次。涉及到的命令code为:
    `qunar.tc.bistoury.remoting.protocol.CommandCode#REQ_TYPE_REFRESH_AGENT_INFO`
- HeartbeatTask
    - 定时给BistouryProxy发送心跳消息。这个时间间隔是在BistouryProxy端控制的，默认是30秒心跳一次。默认心跳超时时间阈值为（30 * 2 + 30/2） 也就是75秒。不过这块的心跳请求构建的代码是有点挫的。
- DefaultTaskStore
    - Agent端的Task管理对象。内部基于`ConcurrentHashMap`存储tasks。同时有一个`bistoury-task-clear`（单线程的scheduler）每10秒钟检查一下存储的tasks。如果某个task长时间没有完成，那么这个任务就会从ConcurrentHashMap中移除它。核心方法有：
        - boolean register(Task task);
        - void finish(String id);
        - void cancel(String id);
        - void close();
- 通过SPI的方式加载所有的`TaskFactory`, 每一个TaskFactory都对应一个`qunar.tc.bistoury.remoting.netty.Task`对象。
    - qunar.tc.bistoury.commands.arthas.ArthasTaskFactory
    - qunar.tc.bistoury.commands.JdkProcessCmdTaskFactory
    - qunar.tc.bistoury.commands.host.HostTaskFactory
    - qunar.tc.bistoury.commands.host.ThreadInfoTaskFactory
    - qunar.tc.bistoury.commands.heapHisto.HeapHistoTaskFactory
    - qunar.tc.bistoury.commands.monitor.QMonitorQueryTaskFactory
    - qunar.tc.bistoury.commands.cpujstack.CpuTimeTaskFactory
    - qunar.tc.bistoury.commands.cpujstack.ThreadInfoTaskFactory
    - qunar.tc.bistoury.commands.cpujstack.ThreadNumTaskFactory
    - qunar.tc.bistoury.commands.decompiler.DecompilerTaskFactory
- 通过DefaultTaskStore和加载的TaskProcessor列表，构建`TaskProcessor`，TaskProcessor类其实是执行上面这些Task的入口类。
    - 负责创建对应的Task
    - 执行Task
    - 将Task的执行结果通过方法参数中的`ResponseHandler`返回被BistouryProxy，然后BistouryProxy转发为BistouryUI（大多数时候都是前段的websocket中）
- RequestHandler 是一个非常重要的类，这个类是Agent收到来自BistouryProxy的最初始的入口类。
- `ConnectionManagerHandler`
    - 这个类比较简单，继承了`ChannelDuplexHandler`, 覆盖了channel相关的生命周期方法，然后打了一些日志。
