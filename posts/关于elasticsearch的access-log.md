---
icon: page
author: xkrivzooh
date: 2019-08-09
sidebar: false
category:
  - post
tag:
  - es
---

# 关于elasticsearch的access log

今天才知道原来elasticsearch其实并没有传统意义上的access log。我这里说的传统意义
上的access log是指类似于tomcat，nginx等的access log。
我们公司在访问elasticsearch的时候，java语言相关的使用的公司封装的（其实是我封装的）
elasticsearch client，在这个封装的client里面，实现了传统意义上的类似于dubbo-consumer-access.log
一样的东西，记录了请求时间，traceId，请求的参数信息，请求是否成功的状态，响应时间，响应的内容等等
的信息。但是在elasticsearch的server端其实是并没有这些内容的。
Google了一下，发现elasticsearch其实并没有access log这个功能。但是elasticsearch缺提供了slow log的这个功能。
虽然说slow log和access log其实是两种不同的东西，但是在一定程度上slow log其实可以做到access log的一部分功能。
## elasticsearch的slow log
这个日志的目的是捕获那些超过指定时间阈值的查询和索引请求。这个日志用来追踪由用户产生的很慢的请求很有用。
默认情况，**慢日志是不开启的**。要开启它，需要定义具体动作（query，fetch 还是 index），你期望的事件记录等级（ WARN 、 DEBUG 等），以及时间阈值。
### query
query阶段的配置，日志记录在_index_isearch_slowlog.log结尾的文件中，下面的日志级别可以根据实际
的需求来选择，如果想关闭某个配置的话，使用#号注释，或者设置值为-1就行。当然需要重启elasticsearch
以使得配置修改生效。
- `index.search.slowlog.threshold.query.warn`: 10s #超过10秒的query产生1个warn日志
- `index.search.slowlog.threshold.query.info`: 5s #超过5秒的query产生1个info日志
- `index.search.slowlog.threshold.query.debug`: 2s #超过2秒的query产生1个debug日志
- `index.search.slowlog.threshold.query.trace`: 500ms #超过500毫秒的query产生1个trace日志
### fetch
fetch阶段的配置
- index.search.slowlog.threshold.fetch.warn: 1s 
- index.search.slowlog.threshold.fetch.info: 800ms
- index.search.slowlog.threshold.fetch.debug: 500ms
- index.search.slowlog.threshold.fetch.trace: 200ms
### index
索引阶段的配置
- index.indexing.slowlog.threshold.index.warn: 10s ##索引数据超过10秒产生一个warn日志
- index.indexing.slowlog.threshold.index.info: 5s ##索引数据超过5秒产生一个info日志
- index.indexing.slowlog.threshold.index.debug: 2s ##索引数据超过2秒产生一个ddebug日志
- index.indexing.slowlog.threshold.index.trace: 500ms ##索引数据超过500毫秒产生一个trace日志
上面的例子说的是手动修改elasticsearch.yml文件，当然这些配置也可通过api来动态的修改，这是一个索引级别的设置，也就是说可以独立应用给单个索引：
```js
PUT /my_index/_settings
{
    "index.search.slowlog.threshold.query.warn" : "10s", 
    "index.search.slowlog.threshold.fetch.debug": "500ms", 
    "index.indexing.slowlog.threshold.index.info": "5s" 
}
```
你也可以和上面一样在 elasticsearch.yml 文件里定义这些阈值。没有阈值设置的索引会自动继承在静态配置文件里配置的参数。
一旦阈值设置过了，你可以和其他日志器一样切换日志记录等级：
```js
PUT /_cluster/settings
{
    "transient" : {
        "logger.index.search.slowlog" : "DEBUG", 
        "logger.index.indexing.slowlog" : "WARN" 
    }
}
```
我们为了能够在server段有类似的access log功能，我们修改了elasticsearch.yml中的：
- index.search.slowlog.threshold.query.trace
- index.indexing.slowlog.threshold.index.trace
这2个参数的值为1ms。这样基本使得所有的query和index请求可以有一个类access log的slow log。
你也看到了，这其实是一个很low的办法。也会影响es的性能，但是目前确实在server段没有什么比较好的办法。虽然我们封装了elasticsearch的client，但是也存在一些其他语言的应用或者部分应用直连elasticsearch。

