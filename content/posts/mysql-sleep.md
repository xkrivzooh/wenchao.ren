---
title: mysql sleep
toc: true
date: 2019-03-11 12:17:55
tags: ['mysql']
draft: false
---

今天看到了一个sql：

```sql
select count(*), sleep(5) from test
```

第一次看到这个sleep函数，所以专门研究了一波。这个函数的语法是：`SLEEP(duration)`, 其中duration的单位是`秒`

> Sleeps (pauses) for the number of seconds given by the duration argument, then returns 0. The duration may have a fractional part. If the argument is NULL or negative, SLEEP() produces a warning, or an error in strict SQL mode.

> When sleep returns normally (without interruption), it returns 0:

简单的说他可以让sql在执行的时候sleep一段时间。

```sql
mysql> SELECT SLEEP(1000);
+-------------+
| SLEEP(1000) |
+-------------+
|           0 |
+-------------+
```

When SLEEP() is the only thing invoked by a query that is interrupted, it returns 1 and the query itself returns no error. This is true whether the query is killed or times out:

- This statement is interrupted using KILL QUERY from another session:

```sql
mysql> SELECT SLEEP(1000);
+-------------+
| SLEEP(1000) |
+-------------+
|           1 |
+-------------+
```

- This statement is interrupted by timing out:

```sql
mysql> SELECT /*+ MAX_EXECUTION_TIME(1) */ SLEEP(1000);
+-------------+
| SLEEP(1000) |
+-------------+
|           1 |
+-------------+
```

这里解释一下上面的语法，那个语法是[Mysql Optimizer Hints](https://dev.mysql.com/doc/refman/8.0/en/optimizer-hints.html)


When SLEEP() is only part of a query that is interrupted, the query returns an error:

- This statement is interrupted using KILL QUERY from another session:

```sql
mysql> SELECT 1 FROM t1 WHERE SLEEP(1000);
ERROR 1317 (70100): Query execution was interrupted
```

- This statement is interrupted by timing out:

```sql
mysql> SELECT /*+ MAX_EXECUTION_TIME(1000) */ 1 FROM t1 WHERE SLEEP(1000);
ERROR 3024 (HY000): Query execution was interrupted, maximum statement
execution time exceeded
```

This function is unsafe for statement-based replication. A warning is logged if you use this function when binlog_format is set to STATEMENT.

## 参考资料

- [mysql sleep function](https://dev.mysql.com/**doc**/refman/8.0/en/miscellaneous-functions.html#function_sleep)
- [Mysql Optimizer Hints](https://dev.mysql.com/doc/refman/8.0/en/optimizer-hints.html)
