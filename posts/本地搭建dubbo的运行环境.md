---
icon: page
author: xkrivzooh
date: 2019-01-23
category:
  - post
tag:
  - dubbo
---

# 本地搭建dubbo的运行环境

本篇文章主要讲述如何在本地搭建dubbo的运行环境

## 安装zk

dubbo推荐使用zk来作为自己的注册中心，当然使用其余的实现来作为注册中心也是可以的。比如我之前就使用redis实现了一个注册中心。

Dubbo 未对 Zookeeper 服务器端做任何侵入修改，只需安装原生的 Zookeeper 服务器即可，
所有注册中心逻辑适配都在调用 Zookeeper 客户端时完成。

安装zk：

```shell
wget http://archive.apache.org/dist/zookeeper/zookeeper-3.3.3/zookeeper-3.3.3.tar.gz
tar zxvf zookeeper-3.3.3.tar.gz
cd zookeeper-3.3.3
cp conf/zoo_sample.cfg conf/zoo.cfg
```

配置:

```
vi conf/zoo.cfg

```

如果不需要集群，zoo.cfg 的内容如下 ：

```
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/home/dubbo/zookeeper-3.3.3/data
clientPort=2181
```

如果需要集群，zoo.cfg 的内容如下(其中 data 目录和 server 地址需改成你真实部署机器的信息)

```
tickTime=2000
initLimit=10
syncLimit=5
dataDir=/home/dubbo/zookeeper-3.3.3/data
clientPort=2181
server.1=10.20.153.10:2555:3555
server.2=10.20.153.11:2555:3555
```

并在 data 目录下放置 `myid` 文件：
```
mkdir data
vi myid
```

myid 指明自己的 id，对应上面 `zoo.cfg` 中 `server.` 后的数字，第一台的内容为 1，第二台的内容为 2，内容如下：
```
1
```

### 启动

```
./bin/zkServer.sh start

```

如果是windows环境的话，直接双击`zkServer.cmd`文件。不过建议修改zkServer.cmd文件，在文件的最末尾处增加一行，内容为`pause`，修改完以后`zkServer.cmd`文件
的内容为

```
@echo off
REM Licensed to the Apache Software Foundation (ASF) under one or more
REM contributor license agreements.  See the NOTICE file distributed with
REM this work for additional information regarding copyright ownership.
REM The ASF licenses this file to You under the Apache License, Version 2.0
REM (the "License"); you may not use this file except in compliance with
REM the License.  You may obtain a copy of the License at
REM
REM     http://www.apache.org/licenses/LICENSE-2.0
REM
REM Unless required by applicable law or agreed to in writing, software
REM distributed under the License is distributed on an "AS IS" BASIS,
REM WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
REM See the License for the specific language governing permissions and
REM limitations under the License.

setlocal
call "%~dp0zkEnv.cmd"

set ZOOMAIN=org.apache.zookeeper.server.quorum.QuorumPeerMain
echo on
call %JAVA% "-Dzookeeper.log.dir=%ZOO_LOG_DIR%" "-Dzookeeper.root.logger=%ZOO_LOG4J_PROP%" -cp "%CLASSPATH%" %ZOOMAIN% "%ZOOCFG%" %*

endlocal

pause
```

这样当系统环境有问题的时候就可以在终端看见具体是啥问题了。

### 停止:

```
./bin/zkServer.sh stop
```

```
telnet 127.0.0.1 2181
dump
```

或者:

```
echo dump | nc 127.0.0.1 2181
```

用法:

```
dubbo.registry.address=zookeeper://10.20.153.10:2181?backup=10.20.153.11:2181
```
或者:

```
<dubbo:registry protocol="zookeeper" address="10.20.153.10:2181,10.20.153.11:2181" />
```

比如以`dubbo-demo-provider`中的`dubbo-demo-provider.xml`文件为例子，使用本地的zk修改以后内容为：

```xml
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">

    <!-- provider's application name, used for tracing dependency relationship -->
    <dubbo:application name="demo-provider"/>

    <!-- use multicast registry center to export service -->
    <!--<dubbo:registry address="multicast://224.5.6.7:1234"/>-->
    <dubbo:registry protocol="zookeeper" address="localhost:2181"/>

    <!-- use dubbo protocol to export service on port 20880 -->
    <dubbo:protocol name="dubbo" port="20880"/>

    <!-- service implementation, as same as regular local bean -->
    <bean id="demoService" class="org.apache.dubbo.demo.provider.DemoServiceImpl"/>

    <!-- declare the service interface to be exported -->
    <dubbo:service interface="org.apache.dubbo.demo.DemoService" ref="demoService"/>

</beans>
```

## 安装dubbo

其实就是下载dubbo的源码以及对应的maven依赖：

```
git clone https://github.com/apache/incubator-dubbo.git
cd incubator-dubbo
运行 dubbo-demo-provider中的com.alibaba.dubbo.demo.provider.Provider
如果使用Intellij Idea 请加上-Djava.net.preferIPv4Stack=true
```

配置：

```
resource/META-INFO.spring/dubbo-demo-provider.xml
修改其中的dubbo:registery，替换成真实的注册中心地址，推荐使用zookeeper
```

## 运行demo

### 启动provider

本地启动zk以后，运行dubbo-demo-provider中的`Provider`类，日志输出为

