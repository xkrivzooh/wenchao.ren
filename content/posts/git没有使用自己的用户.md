---
title: git没有使用自己的用户
toc: true
date: 2019-01-23 00:30:57
tags: ['git']
draft: false
---

昨晚因为一些原因删除了一波`.ssh`目录中的东西，导致今天在`git pull`
的时候出现需要我输入`git@gitlab.corp.xxx.com`的密码。这种问题一看就是没有识别我的gitlab用户。

一般这种问题有2种解决办法：

- 走http协议
	http协议需要你输入用户名和密码
- 走ssh协议
	重新生成秘钥，然后将公钥copy到gitlab的`ssh keys`中
	
这里具体说说第二种解决办法：

- 本次使用`ssh-keygen -t rsa -C "用户名"`，一路回车会在`.ssh`目录下
生成2个文件：`id_rsa.pub`和`id_rsa`文件
- 复制`id_rsa.pub`文件的内容到gitlab的`profile setting -> SSH keys -> Add an SSH key
`

