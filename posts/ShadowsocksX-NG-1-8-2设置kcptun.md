---
icon: page
author: xkrivzooh
date: 2019-02-01
category:
  - post
tag:
  - 杂记
---

# ShadowsocksX-NG 1.8.2设置kcptun

在自己的mac上升级了一下`ShadowsocksX-NG`到`1.8.2`版本。发现无法使用了，检查发现新版本中没有设置`kcptun`的地方了，

新版本在【服务器设置】的地方
- `插件`输入框中写`kcptun`
- `插件选项`写：`key=【此处为自己的key】;crypt=aes;mode=fast2;mtu=1350;sndwnd=2048;rcvwnd=2048;datashard=10;parityshard=3;dscp=0`

检查发现`kcptun`会自动打开

```bash
~ » ps -ef | grep kcp
  501 31273 31272   0  5:52PM ??         0:00.37 plugins/kcptun
```

参考资料
- [1.8.2 kcptun 自带的和1.7.1不同，如何打开kcptun #926](https://github.com/shadowsocks/ShadowsocksX-NG/issues/926)
