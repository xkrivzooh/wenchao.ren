---
title: 如何在spring中自定义xml标签并解析
toc: true
date: 2019-08-08 00:29:14
tags: ['java', 'spring']
draft: false
---

如果大家使用过dubbo那么大概率看见过`<dubbo:application ...>`类似的配置。这其实就是一种xml标签的自定义，当然dubbo的实现中也会有自己的解析。

这篇文章主要就说一下xml标签的自定义和解析。本篇文章中的代码仓库地址为：[https://github.com/xkrivzooh/spring-define-and-parse-example](https://github.com/xkrivzooh/spring-define-and-parse-example)


大家按照上面的demo例子跑一下就会明白完整流程。其中有一些注意点我列了一下：

- .xsd文件中的`targetNamespace`定义了以后，后续其他的比如`xmlns`的值，`spring.handlers`以及`spring.schemas`中的值需要对应上
- `xsd:element`定义的就是将来会在xml文件中用到的元素，例如`<dubbo:application>`中的`application`
- `xsd:attribute`定义的就是模型类中的属性，例如`<dubbo:application name="xxx">`中的name，并且可以指定属性类型，进而起到检测的作用（当我们定义的是int，如果在xml中的值是非int型的，直接会报错）。
- 通常为每一个xsd:element都要注册一个BeanDefinitionParser。
- `person-demo.xml`中的`<AnyStringYouWant:person name="name1" age="1"/>`中的`AnyStringYouWant`你可以随意替换

