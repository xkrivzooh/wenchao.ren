---
icon: page
author: xkrivzooh
date: 2021-05-07
sidebar: false
category:
  - post
tag:
  - AviatorScript
---

# AviatorScript编译执行流程


本篇文章通过AviatorScript工程自带的一个示例，来简单说明一下AviatorScript的执行流程:

- 初始化Aviator的核心数据结构
- 读取AviatorScript脚本内容，做语法树解析，并通过ASM翻译为java字节码，然后通过classLoader做类加载，构建`Expression`实例。
- 通过触发`Exception#execute`方法来触发脚本执行。

## 示例程序

本部分继续以下面的示例来说明，这个实例在AviatorScript的工程中可以找到:

```java
public class RunScriptExample {

  public static void main(final String[] args) throws Exception {
    // Enable java method invocation by reflection.
    AviatorEvaluator.getInstance()
        .setFunctionMissing(JavaMethodReflectionFunctionMissing.getInstance());
    // You can trry to test every script in examples folder by changing the file name.
    Expression exp = AviatorEvaluator.getInstance().compileScript("examples/hello.av");

    exp.execute();

  }
}
```

在这个实例程序中，`AviatorEvaluator.getInstance()`是单例模式的一种实现，用来获取`AviatorEvaluatorInstance`实例。

## AviatorEvaluatorInstance初始化流程

在`AviatorEvaluator`中通过单例模式创建了`AviatorEvaluatorInstance`的实例。

```java
  public static AviatorEvaluatorInstance newInstance() {
    return new AviatorEvaluatorInstance();
  }

  private static class StaticHolder {
    private static AviatorEvaluatorInstance INSTANCE = new AviatorEvaluatorInstance();
  }
```


下面是`AviatorEvaluatorInstance`的构造函数：

```java
  /**
   * Create a aviator evaluator instance.
   */
  AviatorEvaluatorInstance() {
    fillDefaultOpts();
    loadFeatureFunctions();
    loadLib();
    loadModule();
    addFunctionLoader(ClassPathConfigFunctionLoader.getInstance());
  }
```
在`AviatorEvaluatorInstance`初始化的时候主要做了几件事情：

- 填充默认的配置参数，也就是填充AviatorEvaluatorInstance#options。它是一个`IdentityHashMap`类型的实例。
    - 程序存在`Options`枚举列举了目前版本所支持的所有的预定义的配置参数。
        - 目前的配置参数的值有几种类型：
            - boolean
            - MathContext
            - int
            - `Set<Feature>`
            - `Set<Class<?>>`
- 加载所有预定义的语法特性（Syntax features）。会填充到`AviatorEvaluatorInstance#funcMap`中。语法特性集合是定义在`Options#FULL_FEATURE_SET`字段中的。
    - 程序存在`Feature`枚举列举了目前版本所支持的所有的预定义的语法特性。
- 加载所有的函数库
    - system functions
    - string functions
    - math functions
    - seq functions
    - 加载内置的通过`aviatorscript`编写的函数，目前在`main/resources`目录下有一个`aviator.av`文件，里面定义了其他的一些seq functions。不过这部分的函数不光存储到上面的`AviatorEvaluatorInstance#funcMap`中，同时也存在了`AviatorEvaluatorInstance#internalLibFunctions`中，存储了2份。
- 加载内置module
    - 目前内置module只有一个`IoModule`。其实就是将其中的方法作为一些内置函数供以后使用。然后module存在了`AviatorEvaluatorInstance#moduleCache`中
- 增加functionLoader。目前其实就是使用`ClassPathConfigFunctionLoader`。存储在了`AviatorEvaluatorInstance#functionLoaders`中

## AviatorScript脚本转换为JAVA代码

在示例程序RunScriptExample中，当构建完`AviatorEvaluatorInstance`实例后，开始执行:`Expression exp = AviatorEvaluator.getInstance().compileScript("examples/hello.av");`。简单说下这一行代码的作用就是读取`"examples/hello.av"`目录下的script文件，做语法树解析，然后通过ASM将AviatorScript语法翻译为JVM可识别的Java字节码，然后进行类加载，构建为`Expression`实例。下面说一下其中的大致执行流程。