```java
Connected to the target VM, address: '127.0.0.1:7562', transport: 'socket'
[20/08/18 11:43:20:020 CST] main  INFO support.ClassPathXmlApplicationContext: Refreshing org.springframework.context.support.ClassPathXmlApplicationContext@551aa95a: startup date [Mon Aug 20 23:43:20 CST 2018]; root of context hierarchy
[20/08/18 11:43:20:020 CST] main  INFO xml.XmlBeanDefinitionReader: Loading XML bean definitions from class path resource [META-INF/spring/dubbo-demo-provider.xml]
[20/08/18 11:43:20:020 CST] main  INFO logger.LoggerFactory: using logger: org.apache.dubbo.common.logger.log4j.Log4jLoggerAdapter
[20/08/18 11:43:20:020 CST] main  WARN extension.SpringExtensionFactory:  [DUBBO] No spring extension(bean) named:defaultCompiler, try to find an extension(bean) of type java.lang.String, dubbo version: , current host: 192.168.116.1
[20/08/18 11:43:20:020 CST] main  WARN extension.SpringExtensionFactory:  [DUBBO] No spring extension(bean) named:defaultCompiler, type:java.lang.String found, stop get bean., dubbo version: , current host: 192.168.116.1
[20/08/18 11:43:20:020 CST] main  INFO config.AbstractConfig:  [DUBBO] The service ready on spring started. service: org.apache.dubbo.demo.DemoService, dubbo version: , current host: 192.168.116.1
[20/08/18 11:43:21:021 CST] main  INFO config.AbstractConfig:  [DUBBO] Export dubbo service org.apache.dubbo.demo.DemoService to local registry, dubbo version: , current host: 192.168.116.1
[20/08/18 11:43:21:021 CST] main  INFO config.AbstractConfig:  [DUBBO] Export dubbo service org.apache.dubbo.demo.DemoService to url dubbo://192.168.116.1:20880/org.apache.dubbo.demo.DemoService?anyhost=true&application=demo-provider&bind.ip=192.168.116.1&bind.port=20880&dubbo=2.0.2&generic=false&interface=org.apache.dubbo.demo.DemoService&methods=sayHello&pid=6872&qos.port=22222&side=provider&timestamp=1534779801013, dubbo version: , current host: 192.168.116.1
[20/08/18 11:43:21:021 CST] main  INFO config.AbstractConfig:  [DUBBO] Register dubbo service org.apache.dubbo.demo.DemoService url dubbo://192.168.116.1:20880/org.apache.dubbo.demo.DemoService?anyhost=true&application=demo-provider&bind.ip=192.168.116.1&bind.port=20880&dubbo=2.0.2&generic=false&interface=org.apache.dubbo.demo.DemoService&methods=sayHello&pid=6872&qos.port=22222&side=provider&timestamp=1534779801013 to registry registry://localhost:2181/org.apache.dubbo.registry.RegistryService?application=demo-provider&dubbo=2.0.2&pid=6872&qos.port=22222&registry=zookeeper&timestamp=1534779801006, dubbo version: , current host: 192.168.116.1
[20/08/18 11:43:22:022 CST] main  INFO transport.AbstractServer:  [DUBBO] Start NettyServer bind /0.0.0.0:20880, export /192.168.116.1:20880, dubbo version: , current host: 192.168.116.1
[20/08/18 11:43:22:022 CST] main  INFO zookeeper.ZookeeperRegistry:  [DUBBO] Load registry store file C:\Users\wenchao.ren\.dubbo\dubbo-registry-demo-provider-localhost:2181.cache, data: {org.apache.dubbo.demo.DemoService=empty://192.168.116.1:20880/org.apache.dubbo.demo.DemoService?anyhost=true&application=demo-provider&category=configurators&check=false&dubbo=2.0.2&generic=false&interface=org.apache.dubbo.demo.DemoService&methods=sayHello&pid=18588&side=provider&timestamp=1534778576083}, dubbo version: , current host: 192.168.116.1
[20/08/18 11:43:22:022 CST] main  INFO imps.CuratorFrameworkImpl: Starting
[20/08/18 11:43:22:022 CST] main  INFO zookeeper.ZooKeeper: Client environment:zookeeper.version=3.4.9-1757313, built on 08/23/2016 06:50 GMT
[20/08/18 11:43:22:022 CST] main  INFO zookeeper.ZooKeeper: Client environment:host.name=c
[20/08/18 11:43:22:022 CST] main  INFO zookeeper.ZooKeeper: Client environment:java.version=1.8.0_181
[20/08/18 11:43:22:022 CST] main  INFO zookeeper.ZooKeeper: Client environment:java.vendor=Oracle Corporation
[20/08/18 11:43:22:022 CST] main  INFO zookeeper.ZooKeeper: Client environment:java.home=C:\Program Files\Java\jdk1.8.0_181\jre
[20/08/18 11:43:22:022 CST] main  INFO zookeeper.ZooKeeper: Client environment:java.class.path=C:\Program Files\Java\jdk1.8.0_181\jre\lib\charsets.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\deploy.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\access-bridge-64.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\cldrdata.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\dnsns.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\jaccess.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\jfxrt.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\localedata.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\nashorn.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\sunec.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\sunjce_provider.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\sunmscapi.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\sunpkcs11.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\zipfs.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\javaws.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\jce.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\jfr.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\jfxswt.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\jsse.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\management-agent.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\plugin.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\resources.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\rt.jar;E:\workstations\dubbo\incubator-dubbo\dubbo-demo\dubbo-demo-provider\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-demo\dubbo-demo-api\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-config\dubbo-config-spring\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-config\dubbo-config-api\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-monitor\dubbo-monitor-api\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-filter\dubbo-filter-validation\target\classes;C:\Users\wenchao.ren\.m2\repository\javax\validation\validation-api\1.1.0.Final\validation-api-1.1.0.Final.jar;E:\workstations\dubbo\incubator-dubbo\dubbo-filter\dubbo-filter-cache\target\classes;C:\Users\wenchao.ren\.m2\repository\javax\cache\cache-api\1.0.0\cache-api-1.0.0.jar;E:\workstations\dubbo\incubator-dubbo\dubbo-bootstrap\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-common\target\classes;C:\Users\wenchao.ren\.m2\repository\commons-logging\commons-logging\1.2\commons-logging-1.2.jar;C:\Users\wenchao.ren\.m2\repository\log4j\log4j\1.2.16\log4j-1.2.16.jar;C:\Users\wenchao.ren\.m2\repository\org\javassist\javassist\3.20.0-GA\javassist-3.20.0-GA.jar;C:\Users\wenchao.ren\.m2\repository\org\springframework\spring-beans\4.3.16.RELEASE\spring-beans-4.3.16.RELEASE.jar;C:\Users\wenchao.ren\.m2\repository\org\springframework\spring-core\4.3.16.RELEASE\spring-core-4.3.16.RELEASE.jar;C:\Users\wenchao.ren\.m2\repository\org\springframework\spring-web\4.3.16.RELEASE\spring-web-4.3.16.RELEASE.jar;C:\Users\wenchao.ren\.m2\repository\org\springframework\spring-aop\4.3.16.RELEASE\spring-aop-4.3.16.RELEASE.jar;C:\Users\wenchao.ren\.m2\repository\org\springframework\spring-context\4.3.16.RELEASE\spring-context-4.3.16.RELEASE.jar;C:\Users\wenchao.ren\.m2\repository\org\springframework\spring-expression\4.3.16.RELEASE\spring-expression-4.3.16.RELEASE.jar;E:\workstations\dubbo\incubator-dubbo\dubbo-rpc\dubbo-rpc-injvm\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-registry\dubbo-registry-zookeeper\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-registry\dubbo-registry-api\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-cluster\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-remoting\dubbo-remoting-zookeeper\target\classes;C:\Users\wenchao.ren\.m2\repository\org\apache\zookeeper\zookeeper\3.4.9\zookeeper-3.4.9.jar;C:\Users\wenchao.ren\.m2\repository\org\slf4j\slf4j-api\1.7.25\slf4j-api-1.7.25.jar;C:\Users\wenchao.ren\.m2\repository\org\slf4j\slf4j-log4j12\1.6.1\slf4j-log4j12-1.6.1.jar;C:\Users\wenchao.ren\.m2\repository\jline\jline\0.9.94\jline-0.9.94.jar;C:\Users\wenchao.ren\.m2\repository\io\netty\netty\3.10.5.Final\netty-3.10.5.Final.jar;C:\Users\wenchao.ren\.m2\repository\com\101tec\zkclient\0.2\zkclient-0.2.jar;C:\Users\wenchao.ren\.m2\repository\org\apache\curator\curator-framework\2.12.0\curator-framework-2.12.0.jar;C:\Users\wenchao.ren\.m2\repository\org\apache\curator\curator-client\2.12.0\curator-client-2.12.0.jar;C:\Users\wenchao.ren\.m2\repository\com\google\guava\guava\16.0.1\guava-16.0.1.jar;E:\workstations\dubbo\incubator-dubbo\dubbo-registry\dubbo-registry-multicast\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-rpc\dubbo-rpc-dubbo\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-rpc\dubbo-rpc-api\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-remoting\dubbo-remoting-api\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-container\dubbo-container-api\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-remoting\dubbo-remoting-netty4\target\classes;C:\Users\wenchao.ren\.m2\repository\io\netty\netty-all\4.1.25.Final\netty-all-4.1.25.Final.jar;E:\workstations\dubbo\incubator-dubbo\dubbo-serialization\dubbo-serialization-hessian2\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-serialization\dubbo-serialization-api\target\classes;C:\Users\wenchao.ren\.m2\repository\com\alibaba\fastjson\1.2.46\fastjson-1.2.46.jar;C:\Users\wenchao.ren\.m2\repository\com\esotericsoftware\kryo\4.0.1\kryo-4.0.1.jar;C:\Users\wenchao.ren\.m2\repository\com\esotericsoftware\reflectasm\1.11.3\reflectasm-1.11.3.jar;C:\Users\wenchao.ren\.m2\repository\org\ow2\asm\asm\5.0.4\asm-5.0.4.jar;C:\Users\wenchao.ren\.m2\repository\com\esotericsoftware\minlog\1.3.0\minlog-1.3.0.jar;C:\Users\wenchao.ren\.m2\repository\de\javakaffee\kryo-serializers\0.42\kryo-serializers-0.42.jar;C:\Users\wenchao.ren\.m2\repository\de\ruedigermoeller\fst\2.48-jdk-6\fst-2.48-jdk-6.jar;C:\Users\wenchao.ren\.m2\repository\com\fasterxml\jackson\core\jackson-core\2.8.6\jackson-core-2.8.6.jar;C:\Users\wenchao.ren\.m2\repository\com\cedarsoftware\java-util\1.9.0\java-util-1.9.0.jar;C:\Users\wenchao.ren\.m2\repository\com\cedarsoftware\json-io\2.5.1\json-io-2.5.1.jar;C:\Users\wenchao.ren\.m2\repository\com\alibaba\hessian-lite\3.2.3\hessian-lite-3.2.3.jar;C:\Users\wenchao.ren\.m2\repository\org\objenesis\objenesis\2.6\objenesis-2.6.jar;C:\Users\wenchao.ren\AppData\Local\JetBrains\Toolbox\apps\IDEA-U\ch-0\182.3684.40\lib\idea_rt.jar;C:\Users\wenchao.ren\AppData\Local\JetBrains\Toolbox\apps\IDEA-U\ch-0\182.3684.40\lib\rt\debugger-agent.jar
[20/08/18 11:43:22:022 CST] main  INFO zookeeper.ZooKeeper: Client environment:java.library.path=C:\Program Files\Java\jdk1.8.0_181\bin;C:\WINDOWS\Sun\Java\bin;C:\WINDOWS\system32;C:\WINDOWS;C:\Program Files (x86)\Common Files\Oracle\Java\javapath;C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0\;C:\Program Files (x86)\NVIDIA Corporation\PhysX\Common;C:\WINDOWS\system32;C:\WINDOWS;C:\WINDOWS\System32\Wbem;C:\WINDOWS\System32\WindowsPowerShell\v1.0\;C:\Program Files\Git\cmd;C:\Program Files\Microsoft VS Code\bin;C:\WINDOWS\System32\OpenSSH\;C:\Users\wenchao.ren\AppData\Local\Microsoft\WindowsApps;;.
[20/08/18 11:43:22:022 CST] main  INFO zookeeper.ZooKeeper: Client environment:java.io.tmpdir=C:\Users\wenchao.ren\AppData\Local\Temp\
[20/08/18 11:43:22:022 CST] main  INFO zookeeper.ZooKeeper: Client environment:java.compiler=<NA>
[20/08/18 11:43:22:022 CST] main  INFO zookeeper.ZooKeeper: Client environment:os.name=Windows 10
[20/08/18 11:43:22:022 CST] main  INFO zookeeper.ZooKeeper: Client environment:os.arch=amd64
[20/08/18 11:43:22:022 CST] main  INFO zookeeper.ZooKeeper: Client environment:os.version=10.0
[20/08/18 11:43:22:022 CST] main  INFO zookeeper.ZooKeeper: Client environment:user.name=wenchao.ren
[20/08/18 11:43:22:022 CST] main  INFO zookeeper.ZooKeeper: Client environment:user.home=C:\Users\wenchao.ren
[20/08/18 11:43:22:022 CST] main  INFO zookeeper.ZooKeeper: Client environment:user.dir=E:\workstations\dubbo\incubator-dubbo
[20/08/18 11:43:22:022 CST] main  INFO zookeeper.ZooKeeper: Initiating client connection, connectString=localhost:2181 sessionTimeout=60000 watcher=org.apache.curator.ConnectionState@3dd69f5a
[20/08/18 11:43:22:022 CST] main-SendThread(127.0.0.1:2181)  INFO zookeeper.ClientCnxn: Opening socket connection to server 127.0.0.1/127.0.0.1:2181. Will not attempt to authenticate using SASL (unknown error)
[20/08/18 11:43:22:022 CST] main-SendThread(127.0.0.1:2181)  INFO zookeeper.ClientCnxn: Socket connection established to 127.0.0.1/127.0.0.1:2181, initiating session
[20/08/18 11:43:22:022 CST] main  INFO zookeeper.ZookeeperRegistry:  [DUBBO] Register: dubbo://192.168.116.1:20880/org.apache.dubbo.demo.DemoService?anyhost=true&application=demo-provider&dubbo=2.0.2&generic=false&interface=org.apache.dubbo.demo.DemoService&methods=sayHello&pid=6872&side=provider&timestamp=1534779801013, dubbo version: , current host: 192.168.116.1
[20/08/18 11:43:22:022 CST] main-SendThread(127.0.0.1:2181)  INFO zookeeper.ClientCnxn: Session establishment complete on server 127.0.0.1/127.0.0.1:2181, sessionid = 0x100001d37250002, negotiated timeout = 40000
[20/08/18 11:43:22:022 CST] main-EventThread  INFO state.ConnectionStateManager: State change: CONNECTED
[20/08/18 11:43:22:022 CST] main  INFO zookeeper.ZookeeperRegistry:  [DUBBO] Subscribe: provider://192.168.116.1:20880/org.apache.dubbo.demo.DemoService?anyhost=true&application=demo-provider&category=configurators&check=false&dubbo=2.0.2&generic=false&interface=org.apache.dubbo.demo.DemoService&methods=sayHello&pid=6872&side=provider&timestamp=1534779801013, dubbo version: , current host: 192.168.116.1
[20/08/18 11:43:22:022 CST] main  INFO zookeeper.ZookeeperRegistry:  [DUBBO] Notify urls for subscribe url provider://192.168.116.1:20880/org.apache.dubbo.demo.DemoService?anyhost=true&application=demo-provider&category=configurators&check=false&dubbo=2.0.2&generic=false&interface=org.apache.dubbo.demo.DemoService&methods=sayHello&pid=6872&side=provider&timestamp=1534779801013, urls: [empty://192.168.116.1:20880/org.apache.dubbo.demo.DemoService?anyhost=true&application=demo-provider&category=configurators&check=false&dubbo=2.0.2&generic=false&interface=org.apache.dubbo.demo.DemoService&methods=sayHello&pid=6872&side=provider&timestamp=1534779801013], dubbo version: , current host: 192.168.116.1

```

