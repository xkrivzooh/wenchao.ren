---
title: Netty如何检测ByteBuf没有release
toc: true
date: 2020-06-01 23:31:56
tags: ['java', 'netty']
draft: false
---

Netty中的`ByteBuf`算是中间件开发中比较常用的API了，一般我们会使用`PooledByteBuf`来提升性能，但是这个玩意需要我们使用以后手动进行release，如果有时候忘记手动释放的话，会出现内存泄漏。
而且这种问题一般也没那么方便的排查。不过非常幸运的是Netty已经帮我们考虑到了这个问题，它提供了自己的检测工具:

- `ResourceLeakDetector`
- `ResourceLeakTracker`

## 基本思想

他的实现原理很巧妙，不过我们先不着急说Netty的实现，我们先想想如果我们自己来弄，我们一般会面临下面3个问题：

- 被检测的对象创建的时候，我们就需要知道他创建了，然后做一些操作，比如该标记就标记，该计数就计数，
- 对象「无用」的时候，我们也需要知道这个时刻。这里的「无用」一般我们选择对象被GC时
- 我们还需要一种机制来判断对象在被GC之前有没有调用某个操作，比如release或者close操作。

下面以netty 4.0.46版本来说哈。

- 第一个问题其实很好实现，在对象的构造函数中我们就可以做这些事情，因为对象的构造函数执行的时候，就是他被创建的时候
- 第二个问题，Netty是利用了Java中的`java.lang.ref.PhantomReference`和引用队列这个东西。`java.lang.ref.PhantomReference`有叫`虚引用`也有叫做`幽灵引用`的，叫法无所谓，它和`软引用（SoftReference）`、`弱引用（WeakReference）`不同，它并不影响对象的生命周期，如果一个对象与`java.lang.ref.PhantomReference`关联，则跟没有引用与之关联一样，在任何时候都可能被垃圾回收器回收。而且除过强引用之外，剩余的3种引用类型都有一个引用队列可以与之配合。当java清理调用不必要的引用后，会将这个引用本身（不是引用指向的值对象）添加到队列之中。比如你看`PhantomReference`的定义：

```java
package java.lang.ref;


/**
 * Phantom reference objects, which are enqueued after the collector
 * determines that their referents may otherwise be reclaimed.  Phantom
 * references are most often used for scheduling pre-mortem cleanup actions in
 * a more flexible way than is possible with the Java finalization mechanism.
 *
 * <p> If the garbage collector determines at a certain point in time that the
 * referent of a phantom reference is <a
 * href="package-summary.html#reachability">phantom reachable</a>, then at that
 * time or at some later time it will enqueue the reference.
 *
 * <p> In order to ensure that a reclaimable object remains so, the referent of
 * a phantom reference may not be retrieved: The <code>get</code> method of a
 * phantom reference always returns <code>null</code>.
 *
 * <p> Unlike soft and weak references, phantom references are not
 * automatically cleared by the garbage collector as they are enqueued.  An
 * object that is reachable via phantom references will remain so until all
 * such references are cleared or themselves become unreachable.
 *
 * @author   Mark Reinhold
 * @since    1.2
 */

public class PhantomReference<T> extends Reference<T> {

    /**
     * Returns this reference object's referent.  Because the referent of a
     * phantom reference is always inaccessible, this method always returns
     * <code>null</code>.
     *
     * @return  <code>null</code>
     */
    public T get() {
        return null;
    }

    /**
     * Creates a new phantom reference that refers to the given object and
     * is registered with the given queue.
     *
     * <p> It is possible to create a phantom reference with a <tt>null</tt>
     * queue, but such a reference is completely useless: Its <tt>get</tt>
     * method will always return null and, since it does not have a queue, it
     * will never be enqueued.
     *
     * @param referent the object the new phantom reference will refer to
     * @param q the queue with which the reference is to be registered,
     *          or <tt>null</tt> if registration is not required
     */
    public PhantomReference(T referent, ReferenceQueue<? super T> q) {
        super(referent, q);
    }

}
```

最下面的这个构造函数可以传递一个引用队列`ReferenceQueue`进去。

而借助这个`PhantomReference`和引用队列，我们其实可以知道对象啥时候「无用」了。因为我们只要在这个队列中的对象，其实都是被GC了的。
- 上面的第三个问题其实比较好做，我们可以在对象内部维护状态之类的，就可以非常简单的解决这个问题。


## 源码相关说明

在`io.netty.util.HashedWheelTimer`中其实就使用了`ResourceLeakDetector`。我们就以这个类简单的来说一下他的用法：

