---
icon: page
author: xkrivzooh
date: 2022-08-13
category:
  - post
tag:
  - java
---

# JDK9新特性

JDK9正式发布于2017年9月21日。作为JDK8之后3年半才发布的新版本，Java9带来了很多重大的变化。其中最重要的改动是Java平台模块系统的引入。除此之外，还有一些新的特性。本文对JDK9中包含的新特性做了概括性的介绍，可以帮助你快速了解JDK9。 

![JDK9新特性](http://wenchao.ren/img/2022/08/1660369655-6e17f451de78b1603b0e3a0363a43aae-20220813134732.png)

## 模块系统

JDK9提供了`Project Jigsaw`，把模块化概念引入到了java平台中。

主要是之前的JDK存在如下的问题，内容详见：[《Java 9 终于要包含 Jigsaw 项目了》](https://www.infoq.cn/article/project-jigsaw-coming-in-java-9)

- 不断增长且不可分割的Java 运行时
    - Java 运行时的大小在不断地增长。但是在 Java 8 之前，我们并没有办法安装 JRE 的子集。所有的 Java 安装包中都会包含各种库的分发版本，如 XML、SQL 以及 Swing 的 API，不管我们是否需要它们，都要将其包含进来。这个问题在IOT场景比较受限。
- JAR/Classpath 地狱
    - 指的是 Java 类加载机制的缺陷所引发的问题。尤其是在大型的应用中，它们可能会以各种方式产生令人痛苦的问题。有一些问题是因为其他的问题而引发的，而有一些则是独立的。（关于这个问题，其实我这边目前也并没有清楚地理解，可能我还不够痛）
- 无法表述依赖
    - JAR 文件无法以一种JVM能够理解的方式来表述它依赖于哪些其他的 JAR。因此，就需要用户手动识别并满足这些依赖，这要求用户阅读文档、找到正确的项目、下载JAR文件并将其添加到项目中。而且，有一些依赖是可选的，只有用户在使用特定功能的特性时，某个 JAR 才会依赖另外一个 JAR。这会使得这个过程更加复杂。Java 运行时在实际使用某项依赖之前，并不能探测到这个依赖是无法满足的。如果出现这种情况，将会出现`NoClassDefFoundError`异常，进而导致正在运行的应用崩溃。Maven工具在一定程度上缓解了这个问题。
- 传递性依赖
    - 一个应用程序要运行起来可能只需依赖几个库就足够了，但是这些库又会需要一些其他的库。问题组合起来会变得更加复杂，在所消耗的体力以及出错的可能性上，它会呈指数级地增长。Maven工具在一定程度上缓解了这个问题。
- 重复类问题
    - 有时候，在 classpath 的不同 JAR 包中可能会包含全限定名完全相同的类，比如我们使用同一个库的两个不同版本。因为类会从 classpath 中的第一个 JAR 包中加载，所以这个版本的变种将会“遮蔽”所有其他的版本，使它们变得不可用。从难以发现的不正常行为到非常严重的错误都是有可能的。更糟糕的是，问题的表现形式是不确定的。这取决于 JAR 文件在 classpath 中的顺序。在不同的环境下，可能也会有所区别，例如开发人员的 IDE 与代码最终运行的生产机器之间就可能有所差别。
- 版本冲突
    - 主要是同一个依赖的不同的版本冲突。
- 在包之间，只有很弱的封装机制
    - 如果类位于同一个包中，那 Java 的可见性修饰符提供了一种很棒的方式来实现这些类之间的封装。但是，要跨越包之间边界的话，那只能使用一种可见性：public。因为类加载器会将所有加载进来的包放在一起，public 的类对其他所有的类都是可见的，因此，如果我们想创建一项功能，这项功能对某个 JAR 是可用的，而对于这个 JAR 之外是不可用的，这是没有办法实现的。
- 手动的安全性
    - 包之间弱封装性所带来的一个直接结果就是，安全相关的功能将会暴露在同一个环境中的所有代码面前。这意味着，恶意代码有可能绕过安全限制，访问关键的功能。从 Java 1.1开始，有一种hack的方式，能够防止这种状况：每当进入安全相关的代码路径时，将会调用[SecurityManager](https://docs.oracle.com/javase/8/docs/api/java/lang/SecurityManager.html)，并判断是不是允许访问。更精确地讲，它 应该在 每个这样的路径上都进行调用。过去，在有些地方遗漏了对它们的调用，从而出现了一些漏洞，这给 Java带来了困扰。
- 启动性能
    - Java 运行时加载并 JIT 编译全部所需的类需要较长的时间。其中一个原因在于类加载机制会对classpath下的所有 JAR 执行线性的扫描。类似的，在识别某个注解的使用情况时，需要探查classpath下所有的类。

基于上述的这些原因，JDK9提供了`Project Jigsaw`，把模块化概念引入到了java平台中。
以下是模块化的一些好处

- 强大的封装能力：这些模块只能访问那些可以使用的部件。除非将包显式导出到 module-info.java文件中，否则包中的公共类不能是公共的。
- 明确的依赖关系：一个模块必须声明有关通过必需子句使用的其他模块的信息。组合模块以创建较短的运行时间，可以将其轻松扩展到相对较小的计算设备。
- 可靠：消除运行时错误后，该应用程序将变得更加可靠。例如，我们必须注意到，由于缺少导致ClassNotFoundException的类，我们的应用程序在运行时会失败。

在引入了模块系统之后，JDK 被重新组织成 94 个模块。Java 应用可以通过新增的 jlink 工具，创建出只包含所依赖的 JDK 模块的自定义运行时镜像。这样可以极大的减少 Java 运行时环境的大小。这对于目前流行的不可变基础设施的实践来说，镜像的大小的减少可以节省很多存储空间和带宽资源 。

![JDK模块](http://wenchao.ren/img/2022/08/1660372452-41f692c0635010e940ea37bef99a2ac0-20220813143411.png)

Java 9 模块的重要特征是在其工件（artifact）的根目录中包含了一个描述模块的 module-info.class 文 件。 工件的格式可以是传统的 JAR 文件或是 Java 9 新增的 JMOD 文件。这个文件由根目录中的源代码文件 module-info.java 编译而来。该模块声明文件可以描述模块的不同特征。模块声明文件中可以包含的内容如下：

- 模块导出的包：使用 exports 可以声明模块对其他模块所导出的包。包中的 public 和 protected 类型，以及这些类型的 public 和 protected 成员可以被其他模块所访问。没有声明为导出的包相当于模块中的私有成员，不能被其他模块使用。 
- 模块的依赖关系：使用 requires 可以声明模块对其他模块的依赖关系。使用 requires transitive 可 以把一个模块依赖声明为传递的。传递的模块依赖可以被依赖当前模块的其他模块所读取。 如果一个模块所导出的类型的型构中包含了来自它所依赖的模块的类型，那么对该模块的依赖应该声明为传递的。 
- 服务的提供和使用：如果一个模块中包含了可以被 ServiceLocator 发现的服务接口的实现 ，需要使用 provides with 语句来声明具体的实现类 ；如果一个模块需要使用服务接口，可以使用 uses 语句来声明。 

如下是`lombok`的module-info.class文件的内容：

```java
//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

module lombok {
    requires java.compiler;
    requires java.instrument;
    requires jdk.unsupported;
    requires org.mapstruct.processor;

    exports lombok;
    exports lombok.experimental;
    exports lombok.extern.apachecommons;
    exports lombok.extern.java;
    exports lombok.extern.jbosslog;
    exports lombok.extern.log4j;
    exports lombok.extern.slf4j;
    exports lombok.extern.flogger;

    provides javax.annotation.processing.Processor with
        lombok.launch.AnnotationProcessorHider.AnnotationProcessor;
    provides org.mapstruct.ap.spi.AstModifyingAnnotationProcessor with
        lombok.launch.AnnotationProcessorHider.AstModificationNotifier;
}
```

模块系统中增加了模块路径的概念。模块系统在解析模块时，会从模块路径中进行查找。为了保持与之前 Java 版本的兼容性，`CLASSPATH` 依然被保留。所有的类型在运行时都属于某个特定的模块。对于从 `CLASSPATH` 中加载的类型，它们属于加载它们的类加载器对应的未命名模块。可以通过 `Class `的`getModule()`方法来获取到表示其所在模块的 `Module `对象。

 在 JVM 启动时，会从应用的根模块开始，根据依赖关系递归的进行解析，直到得到一个表示依赖关系的图。如果解析过程中出现找不到模块的情况，或是在模块路径的同一个地方找到了名称相同的模块，模块解析过程会终止，JVM 也会退出。Java 也提供了相应的 API 与模块系统进行交互。

## Jshell

jshell是JDK9新增的一个实用工具。jshell 为 Java 增加了类似 `NodeJS` 和 `Python` 中的读取-求值-打印循环（ Read-Evaluation-Print Loop ，一般都简称为REPL） 。 在 jshell 中 可以直接 输入表达式并查看其执行结果。当需要测试一个方法的运行效果，或是快速的对表达式进行求值时，jshell 都非常实用。只需要通过 jshell 命令启动 jshell，然后直接输入表达式即可。每个表达式的结果会被自动保存下来 ，以数字编号作为引用，类似 $1 和$2 这样的名称 。可以在后续的表达式中引用之前语句的运行结果。 在 jshell 中 ，除了表达式之外，还可以创建 Java 类和方法。jshell 也有基本的代码完成功能。 


```java
jshell> int add(int x, int y) {
    ...> return x + y;
    ...> }
 | created method add(int,int)
  
jshell> add(1, 2)
$19 ==> 3
```

## 集合工厂方法

JDK9的一项新功能，即集合工厂方法，`List.of()、Set.of()、Map.of()` 和 `Map.ofEntries()`, 您可以轻松地使用预定义的数据创建`不可变的集合`。您只需要在特定集合类型上使用of方法。下面是其中的一些API文档：

```java
    /**
     * Returns an unmodifiable list containing zero elements.
     *
     * See <a href="#unmodifiable">Unmodifiable Lists</a> for details.
     *
     * @param <E> the {@code List}'s element type
     * @return an empty {@code List}
     *
     * @since 9
     */
    @SuppressWarnings("unchecked")
    static <E> List<E> of() {
        return (List<E>) ImmutableCollections.EMPTY_LIST;
    }

    /**
     * Returns an unmodifiable list containing one element.
     *
     * See <a href="#unmodifiable">Unmodifiable Lists</a> for details.
     *
     * @param <E> the {@code List}'s element type
     * @param e1 the single element
     * @return a {@code List} containing the specified element
     * @throws NullPointerException if the element is {@code null}
     *
     * @since 9
     */
    static <E> List<E> of(E e1) {
        return new ImmutableCollections.List12<>(e1);
    }

```

这样在一定程度上简化了集合创建的方式：

```java
List<String> fruits = List.of("apple", "banana", "orange");
Map<Integer, String> numbers = Map.of(1, "one", 2,"two", 3, "three");
```
聊胜于无把，之前我这边遇到这种情况往往都是使用`Guava`中的工具类。但是JDK9新提供的这些方法创建的集合是不可变集合，这个需要注意一下。

## Stream增强

Stream 中增加了新的方法 `ofNullable、dropWhile、takeWhile` 和 `iterate`。在 如下代码 中，流中包含了从 1 到 5 的 元素。断言检查元素是否为奇数。第一个元素 1 被删除，结果流中包含 4 个元素。 

```java
@Test
public void testDropWhile() throws Exception {
    final long count = Stream.of(1, 2, 3, 4, 5)
        .dropWhile(i -> i % 2 != 0)
        .count();
    assertEquals(4, count);
}
```

## Collectors

`Collectors` 中增加了新的方法 `filtering` 和 `flatMapping`。

在 如下代码 中，对于输入的 String 流 ，先通过 flatMapping 把 String 映射成 Integer 流 ，再把所有的 Integer 收集到一个集合中。

```java
@Test
public void testFlatMapping() throws Exception {
    final Set<Integer> result = Stream.of("a", "ab", "abc")
        .collect(Collectors.flatMapping(v -> v.chars().boxed(),
            Collectors.toSet()));
    assertEquals(3, result.size());
}
```

## Optional

`Optional`增加`stream`、`or`和`ifPresentOrElse`方法：

```java
    /**
     * If a value is present, returns a sequential {@link Stream} containing
     * only that value, otherwise returns an empty {@code Stream}.
     *
     * @apiNote
     * This method can be used to transform a {@code Stream} of optional
     * elements to a {@code Stream} of present value elements:
     * <pre>{@code
     *     Stream<Optional<T>> os = ..
     *     Stream<T> s = os.flatMap(Optional::stream)
     * }</pre>
     *
     * @return the optional value as a {@code Stream}
     * @since 9
     */
    public Stream<T> stream() {
        if (!isPresent()) {
            return Stream.empty();
        } else {
            return Stream.of(value);
        }
    }

    /**
     * If a value is present, returns an {@code Optional} describing the value,
     * otherwise returns an {@code Optional} produced by the supplying function.
     *
     * @param supplier the supplying function that produces an {@code Optional}
     *        to be returned
     * @return returns an {@code Optional} describing the value of this
     *         {@code Optional}, if a value is present, otherwise an
     *         {@code Optional} produced by the supplying function.
     * @throws NullPointerException if the supplying function is {@code null} or
     *         produces a {@code null} result
     * @since 9
     */
    public Optional<T> or(Supplier<? extends Optional<? extends T>> supplier) {
        Objects.requireNonNull(supplier);
        if (isPresent()) {
            return this;
        } else {
            @SuppressWarnings("unchecked")
            Optional<T> r = (Optional<T>) supplier.get();
            return Objects.requireNonNull(r);
        }
    }

    /**
     * If a value is present, performs the given action with the value,
     * otherwise performs the given empty-based action.
     *
     * @param action the action to be performed, if a value is present
     * @param emptyAction the empty-based action to be performed, if no value is
     *        present
     * @throws NullPointerException if a value is present and the given action
     *         is {@code null}, or no value is present and the given empty-based
     *         action is {@code null}.
     * @since 9
     */
    public void ifPresentOrElse(Consumer<? super T> action, Runnable emptyAction) {
        if (value != null) {
            action.accept(value);
        } else {
            emptyAction.run();
        }
    }
```

下面是一个使用例子：
```java
@Test
public void testStream() throws Exception {
    final long count = Stream.of(
        Optional.of(1),
        Optional.empty(),
        Optional.of(2)
    ).flatMap(Optional::stream)
        .count();
    assertEquals(2, count);
}
```

## 接口中的私有方法

从JDK8开始，您可以在接口内部使用公共默认方法。但是仅从JDK9开始，在接口中就可以定义私有方法了。注意依旧不容许`protected`和没有`default`和`private`修饰的有method body的方法定义。

```java
public interface Inter {

    default String func1() {
        return "1";
    }

    private String func2() {
        return "2";
    }
        
      //not allowed
//    protected String func3() {
//        return "3";
//    }
//
    //not allowed
//    String func4() {
//        return "24";
//    }
}
```

## 进程 API
Java 9 增加了 `ProcessHandle` 接口，可以对原生进程进行管理，尤其适合于管理长时间运行的进程。在使用 `ProcessBuilder` 来启动一个进程之后，可以通过 `Process.toHandle()`方法来得到一个 `ProcessHandle` 对象的实例。通过 `ProcessHandle` 可以获取到由 `ProcessHandle.Info `表示的进程的基本信息，如命令行参数、可执行文件路径和启动时间等。`ProcessHandle `的 `onExit()`方法返回一个 `CompletableFuture`对象，可以在进程结束时执行自定义的动作。 如下代码中给出了进程 API 的使用示例。 

```java
final ProcessBuilder processBuilder = new ProcessBuilder("top")
    .inheritIO();
final ProcessHandle processHandle = processBuilder.start().toHandle();
processHandle.onExit().whenCompleteAsync((handle, throwable) -> {
    if (throwable == null) {
        System.out.println(handle.pid());
    } else {
        throwable.printStackTrace();
    }
});
```

## 平台日志API和服务
Java 9 允许为JDK和应用配置同样的日志实现。新增的` System.LoggerFinder `用来管理 JDK使用的日志记录器实现。JVM 在运行时只有一个系统范围的 `LoggerFinder` `实例。LoggerFinder` 通过服务查找机制来加载日志记录器实现。默认情况下，JDK 使用 `java.logging` 模块中的 `java.util.logging` 实现。通过 `LoggerFinder` 的 `getLogger()`方法就可以获取到表示日志记录器的 `System.Logger` 实现。应用同样可以使用 `System.Logger `来记录日志。这样就保证了 JDK 和应用使用同样的日志实现。我们也可以通过添加自己的 `System.LoggerFinder` 实现来让 JDK 和应用使用 `SLF4J` 等其他日志记录框架。 代码清单 9 中给出了平台日志 API 的使用示例。

```java
public class Main {
    private static final System.Logger LOGGER = System.getLogger("Main");
    public static void main(final String[] args) {
        LOGGER.log(Level.INFO, "Run!");
    }
}
```

## Reactive Streams

反应式编程的思想最近得到了广泛的流行。 在 Java 平台上有流行的反应式库RxJava和R eactor。反应式流规范的出发点是提供一个带非阻塞负压（ `non-blocking backpressure` ） 的异步流处理规范。反应式流规范的核心接口已经添加到了 Java9 中的 `java.util.concurrent.Flow` 类中。 `Flow` 中包含了 `Flow.Publisher`、`Flow.Subscriber`、`Flow.Subscription` 和 `Flow.Processor` 等 4 个核心接口。Java 9 还提供了 `SubmissionPublisher` 作为` Flow.Publisher` 的一个实现。RxJava2和Reactor都可以很方便的与Flow类的核心接口进行互操作。 

## 变量句柄

变量句柄是一个变量或一组变量的引用，包括静态域，非静态域，数组元素和堆外数据结构中的组成部分等。变量句柄的含义类似于已有的方法句柄。变量句柄由Java类 `java.lang.invoke.VarHandle` 来表示。可以使用类 `java.lang.invoke.MethodHandles.Lookup` 中的静态工厂方法来创建 `VarHandle` 对象。通过变量句柄，可以在变量上进行各种操作。这些操作称为访问模式。不同的访问模式尤其在内存排序上的不同语义。目前一共有 31 种 访问模式，而每种访问模式都 在 `VarHandle` 中 有对应的方法。这些方法可以对变量进行读取、写入、原子更新、数值原子更新和比特位原子操作等。`VarHandle` 还可以用来访问数组中的单个元素，以及把 byte[]数组 和 ByteBuffer 当成是不同原始类型的数组来访问。

 在 如下代码 中，我们创建了访问 HandleTarget 类中的域 count 的变量句柄，并在其上进行读取操作。 

 ```java
public class HandleTarget {
    public int count = 1;
}
public class VarHandleTest {
    private HandleTarget handleTarget = new HandleTarget();
    private VarHandle varHandle;
    @Before
    public void setUp() throws Exception {
        this.varHandle = MethodHandles
            .lookup()
            .findVarHandle(HandleTarget.class, "count", int.class);
    }
    @Test
    public void testGet() throws Exception {
        assertEquals(1, this.varHandle.get(this.handleTarget));
        assertEquals(1, this.varHandle.getVolatile(this.handleTarget));
        assertEquals(1, this.varHandle.getOpaque(this.handleTarget));
        assertEquals(1, this.varHandle.getAcquire(this.handleTarget));
    }
}
```

## 方法句柄

类 `java.lang.invoke.MethodHandles `增加了更多的静态方法来创建不同类型的方法句柄。 
- arrayConstructor：创建指定类型的数组。 
- arrayLength：获取指定类型的数组的大小。 
- varHandleInvoker 和 varHandleExactInvoker：调用 VarHandle 中的访问模式方法。 
- zero：返回一个类型的默认值。 
- empty：返 回 MethodType 的返回值类型的默认值。 
- loop、countedLoop、iteratedLoop、whileLoop 和 doWhileLoop：创建不同类型的循环，包括 for 循环、while 循环 和 do-while 循环。 
- tryFinally：把对方法句柄的调用封装在 try-finally 语句中。 

在 如下代码 中，我们使用 iteratedLoop 来创建一个遍历 String 类型迭代器的方法句柄，并计算所有字符串的长度的总和。

```java
public class IteratedLoopTest {
    static int body(final int sum, final String value) {
        return sum + value.length();
    }
    @Test
    public void testIteratedLoop() throws Throwable {
        final MethodHandle iterator = MethodHandles.constant(
            Iterator.class,
            List.of("a", "bc", "def").iterator());
        final MethodHandle init = MethodHandles.zero(int.class);
        final MethodHandle body = MethodHandles
            .lookup()
            .findStatic(
                IteratedLoopTest.class,
                "body",
                MethodType.methodType(
                    int.class,
                    int.class,
                    String.class));
        final MethodHandle iteratedLoop = MethodHandles
            .iteratedLoop(iterator, init, body);
        assertEquals(6, iteratedLoop.invoke());
    }
}
```

## 并发

在并发方面，类 `CompletableFuture` 中增加了几个新的方法。`completeAsync` 使用一个异步任务来获取结果并完成该 `CompletableFuture`。`orTimeout` 在 `CompletableFuture` 没有在给定的超时时间之前完成，使用 `TimeoutException` 异常来完成` CompletableFuture`。`completeOnTimeout `与 `orTimeout` 类似，只不过它在超时时使用给定的值来完成 CompletableFuture。新的 `Thread.onSpinWait `方法在当前线程需要使用忙循环来等待时，可以提高等待的效率。

```java
    class EventHandler {
            volatile boolean eventNotificationNotReceived;

            void waitForEventAndHandleIt() {
                while (eventNotificationNotReceived) {
                    java.lang.Thread.onSpinWait();
                }
                readAndProcessEvent();
            }

            void readAndProcessEvent() {         
                 // Read event from some source and process it           
                 . . .      
            }
    }
 ```

## Nashorn

`Nashorn` 是 Java 8 中引入的新的 JavaScript 引擎。Java 9 中的 Nashorn 已经实现了一些 ECMAScript 6 规范中的新特性，包括模板字符串、二进制和八进制字面量、迭代器 和 `for..of `循环和箭头函数等。Nashorn 还提供了 API 把 ECMAScript 源代码解析成抽象语法树（ Abstract Syntax Tree，AST ） ，可以用来对 ECMAScript 源代码进行分析。

## I/O 流新特性

类 `java.io.InputStream` 中增加了新的方法来读取和复制 `InputStream` 中包含的数据。

- `readAllBytes`：读取 InputStream 中的所有剩余字节。 
- `readNBytes`： 从 InputStream 中读取指定数量的字节到数组中。 
- `transferTo`：读取 InputStream 中的全部字节并写入到指定的 OutputStream 中 。

```java
public class TestInputStream {
    private InputStream inputStream;
    private static final String CONTENT = "Hello World";
    @Before
    public void setUp() throws Exception {
        this.inputStream =
            TestInputStream.class.getResourceAsStream("/input.txt");
    }
    @Test
    public void testReadAllBytes() throws Exception {
        final String content = new String(this.inputStream.readAllBytes());
        assertEquals(CONTENT, content);
    }
    @Test
    public void testReadNBytes() throws Exception {
        final byte[] data = new byte[5];
        this.inputStream.readNBytes(data, 0, 5);
        assertEquals("Hello", new String(data));
    }
    @Test
    public void testTransferTo() throws Exception {
        final ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        this.inputStream.transferTo(outputStream);
        assertEquals(CONTENT, outputStream.toString());
    }
}
```

## ObjectInputFilter

`ObjectInputFilter` 可以对 `ObjectInputStream` 中 包含的内容进行检查，来确保其中包含的数据是合法的。可以使用 `ObjectInputStream` 的方法 `setObjectInputFilter` 来设置。`ObjectInputFilter` 在 进行检查时，可以检查如对象图的最大深度、对象引用的最大数量、输入流中的最大字节数和数组的最大长度等限制，也可以对包含的类的名称进行限制。 ¶

```java
import java.io.ObjectInputFilter;
import java.util.function.BinaryOperator;

public final class FilterInThread implements BinaryOperator<ObjectInputFilter> {

    private final ThreadLocal<ObjectInputFilter> filterThreadLocal = new ThreadLocal<>();

    // Construct a FilterInThread deserialization filter factory.
    public FilterInThread() {
    }

    // Returns a composite filter of the static JVM-wide filter, a thread-specific filter,
    // and the stream-specific filter.
    public ObjectInputFilter apply(ObjectInputFilter curr, ObjectInputFilter next) {
        if (curr == null) {
            // Called from the OIS constructor or perhaps OIS.setObjectInputFilter with no current filter
            var filter = filterThreadLocal.get();
            if (filter != null) {
                // Wrap the filter to reject UNDECIDED results
                filter = ObjectInputFilter.rejectUndecidedClass(filter);
            }
            if (next != null) {
                // Merge the next filter with the thread filter, if any
                // Initially this is the static JVM-wide filter passed from the OIS constructor
                // Wrap the filter to reject UNDECIDED results
                filter = ObjectInputFilter.merge(next, filter);
                filter = ObjectInputFilter.rejectUndecidedClass(filter);
            }
            return filter;
        } else {
            // Called from OIS.setObjectInputFilter with a current filter and a stream-specific filter.
            // The curr filter already incorporates the thread filter and static JVM-wide filter
            // and rejection of undecided classes
            // If there is a stream-specific filter wrap it and a filter to recheck for undecided
            if (next != null) {
                next = ObjectInputFilter.merge(next, curr);
                next = ObjectInputFilter.rejectUndecidedClass(next);
                return next;
            }
            return curr;
        }
    }

    // Applies the filter to the thread and invokes the runnable.
    public void doWithSerialFilter(ObjectInputFilter filter, Runnable runnable) {
        var prevFilter = filterThreadLocal.get();
        try {
            filterThreadLocal.set(filter);
            runnable.run();
        } finally {
            filterThreadLocal.set(prevFilter);
        }
    }
}
```

## 改进应用安全性能

Java 9 新增了 4 个 SHA-3 哈希算法，SHA3-224、SHA3-256、SHA3-384 和 SHA3-512。另外也增加了通过 `java.security.SecureRandom` 生成使用 DRBG 算法的强随机数。如下代码中给出了 SHA-3 哈希算法的使用示例。

```java
import org.apache.commons.codec.binary.Hex;
public class SHA3 {
    public static void main(final String[] args) throws NoSuchAlgorithmException {
        final MessageDigest instance = MessageDigest.getInstance("SHA3-224");
        final byte[] digest = instance.digest("".getBytes());
        System.out.println(Hex.encodeHexString(digest));
    }
}
```

## 用户界面

类 `java.awt.Desktop `增加了新的与桌面进行互动的能力。可以使用 `addAppEventListener` 方法来添加不同应用事件的监听器，包括应用变为前台应用、应用隐藏或显示、屏幕和系统进入休眠与唤醒、以及 用户会话的开始和终止等。还可以在显示关于窗口和配置窗口时，添加自定义的逻辑。在用户要求退出应用时，可以通过自定义处理器来接受或拒绝退出请求。在 AWT 图像支持方面，可以在应用中使用多分辨率图像。 

## 统一JVM日志

Java 9 中 ，JVM有了统一的日志记录系统，可以使用新的命令行选项`-Xlog `来控制 JVM 上 所有组件的日志记录。该日志记录系统可以设置输出的日志消息的标签、级别、修饰符和输出目标等。


## 其他

- Java9移除了在Java8中 被废弃的垃圾回收器配置组合，同时 把 G1 设为默认的垃圾回收器实现。另外，CMS 垃圾回收器已经被声明为废弃。Java 9 也增加了很多可以通过 `jcmd` 调用的诊断命令。
- 在 Java 语言本身，Java 9允许在接口中使用私有方法。
- 在 `try-with-resources` 语句中可以使用 effectively-final 变量。
- 类`java.lang.StackWalker`可以对线程的堆栈进行遍历，并且支持过滤和延迟访问。
- Java 9 把对 Unicode 的支持升级到了 8.0。
- `ResourceBundle` 加载属性文件的默认编码从 ISO-8859-1 改成了 UTF-8，不再需要使用 native2ascii 命令来对属性文件进行额外处理。
- 注解`@Deprecated`也得到了增强，增加了 `since` 和 `forRemoval` 两 个属性，可以分别指定一个程序元素被废弃的版本，以及是否会在今后的版本中被删除。

在如下的代码中，表示PdaiDeprecatedTest这个类在JDK9版本中被弃用并且在将来的某个版本中一定会被删除。
```java
@Deprecated(since="9", forRemoval = true)
public class PdaiDeprecatedTest {

}
```

## 参考资料

- [Java 9 终于要包含 Jigsaw 项目了](https://www.infoq.cn/article/project-jigsaw-coming-in-java-9)
- [Java 9 新特性概述](https://pdai.tech/md/java/java8up/java9.html#java-9-%E6%96%B0%E7%89%B9%E6%80%A7%E6%A6%82%E8%BF%B0)



<!-- @include: ../scaffolds/post_footer.md -->
