---
icon: page
author: xkrivzooh
date: 2019-01-22
sidebar: false
category:
  - post
tag:
  - java
---

# git还原到之前版本

命令行操作：
- `git log` 查看之前的commit的id，找到想要还原的版本
- `git reset --hard 44bd896bb726be3d3815f1f25d738a9cd402a477`   还原到之前的某个版本
- `git push -f origin master`  强制push到远程

<!-- @include: ../scaffolds/post_footer.md -->
