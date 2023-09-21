---
icon: page
sidebar: false
author: xkrivzooh
date: 2019-03-11
category:
  - post
tag:
  - java
---

# Guava CacheLoader中当load方法返回null

Guava LoadingCache在实际工作中用的还是比较频繁的。但是最近在review代码时，发现有些同学在使用`CacheLoader`时没有注意到
`CacheLoader#load`方法的注释：

```java
  /**
   * Computes or retrieves the value corresponding to {@code key}.
   *
   * @param key the non-null key whose value should be loaded
   * @return the value associated with {@code key}; <b>must not be null</b>
   * @throws Exception if unable to load the result
   * @throws InterruptedException if this method is interrupted. {@code InterruptedException} is
   *     treated like any other {@code Exception} in all respects except that, when it is caught,
   *     the thread's interrupt status is set
   */
  public abstract V load(K key) throws Exception;
```

源码中明确指出了这个方法不能返回null。但是在review代码时发现很多同学没注意到到这个，而在部分情况下存在返回null的情况。
一般使用`Optional`封装一下就好了。

这篇文章主要说一下当load方法返回null时会出现什么异常：

```java
import java.util.concurrent.ExecutionException;

import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;


public class Test {

	public static void main(String[] args) {
		LoadingCache cache = CacheBuilder.newBuilder().build(new CacheLoader<Object, Object>() {
			@Override
			public Object load(Object key) {
				return null;
			}
		});

		try {
			cache.getUnchecked("asda");
		}
		catch (Exception e) {
			System.out.println("本例子中这里会出现异常 这里会cache住抛出异常");
		}

		try {
			cache.get("adsa");
		}
		catch (ExecutionException e) {
			System.out.println("本例子中不会抛出这个异常");
		}catch (Exception e) {
			System.out.println("本例子中这里会出现异常 这里会cache住抛出异常");
		}

		System.out.println("fuck");

	}
}
```

上面的代码分别使用了`getUnchecked`和`get`方法来测试当load方法返回null的情况。


所以一般出现的问题是使用方可能仅仅cache了`ExecutionException`，这样会导致异常cache不住。这是一个问题，在某些
情况下会影响程序逻辑。需要注意一下。所以尽可能的使用`Optional`来封装结果

<!-- @include: ../scaffolds/post_footer.md -->
