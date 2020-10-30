---
title: Spark 通用数据访问
toc: true
date: 2019-01-23 00:27:31
tags: ['spark']
draft: false
---

##Data abstractions
<strong>RDD</strong> is the core abstraction in Apache Spark. It is an immutable, fault-tolerant distributed collection of statically typed objects that are usually stored in-memory.
<strong>DataFrame</strong> abstraction is built on top of RDD and it adds “named” columns. Moreover, the Catalyst optimizer, under the hood, compiles the operations and generates JVM bytecode for efficient execution.
<blockquote>
  However, the named columns approach gives rise to a new problem. Static type information is no longer available to the compiler, and hence we lose the advantage of compile-time type safety.
</blockquote>
<strong>Dataset</strong> API was introduced to combine the best traits from both RDDs and DataFrames plus some more features of its own. Datasets provide row and column data abstraction similar to the DataFrames, but with a structure defined on top of them. This structure may be defined by a case class in Scala or a class in Java. They provide type safety and lambda functions like RDDs. So, they support both typed methods such as <code>map</code> and <code>groupByKey</code> as well as untyped methods such as <code>select</code> and <code>groupBy</code>. In addition to the <strong>Catalyst optimizer</strong>, Datasets leverage in-memory encoding provided by the <strong>Tungsten execution engine</strong>, which improves performance even further.
DataFrames are just untyped Datasets.

##unified data access platform
The intention behind this unified platform is that it not only lets you combine the static and streaming data together, but also allows various different kinds of operations on the data in a unified way!

###DataFrames
The DataFrame API brings two features with it:

- Built-in support for a variety of data formats-
- A more robust and feature-rich DSL with functions designed for common tasks-

####RDDs versus DataFrames

- Similarities

- Both are fault-tolerant, partitioned data abstractions in Spark-
- Both can handle disparate data sources-
- Both are lazily evaluated (execution happens when an output operation is performed on them), thereby having the ability to take the most optimized execution plan-
- Both APIs are available in all four languages: Scala, Python, Java, and R-

- Differences

- DataFrames are a higher-level abstraction than RDDs-
- The definition of RDD implies defining a Directed Acyclic Graph (DAG) whereas defining a DataFrame leads to the creation of an Abstract Syntax Tree (AST). An AST will be utilized and optimized by the Spark SQL catalyst engine.-
- RDD is a general data structure abstraction whereas a DataFrame is a specialized data structure to deal with two-dimensional, table-like data.-


####DataFrame Example

