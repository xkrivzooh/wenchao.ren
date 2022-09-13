---
icon: page
author: xkrivzooh
sidebar: false
date: 2021-05-08
category:
  - post
tag:
  - AviatorScript
---

# "AviatorScript ClassDefiner源码解析"

在AviatorScript的内部实现机制中，需要将AviatorScript脚本翻译为可执行的java代码，所以会设计到「类的动态生成」和「类的加载」这2个功能。
而其中关于「类的加载」这部分的功能是在`com.googlecode.aviator.code.asm.ClassDefiner`中实现的, 在`ASMCodeGenerator`中通过下面的方式来使用：

```java
 Class<?> defineClass =
          ClassDefiner.defineClass(this.className, Expression.class, bytes, this.classLoader);
```

而这个`defineClass`方法的定义如下：

```java
  public static final Class<?> defineClass(final String className, final Class<?> clazz,
      final byte[] bytes, final AviatorClassLoader classLoader)
      throws NoSuchFieldException, IllegalAccessException {
    if (!preferClassLoader && DEFINE_CLASS_HANDLE != null) {
      try {
        Class<?> defineClass = (Class<?>) DEFINE_CLASS_HANDLE.invokeExact(clazz, bytes, EMPTY_OBJS);
        return defineClass;
      } catch (Throwable e) {
        // fallback to class loader mode.
        if (errorTimes++ > 10000) {
          preferClassLoader = true;
        }
        return defineClassByClassLoader(className, bytes, classLoader);
      }
    } else {
      return defineClassByClassLoader(className, bytes, classLoader);
    }
  }
```

因为上下文中`preferClassLoader`的定义是：

```java
private static boolean preferClassLoader = Boolean.valueOf(System
      .getProperty("aviator.preferClassloaderDefiner", String.valueOf(IS_JDK7 || IS_IBM_SDK)));
```

考虑到大家主流现在使用的是Oracle JDK8，所以这个preferClassLoader一般的取值为false。

而`ClassDefiner`中的`DEFINE_CLASS_HANDLE`的取值逻辑如下：

```java
  private static MethodHandle DEFINE_CLASS_HANDLE;

  static {
    // Try to get defineAnonymousClass method handle.
    try {
      Class<?> clazz = Class.forName("sun.misc.Unsafe");
      if (clazz != null) {
        Field f = clazz.getDeclaredField("theUnsafe");
        f.setAccessible(true);
        Object unsafe = f.get(null);
        MethodHandle methodHandle =
            MethodHandles.lookup().findVirtual(clazz, "defineAnonymousClass",
                methodType(Class.class, Class.class, byte[].class, Object[].class));

        if (methodHandle != null) {
          methodHandle = methodHandle.bindTo(unsafe);
        }
        DEFINE_CLASS_HANDLE = methodHandle;
      }

    } catch (Throwable e) {
      // ignore
    }
  }
```

从上面代码可以看出，程序通过反射加载`Unsafe#theUnsafe`字段获取到Unsafe实例，然后拿到`Unsafe#defineAnonymousClass`的方法句柄，并赋值给`DEFINE_CLASS_HANDLE`。



所以`defineClass`程序中，会优先使用`Unsafe#defineAnonymousClass`的形式来做类加载

```java
Class<?> defineClass = (Class<?>) DEFINE_CLASS_HANDLE.invokeExact(clazz, bytes, EMPTY_OBJS);
```
如果这种加载方式出现异常，或者应用程序运行期间出现超过10000次异常之后，才会回退到使用`classLoader#defineClass`的形式做来加载。
那么问题来了，为什么要优先使用`Unsafe#defineAnonymousClass`来做类加载，它的优势是什么？

## Unsafe#defineAnonymousClass

defineAnonymousClass方法的定义如下：

```java
public native Class<?> defineAnonymousClass(Class<?> hostClass, byte[] data, Object[] cpPatches);
```

