---
icon: page
author: xkrivzooh
date: 2020-11-05
category:
  - post
tag:
  - av
---

# Lombok中@Builder注解使用注意事项

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


<!-- @include: ../scaffolds/post_footer.md -->
