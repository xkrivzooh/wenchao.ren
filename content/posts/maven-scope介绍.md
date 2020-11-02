---
title: maven scope介绍
toc: true
date: 2019-08-01 12:03:33
tags: ['java']
draft: false
---

maven的scope有下面6种：
- test
- compile 默认scope
- runntime
- provided
- system
- import

下面我们分别说一下每个scope的含义

## test

scope为test表示依赖项目仅仅参与测试相关的工作，包括测试代码的编译，执行，test scope的依赖项不具有传递性，仅适用于测试和执行类路径。

一般像我们使用的`junit`的测试相关的jar都是使用test scope的，比如：

```xml
<!-- https://mvnrepository.com/artifact/junit/junit -->
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.12</version>
    <scope>test</scope>
</dependency>
```

## compile

maven的scope默认就是compile，什么都不配置也就是意味着compile。compile表示被依赖项目需要参与当前项目的编译，当然后续的测试，运行周期也参与其中
，是一个比较强的依赖。打包的时候通常需要包含进去，具有依赖传递性。

比如：

```xml
<dependency>
    <groupId>commons-lang</groupId>
    <artifactId>commons-lang</artifactId>
    <version>2.6</version>
</dependency>
```

## runntime

runntime表示被依赖项目无需参与项目的编译，不过后期的测试和运行周期需要其参与。与compile相比，跳过编译而已，说实话在终端的项目（非开源，企业内部系统）中，和compile区别不是很大。compile只需要知道接口就足够了。mysql jdbc驱动架包就是一个很好的例子，一般scope为runntime。另外runntime的依赖通常和optional搭配使用，optional为true。我可以用A实现，也可以用B实现。

比较常见的`mysql-connector-java`一般就设置为runtime scope：

```xml
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>6.0.6</version>
    <scope>runtime</scope>
</dependency>
```

## provider

provided意味着打包的时候可以不用包进去，别的设施(比如jdk或者其他的Web Container)会提供。事实上该依赖理论上可以参与编译，测试，运行等周期。相当于compile，但是在打包阶段做了exclude的动作。
provider scope的一个很好的用例是部署在某个容器（如tomcat）中的Web应用程序，其中容器本身已经提供了一些库。比如常见的servlet-api一般就是provider的：

```xml
<dependency>
    <groupId>javax.servlet</groupId>
    <artifactId>servlet-api</artifactId>
    <version>2.5</version>
    <scope>provided</scope>
</dependency>
```

## system

从参与度来说，也provided相同，不过被依赖项不会从maven仓库抓，而是从本地文件系统拿，一定需要配合systemPath属性使用。需要记住的重要一点是，如果不存在依赖关系或者位于与systemPath指向的位置不同的位置，则在不同的计算机上构建具有系统范围依赖关系的项目可能会失败：

一个例子：

```xml
<dependency>
    <groupId>com.baeldung</groupId>
    <artifactId>custom-dependency</artifactId>
    <version>1.3.2</version>
    <scope>system</scope>
    <systemPath>${project.basedir}/libs/custom-dependency-1.3.2.jar</systemPath>
</dependency>
```

## import

此范围已在Maven 2.0.9中添加，并且仅适用于依赖类型pom。 一般我们会在`dependencyManagement`中使用这个来限定version

一般的用法为：

```xml
<dependency>
    <groupId>com.xxx</groupId>
    <artifactId>xxx-xxx</artifactId>
    <version>1.3.2</version>
    <type>pom</type>
    <scope>import</scope>
</dependency>
```

## scope的依赖传递

A–>B–>C。当前项目为A，A依赖于B，B依赖于C。知道B在A项目中的scope，那么怎么知道C在A中的scope呢？

答案是： 当C是test或者provided时，C直接被丢弃，A不依赖C； 否则A依赖C，C的scope继承于B的scope。

![scope的依赖传递](http://wenchao.ren/img/2020/11/20190801125748.png)
