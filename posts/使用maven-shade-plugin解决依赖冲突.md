---
icon: page
sidebar: false
author: xkrivzooh
date: 2019-08-01
category:
  - post
tag:
  - java
---

# 使用maven-shade-plugin解决依赖冲突

一般遇到一些比较复杂恶心的依赖冲突，传统的通过`dependencyManagement`和`exclusion`有时候是解不了的。这种问题最常见的是netty相关的。
这种情况下我们可以使用`maven-shade-plugin`插件。

比如我这边的一个case是我们依赖的`redisson`需要4.1.36.Final的netty，而我们公司其他的组件必须依赖4.0.46.Final的netty，而这2个版本的netty
是不兼容的，因此我当时就使用了`maven-shade-plugin`插件来解决这个问题。

因为我们公司内部的netty都是4.0.46.Final，因此我专门搞了一个`redisson-shade`的maven module，这个module只有pom.xml文件，在这个module中我们依赖
`redisson`，然后将redisson内部依赖的netty的package路径进行修改, 然后其他的module通过依赖`redisson-shade`的maven module就好了。

pom.xml文件内容为:

```xml
<dependencies>
		<dependency>
			<groupId>org.redisson</groupId>
			<artifactId>redisson</artifactId>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.apache.maven.plugins</groupId>
				<artifactId>maven-shade-plugin</artifactId>
				<version>3.2.1</version>
				<executions>
					<execution>
						<phase>package</phase>
						<goals>
							<goal>shade</goal>
						</goals>
						<configuration>
							<relocations>
								<relocation>
									<pattern>io.netty</pattern>
									<shadedPattern>com.xxx.io.netty.redisson</shadedPattern>
								</relocation>
							</relocations>
						</configuration>
					</execution>
				</executions>
			</plugin>
		</plugins>
		<finalName>redisson-shade</finalName>
	</build>
```
在上面的pom中，在package阶段，会把redisson依赖的netty的package路径从`io.netty`修改为`com.xxx.io.netty.redisson`。这样就解决了依赖冲突问题。

不过我是在同一个工程中搞多个maven module来弄的，因此本地测试时候，一般都需要专门搞一个测试工程，这个算是一个麻烦点。


<!-- @include: ../scaffolds/post_footer.md -->
