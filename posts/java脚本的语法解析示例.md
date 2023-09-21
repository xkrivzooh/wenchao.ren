---
icon: page
author: xkrivzooh
date: 2020-11-05
category:
  - post
tag:
  - av
---

# "Java脚本的语法解析示例"

早期搞了一个解析Java脚本的功能，其中有一处是需要解析Java语法，下面的代码贴了一下主要功能, 主要用到了`tools`中的一些类，但是代码使用`tools.jar`需要在maven中做一些额外配置：
```xml
<dependency>
	<groupId>com.sun</groupId>
	<artifactId>tools</artifactId>
	<version>1.8</version>
	<scope>system</scope>
	<systemPath>${JAVA_HOME}/lib/tools.jar</systemPath>
</dependency>
```
上面的maven配置就是为了能够在代码中使用tools.jar中的类。

```java
import com.google.common.base.Charsets;
import com.google.common.base.Joiner;
import com.google.common.base.Preconditions;
import com.google.common.base.Strings;
import com.google.common.collect.Maps;
import com.sun.tools.javac.file.JavacFileManager;
import com.sun.tools.javac.parser.JavacParser;
import com.sun.tools.javac.parser.ParserFactory;
import com.sun.tools.javac.tree.JCTree;
import com.sun.tools.javac.util.Context;
import com.sun.tools.javac.util.Name;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.util.CollectionUtils;

import javax.tools.JavaFileManager;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

public class JavaSourceCodeParser {

	private static final Logger logger = LoggerFactory.getLogger(JavaSourceCodeParser.class);

	private static final Joiner JOINER = Joiner.on("\n").skipNulls();

	public static String parseFullyQualifiedClassName(String fileName, String scriptSourceCode) {
		Preconditions.checkArgument(!Strings.isNullOrEmpty(scriptSourceCode));

		JCTree.JCCompilationUnit jcCompilationUnit;
		try {
			Context context = new Context();
			JavacFileManager javacFileManager = new JavacFileManager(context, false, Charsets.UTF_8);
			context.put(JavaFileManager.class, javacFileManager);
			JavacParser javacParser = ParserFactory.instance(context).newParser(scriptSourceCode, false, true, false);
			jcCompilationUnit = javacParser.parseCompilationUnit();
		}
		catch (Exception e) {
			throw new RuntimeException("脚本语法解析失败，请检查脚本内容是否正确");
		}

		String packageName = parsePackageName(jcCompilationUnit);
		String className = parseClassName(fileName, jcCompilationUnit);
		return Strings.isNullOrEmpty(packageName) ? className : packageName + "." + className;
	}

	private static String parsePackageName(JCTree.JCCompilationUnit jcCompilationUnit) {
		JCTree.JCExpression packageName = jcCompilationUnit.getPackageName();
		if (packageName == null) {
			return "";
		}
		return packageName.toString();
	}

	private static String parseClassName(String fileName, JCTree.JCCompilationUnit jcCompilationUnit) {
		com.sun.tools.javac.util.List<JCTree> typeDecls = jcCompilationUnit.getTypeDecls();
		if (!CollectionUtils.isEmpty(typeDecls)) {
			//如果脚本中只有一个class，就使用这个class
			if (typeDecls.size() == 1) {
				for (JCTree typeDecl : typeDecls) {
					if (typeDecl instanceof JCTree.JCClassDecl) {
						JCTree.JCClassDecl classDecl = (JCTree.JCClassDecl) typeDecl;
						Name simpleName = classDecl.getSimpleName();
						return simpleName.toString();
					}
				}
			}
			else {
				Map<String, JCTree.JCClassDecl> jcClassDeclMap = Maps.newHashMap();
				for (JCTree typeDecl : typeDecls) {
					if (typeDecl instanceof JCTree.JCClassDecl) {
						JCTree.JCClassDecl jcClassDecl = (JCTree.JCClassDecl) typeDecl;
						jcClassDeclMap.put(jcClassDecl.getSimpleName().toString(), jcClassDecl);
					}
				}

				//如果脚本中有多个同级的class定义，则先看谁有public
				for (Map.Entry<String, JCTree.JCClassDecl> entry : jcClassDeclMap.entrySet()) {
					//public/public abstract 。。。
					String modifiers = entry.getValue().getModifiers().toString();
					if (modifiers.contains("public")) {
						return entry.getKey();
					}
				}

				//如果都没有public的话，就使用文件名来判断, 之所以不一开始就使用文件名判断是为了降低文件名权重，避免写错
				JCTree.JCClassDecl jcClassDecl = jcClassDeclMap.get(tryRemoveJavaSuffix(fileName));
				if (jcClassDecl != null) {
					return jcClassDecl.getSimpleName().toString();
				}
				throw new RuntimeException("脚本中定义了多个class，而且都没有public修饰符，同时基于脚本文件名称也无法精确确定主类，建议修改一下脚本内容，便于系统识别！");
			}
		}

		throw new RuntimeException("从脚本内容中不能正确的解析出className，请检查脚本内容的正确性");
	}

	public static String readSourceCode(Path sourceCodeFilePath) {
		Preconditions.checkNotNull(sourceCodeFilePath);
		try {
			List<String> allLines = Files.readAllLines(sourceCodeFilePath);
			return JOINER.join(allLines);
		}
		catch (Exception e) {
			String error = String.format("readSourceCode error, sourceCodeFilePath:[%s]", sourceCodeFilePath);
			logger.error(error);
			throw new RuntimeException(error);
		}
	}

	private static String tryRemoveJavaSuffix(String fileName) {
		fileName = Strings.nullToEmpty(fileName).trim();
		if (fileName.endsWith(".java")) {
			try {
				return fileName.substring(0, fileName.length() - 5);
			}
			catch (Exception e) {
				return fileName;
			}
		}
		return fileName;
	}
}
```

<!-- @include: ../scaffolds/post_footer.md -->
