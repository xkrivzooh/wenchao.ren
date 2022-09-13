---
icon: page
sidebar: false
author: xkrivzooh
date: 2019-12-27
category:
  - post
tag:
  - java
---

# git移除对部分文件的追踪

如果不小心将某些不需要被git管理的文件加入了git中，取消的办法如下：

- 在当前目录下.gitignore文件里面加入不需要进行版本控制器的文件
- 执行`git rm -r --cached 文件名`命令
- 执行`gti commit` && `git push`提交修改

