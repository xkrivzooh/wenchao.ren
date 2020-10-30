---
title: linux命令-grep
toc: true
date: 2019-03-11 20:50:48
tags: ['linux']
draft: false
---

## 常见参数说明

```bash
grep [OPTIONS] PATTERN [FILE...]
grep [OPTIONS] [-e PATTERN]...  [-f FILE]...  [FILE...]

    OPTIONS:
    -e: 使用正则搜索
    -i: 不区分大小写
    -v: 查找不包含指定内容的行
    -w: 按单词搜索
    -c: 统计匹配到的次数
    -n: 显示行号
    -r: 逐层遍历目录查找
    -A: 显示匹配行及前面多少行, 如: -A3, 则表示显示匹配行及前3行
    -B: 显示匹配行及后面多少行, 如: -B3, 则表示显示匹配行及后3行
    -C: 显示匹配行前后多少行,   如: -C3, 则表示显示批量行前后3行
    --color: 匹配到的内容高亮显示
    --include: 指定匹配的文件类型
    --exclude: 过滤不需要匹配的文件类型
```

## 常见用法

```bash
    #多文件查询
    grep leo logs.log logs_back.log

    #查找即包含leo又包含li的行
    grep leo logs.log | grep li

    #查找匹配leo或者匹配li的行
    grep leo | li logs.log

    #显示匹配行前2行
    grep leo logs.log -A2

    #显示匹配行后2行
    grep leo logs.log -B2

    #显示匹配行前后2行
    grep leo logs.log -C2

    #不区分大小写
    grep -i leo logs.log

    #使用正则表达式
    grep -e '[a-z]\{5\}' logs.log

    #查找不包含leo的行
    grep -v leo logs.log

    #统计包含leo的行数
    grep -c leo logs.log

    #遍历当前目录及所有子目录查找匹配leo的行
    grep -r leo .

    #在当前目录及所有子目录查找所有java文件中查找leo
    grep -r leo . --include "*.java"

    #在搜索结果中排除所有README文件
    grep "main()" . -r --exclude "README"

    #查找并输出到指定文件
    grep leo logs.log > result.log

    #查找以leo开头的行
    grep ^leo logs.log

    #查找以leo结尾的行
    grep leo$ logs.log

    #查找空行
    grep ^$ logs.log
```