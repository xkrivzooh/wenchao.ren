---
icon: page
author: xkrivzooh
date: 2020-10-19
sidebar: false
category:
  - post
tag:
  - 杂记
---

# chrome 和ie首页被劫持的解决办法

最近家里台式机的电脑的chrome和ie的首页被劫持，现象就是打开浏览器后地址栏为：[http://kb1.gndh888.top](http://kb1.gndh888.top)，
然后过几秒就跳转到hao123网站。

这次的浏览器劫持比我之前遇到的劫持更恶心，之前的劫持通过360或者qq软件管家fix一下就解决了，这次的劫持这2个工具都没起作用，我也
按照网上的一些教程看注册表，看chrome的启动参数等等的都没有发现问题。

一开始的临时解法是对chrome.exe重命名一下，比如重命名为chrome11.exe虽然就不会出现这个问题，但是这样属于治标不治本。恶心了一周时间。
后来看到有人说使用火绒恶意木马专杀工具， 我其实没抱希望测试了一下，发现居然可以解决这个问题。

[火绒恶意木马专杀工具(直接下载)](http://down5.huorong.cn/hrkill-1.0.0.33.exe), 修复完重启一下，然后运行了一下解决了。




<!-- @include: ../scaffolds/post_footer.md -->