```scala
//Chapter 3 Introduction to DataFrames - Scala example code
//Creating DataFrames from RDDs
//Create a list of colours
Scala> val colors = List("white","green","yellow","red","brown","pink")
//Distribute a local collection to form an RDD
//Apply map function on that RDD to get another RDD containing colour, length tuples
Scala> val color_df = sc.parallelize(colors).map(x
          => (x,x.length)).toDF("color","length")
Scala> color_df
res0: org.apache.spark.sql.DataFrame = [color: string, length: int]
Scala> color_df.dtypes   //Note the implicit type inference
res1: Array[(String, String)] = Array((color,StringType), (length,IntegerType))
Scala> color_df.show() ()//Final output as expected. Order need not be the same as shown
+------+------+
| color|length|
+------+------+
| white|     5|
| green|     5|
|yellow|     6|
|   red|     3|
| brown|     5|
|  pink|     4|
+------+------+
//Creating DataFrames from JSON
//Pass the source json data file path
//Note: SQLCONTEXT is deprecated in Spark 2+ so use spark as entry point
// or create sqlContext as shown
//val sqlContext = new org.apache.spark.sql.SQLContext(sc)
Scala> val df = spark.read.json("./authors.json")
Scala> df.show() //json parsed; Column names and data types inferred implicitly
+----------+---------+
|first_name|last_name|
+----------+---------+
|      Mark|    Twain|
|   Charles|  Dickens|
|    Thomas|    Hardy|
+----------+---------+
//The following example assumes MYSQL is already running and the required library is imported
//Launch shell with driver-class-path as a command line argument
spark-shell --driver-class-path /usr/share/java/mysql-connector-java.jar
//Pass the connection parameters
scala> val peopleDF = sqlContext.read.format("jdbc").options(
           Map("url" -> "jdbc:mysql://localhost",
               "dbtable" -> "test.people",
               "user" -> "root",
               "password" -> "mysql")).load()
peopleDF: org.apache.spark.sql.DataFrame = [first_name: string, last_name: string, gender: string, dob: date, occupation: string, person_id: int]
//Retrieve table data as a DataFrame
scala> peopleDF.show()
+----------+---------+------+----------+----------+---------+
|first_name|last_name|gender|       dob|occupation|person_id|
+----------+---------+------+----------+----------+---------+
|    Thomas|    Hardy|     M|1840-06-02|    Writer|      101|
|     Emily|   Bronte|     F|1818-07-30|    Writer|      102|
| Charlotte|   Bronte|     F|1816-04-21|    Writer|      103|
|   Charles|  Dickens|     M|1812-02-07|    Writer|      104|
+----------+---------+------+----------+----------+---------+
//Creating DataFrames from Apache Parquet
//Write DataFrame contents into Parquet format
scala> peopleDF.write.parquet("writers.parquet")
//Read Parquet data into another DataFrame
scala> val writersDF = sqlContext.read.parquet("writers.parquet")
writersDF: org.apache.spark.sql.DataFrame = [first_name: string, last_name: string, gender: string, dob: date, occupation: string, person_id: int]
//DataFrame operations
//Create a local collection of colors first
Scala> val colors = List("white","green","yellow","red","brown","pink")
//Distribute a local collection to form an RDD
//Apply map function on that RDD to get another RDD containing color, length tuples and convert that RDD to a DataFrame
Scala> val color_df = sc.parallelize(colors).map(x
          => (x,x.length)).toDF("color","length")
//Check the object type
Scala> color_df
res0: org.apache.spark.sql.DataFrame = [color: string, length: int]
//Check the schema
Scala> color_df.dtypes
res1: Array[(String, String)] = Array((color,StringType), (length,IntegerType))
//Check row count
Scala> color_df.count()
res4: Long = 6
//Look at the table contents. You can limit displayed rows by passing parameter to show
Scala> color_df.show()
+------+------+
| color|length|
+------+------+
| white|     5|
| green|     5|
|yellow|     6|
|   red|     3|
| brown|     5|
|  pink|     4|
+------+------+
//List out column names
Scala> color_df.columns
res5: Array[String] = Array(color, length)
//Drop a column. The source DataFrame color_df remains the same.
//Spark returns a new DataFrame which is being passed to show
Scala> color_df.drop("length").show()
+------+
| color|
+------+
| white|
| green|
|yellow|
|   red|
| brown|
|  pink|
+------+
//Convert to JSON format
Scala> color_df.toJSON.first()
res9: String = {“color”:”white”,”length”:5}
//filter operation is similar to WHERE clause in SQL
//You specify conditions to select only desired columns and rows
//Output of filter operation is another DataFrame object that is usually passed on to some more operations
//The following example selects the colors having a length of four or five only and label the column as “mid_length”
filter
------
Scala> color_df.filter(color_df("length").between(4,5)).select(
         color_df("color").alias("mid_length")).show()
+----------+
|mid_length|
+----------+
|     white|
|     green|
|     brown|
|      pink|
+----------+
//This example uses multiple filter criteria. Notice the not equal to operator having double equal to symbols
Scala> color_df.filter(color_df("length") > 4).filter(color_df("color")!== "white").show()
+------+------+
| color|length|
+------+------+
| green|     5|
|yellow|     6|
| brown|     5|
+------+------+
//Sort the data on one or more columns
sort
----
//A simple single column sorting in default (ascending) order
Scala> color_df.sort("color").show()
+------+------+
| color|length|
+------+------+
| brown|     5|
| green|     5|
|  pink|     4|
|   red|     3|
| white|     5|
|yellow|     6|
+------+------+
//First filter colors of length more than 4 and then sort on multiple columns
//The filtered rows are sorted first on the column length in default ascending order. Rows with same length are sorted on color in descending order
Scala> color_df.filter(color_df("length")>=4).sort($"length", $"color".desc).show()
+------+------+
| color|length|
+------+------+
|  pink|     4|
| white|     5|
| green|     5|
| brown|     5|
|yellow|     6|
+------+------+
//You can use orderBy instead, which is an alias to sort.
scala> color_df.orderBy("length","color").take(4)
res19: Array[org.apache.spark.sql.Row] = Array([red,3], [pink,4], [brown,5], [green,5])
//Alternative syntax, for single or multiple columns
scala> color_df.sort(color_df("length").desc, color_df("color").asc).show()
+------+------+
| color|length|
+------+------+
|yellow|     6|
| brown|     5|
| green|     5|
| white|     5|
|  pink|     4|
|   red|     3|
+------+------+
//All the examples until now have been acting on one row at a time, filtering or transforming or reordering.
//The following example deals with regrouping the data.
//These operations require “wide dependency” and often involve shuffling.
groupBy
-------
Scala> color_df.groupBy("length").count().show()
+------+-----+
|length|count|
+------+-----+
|     3|    1|
|     4|    1|
|     5|    3|
|     6|    1|
+------+-----+
//Data often contains missing information or null values.
//The following json file has names of famous authors. Firstname data is missing in one row.
dropna
------
Scala> val df1 = sqlContext.read.json("./authors_missing.json")
Scala> df1.show()
+----------+---------+
|first_name|last_name|
+----------+---------+
|      Mark|    Twain|
|   Charles|  Dickens|
|      null|    Hardy|
+----------+---------+
//Let us drop the row with incomplete information
Scala> val df2 = df1.na.drop()
Scala> df2.show()  //Unwanted row is dropped
+----------+---------+
|first_name|last_name|
+----------+---------+
|      Mark|    Twain|
|   Charles|  Dickens|
+----------+---------+
```
###Datasets
Apache Spark Datasets are an extension of the DataFrame API that provide a <strong>type-safe</strong> object-oriented programming interface. DataFrame becomes a generic, untyped Dataset; or a <strong>Dataset is a DataFrame with an added structure</strong>.
The unification of Datasets and DataFrames applies to Scala and Java API only.
At the core of Dataset abstraction are the encoders. These encoders translate between JVM objects and Spark's internal Tungsten binary format. This internal representation bypasses JVM's memory management and garbage collection. Spark has its own C-style memory access that is specifically written to address the kind of workflows it supports. The resultant internal representations take less memory and have efficient memory management. Compact memory representation leads to reduced network load during shuffle operations. The encoders generate compact byte code that directly operates on serialized objects without de-serializing, thereby enhancing performance. Knowing the schema early on results in a more optimal layout in memory when caching Datasets.
###Creating Datasets from JSON
Datasets can be created from JSON files, similar to DataFrames. Note that a JSON file may contain several records, but each record has to be on one line.If your source JSON has newlines, you have to programmatically remove them.
###Datasets API's limitations

