---
title: Linux查看端口占用情况
toc: true
date: 2019-02-14 23:10:41
tags: ['linux']
draft: false
---

排查问题的时候，可能需要知道这个端口目前被哪个服务占用着，在linux中，一般会用到`lsof`和`netstat`这2个命令。比如检查80端口的占用情况

## lsof

```bash
[root@VM_43_49_centos ~]# sudo lsof -i:80
COMMAND   PID  USER   FD   TYPE    DEVICE SIZE/OFF NODE NAME
nginx    5358  root    6u  IPv4 236554022      0t0  TCP *:http (LISTEN)
nginx    5358  root    7u  IPv6 236554023      0t0  TCP *:http (LISTEN)
nginx   28325 nginx    6u  IPv4 236554022      0t0  TCP *:http (LISTEN)
nginx   28325 nginx    7u  IPv6 236554023      0t0  TCP *:http (LISTEN)
```

## netstat

```bash
[root@VM_43_49_centos ~]# sudo netstat -tunlp | grep 80
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      5358/nginx: master
tcp6       0      0 :::80                   :::*                    LISTEN      5358/nginx: master
```

注意在Mac上面，`netstat`的命令可能会出现下面的异常：

```bash
~ » netstat -tunlp | grep 80
netstat: option requires an argument -- p
Usage:	netstat [-AaLlnW] [-f address_family | -p protocol]
	netstat [-gilns] [-f address_family]
	netstat -i | -I interface [-w wait] [-abdgRtS]
	netstat -s [-s] [-f address_family | -p protocol] [-w wait]
	netstat -i | -I interface -s [-f address_family | -p protocol]
	netstat -m [-m]
	netstat -r [-Aaln] [-f address_family]
	netstat -rs [-s]
```

查询了一下stackoverflow，发现[How to query ports are using by one process with knowing its name or pid on mac?](https://stackoverflow.com/questions/36443485/how-to-query-ports-are-using-by-one-process-with-knowing-its-name-or-pid-on-mac)：

If you are only interested in inet ports then you can use:

```bash
netstat -anvf inet
```

Or TCP sockets:

```bash
netstat -anvp tcp
```

Or UDP sockets:

```bash
netstat -anvp udp
```
