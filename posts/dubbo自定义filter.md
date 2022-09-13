---
icon: page
author: xkrivzooh
date: 2019-02-12
category:
  - post
tag:
  - dubbo
---

# dubbo自定义filter
dubbo的扩展性是特别的好，本篇文章通过例子来说明如何自定义dubbo的filter。为了文章完整性，贴一下官网对于filter的一些说明。

## 扩展说明
服务提供方和服务消费方调用过程拦截，Dubbo 本身的大多功能均基于此扩展点实现，每次远程方法执行，该拦截都会被执行，请注意对性能的影响。

约定：

- 用户自定义 filter 默认在内置 filter 之后。
- 特殊值 `default`，表示缺省扩展点插入的位置。比如：`filter="xxx,default,yyy"`，表示 `xxx`` 在缺省 `filter` 之前，`yyy` 在缺省 `filter` 之后。
- 特殊符号 `-`，表示剔除。比如：`filter="-foo1"`，剔除添加缺省扩展点 `foo1`。比如：`filter="-default"`，剔除添加所有缺省扩展点。
- **provider 和 service 同时配置的 filter 时，累加所有 filter，而不是覆盖**。比如：`<dubbo:provider filter="xxx,yyy"/>` 和 `<dubbo:service filter="aaa,bbb" />`，则 `xxx,yyy,aaa,bbb` 均会生效。如果要覆盖，需配置：`<dubbo:service filter="-xxx,-yyy,aaa,bbb" />`

## 扩展接口

`org.apache.dubbo.rpc.Filter`

## 扩展配置

```xml
<!-- 消费方调用过程拦截 -->
<dubbo:reference filter="xxx,yyy" />
<!-- 消费方调用过程缺省拦截器，将拦截所有reference -->
<dubbo:consumer filter="xxx,yyy"/>
<!-- 提供方调用过程拦截 -->
<dubbo:service filter="xxx,yyy" />
<!-- 提供方调用过程缺省拦截器，将拦截所有service -->
<dubbo:provider filter="xxx,yyy"/>
```

## 已知扩展

- org.apache.dubbo.rpc.filter.EchoFilter
- org.apache.dubbo.rpc.filter.GenericFilter
- org.apache.dubbo.rpc.filter.GenericImplFilter
- org.apache.dubbo.rpc.filter.TokenFilter
- org.apache.dubbo.rpc.filter.AccessLogFilter
- org.apache.dubbo.rpc.filter.CountFilter
- org.apache.dubbo.rpc.filter.ActiveLimitFilter
- org.apache.dubbo.rpc.filter.ClassLoaderFilter
- org.apache.dubbo.rpc.filter.ContextFilter
- org.apache.dubbo.rpc.filter.ConsumerContextFilter
- org.apache.dubbo.rpc.filter.ExceptionFilter
- org.apache.dubbo.rpc.filter.ExecuteLimitFilter
- org.apache.dubbo.rpc.filter.DeprecatedFilter

## 官网扩展示例

Maven 项目结构：

```java
src
 |-main
    |-java
        |-com
            |-xxx
                |-XxxFilter.java (实现Filter接口)
    |-resources
        |-META-INF
            |-dubbo
                |-org.apache.dubbo.rpc.Filter (纯文本文件，内容为：xxx=com.xxx.XxxFilter)
```

XxxFilter.java：

```java
package com.xxx;
 
import org.apache.dubbo.rpc.Filter;
import org.apache.dubbo.rpc.Invoker;
import org.apache.dubbo.rpc.Invocation;
import org.apache.dubbo.rpc.Result;
import org.apache.dubbo.rpc.RpcException;
 
public class XxxFilter implements Filter {
    public Result invoke(Invoker<?> invoker, Invocation invocation) throws RpcException {
        // before filter ...
        Result result = invoker.invoke(invocation);
        // after filter ...
        return result;
    }
}
```

然后配置dubbo spi：
META-INF/dubbo/org.apache.dubbo.rpc.Filter：
`xxx=com.xxx.XxxFilter`


## 实际例子

比如希望dubbo consumer在请求dubbo provider的时候，自动携带自己的jar的版本信息，那么就可以写一个`JarVersionAttachFilter`

```java
package com.xxxx.xx.xx.rpc.dubbo.filter;

import java.util.Map;

import com.alibaba.dubbo.common.Constants;
import com.alibaba.dubbo.common.extension.Activate;
import com.alibaba.dubbo.rpc.Filter;
import com.alibaba.dubbo.rpc.Invocation;
import com.alibaba.dubbo.rpc.Invoker;
import com.alibaba.dubbo.rpc.Result;
import com.alibaba.dubbo.rpc.RpcException;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import com.xxx.common.util.JarUtils;
import com.xxx.common.util.Safes;
import com.xxx.xxx.xxx.rpc.dubbo.DubboConstants;

import org.springframework.util.StringUtils;

@Activate(group = {Constants.CONSUMER}, order = -1)
public class JarVersionAttachFilter implements Filter {

	private LoadingCache<Class<?>, String> versionMapping = CacheBuilder.newBuilder().maximumSize(1024).build(new CacheLoader<Class<?>, String>() {
		@Override
		public String load(Class<?> key) throws Exception {
			return Safes.of(JarUtils.getVersion(key, null));
		}
	});

	@Override
	public Result invoke(Invoker<?> invoker, Invocation invocation) throws RpcException {
		Map<String, String> attachments = invocation.getAttachments();
		String version = versionMapping.getUnchecked(invoker.getInterface());
		if (StringUtils.hasText(version)) {
			attachments.put(DubboConstants.JAR_VERSION_NAME, version);
		}
		return invoker.invoke(invocation);
	}
}
```

然后在dubbo的spi文件中写入：`jarattach=com.xxxx.xx.xx.rpc.dubbo.filter.JarVersionAttachFilter`就好了。这样当consumer发起请求的时候，会自动携带自己的jar的版本信息

## 参考资料
- [dubbo官方文档-调用拦截扩展](http://dubbo.apache.org/zh-cn/docs/dev/impls/filter.html)
