---
icon: page
sidebar: false
author: xkrivzooh
date: 2020-06-12
category:
  - post
tag:
  - js
---

# 使用nvm管理本地的node的版本

类似于java可以使用`jenv`来管理本地的多个jdk的版本一样，node可以使用`nvm`来管理自己本地的多个版本的node。
本文章参考了下面2篇文章：

- [Mac 使用 nvm 管理多版本 node](https://juejin.im/post/5d382a5d6fb9a07edf27874d)
- [nvm：安裝、切換不同 Node.js 版本的管理器](https://titangene.github.io/article/nvm.html)

为了便于查看我直接简单整理一下。

如果想卸载之前的node, 第一篇文章中的
```
$ sudo npm uninstall npm -g
$ sudo rm -rf /usr/local/lib/node /usr/local/lib/node_modules /var/db/receipts/org.nodejs.*
$ sudo rm -rf /usr/local/include/node /Users/$USER/.npm
$ sudo rm /usr/local/bin/node
```
里面的`/var/db/receipts/org.nodejs.*`在我的mac上已经没有这个目录了，记得调整一下。

安装nvm使用`brew install nvm`就行。然后根据brew的安装提示可以在`.zshrc`（linux的任何可以export的地方）增加：
```bash
# nvm配置
export NVM_DIR="$HOME/.nvm"
[ -s "/usr/local/opt/nvm/nvm.sh" ] && . "/usr/local/opt/nvm/nvm.sh"  # This loads nvm
[ -s "/usr/local/opt/nvm/etc/bash_completion.d/nvm" ] && . "/usr/local/opt/nvm/etc/bash_completion.d/nvm"  # This loads nvm bash_completion%
```

nvm常用指令：

```shell
nvm --help                          显示所有信息
nvm --version                       显示当前安装的nvm版本
nvm install [-s] <version>          安装指定的版本，如果不存在.nvmrc,就从指定的资源下载安装
nvm install [-s] <version>  -latest-npm 安装指定的版本，平且下载最新的npm
nvm uninstall <version>             卸载指定的版本
nvm use [--silent] <version>        使用已经安装的版本  切换版本
nvm current                         查看当前使用的node版本
nvm ls                              查看已经安装的版本
nvm ls  <version>                   查看指定版本
nvm ls-remote                       显示远程所有可以安装的nodejs版本
nvm ls-remote --lts                 查看长期支持的版本
nvm install-latest-npm              安装罪行的npm
nvm reinstall-packages <version>    重新安装指定的版本
nvm cache dir                       显示nvm的cache
nvm cache clear                     清空nvm的cache
```

基本使用：
```bash
// 1. 安装 8.0 版本
$ nvm install 8.0

// 2. 查看版本
$ nvm ls

// 3. 切换版本
$ nvm use v8.0.0

//查看当前的node版本
node -v
```

有一个需要注意的是，`nvm ls-remote `命令列出的内容好像会基于当前node的版本列。因为安装的第一个版本的node会成为nvm的预设版本。
通过`nvm ls`命令可以看到当前的默认版本：

```bash
xkrivzooh in ~ λ nvm ls
->       v8.9.4
       v12.18.0
default -> 8.9.4 (-> v8.9.4)
node -> stable (-> v12.18.0) (default)
stable -> 12.18 (-> v12.18.0) (default)
iojs -> N/A (default)
unstable -> N/A (default)
lts/* -> lts/erbium (-> v12.18.0)
lts/argon -> v4.9.1 (-> N/A)
lts/boron -> v6.17.1 (-> N/A)
lts/carbon -> v8.17.0 (-> N/A)
lts/dubnium -> v10.21.0 (-> N/A)
lts/erbium -> v12.18.0
```

上面的例子中默认版本是8.9.4。 如果想切换nvm的默认版本, 使用：`nvm alias default v12.18.0`。然后在检查一下

```bash
xkrivzooh in ~ λ nvm ls
         v8.9.4
->     v12.18.0
default -> v12.18.0
node -> stable (-> v12.18.0) (default)
stable -> 12.18 (-> v12.18.0) (default)
iojs -> N/A (default)
unstable -> N/A (default)
lts/* -> lts/erbium (-> v12.18.0)
lts/argon -> v4.9.1 (-> N/A)
lts/boron -> v6.17.1 (-> N/A)
lts/carbon -> v8.17.0 (-> N/A)
lts/dubnium -> v10.21.0 (-> N/A)
lts/erbium -> v12.18.0
xkrivzooh in ~ λ node -v
v12.18.0
```
