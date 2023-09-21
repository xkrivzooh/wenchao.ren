---
icon: page
author: xkrivzooh
sidebar: false
date: 2020-04-04
category:
  - post
tag:
  - java
---

# Unexpected end of ZLIB input stream

前几天在项目开发是遇到了这个`Unexpected end of ZLIB input stream`异常。异常出现的位置：

```java
Caused by: java.io.EOFException: Unexpected end of ZLIB input stream
	at java.util.zip.InflaterInputStream.fill(InflaterInputStream.java:240)
	at java.util.zip.InflaterInputStream.read(InflaterInputStream.java:158)
	at java.util.zip.GZIPInputStream.read(GZIPInputStream.java:117)
	at java.util.zip.InflaterInputStream.read(InflaterInputStream.java:122)
```

之前一开始没太想清楚，以为是我写的GzipFilter出现了问题，后来吃了个午饭才恍然大悟，是client端的数据传输有点问题。简单抽象一下场景就是client通过http接口给server上报
一些数据，这些数据使用了gzip来进行压缩。问题出现在这个gzip压缩这快。我看来看看早期的有问题的代码：

```java
private byte[] buildRequestBody(List<LoggerEntity> loggerEntities) {
		try {
			try (ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
				 GZIPOutputStream gzipOutputStream = new GZIPOutputStream(byteArrayOutputStream)) {
				gzipOutputStream.write(JSON.writeValueAsBytes(loggerEntities));
				return byteArrayOutputStream.toByteArray();
			}
		}
		catch (IOException e) {
			throw new RuntimeException(e);
		}
	}
```

先说一下上面的代码是有问题的，问题在于try-with-resource里面的try中的2行代码，因为很可能`gzipOutputStream`没写完然后就已经return了。因此此处有两种处理办法，

第一种就是在try里面对gzipOutputStream进行close:

```java
	private byte[] buildRequestBody(List<LoggerEntity> loggerEntities) {
		try {
			
			try (ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
				 GZIPOutputStream gzipOutputStream = new GZIPOutputStream(byteArrayOutputStream)) {
				gzipOutputStream.write(JSON.writeValueAsBytes(loggerEntities));
				gzipOutputStream.finish();
				gzipOutputStream.close();
				return byteArrayOutputStream.toByteArray();
			}
		}
		catch (IOException e) {
			throw new RuntimeException(e);
		}
	}
```


第二种就是将return语句拿到外层。

```java
	private byte[] buildRequestBody(List<LoggerEntity> loggerEntities) {
		try {
			ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
			try (GZIPOutputStream gzipOutputStream = new GZIPOutputStream(byteArrayOutputStream)) {
				gzipOutputStream.write(JSON.writeValueAsBytes(loggerEntities));
			}
			return byteArrayOutputStream.toByteArray();
		}
		catch (IOException e) {
			throw new RuntimeException(e);
		}
	}
```


<!-- @include: ../scaffolds/post_footer.md -->