```java
public class HashedWheelTimer implements Timer {

    private static final ResourceLeakDetector<HashedWheelTimer> leakDetector = ResourceLeakDetectorFactory.instance()
            .newResourceLeakDetector(HashedWheelTimer.class, 1);
    private final ResourceLeakTracker<HashedWheelTimer> leak;

        /**
     * Creates a new timer.
     *
     * @param threadFactory        a {@link ThreadFactory} that creates a
     *                             background {@link Thread} which is dedicated to
     *                             {@link TimerTask} execution.
     * @param tickDuration         the duration between tick
     * @param unit                 the time unit of the {@code tickDuration}
     * @param ticksPerWheel        the size of the wheel
     * @param leakDetection        {@code true} if leak detection should be enabled always,
     *                             if false it will only be enabled if the worker thread is not
     *                             a daemon thread.
     * @param  maxPendingTimeouts  The maximum number of pending timeouts after which call to
     *                             {@code newTimeout} will result in
     *                             {@link java.util.concurrent.RejectedExecutionException}
     *                             being thrown. No maximum pending timeouts limit is assumed if
     *                             this value is 0 or negative.
     * @throws NullPointerException     if either of {@code threadFactory} and {@code unit} is {@code null}
     * @throws IllegalArgumentException if either of {@code tickDuration} and {@code ticksPerWheel} is &lt;= 0
     */
    public HashedWheelTimer(
            ThreadFactory threadFactory,
            long tickDuration, TimeUnit unit, int ticksPerWheel, boolean leakDetection,
            long maxPendingTimeouts) {

        if (threadFactory == null) {
            throw new NullPointerException("threadFactory");
        }
        if (unit == null) {
            throw new NullPointerException("unit");
        }
        if (tickDuration <= 0) {
            throw new IllegalArgumentException("tickDuration must be greater than 0: " + tickDuration);
        }
        if (ticksPerWheel <= 0) {
            throw new IllegalArgumentException("ticksPerWheel must be greater than 0: " + ticksPerWheel);
        }

        // Normalize ticksPerWheel to power of two and initialize the wheel.
        wheel = createWheel(ticksPerWheel);
        mask = wheel.length - 1;

        // Convert tickDuration to nanos.
        this.tickDuration = unit.toNanos(tickDuration);

        // Prevent overflow.
        if (this.tickDuration >= Long.MAX_VALUE / wheel.length) {
            throw new IllegalArgumentException(String.format(
                    "tickDuration: %d (expected: 0 < tickDuration in nanos < %d",
                    tickDuration, Long.MAX_VALUE / wheel.length));
        }
        workerThread = threadFactory.newThread(worker);

        //注意看这里，这里其实就是根据参数和workerThread来判断是否检测
        leak = leakDetection || !workerThread.isDaemon() ? leakDetector.track(this) : null;

        this.maxPendingTimeouts = maxPendingTimeouts;

        if (INSTANCE_COUNTER.incrementAndGet() > INSTANCE_COUNT_LIMIT &&
            WARNED_TOO_MANY_INSTANCES.compareAndSet(false, true)) {
            reportTooManyInstances();
        }
    }



    @Override
    public Set<Timeout> stop() {
        if (Thread.currentThread() == workerThread) {
            throw new IllegalStateException(
                    HashedWheelTimer.class.getSimpleName() +
                            ".stop() cannot be called from " +
                            TimerTask.class.getSimpleName());
        }

        if (!WORKER_STATE_UPDATER.compareAndSet(this, WORKER_STATE_STARTED, WORKER_STATE_SHUTDOWN)) {
            // workerState can be 0 or 2 at this moment - let it always be 2.
            if (WORKER_STATE_UPDATER.getAndSet(this, WORKER_STATE_SHUTDOWN) != WORKER_STATE_SHUTDOWN) {
                INSTANCE_COUNTER.decrementAndGet();
                if (leak != null) {
                    //关闭监听，触发内部操作
                    boolean closed = leak.close(this);
                    assert closed;
                }
            }

            return Collections.emptySet();
        }

        try {
            boolean interrupted = false;
            while (workerThread.isAlive()) {
                workerThread.interrupt();
                try {
                    workerThread.join(100);
                } catch (InterruptedException ignored) {
                    interrupted = true;
                }
            }

            if (interrupted) {
                Thread.currentThread().interrupt();
            }
        } finally {
            INSTANCE_COUNTER.decrementAndGet();
            if (leak != null) {
                //关闭监听，触发内部操作
                boolean closed = leak.close(this);
                assert closed;
            }
        }
        return worker.unprocessedTimeouts();
    }


    //其他代码...

}
```


