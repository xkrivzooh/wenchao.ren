---
icon: page
author: xkrivzooh
date: 2021-04-12
sidebar: false
category:
  - post
tag:
  - java
  - 中间件
---

# "Error Prone的介绍和使用"

Error Prone的介绍和使用


今天在浏览GitHub的时候突然看到Google有一个项目[Error Prone](https://github.com/google/error-prone):
> Catch common Java mistakes as compile-time errors

官方网站：[https://errorprone.info/](https://errorprone.info/)

## Error Prone是什么？

然后就翻看了一下官方文档了解了一下具体的作用。如果你之前没有了解过这个Error Prone，你可以把他对标为Snoar，FindBugs之类的静态代码分析工具就行。Error Prone就是Google研发的静态代码扫描工具，顾名思义，就是用于扫描Java各种易于出错的代码。

## Error Prone产生的背景

Google在这篇论文`Lessons from Building Static Analysis Tools at Google`

- PDF [Lessons from Building Static Analysis Tools at Google](https://storage.googleapis.com/pub-tools-public-publication-data/pdf/3198e114c4b70702b27e6d88de2c92734c9ac4c0.pdf)
- HTML [Lessons from Building Static Analysis Tools at Google](https://dl.acm.org/doi/fullHtml/10.1145/3188720)

中也提到了Google之前是如何做静态代码分析，以及Error Prone产生的一些原因。简单整理一下就是：

> Google内部早期使用FindBugs作为自己的静态代码分析工具，然后FindBug这种工具一般是定时触发重发，然后生成一个仪表盘，但是问题是大家一般都不会主动去翻看这个仪表盘，因为这个仪表盘不会在开发人员的常规工作流程中，于是Google内部发起了一个`FixIt`的小活动，简单说就是来集中几天解决这些发现的代码问题，后来他们将FindBugs等分析工具和Code Review工作结合起来搞了一个小平台，但是当时的内部整合不太好，使得开发人员觉的难用，也不怎么信任这个整合平台了。

于是了，Google内部觉的，这种静态代码分析工作应该是参与到持续继承中，而且最好要`快速，频繁，参与到开发人员的常规工作中，并且最好不但要发现问题，还要告诉开发人员怎么修`。于是了，Google参考了之前Clang的一个经验，将静态代码分析工作整合到了`javac`，也就是在编译期来做静态代码分析工作，于是后来就有了这篇文章提到的Error Prone。

## Error Prone的基本使用

我工作中一直使用的是Intellij+JDK8+Maven，所以参考官方文档[https://errorprone.info/docs/installation](https://errorprone.info/docs/installation)，写了一个JDK8使用的小例子。下面贴一下核心代码。

首先是pom.xml中的配置，核心在于`maven-compiler-plugin`插件的配置, 同时因为大家项目开发过程中一般会使用Lombok等annotation processor依赖，所以下面的实例代码中也展示了ErrorProne如何和Lombok等依赖整合。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.4.4</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>com.example</groupId>
    <artifactId>demo</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>demo</name>
    <description>Demo project for Spring Boot</description>
    <properties>
        <java.version>1.8</java.version>
        <javac.version>9+181-r4173-1</javac.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>com.google.guava</groupId>
            <artifactId>guava</artifactId>
            <version>19.0</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.18</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.0</version>
                <configuration>
                    <source>8</source>
                    <target>8</target>
                    <encoding>UTF-8</encoding>
                    <compilerArgs>
                        <arg>-XDcompilePolicy=simple</arg>
                        <arg>-Xplugin:ErrorProne</arg>
                    </compilerArgs>
                    <annotationProcessorPaths>
                        <path>
                            <groupId>com.google.errorprone</groupId>
                            <artifactId>error_prone_core</artifactId>
                            <version>2.5.1</version>
                        </path>
                        <path>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                            <version>1.18.18</version>
                        </path>
                        <!-- Other annotation processors go here.

                        If 'annotationProcessorPaths' is set, processors will no longer be
                        discovered on the regular -classpath; see also 'Using Error Prone
                        together with other annotation processors' below. -->
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
        </plugins>
    </build>

<!--    &lt;!&ndash; using github.com/google/error-prone-javac is required when running on JDK 8 &ndash;&gt;-->
<!--    <profiles>-->
<!--        <profile>-->
<!--            <id>jdk8</id>-->
<!--            <activation>-->
<!--                <jdk>1.8</jdk>-->
<!--            </activation>-->
<!--            <build>-->
<!--                <plugins>-->
<!--                    <plugin>-->
<!--                        <groupId>org.apache.maven.plugins</groupId>-->
<!--                        <artifactId>maven-compiler-plugin</artifactId>-->
<!--                        <configuration>-->
<!--                            <fork>true</fork>-->
<!--                            <compilerArgs combine.children="append">-->
<!--                                <arg>-J-Xbootclasspath/p:${settings.localRepository}/com/google/errorprone/javac/${javac.version}/javac-${javac.version}.jar</arg>-->
<!--                            </compilerArgs>-->
<!--                        </configuration>-->
<!--                    </plugin>-->
<!--                </plugins>-->
<!--            </build>-->
<!--        </profile>-->
<!--    </profiles>-->

</project>
```

然后我在我自己的Idea中安装了插件`Error Prone Compiler` 插件主页：[https://plugins.jetbrains.com/plugin/7349-error-prone-compiler](https://plugins.jetbrains.com/plugin/7349-error-prone-compiler) 

> 注意：官方文档中也可以手动指定javac，这个看官网文档就行

然后修改idea工程配置，将java compiler从默认的`javac`修改为`javac with error-prone`。然后工程中写一段测试代码：

测试代码1：
```java
import java.util.Set;
import java.util.HashSet;

public class ShortSet {
  public static void main (String[] args) {
    Set<Short> s = new HashSet<>();
    for (short i = 0; i < 100; i++) {
      s.add(i);
      s.remove(i - 1);
    }
    System.out.println(s.size());
  }
}

```

测试代码2：
```java
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class ArrayToString {

    public void test() {
        String[] array = new String[]{"a", "b"};
        log.info(array.toString());
    }
}
```

然后编译工程，会出现：
```java
//针对实例1代码会出现
/Users/xkrivzooh/IdeaProjects/mt/demo/src/main/java/com/example/demo/pattern/ShortSet.java:11:15
java: [CollectionIncompatibleType] Argument 'i - 1' should not be passed to this method; its type int is not compatible with its collection's type argument Short
    (see https://errorprone.info/bugpattern/CollectionIncompatibleType)
  Did you mean '@SuppressWarnings("CollectionIncompatibleType") public static void main (String[] args) {'?

//针对实例2代码会出现
/Users/xkrivzooh/IdeaProjects/mt/demo/src/main/java/com/example/demo/pattern/ArrayToString.java:10:18
java: [ArrayToString] Calling toString on an array does not provide useful information
    (see https://errorprone.info/bugpattern/ArrayToString)
  Did you mean 'log.info(Arrays.toString(array));'?
```

以上就是Error Prone的基本使用了

## Error Prone 和FindBugs/Snoar的基本对比

Sonar和FindBugs类似，Sonar和FindBugs做的也非常不错，里面的用例很足，都有不少的公司在用，**但是这种东西最大的问题是，需要开发人员有意识的去使用它**。所以在我呆过的qunar和美团，都是在开发环境的某一个阶段，比如项目提测之前，有一个Sonar等的代码检查阶段来做静态代码分析，然后CM同学会根据是否有阻断性问题来让不让项目提测。但是实际观察来看，很多项目都最终停止掉了代码检查，或者仅仅要求每次发布不新增`阻断性问题`，也算是一种变相妥协吧。

而Google的这个Error Prone最大的优势就是整合到了javac中，这样开发人员相当于被强制必须FIX问题。所以最终具体用哪个，都还好，只要有意识的去用就是好同学。