- While querying the dataset, the selected fields should be given specific data types as in the case class, or else the output will become a DataFrame. An example is：-

[code lang="scala"]
auth.select(col("first_name").as[String]).
[/code]

- Python and R are inherently dynamic in nature, and hence typed Datasets do not fit in.-

####Datasets Example

```scala
// Chapter 4 Unified Data Access - Scala example code
Datasets
---------
Example 1: Create a Dataset from a simple collection
scala> val ds1 = List.range(1,5).toDS()
ds1: org.apache.spark.sql.Dataset[Int] = [value: int]
//Perform an action
scala> ds1.collect()
res3: Array[Int] = Array(1, 2, 3, 4)
//Create from an RDD
scala> val colors = List("red","orange","blue","green","yellow")
scala> val color_ds = sc.parallelize(colors).map(x =>
     (x,x.length)).toDS()
//Add a case class
case class Color(var color: String, var len: Int)
val color_ds = sc.parallelize(colors).map(x =>
     Color(x,x.length)).toDS()
//Examine the structure
scala> color_ds.dtypes
res26: Array[(String, String)] = Array((color,StringType), (len,IntegerType))
scala> color_ds.schema
res25: org.apache.spark.sql.types.StructType = StructType(StructField(color,StringType,true),
StructField(len,IntegerType,false))
//Examine the execution plan
scala> color_ds.explain()
== Physical Plan ==
Scan ExistingRDD[color#57,len#58]
//Convert the Dataset to a DataFrame
scala> val color_df = color_ds.toDF()
color_df: org.apache.spark.sql.DataFrame = [color: string, len: int]
Example 2: Convert the dataset to a DataFrame
scala> color_df.show()
+------+---+
| color|len|
+------+---+
|   red|  3|
|orange|  6|
|  blue|  4|
| green|  5|
|yellow|  6|
+------+---+
Example 3: Convert a DataFrame to a Dataset
//Construct a DataFrame first
scala> val color_df = sc.parallelize(colors).map(x =>
            (x,x.length)).toDF("color","len")
color_df: org.apache.spark.sql.DataFrame = [color: string, len: int]
//Convert the DataFrame to a Dataset with a given Structure
scala> val ds_from_df = color_df.as[Color]
ds_from_df: org.apache.spark.sql.Dataset[Color] = [color: string, len: int]
//Check the execution plan
scala> ds_from_df.explain
== Physical Plan ==
WholeStageCodegen
:  +- Project [_1#102 AS color#105,_2#103 AS len#106]
:     +- INPUT
+- Scan ExistingRDD[_1#102,_2#103]
//Example 4:  Create a Dataset from json
//Set filepath
scala> val file_path = "<Your parh>/authors.json"
file_path: String = <Your path>/authors.json
//Create case class to match schema
scala> case class Auth(first_name: String, last_name: String,books: Array[String])
defined class Auth
//Create dataset from json using case class
//Note that the json document should have one record per line
scala> val auth = spark.read.json(file_path).as[Auth]
auth: org.apache.spark.sql.Dataset[Auth] = [books: array<string>, firstName: string ... 1 more field]
//Look at the data
scala> auth.show()
+--------------------+----------+---------+
|               books|first_name|last_name|
+--------------------+----------+---------+
|                null|      Mark|    Twain|
|                null|   Charles|  Dickens|
|[Jude the Obscure...|    Thomas|    Hardy|
+--------------------+----------+---------+
//Try explode to see array contents on separate lines
scala> auth.select(explode($"books") as "book",
            $"first_name",$"last_name").show(2,false)
+------------------------+----------+---------+
|book                    |first_name|last_name|
+------------------------+----------+---------+
|Jude the Obscure        |Thomas    |Hardy    |
|The Return of the Native|Thomas    |Hardy    |
+------------------------+----------+---------+
```
##Spark SQL</h2>
Spark SQL is a Spark module for structured data processing.We'll be focusing on window operations, which have been just introduced in Spark 2.0. They address sliding window operations.
<em>For example, if you want to report the average peak temperature every day in the past seven days, then you are operating on a sliding window of seven days until today. Here is an example that computes average sales per month for the past three months. The data file contains 24 observations showing monthly sales for two products, P1 and P2.</em>
The Catalyst optimizer contains libraries for representing trees and applying rules to transform the trees. These tree transformations are applied to create the most optimized logical and physical execution plans. In the final phase, it generates Java bytecode using a special feature of the Scala language called <strong>quasiquotes</strong>.
The optimizer also enables external developers to extend the optimizer by adding data-source-specific rules that result in pushing operations to external systems, or support for new data types.
The Catalyst optimizer arrives at the most optimized plan to execute the operations on hand. The actual execution and related improvements are provided by the Tungsten engine. The goal of Tungsten is to improve the memory and CPU efficiency of Spark backend execution. The following are some salient features of this engine:

