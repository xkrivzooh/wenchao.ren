---
icon: page
author: xkrivzooh
date: 2018-12-27
sidebar: false
category:
  - post
tag:
  - nginx
---

# 使用Let's Encrypt配置nginx证书

Automatically enable HTTPS on your website with EFF's Certbot, deploying Let's Encrypt certificates

主要参考：[https://certbot.eff.org/lets-encrypt/centosrhel7-nginx](https://certbot.eff.org/lets-encrypt/centosrhel7-nginx)

操作起来很简单，主要用到了下面的命令：

```shell
sudo yum install nginx
sudo certbot --nginx
sudo certbot renew --dry-run
0 0 1 * * certbot renew --post-hook "/usr/sbin/nginx -s reload"
```
