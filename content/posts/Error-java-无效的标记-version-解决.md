---
title: 'Error:java: 无效的标记: -version 解决'
toc: true
date: 2019-01-25 15:05:36
tags: ['java']
draft: false
---

使用最新版Intellij IDEA以后，编译项目出现`Error:java: 无效的标记: -version 解决`

后来排查发现是因为公司的`super-pom`中的`maven-compiler-plugin`的`configuration`有如下的配置：

```xml
 <compilerArgs>
-   <arg>-J-Duser.country=US</arg>
-   <arg>-version</arg>
</compilerArgs>
```

而这个配置会和新版本的idea冲突。把pom中的这个配置删除就好了


