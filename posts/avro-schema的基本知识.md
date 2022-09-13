---
icon: page
author: xkrivzooh
sidebar: false
date: 2020-07-24
category:
  - post
tag:
  - avro
---

# avro schema的基本知识

官方文档：[https://avro.apache.org/docs/current/spec.html#json_encoding](https://avro.apache.org/docs/current/spec.html#json_encoding)<br />

<a name="aYvAJ"></a>
## Schema 定义
Avro Schema使用JSON表示的话，会是下面三种类型之一：

- 一个JSON字符串，命名已定义的类型
- 一个JSON对象，类似于：`{"type": "typeName" ...attributes...}`
- 一个JSON array，代表`union`类型
<a name="PLDA4"></a>
## 基本类型

<br />Avro Schema的基本类型有：

- `null` 类似于java的null
- `boolean`，对应java中的boolean
- `int` 对应java中的int
- `long` 对应java中的long
- `float` 对应java中的float
- `double` 对应java中的double
- `bytes` 对应java中的byte
- `string` 对应java中的java.lang.String


<br />复杂类型<br />Avro支持六种复杂类型：`records, enums, arrays, maps, unions and fixed.`<br />

<a name="04QBU"></a>
#### Records
Record类似于java中的Object，我们用来表示对象。它支持3个属性：

- `name` 一个JSON String，用来标识record的名称（必须项）大多数时候都是java中的class名称
- `namespace` 一个JSON String用来限定name的范围，大多数时候都是java中的package名称
- `doc` 一个JSON String，用来对这个record进行描述信息，（可选性）
- `aliases` 一个JSON array。用来提供别名（可选性）
- `fields` 一个JSON array，用来列出record的字段。（必须项）每个字段有如下的属性：
   - `name` 一个JSON String，用来标识字段名称
   - `doc` 一个JSON String，用来解释字段
   - `type` 字段的类型，一个Schema。
   - `default` 字段的默认值，字段的默认值取决于字段的类型。如果字段类型的一个union类型的话，那么字段的类型就取决于union中的第一个schema的类型。针对bytes和fixed类型的字段，字段的默认值都会是JSON String。where Unicode code points 0-255 are mapped to unsigned 8-bit byte values 0-255.

![image.png](https://cdn.nlark.com/yuque/0/2020/png/1902654/1595587004404-470c5475-675b-4224-ac42-73f70be9c8a7.png#align=left&display=inline&height=235&margin=%5Bobject%20Object%5D&name=image.png&originHeight=470&originWidth=502&size=50182&status=done&style=none&width=251)

   - `order` 字段的排序。可选值有：ascending（默认）和descending 和ignore
   - `aliases`  一个JSON array String，用来给字段提供别名



下面就是一个record的例子：
```json
{
  "type": "record",
  "name": "LongList",
  "aliases": ["LinkedLongs"],                      // old name for this
  "fields" : [
    {"name": "value", "type": "long"},             // each element has a long
    {"name": "next", "type": ["null", "LongList"]} // optional next element
  ]
}
```
<a name="OJrHh"></a>
### Enums
枚举类型使用关键字`enum`，主要有如下的属性：

- `name` JSON String类型，用来标识名称
- `namespace` 和上面的namespace一样（后面对于这种类型的字段我们就不做解释了。）
- `aliases`
- `doc`
- `symbols` 一个JSON数组，元素都是String，用来枚举可选值。**数组中的值不能重复，必须是唯一的**。数组中的元素值必须符合正则表达式：`[A-Za-z_][A-Za-z0-9_]*`
- `default` 枚举的默认值，而且必须是symbols里面列出的元素之一。

下面是一个enum的例子：
```json
{
  "type": "enum",
  "name": "Suit",
  "symbols" : ["SPADES", "HEARTS", "DIAMONDS", "CLUBS"]
}
```
<a name="9NTHY"></a>
#### Arrays
数组使用关键字：`array`，主要有如下属性：

- items 列出数组元素的Schema类型

下面是一个Array的例子：
```json
{
  "type": "array",
  "items" : "string",
  "default": []
}
    
```
<a name="0qB46"></a>
#### Map
map类型使用map关键字，主要有如下属性：

- values 用来列出map值的schema

map的key都是string类型。<br />如下面的schema表示`Map<String, LONG>`：
```json
{
  "type": "map",
  "items" : "long",
  "default": {}
}
    
```
<a name="LMu6k"></a>
#### Unions
union有点像一个JSON array。比如` ["null", "string"]`就是一个union，表示这个schema的可能是null或者string。<br />在Avro Schema中，可选值一般就是使用这种表现形式。比如有一个字段为String类型可选的，那么就使用union：` ["null", "string"]`来表示。union的类型其实是看第一个元素的。所以一般null在前面。表示可选。

需要注意的是union中不能包含重复的schema，比如["string", "string"]就不可以。当然了对于record和fixed以及enum都是除外的。
> Unions may not contain more than one schema with the same type, except for the named types record, fixed and enum. For example, unions containing two array types or two map types are not permitted, but two types with different names are permitted. (Names permit efficient resolution when reading and writing unions.)
> 


<a name="q5qhM"></a>
#### Fixed
fixed类型有如下属性：

- name
- namespace
- aliases
- size 一个integer类型，用来指定每个值的字节数（必填的）。

比如一个16byte的fixed的例子：
```json
{"type": "fixed", "size": 16, "name": "md5"}
```
<a name="VfJEV"></a>
## Avro Schema name
无论是record，enum还是fixed，都是有名称的类型。类似于java的类有类名和package一样。<br />name就等同于java的class 名。namespace就等同于java的package name。<br />
<br />name必须是字母或者下划线（`[A-Za-z_]`）开头，然后从第二位开始可以有数字`[A-Za-z0-9_]`。<br />namespace是点分的字符串，namespace也可以为null。格式为：`  <empty> | <name>[(<dot><name>)*]`

- 一个例子， "name": "X", "namespace": "org.foo"则说明fullname是org.foo.X.
- 如果name": "org.foo.X，则表示fullname是：org.foo.X.
- A name only is specified, i.e., a name that contains no dots. In this case the namespace is taken from the most tightly enclosing schema or protocol. For example, if "name": "X" is specified, and this occurs within a field of the record definition of org.foo.Y, then the fullname is org.foo.X. If there is no enclosing namespace then the null namespace is used. （这一点非常像java中的类字段的属性的全限定名）


<br />对先前定义的名称的引用与上述后两种情况相同：如果它们包含点，则为全名；如果它们不包含点，则命名空间为封闭定义的命名空间。<br />基本类型名称没有名称空间，并且它们的名称不能在任何名称空间中定义。
<a name="jj12j"></a>
## Avro Schema alias
`Named types`和字段都可以有别名，比如可以针对一个Schema起一个write的别名也可以起一个read的别名，这既方便了模式演变，又可以处理不同的数据集。<br />


