---
icon: page
author: xkrivzooh
date: 2019-12-27
sidebar: false
category:
  - post
tag:
  - java
---

# AttachNotSupportedException和jstack失败的常见原因

最近在公司升级Bistoury Agent时发现，有不少应用出AttachNotSupportedException异常：

```java
com.sun.tools.attach.AttachNotSupportedException: Unable to open socket file: target process not responding or HotSpot VM not loaded
        at sun.tools.attach.LinuxVirtualMachine.<init>(LinuxVirtualMachine.java:106) ~[tools.jar:na]
        at sun.tools.attach.LinuxAttachProvider.attachVirtualMachine(LinuxAttachProvider.java:78) ~[tools.jar:na]
        at com.sun.tools.attach.VirtualMachine.attach(VirtualMachine.java:250) ~[tools.jar:na]
        at qunar.tc.bistoury.commands.arthas.ArthasStarter.attachAgent(ArthasStarter.java:74) ~[bistoury-commands-1.4.22.jar:na]
        at qunar.tc.bistoury.commands.arthas.ArthasStarter.start(ArthasStarter.java:57) ~[bistoury-commands-1.4.22.jar:na]
        at qunar.tc.bistoury.commands.arthas.ArthasEntity.start(ArthasEntity.java:82) [bistoury-commands-1.4.22.jar:na]
```
但是这样应用的行为和监控指标都是特别正常的，此时如果给这些应用使用:`sudo -u tomcat jstack [pid]`（备注我们的应用是tomcat用户运行的）的话，会发现jstack
使用出问题，一个例子为：

```java
sudo -u tomcat /home/w/java/default/bin/jstack 691167
691167: Unable to open socket file: target process not responding or HotSpot VM not loaded
The -F option can be used when the target process is not responding
```

然后查看tomcat的catalina.out文件的话，会发现jstack的输出输出在这个文件中了。在经过一番google后发现是因为`/tmp`目录下面的`.java_pid[pid]`文件被删除了。
经过在我们公司服务器上实测，在删除/tmp/.java_pidxxxx文件以后，jstack此时就会出现上面的现象。然后agent也会attach失败。只能等应用重启暂时恢复。

接下来的问题就是为什么这个.java_pid文件会被删除，后来发现我们公司的centos7上面的`/usr/lib/tmpfiles.d/tmp.conf`中配置的会对`/tmp`目录下超过10天的文件进行删除。

现在我们已经让Ops同学统一调整这个删除逻辑了，针对.java_pid开头的文件在删除之前会检查一下是否存在这个pid进程。当对应的pid存在的时候就不进行删除，不存在在进行删除。


- [AttachNotSupportedException due to missing java_pid file in Attach API](https://stackoverflow.com/questions/5769877/attachnotsupportedexception-due-to-missing-java-pid-file-in-attach-api)