- Reducing the memory footprint and eliminating garbage collection overheads by bypassing (off-heap) Java memory management.-
- Code generation fuses across multiple operators and too many virtual function calls are avoided. The generated code looks like hand-optimized code.-
- Memory layout is in columnar, in-memory parquet format because that enables vectorized processing and is also closer to usual data access operations.-
- In-memory encoding using encoders. Encoders use runtime code generation to build custom byte code for faster and compact serialization and deserialization. Many operations can be performed in-place without deserialization because they are already in Tungsten binary format.-

####Example
```scala
//Example 5: Window example with moving average computation
scala> import org.apache.spark.sql.expressions.Window
import org.apache.spark.sql.expressions.Window
//Create a DataFrame containing monthly sales data for two products
scala> val monthlySales = spark.read.options(Map({"header"->"true"},{"inferSchema" -> "true"})).
                            csv("<Your path>/MonthlySales.csv")
monthlySales: org.apache.spark.sql.DataFrame = [Product: string, Month: int ... 1 more field]
//Prepare WindowSpec to create a 3 month sliding window for a product
//Negative subscript denotes rows above current row
scala> val w = Window.partitionBy(monthlySales("Product")).orderBy(monthlySales("Month")).rangeBetween(-2,0)
w: org.apache.spark.sql.expressions.WindowSpec = org.apache.spark.sql.expressions.WindowSpec@3cc2f15
//Define compute on the sliding window, a moving average in this case
scala> val f = avg(monthlySales("Sales")).over(w)
f: org.apache.spark.sql.Column = avg(Sales) OVER (PARTITION BY Product ORDER BY Month ASC RANGE BETWEEN 2 PRECEDING AND CURRENT ROW)
//Apply the sliding window and compute. Examine the results
scala> monthlySales.select($"Product",$"Sales",$"Month",bround(f,2).alias("MovingAvg")).
                    orderBy($"Product",$"Month").show(6)
+-------+-----+-----+---------+
|Product|Sales|Month|MovingAvg|
+-------+-----+-----+---------+
|     P1|   66|    1|     66.0|
|     P1|   24|    2|     45.0|
|     P1|   54|    3|     48.0|
|     P1|    0|    4|     26.0|
|     P1|   56|    5|    36.67|
|     P1|   34|    6|     30.0|
+-------+-----+-----+---------+
```
##Structured Streaming</h2>
Apache Spark 2.0 has the first version of the higher level stream processing API called the <strong>Structured Streaming</strong> engine. This scalable and fault-tolerant engine leans on the Spark SQL API to simplify the development of real-time, continuous big data applications. It is probably the first successful attempt in unifying the batch and streaming computation.
At a technical level, Structured Streaming leans on the Spark SQL API, which extends DataFrames/Datasets,
##The Spark streaming programming model</h2>
The idea is to treat the real-time data stream as a table that is continuously being appended
Structured Streaming provides three output modes:

