---
title: Spring中Enum的依赖注入
toc: true
date: 2019-01-23 00:17:48
tags: ['java']
draft: false
---

Spring 依赖注入很简单，没什么值得细说的。但是我之前遇到了一个场景，需要在一个Enum类中注入某一个service。
说实话之前没有遇到过这种情况。虽然我不赞同Enum类有过多的逻辑，但是没有办法，现实就是那么残酷。而且Enum确实可以通过一些手段来注入其他发service的。
比如下面的代码中，为EnumClass枚举类注入OtherService服务，代码示例如下：

```java
	public enum EnumClass {
	    A(1), B(2);
	    EnumClass(int id) {
	        this.id = id;
	    }
	    private int id;
	    private OtherService otherService;
	    public int getId() {
	        return id;
	    }
	    public OtherService getOtherService() {
	        return otherService;
	    }
	    public void setOtherService(OtherService otherService) {
	        this.otherService = otherService;
	    }
	    public ResponseType func(){
	    	//use otherService do somethings
	    	return new ResponseType();
	    }
	    @Component
	    public static class EnumClassInner {
	        @Autowired
	        private OtherService otherService;
	        @PostConstruct
	        public void postConstruct() {
	            for (EnumClass aEnum : EnumSet.allOf(EnumClass.class))
	                aEnum.setOtherService(otherService);
	        }
	    }
	}
```
