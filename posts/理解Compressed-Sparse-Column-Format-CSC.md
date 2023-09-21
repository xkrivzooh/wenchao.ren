---
icon: page
sidebar: false
author: xkrivzooh
date: 2019-01-23
category:
  - post
tag:
  - spark
---

# 理解Compressed Sparse Column Format (CSC)

最近在看《Spark for Data Science》这本书，阅读到《Machine Learning》这一节的时候被稀疏矩阵的存储格式CSC给弄的晕头转向的。所以专门写一篇文章记录一下我对这种格式的理解。

##目的
`Compressed Sparse Column Format (CSC)`的目的是为了压缩矩阵，减少矩阵存储所占用的空间。这很好理解，手法无法就是通过增加一些"元信息"来描述矩阵中的非零元素存储的位置(基于列)，然后结合非零元素的值来表示矩阵。这样在一些场景下可以减少矩阵存储的空间。

##Spark API

在Spark中我们一般创建这样的稀疏矩阵的API为：

```scala
   package org.apache.spark.ml.linalg
	 /**
   * Creates a column-major sparse matrix in Compressed Sparse Column (CSC) format.
   *
   * @param numRows number of rows
   * @param numCols number of columns
   * @param colPtrs the index corresponding to the start of a new column
   * @param rowIndices the row index of the entry
   * @param values non-zero matrix entries in column major
   */
  @Since("2.0.0")
  def sparse(
     numRows: Int,
     numCols: Int,
     colPtrs: Array[Int],
     rowIndices: Array[Int],
     values: Array[Double]): Matrix = {
    new SparseMatrix(numRows, numCols, colPtrs, rowIndices, values)
  }
```
##使用CSC格式表示稀疏矩阵
例如我们想创建一下如下的3x3的稀疏矩阵：
```scala
	1	0	4
	0	3	5
	2	0	6
```
我们就可以使用上面的这个api：
```scala
	import org.apache.spark.ml.linalg.{Matrix,Matrices}
	val sm: Matrix = Matrices.sparse(3,3, Array(0,2,3,6), Array(0,2,1,0,1,2), Array(1.0,2.0,3.0,4.0,5.0,6.0))
	输出如下：
	sm: org.apache.spark.ml.linalg.Matrix = 3 x 3 CSCMatrix
(0,0) 1.0
(2,0) 2.0
(1,1) 3.0
(0,2) 4.0
(1,2) 5.0
(2,2) 6.0
```
也就是说上面的3x3的矩阵，可以表示为下面3个数组：
```scala
	Array(0, 2, 3, 6)
	Array(0, 2, 1, 0, 1, 2)
	Array(1, 2, 3, 4, 5, 6)
```
说实话我第一次看到这个api的时候有点蒙。下面因为没太看懂上面三个Array中的第一个<code>Array(0, 2, 3, 6)</code>是怎么的出来的。也翻看了比较权威的资料（本文最下方的参考资料），但是感觉说的比较不清楚，因此下面谈谈我是如何理解的。
##我的理解
上面的3个Array：(为了便于书写我没有写1.0，而是直接写为1)
```scala
	Array(0, 2, 3, 6)
	Array(0, 2, 1, 0, 1, 2)
	Array(1, 2, 3, 4, 5, 6)
```
其中第三个Array很好理解。它的值就是按照<strong>列</strong>，依次按照顺序记录的矩阵中的非零值。
第二个Array也比较好理解，他表示的是每一列，非零元素所在的行号，行号从0开始。比如上面的矩阵中，第一列元素1在第0行，元素2在第2行。
至于第1个Array理解起来稍微麻烦一些。我的总结就是：

- 第一个Array的元素个数就是（矩阵的列数+1），也就是矩阵是3列，那么这个Array的个数就是4.
- 第一个元素一直是0。第二个元素是第一列的非零元素的数量
- 后续的值为前一个值 + 下一列非零元素的数量

上面的总结可能看起来比较模糊，根据上面的例子我来分析一下：

- 首先矩阵的3x3的，所以第一个Array会有4个元素。第一个元素是0。得到Array（0）。
- 矩阵第一列有2个非零元素，所以得到Array的第二个元素为2.得到Array（0， 2）
- 矩阵的第二列有1个非零元素，那么第三个元素的数量为当前Array的最后一个元素加1，也就是2 + 1=3. 得到Array（0，2， 3）
- 矩阵的第三列有3个非零元素，那么Array的最后一个元素的值为 3 + 3 = 6. 得到Array（0， 2， 3， 6）

##验证例子
对于下面的这个3x3的矩阵：
```scala
	1	0	2
	0	0	3
	4	5	6
```
我们可以得到3个Array为：
```scala
Array(0, 2, 3, 6)
Array(0, 2, 2, 0, 1, 2)
Array(1, 4, 5, 2, 3, 6)
```
对于下面的矩阵：
```scala
	9	0
	0	8
	0	6
```
我们可以得到3个Array来表示他：
```scala
	Array(0, 1, 3)
	Array(0, 1, 2)
	Array(9, 8, 6)
```
对于下面的矩阵：
```scala
	9	0	0	0
	0	8	6	5
```
我们可以表示为：
```scala
	Array(0, 1, 2, 3, 4)
	Array(0, 1, 1, 1)
	Array(9, 8, 6, 5)
```
##根据CSC表示法，画出原始矩阵
上面展示了如何把稀疏矩阵使用CSC表示，那么反过来应该怎么操作呢，
假设有一个2x4的矩阵，他的CSC表示为：
```scala
	Array(0, 1, 2, 3, 4)
	Array(0, 1, 1, 1)
	Array(9, 8, 6, 5)
```
我大致描述一下还原的过程：

- 首先我们知道是2x4的矩阵，并且第一个Array的第二个元素是1，而且后续的每一个元素都比前一个元素大1，说明每一列都只有1个非零元素。
- 根据第二个数组，我们可以知道只有第一列的非零元素在第一行，2，3，4列的非零元素都在第二行
- 根据第三个Array，我们就可以比较简单的画出原始矩阵。

##参考资料

- [Sparse matrix](https://en.wikipedia.org/wiki/Sparse_matrix)
- [Compressed Sparse Column Format (CSC)](http://www.scipy-lectures.org/advanced/scipy_sparse/csc_matrix.html)


<!-- @include: ../scaffolds/post_footer.md -->
