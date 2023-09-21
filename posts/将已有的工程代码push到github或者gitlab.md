---
icon: page
author: xkrivzooh
sidebar: false
date: 2019-01-23
category:
  - post
tag:
  - git
---

# 将已有的工程代码push到github或者gitlab

执行下面的命令就好了

```shell
git init
git add .
git commit -m "Initial commit"
git remote add origin <project url>
git push -f origin master
```

不过有时候会在github或者gitlab上将`master`分支进行保护，所以可能需要先创建一个别的分支，然后merge就好了

## 参考资料

- [push-existing-project-into-github](https://stackoverflow.com/questions/17291995/push-existing-project-into-github)

<!-- @include: ../scaffolds/post_footer.md -->
