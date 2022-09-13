---
icon: page
author: xkrivzooh
sidebar: false
date: 2019-02-15
category:
  - post
tag:
  - spring
  - java
---

# 为Spring boot项目增加Servlet

为Spring boot项目增加Servlet有好多种方式

## 方式1

Just add a bean for the servlet. It'll get mapped to `/{beanName}/`.

```java
@Bean
public Servlet foo() {
    return new FooServlet();
}
```

Note that if you actually want it mapped to `/something/*` rather than `/something/` you will need to use `ServletRegistrationBean`

## 方式2

使用`ServletRegistrationBean`

```java
@Bean
public ServletRegistrationBean servletRegistrationBean(){
    return new ServletRegistrationBean(new FooServlet(),"/someOtherUrl/*");
}
```

如果想增加多个的话，就类似下面的方式

```java
 @Bean
   public ServletRegistrationBean axisServletRegistrationBean() {
      ServletRegistrationBean registration = new ServletRegistrationBean(new AxisServlet(), "/services/*");
      registration.addUrlMappings("*.jws");
      return registration;
   }

   @Bean
   public ServletRegistrationBean adminServletRegistrationBean() {
      return new ServletRegistrationBean(new AdminServlet(), "/servlet/AdminServlet");
   }
```

## 方式3

通过实现`WebApplicationInitializer`或者`ServletContextInitializer`或者`ServletContainerInitializer`接口

```java
@Configuration
public class ConfigureWeb implements ServletContextInitializer, EmbeddedServletContainerCustomizer {

  @Override
  public void onStartup(ServletContext servletContext) throws ServletException {
      registerServlet(servletContext);
  }

  private void registerServlet(ServletContext servletContext) {
      log.debug("register Servlet");
      ServletRegistration.Dynamic serviceServlet = servletContext.addServlet("ServiceConnect", new ServiceServlet());

      serviceServlet.addMapping("/api/ServiceConnect/*");
      serviceServlet.setAsyncSupported(true);
      serviceServlet.setLoadOnStartup(2);
  }
}
```

## 方式4

如果使用内嵌的server的话，那么还可以使用`@WebServlet` [WebServlet](https://docs.oracle.com/javaee/7/api/javax/servlet/annotation/WebServlet.html)

> Annotation used to declare a servlet.

> This annotation is processed by the container at deployment time, and the corresponding servlet made available at the specified URL patterns.

```java
@WebServlet(urlPatterns = "/example")
public class ExampleServlet extends HttpServlet
```

然后增加注解`@ServletComponentScan`:

```java
@ServletComponentScan
@EntityScan(basePackageClasses = { ExampleApp.class, Jsr310JpaConverters.class })
@SpringBootApplication
public class ExampleApp 
```

Please note that @ServletComponentScan will work only with embedded server:

> Enables scanning for Servlet components (filters, servlets, and listeners). Scanning is only performed when using an embedded web server.


## 参考资料

- [How can I register a secondary servlet with Spring Boot?](https://stackoverflow.com/questions/20915528/how-can-i-register-a-secondary-servlet-with-spring-boot)
- [The @ServletComponentScan Annotation in Spring Boot](https://www.baeldung.com/spring-servletcomponentscan)
