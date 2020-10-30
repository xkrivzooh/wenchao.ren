---
title: 不规范的查询导致elasticsearch StackOverflowError
toc: true
date: 2019-08-06 19:04:33
tags: ['es']
draft: false
---

昨天我们公司的elasticsearch的集群有几个节点出现了`StackOverflowError`，然后es进程退出的问题。最终排查发现导致es节点出现下面的异常：

```java
[2019-08-05T20:31:35,367][ERROR][o.e.b.ElasticsearchUncaughtExceptionHandler] [order6] fatal error in thread [elasticsearch[order6][search][T#38]], exiting
java.lang.StackOverflowError: null
	at org.apache.lucene.store.DataInput.readVLong(DataInput.java:184) ~[lucene-core-6.3.0.jar:6.3.0 a66a44513ee8191e25b477372094bfa846450316 - shalin - 2016-11-02 19:47:11]
	at org.apache.lucene.store.DataInput.readVLong(DataInput.java:169) ~[lucene-core-6.3.0.jar:6.3.0 a66a44513ee8191e25b477372094bfa846450316 - shalin - 2016-11-02 19:47:11]
	at org.apache.lucene.util.fst.FST.readUnpackedNodeTarget(FST.java:931) ~[lucene-core-6.3.0.jar:6.3.0 a66a44513ee8191e25b477372094bfa846450316 - shalin - 2016-11-02 19:47:11]
	at org.apache.lucene.util.fst.FST.readNextRealArc(FST.java:1143) ~[lucene-core-6.3.0.jar:6.3.0 a66a44513ee8191e25b477372094bfa846450316 - shalin - 2016-11-02 19:47:11]
	at org.apache.lucene.util.fst.FST.readFirstRealTargetArc(FST.java:992) ~[lucene-core-6.3.0.jar:6.3.0 a66a44513ee8191e25b477372094bfa846450316 - shalin - 2016-11-02 19:47:11]
	at org.apache.lucene.util.fst.FST.findTargetArc(FST.java:1270) ~[lucene-core-6.3.0.jar:6.3.0 a66a44513ee8191e25b477372094bfa846450316 - shalin - 2016-11-02 19:47:11]
	at org.apache.lucene.util.fst.FST.findTargetArc(FST.java:1186) ~[lucene-core-6.3.0.jar:6.3.0 a66a44513ee8191e25b477372094bfa846450316 - shalin - 2016-11-02 19:47:11]
	at org.apache.lucene.codecs.blocktree.SegmentTermsEnum.seekExact(SegmentTermsEnum.java:483) ~[lucene-core-6.3.0.jar:6.3.0 a66a44513ee8191e25b477372094bfa846450316 - shalin - 2016-11-02 19:47:11]
	at org.apache.lucene.search.TermQuery$TermWeight.getTermsEnum(TermQuery.java:132) ~[lucene-core-6.3.0.jar:6.3.0 a66a44513ee8191e25b477372094bfa846450316 - shalin - 2016-11-02 19:47:11]
	at org.apache.lucene.search.TermQuery$TermWeight.scorer(TermQuery.java:100) ~[lucene-core-6.3.0.jar:6.3.0 a66a44513ee8191e25b477372094bfa846450316 - shalin - 2016-11-02 19:47:11]
	at org.apache.lucene.search.LRUQueryCache$CachingWrapperWeight.scorer(LRUQueryCache.java:746) ~[lucene-core-6.3.0.jar:6.3.0 a66a44513ee8191e25b477372094bfa846450316 - shalin - 2016-11-02 19:47:11]
	at org.elasticsearch.indices.IndicesQueryCache$CachingWeightWrapper.scorer(IndicesQueryCache.java:155) ~[elasticsearch-5.1.1.jar:5.1.1]
	at org.apache.lucene.search.BooleanWeight.scorer(BooleanWeight.java:389) ~[lucene-core-6.3.0.jar:6.3.0 a66a44513ee8191e25b477372094bfa846450316 - shalin - 2016-11-02 19:47:11]
	at org.apache.lucene.search.LRUQueryCache$CachingWrapperWeight.scorer(LRUQueryCache.java:746) ~[lucene-core-6.3.0.jar:6.3.0 a66a44513ee8191e25b477372094bfa846450316 - shalin - 2016-11-02 19:47:11]
	at org.elasticsearch.indices.IndicesQueryCache$CachingWeightWrapper.scorer(IndicesQueryCache.java:155) ~[elasticsearch-5.1.1.jar:5.1.1]
	at org.apache.lucene.search.BooleanWeight.scorer(BooleanWeight.java:389) ~[lucene-core-6.3.0.jar:6.3.0 a66a44513ee8191e25b477372094bfa846450316 - shalin - 2016-11-02 19:47:11]
	at org.apache.lucene.search.LRUQueryCache$CachingWrapperWeight.scorer(LRUQueryCache.java:746) ~[lucene-core-6.3.0.jar:6.3.0 a66a44513ee8191e25b477372094bfa846450316 - shalin - 2016-11-02 19:47:11]
	at org.elasticsearch.indices.IndicesQueryCache$CachingWeightWrapper.scorer(IndicesQueryCache.java:155) ~[elasticsearch-5.1.1.jar:5.1.1]
	at org.apache.lucene.search.BooleanWeight.scorer(BooleanWeight.java:389) ~[lucene-core-6.3.0.jar:6.3.0 a66a44513ee8191e25b477372094bfa846450316 - shalin - 2016-11-02 19:47:11]
	at org.apache.lucene.search.LRUQueryCache$CachingWrapperWeight.scorer(LRUQueryCache.java:746) ~[lucene-core-6.3.0.jar:6.3.0 a66a44513ee8191e25b477372094bfa846450316 - shalin - 2016-11-02 19:47:11]
```

