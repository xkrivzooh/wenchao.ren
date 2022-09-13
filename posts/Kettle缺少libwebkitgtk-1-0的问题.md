---
icon: page
author: xkrivzooh
date: 2020-01-03
category:
  - post
tag:
  - kettle
---

# Kettle缺少libwebkitgtk-1.0的问题

前几天在搭建kettle集群的时候出现Kettle缺少libwebkitgtk-1.0的问题，我司的server系统为centos7，google了一下发现centos7的解决办法还是和
kettle软件提示的解决办法还是有点区别的。因此记录一下。


```java
[blibee@1.d.fd.dev.bj1.wormpex.com /home/w/kettle/data-integration]$ sudo ./carte.sh ./pwd/carte-config-master-15000.xml
#######################################################################
WARNING:  no libwebkitgtk-1.0 detected, some features will be unavailable
    Consider installing the package with apt-get or yum.
    e.g. 'sudo apt-get install libwebkitgtk-1.0-0'
#######################################################################
```

解决办法：

```bash
sudo wget ftp://ftp.pbone.net/mirror/ftp5.gwdg.de/pub/opensuse/repositories/home:/matthewdva:/build:/EPEL:/el7/RHEL_7/x86_64/webkitgtk-2.4.9-1.el7.x86_64.rpm
sudo yum install webkitgtk-2.4.9-1.el7.x86_64.rpm
```