其中`compileScript`函数的定义如下：

```java
  /**
   * Compile a script file into expression, it doesn't cache the compiled result.
   *
   * @param file the script file path
   * @return
   */
  public Expression compileScript(final String path) throws IOException {
    return this.compileScript(path, this.cachedExpressionByDefault);
  }

  /**
   * Compile a script file into expression.
   *
   * @param file the script file path
   * @param cached whether to cached the compiled result with key is script file's absolute path.
   * @since 5.0.0
   * @return the compiled expression instance.
   */
  public Expression compileScript(final String path, final boolean cached) throws IOException {
    File file = tryFindScriptFile(path);
    return compileScript(file.getAbsolutePath(), file, cached);
  }  
```

默认情况下`this.cachedExpressionByDefault`是false，也就是不会缓存编译的结果。

其中的`tryFindScriptFile`的作用其实就是做文件查找和加载，代码如下：

```java
  public File tryFindScriptFile(final String path) throws IOException {
    // 1. absolute path
    File file = new File(path);
    if (file.exists()) {
      return file;
    }
    // 2. from context classloader
    ClassLoader contextLoader = Thread.currentThread().getContextClassLoader();
    file = tryFindFileFromClassLoader(path, contextLoader);
    if (file != null) {
      return file;
    }
    // 3. from current class loader
    contextLoader = getClass().getClassLoader();
    file = tryFindFileFromClassLoader(path, contextLoader);
    if (file != null) {
      return file;
    }
    throw new FileNotFoundException("File not found: " + path);
  }

  private File tryFindFileFromClassLoader(final String path, final ClassLoader contextLoader) {
    URL url = contextLoader.getResource(path);
    if (url != null) {
      return new File(url.getPath());
    }
    if (!path.startsWith("/")) {
      url = contextLoader.getResource("/" + path);
    }
    return null;
  }  
```
他会按照如下的顺序加载：
- 将传入的文件路径按照绝对路径加载，加载到了就返回。
- 从线程上下文的classLoader中加载，
- 从当前的classLoader中加载
- 最后还没加载到，抛出`FileNotFoundException`

在另外的`compileScript`重载方法中，会将上面加载到的文件内容完全读出来，然后做下一步的编译操作:

```java
 /**
   * Compile a script into expression.
   *
   * @param cacheKey caching key when cached is true.
   * @param file the script file
   * @param cached whether to cache the expression instance by cacheKey.
   * @return the compiled expression instance.
   * @since 5.0.0
   * @throws IOException
   */
  public Expression compileScript(final String cacheKey, final File file, final boolean cached)
      throws IOException {
    try (InputStream in = new FileInputStream(file);
        Reader reader = new InputStreamReader(in, Charset.forName("utf-8"));) {

      return compile(cacheKey, Utils.readFully(reader), file.getName(), cached);
    }
  }
```

然后在经过一层compile的重载：

```java
  private Expression compile(final String cacheKey, final String expression,
      final String sourceFile, final boolean cached) {
    if (expression == null || expression.trim().length() == 0) {
      throw new CompileExpressionErrorException("Blank expression");
    }
    if (cacheKey == null || cacheKey.trim().length() == 0) {
      throw new CompileExpressionErrorException("Blank cacheKey");
    }

    if (cached) {
      FutureTask<Expression> existedTask = null;
      if (this.expressionLRUCache != null) {
        boolean runTask = false;
        synchronized (this.expressionLRUCache) {
          existedTask = this.expressionLRUCache.get(cacheKey);
          if (existedTask == null) {
            existedTask = newCompileTask(expression, sourceFile, cached);
            runTask = true;
            this.expressionLRUCache.put(cacheKey, existedTask);
          }
        }
        if (runTask) {
          existedTask.run();
        }
      } else {
        FutureTask<Expression> task = this.expressionCache.get(cacheKey);
        if (task != null) {
          return getCompiledExpression(expression, task);
        }
        task = newCompileTask(expression, sourceFile, cached);
        existedTask = this.expressionCache.putIfAbsent(cacheKey, task);
        if (existedTask == null) {
          existedTask = task;
          existedTask.run();
        }
      }
      return getCompiledExpression(cacheKey, existedTask);

    } else {
      return innerCompile(expression, sourceFile, cached);
    }

  }
```