同时我们查看zk的话会发现：

```
[zk: localhost:2181(CONNECTED) 1] ls /dubbo
[org.apache.dubbo.demo.DemoService]
[zk: localhost:2181(CONNECTED) 2] ls /dubbo/org.apache.dubbo.demo.DemoService
[configurators, providers]
[zk: localhost:2181(CONNECTED) 3]
[zk: localhost:2181(CONNECTED) 3] ls /dubbo/org.apache.dubbo.demo.DemoService/providers
[dubbo%3A%2F%2F192.168.116.1%3A20880%2Forg.apache.dubbo.demo.DemoService%3Fanyhost%3Dtrue%26application%3Ddemo-provider%26dubbo%3D2.0.2%26generic%3Dfalse%26interface%3Dorg.apache.dubbo.demo.DemoService%26methods%3DsayHello%26pid%3D6872%26side%3Dprovider%26timestamp%3D1534779801013]
[zk: localhost:2181(CONNECTED) 4]
[zk: localhost:2181(CONNECTED) 4] ls /dubbo/org.apache.dubbo.demo.DemoService/configurators
[]
```

当然此时我们仅仅启动了provider，并没有启动consumer


### 启动consumer

同样的修改`dubbo-demo-consumer`模块中的`dubbo-demo-consumer.xml`中的注册中心，使得consumer和provider连接同一个注册中心，
修改后的内容为：

