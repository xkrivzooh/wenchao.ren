---
title: pt-fingerprint 安装和基本使用
toc: true
date: 2019-09-10 19:23:41
tags: ['mysql']
draft: false
---

```bash
sudo wget percona.com/get/percona-toolkit.tar.gz

## 安装相关依赖
sudo yum install perl -y
sudo yum install perl-DBI -y
sudo yum install perl-DBD-MySQL -y
sudo yum install perl-Time-HiRes -y
sudo yum install perl-IO-Socket-SSL -y
sudo yum install perl-Digest-MD5.x86_64 -y
```

初步使用

```bash
[$ /home/w/percona/percona-toolkit-3.0.13/bin]$ ./pt-fingerprint --query "select a, b, c from users where id = 500"
select a, b, c from users where id = ?
[$ /home/w/percona/percona-toolkit-3.0.13/bin]$ ./pt-fingerprint --query "update test set a =1 , b=2 where id = 3"
update test set a =? , b=? where id = ?
[$ /home/w/percona/percona-toolkit-3.0.13/bin]$ ./pt-fingerprint --query "update test set a =1 , b=2 where id = 5"
update test set a =? , b=? where id = ?
[$ /home/w/percona/percona-toolkit-3.0.13/bin]$
[$ /home/w/percona/percona-toolkit-3.0.13/bin]$ ./pt-fingerprint --query "insert into a(id) values (1)"
insert into a(id) values(?+)
[$ /home/w/percona/percona-toolkit-3.0.13/bin]$ ./pt-fingerprint --query "insert into a(id) values (2)"
insert into a(id) values(?+)
[$ /home/w/percona/percona-toolkit-3.0.13/bin]$ ./pt-fingerprint --query "delete from test where id = 2"
delete from test where id = ?
[$ /home/w/percona/percona-toolkit-3.0.13/bin]$ ./pt-fingerprint --query "delete from test where id = 3"
delete from test where id = ?
[$ /home/w/percona/percona-toolkit-3.0.13/bin]$
```

不过发现pt-fingerprint执行速度有点慢，我自己写了一个java程序，程序中调用命令行来执行pt-fingerprint命令，执行20批次，没个批次执行100次命令：

```java
	@Test
	public void execute() {
		ShellCommandExecutor shellCommandExecutor = new ShellCommandExecutor();

		for (int j = 0; j < 20; j++) {
			long start = System.currentTimeMillis();
			for (int i = 0; i < 100; i++) {
				ShellCommandExecInputer commandExecInputer = new ShellCommandExecInputer();
				commandExecInputer.setCommand("./pt-fingerprint --query \"select a, b, c from users where id = 500\"");
				commandExecInputer.setCommandExecDir("/Users/rollenholt/Downloads/percona/percona-toolkit-3.0.13/bin");
				ShellCommandExecResult execResult = shellCommandExecutor.execute(commandExecInputer);
				Assert.assertTrue(execResult.isOk());
			}
			long end = System.currentTimeMillis();
			System.out.println((end - start) );
		}
	}
```

输出如下（单位毫秒，每执行100次pt-fingerprint命令耗时）
5520
5477
4898
4714
4708
4742
4729
4710
4714
5127
4801
4733
5472
5429
4870
5077
4935
5226
5461
5008

为了排查程序写的搓的影响，在机器上尝试执行了一下，发现耗时也比较长

```bash
[$ /home/w/percona/percona-toolkit-3.0.13/bin]$ time ./pt-fingerprint --query "delete from test where id = 3"
delete from test where id = ?

real	0m0.042s
user	0m0.038s
sys	0m0.004s
```

在我们的业务常见下基本不可用，太慢了。
