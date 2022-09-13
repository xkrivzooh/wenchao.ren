---
icon: page
author: xkrivzooh
date: 2019-01-17
sidebar: false
category:
  - post
tag:
  - es
---

# 优化Elasticsearch的写入

我们这边因为需要对trace系统的数据做一些高级查询，所以会将`Span`的可能会被用作搜索条件的信息写入elasticsearch中。
由于trace系统的数据量比较大，虽然trace系统本身的设计会有`采样率`这个东西来降低trace采集的数据量，但是本身还是
比较大的数据量。所以需要对es的写入做一些优化。这篇文章记录一下我们的优化项

分析我们场景的特点：

- 写请求特别大
- 读请求很少，实时性要求低
- trace系统对数据的可靠性要求低，但是要求写入及时（数据的价值会随着时间而降低）

贴一下我们优化以后的template设置：

```json
{
  "order": 0,
  "index_patterns": [
    "trace.advanced.query-*"
  ],
  "settings": {
    "index": {
      "refresh_interval": "120s",
      "number_of_shards": "10",
      "translog": {
        "flush_threshold_size": "1024mb",
        "sync_interval": "120s",
        "durability": "async"
      },
      "number_of_replicas": "0"
    }
  },
  "mappings": {},
  "aliases": {}
}
```

主要的优化步骤：

- 关闭副本，设置`number_of_replicas`为0 在我们的场景下数据丢了是可以忍受的
- 调大`translog.flush_threshold_size`，我们设置的为`1024mb`
- 调大`translog.sync_interval`为120s
- 我们容许数据丢失，设置async模式

因为我们目前的es集群性能是足够的，所以并没有完全按照参考文章[将 ELASTICSEARCH 写入速度优化到极限](https://www.easyice.cn/archives/207#translog_flush)中的所有项目都优化。推荐大家阅读这个参考文章，比我写的好多了。

## 参考资料

- [将 ELASTICSEARCH 写入速度优化到极限](https://www.easyice.cn/archives/207#translog_flush)
