---
icon: page
author: xkrivzooh
date: 2019-03-08
category:
  - post
tag:
  - java
---

# log4j-api-2.11.1.jar ClassFormatException

今天在部署系统的时候tomcat出现下面的异常信息：

```java
Mar 08, 2019 4:18:05 PM org.apache.catalina.startup.ContextConfig processAnnotationsJar
SEVERE: Unable to process Jar entry [META-INF/versions/9/module-info.class] from Jar [jar:file:/xxxxx/webapps/ROOT/WEB-INF/lib/log4j-api-2.11.1.jar!/] for annotations
org.apache.tomcat.util.bcel.classfile.ClassFormatException: Invalid byte tag in constant pool: 19
	at org.apache.tomcat.util.bcel.classfile.Constant.readConstant(Constant.java:133)
	at org.apache.tomcat.util.bcel.classfile.ConstantPool.<init>(ConstantPool.java:60)
	at org.apache.tomcat.util.bcel.classfile.ClassParser.readConstantPool(ClassParser.java:209)
	at org.apache.tomcat.util.bcel.classfile.ClassParser.parse(ClassParser.java:119)
	at org.apache.catalina.startup.ContextConfig.processAnnotationsStream(ContextConfig.java:2134)
	at org.apache.catalina.startup.ContextConfig.processAnnotationsJar(ContextConfig.java:2010)
	at org.apache.catalina.startup.ContextConfig.processAnnotationsUrl(ContextConfig.java:1976)
	at org.apache.catalina.startup.ContextConfig.processAnnotations(ContextConfig.java:1961)
	at org.apache.catalina.startup.ContextConfig.webConfig(ContextConfig.java:1319)
	at org.apache.catalina.startup.ContextConfig.configureStart(ContextConfig.java:878)
	at org.apache.catalina.startup.ContextConfig.lifecycleEvent(ContextConfig.java:376)
	at org.apache.catalina.util.LifecycleSupport.fireLifecycleEvent(LifecycleSupport.java:119)
	at org.apache.catalina.util.LifecycleBase.fireLifecycleEvent(LifecycleBase.java:90)
	at org.apache.catalina.core.StandardContext.startInternal(StandardContext.java:5322)
	at org.apache.catalina.util.LifecycleBase.start(LifecycleBase.java:150)
	at org.apache.catalina.core.ContainerBase.addChildInternal(ContainerBase.java:901)
	at org.apache.catalina.core.ContainerBase.addChild(ContainerBase.java:877)
	at org.apache.catalina.core.StandardHost.addChild(StandardHost.java:633)
	at org.apache.catalina.startup.HostConfig.deployDirectory(HostConfig.java:1120)
	at org.apache.catalina.startup.HostConfig$DeployDirectory.run(HostConfig.java:1678)
	at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)
	at java.util.concurrent.FutureTask.run(FutureTask.java:266)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1142)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:617)
	at java.lang.Thread.run(Thread.java:745)
```

出现这个异常的原因是因为我们的服务器使用的是java8，而工程代码中依赖的`log4j-api-2.11.1.jar`有部分java9版本的字节码文件。

![log4j-api-2.11.1.jar工程结构图](http://wenchao.ren/img/2020/11/20190308171150.png)

然后排查了发现`log4j-api-2.11.1.jar`是通过`elasticsearch`的`6.5.1`引入的。
