---
title: brew操作mysql
toc: true
date: 2019-03-11 12:16:40
tags: ['杂记']
draft: false
---


- 安装mysql `brew install mysql`
- 启动mysql `brew services start mysql `
- 停止mysql `brew services stop mysql`
- 重启mysql `brew services restart mysql`

在我的机器上，`my.cnf`文件的位置在：`/usr/local/etc/my.cnf`，默认情况下里面的内容为：

```java
# Default Homebrew MySQL server config
[mysqld]
# Only allow connections from localhost
bind-address = 127.0.0.1
```