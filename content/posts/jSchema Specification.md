---
title: "JSchema Specification"
date: 2022-08-31T23:08:14+08:00
draft: false
tags: ['jSchema']
---

## Introduction

This document defines jSchema. It is intended to be the authoritative specification. Implementations of jSchema must
adhere to this document.

## Schema Declaration

A Schema is represented in JSON by one of:

- A JSON string, naming a defined type.
- A JSON object, of the form:

```
{
  "type": "typeName"
  ...attributes...
}
```

where typeName is either a primitive or derived type name, as defined below. Attributes not defined in this document are
permitted as metadata, but must not affect the format of serialized data.

## Schema Category

jSchema supports two kinds of schemas:
- TypeSchema
- FunctionSchema

### TypeSchema

TypeSchema is mainly used to describe types in Java. Such as primitive types, arrays, collections, custom classes, etc.

#### Generate TypeSchema

Generating TypeSchema requires using the `TypeSchema.getSchema` function. The simple usage is as follows:

```java
public class TypeSchemaTest {

    public static class User {
        String name;
        int age;
    }

    @Test
    public void test1() {
        TypeSchema schema = TypeSchema.getSchema(User.class);
        System.out.println(schema.toString(true));
    }
}
```

The content of the TypeSchema corresponding to the `User` object in the sample code is as follows:

```json
{
  "type": "record",
  "name": "User",
  "namespace": "ren.wenchao.jschema.TypeSchemaTest",
  "types": {},
  "fields": [
    {
      "name": "age",
      "type": "int"
    },
    {
      "name": "name",
      "type": "String"
    }
  ]
}
```

### FunctionSchema

FunctionSchema is mainly used to describe the function structure in java.

#### Generate FunctionSchema

If we already have an object of type `java.lang.reflect.Method` in the context, we will use `FunctionSchema.getSchema`
method to generate FunctionSchema, for example:

```java
public class FunctionSchemaTest {

    static class A {

        boolean f1() {
            return true;
        }

        String f2(int a, long c) {
            return "";
        }
    }

    @Test
    public void test1() throws NoSuchMethodException {
        Method f1 = A.class.getDeclaredMethod("f1");
        System.out.println(FunctionSchema.getSchema(f1).toString(true));
        Assert.assertEquals("{\n" +
                "  \"type\" : \"function\",\n" +
                "  \"namespace\" : \"ren.wenchao.jschema.FunctionSchemaTest\",\n" +
                "  \"name\" : \"A\",\n" +
                "  \"functionName\" : \"f1\",\n" +
                "  \"doc\" : null,\n" +
                "  \"request\" : { },\n" +
                "  \"response\" : \"boolean\"\n" +
                "}", FunctionSchema.getSchema(f1).toString(true));
    }
}
```

But if there is no object of type `java.lang.reflect.Method` in our context, we need to fully construct the FunctionSchema ourselves.
For your convenience, I provide the `FunctionSchemaBuilder` class to simplify the operation. Here is a simple example:

```java
public class FunctionSchemaBuilderTest {


    @Test
    public void test1() {
        Parameter parameter3 = new Parameter();
        parameter3.setName("arg2");
        parameter3.setDoc("arg2Doc");
        parameter3.addProp("arg2K1", "arg2K2");
        parameter3.setSchema(TypeSchema.getSchema(Integer.class));
        parameter3.addConstraint(new NotNull("arg2不能为空"));
        parameter3.setDefaultValue("1");


        FunctionSchemaBuilder builder = FunctionSchemaBuilder.builder()
                .namespace("ren.wenchao.jschema.FunctionSchemaTest")
                .name("A")
                .functionName("f1")
                .doc("doc")
                .requestParameter("arg0", "arg0Doc", TypeSchema.getSchema(int.class))
                .requestParameter("arg1", "arg1Doc", TypeSchema.getSchema(int.class))
                .requestParameter(parameter3)
                .response(TypeSchema.getSchema(int.class));
        FunctionSchema functionSchema = builder.build();
        System.out.println(functionSchema.toString(true));
        Assert.assertEquals("{\n" +
                "  \"type\" : \"function\",\n" +
                "  \"namespace\" : \"ren.wenchao.jschema.FunctionSchemaTest\",\n" +
                "  \"name\" : \"A\",\n" +
                "  \"functionName\" : \"f1\",\n" +
                "  \"doc\" : \"doc\",\n" +
                "  \"request\" : {\n" +
                "    \"arg0\" : {\n" +
                "      \"doc\" : \"arg0Doc\",\n" +
                "      \"props\" : { },\n" +
                "      \"constraints\" : { },\n" +
                "      \"type\" : \"int\",\n" +
                "      \"pos\" : \"0\"\n" +
                "    },\n" +
                "    \"arg1\" : {\n" +
                "      \"doc\" : \"arg1Doc\",\n" +
                "      \"props\" : { },\n" +
                "      \"constraints\" : { },\n" +
                "      \"type\" : \"int\",\n" +
                "      \"pos\" : \"1\"\n" +
                "    },\n" +
                "    \"arg2\" : {\n" +
                "      \"doc\" : \"arg2Doc\",\n" +
                "      \"props\" : {\n" +
                "        \"arg2K1\" : \"arg2K2\"\n" +
                "      },\n" +
                "      \"constraints\" : {\n" +
                "        \"NotNull\" : {\n" +
                "          \"message\" : \"arg2不能为空\"\n" +
                "        }\n" +
                "      },\n" +
                "      \"type\" : \"Integer\",\n" +
                "      \"default\" : \"1\",\n" +
                "      \"pos\" : \"2\"\n" +
                "    }\n" +
                "  },\n" +
                "  \"response\" : \"int\"\n" +
                "}", functionSchema.toString(true));

    }
}
```

