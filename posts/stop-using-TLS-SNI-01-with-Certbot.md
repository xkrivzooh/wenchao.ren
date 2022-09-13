---
icon: page
author: xkrivzooh
sidebar: false
date: 2019-01-28
category:
  - post
tag:
  - 杂记
---

# stop using TLS-SNI-01 with Certbot

今天收到一个来自letsencrypt的邮件：`Action required: Let's Encrypt certificate renewals`，简单的说就是Let’s Encrypt移除了对`TLS-SNI-01`的支持。
所以我就按照他们的指示，修改了一下我的certbot配置。操作步骤如下:

## 检查certbot的版本大于0.28

使用命令`certbot --version`来检查命令。我检查的时候发现我的版本比0.28低，所以我需要升级一下：

```shell
[root@VM_43_49_centos workspace]# certbot --version
certbot 0.26.1

sudo yum upgrade certbot
```

我在使用`sudo yum upgrade certbot`以后，测试版本出现下面的异常：

```shell
[root@VM_43_49_centos workspace]# certbot --version
Traceback (most recent call last):
  File "/usr/bin/certbot", line 5, in <module>
    from pkg_resources import load_entry_point
  File "/usr/lib/python2.7/site-packages/pkg_resources.py", line 3011, in <module>
    parse_requirements(__requires__), Environment()
  File "/usr/lib/python2.7/site-packages/pkg_resources.py", line 626, in resolve
    raise DistributionNotFound(req)
pkg_resources.DistributionNotFound: acme>=0.29.0
[root@VM_43_49_centos workspace]# yum list | grep acme
Repository epel is listed more than once in the configuration
```

所以我还需要升级一下
```shell
sudo yum upgrade python2-acme.noarch
```

升级完以后检查版本
```shell
[root@VM_43_49_centos workspace]# certbot --version
certbot 0.29.1
```

## Remove any explicit references to tls-sni-01 in your renewal configuration:

执行下面的命令

```shell
sudo sh -c "sed -i.bak -e 's/^\(pref_challs.*\)tls-sni-01\(.*\)/\1http-01\2/g' /etc/letsencrypt/renewal/*; rm -f /etc/letsencrypt/renewal/*.bak"
```

## Do a full renewal dry run:

```shell
sudo certbot renew --dry-run
```

## 参考资料

- [How to stop using TLS-SNI-01 with Certbot](https://community.letsencrypt.org/t/how-to-stop-using-tls-sni-01-with-certbot/83210)
