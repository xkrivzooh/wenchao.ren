---
title: terminal快捷键
toc: true
date: 2019-02-11 17:21:47
tags: ['linux']
draft: false
---

## 终端跳转解说图

![bash-shortcut.jpg](http://7niucdn.wenchao.ren/bash-shortcut.jpg)

## 常用快捷键

### 编辑

- Ctrl + a – 跳到行首
- Ctrl + e – 跳到行尾
- Ctrl + k – 删除当前光标至行尾内容
- Ctrl + u – 删除当前光标至行首内容
- Ctrl + w – 删除当前光标至词首内容
- Ctrl + y – 将剪切的内容粘贴在光标后
- Ctrl + xx – 在行首和当前光标处(来回)移动
- Alt + b – 跳到词首
- Alt + f – 跳到词尾
- Alt + d – 删除自光标处起的单词内容
- Alt + c – 大写光标处的字符（注：该条内容与原文不同）
- Alt + u – 大写自光标处起的单词内容
- Alt + l – 小写自光标处起的单词内容
- Alt + t – 将光标处单词与上一个词交换
- Ctrl + f – 向前移动一个字符(相当于按向左箭头)
- Ctrl + b – 向后移动一个字符(相当于按向右箭头)
- Ctrl + d – 删除光标后一个字符（相当于按Delete）
- Ctrl + h – 删除光标前一个字符（相当于按后退键）
- Ctrl + t – 交换光标处的两个字符
 
### 搜索

- Ctrl + r – 反向搜索历史命令
- Ctrl + g – 退出历史搜索模式（相当于按Esc）
- Ctrl + p – 上一个历史命令（相当于按向上箭头）
- Ctrl + n – 下一个历史命令（相当于按向下箭头）
- Alt + . – 使用上一个命令的最后一个单词

### 控制

- Ctrl + l – 清屏
- Ctrl + s – 终止输出到屏幕（对长时间运行并打印详细信息的命令）
- Ctrl + q – 允许输出到屏幕（如果之前用过终止输出命令）
- Ctrl + c – 终止命令
- Ctrl + z – 中断命令

### Bang(即感叹号)

- !! – 执行上一条命令
- !blah –执行最近运行过的以blah开头的命令
- !blah:p – 打印!blah要执行的命令（并将其作为最后一条命令加入到命令历史中）
- !$ – 上一条命令的最后一个单词 (等同于Alt + .)
- !$:p – 打印!$指代的单词
- !* – 上一条命令除最后一个词的部分
- !*:p – 打印!*指代部分

## 参考资料

- [Bash Shortcuts For Maximum Productivity](https://skorks.com/2009/09/bash-shortcuts-for-maximum-productivity/)