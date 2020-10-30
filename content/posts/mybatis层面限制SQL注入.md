---
title: mybatis层面限制SQL注入
toc: true
date: 2020-01-03 18:33:23
tags: ['java']
draft: false
---

最近根据公司的要求需要限制一波SQL注入的问题，因为公司有自己的数据库访问层组件，使用的数据库连接池为druid。
其实在druid的`com.alibaba.druid.wall.WallFilter`中提供了对sql依赖注入的检查，但是最终有下面几个原因我们没有
在druid层面来解决这个问题：

- 我们依赖的druid版本1.0.8太低了，查看了一下druid后面不少版本的改进，对sql解析这块有大量的优化，因此贸然升级一个版本风险有点高
- 我们想修改一下`WallConfig`的配置，但是在1.0.8版本的druid中不太好获取`WallConfig`这个类的实例，高版本的druid优化了这个问题。而且在druid中`MySqlWallProvider`类是在`com.alibaba.druid.wall.spi`package下面定义的，但是在`WallFilter#init()`方法中缺并没有使用spi等方式来拿这个类。
- 我们想最小化改动，尽量减少测试成本

在上面3个原因的考虑下，我们放弃了这种方案，转而将目光放在了公司统一使用的Mybatis上。

在Mybatis的`org.apache.ibatis.scripting.xmltags.TextSqlNode`中有一个字段为`injectionFilter`。

```java
public class TextSqlNode implements SqlNode {
  private String text;
  private Pattern injectionFilter;

    //...其他代码省略
    private static class BindingTokenParser implements TokenHandler {

    private DynamicContext context;
    private Pattern injectionFilter;

    public BindingTokenParser(DynamicContext context, Pattern injectionFilter) {
      this.context = context;
      this.injectionFilter = injectionFilter;
    }

    @Override
    public String handleToken(String content) {
      Object parameter = context.getBindings().get("_parameter");
      if (parameter == null) {
        context.getBindings().put("value", null);
      } else if (SimpleTypeRegistry.isSimpleType(parameter.getClass())) {
        context.getBindings().put("value", parameter);
      }
      Object value = OgnlCache.getValue(content, context.getBindings());
      String srtValue = (value == null ? "" : String.valueOf(value)); // issue #274 return "" instead of "null"
      checkInjection(srtValue);
      return srtValue;
    }

    private void checkInjection(String value) {
      if (injectionFilter != null && !injectionFilter.matcher(value).matches()) {
        throw new ScriptingException("Invalid input. Please conform to regex" + injectionFilter.pattern());
      }
    }
  }
}
```

可以看到在`handleToken`方法中处理完`$`标签以后，会调用`checkInjection`来检查替换的内容，在这块只要我们正确的设置`injectionFilter`属性那么也可以达到限制
`$`可以替换的内容的目的。默认情况下`injectionFilter`的属性一直是null。

目前mybatis其实并没有地方可以直接设置这个属性，为了设置这个属性，其实我们也额外做了不少的事情：

- 我们自己写了一个`XxxXMLLanguageDriver`，这个类继承了`org.apache.ibatis.scripting.xmltags.XMLLanguageDriver`, 然后覆盖了其中的`createSqlSource`和`createSqlSource`
方法。
- 我们重写了一个`XxxXMLScriptBuilder`, 用来替换`org.apache.ibatis.scripting.xmltags.XMLScriptBuilder`。
- 通过Spring的`BeanPostProcessor`，然后在`postProcessAfterInitialization`回调中，针对所有的`SqlSessionFactory`实例，拿到它的`Configuration`属性，并调用`configuration.setDefaultScriptingLanguage(XxxXMLLanguageDriver.class)`，使得我们自己的`XxxXMLLanguageDriver`生效。

贴一下`XxxXMLLanguageDriver`核心代码吧：

```java
public class XxxXMLLanguageDriver extends XMLLanguageDriver {

	static volatile Pattern injectionFilter;

	private static final Pattern DEFAULT_INJECTION_FILTER = Pattern.compile(DEFAULT_SQL_INJECTIONFILTER_REGEX);

	private static final Logger logger = LoggerFactory.getLogger(XxxXMLLanguageDriver.class);

	static {
		//...此处代码省略，此处做的事情就是通过公司的配置中心动态的设置injectionFilter
	}

	/**
	 * 此处相比于{@link XMLLanguageDriver#createSqlSource(Configuration, XNode, Class)}仅仅修改了使用的
	 * {@link XMLScriptBuilder}, 改为使用自己的{@link XxxXMLScriptBuilder}
	 */
	@Override
	public SqlSource createSqlSource(Configuration configuration, XNode script, Class<?> parameterType) {
		XxxXMLScriptBuilder builder = new XxxXMLScriptBuilder(configuration, script, parameterType);
		return builder.parseScriptNode();
	}

	/**
	 * 此处相比于{@link XMLLanguageDriver#createSqlSource(Configuration, String, Class)},
	 * 仅仅修改了{@link TextSqlNode}的创建
	 */
	@Override
	public SqlSource createSqlSource(Configuration configuration, String script, Class<?> parameterType) {
		// issue #3
		if (script.startsWith("<script>")) {
			XPathParser parser = new XPathParser(script, false, configuration.getVariables(), new XMLMapperEntityResolver());
			return createSqlSource(configuration, parser.evalNode("/script"), parameterType);
		}
		else {
			// issue #127
			script = PropertyParser.parse(script, configuration.getVariables());
			TextSqlNode textSqlNode = new TextSqlNode(script, injectionFilter);
			if (textSqlNode.isDynamic()) {
				return new DynamicSqlSource(configuration, textSqlNode);
			}
			else {
				return new RawSqlSource(configuration, script, parameterType);
			}
		}
	}

	private static Pattern compile(String regex) {
		try {
			return Pattern.compile(regex);
		}
		catch (PatternSyntaxException e) {
			logger.error("XxxXMLLanguageDriver compile injection filter regex [{}] error", regex, e);
			return DEFAULT_INJECTION_FILTER;
		}
	}
}

```

写在后面，当初在弄这个事情的时候，我也在好奇为啥mybatis没有将这个属性暴露出来，然后翻看了一下mybatis的更新记录，果然又发现：

在issues[https://github.com/mybatis/mybatis-3/issues/117](https://github.com/mybatis/mybatis-3/issues/117)中看到了关于这个属性的讨论，而且有几次commit记录：

- [https://github.com/mybatis/mybatis-3/commit/95e8adaf47d6c65c9f8a67a272f827d24e836de3](https://github.com/mybatis/mybatis-3/commit/95e8adaf47d6c65c9f8a67a272f827d24e836de3)
- [https://github.com/mybatis/mybatis-3/commit/7c218b1e87592664f30870233bae36590fd3fad6](https://github.com/mybatis/mybatis-3/commit/7c218b1e87592664f30870233bae36590fd3fad6)

可以看到作者也在纠结过，不过最终结论如同上面issues最终定论的：

> The rule of thumb is: mark the data as data.
