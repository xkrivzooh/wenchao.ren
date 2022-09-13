---
icon: page
author: xkrivzooh
sidebar: false
date: 2019-09-02
category:
  - post
tag:
  - java
---

# Synchronized的一些东西

`synchronized`是Java中解决并发问题的一种最常用的方法，从语法上讲synchronized总共有三种用法：

- 修饰普通方法
- 修饰静态方法
- 修饰代码块

## synchronized 原理

为了查看synchronized的原理，我们首先反编译一下下面的代码, 这是一个synchronized修饰代码块的demo

```java
public class SynchronizedDemo {
    public void method() {
        synchronized (this) {
            System.out.println("Method 1 start");
        }
    }
}
```

![http://wenchao.ren/img/2020/11/20190902124248.png](http://wenchao.ren/img/2020/11/20190902124248.png)

从上面截图可以看到，synchronized的实现依赖2个指令：

- monitorenter
- monitorexit

但是从上面的截图可以看到有一个`monitorenter`和2个`monitorexit`，这里之所以有2个`monitorexit`是因为`synchronized`的锁释放有2种情况：

- 方法正常执行完毕`synchronized`的范围，也就是正常情况下的锁释放
- `synchronized`圈起来的范围内的代码执行抛出异常，导致锁释放

### monitorenter

关于这个指令，jvm中的描述为：

> Each object is associated with a monitor. A monitor is locked if and only if it has an owner. The thread that executes monitorenter attempts to gain ownership of the monitor associated with objectref, as follows:

> • If the entry count of the monitor associated with objectref is zero, the thread enters the monitor and sets its entry count to one. The thread is then the owner of the monitor.
> • If the thread already owns the monitor associated with objectref, it reenters the monitor, incrementing its entry count.
> • If another thread already owns the monitor associated with objectref, the thread blocks until the monitor's entry count is zero, then tries again to gain ownership.

翻译一下大概为：

每个对象有一个监视器锁（`monitor`）。当monitor被占用时就会处于锁定状态，线程执行`monitorenter`指令时尝试获取monitor的所有权，过程如下：
- 如果monitor的进入数为0，则该线程进入monitor，然后将进入数设置为1，该线程即为monitor的所有者。
- 如果线程已经占有该monitor，只是重新进入，则进入monitor的进入数加1.
- 如果其他线程已经占用了monitor，则该线程进入阻塞状态，直到monitor的进入数为0，再重新尝试获取monitor的所有权。

### monitorexit

> The thread that executes monitorexit must be the owner of the monitor associated with the instance referenced by objectref.
> The thread decrements the entry count of the monitor associated with objectref. If as a result the value of the entry count is zero, the thread exits the monitor and is no longer its owner. Other threads that are blocking to enter the monitor are allowed to attempt to do so.

翻译一下为：

> 执行monitorexit的线程必须是objectref所对应的monitor的所有者。
> 指令执行时，monitor的进入数减1，如果减1后进入数为0，那线程退出monitor，不再是这个monitor的所有者。其他被这个monitor阻塞的线程可以尝试去获取这个 monitor 的所有权。 

通过这两段描述，我们应该能很清楚的看出Synchronized的实现原理，Synchronized的语义底层是通过一个monitor的对象来完成，其实`wait/notify`等方法也依赖于monitor对象，这就是为什么只有在同步的块或者方法中才能调用wait/notify等方法，否则会抛出`java.lang.IllegalMonitorStateException`的异常的原因。

上面的demo是使用synchronized修饰代码块的demo，下面我们看一个使用synchronized修饰方法的demo：

```java
public class SynchronizedMethod {
    public synchronized void method() {
        System.out.println("Hello World!");
    }
}
```

我们继续对这个类进行反编译：

![http://wenchao.ren/img/2020/11/20190902125437.png](http://wenchao.ren/img/2020/11/20190902125437.png)

从反编译的结果来看，方法的同步并没有通过指令`monitorenter`和`monitorexit`来完成（虽然理论上其实也可以通过这两条指令来实现），不过相对于普通方法，其常量池中多了`ACC_SYNCHRONIZED`标示符。JVM就是根据该标示符来实现方法的同步的：

- 当方法调用时，调用指令将会检查方法的 `ACC_SYNCHRONIZED` 访问标志是否被设置，如果设置了，执行线程将先获取monitor，获取成功之后才能执行方法体，方法执行完后再释放monitor。
- 在方法执行期间，其他任何线程都无法再获得同一个`monitor`对象。 其实本质上没有区别，只是方法的同步是一种隐式的方式来实现，无需通过字节码来完成。


## 观城模型

## Synchronized 锁升级

这四种锁是指锁的状态，专门针对`synchronized`的。在介绍这四种锁状态之前还需要介绍一些额外的知识。

首先为什么Synchronized能实现线程同步？在回答这个问题之前我们需要了解两个重要的概念：**Java对象头**和 **Monitor**。

### Java对象头
synchronized是悲观锁，在操作同步资源之前需要给同步资源先加锁，这把锁就是存在Java对象头里的，而Java对象头又是什么呢？
我们以Hotspot虚拟机为例，**Hotspot的对象头主要包括两部分数据：Mark Word（标记字段）、Klass Pointer（类型指针）**。如下面的一个示例：

![java object示意图](http://wenchao.ren/img/2020/11/20190903122107.png)

我们以64位虚拟机来说，object header的结构为：

```java
|------------------------------------------------------------------------------------------------------------|--------------------|
|                                            Object Header (128 bits)                                        |        State       |
|------------------------------------------------------------------------------|-----------------------------|--------------------|
|                                  Mark Word (64 bits)                         |    Klass Word (64 bits)     |                    |
|------------------------------------------------------------------------------|-----------------------------|--------------------|
| unused:25 | identity_hashcode:31 | unused:1 | age:4 | biased_lock:1 | lock:2 |    OOP to metadata object   |       Normal       |
|------------------------------------------------------------------------------|-----------------------------|--------------------|
| thread:54 |       epoch:2        | unused:1 | age:4 | biased_lock:1 | lock:2 |    OOP to metadata object   |       Biased       |
|------------------------------------------------------------------------------|-----------------------------|--------------------|
|                       ptr_to_lock_record:62                         | lock:2 |    OOP to metadata object   | Lightweight Locked |
|------------------------------------------------------------------------------|-----------------------------|--------------------|
|                     ptr_to_heavyweight_monitor:62                   | lock:2 |    OOP to metadata object   | Heavyweight Locked |
|------------------------------------------------------------------------------|-----------------------------|--------------------|
|                                                                     | lock:2 |    OOP to metadata object   |    Marked for GC   |
|------------------------------------------------------------------------------|-----------------------------|--------------------|
```

#### Mark Word

`Mark Word`默认存储:
- 对象的HashCode
- 分代年龄
- 锁标志位信息

这些信息都是与对象自身定义无关的数据，所以`Mark Word`被设计成一个非固定的数据结构以便在极小的空间内存存储尽量多的数据。它会根据对象的状态复用自己的存储空间，也就是说在运行期间`Mark Word`里存储的数据会随着锁标志位的变化而变化。

![](http://wenchao.ren/img/2020/11/20190903122601.png)

#### Klass Point

Klass Point：对象指向它的类元数据的指针，虚拟机通过这个指针来确定这个对象是哪个类的实例。

### Monitor

Monitor可以理解为一个同步工具或一种同步机制，通常被描述为一个对象。每一个Java对象就有一把看不见的锁，称为内部锁或者Monitor锁。
Monitor是线程私有的数据结构，每一个线程都有一个可用`monitor record`列表，同时还有一个全局的可用列表。每一个被锁住的对象都会和一个monitor关联，同时monitor中有一个Owner字段存放拥有该锁的线程的唯一标识，表示该锁被这个线程占用。

synchronized通过Monitor来实现线程同步，Monitor是依赖于底层的操作系统的`Mutex Lock（互斥锁）`来实现的线程同步。

synchronized最初实现同步的方式是`阻塞或唤醒一个Java线程需要操作系统切换CPU状态来完成，这种状态转换需要耗费处理器时间。如果同步代码块中的内容过于简单，状态转换消耗的时间有可能比用户代码执行的时间还要长`，这就是JDK 6之前synchronized效率低的原因。**这种依赖于操作系统Mutex Lock所实现的锁我们称之为“重量级锁”**，JDK 6中为了减少获得锁和释放锁带来的性能消耗，引入了“偏向锁”和“轻量级锁”。

所以目前 **锁一共有4种状态，级别从低到高依次是：无锁、偏向锁、轻量级锁和重量级锁。锁状态只能升级不能降级**。

下面是出四种锁状态对应的的Mark Word内容，然后再分别讲解四种锁状态的思路以及特点：

![](http://wenchao.ren/img/2020/11/20190903124139.png)

![](http://wenchao.ren/img/2020/11/20190903122952.png)

 上下两幅图对照着看，我们就能够清楚的知道在不同的锁状态下，mack word区域存储的内容的不同了。


### 无锁

无锁没有对资源进行锁定，所有的线程都能访问并修改同一个资源，但同时只有一个线程能修改成功。

无锁的特点就是修改操作在循环内进行，线程会不断的尝试修改共享资源。如果没有冲突就修改成功并退出，否则就会继续循环尝试。如果有多个线程修改同一个值，必定会有一个线程能修改成功，而其他修改失败的线程会不断重试直到修改成功。CAS原理及应用即是无锁的实现。无锁无法全面代替有锁，但无锁在某些场合下的性能是非常高的。

### 偏向锁

偏向锁是指一段同步代码一直被一个线程所访问，那么该线程会自动获取锁，降低获取锁的代价。

**在大多数情况下，锁总是由同一线程多次获得，不存在多线程竞争，所以出现了偏向锁。其目标就是在只有一个线程执行同步代码块时能够提高性能。**，也就是说偏向锁一般是一个线程的事情

当一个线程访问同步代码块并获取锁时，会在Mark Word里存储锁偏向的线程ID。在线程进入和退出同步块时不再通过CAS操作来加锁和解锁，而是检测Mark Word里是否存储着指向当前线程的偏向锁。**引入偏向锁是为了在无多线程竞争的情况下尽量减少不必要的轻量级锁执行路径，因为轻量级锁的获取及释放依赖多次CAS原子指令，而偏向锁只需要在置换ThreadID的时候依赖一次CAS原子指令即可。**

**偏向锁只有遇到其他线程尝试竞争偏向锁时，持有偏向锁的线程才会释放锁，线程不会主动释放偏向锁。偏向锁的撤销，需要等待全局安全点（在这个时间点上没有字节码正在执行），它会首先暂停拥有偏向锁的线程，判断锁对象是否处于被锁定状态。撤销偏向锁后恢复到无锁（标志位为“01”）或轻量级锁（标志位为“00”）的状态。**

**偏向锁在JDK 6及以后的JVM里是默认启用的**。可以通过JVM参数关闭偏向锁：`-XX:-UseBiasedLocking=false`，关闭之后程序默认会进入轻量级锁状态。

### 轻量级锁

**轻量级锁是指当锁是偏向锁的时候，被另外的线程所访问，偏向锁就会升级为轻量级锁，其他线程会通过自旋的形式尝试获取锁，不会阻塞，从而提高性能。**因此一般情况下轻量级锁大多数是2个线程的事情。

在代码进入同步块的时候，如果同步对象锁状态为无锁状态（锁标志位为“01”状态，是否为偏向锁为“0”），虚拟机首先将在当前线程的栈帧中建立一个名为锁记录（`Lock Record`）的空间，用于存储锁对象目前的Mark Word的拷贝，然后拷贝对象头中的Mark Word复制到锁记录中。

拷贝成功后，虚拟机将使用CAS操作尝试将对象的Mark Word更新为指向Lock Record的指针，并将Lock Record里的owner指针指向对象的Mark Word。

- 如果这个更新动作成功了，那么这个线程就拥有了该对象的锁，并且对象Mark Word的锁标志位设置为“00”，表示此对象处于轻量级锁定状态。
- 如果轻量级锁的更新操作失败了，虚拟机首先会检查对象的Mark Word是否指向当前线程的栈帧，如果是就说明当前线程已经拥有了这个对象的锁，那就可以直接进入同步块继续执行，否则说明多个线程竞争锁。

若当前只有一个等待线程，则该线程通过自旋进行等待。但是当自旋超过一定的次数，或者一个线程在持有锁，一个在自旋，又有第三个来访时，轻量级锁升级为重量级锁。

### 重量级锁

升级为重量级锁时，锁标志的状态值变为“10”，此时Mark Word中存储的是指向重量级锁的指针，此时等待锁的线程都会进入阻塞状态。

整体的锁状态升级流程如下：

无锁  ->   偏向锁   -> 轻量级锁   ->    重量级锁


![](http://wenchao.ren/img/2020/11/20190903124238.png)


综上，**偏向锁通过对比Mark Word解决加锁问题，避免执行CAS操作。而轻量级锁是通过用CAS操作和自旋来解决加锁问题，避免线程阻塞和唤醒而影响性能。重量级锁是将除了拥有锁的线程以外的线程都阻塞。**

## 参考资料

- [java object header](https://gist.github.com/arturmkrtchyan/43d6135e8a15798cc46c)
- [Java性能 -- synchronized锁升级优化](http://zhongmingmao.me/2019/08/15/java-performance-synchronized-opt/)
- [不可不说的Java“锁”事](https://tech.meituan.com/2018/11/15/java-lock.html)