他的作用其实就是如期名字一样，定义匿名类，不过它这种定义的应该叫做：`Hidden class`。关于Hidden Class的完整文档可以参考[JEP 371: Hidden Classes](https://openjdk.java.net/jeps/371)。

>  hidden classes, which are classes that cannot be used directly by the bytecode of other classes. Hidden classes are intended for use by frameworks that generate classes at run time and use them indirectly, via reflection. A hidden class may be defined as a member of an access control nest, and may be unloaded independently of other classes.



从官方文档中，我们其实可以知道Hidden Class最大的好处就是`may be unloaded independently of other classes`，这一点我粘贴一下官方文档：

> Unloading hidden classes
>
> A class defined by a class loader has a strong relationship with that class loader. In particular, every Class object has a reference to the ClassLoader that defined it. This tells the JVM which loader to use when resolving symbols in the class. One consequence of this relationship is that a normal class cannot be unloaded unless its defining loader can be reclaimed by the garbage collector (JLS 12.7). Being able to reclaim the defining loader implies there are no live references to the loader, which in turn implies there are no live references to any of the classes defined by the loader. (Such classes, if they were reachable, would refer to the loader.) This widespread lack of liveness is the only state where it is safe to unload a normal class.
>
> Accordingly, to maximize the chance of unloading a normal class, it is important to minimize references to both the class and its defining loader. Language runtimes typically achieve this by creating many class loaders, each dedicated to defining just one class, or perhaps a small number of related classes. When all instances of a class are reclaimed, and assuming the runtime does not hold on to the class loader, both the class and its defining loader can be reclaimed. However, the resulting large number of class loaders is demanding on memory. In addition, ClassLoader::defineClass is considerably slower than Unsafe::defineAnonymousClass according to microbenchmarks.
>
> A hidden class is not created by a class loader and has only a loose connection to the class loader deemed to be its defining loader. We can turn these facts to our advantage by allowing a hidden class to be unloaded even if its notional defining loader cannot be reclaimed by the garbage collector. As long as there are live references to a hidden class -- either to instances of the hidden class, or to its Class object -- then the hidden class keeps its notional defining loader alive so that the JVM can use that loader to resolve symbols in the hidden class. When the last live reference to the hidden class goes away, however, the loader need not return the favor by keeping the hidden class alive.
>
> Unloading a normal class while its defining loader is reachable is unsafe because the loader may later be asked, either by the JVM or or by code using reflection, to reload the class, that is, to load a class with the same name. This can have unpredictable effects when static initializers are run for a second time. There is no such concern about unloading a hidden class, since hidden classes are not created in the same manner. Because a hidden class's name is an output of Lookup::defineHiddenClass, not an input, there is no way to recreate the "same" hidden class that was unloaded previously.
>
> By default, Lookup::defineHiddenClass will create a hidden class that can be unloaded regardless of whether its notional defining loader is still alive. That is, when all instances of the hidden class are reclaimed and the hidden class is no longer reachable, it may be unloaded even though its notional defining loader is still reachable. This behavior is useful when a language runtime creates a hidden class to serve multiple classes defined by arbitrary class loaders: The runtime will see an improvement in footprint and performance relative to both ClassLoader::defineClass and Unsafe::defineAnonymousClass. In other cases, a language runtime may link a hidden class to just one normal class, or perhaps a small number of normal classes, with the same defining loader as the hidden class. In such cases, where the hidden class must be coterminous with a normal class, the STRONG option may be passed to Lookup::defineHiddenClass. This arranges for a hidden class to have the same strong relationship with its notional defining loader as a normal class has with its defining loader, which is to say, the hidden class will only be unloaded if its notional defining loader can be reclaimed.

便于类卸载这一点对于AviatorScript这种可能需要大量动态生成很多class的框架来说，是具有非常大的吸引力的。当然了，官方文档也描述了，根据微基准测试，ClassLoader::defineClass比Unsafe::defineAnonymousClass慢得多。

关于这块的优化，在AviatorScript的官方文档也有描述：

[匿名类的卸载](https://www.yuque.com/boyan-avfmj/aviatorscript/ou23gy#PMc8K)

> 对于 JDK7（目前兼容的最老 JDK 版本），默认情况下会为每一个 AviatorEvaluatorInstance 使用一个 ClassLoader 来定义并生成匿名类，这种情况下，类的卸载只会发生在所有类的引用都不存在的情况下，需要默认 ClassLoader 也被垃圾回收，因此仅调用 invalidateCache 是不够的，还需要调用 resetClassLoader() 才可以让某个脚本的编译结果被回收。
>对于 JDK8 及以上版本， AviatorScript 会使用跟 Java Lambda 一样的生成机制来生成匿名类，这些类可以被正常 GC 回收，只需要对应的编译结果没有引用就可以，因此调用 invalidateCache 使得缓存失效即可。
>在 IBM J9 或者其他 JDK 上，默认启用的是 classloader 模式，建议同 JDK7 。如果你强制设置了 aviator.preferClassloaderDefiner 环境变量为 true，也就是启用 classloader 定义模式，建议也是和 JDK7 一致。

## 参考资料

- [JEP 371: Hidden Classes](https://openjdk.java.net/jeps/371)