```xml
<beans xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:dubbo="http://dubbo.apache.org/schema/dubbo"
       xmlns="http://www.springframework.org/schema/beans"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans-4.3.xsd
       http://dubbo.apache.org/schema/dubbo http://dubbo.apache.org/schema/dubbo/dubbo.xsd">

    <!-- consumer's application name, used for tracing dependency relationship (not a matching criterion),
    don't set it same as provider -->
    <dubbo:application name="demo-consumer"/>

    <!-- use multicast registry center to discover service -->
    <!--<dubbo:registry address="multicast://224.5.6.7:1234"/>-->
    <dubbo:registry protocol="zookeeper" address="localhost:2181"/>

    <!-- generate proxy for the remote service, then demoService can be used in the same way as the
    local regular interface -->
    <dubbo:reference id="demoService" check="false" interface="org.apache.dubbo.demo.DemoService"/>

</beans>
```

然后运行`Consumer`类，输出如下：

```java
Connected to the target VM, address: '127.0.0.1:8434', transport: 'socket'
[20/08/18 11:49:40:040 CST] main  INFO support.ClassPathXmlApplicationContext: Refreshing org.springframework.context.support.ClassPathXmlApplicationContext@551aa95a: startup date [Mon Aug 20 23:49:40 CST 2018]; root of context hierarchy
[20/08/18 11:49:40:040 CST] main  INFO xml.XmlBeanDefinitionReader: Loading XML bean definitions from class path resource [META-INF/spring/dubbo-demo-consumer.xml]
[20/08/18 11:49:40:040 CST] main  INFO logger.LoggerFactory: using logger: org.apache.dubbo.common.logger.log4j.Log4jLoggerAdapter
[20/08/18 11:49:41:041 CST] main  WARN extension.SpringExtensionFactory:  [DUBBO] No spring extension(bean) named:defaultCompiler, try to find an extension(bean) of type java.lang.String, dubbo version: , current host: 10.254.0.157
[20/08/18 11:49:41:041 CST] main  WARN extension.SpringExtensionFactory:  [DUBBO] No spring extension(bean) named:defaultCompiler, type:java.lang.String found, stop get bean., dubbo version: , current host: 10.254.0.157
[20/08/18 11:49:42:042 CST] main  INFO imps.CuratorFrameworkImpl: Starting
[20/08/18 11:49:42:042 CST] main  INFO zookeeper.ZooKeeper: Client environment:zookeeper.version=3.4.9-1757313, built on 08/23/2016 06:50 GMT
[20/08/18 11:49:42:042 CST] main  INFO zookeeper.ZooKeeper: Client environment:host.name=c
[20/08/18 11:49:42:042 CST] main  INFO zookeeper.ZooKeeper: Client environment:java.version=1.8.0_181
[20/08/18 11:49:42:042 CST] main  INFO zookeeper.ZooKeeper: Client environment:java.vendor=Oracle Corporation
[20/08/18 11:49:42:042 CST] main  INFO zookeeper.ZooKeeper: Client environment:java.home=C:\Program Files\Java\jdk1.8.0_181\jre
[20/08/18 11:49:42:042 CST] main  INFO zookeeper.ZooKeeper: Client environment:java.class.path=C:\Program Files\Java\jdk1.8.0_181\jre\lib\charsets.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\deploy.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\access-bridge-64.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\cldrdata.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\dnsns.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\jaccess.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\jfxrt.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\localedata.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\nashorn.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\sunec.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\sunjce_provider.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\sunmscapi.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\sunpkcs11.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\ext\zipfs.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\javaws.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\jce.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\jfr.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\jfxswt.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\jsse.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\management-agent.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\plugin.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\resources.jar;C:\Program Files\Java\jdk1.8.0_181\jre\lib\rt.jar;E:\workstations\dubbo\incubator-dubbo\dubbo-demo\dubbo-demo-consumer\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-demo\dubbo-demo-api\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-config\dubbo-config-spring\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-config\dubbo-config-api\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-monitor\dubbo-monitor-api\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-filter\dubbo-filter-validation\target\classes;C:\Users\wenchao.ren\.m2\repository\javax\validation\validation-api\1.1.0.Final\validation-api-1.1.0.Final.jar;E:\workstations\dubbo\incubator-dubbo\dubbo-filter\dubbo-filter-cache\target\classes;C:\Users\wenchao.ren\.m2\repository\javax\cache\cache-api\1.0.0\cache-api-1.0.0.jar;E:\workstations\dubbo\incubator-dubbo\dubbo-bootstrap\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-common\target\classes;C:\Users\wenchao.ren\.m2\repository\commons-logging\commons-logging\1.2\commons-logging-1.2.jar;C:\Users\wenchao.ren\.m2\repository\log4j\log4j\1.2.16\log4j-1.2.16.jar;C:\Users\wenchao.ren\.m2\repository\org\javassist\javassist\3.20.0-GA\javassist-3.20.0-GA.jar;C:\Users\wenchao.ren\.m2\repository\org\springframework\spring-beans\4.3.16.RELEASE\spring-beans-4.3.16.RELEASE.jar;C:\Users\wenchao.ren\.m2\repository\org\springframework\spring-core\4.3.16.RELEASE\spring-core-4.3.16.RELEASE.jar;C:\Users\wenchao.ren\.m2\repository\org\springframework\spring-web\4.3.16.RELEASE\spring-web-4.3.16.RELEASE.jar;C:\Users\wenchao.ren\.m2\repository\org\springframework\spring-aop\4.3.16.RELEASE\spring-aop-4.3.16.RELEASE.jar;C:\Users\wenchao.ren\.m2\repository\org\springframework\spring-context\4.3.16.RELEASE\spring-context-4.3.16.RELEASE.jar;C:\Users\wenchao.ren\.m2\repository\org\springframework\spring-expression\4.3.16.RELEASE\spring-expression-4.3.16.RELEASE.jar;E:\workstations\dubbo\incubator-dubbo\dubbo-rpc\dubbo-rpc-injvm\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-registry\dubbo-registry-zookeeper\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-registry\dubbo-registry-api\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-cluster\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-remoting\dubbo-remoting-zookeeper\target\classes;C:\Users\wenchao.ren\.m2\repository\org\apache\zookeeper\zookeeper\3.4.9\zookeeper-3.4.9.jar;C:\Users\wenchao.ren\.m2\repository\org\slf4j\slf4j-api\1.7.25\slf4j-api-1.7.25.jar;C:\Users\wenchao.ren\.m2\repository\org\slf4j\slf4j-log4j12\1.6.1\slf4j-log4j12-1.6.1.jar;C:\Users\wenchao.ren\.m2\repository\jline\jline\0.9.94\jline-0.9.94.jar;C:\Users\wenchao.ren\.m2\repository\io\netty\netty\3.10.5.Final\netty-3.10.5.Final.jar;C:\Users\wenchao.ren\.m2\repository\com\101tec\zkclient\0.2\zkclient-0.2.jar;C:\Users\wenchao.ren\.m2\repository\org\apache\curator\curator-framework\2.12.0\curator-framework-2.12.0.jar;C:\Users\wenchao.ren\.m2\repository\org\apache\curator\curator-client\2.12.0\curator-client-2.12.0.jar;C:\Users\wenchao.ren\.m2\repository\com\google\guava\guava\16.0.1\guava-16.0.1.jar;E:\workstations\dubbo\incubator-dubbo\dubbo-registry\dubbo-registry-multicast\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-rpc\dubbo-rpc-dubbo\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-rpc\dubbo-rpc-api\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-remoting\dubbo-remoting-api\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-container\dubbo-container-api\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-remoting\dubbo-remoting-netty4\target\classes;C:\Users\wenchao.ren\.m2\repository\io\netty\netty-all\4.1.25.Final\netty-all-4.1.25.Final.jar;E:\workstations\dubbo\incubator-dubbo\dubbo-serialization\dubbo-serialization-hessian2\target\classes;E:\workstations\dubbo\incubator-dubbo\dubbo-serialization\dubbo-serialization-api\target\classes;C:\Users\wenchao.ren\.m2\repository\com\alibaba\fastjson\1.2.46\fastjson-1.2.46.jar;C:\Users\wenchao.ren\.m2\repository\com\esotericsoftware\kryo\4.0.1\kryo-4.0.1.jar;C:\Users\wenchao.ren\.m2\repository\com\esotericsoftware\reflectasm\1.11.3\reflectasm-1.11.3.jar;C:\Users\wenchao.ren\.m2\repository\org\ow2\asm\asm\5.0.4\asm-5.0.4.jar;C:\Users\wenchao.ren\.m2\repository\com\esotericsoftware\minlog\1.3.0\minlog-1.3.0.jar;C:\Users\wenchao.ren\.m2\repository\de\javakaffee\kryo-serializers\0.42\kryo-serializers-0.42.jar;C:\Users\wenchao.ren\.m2\repository\de\ruedigermoeller\fst\2.48-jdk-6\fst-2.48-jdk-6.jar;C:\Users\wenchao.ren\.m2\repository\com\fasterxml\jackson\core\jackson-core\2.8.6\jackson-core-2.8.6.jar;C:\Users\wenchao.ren\.m2\repository\com\cedarsoftware\java-util\1.9.0\java-util-1.9.0.jar;C:\Users\wenchao.ren\.m2\repository\com\cedarsoftware\json-io\2.5.1\json-io-2.5.1.jar;C:\Users\wenchao.ren\.m2\repository\com\alibaba\hessian-lite\3.2.3\hessian-lite-3.2.3.jar;C:\Users\wenchao.ren\.m2\repository\org\objenesis\objenesis\2.6\objenesis-2.6.jar;C:\Users\wenchao.ren\AppData\Local\JetBrains\Toolbox\apps\IDEA-U\ch-0\182.3684.40\lib\idea_rt.jar;C:\Users\wenchao.ren\AppData\Local\JetBrains\Toolbox\apps\IDEA-U\ch-0\182.3684.40\lib\rt\debugger-agent.jar
[20/08/18 11:49:42:042 CST] main  INFO zookeeper.ZooKeeper: Client environment:java.library.path=C:\Program Files\Java\jdk1.8.0_181\bin;C:\WINDOWS\Sun\Java\bin;C:\WINDOWS\system32;C:\WINDOWS;C:\Program Files (x86)\Common Files\Oracle\Java\javapath;C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0\;C:\Program Files (x86)\NVIDIA Corporation\PhysX\Common;C:\WINDOWS\system32;C:\WINDOWS;C:\WINDOWS\System32\Wbem;C:\WINDOWS\System32\WindowsPowerShell\v1.0\;C:\Program Files\Git\cmd;C:\Program Files\Microsoft VS Code\bin;C:\WINDOWS\System32\OpenSSH\;C:\Users\wenchao.ren\AppData\Local\Microsoft\WindowsApps;;.
[20/08/18 11:49:42:042 CST] main  INFO zookeeper.ZooKeeper: Client environment:java.io.tmpdir=C:\Users\wenchao.ren\AppData\Local\Temp\
[20/08/18 11:49:42:042 CST] main  INFO zookeeper.ZooKeeper: Client environment:java.compiler=<NA>
[20/08/18 11:49:42:042 CST] main  INFO zookeeper.ZooKeeper: Client environment:os.name=Windows 10
[20/08/18 11:49:42:042 CST] main  INFO zookeeper.ZooKeeper: Client environment:os.arch=amd64
[20/08/18 11:49:42:042 CST] main  INFO zookeeper.ZooKeeper: Client environment:os.version=10.0
[20/08/18 11:49:42:042 CST] main  INFO zookeeper.ZooKeeper: Client environment:user.name=wenchao.ren
[20/08/18 11:49:42:042 CST] main  INFO zookeeper.ZooKeeper: Client environment:user.home=C:\Users\wenchao.ren
[20/08/18 11:49:42:042 CST] main  INFO zookeeper.ZooKeeper: Client environment:user.dir=E:\workstations\dubbo\incubator-dubbo
[20/08/18 11:49:42:042 CST] main  INFO zookeeper.ZooKeeper: Initiating client connection, connectString=localhost:2181 sessionTimeout=60000 watcher=org.apache.curator.ConnectionState@59b38691
[20/08/18 11:49:42:042 CST] main-SendThread(0:0:0:0:0:0:0:1:2181)  INFO zookeeper.ClientCnxn: Opening socket connection to server 0:0:0:0:0:0:0:1/0:0:0:0:0:0:0:1:2181. Will not attempt to authenticate using SASL (unknown error)
[20/08/18 11:49:42:042 CST] main-SendThread(0:0:0:0:0:0:0:1:2181)  INFO zookeeper.ClientCnxn: Socket connection established to 0:0:0:0:0:0:0:1/0:0:0:0:0:0:0:1:2181, initiating session
[20/08/18 11:49:42:042 CST] main-SendThread(0:0:0:0:0:0:0:1:2181)  INFO zookeeper.ClientCnxn: Session establishment complete on server 0:0:0:0:0:0:0:1/0:0:0:0:0:0:0:1:2181, sessionid = 0x100001d37250004, negotiated timeout = 40000
[20/08/18 11:49:42:042 CST] main-EventThread  INFO state.ConnectionStateManager: State change: CONNECTED
[20/08/18 11:49:42:042 CST] main  INFO zookeeper.ZookeeperRegistry:  [DUBBO] Register: consumer://10.254.0.157/org.apache.dubbo.demo.DemoService?application=demo-consumer&category=consumers&check=false&dubbo=2.0.2&interface=org.apache.dubbo.demo.DemoService&methods=sayHello&pid=2720&qos.port=33333&side=consumer&timestamp=1534780181816, dubbo version: , current host: 10.254.0.157
[20/08/18 11:49:42:042 CST] main  INFO zookeeper.ZookeeperRegistry:  [DUBBO] Subscribe: consumer://10.254.0.157/org.apache.dubbo.demo.DemoService?application=demo-consumer&category=providers,configurators,routers&check=false&dubbo=2.0.2&interface=org.apache.dubbo.demo.DemoService&methods=sayHello&pid=2720&qos.port=33333&side=consumer&timestamp=1534780181816, dubbo version: , current host: 10.254.0.157
[20/08/18 11:49:42:042 CST] main  INFO zookeeper.ZookeeperRegistry:  [DUBBO] Notify urls for subscribe url consumer://10.254.0.157/org.apache.dubbo.demo.DemoService?application=demo-consumer&category=providers,configurators,routers&check=false&dubbo=2.0.2&interface=org.apache.dubbo.demo.DemoService&methods=sayHello&pid=2720&qos.port=33333&side=consumer&timestamp=1534780181816, urls: [dubbo://192.168.116.1:20880/org.apache.dubbo.demo.DemoService?anyhost=true&application=demo-provider&dubbo=2.0.2&generic=false&interface=org.apache.dubbo.demo.DemoService&methods=sayHello&pid=6872&side=provider&timestamp=1534779801013, empty://10.254.0.157/org.apache.dubbo.demo.DemoService?application=demo-consumer&category=configurators&check=false&dubbo=2.0.2&interface=org.apache.dubbo.demo.DemoService&methods=sayHello&pid=2720&qos.port=33333&side=consumer&timestamp=1534780181816, empty://10.254.0.157/org.apache.dubbo.demo.DemoService?application=demo-consumer&category=routers&check=false&dubbo=2.0.2&interface=org.apache.dubbo.demo.DemoService&methods=sayHello&pid=2720&qos.port=33333&side=consumer&timestamp=1534780181816], dubbo version: , current host: 10.254.0.157
[20/08/18 11:49:43:043 CST] main  INFO transport.AbstractClient:  [DUBBO] Successed connect to server /192.168.116.1:20880 from NettyClient 10.254.0.157 using dubbo version , channel is NettyChannel [channel=[id: 0x5a2b2c61, L:/192.168.116.1:8464 - R:/192.168.116.1:20880]], dubbo version: , current host: 10.254.0.157
[20/08/18 11:49:43:043 CST] main  INFO transport.AbstractClient:  [DUBBO] Start NettyClient c/10.254.0.157 connect to the server /192.168.116.1:20880, dubbo version: , current host: 10.254.0.157
[20/08/18 11:49:43:043 CST] main  INFO config.AbstractConfig:  [DUBBO] Refer dubbo service org.apache.dubbo.demo.DemoService from url zookeeper://localhost:2181/org.apache.dubbo.registry.RegistryService?anyhost=true&application=demo-consumer&check=false&dubbo=2.0.2&generic=false&interface=org.apache.dubbo.demo.DemoService&methods=sayHello&pid=2720&qos.port=33333&register.ip=10.254.0.157&remote.timestamp=1534779801013&side=consumer&timestamp=1534780181816, dubbo version: , current host: 10.254.0.157
Hello world, response from provider: 192.168.116.1:20880
Hello world, response from provider: 192.168.116.1:20880
Hello world, response from provider: 192.168.116.1:20880
```