在这一层的重载中，主要是按照是否对结果进行缓存来走不同的分支，我们先不考虑结果缓存，因此我们会直接执行:`innerCompile(expression, sourceFile, false)`

最后就到了最核心的compile的实现了：

```java
  private Expression innerCompile(final String expression, final String sourceFile,
      final boolean cached) {
    ExpressionLexer lexer = new ExpressionLexer(this, expression);
    CodeGenerator codeGenerator = newCodeGenerator(sourceFile, cached);
    ExpressionParser parser = new ExpressionParser(this, lexer, codeGenerator);
    Expression exp = parser.parse();
    if (getOptionValue(Options.TRACE_EVAL).bool) {
      ((BaseExpression) exp).setExpression(expression);
    }
    return exp;
  }
```

先明确一下此时的入参的值：
- expression为`examples/hello.av`文件的内容。
- sourceFile为: hello.av
- cached为false

在这个`innerCompile`方法中，第一行是构建`ExpressionLexer`实例，第三行是构建`ExpressionParser`。其实在我看来这两个的作用基本都是一样的，就是做词法解析，将avaitorScript拆解为可以生成可执行的java代码的材料。关于这块的语法树（AST）解析，我一直觉的是个脏活累活，太恶心了。所以在本篇文章中，暂不详细分析这2个文件。后面计划安排时间专门来说。总之他们的作用就是用来生成java字节码的。

而方法的第二行是构建`CodeGenerator`的示例，底层是基于`ASM`实现的。指的一提的是，类似于其他开源项目，为了减少依赖冲突以及独立性的考量，直接将所需的asm工程的代码复制到项目中进行了使用。

`CodeGenerator`使用的classLoader是`AviatorClassLoader`，同时`AviatorClassLoader getAviatorClassLoader(final boolean cached)`方法支持对classLoader的缓存，这样就不需要每次都创建一个classLoader。

默认缓存的classLoader是在`AviatorEvaluatorInstance`实例化时调用`initAviatorClassLoader()`方法来实现的：

```java
  private AviatorClassLoader initAviatorClassLoader() {
    return AccessController.doPrivileged(new PrivilegedAction<AviatorClassLoader>() {

      @Override
      public AviatorClassLoader run() {
        return new AviatorClassLoader(AviatorEvaluatorInstance.class.getClassLoader());
      }

    });
  }
```

因为这篇文章是以AviatorScript中自带的`RunScriptExample`例子来说明程序执行的流程的，所以其中的`newCodeGenerator`方法会执行到`AviatorEvaluator.EVAL`分支，返回的`CodeGenerator`是`OptimizeCodeGenerator`的示例。而`OptimizeCodeGenerator`的底层其实就是`ASMCodeGenerator`。从方法命名上来看是做了一些优化，但是目前优化点在哪说实话我暂时没有看出来。

在`innerCompile`方法的`Expression exp = parser.parse();`这一行中，其实就是利用了`ExpressionLexer`和`ExpressionParser`做了表达式解析，然后流程会执行到`ExpressionParser#parse(final boolean reportErrorIfNotEOF)`方法的最后一行`return getCodeGeneratorWithTimes().getResult(true);`。在这个`getResult`方法中，会执行到`OptimizeCodeGenerator:438行public Expression getResult(final boolean unboxObject)`。

在`RunScriptExample`的实例执行过程中，会执行到OptimizeCodeGenerator的436行:

```java
    if (exp == null) {
      // call asm to generate byte codes
      callASM(variables, methods, constants);
      // get result from asm
      exp = this.codeGen.getResult(unboxObject);
    }
```

其中这块就是AST解析完成，然后开始通过ASM生成java代码。在这个实例中，
变量`variables`和`constants`都是空的，只有`methods`变量有值：`println -> {Integer@992} 1`。

而上述的2行代码，其实就是通过`OptimizeCodeGenerator#codeGen#classWriter`，借助ASM的API来进行java字节码的生成工作。而当执行到`ASMCodeGenerator#getResult`方法时：

