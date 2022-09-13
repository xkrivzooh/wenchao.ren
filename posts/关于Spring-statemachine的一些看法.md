---
icon: page
author: xkrivzooh
date: 2021-05-11
sidebar: false
category:
  - post
tag:
  - spring
  - java
  - 系统设计
---

# "关于Spring-statemachine的一些看法"

> 我们需要有状态的状态机么？

昨天和今天再一次翻看了一下[Spring-Statemachine](https://projects.spring.io/spring-statemachine/)项目的最新进展, 上一次看这个项目的文档还是几年前。
之所以之前关注这个项目主要有2个原因吧，第一个就是spring的project一般比较有质量保证，第二个是状态机本身是一个用途非常广泛的架构设计。所以这个项目一直让我
惦记着。

然后昨天翻看完了一下Spring-Statemachine的文档，同时今天写了一个demo完整的模拟了一下在交易系统平台的业务背景下使用它来实现状态机。然后给我的感触就是这玩意真的不接地气。主要有下面几个原因:

- Spring-Statemachine仅仅支持「有状态的状态机」，而不支持「无状态的状态机」。
    - 这一点是我放弃将Spring-Statemachine引入我们现有的一个工程来重构代码的最主要原因。表面上来看，状态机理所当然是应该维持状态的。但是深入想一下，这种状态性并不是必须的，因为有状态，状态机的实例就不是线程安全的，而我们的应用服务器是分布式多线程的，所以在每一次状态机在接受请求的时候，都不得不重新 build 一个新的状态机实例。这种`new instance per request `的做法，倘若状态机的构建很复杂，QPS 又很高的话，肯定会遇到性能问题。所以使得我产生了一个疑问，我们真的需要有状态的状态机么？
- Spring-Statemachine本身支持的功能很多，但是这些工程我们基本不会用到。
    - 支持的功能多，很多时候并不是一个优势。因为功能越多，使得框架本身的复杂度，学习成本也会上升。同时如果这些功能我们在未来可能会用到也还好，问题是用不到，比如它支持的`UML Eclipse Papyrus modeling`， `Distributed state machine based on a Zookeeper`等。感觉这类开源项目为了功能完备而把UML State Machine 上罗列的功能点都实现了。但是问题是很多都用不到。尤其是在互联网业务下，绝大多数时候状态的并行（parallel，fork，join）、子状态机都用不到，或者一般也会采样其他的方式来实现。
- Spring-Statemachine的API逐渐往reactive方向靠拢，之前的传统API都开始标记过期，使得组内同学的学习成本会进一步提升。


基于这3个原因，我最终放弃了对Spring-Statemachine的关注。我们自己实现了一个功能简单但是完备的状态机。

## 参考

- [给 DSL 开个脑洞：无状态的状态机](https://www.infoq.cn/article/fhyjf3jhluwbqpbyg6oi)
- [高德打车通用可编排订单状态机引擎设计](https://mp.weixin.qq.com/s/0GfCOUEw4svvSQVoShjJDw)
- [基于有限状态机与消息队列的三方支付系统补单实践](https://mp.weixin.qq.com/s/9Z-N3cfWu7oMVJsTDkbb-Q)
- [状态机在马蜂窝机票订单交易系统中的应用与优化实践](https://www.cnblogs.com/mfwtech/p/10694199.html)