## Schema Types

### Primitive Types

| jSchema type string representation |    Java Type     |
|:-----------------------------------|:----------------:|
| byte                               |       byte       |
| short                              |      short       |
| int                                |       int        |
| long                               |       long       |
| float                              |      float       |
| double                             |      double      |
| boolean                            |     boolean      |
| char                               |       char       |
| String                             | java.lang.String |

### Wrapper Types

| jSchema type string representation |   SchemaType    |     Java Types      |
|------------------------------------|:---------------:|:-------------------:|
| Byte                               |  BYTE_WRAPPER   |   java.lang.Byte    |
| Short                              |  SHORT_WRAPPER  |   java.lang.Short   |
| Integer                            |   INT_WRAPPER   |  java.lang.Integer  |
| Long                               |  LONG_WRAPPER   |   java.lang.Long    |
| Float                              |  FLOAT_WRAPPER  |   java.lang.Float   |
| Double                             | DOUBLE_WRAPPER  |  java.lang.Double   |
| Boolean                            | BOOLEAN_WRAPPER |  java.lang.Boolean  |
| Character                          |  CHAR_WRAPPER   | java.lang.Character |

### Collection Types


| jSchema type string representation |     Java类型     |
|:----------------------------------:|:--------------:|
|               array                |       /        |
|                Map                 | java.util.Map  |
|                List                | java.util.List |
|                Set                 | java.util.Set  |

### Other Types

#### record

- Records use the type name `record` and support the following attributes:
- name: a JSON string providing the name of the record (required). 
- namespace, a JSON string that qualifies the name (optional);
- doc: a JSON string providing documentation to the user of this schema (optional).
- aliases: a JSON array of strings, providing alternate names for this record (optional).
- fields: a JSON array, listing fields (required). Each field is a JSON object with the following attributes:
- name: a JSON string providing the name of the field (required), and
- doc: a JSON string describing this field for users (optional).
- type: a schema, as defined above
- default: A default value for this field, only used when reading instances that lack the field for schema evolution purposes.

For example, a record type schema may be defined with:

```json
{
  "type": "record",
  "name": "User",
  "namespace": "ren.wenchao.jschema.TypeSchemaTest",
  "types": {},
  "fields": [
    {
      "name": "age",
      "type": "int"
    },
    {
      "name": "name",
      "type": "String"
    }
  ]
}
```

#### enum

`enum` indicates that the type is an enumeration type。

for example:

```java
    public enum B {
        a("a");
        private final String name;

        B(String name) {
            this.name = name;
        }
    }
```
The corresponding schema of this enum B is expressed as follows:

```json
{
  "type" : "enum",
  "name" : "B",
  "namespace" : "ren.wenchao.jschema.EnumSchemaTest",
  "symbols" : [ "a" ]
}
```

#### bytes

`bytes` indicates that this is a byte array type

#### null

`null` indicates that the type is null, which corresponds to the `null` keyword in java

#### void

`void` indicates that the type is void, corresponding to the `void` keyword in java



