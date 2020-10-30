---
title: 'zoopeeper Unexpected Exception: java.nio.channels.CancelledKeyException'
toc: true
date: 2019-02-18 12:20:17
tags: ['zk']
draft: false
---

在运维过程中zookeeper(版本：3.4.9)出现下面的异常：

```java
2019-02-18 11:12:04,043 [myid:] - ERROR [NIOServerCxn.Factory:0.0.0.0/0.0.0.0:2181:NIOServerCnxn@178] - Unexpected Exception:
java.nio.channels.CancelledKeyException
    at sun.nio.ch.SelectionKeyImpl.ensureValid(SelectionKeyImpl.java:73)
    at sun.nio.ch.SelectionKeyImpl.interestOps(SelectionKeyImpl.java:77)
    at org.apache.zookeeper.server.NIOServerCnxn.sendBuffer(NIOServerCnxn.java:151)
    at org.apache.zookeeper.server.ZooKeeperServer.finishSessionInit(ZooKeeperServer.java:663)
    at org.apache.zookeeper.server.ZooKeeperServer.revalidateSession(ZooKeeperServer.java:625)
    at org.apache.zookeeper.server.ZooKeeperServer.reopenSession(ZooKeeperServer.java:633)
    at org.apache.zookeeper.server.ZooKeeperServer.processConnectRequest(ZooKeeperServer.java:926)
    at org.apache.zookeeper.server.NIOServerCnxn.readConnectRequest(NIOServerCnxn.java:418)
    at org.apache.zookeeper.server.NIOServerCnxn.readPayload(NIOServerCnxn.java:198)
    at org.apache.zookeeper.server.NIOServerCnxn.doIO(NIOServerCnxn.java:244)
    at org.apache.zookeeper.server.NIOServerCnxnFactory.run(NIOServerCnxnFactory.java:203)
    at java.lang.Thread.run(Thread.java:745)
2019-02-18 11:12:04,100 [myid:] - ERROR [NIOServerCxn.Factory:0.0.0.0/0.0.0.0:2181:NIOServerCnxn@178] - Unexpected Exception:
java.nio.channels.CancelledKeyException
    at sun.nio.ch.SelectionKeyImpl.ensureValid(SelectionKeyImpl.java:73)
    at sun.nio.ch.SelectionKeyImpl.interestOps(SelectionKeyImpl.java:77)
    at org.apache.zookeeper.server.NIOServerCnxn.sendBuffer(NIOServerCnxn.java:151)
    at org.apache.zookeeper.server.ZooKeeperServer.finishSessionInit(ZooKeeperServer.java:663)
    at org.apache.zookeeper.server.ZooKeeperServer.revalidateSession(ZooKeeperServer.java:625)
    at org.apache.zookeeper.server.ZooKeeperServer.reopenSession(ZooKeeperServer.java:633)
    at org.apache.zookeeper.server.ZooKeeperServer.processConnectRequest(ZooKeeperServer.java:926)
    at org.apache.zookeeper.server.NIOServerCnxn.readConnectRequest(NIOServerCnxn.java:418)
    at org.apache.zookeeper.server.NIOServerCnxn.readPayload(NIOServerCnxn.java:198)
    at org.apache.zookeeper.server.NIOServerCnxn.doIO(NIOServerCnxn.java:244)
    at org.apache.zookeeper.server.NIOServerCnxnFactory.run(NIOServerCnxnFactory.java:203)
    at java.lang.Thread.run(Thread.java:745)
```

这个是这个版本的zookeeper的一个bug，具体参见：[https://issues.apache.org/jira/browse/ZOOKEEPER-1237](https://issues.apache.org/jira/browse/ZOOKEEPER-1237)

官方也给出了fix的patch:

```java
diff -uwp zookeeper-3.4.5/src/java/main/org/apache/zookeeper/server/NIOServerCnxn.java.ZK1237 zookeeper-3.4.5/src/java/main/org/apache/zookeeper/server/NIOServerCnxn.java
--- zookeeper-3.4.5/src/java/main/org/apache/zookeeper/server/NIOServerCnxn.java.ZK1237 2012-09-30 10:53:32.000000000 -0700
+++ zookeeper-3.4.5/src/java/main/org/apache/zookeeper/server/NIOServerCnxn.java    2013-08-07 13:20:19.227152865 -0700
@@ -150,7 +150,8 @@ public class NIOServerCnxn extends Serve
                 // We check if write interest here because if it is NOT set,
                 // nothing is queued, so we can try to send the buffer right
                 // away without waking up the selector
-                if ((sk.interestOps() & SelectionKey.OP_WRITE) == 0) {
+                if (sk.isValid() &&
+                    (sk.interestOps() & SelectionKey.OP_WRITE) == 0) {
                     try {
                         sock.write(bb);
                     } catch (IOException e) {
@@ -214,14 +215,18 @@ public class NIOServerCnxn extends Serve
  
                 return;
             }
-            if (k.isReadable()) {
+            if (k.isValid() && k.isReadable()) {
                 int rc = sock.read(incomingBuffer);
                 if (rc < 0) {
-                    throw new EndOfStreamException(
+                    if (LOG.isDebugEnabled()) {
+                        LOG.debug(
                             "Unable to read additional data from client sessionid 0x"
                             + Long.toHexString(sessionId)
                             + ", likely client has closed socket");
                 }
+                    close();
+                    return;
+                }
                 if (incomingBuffer.remaining() == 0) {
                     boolean isPayload;
                     if (incomingBuffer == lenBuffer) { // start of next request
@@ -242,7 +247,7 @@ public class NIOServerCnxn extends Serve
                     }
                 }
             }
-            if (k.isWritable()) {
+            if (k.isValid() && k.isWritable()) {
                 // ZooLog.logTraceMessage(LOG,
                 // ZooLog.CLIENT_DATA_PACKET_TRACE_MASK
                 // "outgoingBuffers.size() = " +
```

这个bug在zookeeper的3.4.10中已经解决。所以建议大家使用最新版的zookeeper






