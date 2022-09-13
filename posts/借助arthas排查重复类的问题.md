---
icon: page
author: xkrivzooh
date: 2020-05-29
category:
  - post
tag:
  - java
  - arthas
---

# 借助arthas排查重复类的问题

## 现象描述

业务反馈他们的项目运行时出现Jackson中的com.fasterxml.jackson.databind.deser.SettableBeanProperty类的版本不对，和他们在pom中指定的版本不一致，这种问题一般都是因为项目的依赖（包括间接依赖）中，存在某些依赖有shade包，如果这些shade包打包的时候忘记修改package，那么就经常会出现这种问题。

## 解决思路

这种问题其实只要确定jvm加载的这个com.fasterxml.jackson.databind.deser.SettableBeanProperty到底来自哪个jar就可以帮助我们确定问题根源，而借助Arthas可以快速解决这个问题：
- 使用Arthas连接具体环境的具体机器上的应用
- 在console中输入如下的命令： `sc -fd com.fasterxml.jackson.databind.deser.SettableBeanProperty`
- 查看console的输出，看其中的 code-source就可以指定这个类来自哪个jar了

```shell
## 安装arthas
curl -L https://alibaba.github.io/arthas/install.sh | sh
## $PID为自己项目运行的pid，注意修改， 此处使用tomcat用户是因为我们的程序是tomcat用户运行的
sudo -u tomcat -EH ./as.sh $PID
## arthas attach成功以后在console中输入
sc -fd com.fasterxml.jackson.databind.deser.SettableBeanProperty
```

下面贴一个`sc`命令的样例输出：

```java
class-info        com.fasterxml.jackson.databind.deser.impl.SetterlessProperty
 code-source       /data/w/www/data-bbb-sea.aaa.com/webapps/ROOT/WEB-INF/lib/jackson-databind-2.10.3.jar
 name              com.fasterxml.jackson.databind.deser.impl.SetterlessProperty
 isInterface       false
 isAnnotation      false
 isEnum            false
 isAnonymousClass  false
 isArray           false
 isLocalClass      false
 isMemberClass     false
 isPrimitive       false
 isSynthetic       false
 simple-name       SetterlessProperty
 modifier          final,public
 annotation
 interfaces
 super-class       +-com.fasterxml.jackson.databind.deser.SettableBeanProperty
                     +-com.fasterxml.jackson.databind.introspect.ConcreteBeanPropertyBase
                       +-java.lang.Object
 class-loader      +-WebappClassLoader
                       context:
                       delegate: false
                       repositories:
                         /WEB-INF/classes/
                     ----------> Parent Classloader:
                     org.apache.catalina.loader.StandardClassLoader@224edc67
                     +-org.apache.catalina.loader.StandardClassLoader@224edc67
                       +-sun.misc.Launcher$AppClassLoader@18b4aac2
                         +-sun.misc.Launcher$ExtClassLoader@5ccddd20
 classLoaderHash   4c6a62ac
 fields            name     serialVersionUID
                   type     long
                   modifier final,private,static
                   value    1
                   name     _annotated
                   type     com.fasterxml.jackson.databind.introspect.AnnotatedMethod
                   modifier final,protected
                   name     _getter
                   type     java.lang.reflect.Method
                   modifier final,protected
 
Affect(row-cnt:11) cost in 183 ms.
```
