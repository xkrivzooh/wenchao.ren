---
title: Spring RestTemplate parse gzip response
toc: true
date: 2018-12-04 13:45:26
tags: ['java']
draft: false
---

假设http://10.89.xx.xx:8080/_/metrics接口返回的数据格式是gzip格式
他的Response Headers信息如下

```bash
HTTP/1.1 200 OK
Server: Apache-Coyote/1.1
Content-Encoding: gzip
Content-Type: text/plain;charset=UTF-8
Transfer-Encoding: chunked
Date: Thu, 28 Dec 2017 08:13:53 GMT
```

如果我们使用Spring RestTemplate想直接拿到String形式的返回，而不是byte[]格式，那么可以使用如下的方式：

```java
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;
import org.apache.http.impl.client.HttpClientBuilder;
public static void main(String[] args) {
        HttpComponentsClientHttpRequestFactory clientHttpRequestFactory = new HttpComponentsClientHttpRequestFactory(
                HttpClientBuilder.create().build());
        RestTemplate restTemplate = new RestTemplate(clientHttpRequestFactory);
        ResponseEntity<String> responseEntity = restTemplate.getForEntity("http://10.89.xx.xxx:8080/_/metrics", String.class);
        HttpStatus statusCode = responseEntity.getStatusCode();
        System.out.println(responseEntity.getBody());
    }

```


