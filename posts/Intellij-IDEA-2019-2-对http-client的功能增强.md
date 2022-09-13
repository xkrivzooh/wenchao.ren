---
icon: page
author: xkrivzooh
date: 2019-07-26
sidebar: false
category:
  - post
tag:
  - idea
---

# Intellij IDEA 2019.2 对http client的功能增强

在Intellij IDEA 2019.2中对http client的功能进行了增强，主要有2个：

- HTTP client supports cURL requestsULTIMATE
- HTTP client keeps cookies

## HTTP client supports cURL requestsULTIMATE

Now you can paste a cURL request string into the HTTP client and have the IDE automatically convert it to a full request.

![https://www.jetbrains.com/idea/whatsnew/2019-2/img/RESTClient.gif](https://www.jetbrains.com/idea/whatsnew/2019-2/img/RESTClient.gif)

## HTTP client keeps cookies
Suppose you’ve made one request to authenticate on the service, and in subsequent requests you would like to call some endpoints that require additional permissions. Previously, you would lose the cookies from the first response. But not anymore: the IDE now keeps all the cookies for you and transfers them in the next requests.

![https://www.jetbrains.com/idea/whatsnew/2019-2/img/HTTPCookies.gif](https://www.jetbrains.com/idea/whatsnew/2019-2/img/HTTPCookies.gif)

以及早期的对http client 中host的支持。

比如`http-client.env.json`文件内容为：

```json
{
  "local": {
    "host": "http://localhost:8080"
  },
  "dev":{
    "host" : "http://xxx.xxx.xxx.250:10000"
  }
}
```
你可以在`.http`文件中这么使用：

```shell
POST {{host}}/xxxxxx/v1
Content-Type: application/json
x

{
    "a" : 1
}
```

## 参考资料

- [2019.2的更新内容](https://www.jetbrains.com/idea/whatsnew/)
