---
icon: book
author: xkrivzooh
date: 2019-08-08
category:
  - 专题
  - dubbo
tag:
  - dubbo
---

# dubbo xml解析

在之前的文章[《如何在spring中自定义xml标签并解析》](https://wenchao.ren/2019/08/%E5%A6%82%E4%BD%95%E5%9C%A8spring%E4%B8%AD%E8%87%AA%E5%AE%9A%E4%B9%89xml%E6%A0%87%E7%AD%BE%E5%B9%B6%E8%A7%A3%E6%9E%90/)中我用实际的例子展示了，如何在spring中自定义xml标签，同时如何解析这个xml标签。

本篇文章主要来看看dubbo中对应的源代码

![dubbo xml解析相关的类](http://wenchao.ren/img/2020/11/20190808004821.png)

如上图所示，这些类就是dubbo解析xml的相关实现的核心类，核心原理已经在之前的文章中详细描述了，如果大家在阅读dubbo代码，想看某个element的解析类的话，可以在`DubboNamespaceHandler`中来找：

```java
public class DubboNamespaceHandler extends NamespaceHandlerSupport {

    static {
        Version.checkDuplicate(DubboNamespaceHandler.class);
    }

    @Override
    public void init() {
        registerBeanDefinitionParser("application", new DubboBeanDefinitionParser(ApplicationConfig.class, true));
        registerBeanDefinitionParser("module", new DubboBeanDefinitionParser(ModuleConfig.class, true));
        registerBeanDefinitionParser("registry", new DubboBeanDefinitionParser(RegistryConfig.class, true));
        registerBeanDefinitionParser("config-center", new DubboBeanDefinitionParser(ConfigCenterBean.class, true));
        registerBeanDefinitionParser("metadata-report", new DubboBeanDefinitionParser(MetadataReportConfig.class, true));
        registerBeanDefinitionParser("monitor", new DubboBeanDefinitionParser(MonitorConfig.class, true));
        registerBeanDefinitionParser("metrics", new DubboBeanDefinitionParser(MetricsConfig.class, true));
        registerBeanDefinitionParser("provider", new DubboBeanDefinitionParser(ProviderConfig.class, true));
        registerBeanDefinitionParser("consumer", new DubboBeanDefinitionParser(ConsumerConfig.class, true));
        registerBeanDefinitionParser("protocol", new DubboBeanDefinitionParser(ProtocolConfig.class, true));
        registerBeanDefinitionParser("service", new DubboBeanDefinitionParser(ServiceBean.class, true));
        registerBeanDefinitionParser("reference", new DubboBeanDefinitionParser(ReferenceBean.class, false));
        registerBeanDefinitionParser("annotation", new AnnotationBeanDefinitionParser());
    }

}
```

基本上就是一个xml element对应一个BeanDefinitionParser

## 推荐阅读

- [《如何在spring中自定义xml标签并解析》](https://wenchao.ren/2019/08/%E5%A6%82%E4%BD%95%E5%9C%A8spring%E4%B8%AD%E8%87%AA%E5%AE%9A%E4%B9%89xml%E6%A0%87%E7%AD%BE%E5%B9%B6%E8%A7%A3%E6%9E%90/)
