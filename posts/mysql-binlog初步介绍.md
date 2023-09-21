---
icon: page
author: xkrivzooh
date: 2019-03-11
category:
  - post
tag:
  - mysql
---

# mysql binlog初步介绍

binlog 即二进制日志,它记录了数据库上的所有改变，并以二进制的形式保存在磁盘中；
它可以用来查看数据库的变更历史、数据库增量备份和恢复、Mysql的复制（主从数据库的复制）。

## mysql binlog解析

binlog有三种格式:

- `Statement` 基于SQL语句的复制(statement-based replication,SBR)， 
- `Row` 基于行的复制(row-based replication,RBR)， 
- `Mixed` 混合模式复制(mixed-based replication,MBR)。

在我这边`mysql 5.7.20`版本中默认是使用`Row`的, 而且默认情况下没有开启binlog

```sql
mysql> select version();
+-----------+
| version() |
+-----------+
| 5.7.20    |
+-----------+
1 row in set (0.00 sec)

mysql>
mysql>
mysql> show variables like 'binlog_format';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| binlog_format | ROW   |
+---------------+-------+
1 row in set (0.00 sec)

mysql> show variables like 'log_bin';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| log_bin       | OFF   |
+---------------+-------+
1 row in set (0.00 sec)
```

## mac环境下开启mysql的binlog

编辑`my.cnf`文件，对于我来说就是`/usr/local/etc/my.cnf`文件，在其中增加下面的内容：

```java
log-bin = /Users/rollenholt/Downloads/mysql/binlog
binlog-format = ROW
server_id = 1
```

然后`brew services restart mysql`重启mysql，接下来我们就可以验证mysql的binlog已经开启了：

```sql
mysql> show variables like 'log_bin'
    -> ;
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| log_bin       | ON    |
+---------------+-------+
1 row in set (0.00 sec)

mysql>
mysql> show binary logs;
+---------------+-----------+
| Log_name      | File_size |
+---------------+-----------+
| binlog.000001 |       177 |
| binlog.000002 |       177 |
| binlog.000003 |       177 |
| binlog.000004 |       154 |
+---------------+-----------+
4 rows in set (0.00 sec)

mysql> show master status;
+---------------+----------+--------------+------------------+-------------------+
| File          | Position | Binlog_Do_DB | Binlog_Ignore_DB | Executed_Gtid_Set |
+---------------+----------+--------------+------------------+-------------------+
| binlog.000004 |      154 |              |                  |                   |
+---------------+----------+--------------+------------------+-------------------+
1 row in set (0.00 sec)

mysql> show master logs;
+---------------+-----------+
| Log_name      | File_size |
+---------------+-----------+
| binlog.000001 |       177 |
| binlog.000002 |       177 |
| binlog.000003 |       177 |
| binlog.000004 |       154 |
+---------------+-----------+
4 rows in set (0.00 sec)
```
同时查看我们配置的`log-bin`属性对于的目录下：

```java
~/Downloads/mysql » ls
binlog.000001 binlog.000002 binlog.000003 binlog.000004 binlog.index
------------------------------------------------------------
~/Downloads/mysql » cat binlog.index
/Users/rollenholt/Downloads/mysql/binlog.000001
/Users/rollenholt/Downloads/mysql/binlog.000002
/Users/rollenholt/Downloads/mysql/binlog.000003
/Users/rollenholt/Downloads/mysql/binlog.000004
------------------------------------------------------------
~/Downloads/mysql » cat binlog.000001
_binR �[w{5.7.20-logR �[8


**4SVѶR �[#��_]�hu �[����%                                                                        ------------------------------------------------------------
~/Downloads/mysql »
```

### binlog相关的基本命令：

- 查看是否开启binlog `show variables like 'log_bin'`
- 获取binlog文件列表 `show binary logs`
- 查看master上的binlog `show master logs`
- 只查看第一个binlog文件的内容
```sql
mysql> show binlog events;
+---------------+-----+----------------+-----------+-------------+---------------------------------------+
| Log_name      | Pos | Event_type     | Server_id | End_log_pos | Info                                  |
+---------------+-----+----------------+-----------+-------------+---------------------------------------+
| binlog.000001 |   4 | Format_desc    |         1 |         123 | Server ver: 5.7.20-log, Binlog ver: 4 |
| binlog.000001 | 123 | Previous_gtids |         1 |         154 |                                       |
| binlog.000001 | 154 | Stop           |         1 |         177 |                                       |
+---------------+-----+----------------+-----------+-------------+---------------------------------------+
3 rows in set (0.01 sec)
```
- 查看指定binlog文件的内容 `show binlog events in 'binlog.000001'`
- 删除binlog
    - 使用linux命令删除binlog文件
    - 设置binlog的过期时间 使用variable `expire_logs_days`
    - 手动删除binlog
        - reset master;//删除master的binlog
        - reset slave;    //删除slave的中继日志
        - purge master logs before '2012-03-30 17:20:00';  //删除指定日期以前的日志索引中binlog日志文件
        - purge master logs to 'mysql-bin.000002';   //删除指定日志文件的日志索引中binlog日志文件

```sql
mysql> show variables like '%expire_logs_days%';
+------------------+-------+
| Variable_name    | Value |
+------------------+-------+
| expire_logs_days | 0     |
+------------------+-------+
1 row in set (0.00 sec)
```

- flush logs 刷新日志
    - 当停止或重启服务器时，服务器会把日志文件记入下一个日志文件，Mysql会在重启时生成一个新的日志文件，文件序号递增；此外，如果日志文件超过max_binlog_size（默认值1G）系统变量配置的上限时，也会生成新的日志文件（在这里需要注意的是，如果你正使用大的事务，二进制日志还会超过max_binlog_size，不会生成新的日志文件，事务全写入一个二进制日志中,这种情况主要是为了保证事务的完整性）；日志被刷新时，新生成一个日志文件。

<!-- @include: ../scaffolds/post_footer.md -->
