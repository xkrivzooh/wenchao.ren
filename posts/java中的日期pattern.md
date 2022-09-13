---
icon: page
author: xkrivzooh
date: 2019-01-21
category:
  - post
tag:
  - java
---

# java中的日期pattern

经常搞混java中的日期pattern，比如经常记混`H`和`h`的区别，所以专门整理一下，便于我以后查找


```java
yyyy：年
MM：月
dd：日
hh：1~12小时制(1-12)
HH：24小时制(0-23)
mm：分
ss：秒
S：毫秒
E：星期几
D：一年中的第几天
F：一月中的第几个星期(会把这个月总共过的天数除以7)
w：一年中的第几个星期
W：一月中的第几星期(会根据实际情况来算)
a：上下午标识
k：和HH差不多，表示一天24小时制(1-24)。
K：和hh差不多，表示一天12小时制(0-11)。
z：表示时区  
```java

常用pattern：

```java
yyyy-MM-dd HH:mm:ss.SSS
yyyy-MM-dd'T'HH:mm:ss.SSS'Z'
```

常用时区：
```java
@JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "GMT+8")
```

日期和字符串互转：
```java
private final static DateTimeFormatter fmt1 = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss.SSS");
DateTime dateTime = DateTime.parse(date, fmt1)

new DateTime().toString("yyyy-MM-dd HH:mm:ss.SSS")

org.joda.time#Days
```
