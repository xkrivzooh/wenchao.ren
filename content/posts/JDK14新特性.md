---
title: "JDK14新特性"
date: 2022-08-14T16:01:11+08:00
draft: false
tags: ['java']
---

Java 14 已如期于 2020 年 3 月 17 日正式发布，此次更新是继半年前 Java 13 这大版本发布之后的又一次常规版本更新。在这一版中，主要带来了 ZGC 增强、instanceof 增强、Switch 表达式更新为标准版等方面的改动、增强和新功能。本文主要介绍 Java 14 中的主要新特性，带您快速了解 Java 14 带来了哪些不一样的体验和便利。

![JDK14新特性](http://wenchao.ren/img/2022/08/1660464142-0560f3f1b78fbc2c9102db7857c4aca2-20220814160221.png)

## 语言特性增强

### JEP 359: Switch 表达式（正式版）

switch 表达式在之前的 Java 12 和 Java 13 中都是处于预览阶段，而在这次更新的 Java 14 中，终于成为稳定版本，能够正式可用。

switch 表达式带来的不仅仅是编码上的简洁、流畅，也精简了 switch 语句的使用方式，同时也兼容之前的 switch 语句的使用；之前使用 switch 语句时，在每个分支结束之前，往往都需要加上 break 关键字进行分支跳出，以防 switch 语句一直往后执行到整个 switch 语句结束，由此造成一些意想不到的问题。switch 语句一般使用冒号 ：来作为语句分支代码的开始，而 switch 表达式则提供了新的分支切换方式，即 -> 符号右则表达式方法体在执行完分支方法之后，自动结束 switch 分支，同时 -> 右则方法块中可以是表达式、代码块或者是手动抛出的异常。以往的 switch 语句写法如下：

```java
int dayOfWeek;
switch (day) {
    case MONDAY:
    case FRIDAY:
    case SUNDAY:
        dayOfWeek = 6;
        break;
    case TUESDAY:
        dayOfWeek = 7;
        break;
    case THURSDAY:
    case SATURDAY:
        dayOfWeek = 8;
        break;
    case WEDNESDAY:
        dayOfWeek = 9;
        break;
    default:
        dayOfWeek = 0;
        break;
}
```

如今新的语法为：
```java
int dayOfWeek = switch (day) {
    case MONDAY, FRIDAY, SUNDAY -> 6;
    case TUESDAY                -> 7;
    case THURSDAY, SATURDAY     -> 8;
case WEDNESDAY              -> 9;
    default              -> 0;

};
```


很明显，switch 表达式将之前 switch 语句从编码方式上简化了不少，但是还是需要注意下面几点： 

- 需要保持与之前 switch 语句同样的 case 分支情况。 
- 之前需要用变量来接收返回值，而现在直接使用 yield 关键字来返回 case 分支需要返回的结果。 
- 现在的 switch 表达式中不再需要显式地使用 return、break 或者 continue 来跳出当前分支。 
- 现在不需要像之前一样，在每个分支结束之前加上 break 关键字来结束当前分支，如果不加，则会默认往后执行，直到遇到 break 关键字或者整个 switch 语句结束，在 Java 14 表达式中，表达式默认执行完之后自动跳出，不会继续往后执行。 
- 对于多个相同的 case 方法块，可以将 case 条件并列，而不需要像之前一样，通过每个 case 后面故意不加 break 关键字来使用相同方法块。

使用 switch 表达式来替换之前的 switch 语句，确实精简了不少代码，提高了编码效率，同时也可以规避一些可能由于不太经意而出现的意想不到的情况，可见 Java 在提高使用者编码效率、编码体验和简化使用方面一直在不停的努力中，同时也期待未来有更多的类似 lambda、switch 表达式这样的新特性出来。 

## 新功能和库的更新

### JEP 358: 改进 NullPointerExceptions 提示信息

Java 14 改进 `NullPointerException` 的可查性、可读性，能更准确地定位 null 变量的信息。该特性能够帮助开发者和技术支持人员提高生产力，以及改进各种开发工具和调试工具的质量，能够更加准确、清楚地根据动态异常与程序代码相结合来理解程序。 

相信每位开发者在实际编码过程中都遇到过 NullPointerException，每当遇到这种异常的时候，都需要根据打印出来的详细信息来分析、定位出现问题的原因，以在程序代码中规避或解决。例如，假设下面代码出现了一个 NullPointerException： 

```java
book.id = 99;
```
打印出来的 NullPointerException 信息如下：
```java
Exception in thread "main" java.lang.NullPointerException
    at Book.main(Book.java:5)
```

这种异常对于复杂场景，不好判断具体哪里出异常了，比如`shoopingcart.buy.book.id = 99;`

而 Java 14 中，则做了对 NullPointerException 打印异常信息的改进增强，通过分析程序的字节码信息，能够做到准确的定位到出现 NullPointerException 的变量，并且根据实际源代码打印出详细异常信息，对于上述示例`shoopingcart.buy.book.id = 99;`，打印信息如下： 

```java
Exception in thread "main" java.lang.NullPointerException: 
        Cannot assign field "book" because "shoopingcart.buy" is null
    at Book.main(Book.java:5)
```

对比可以看出，改进之后的 NullPointerException 信息，能够准确打印出具体哪个变量导致的 NullPointerException，减少了由于仅带行号的异常提示信息带来的困惑。该改进功能可以通过如下参数开启： `-XX:+ShowCodeDetailsInExceptionMessages`。该增强改进特性，不仅适用于属性访问，还适用于方法调用、数组访问和赋值等有可能会导致 NullPointerException 的地方。

## 旧功能的删除和弃用

### JEP 367: 删除 pack200 和 unpack200 工具

删除 pack200 和 unpack200 工具，以及 java.util.jar 包中的 Pack200 API。这些工具和 API 在 Java SE 11 中已被弃用，以便在未来的版本中删除它们。 

## JVM 相关

### JEP 345: G1 的 NUMA 可识别内存分配

Java 14 改进非一致性内存访问（NUMA）系统上的 G1 垃圾收集器的整体性能，主要是对年轻代的内存分配进行优化，从而提高 CPU 计算过程中内存访问速度。

NUMA 是 non-unified memory access 的缩写，主要是指在当前的多插槽物理计算机体系中，比较普遍是多核的处理器，并且越来越多的具有 NUMA 内存访问体系结构，即内存与每个插槽或内核之间的距离并不相等。同时套接字之间的内存访问具有不同的性能特征，对更远的套接字的访问通常具有更多的时间消耗。这样每个核对于每一块或者某一区域的内存访问速度会随着核和物理内存所在的位置的远近而有不同的时延差异。 

Java 中，堆内存分配一般发生在线程运行的时候，当创建了一个新对象时，该线程会触发 G1 去分配一块内存出来，用来存放新创建的对象，在 G1 内存体系中，其实就是一块 region（大对象除外，大对象需要多个 region），在这个分配新内存的过程中，如果支持了 NUMA 感知内存分配，将会优先在与当前线程所绑定的 NUMA 节点空闲内存区域来执行 allocate 操作，同一线程创建的对象，尽可能的保留在年轻代的同一 NUMA 内存节点上，因为是基于同一个线程创建的对象大部分是短存活并且高概率互相调用的。 

具体启用方式可以在 JVM 参数后面加上如下参数: `-XX:+UseNUMA`, 通过这种方式来启用可识别的内存分配方式，能够提高一些大型计算机的 G1 内存分配回收性能。

### JEP 363: 删除 CMS 垃圾回收器

CMS 是老年代垃圾回收算法，通过标记-清除的方式进行内存回收，在内存回收过程中能够与用户线程并行执行。CMS 回收器可以与 Serial 回收器和 Parallel New 回收器搭配使用，CMS 主要通过并发的方式，适当减少系统的吞吐量以达到追求响应速度的目的，比较适合在追求 GC 速度的服务器上使用。 

因为 CMS 回收算法在进行 GC 回收内存过程中是使用并行方式进行的，如果服务器 CPU 核数不多的情况下，进行 CMS 垃圾回收有可能造成比较高的负载。同时在 CMS 并行标记和并行清理时，应用线程还在继续运行，程序在运行过程中自然会创建新对象、释放不用对象，所以在这个过程中，会有新的不可达内存地址产生，而这部分的不可达内存是出现在标记过程结束之后，本轮 CMS 回收无法在周期内将它们回收掉，只能留在下次垃圾回收周期再清理掉。这样的垃圾就叫做浮动垃圾。由于垃圾收集和用户线程是并发执行的，因此 CMS 回收器不能像其他回收器那样进行内存回收，需要预留一些空间用来保存用户新创建的对象。由于 CMS 回收器在老年代中使用标记-清除的内存回收策略，势必会产生内存碎片，内存当碎片过多时，将会给大对象分配带来麻烦，往往会出现老年代还有空间但不能再保存对象的情况。

所以，早在几年前的 Java 9 中，就已经决定放弃使用 CMS 回收器了，而这次在 Java 14 中，是继之前 Java 9 中放弃使用 CMS 之后，彻底将其禁用，并删除与 CMS 有关的选项，同时清除与 CMS 有关的文档内容，至此曾经辉煌一度的 CMS 回收器，也将成为历史。
 
当在 Java 14 版本中，通过使用参数： `-XX:+UseConcMarkSweepGC`，尝试使用 CMS 时，将会收到下面信息：
```java
Java HotSpot(TM) 64-Bit Server VM warning: Ignoring option UseConcMarkSweepGC; \
support was removed in <version>
```

### JEP 364&365: ZGC 支持 MacOS 和 Windows 系统（实验阶段）

ZGC 是最初在 Java 11 中引入，同时在后续几个版本中，不断进行改进的一款基于内存 Region，同时使用了内存读屏障、染色指针和内存多重映射等技，并且以可伸缩、低延迟为目标的内存垃圾回收器器，不过在 Java 14 之前版本中，仅仅只支持在 Linux/x64 位平台。

此次 Java 14，同时支持 MacOS 和 Windows 系统，解决了开发人员需要在桌面操作系统中使用 ZGC 的问题。 

在 MacOS 和 Windows 下面开启 ZGC 的方式，需要添加如下 JVM 参数： `-XX:+UnlockExperimentalVMOptions -XX:+UseZGC`。

### JEP 366: 弃用 ParallelScavenge 和 SerialOld GC 的组合使用

由于 `Parallel Scavenge` 和 `Serial Old` 垃圾收集算法组合起来使用的情况比较少，并且在年轻代中使用并行算法，而在老年代中使用串行算法，这种并行、串行混搭使用的情况，本身已属罕见同时也很冒险。由于这两 GC 算法组合很少使用，却要花费巨大工作量来进行维护，所以在 Java 14 版本中，考虑将这两 GC 的组合弃用。 

具体弃用情况如下，通过弃用组合参数：`-XX:+UseParallelGC -XX:-UseParallelOldGC`，来弃用年轻代、老年期中并行、串行混搭使用的情况；同时，对于单独使用参数：`-XX:-UseParallelOldGC` 的地方，也将显示该参数已被弃用的警告信息。 

## 新功能的预览和实验

### JEP 305: instanceof 模式匹配（预览阶段）

Java 14 中对 instanceof 的改进，主要目的是为了让创建对象更简单、简洁和高效，并且可读性更强、提高安全性。 

在以往实际使用中，`instanceof` 主要用来检查对象的类型，然后根据类型对目标对象进行类型转换，之后进行不同的处理、实现不同的逻辑。 instanceof 传统使用方式：

```java
if (person instanceof Student) {
    Student student = (Student) person;
    student.say();
   // other student operations
} else if (person instanceof Teacher) {
    Teacher teacher = (Teacher) person;
    teacher.say();
    // other teacher operations
}
```

上面这种写法，有下面两个问题：

- 每次在检查类型之后，都需要强制进行类型转换。
- 类型转换后，需要提前创建一个局部变量来接收转换后的结果，代码显得多余且繁琐。

Java 14 中，对 instanceof 进行模式匹配改进之后，上面示例代码可以改写成：

```java
if (person instanceof Student student) {
    student.say();
   // other student operations
} else if (person instanceof Teacher teacher) {
    teacher.say();
    // other teacher operations
}
```

上述新写法，首先在 if 代码块中，对 person 对象进行类型匹配，校验 person 对象是否为 Student 类型，如果类型匹配成功，则会转换为 Student 类型，并赋值给模式局部变量 student，并且只有当模式匹配表达式匹配成功是才会生效和复制，同时这里的 student 变量只能在 if 块中使用，而不能在 else if/else 中使用，否则会报编译错误。

注意，如果 if 条件中有 && 运算符时，当 instanceof 类型匹配成功，模式局部变量的作用范围也可以相应延长，如下面代码：

```java
if (obj instanceof String s && s.length() > 5) {.. s.contains(..) ..}
```

另外，需要注意，这种作用范围延长，并不适用于或 || 运算符，因为即便 || 运算符左边的 instanceof 类型匹配没有成功也不会造成短路，依旧会执行到||运算符右边的表达式，但是此时，因为 instanceof 类型匹配没有成功，局部变量并未定义赋值，此时使用会产生问题。 

### JEP 359: Record 类型（预览功能）

Java 14 富有建设性地将 Record 类型作为预览特性而引入。Record 类型允许在代码中使用紧凑的语法形式来声明类，而这些类能够作为不可变数据类型的封装持有者。Record 这一特性主要用在特定领域的类上；与枚举类型一样，Record 类型是一种受限形式的类型，主要用于存储、保存数据，并且没有其它额外自定义行为的场景下。 

在以往开发过程中，被当作数据载体的类对象，在正确声明定义过程中，通常需要编写大量的无实际业务、重复性质的代码，其中包括：构造函数、属性调用、访问以及 equals() 、hashCode()、toString() 等方法，因此在 Java 14 中引入了 Record 类型，其效果有些类似 Lombok 的 @Data 注解、Kotlin 中的 data class，但是又不尽完全相同，它们的共同点都是类的部分或者全部可以直接在类头中定义、描述，并且这个类只用于存储数据而已。对于 Record 类型，具体可以用下面代码来说明：

```java
public record Person(String name, int age) {
    public static String address;

    public String getName() {
        return name;
    }
}
```
上述代码反编译后：
```java
public final class Person extends java.lang.Record {
    private final java.lang.String name;
    private final java.lang.String age;

    public Person(java.lang.String name, java.lang.String age) { /* compiled code */ }

    public java.lang.String getName() { /* compiled code */ }

    public java.lang.String toString() { /* compiled code */ }

    public final int hashCode() { /* compiled code */ }

    public final boolean equals(java.lang.Object o) { /* compiled code */ }

    public java.lang.String name() { /* compiled code */ }

    public java.lang.String age() { /* compiled code */ }
}
```

根据反编译结果，可以得出，当用 Record 来声明一个类时，该类将自动拥有下面特征： 
- 拥有一个构造方法 
- name()、age() hashCode() 方法和 euqals() 方法 toString() 方法 
- 类对象和属性被 final 关键字修饰，不能被继承，类的示例属性也都被 final 修饰，不能再被赋值使用。 
- 还可以在 Record 声明的类中定义静态属性、方法和示例方法。注意，不能在 Record 声明的类中定义示例字段，类也不能声明为抽象类等。 


可以看到，该预览特性提供了一种更为紧凑的语法来声明类，并且可以大幅减少定义类似数据类型时所需的重复性代码。

另外 Java 14 中为了引入 Record 这种新的类型，在 java.lang.Class 中引入了下面两个新方法：
```java
ecordComponent[] getRecordComponents()
boolean isRecord()
 ```

其中 `getRecordComponents()` 方法返回一组 `java.lang.reflect.RecordComponent` 对象组成的数组，java.lang.reflect.RecordComponent也是一个新引入类，该数组的元素与 Record 类中的组件相对应，其顺序与在记录声明中出现的顺序相同，可以从该数组中的每个 RecordComponent 中提取到组件信息，包括其名称、类型、泛型类型、注释及其访问方法。 而 `isRecord()` 方法，则返回所在类是否是 Record 类型，如果是，则返回 true。 

### JEP 368: 文本块（第二预览版本）

Java 13 引入了文本块来解决多行文本的问题，文本块主要以三重双引号开头，并以同样的以三重双引号结尾终止，它们之间的任何内容都被解释为文本块字符串的一部分，包括换行符，避免了对大多数转义序列的需要，并且它仍然是普通的 java.lang.String 对象，文本块可以在 Java 中能够使用字符串的任何地方进行使用，而与编译后的代码没有区别，还增强了 Java 程序中的字符串可读性。并且通过这种方式，可以更直观地表示字符串，可以支持跨越多行，而且不会出现转义的视觉混乱，将可以广泛提高 Java 类程序的可读性和可写性。

Java 14 在 Java 13 引入的文本块的基础之上，新加入了两个转义符，分别是：\ 和 \s，这两个转义符分别表达涵义如下：

- `\`：行终止符，主要用于阻止插入换行符；
- `\s`：表示一个空格。可以用来避免末尾的白字符被去掉。
在 Java 13 之前，多行字符串写法为：

```java
String literal = "Lorem ipsum dolor sit amet, consectetur adipiscing " +
                 "elit, sed do eiusmod tempor incididunt ut labore " +
                 "et dolore magna aliqua.";
  
```
在 Java 14 新引入两个转义符之后，上述内容可以写为：
```java
String text = """
              Lorem ipsum dolor sit amet, consectetur adipiscing \
              elit, sed do eiusmod tempor incididunt ut labore \
              et dolore magna aliqua.\
              """;
  
```

对于转义符：\s，用法如下，能够保证下列文本每行正好都是六个字符长度：

```java
String colors = """
             red  \s
            green\s
             blue \s
             """;
  
```

Java 14 带来的这两个转义符，能够简化跨多行字符串编码问题，通过转义符，能够避免对换行等特殊字符串进行转移，从而简化代码编写，同时也增强了使用 String 来表达 HTML、XML、SQL 或 JSON 等格式字符串的编码可读性，且易于维护。

同时 Java 14 还对 String 进行了方法扩展：
- stripIndent() ：用于从文本块中去除空白字符
- translateEscapes()：用于翻译转义字符
- formatted(Object... args)：用于格式化 

### JEP 343: 打包工具（孵化器版本）

创建用于打包自包含 Java 应用程序的工具。 
它基于 JavaFX javapackager 工具创建一个简单的打包工具，主要目标是： 
- 支持原生打包格式，为最终用户提供自然的安装体验。这些格式包括 Windows 上的 msi 和 exe，macOS 上的 pkg 和 dmg，以及 Linux 上的 deb 和 rpm。 
- 允许在打包时指定启动时间参数。 
- 可以从命令行直接调用，也可以通过 ToolProvider API 以编程方式调用。 

### JEP 370: 外部存储器访问 API（孵化器版）

> 外存访问 API（二次孵化），可以允许 Java 应用程序安全有效地访问 Java 堆之外的外部内存。目的是引入一个 API，以允许 Java 程序安全、有效地访问 Java 堆之外的外部存储器。如本机、持久和托管堆。

具体可以访问：[https://xie.infoq.cn/article/8304c894c4e38318d38ceb116](https://xie.infoq.cn/article/8304c894c4e38318d38ceb116)

在实际的开发过程中，绝大多数的开发人员基本都不会直接与堆外内存打交道，但这并不代表你从未接触过堆外内存，像大家经常使用的诸如：RocketMQ、MapDB 等中间件产品底层实现都是基于堆外存储的，换句话说，我们几乎每天都在间接与堆外内存打交道。那么究竟为什么需要使用到堆外内存呢？简单来说，主要是出于以下 3 个方面的考虑：

- 减少 GC 次数和降低 Stop-the-world 时间；
- 可以扩展和使用更大的内存空间；
- 可以省去物理内存和堆内存之间的数据复制步骤。


在 Java14 之前，如果开发人员想要操作堆外内存，通常的做法就是使用 `ByteBuffer` 或者` Unsafe`，甚至是 `JNI` 等方式，*但无论使用哪一种方式，均无法同时有效解决安全性和高效性等 2 个问题*，并且，堆外内存的释放也是一个令人头痛的问题。以 `DirectByteBuffer` 为例，该对象仅仅只是一个引用，其背后还关联着一大段堆外内存，由于 `DirectByteBuffer` 对象实例仍然是存储在堆空间内，只有当 `DirectByteBuffer` 对象被 GC 回收时，其背后的堆外内存才会被进一步释放。

![](http://wenchao.ren/img/2022/08/1660465935-31dc55112b60b5829eb0f06f2abd5716-20220814163214.png)


在此大家需要注意，程序中通过 `ByteBuffer.allocateDirect()`方法来申请物理内存资源所耗费的成本远远高于直接在 on-heap 中的操作，而且实际开发过程中还需要考虑数据结构如何设计、序列化/反序列化如何支撑等诸多难题，所以与其使用语法层面的 API 倒不如直接使用 MapDB 等开源产品来得更实惠。

如今，在堆外内存领域，我们似乎又多了一个选择，*从 Java14 开始，Java 的设计者们在语法层面为大家带来了崭新的 Memory Access API，极大程度上简化了开发难度，并得以有效的解决了安全性和高效性等 2 个核心问题*。示例：

```java
// 获取内存访问var句柄
var handle = MemoryHandles.varHandle(char.class,
        ByteOrder.nativeOrder());
// 申请200字节的堆外内存
try (MemorySegment segment = MemorySegment.allocateNative(200)) {
    for (int i = 0; i < 25; i++) {
        handle.set(segment, i << 2, (char) (i + 1 + 64));
        System.out.println(handle.get(segment, i << 2));
    }
}
```

关于堆外内存段的释放，Memory Access API 提供有显式和隐式 2 种方式，开发人员除了可以在程序中通过 `MemorySegment` 的 `close()`方法来显式释放所申请的内存资源外，还可以注册 `Cleaner` 清理器来实现资源的隐式释放，后者会在 GC 确定目标内存段不再可访问时，释放与之关联的堆外内存资源。 