```java
@Override
public Expression getResult(final boolean unboxObject) {
  end(unboxObject);

  //此时的字节码已经生成完事了
  byte[] bytes = this.classWriter.toByteArray();
  try {
    //加载类，这个ClassDefiner中做了一下优化。
    Class<?> defineClass =
        ClassDefiner.defineClass(this.className, Expression.class, bytes, this.classLoader);
        //拿构造函数
    Constructor<?> constructor =
        defineClass.getConstructor(AviatorEvaluatorInstance.class, List.class, SymbolTable.class);
        //调用构造函数做初始化
        //this.variables.values()的值为空list
        //this.symbolTable 为：println -> {Variable@1343} "[type='variable',lexeme='println',index=22]"
    ClassExpression exp = (ClassExpression) constructor.newInstance(this.instance,
        new ArrayList<VariableMeta>(this.variables.values()), this.symbolTable);
    exp.setLambdaBootstraps(this.lambdaBootstraps);
    exp.setFuncsArgs(this.funcsArgs);
    exp.setSourceFile(this.sourceFile);
    return exp;
  } catch (ExpressionRuntimeException e) {
    throw e;
  } catch (Throwable e) {
    if (e.getCause() instanceof ExpressionRuntimeException) {
      throw (ExpressionRuntimeException) e.getCause();
    }
    throw new CompileExpressionErrorException("define class error", e);
  }
}
```

此时字节码已经生成完成了。以`RunScriptExample`实例中的`examples/hello.av`文件：

```shell
## examples/hello.av

println("hello, AviatorScript!");
```
为例子，上述的AviatorScript脚本生成的java字节码反编译后为：

```java
//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

import com.googlecode.aviator.AviatorEvaluatorInstance;
import com.googlecode.aviator.ClassExpression;
import com.googlecode.aviator.lexer.SymbolTable;
import com.googlecode.aviator.runtime.RuntimeUtils;
import com.googlecode.aviator.runtime.type.AviatorFunction;
import com.googlecode.aviator.runtime.type.AviatorString;
import com.googlecode.aviator.utils.Env;
import java.util.List;

public class Script_1620379698495_56 extends ClassExpression {
    private final AviatorFunction f0;

    public Script_1620379698495_56(AviatorEvaluatorInstance var1, List var2, SymbolTable var3) {
        super(var1, var2, var3);
        this.f0 = var1.getFunction("println", var3);
    }

    public final Object execute0(Env var1) {
        RuntimeUtils.assertNotNull(this.f0.call(var1, new AviatorString("hello, AviatorScript!", (boolean)1, (boolean)0, 3)));
        return null;
    }
}
```

这个反编译后的类名是按照一定规则生成的，主要是为了避免重复。

在`ASMCodeGenerator#getResult`方法时中使用`ClassDefiner`对这个类进行了加载，而这个`ClassDefiner`实现的也挺精巧的，内部做了一些优化，优先使用`MethodHandle#invokeExact`来做类加载，如果有问题才会使用`classLoader#defineClass`来做类加载。

类加载够，返回通过反射拿到它的构造函数并执行，对应到上面反编译后的类`Script_1620379698495_56`来说，构造函数执行后，其中的`f0`就是通过调用`AviatorEvaluatorInstance#getFunction`来获取的。在这个case中就是`PrintlnFunction`实例。最后方法返回。

截止到现在，`RunScriptExample`类中的`Expression exp = AviatorEvaluator.getInstance().compileScript("examples/hello.av");`这一行执行完成，

## 执行翻译后的JAVA代码

然后通过执行`exp.execute();`触发刚刚生成的java类进行执行，对应的是`Script_1620379698495_56#execute0`方法。
在执行`this.f0.call(var1, new AviatorString("hello, AviatorScript!", (boolean)1, (boolean)0, 3))`时，调用的是`AviatorFunction`的`public AviatorObject call(Map<String, Object> env, AviatorObject arg1);`方法,继而执行到`PrintlnFunction#call`方法：

```java
 @Override
  public AviatorObject call(Map<String, Object> env, AviatorObject arg1) {
    System.out.println(arg1.getValue(env));
    return AviatorNil.NIL;
  }
```

至此，`RunScriptExample`的流程执行完。

<!-- @include: ../scaffolds/post_footer.md -->
