---
icon: page
author: xkrivzooh
date: 2019-02-15
category:
  - post
tag:
  - 杂记
---

# Mac privoxy+Shadowsocks+iTerm2走代理

本篇文章讲述如何通过`Shadowsocks`和`privoxy`让mac的终端terminal可以翻墙

首先下载安装privoxy

```bash
brew install privoxy
```

默认就会启动privoxy，可通过以下终端命令查看privoxy进程是否启动成功：

```bash
ps aux | grep privoxy
```

然后配置privoxy，配置文件在`/usr/local/etc/privoxy/config`, 在文件末尾的`listen-address 127.0.0.1:8118`的下一行增加：
`forward-socks5 / 127.0.0.1:1086 .`，其中`1086`是shadowsocks的本地Sock5监听端口

终端执行以下两条命令即可访问privoxy：

```bash
export http_proxy='http://localhost:8118'
export https_proxy='http://localhost:8118'
```

一般建议将这2个命令增加到`zsh`的`.zshrc`文件中去。

至于terminal中ping google失败的问题，请参考[请问如何在ss代理下ping通google.com?](https://segmentfault.com/q/1010000006634279), 其实此时已经termianl可以访问外网了，不信的话试试：

```bash
~ » curl -I -XGET https://www.google.com
HTTP/1.1 200 Connection established

HTTP/2 200
date: Thu, 14 Feb 2019 16:18:17 GMT
expires: -1
cache-control: private, max-age=0
content-type: text/html; charset=ISO-8859-1
p3p: CP="This is not a P3P policy! See g.co/p3phelp for more info."
server: gws
x-xss-protection: 1; mode=block
x-frame-options: SAMEORIGIN
set-cookie: 1P_JAR=2019-02-14-16; expires=Sat, 16-Mar-2019 16:18:17 GMT; path=/; domain=.google.com
set-cookie: NID=160=Mggo_ejHqi_HSj4vULKNmc47pjxGoKK0qcewujmXpdUm9avyK-vw09NrkF_mGZJdRVznZpvww2dlwh8C8LvhyX9KIEQFDQXtN7v0Gt9QrBaBWB1_9HN0XhXaDI0MFP2p_Y519oso-yZggi6HpZ_HynnMyih3EcdQW4nyYQQKXSo; expires=Fri, 16-Aug-2019 16:18:17 GMT; path=/; domain=.google.com; HttpOnly
alt-svc: quic=":443"; ma=2592000; v="44,43,39"
accept-ranges: none
vary: Accept-Encoding
```

<!-- @include: ../scaffolds/post_footer.md -->
