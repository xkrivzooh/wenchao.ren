---
icon: page
author: xkrivzooh
date: 2019-07-08
sidebar: false
category:
  - post
tag:
  - java
---

# 使用阿里云maven镜像加速

maven是一个好东西，但是默认情况下，maven使用的是中央仓央是：`http://repo1.maven.org/maven2`和`http://uk.maven.org/maven2`。这两个镜像在国内
访问其实是比较慢的，因此我们需要尽可能使用国内同步好的镜像。

我在国内选择的是阿里云的镜像：[公共代理库](https://help.aliyun.com/document_detail/102512.html?spm=a2c40.aliyun_maven_repo.0.0.36183054vJNru5)

maven的配置为：打开maven的配置文件(windows机器一般在maven安装目录的`conf/settings.xml`)，在`<mirrors></mirrors>`标签中添加mirror子节点:

```xml
<mirror>
    <id>aliyunmaven</id>
    <mirrorOf>*</mirrorOf>
    <name>阿里云公共仓库</name>
    <url>https://maven.aliyun.com/repository/public</url>
</mirror>
```

其他的如gradle的配置指南请参见[公共代理库](https://help.aliyun.com/document_detail/102512.html?spm=a2c40.aliyun_maven_repo.0.0.36183054vJNru5)中描述的那样操作就好了。

但是一般情况下在公司开发的时候，公司也会有自己的maven镜像仓库，这个时候搞多个mirror就好了。

## 参考资料：

- [Maven镜像地址大全](https://blog.csdn.net/Hello_World_QWP/article/details/82459915)
