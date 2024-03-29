---
icon: page
author: xkrivzooh
sidebar: false
date: 2021-04-23
category:
  - post
tag:
  - 杂谈
---

# "hugo新写的文章展示不出来"

最近因为在公司的笔记本上写博文，所以并不打算采用在terminal中使用`hugo new`的方式来生成新的博文模板，而是自己在vs code中
编写好之后然后手动在github的网页新增文件触发github actions的执行然后部署到vps上。

## 遇到的问题

然后发现自己新写的文章居然展示不出来。排查了一下博文前面的头信息：

```shell
---
title: "hugo新写的文章展示不出来"
date: 2021-04-23T11:11:09+08:00
draft: false
tags: ['杂谈']
---
```
发现这些头信息的格式写的并没有问题，即便这个时间也没有任何的问题。

## 解决过程
后来在网上搜到了这个文章：[Hugo Post Missing (Hugo 博客文章缺失问题)](https://jdhao.github.io/2020/01/11/hugo_post_missing/)。文章中提到了：

> Hugo 是否会渲染一篇博文依赖该文章的发布时间。如果一个博文的发布时间比 Hugo 构建当前站点的时间还要晚，也就是 Hugo 认为博文的发布时间在未来，就不会渲染该篇博文。前面没有写时区的博文，就是被 Hugo 认为发布时间还未到，所以没有渲染出来。

## 解决办法

- 第一种最简单的办法是修改文章头信息中的date时间为过去的时间
- 第二种就是强制Hugo渲染发布时间在未来的博文，这有两种办法：
    - 第一个是在`config.toml`中加入以下设置：`buildFuture = true`
    - 第二个是在`hugo build`博客的时候，加上 `--buildFuture` 选项


<!-- @include: ../scaffolds/post_footer.md -->
