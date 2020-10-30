---
title: RBAC权限系统设计
toc: true
date: 2019-01-23 00:18:31
tags: ['杂记']
draft: false
---
##Role Based Access Control

>  Role-based access control (RBAC) is a method of regulating access to computer or network resources based on the roles of individual users within an enterprise. In this context, access is the ability of an individual user to perform a specific task, such as view, create, or modify a file.

(The National Institute of Standards and Technology，美国国家标准与技术研究院)标准RBAC模型由4个部件模型组成，这4个部件模型分别是：

- 基本模型RBAC0(Core RBAC）
- 角色分级模型RBAC1(Hierarchal RBAC)
- 角色限制模型RBAC2(Constraint RBAC)
- 统一模型RBAC3(Combines RBAC)

关于这四个区别，建议大家直接看本文参考资料中第二个链接：[标准RBAC模型由4个部件模型](http://blog.csdn.net/chjttony/article/details/6229078)，这篇文章说的很清楚。

##我的理解

本篇文章我打算简要的描述一下我在权限系统设计方面的一些心得吧，欢迎大家斧正。
基于RBAC的权限系统的设计，简单的描述就是通过角色和权限（组）关联起来。一个用户从属于某些个角色，每个角色都拥有若干个权限(组)。这样就可以构建出用户-角色-权限的模型出来。
当然了，系统有大有小，复杂度不同，因此对于权限的系统的设计要求也不尽相同。但是基本都大同小异。
我这边参与过的系统设计一般遵循RBAC0权限模型。

![http://7niucdn.wenchao.ren/16-12-12/48145442-file_1481543097370_d3b6.png](http://7niucdn.wenchao.ren/16-12-12/48145442-file_1481543097370_d3b6.png)

在这个模型中我并没有画出`权限组`这个模型出来，当然各位的如果权限实在太多，需要对权限进行分组的话，可以增加一个权限组。
当然大家也可以按照自己系统的要求，来具体选择使用的权限模型。

##参考资料

- [Role Based Access control](https://en.wikipedia.org/wiki/Role-based_access_control)
- [标准RBAC模型由4个部件模型](http://blog.csdn.net/chjttony/article/details/6229078)
