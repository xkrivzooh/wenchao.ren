---
title: 构造函数中使用Spring  @Value注解
toc: true
date: 2019-07-23 20:39:04
tags: ['java', 'spring']
draft: false
---

如果想在构造函数中使用的`@value`注解的话，demo如下：

```java
// File: sample/Message.groovy
package sample

import org.springframework.beans.factory.annotation.*
import org.springframework.stereotype.*

@Component
class Message {

    final String text

    // Use @Autowired to get @Value to work.
    @Autowired
    Message(
        // Refer to configuration property
        // app.message.text to set value for 
        // constructor argument message.
        @Value('${app.message.text}') final String text) {
        this.text = text
    }

}
```
