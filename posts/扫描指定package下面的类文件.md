---
icon: page
author: xkrivzooh
date: 2020-11-02
category:
  - post
tag:
  - java
---

# "扫描指定package下面的类文件"

下面的程序代码是使用`Guava`来完成操作的：

```java
@Test
    public void test_scan() throws Exception {
        //using guava
        ClassPath classPath = ClassPath.from(ClassUtils.getDefaultClassLoader());
        ImmutableSet<ClassPath.ClassInfo> topLevelClasses = classPath.getTopLevelClasses();
        for (ClassPath.ClassInfo topLevelClass : topLevelClasses) {

            if (topLevelClass.getPackageName().equals("com.xxx.xxx.com.xxx.xxx.metadata")) {
                Class<?> clazz = topLevelClass.load();
                Entity annotation = AnnotationUtils.findAnnotation(clazz, Entity.class);
                if (annotation != null) {
                    System.out.println(topLevelClass.toString());
                }
            }
        }
    }
```

