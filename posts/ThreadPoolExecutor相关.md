---
icon: page
author: xkrivzooh
date: 2019-08-30
category:
  - post
tag:
  - java
---

# ThreadPoolExecutor相关

java中的线程池相关的东西抛不开`ThreadPoolExecutor`，本文就简单的说说这个`ThreadPoolExecutor`。

先看一个`ThreadPoolExecutor`的demo，然后我们说说它的相关参数

```java
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.RejectedExecutionHandler;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

public class Test {
	private static ThreadPoolExecutor threadPoolExecutor;

	public static void main(String[] args) {
		threadPoolExecutor = new ThreadPoolExecutor(
				4, 8, 0, TimeUnit.MICROSECONDS,
				new LinkedBlockingQueue<>(100), new RejectedExecutionHandler() {
			@Override
			public void rejectedExecution(Runnable r, ThreadPoolExecutor executor) {
			}
		});
		System.out.println(threadPoolExecutor.getCorePoolSize()); //4
		System.out.println(threadPoolExecutor.getMaximumPoolSize()); //8
		System.out.println(threadPoolExecutor.getPoolSize());//0
		boolean b = threadPoolExecutor.prestartCoreThread();
		System.out.println(threadPoolExecutor.getCorePoolSize());//4
		System.out.println(threadPoolExecutor.getMaximumPoolSize());//8
		System.out.println(threadPoolExecutor.getPoolSize());//1
		int i = threadPoolExecutor.prestartAllCoreThreads();
		System.out.println(threadPoolExecutor.getCorePoolSize());//4
		System.out.println(threadPoolExecutor.getMaximumPoolSize());//8
		System.out.println(threadPoolExecutor.getPoolSize());//4
	}
}
```

## 参数介绍

`ThreadPoolExecutor`的几个参数是必须要清楚的：

- corePoolSize
    - 线程池中的核心线程数
- maximumPoolSize
    - 线程池最大线程数，它表示在线程池中最多能创建多少个线程
- keepAliveTime
    - 线程池中非核心线程闲置超时时长（准确来说应该是没有任务执行时的回收时间）
    - 一个非核心线程，如果不干活(闲置状态)的时长超过这个参数所设定的时长，就会被销毁掉
    - 如果设置`allowCoreThreadTimeOut(boolean value)`，则会作用于核心线程, 也就是说当设置`allowCoreThreadTimeOut(true)`时，线程池中`corePoolSize`范围内的线程空闲时间达到`keepAliveTime`也将回收
- TimeUnit
    - 时间单位。可选的单位有分钟（MINUTES），秒（SECONDS），毫秒(MILLISECONDS) 等
- BlockingQueue
    - 任务的阻塞队列，缓存将要执行的`Runnable`任务，由各线程轮询该任务队列获取任务执行。可以选择以下几个阻塞队列
        - `ArrayBlockingQueue`：是一个基于数组结构的有界阻塞队列，此队列按 FIFO（先进先出）原则对元素进行排序。
        - `LinkedBlockingQueue`：一个基于链表结构的阻塞队列，此队列按FIFO （先进先出） 排序元素，静态工厂方法`Executors.newFixedThreadPool()`使用了这个队列。
        - `SynchronousQueue`：一个不存储元素的阻塞队列。**每个插入操作必须等到另一个线程调用移除操作，否则插入操作一直处于阻塞状态**，静态工厂方法`Executors.newCachedThreadPool`使用了这个队列。
        - `PriorityBlockingQueue`：一个具有优先级的无限阻塞队列。
      
- ThreadFactory
    - 线程创建的工厂。可以进行一些属性设置，比如线程名，优先级等等，有默认实现。
- RejectedExecutionHandler
    - 任务拒绝策略，当运行线程数已达到`maximumPoolSize`，并且队列也已经装满时会调用该参数拒绝任务，默认情况下是`AbortPolicy`，表示无法处理新任务时抛出异常。以下是JDK1.5提供的四种策略。
        - `AbortPolicy`：直接抛出异常, 这个是默认的拒绝策略。
        - `CallerRunsPolicy`：只用调用者所在线程来运行任务。
        - `DiscardOldestPolicy`：丢弃队列里最早的一个任务，并执行当前任务。
        - `DiscardPolicy`：不处理，丢弃掉。

## 运行原理

- 初始时，线程池中的线程数为0，这一点从上面的demo输出可以看到
- 当线程池中线程数小于`corePoolSize`时，新提交任务将创建一个新线程执行任务，即使此时线程池中存在空闲线程。
- 当线程池中线程数达到`corePoolSize`时，新提交任务将被放入`workQueue`中，等待线程池中任务调度执行 。
- 当`workQueue`已满，且`maximumPoolSize > corePoolSize`时，新提交任务会创建新线程执行任务。注意，**新手容易犯的一个错是使用的是无界的workQueue，导致workQueue一直满不了，进而无法继续创建线程**
- 当`workQueue`已满，且提交任务数超过`maximumPoolSize`，任务由`RejectedExecutionHandler`处理。
- 当线程池中线程数超过`corePoolSize`，且超过这部分的空闲时间达到`keepAliveTime`时，回收这些线程。
- 当设置`allowCoreThreadTimeOut(true)`时，线程池中`corePoolSize`范围内的线程空闲时间达到`keepAliveTime`也将回收。

### 一般流程图

![线程池的一般流程图](http://wenchao.ren/img/2020/11/20190830125745.png)

### newFixedThreadPool 流程图

```java
public static ExecutorService newFixedThreadPool(int nThreads){
    return new ThreadPoolExecutor(
            nThreads,   // corePoolSize
            nThreads,   // maximumPoolSize == corePoolSize
            0L,         // 空闲时间限制是 0
            TimeUnit.MILLISECONDS,
            new LinkedBlockingQueue<Runnable>() // 无界阻塞队列
        );
}
```

![newFixedThreadPool 流程图](http://wenchao.ren/img/2020/11/20190830125825.png)

### newCacheThreadPool 流程图

```java
public static ExecutorService newCachedThreadPool(){
    return new ThreadPoolExecutor(
        0,                  // corePoolSoze == 0
        Integer.MAX_VALUE,  // maximumPoolSize 非常大
        60L,                // 空闲判定是60 秒
        TimeUnit.SECONDS,
        // 神奇的无存储空间阻塞队列，每个 put 必须要等待一个 take
        new SynchronousQueue<Runnable>()  
    );
}
```

![newCacheThreadPool 流程图](http://wenchao.ren/img/2020/11/20190830125911.png)

### newSingleThreadPool 

```java
public static ExecutorService newSingleThreadExecutor() {
        return 
            new FinalizableDelegatedExecutorService
                (
                    new ThreadPoolExecutor
                        (
                            1,
                            1,
                            0L,
                            TimeUnit.MILLISECONDS,
                            new LinkedBlockingQueue<Runnable>(),
                            threadFactory
                        )
                );
    }
```

可以看到除了多了个`FinalizableDelegatedExecutorService` 代理，其初始化和`newFiexdThreadPool` 的`nThreads = 1`的时候是一样的。
区别就在于：

- `newSingleThreadExecutor`返回的`ExcutorService`在析构函数`finalize()`处会调用`shutdown()`
- 如果我们没有对它调用shutdown()，那么可以确保它在被回收时调用`shutdown()`来终止线程。
流程图略，请参考 newFiexdThreadPool，这里不再累赘。
