---
icon: page
author: xkrivzooh
sidebar: false
date: 2023-09-28
category:
  - 编程
tag:
  - 编程
---

# 声明式编程 vs. 命令式编程


命令式编程和申明式编程都是一种编程范式，现代的编程语言基本两者都是支持的。那么这两者的区别是什么？以及怎么理解呢？

- 命令式编程：它通过明确指定计算机执行的每个步骤来描述问题的解决方法。在命令式编程中，程序员需要详细描述如何实现目标，包括控制流程、变量赋值和循环等细节。
- 申明式编程：它更关注描述问题的本质和目标，而不是具体的实现步骤。在申明式编程中，程序员只需描述问题的规则和约束，让计算机自行推导出解决方法。

也就是声明式工具要求开发者概述需要完成的任务，而命令式工具要求开发者详细说明任务应该如何执行，用最简单的描述就是：一个关注我要什么，一个关注怎么做。

以下是使用Java代码举例说明命令式编程和申明式编程的区别：

命令式编程示例：
```java
public class CommandProgrammingExample {
   public static void main(String[] args) {
       int sum = 0;
       for (int i = 1; i <= 10; i++) {
           sum += i;
       }
       System.out.println("Sum: " + sum);
   }
}
```

申明式编程示例：
```java
import java.util.stream.IntStream;

public class DeclarativeProgrammingExample {
   public static void main(String[] args) {
       int sum = IntStream.rangeClosed(1, 10)
               .sum();
       System.out.println("Sum: " + sum);
   }
}
```

在命令式编程示例中，我们使用循环来逐个累加数字，明确指定了计算的每个步骤。而在申明式编程示例中，我们使用Java 8的Stream API，通过声明式地描述数字范围和求和操作，让计算机自行推导出如何计算总和。通过比较这两个示例，可以看出申明式编程更加简洁和易读，程序员只需关注问题的本质，而不需要关注具体的实现细节。

## 声明式编程的应用

声明式编程通常在代码灵活性很重要的领域中发挥作用，例如数据库、配置管理软件以及最近的用户界面设计。

### 数据库

结构化查询语言（SQL）是一种声明性语言，用于管理（创建、读取、更新或删除项目）SQL数据库。例如，SQL命令`select * from customers where country="France"`通过底层SQL系统从数据库中获取法国国家的客户。上述代码并不包含“如何”的内容，这使得数据库管理员能够专注于更重要的职责。

### UI界面

用户界面的主要目的是传达系统的当前状态。这个“状态”指的是系统在特定时刻的条件。由于应用程序的内在复杂性和系统配置的变化等各种因素，有效地预见和反映所有可能的状态是具有挑战性的。用户界面开发分为两个阶段，设计和状态管理。

例如，在命令式用户界面设计中，你可能会编写如下代码：

```java
button = createButton()
button.setText("Click me")
button.setPosition(100, 100)
button.onClick{
    // 处理按钮点击事件
}
```

而在声明式用户界面设计中，你可能会写成：


```java
<Button
    text="Click me"
    position={[100, 100]}
    onClick={handleButtonClick}
/>
```

在声明式方法中，状态的变化会根据声明的关系自动传播，减少了对直接管理的需要，而在命令式方法中，状态的变化是由开发者显式触发和管理的。

传统的命令式方法手动处理用户界面“状态”经常导致错误，并逐渐演变为维护、测试和可扩展性方面的挑战。完全声明式方法被认为是定义UI设计未来的趋势，因为它的底层系统被用于UI设计和状态管理。比如Android领域越来越火的`Jetpack Compose`就是声明式的。



<!-- @include: ../scaffolds/post_footer.md -->
