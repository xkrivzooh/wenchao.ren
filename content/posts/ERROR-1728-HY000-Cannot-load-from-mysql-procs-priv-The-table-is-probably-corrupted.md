---
title: >-
  ERROR 1728 (HY000): Cannot load from mysql.procs_priv. The table is probably
  corrupted
toc: true
date: 2019-03-11 12:23:46
tags: ['mysql']
draft: false
---


今天在搞mysql binlog收集时，需要创建一个mysql用户，结果出现了：

`ERROR 1728 (HY000): Cannot load from mysql.procs_priv. The table is probably corrupted`异常

解决办法:

`sudo mysql_upgrade -u root -p`

注意后面的用户名和密码自己修改为自己的哈。

```sql
~ » sudo mysql_upgrade -u root -p
Password:
Enter password:
Checking if update is needed.
Checking server version.
Running queries to upgrade MySQL server.
Checking system database.
mysql.columns_priv                                 OK
mysql.db                                           OK
mysql.engine_cost                                  OK
mysql.event                                        OK
mysql.func                                         OK
mysql.general_log                                  OK
mysql.gtid_executed                                OK
mysql.help_category                                OK
mysql.help_keyword                                 OK
mysql.help_relation                                OK
mysql.help_topic                                   OK
mysql.innodb_index_stats                           OK
mysql.innodb_table_stats                           OK
mysql.ndb_binlog_index                             OK
mysql.plugin                                       OK
mysql.proc                                         OK
mysql.procs_priv                                   OK
mysql.proxies_priv                                 OK
mysql.server_cost                                  OK
mysql.servers                                      OK
mysql.slave_master_info                            OK
mysql.slave_relay_log_info                         OK
mysql.slave_worker_info                            OK
mysql.slow_log                                     OK
mysql.tables_priv                                  OK
mysql.time_zone                                    OK
mysql.time_zone_leap_second                        OK
mysql.time_zone_name                               OK
mysql.time_zone_transition                         OK
mysql.time_zone_transition_type                    OK
mysql.user                                         OK
The sys schema is already up to date (version 1.5.1).
Checking databases.
sys.sys_config                                     OK
temp.hsc_biz_system_customer                       OK
temp.hsc_settlement_info                           OK
temp.hsc_settlement_invoice                        OK
temp.hsc_settlement_object                         OK
temp.invoice_config                                OK
test.worker_node                                   OK
test.a                                             OK
test.application                                   OK
test.application_acl                               OK
test.b                                             OK
test.big_table                                     OK
test.certificate_info_tab                          OK
test.company_tab                                   OK
test.connection_config                             OK
test.leader_election                               OK
test.test                                          OK
test.test1                                         OK
test.test_emoij                                    OK
test.user                                          OK
Upgrade process completed successfully.
Checking if update is needed.
------------------------------------------------------------
```

然后重启mysql以后，在尝试创建用户，发现完美解决。