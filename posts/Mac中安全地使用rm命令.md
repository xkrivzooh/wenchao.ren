---
icon: page
author: xkrivzooh
date: 2021-04-12
category:
  - post
tag:
  - 杂记
---

# Mac中安全地使用rm命令

之前好几次工作中不小心在mac的terminal中执行了`rm -rf`命令来删除文件然后发现需要恢复的情况。于是找了一下发现果然有前人遇到了
同样的问题并且给出了优雅的解决方案。


> trash: CLI tool that moves files or folder to the trash

`trash`命令可以实现将文件(夹)移入废纸篓, 并且支持指定使用-F指定使用Finder来删除文件(这种方式支持放回原处操作)

```shell
$ brew install trash 
$ trash -F [file-name]
```

因为我是使用zsh的，所以我添加下面的alias命令到我的`.zshrc`文件中

alias rm='trash -F'

然后就可以在终端中正常的使用`rm xxx`或者`rm -rf xx`，操作后，就会发现被删除的文件存在mac的废纸篓中。可以还原。

<!-- @include: ../scaffolds/post_footer.md -->
