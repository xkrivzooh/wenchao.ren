---
icon: book
author: xkrivzooh
date: 2019-02-13
category:
  - 专题
  - dubbo
tag:
  - dubbo
---

# dubbo-SPI扩展(一)

本篇文章描述一下dubbo的扩展性实现，主要有下面几个部分：

- 什么叫可扩展性
- 常见的扩展性的解决方案
- java spi简介
- 为什么dubbo不采用java spi，而是自己实现一个SPI机制呢
- dubbo spi基本使用
- dubbo扩展点的基本概念
- dubbo SPI源码阅读

本篇文章也参考了很多业界资料，详见文件结尾

## 什么叫可扩展性

如同罗马不是一天建成的，任何系统都一定是从小系统不断发展成为大系统的，想要从一开始就把系统设计的足够完善是不可能的，相反的，我们应该关注当下的需求，然后再不断地对系统进行迭代。在代码层面，要求我们适当的对关注点进行抽象和隔离，在软件不断添加功能和特性时，依然能保持良好的结构和可维护性，同时允许第三方开发者对其功能进行扩展。在某些时候，软件设计者对扩展性的追求甚至超过了性能。

在谈到软件设计时，可扩展性一直被谈起，那到底什么才是可扩展性，什么样的框架才算有良好的可扩展性呢？它必须要做到以下两点:

- **作为框架的维护者，在添加一个新功能时，只需要添加一些新代码，而不用大量的修改现有的代码，即符合开闭原则。**
- **作为框架的使用者，在添加一个新功能时，不需要去修改框架的源码，在自己的工程中添加代码即可。**
  
Dubbo很好的做到了上面两点。这要得益于Dubbo的微内核+插件的机制。接下来的章节中我们会慢慢揭开Dubbo扩展机制的神秘面纱。

## 常见的扩展性的解决方案

- Factory模式
- IoC容器
- OSGI容器

Dubbo作为一个框架，不希望强依赖其他的IoC容器，比如Spring，Guice。OSGI也是一个很重的实现，不适合Dubbo。最终Dubbo的实现参考了Java原生的SPI机制，但对其进行了一些扩展，以满足Dubbo的需求。

## java spi简介

SPI 全称为 `Service Provider Interface`，是一种服务发现机制。SPI 的本质是将接口实现类的全限定名配置在文件中，并由服务加载器读取配置文件，加载实现类。这样可以在运行时，动态为接口替换实现类。正因此特性，我们可以很容易的通过 SPI 机制为我们的程序提供拓展功能。

本节通过一个示例演示 Java SPI 的使用方法。首先，我们定义一个接口，名称为 Robot。

```java
public interface Robot {
    void sayHello();
}
```

接下来定义两个实现类，分别为 OptimusPrime 和 Bumblebee。

```java
public class OptimusPrime implements Robot {
    
    @Override
    public void sayHello() {
        System.out.println("Hello, I am Optimus Prime.");
    }
}

public class Bumblebee implements Robot {

    @Override
    public void sayHello() {
        System.out.println("Hello, I am Bumblebee.");
    }
}
```

接下来 `META-INF/services` 文件夹下创建一个文件，名称为 Robot 的全限定名 `org.apache.spi.Robot`。文件内容为实现类的全限定的类名，如下：

```
org.apache.spi.OptimusPrime
org.apache.spi.Bumblebee
```

做好所需的准备工作，接下来编写代码进行测试。

```java
public class JavaSPITest {

    @Test
    public void sayHello() throws Exception {
        ServiceLoader<Robot> serviceLoader = ServiceLoader.load(Robot.class);
        System.out.println("Java SPI");
        serviceLoader.forEach(Robot::sayHello);
    }
}
```

程序将输出：

```
JAVA SPI
Hello, I am Optimus Prime.
Hello, I am Bumblebee.
```

从测试结果可以看出，我们的两个实现类被成功的加载，并输出了相应的内容。关于 Java SPI 的演示先到这里

## 为什么dubbo不采用java spi，而是自己实现一个SPI机制呢

Java SPI的使用很简单。也做到了基本的加载扩展点的功能。但Java SPI有以下的不足:

- 需要遍历所有的实现，并实例化，然后我们在循环中才能找到我们需要的实现。
- 配置文件中只是简单的列出了所有的扩展实现，而没有给他们命名。导致在程序中很难去准确的引用它们。
- 扩展如果依赖其他的扩展，做不到自动注入和装配
- 不提供类似于Spring的IOC和AOP功能
- 扩展很难和其他的框架集成，比如扩展里面依赖了一个Spring bean，原生的Java SPI不支持

所以Java SPI应付一些简单的场景是可以的，但对于Dubbo，它的功能还是比较弱的。Dubbo对原生SPI机制进行了一些扩展。接下来，我们就更深入地了解下Dubbo的SPI机制。

Dubbo 改进了 JDK 标准的 SPI 的以下问题：

- JDK 标准的 SPI 会一次性实例化扩展点所有实现，如果有扩展实现初始化很耗时，但如果没用上也加载，会很浪费资源。
- 如果扩展点加载失败，连扩展点的名称都拿不到了。比如：JDK 标准的 ScriptEngine，通过 getName() 获取脚本类型的名称，但如果 RubyScriptEngine 因为所依赖的 jruby.jar 不存在，导致 RubyScriptEngine 类加载失败，这个失败原因被吃掉了，和 ruby 对应不起来，当用户执行 ruby 脚本时，会报不支持 ruby，而不是真正失败的原因。
- 增加了对扩展点 IoC 和 AOP 的支持，一个扩展点可以直接 setter 注入其它扩展点。

其实最核心的改进是第一个和第三个问题。

## dubbo spi基本使用

我们继续使用上面的例子。由于Dubbo 并未使用 Java SPI，而是重新实现了一套功能更强的 SPI 机制。Dubbo SPI 的相关逻辑被封装在了 `ExtensionLoader` 类中，通过 ExtensionLoader，我们可以加载指定的实现类。Dubbo SPI 所需的配置文件需放置在 `META-INF/dubbo` 路径下，配置内容如下。

```java
optimusPrime = org.apache.spi.OptimusPrime
bumblebee = org.apache.spi.Bumblebee
```

需要在 `Robot` 接口上标注 `@SPI` 注解。下面来演示 Dubbo SPI 的用法：

```java
public class DubboSPITest {

    @Test
    public void sayHello() throws Exception {
        ExtensionLoader<Robot> extensionLoader = 
            ExtensionLoader.getExtensionLoader(Robot.class);
        Robot optimusPrime = extensionLoader.getExtension("optimusPrime");
        optimusPrime.sayHello();
        Robot bumblebee = extensionLoader.getExtension("bumblebee");
        bumblebee.sayHello();
    }
}
```
程序将输出
```
Hello, I am Optimus Prime.
Hello, I am Bumblebee.
```


## 参考资料

- [Introduction to the Service Provider Interfaces](https://docs.oracle.com/javase/tutorial/sound/SPI-intro.html)
- [Class ServiceLoader](https://docs.oracle.com/javase/7/docs/api/java/util/ServiceLoader.html)
- [Java SPI例子](https://www.baeldung.com/java-spi)
- 
