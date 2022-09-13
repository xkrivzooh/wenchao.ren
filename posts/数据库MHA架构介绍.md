---
icon: page
author: xkrivzooh
date: 2019-09-23
sidebar: false
category:
  - post
tag:
  - mysql
---

# 数据库MHA架构介绍

MHA（Master High Availability）目前在MySQL高可用方面是一个相对成熟的解决方案，它由日本人youshimaton开发，是一套优秀的作为MySQL高可用性环境下故障切换和主从提升的高可用软件。在MySQL故障切换过程中，MHA能做到0~30秒之内自动完成数据库的故障切换操作，并且在进行故障切换的过程中，MHA能最大程度上保证数据库的一致性。



## 适用场景

目前MHA主要支持一主多从的架构，要搭建MHA，要求一个复制集群必须最少有3台数据库服务器，一主二从，即一台充当Master，一台充当备用Master，另一台充当从库。出于成本考虑，淘宝在此基础上进行了改造，目前淘宝开发的TMHA已经支持一主一从。

## MAH组件

MHA由两部分组成：

- MHA Manager（管理节点）
- MHA Node（数据节点）。

### MHA Manager

MHA Manager可以单独部署在一台独立的机器上管理多个master-slave集群，也可以部署在一台slave节点上。主要用来运行一些工具，比如masterha_manager工具实现自动监控MySQL Master和实现master故障切换，其它工具实现手动实现master故障切换、在线mater转移、连接检查等等。一个Manager可以管理多 个master-slave集群

MHA Manager会定时探测集群中的master节点，当master出现故障时，它可以自动将最新的slave提升为新的master，然后将所有其他的slave重新指向新的master。整个故障转移过程对应用程序完全透明。

### MHA Node

MHA Node运行在每台MySQL服务器上，类似于Agent。主要作用有：

- 保存二进制日志
  如果能够访问故障master，会拷贝master的二进制日志
- 应用差异中继日志
  从拥有最新数据的slave上生成差异中继日志，然后应用差异日志。
- 清除中继日志
  在不停止SQL线程的情况下删除中继日志



## 工作原理简述

因为MHA Manager会不断的去探测master节点，因此当master出现故障时，通过对比slave之间I/O线程读取masterbinlog的位置，选取最接近的slave做为latestslave。 其它slave通过与latest slave对比生成差异中继日志。在latest slave上应用从master保存的binlog，同时将latest slave提升为master。最后在其它slave上应用相应的差异中继日志并开始从新的master开始复制。

在MHA实现Master故障切换过程中，MHA Node会试图访问故障的master（通过SSH），如果可以访问（不是硬件故障，比如InnoDB数据文件损坏等），会保存二进制文件，以最大程度保 证数据不丢失。MHA和半同步复制一起使用会大大降低数据丢失的危险。流程如下：

- 从宕机崩溃的master保存二进制日志事件(binlog events)。
- 识别含有最新更新的slave。
- 应用差异的中继日志(relay log)到其它slave。
- 应用从master保存的二进制日志事件(binlog events)。
- 提升一个slave为新master并记录binlog file和position。
- 使其它的slave连接新的master进行复制。
- 完成切换manager主进程OFFLINE