- <strong>Append</strong>: In the external storage, only the new rows appended to the result table since the last trigger will be written. This is applicable only on queries where existing rows in the result table cannot change (for example, a map on an input stream).-
- <strong>Complete</strong>: In the external storage, the entire updated result table will be written as is.-
- <strong>Update</strong>: In the external storage, only the rows that were updated in the result table since the last trigger will be changed. This mode works for output sinks that can be updated in place, such as a MySQL table.-

####Example

```scala
//Example 6: Streaming example
//Understand nc
// Netcat or nc is a networking utility that can be used for creating TCP/UDP connections
// -k Forces nc to stay listening for another connection after its current connection is completed.
// -l Used to specify that nc should listen for an incoming connection
//             rather than initiate a connection to a remote host.
//Run system activity report to collect memory usage in one terminal window
// The following command shows memory utilization for every 2 seconds, 20 times
// It diverts the output to the given port and you can check raw output from the browser
//sar -r 2 20 | nc -lk 9999
//In spark-shell window, do the following
//Read stream
scala> val myStream = spark.readStream.format("socket").
                       option("host","localhost").
                       option("port",9999).load()
myStream: org.apache.spark.sql.DataFrame = [value: string]
//Filter out unwanted lines and then extract free memory part as a float
//Drop missing values, if any
scala> val myDF = myStream.filter($"value".contains("IST")).
               select(substring($"value",15,9).cast("float").as("memFree")).
               na.drop().select($"memFree")
myDF: org.apache.spark.sql.DataFrame = [memFree: float]
//Define an aggregate function
scala> val avgMemFree = myDF.select(avg("memFree"))
avgMemFree: org.apache.spark.sql.DataFrame = [avg(memFree): double]
//Create StreamingQuery handle that writes on to the console
scala> val query = avgMemFree.writeStream.
          outputMode("complete").
          format("console").
          start()
query: org.apache.spark.sql.streaming.StreamingQuery = Streaming Query - query-0 [state = ACTIVE]
Batch: 0
-------------------------------------------
+-----------------+
|     avg(memFree)|
+-----------------+
|4116531.380952381|
+-----------------+
....
```
