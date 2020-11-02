---
title: Intellij IDEA配置maven环境变量
toc: true
date: 2020-06-04 18:31:44
tags: ['idea']
draft: false
---

有时候项目中会使用到tools.jar，一般我们会在maven的pom文件中配置：

```xml
	<dependency>
			<groupId>com.sun</groupId>
			<artifactId>tools</artifactId>
			<version>1.8</version>
			<scope>system</scope>
			<systemPath>${JAVA_HOME}/lib/tools.jar</systemPath>
		</dependency>
```

一般公司的服务器上的jAVA_HOME是固定的，而大家电脑上的JAVA_HOME很可能不一样，那么在使用`maven clean`命令的时候很可能会出现下面的异常：

```java
/Library/Java/JavaVirtualMachines/jdk1.8.0_211.jdk/Contents/Home/bin/java -Dvisualvm.id=106646863982958 -Dmaven.multiModuleProjectDirectory=/Users/xkrivzooh/IdeaProjects/bistoury "-Dmaven.home=/Applications/IntelliJ IDEA.app/Contents/plugins/maven/lib/maven3" "-Dclassworlds.conf=/Applications/IntelliJ IDEA.app/Contents/plugins/maven/lib/maven3/bin/m2.conf" "-Dmaven.ext.class.path=/Applications/IntelliJ IDEA.app/Contents/plugins/maven/lib/maven-event-listener.jar" "-javaagent:/Applications/IntelliJ IDEA.app/Contents/lib/idea_rt.jar=49260:/Applications/IntelliJ IDEA.app/Contents/bin" -Dfile.encoding=UTF-8 -classpath "/Applications/IntelliJ IDEA.app/Contents/plugins/maven/lib/maven3/boot/plexus-classworlds.license:/Applications/IntelliJ IDEA.app/Contents/plugins/maven/lib/maven3/boot/plexus-classworlds-2.6.0.jar" org.codehaus.classworlds.Launcher -Didea.version2020.1.1 --update-snapshots clean
[INFO] Scanning for projects...
[ERROR] [ERROR] Some problems were encountered while processing the POMs:
[ERROR] 'dependencies.dependency.systemPath' for com.sun:tools:jar must specify an absolute path but is ${JAVA_HOME}/lib/tools.jar @ line 133, column 16
 @ 
[ERROR] The build could not read 1 project -> [Help 1]
[ERROR]   
[ERROR]   The project com.wormpex.fd:bistoury-ui:1.0.0 (/Users/xkrivzooh/IdeaProjects/bistoury/bistoury-ui/pom.xml) has 1 error
[ERROR]     'dependencies.dependency.systemPath' for com.sun:tools:jar must specify an absolute path but is ${JAVA_HOME}/lib/tools.jar @ line 133, column 16
[ERROR] 
[ERROR] To see the full stack trace of the errors, re-run Maven with the -e switch.
[ERROR] Re-run Maven using the -X switch to enable full debug logging.
[ERROR] 
[ERROR] For more information about the errors and possible solutions, please read the following articles:
[ERROR] [Help 1] http://cwiki.apache.org/confluence/display/MAVEN/ProjectBuildingException
```

其中的`'dependencies.dependency.systemPath' for com.sun:tools:jar must specify an absolute path but is ${JAVA_HOME}/lib/tools.jar @ line 133, column 16`提示我们需要一个绝对路径，那么就是${JAVA_HOME}
没有被识别，我们可以在idea的maven中设置一下环境变量来解决这个事情:

![IDEA为maven设置环境变量](http://wenchao.ren/img/2020/11/20200604183613.png)

保存之后在执行一下maven clean就会发现成功了。当然了你也可以设置全局环境变量来解决这个问题。