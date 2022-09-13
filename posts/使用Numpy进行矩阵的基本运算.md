---
icon: page
author: xkrivzooh
sidebar: false
date: 2019-01-23
category:
  - post
tag:
  - python
---

# 使用Numpy进行矩阵的基本运算

本文介绍了使用Python的Numpy库进行矩阵的基本运算
##创建全0矩阵
```python
# 创建3x5的全0矩阵
myZero = np.zeros([3, 5])
print myZero
```
输出结果：
```python
[[ 0.  0.  0.  0.  0.]
 [ 0.  0.  0.  0.  0.]
 [ 0.  0.  0.  0.  0.]]
```
##创建全1矩阵
```python
# 创建3x5的全1矩阵
myOnes = np.ones([3, 5])
print myOnes
```
输出结果：
```python
[[ 1.  1.  1.  1.  1.]
 [ 1.  1.  1.  1.  1.]
 [ 1.  1.  1.  1.  1.]]
```
##创建0~1之间的随机矩阵
```python
# 3x4的0~1之间的随机数矩阵
myRand = np.random.rand(3, 4)
print myRand
```
输出结果为：
```python
[[ 0.26845651  0.26713961  0.12632736  0.69840295]
 [ 0.92745819  0.44091417  0.21733213  0.76135785]
 [ 0.97161283  0.13570203  0.07819361  0.72129986]]
```
##创建单位矩阵
```python
# 3x3的单位矩阵
myEye = np.eye(3)
print myEye
```
输出结果为：
```python
[[ 1.  0.  0.]
 [ 0.  1.  0.]
 [ 0.  0.  1.]]
```
##矩阵求和
```python
print myZero + myOnes
```
输出结果为：
```python
[[ 1.  1.  1.  1.  1.]
 [ 1.  1.  1.  1.  1.]
 [ 1.  1.  1.  1.  1.]]
```
##矩阵求差
```python
print myZero - myOnes
```
输出结果为：
```python
[[-1. -1. -1. -1. -1.]
 [-1. -1. -1. -1. -1.]
 [-1. -1. -1. -1. -1.]]
```
##创建矩阵
```python
myMatrix = np.mat([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
print myMatrix
```
输出结果为：
```python
[[1 2 3]
 [4 5 6]
 [7 8 9]]
```
##矩阵乘以常数
```python
print 10 * myMatrix
```
输出结果为：
```python
[[10 20 30]
 [40 50 60]
 [70 80 90]]
```
##矩阵所有元素求和
```python
print np.sum(myMatrix)
```
输出结果为<code>45</code>
##矩阵乘法
当维度相同的时候，为各个位置对应元素的乘积
当矩阵的维度不同时，会根据一定的广播规则将维数扩充到一致的形式
```python
myMatrix2 = 2 * myMatrix
print myMatrix2
print np.multiply(myMatrix, myMatrix2)
myMatrix3 = np.mat([[1], [2], [3]])
print(myMatrix3)
print myMatrix * myMatrix3
```
输出结果为：
```python
[[ 2  4  6]
 [ 8 10 12]
 [14 16 18]]
[[  2   8  18]
 [ 32  50  72]
 [ 98 128 162]]
[[1]
 [2]
 [3]]
[[14]
 [32]
 [50]]
```
##矩阵的幂
```python
print np.power(myMatrix, 2)
```
输出结果为：
```python
[[ 1  4  9]
 [16 25 36]
 [49 64 81]]
```
##矩阵的转置
```python
print myMatrix
print myMatrix.T
print myMatrix.transpose()
```
输出结果为：
```python
[[1 2 3]
 [4 5 6]
 [7 8 9]]
[[1 4 7]
 [2 5 8]
 [3 6 9]]
[[1 4 7]
 [2 5 8]
 [3 6 9]]
```
##矩阵的其他操作：行列数、切片、复制、比较
```python
[m, n] = myMatrix.shape
print "矩阵的行列数为:", m, n
# 按照行切片（输出矩阵的行）
print myMatrix[0]
#按照列切片 (输出矩阵的列)
print myMatrix.T[0]
#矩阵的复制
myMatrixCopy = myMatrix.copy()
print myMatrixCopy
#矩阵的比较
print myMatrix < myMatrix.T
```
输出结果为：
```python
矩阵的行列数为: 3 3
[[1 2 3]]
[[1 4 7]]
[[1 2 3]
 [4 5 6]
 [7 8 9]]
[[False  True  True]
 [False False  True]
 [False False False]]
```
本文章全部代码为：
```python
# -*- coding: utf-8 -*-
import numpy as np
# 创建3x5的全0矩阵
myZero = np.zeros([3, 5])
print myZero
# 创建3x5的全1矩阵
myOnes = np.ones([3, 5])
print myOnes
# 3x4的0~1之间的随机数矩阵
myRand = np.random.rand(3, 4)
print myRand
# 3x3的单位矩阵
myEye = np.eye(3)
print myEye
# 矩阵求和
print myZero + myOnes
# 矩阵求差
print myZero - myOnes
# 创建矩阵
myMatrix = np.mat([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
print myMatrix
# 矩阵乘以常数
print 10 * myMatrix
# 矩阵所有元素求和
print np.sum(myMatrix)
# 矩阵乘法
# 当维度相同的时候，为各个位置对应元素的乘积
# 当矩阵的维度不同时，会根据一定的广播规则将维数扩充到一致的形式
myMatrix2 = 2 * myMatrix
print myMatrix2
print np.multiply(myMatrix, myMatrix2)
# 矩阵的幂
print np.power(myMatrix, 2)
myMatrix3 = np.mat([[1], [2], [3]])
print(myMatrix3)
print myMatrix * myMatrix3
#矩阵的转置
print myMatrix
print myMatrix.T
print myMatrix.transpose()
##矩阵的其他操作：行列数、切片、复制、比较
[m, n] = myMatrix.shape
print "矩阵的行列数为:", m, n
# 按照行切片（输出矩阵的行）
print myMatrix[0]
#按照列切片 (输出矩阵的列)
print myMatrix.T[0]
#矩阵的复制
myMatrixCopy = myMatrix.copy()
print myMatrixCopy
#矩阵的比较
print myMatrix < myMatrix.T
```