此时我们看zk节点：

```
[zk: localhost:2181(CONNECTED) 7] ls /dubbo/org.apache.dubbo.demo.DemoService
[consumers, configurators, routers, providers]
[zk: localhost:2181(CONNECTED) 8] ls /dubbo/org.apache.dubbo.demo.DemoService/consumers
[consumer%3A%2F%2F10.254.0.157%2Forg.apache.dubbo.demo.DemoService%3Fapplication%3Ddemo-consumer%26category%3Dconsumers%26check%3Dfalse%26dubbo%3D2.0.2%26interface%3Dorg.apache.dubbo.demo.DemoService%26methods%3DsayHello%26pid%3D2720%26qos.port%3D33333%26side%3Dconsumer%26timestamp%3D1534780181816]
[zk: localhost:2181(CONNECTED) 9] ls /dubbo/org.apache.dubbo.demo.DemoService/configurators
[]
[zk: localhost:2181(CONNECTED) 10] ls /dubbo/org.apache.dubbo.demo.DemoService/routers
[]
[zk: localhost:2181(CONNECTED) 11] ls /dubbo/org.apache.dubbo.demo.DemoService/providers
[dubbo%3A%2F%2F192.168.116.1%3A20880%2Forg.apache.dubbo.demo.DemoService%3Fanyhost%3Dtrue%26application%3Ddemo-provider%26dubbo%3D2.0.2%26generic%3Dfalse%26interface%3Dorg.apache.dubbo.demo.DemoService%26methods%3DsayHello%26pid%3D6872%26side%3Dprovider%26timestamp%3D1534779801013]
[zk: localhost:2181(CONNECTED) 12]
```

可以看到多了`consumer`和`routers`节点。

同时consumer端不断输出`Hello world, response from provider: 192.168.116.1:20880`的日志，说明我们的环境以及搭建完成了。

## 参考文章

- [Zookeeper 注册中心安装](http://dubbo.apache.org/zh-cn/docs/admin/install/zookeeper.html)
- [http://dubbo.apache.org/zh-cn/docs/admin/install/provider-demo.html](http://dubbo.apache.org/zh-cn/docs/admin/install/provider-demo.html)
