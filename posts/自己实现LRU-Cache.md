---
icon: page
author: xkrivzooh
date: 2018-12-04
sidebar: false
category:
  - post
tag:
  - java
---

# 自己实现LRU Cache

今天闲的无事，写一个LRU的缓存练练手，不过提前说好哈，最好的办法是直接使用Guava中的方法：
```java
    import com.google.common.cache.CacheBuilder;
import java.util.concurrent.ConcurrentMap;
public class GuavaLRUCache {
    public static void main(String[] args) {
        ConcurrentMap<String, String> cache =
                CacheBuilder.newBuilder()
                        .maximumSize(2L)
                        .<String, String>build().asMap();
        cache.put("a", "b");
        cache.put("b", "c");
        System.out.println(cache);
        cache.put("a", "d");
        System.out.println(cache);
        cache.put("c", "d");
        System.out.println(cache);
    }
}
```
如果自己实现的话，就比较挫了：
```java
public class LRUCache<K, V> {
    private final int limit;
    private final Map<K, V> cache;
    private final Deque<K> deque;
    private final ReentrantLock reentrantLock = new ReentrantLock();
    private static final int DEFAULT_CAPACITY = 16;
    private static final float DEFAULT_LOAD_FACTOR = 0.75f;
    public LRUCache(int limit) {
        this.limit = limit;
        deque = new ArrayDeque<K>(limit);
        cache = new ConcurrentHashMap<K, V>(DEFAULT_CAPACITY, DEFAULT_LOAD_FACTOR);
    }
    public LRUCache(int limit, int capacity, float loadFactor) {
        this.limit = limit;
        deque = new ArrayDeque<K>(limit);
        cache = new ConcurrentHashMap<K, V>(capacity, loadFactor);
    }
    public void put(K key, V value) {
        V v = cache.get(key);
        reentrantLock.lock();
        try {
            if(v == null){
                cache.put(key, value);
                deque.removeFirstOccurrence(key);
                deque.addFirst(key);
            } else {
                deque.removeFirstOccurrence(key);
                deque.addFirst(key);
            }
            if(size() > limit){
                K key1 = deque.removeLast();
                if(key1 != null){
                    cache.remove(key1);
                }
            }
        }finally {
            reentrantLock.unlock();
        }
    }
    public V get(K key) {
        V v = cache.get(key);
        if(v != null){
            reentrantLock.lock();
            try {
                deque.removeFirstOccurrence(key);
                deque.addFirst(key);
            } finally {
                reentrantLock.unlock();
            }
        }
        return v;
    }
    public int size() {
        return cache.size();
    }
    @Override
    public String toString() {
        List<String> values = Lists.newArrayListWithExpectedSize(limit);
        reentrantLock.lock();
        try {
            for (K k : deque) {
                V v = cache.get(k);
                values.add(k.toString() + " -> " + v.toString());
            }
            System.out.println(deque);
        } finally {
            reentrantLock.unlock();
        }
        return values.toString();
    }
    //other apis...
    public static void main(String[] args) {
        LRUCache<String, String> cache = new LRUCache<String, String>(3);
        cache.put("key1", "value1");
        cache.put("key2", "value2");
        cache.put("key3", "value3");
        System.out.println(cache);
        cache.put("key4", "value4");
        System.out.println(cache);
        cache.put("key2", "value2");
        System.out.println(cache);
        cache.put("key4", "value4");
        System.out.println(cache);
        cache.put("key1", "value1");
        System.out.println(cache);
    }
}
```

## 参考资料

- [Guava CachesExplained](https://github.com/google/guava/wiki/CachesExplained)
