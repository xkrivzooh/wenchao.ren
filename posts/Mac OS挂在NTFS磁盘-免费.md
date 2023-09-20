---
icon: page
author: xkrivzooh
sidebar: false
date: 2023-09-20
category:
  - 杂记
tag:
  - mac
---

# Mac OS挂在NTFS磁盘-免费

本篇文章介绍了一种使用开源软件，免费的在Mac os下挂在NTFS磁盘的问题。你需要做的仅仅是复制命令，然后粘贴到Mac的终端执行就行了。

## 什么场景需要挂在NTFS磁盘

当使用Mac OS操作系统时，通常情况下只能读取NTFS格式的磁盘，而无法直接写入或编辑其中的文件。这是因为
`NTFS（New Technology File System）`是由Windows操作系统所采用的文件系统，而Mac OS则采用`HFS+（Mac OS Extended）`或`APFS（Apple File System）`文件系统。
然而，有些情况下我们可能需要在Mac OS下挂载NTFS磁盘，以便能够进行读写操作。以下是一些常见的情况：

- 文件共享：如果你需要与Windows用户共享文件或者从Windows系统中传输文件到你的Mac上，挂载NTFS磁盘是非常有用的。这样可以确保你能够读取、编辑和保存文件，而不仅仅是简单地进行查看。
- 外部存储设备：如果你有一个外部硬盘或U盘格式化为NTFS，想要在Mac上备份或存储文件，那么你需要挂载该磁盘才能进行读写操作。
- 跨平台工作：如果你需要在不同操作系统间进行工作，例如在Windows和Mac上编写代码或编辑文档，挂载NTFS磁盘可以使你无缝切换平台，方便文件的共享和编辑。

## 为什么mac下读取ntfs这么麻烦？

为什么会出现这种情况呢？主要是因为NTFS和HFS+（或APFS）是不同的文件系统，它们在数据存储和管理方面有所差异。虽然Mac OS可以读取NTFS格式的磁盘，但由于不支持直接写入，因此需要进行额外的配置和挂载步骤。

## 业界解决办法

幸运的是，有一些第三方工具可以帮助我们在Mac OS下挂载NTFS磁盘，例如通过使用开源的`NTFS-3G`驱动程序或商业软件`Paragon NTFS`。这些工具可以使Mac OS能够完全访问和编辑NTFS格式的磁盘，提供更好的跨平台兼容性和灵活性。
但是免费软件`NTFS-3G`对普通用户有一些使用和上手成本，商业软件如`Paragon NTFS`相对贵一些。所以多少都存在一些问题。

而本文就是为了方便普通用户使用免费的方式挂在NTFS磁盘，你需要做的仅仅是复制命令，然后粘贴到Mac的终端执行就行了。

## 本文解决办法

### 安装相关工具

```shell
#安装Nigate
curl https://fastly.jsdelivr.net/gh/hoochanlon/Free-NTFS-for-Mac/nigate.sh > ~/Public/nigate.sh && sudo -S mkdir -p /usr/local/bin && cd /usr/local/bin && sudo ln -s ~/Public/nigate.sh nigate.shortcut && echo "alias nigate='bash nigate.shortcut'" >> ~/.zshrc && osascript -e 'tell application "Terminal" to do script "nigate"' && source .zshrc
#安装 `macfuse`和`ntfs-3g`
brew tap gromgit/homebrew-fuse
brew install --cask macfuse
brew install ntfs-3g-mac
```

### 识别U盘类的ntfs

命令行输入`nigate`，插入U盘就好了，会自动识别。


### mac windows双系统时挂在windows系统所在磁盘

这种情况与U盘类的区别在于这种mac和windows使用的是同一个物理硬盘的不同分区，至是在mac系统下没有识别到这个分区而已，我们需要手动加载一下。

记得修改下面命令中的`disk0s3`改为你自己的磁盘编号。可以使用`diskutil list`命令进行查看和确认。

```shell
sudo ntfs-3g /dev/disk0s3 /Volumes/ntfs -olocal -oallow_other -o auto_xattr
```

如果出现`Resource busy`问题，请执行下面的命令。记得修改下面命令中的`disk0s3`改为你自己的磁盘编号。可以使用`diskutil list`命令进行查看和确认。
```shell
diskutil unmount /dev/disk0s3
```
然后在执行下面的命令（记得修改下面命令中的`disk0s3`改为你自己的磁盘编号。可以使用`diskutil list`命令进行查看和确认）：

```shell
sudo ntfs-3g /dev/disk0s3 /Volumes/ntfs -olocal -oallow_other -o auto_xattr
```

这样就好了。

## 参考文章

- https://github.com/hoochanlon/Free-NTFS-for-Mac
- https://github.com/hoochanlon/Free-NTFS-for-Mac/issues/9

<!-- @include: ../scaffolds/post_footer.md -->