上面的代码省略了无关的部分，从中我们可以看到如何使用`ResourceLeakDetector`和`ResourceLeakTracker`。

首先提一下ResourceLeakDetector#Level有4个级别：

- DISABLED 这种模式下不进行泄露监控。
- SIMPLE 这种模式下以1/128的概率抽取ByteBuf进行泄露监控。
- ADVANCED 在SIMPLE的基础上，每一次对ByteBuf的调用都会尝试记录调用轨迹，消耗较大
- PARANOID 在ADVANCED的基础上，对每一个ByteBuf都进行泄露监控，消耗最大。

一般而言，在项目的初期使用SIMPLE模式进行监控，如果没有问题一段时间后就可以关闭。否则升级到ADVANCED或者PARANOID模式尝试确认泄露位置。
这一点可以给大家平时开发设计开发提一个醒，就是最好每一个功能有开关，尽量支持动态升级和降级，同时要辅有排查问题的辅助代码，这种手段在设计中间件client的时候需要经常用到。

可以通过JVM参数`-Dio.netty.leakDetection.level=PARANOID`来设置级别。

不过的级别有不同的行为，这部分代码在`ResourceLeakDetector#track0`中：

```java
    private DefaultResourceLeak track0(T obj) {
        Level level = ResourceLeakDetector.level;
        if (level == Level.DISABLED) {
            return null;
        }

        if (level.ordinal() < Level.PARANOID.ordinal()) {
            if ((PlatformDependent.threadLocalRandom().nextInt(samplingInterval)) == 0) {
                reportLeak(level);
                return new DefaultResourceLeak(obj);
            } else {
                return null;
            }
        } else {
            reportLeak(level);
            return new DefaultResourceLeak(obj);
        }
    }
```

这里其实就是完成我一开始说的第一步操作，我们从`HashedWheelTimer`的构造函数中可以看到，就是在构造函数里面调用的`ResourceLeakDetector#track`方法进而调用到`trace0`方法。这样就可以
知道对象创建的时机，然后在`DefaultResourceLeak`的实现中：

```java
//继承了PhantomReference
  private final class DefaultResourceLeak extends PhantomReference<Object> implements ResourceLeakTracker<T>,
            ResourceLeak {
                //代码的创建位置
        private final String creationRecord;
        //最近几次访问的位置
        private final Deque<String> lastRecords = new ArrayDeque<String>();
        //被检测对象的hash，因为不能持有对象引用，否则不能gc
        private final int trackedHash;

        private int removedRecords;

        DefaultResourceLeak(Object referent) {
            super(referent, refQueue);

            assert referent != null;

            // Store the hash of the tracked object to later assert it in the close(...) method.
            // It's important that we not store a reference to the referent as this would disallow it from
            // be collected via the PhantomReference.
            trackedHash = System.identityHashCode(referent);

            Level level = getLevel();
            if (level.ordinal() >= Level.ADVANCED.ordinal()) {
                //newRecord其实就是获取对象创建的位置
                creationRecord = newRecord(null, 3);
            } else {
                creationRecord = null;
            }
            allLeaks.put(this, LeakEntry.INSTANCE);
        }
```

上面的`newRecord`其实就是获取对象创建的位置，一般我们动态的获取代码位置，都是通过`StackTraceElement[] array = new Throwable().getStackTrace();`然后来处理这个StackTraceElement数组。

Netty在实现这里的时候，使用了装饰器模式 ? 包装器模式（无所谓了），看这几个类就好了：

- SimpleLeakAwareByteBuf
- SimpleLeakAwareCompositeByteBuf
- AdvancedLeakAwareByteBuf
- AdvancedLeakAwareCompositeByteBuf

在文章最初说的第三个「我们还需要一种机制来判断对象在被GC之前有没有调用某个操作，比如release或者close操作。」，Netty这里是在`ResourceLeakDetector`中维护了一个
`private final ConcurrentMap<DefaultResourceLeak, LeakEntry> allLeaks = PlatformDependent.newConcurrentHashMap();` 每次对象close或者release的时候，从这里移除就好了。
这样就不需要每个对象都有一个是否close或者是否release的状态位了。

有了上面的讲解，只要可以从引用队列拿出属性，然后看看这个allLeaks中有没有他的位置，那么就可以知道这个对象是否调用过某个操作，比如是否调用过release操作。

更详细的我懒得写了，大家自己看代码吧。也可以看看[Netty如何监控内存泄露](https://juejin.im/post/5d903c97e51d457810073dda)