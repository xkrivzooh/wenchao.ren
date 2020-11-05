---
title: "Lombok中@Builder注解使用注意事项"
date: 2020-11-05T15:33:10+08:00
draft: false
tags: [java]
---

Lombok使用@Builder注解时，默认是不能反序列化的，因为没有默认构造函数，因此可以通过增加下面2个注解来解决问题：

`@NoArgsConstructor(access = AccessLevel.PUBLIC)`
`@AllArgsConstructor(access = AccessLevel.PRIVATE) `

示例代码：
```java
@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public static class NamespaceItem {
   private String namespace;

   private Map<String, Set<String>> appOwners = Maps.newHashMap();
}
```