我们排查后发现是业务方的程序出现bug，导致where条件组装出错，where条件的存在非常深的嵌套，进而导致es节点在处理请求的时候出现`java.lang.StackOverflowError`异常。

这件事情中让我好奇的是一个请求导致的`java.lang.StackOverflowError`直接导致es的进程退出，后来看了一下es的代码发现在`org.elasticsearch.bootstrap.ElasticsearchUncaughtExceptionHandler`类中存在如下的代码：

```java
class ElasticsearchUncaughtExceptionHandler implements Thread.UncaughtExceptionHandler {

    private final Supplier<String> loggingPrefixSupplier;

    ElasticsearchUncaughtExceptionHandler(final Supplier<String> loggingPrefixSupplier) {
        this.loggingPrefixSupplier = Objects.requireNonNull(loggingPrefixSupplier);
    }

    @Override
    public void uncaughtException(Thread t, Throwable e) {
        if (isFatalUncaught(e)) {
            try {
                onFatalUncaught(t.getName(), e);
            } finally {
                // we use specific error codes in case the above notification failed, at least we
                // will have some indication of the error bringing us down
                if (e instanceof InternalError) {
                    halt(128);
                } else if (e instanceof OutOfMemoryError) {
                    halt(127);
                } else if (e instanceof StackOverflowError) {
                    halt(126);
                } else if (e instanceof UnknownError) {
                    halt(125);
                } else if (e instanceof IOError) {
                    halt(124);
                } else {
                    halt(1);
                }
            }
        } else {
            onNonFatalUncaught(t.getName(), e);
        }
    }

    static boolean isFatalUncaught(Throwable e) {
        return e instanceof Error;
    }

    void onFatalUncaught(final String threadName, final Throwable t) {
        final Logger logger = Loggers.getLogger(ElasticsearchUncaughtExceptionHandler.class, loggingPrefixSupplier.get());
        logger.error(
            (org.apache.logging.log4j.util.Supplier<?>)
                () -> new ParameterizedMessage("fatal error in thread [{}], exiting", threadName), t);
    }

    void onNonFatalUncaught(final String threadName, final Throwable t) {
        final Logger logger = Loggers.getLogger(ElasticsearchUncaughtExceptionHandler.class, loggingPrefixSupplier.get());
        logger.warn((org.apache.logging.log4j.util.Supplier<?>)
            () -> new ParameterizedMessage("uncaught exception in thread [{}]", threadName), t);
    }

    void halt(int status) {
        AccessController.doPrivileged(new PrivilegedHaltAction(status));
    }

    static class PrivilegedHaltAction implements PrivilegedAction<Void> {

        private final int status;

        private PrivilegedHaltAction(final int status) {
            this.status = status;
        }

        @SuppressForbidden(reason = "halt")
        @Override
        public Void run() {
            // we halt to prevent shutdown hooks from running
            Runtime.getRuntime().halt(status);
            return null;
        }

    }
}
```

从上面的代码中可以看出，当出现`StackOverflowError`异常的时候，es的会主动停止自己，这一点倒是让我有点意外。

类似的问题还有：

- [不规范ES前缀查询导致ES集群挂掉](https://daminger.github.io/2017/12/24/es-case-1/)
- [模糊查询导致Elasticsearch服务宕机](https://www.jianshu.com/p/5db209e0fdbe)