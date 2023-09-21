---
icon: page
author: xkrivzooh
date: 2019-02-27
category:
  - post
tag:
  - java
---

# Java类的生命周期

当我们编写一个java的源文件后，经过编译会生成一个后缀名为class的文件，这种文件叫做字节码文件，只有这种字节码文件才能够在java虚拟机中运行。
**java类的生命周期就是指一个class文件从加载到卸载的全过程**

我们看一下下面的jvm架构图，这个图太经典了，希望大家收藏这个图。 
![](http://wenchao.ren/img/2020/11/20190227210846.png)


一个java类的完整的生命周期会经历下面五个阶段， 当然也有在加载或者连接之后没有被初始化就直接被使用的情况，如上图所示
- 加载
- 连接
- 初始化
- 使用
- 卸载

对象基本上都是在jvm的堆区中创建，在创建对象之前，会触发类加载（加载、连接、初始化），当类初始化完成后，根据类信息在堆区中实例化类对象，初始化非静态变量、非静态代码以及默认构造方法，当对象使用完之后会在合适的时候被jvm垃圾收集器回收。

对象的生命周期只是类的生命周期中使用阶段的主动引用的一种情况（下面有提主动引用的含义）。而类的整个生命周期则要比对象的生命周期长的多。

### 加载

加载阶段是类的生命周期中的第一个阶段, 在加载阶段，jvm就是找到需要加载的类并把类的信息加载到jvm的方法区中，然后在堆区中实例化一个java.lang.Class对象，作为方法区中这个类的信息的入口。

类的加载方式比较灵活，我们最常用的加载方式有下面几种：
- 一种是根据类的全路径名找到相应的class文件，然后从class文件中读取文件内容；
- 另一种是从jar文件中读取
- 从网络中获取，比如早期的Applet
- 基于字节码生成技术生成的代理类

对于加载的时机，各个虚拟机的做法并不一样，但是有一个原则，就是**当jvm“预期”到一个类将要被使用时，就会在使用它之前对这个类进行加载**。比如说，在一段代码中出现了一个类的名字，jvm在执行这段代码之前并不能确定这个类是否会被使用到，于是，有些jvm会在执行前就加载这个类，而有些则在真正需要用的时候才会去加载它，这取决于具体的jvm实现。我们常用的`hotspot`虚拟机是采用的后者，就是说当真正用到一个类的时候才对它进行加载。

### 链接

链接阶段。有一点需要注意的是有时：**链接阶段并不会等加载阶段完全完成之后才开始，而是交叉进行，可能一个类只加载了一部分之后，连接阶段就已经开始了。但是这两个阶段总的开始时间和完成时间总是固定的：加载阶段总是在连接阶段之前开始，连接阶段总是在加载阶段完成之后完成。** 

连接阶段完成之后会根据使用的情况（直接引用还是被动引用）来选择是否对类进行初始化。

这个阶段的主要任务就是做一些加载后的验证工作以及一些初始化前的准备工作，可以细分为三个步骤：

- 验证
    - 当一个类被加载之后，必须要验证一下这个类是否合法，比如这个类是不是符合字节码的格式、变量与方法是不是有重复、数据类型是不是有效、继承与实现是否合乎标准等等。总之，这个阶段的目的就是保证加载的类是能够被jvm所运行。
- 准备
    - 准备阶段的工作就是为类的静态变量分配内存并设为jvm默认的初值，对于非静态的变量，则不会为它们分配内存。有一点需要注意，这时候，静态变量的初值为jvm默认的初值，而不是我们在程序中设定的初值。jvm默认的初值是这样的：
        - 基本类型（int、long、short、char、byte、boolean、float、double）的默认值为0。
        - 引用类型的默认值为null。
        - 常量的默认值为我们程序中设定的值，比如我们在程序中定义final static int a = 100，则准备阶段中a的初值就是100。
- 解析
    - 这一阶段的任务就是把常量池中的符号引用转换为直接引用。在解析阶段，jvm会将所有的类或接口名、字段名、方法名转换为具体的内存地址。
        - 符号引用：简单的理解就是字符串，比如引用一个类，java.util.ArrayList 这就是一个符号引用，字符串引用的对象不一定被加载。
        - 直接引用：指针或者地址偏移量。引用对象一定在内存（已经加载）


### 初始化

如果一个类被`直接引用`，就会触发类的初始化。在java中，直接引用的情况有：

- 通过new关键字实例化对象、读取或设置类的静态变量、调用类的静态方法。
- 通过反射方式执行以上三种行为。
- 初始化子类的时候，会触发父类的初始化。
- 作为程序入口直接运行时（也就是直接调用main方法）。

除了以上四种情况，其他使用类的方式叫做`被动引用`，而被动引用不会触发类的初始化。

下面的程序演示了主动引用触发类的初始化的四种情况：

```java
import java.lang.reflect.Field;  
   import java.lang.reflect.Method;  
     
   class InitClass{  
       static {  
           System.out.println("初始化InitClass");  
       }  
       public static String a = null;  
       public static void method(){}  
   }  
     
   class SubInitClass extends InitClass{}  
     
   public class Test1 {  
     
       /** 
        * 主动引用引起类的初始化的第四种情况就是运行Test1的main方法时 
        * 导致Test1初始化，这一点很好理解，就不特别演示了。 
        * 本代码演示了前三种情况，以下代码都会引起InitClass的初始化， 
        * 但由于初始化只会进行一次，运行时请将注解去掉，依次运行查看结果。 
        * @param args 
        * @throws Exception 
        */  
       public static void main(String[] args) throws Exception{  
       //  主动引用引起类的初始化一: new对象、读取或设置类的静态变量、调用类的静态方法。  
       //  new InitClass();  
       //  InitClass.a = "";  
       //  String a = InitClass.a;  
       //  InitClass.method();  
             
       //  主动引用引起类的初始化二：通过反射实例化对象、读取或设置类的静态变量、调用类的静态方法。  
        //  Class cls = InitClass.class;  
       //  cls.newInstance();  
             
       //  Field f = cls.getDeclaredField("a");  
       //  f.get(null);  
       //  f.set(null, "s");  
         
       //  Method md = cls.getDeclaredMethod("method");  
       //  md.invoke(null, null);  
                 
       //  主动引用引起类的初始化三：实例化子类，引起父类初始化。  
       //  new SubInitClass();  
     
       }  
   }
```

类的初始化过程是这样的：**按照顺序自上而下运行类中的变量赋值语句和静态语句，如果有父类，则首先按照顺序运行父类中的变量赋值语句和静态语句**。先看一个例子，首先建两个类用来显示赋值操作：

```java
public class Field1{  
       public Field1(){  
           System.out.println("Field1构造方法");  
       }  
   }  
   public class Field2{  
       public Field2(){  
           System.out.println("Field2构造方法");  
       }  
   }

class InitClass2{  
    static{  
        System.out.println("运行父类静态代码");  
    }  
    public static Field1 f1 = new Field1();  
    public static Field1 f2;   
}  
  
class SubInitClass2 extends InitClass2{  
    static{  
        System.out.println("运行子类静态代码");  
    }  
    public static Field2 f2 = new Field2();  
}  
  
public class Test2 {  
    public static void main(String[] args) throws ClassNotFoundException{  
        new SubInitClass2();  
    }  
}
```
上面的代码中，初始化的顺序是：14行，16行，22行，24行。其中第17行没有赋值语句，所以不会被执行。

而下面的代码代码的初始化顺序为：第02行、第05行、第10行、第12行

```java
class InitClass2{  
       public static Field1 f1 = new Field1();  
       public static Field1 f2;  
       static{  
           System.out.println("运行父类静态代码");  
       }  
   }  
     
   class SubInitClass2 extends InitClass2{  
       public static Field2 f2 = new Field2();  
       static{  
           System.out.println("运行子类静态代码");  
       }  
   }  
     
   public class Test2 {  
       public static void main(String[] args) throws ClassNotFoundException{  
           new SubInitClass2();  
       }  
   }
```

说明：**在类的初始化阶段，只会初始化静态代码块以及静态赋值语句，而剩下的都是在实例化对象的时候才会运行。**

### 类的使用

类的使用包括`主动引用`和`被动引用`，主动引用在初始化的章节中已经说过了，下面我们主要来说一下被动引用：

- 引用父类的静态字段，只会引起父类的初始化，而不会引起子类的初始化。
- 定义类数组，不会引起类的初始化。
- 引用类的常量，不会引起类的初始化。

被动引用的示例代码：

```java
class InitClass{  
       static {  
           System.out.println("初始化InitClass");  
       }  
       public static String a = null;  
       public final static String b = "b";  
       public static void method(){}  
   }  
     
   class SubInitClass extends InitClass{  
       static {  
           System.out.println("初始化SubInitClass");  
       }  
   }  
     
   public class Test4 {  
     
       public static void main(String[] args) throws Exception{  
       //  String a = SubInitClass.a;// 引用父类的静态字段，只会引起父类初始化，而不会引起子类的初始化  
        //  String b = InitClass.b;// 使用类的常量不会引起类的初始化  
           SubInitClass[] sc = new SubInitClass[10];// 定义类数组不会引起类的初始化  
       }  
   }
```

最后总结一下使用阶段：`使用阶段包括主动引用和被动引用，主动饮用会引起类的初始化，而被动引用不会引起类的初始化。`

### 卸载阶段

当使用阶段完成之后，java类就进入了卸载阶段。在类使用完之后，如果满足下面的情况，类就会被卸载：

- 该类所有的实例都已经被回收，也就是java堆中不存在该类的任何实例。
- 加载该类的ClassLoader已经被回收。
- 该类对应的java.lang.Class对象没有任何地方被引用，无法在任何地方通过反射访问该类的方法。

如果以上三个条件全部满足，jvm就会在方法区垃圾回收的时候对类进行卸载，类的卸载过程其实就是在方法区中清空类信息，java类的整个生命周期就结束了。



## 参考资料

- [详解Java类的生命周期](https://mp.weixin.qq.com/s?__biz=MzIwMTY0NDU3Nw==&mid=2651935038&idx=1&sn=371a3720159f2f05bccb82884ded6e96&chksm=8d0f3e70ba78b7661a6549c8df6478864612d499e71ba4b5b2eba11215debbad6d8b2c0875dd&mpshare=1&scene=1&srcid=%23rd)



<!-- @include: ../scaffolds/post_footer.md -->
