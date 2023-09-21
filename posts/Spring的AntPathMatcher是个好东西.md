---
icon: page
author: xkrivzooh
date: 2019-01-23
sidebar: false
category:
  - post
tag:
  - java
  - spring
---

# Spring的AntPathMatcher是个好东西

经常需要在各种中做一些模式匹配，正则表达式虽然是个好东西，但是`Ant风格`的匹配情况也非常的多。
这种情况下使用正则表达式不一定方便，而Spring提供的`AntPathMatcher`确可以帮助我们简化很多。

位于`Spring-core`中的`org.springframework.util.AntPathMatcher`使用起来非常简单：

```java
public class AntPathMatcherTest {

	private AntPathMatcher pathMatcher = new AntPathMatcher();

	@Test
	public void test() {
		pathMatcher.setCachePatterns(true);
		pathMatcher.setCaseSensitive(true);
		pathMatcher.setTrimTokens(true);
		pathMatcher.setPathSeparator("/");

		Assert.assertTrue(pathMatcher.match("a", "a"));
		Assert.assertTrue(pathMatcher.match("a*", "ab"));
		Assert.assertTrue(pathMatcher.match("a*/**/a", "ab/asdsa/a"));
		Assert.assertTrue(pathMatcher.match("a*/**/a", "ab/asdsa/asdasd/a"));


		Assert.assertTrue(pathMatcher.match("*", "a"));
		Assert.assertTrue(pathMatcher.match("*/*", "a/a"));
	}
}

```

<!-- @include: ../scaffolds/post_footer.md -->
