---
title: >-
  RuntimeException in Action for tag [rollingPolicy]
  java.lang.IndexOutOfBoundsException: No group 1
toc: true
date: 2019-01-29 11:09:20
tags: ['java']
draft: false
---

今天一个同事咨询我，他们使用logback发布的时候出现下面的异常：

```java
20:46:27,244 |-ERROR in ch.qos.logback.core.joran.spi.Interpreter@36:25 - RuntimeException in Action for tag [rollingPolicy] java.lang.IndexOutOfBoundsException: No group 1
	at java.lang.IndexOutOfBoundsException: No group 1
	at 	at java.util.regex.Matcher.group(Matcher.java:538)
	at 	at ch.qos.logback.core.rolling.helper.FileFilterUtil.extractCounter(FileFilterUtil.java:109)
	at 	at ch.qos.logback.core.rolling.helper.FileFilterUtil.findHighestCounter(FileFilterUtil.java:93)
	at 	at ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP.computeCurrentPeriodsHighestCounterValue(SizeAndTimeBasedFNATP.java:65)
	at 	at ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP.start(SizeAndTimeBasedFNATP.java:49)
	at 	at ch.qos.logback.core.rolling.TimeBasedRollingPolicy.start(TimeBasedRollingPolicy.java:90)
	at 	at ch.qos.logback.core.joran.action.NestedComplexPropertyIA.end(NestedComplexPropertyIA.java:167)
	at 	at ch.qos.logback.core.joran.spi.Interpreter.callEndAction(Interpreter.java:317)
	at 	at ch.qos.logback.core.joran.spi.Interpreter.endElement(Interpreter.java:196)
	at 	at ch.qos.logback.core.joran.spi.Interpreter.endElement(Interpreter.java:182)
	at 	at ch.qos.logback.core.joran.spi.EventPlayer.play(EventPlayer.java:62)
	at 	at ch.qos.logback.core.joran.GenericConfigurator.doConfigure(GenericConfigurator.java:149)
	at 	at ch.qos.logback.core.joran.GenericConfigurator.doConfigure(GenericConfigurator.java:135)
	at 	at ch.qos.logback.core.joran.GenericConfigurator.doConfigure(GenericConfigurator.java:99)
	at 	at ch.qos.logback.core.joran.GenericConfigurator.doConfigure(GenericConfigurator.java:49)
	at 	at ch.qos.logback.classic.util.ContextInitializer.configureByResource(ContextInitializer.java:75)
	at 	at ch.qos.logback.classic.util.ContextInitializer.autoConfig(ContextInitializer.java:148)
	at 	at org.slf4j.impl.StaticLoggerBinder.init(StaticLoggerBinder.java:85)
	at 	at org.slf4j.impl.StaticLoggerBinder.<clinit>(StaticLoggerBinder.java:55)
	at 	at org.slf4j.LoggerFactory.bind(LoggerFactory.java:128)
	at 	at org.slf4j.LoggerFactory.performInitialization(LoggerFactory.java:107)
	at 	at org.slf4j.LoggerFactory.getILoggerFactory(LoggerFactory.java:295)
	at 	at org.slf4j.LoggerFactory.getLogger(LoggerFactory.java:269)
	at 	at org.slf4j.LoggerFactory.getLogger(LoggerFactory.java:281)
```

我当时看一下异常堆栈，基本可以确定是`logback.xml`配置的不正确导致的，贴一下关键的`logback.xml`的配置

```xml
<appender name="accessAppender" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_HOME}/request.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_HOME}/request.log.%d{yyyy-MM-dd}.gz</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>200MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
        </rollingPolicy>
        <encoder>
            <pattern>[%d{yyyy-MM-dd HH:mm:ss.SSS}]WTraceId[%X{wtraceid}] %5p %logger{0}:%L] %msg%n</pattern>
        </encoder>
    </appender>
```

排查后发现其中的问题所在了，因为使用了`maxFileSize`来指定文件轮转大小了，所以需要增加一个counter，也就是增加`%i`在`fileNamePattern`中。
修改之后正确的配置为：

```xml
<appender name="accessAppender" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_HOME}/request.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <fileNamePattern>${LOG_HOME}/request.log.%d{yyyy-MM-dd}.%i.gz</fileNamePattern>
            <timeBasedFileNamingAndTriggeringPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedFNATP">
                <maxFileSize>200MB</maxFileSize>
            </timeBasedFileNamingAndTriggeringPolicy>
        </rollingPolicy>
        <encoder>
            <pattern>[%d{yyyy-MM-dd HH:mm:ss.SSS}]WTraceId[%X{wtraceid}] %5p %logger{0}:%L] %msg%n</pattern>
        </encoder>
    </appender>
```
