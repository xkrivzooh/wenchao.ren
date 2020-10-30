---
title: Iterable和Iterator结合使用的一个小例子
toc: true
date: 2019-03-11 12:19:25
tags: ['java']
draft: false
---

这篇文章主要是记录一下使用Iterable和Iterator用作迭代处理的一个例子。基于这种模式可以很方便的实现
流式处理

```java
public class Array<T> implements Iterable<T> {
    T[] values;  // this contains the actual elements of the array

    // Constructor that takes a "raw" array and stores it
    public Array(T[] values) {
        this.values = values;
    }

    // This is a private class that implements iteration over the elements
    // of the list. It is not accessed directly by the user, but is used in
    // the iterator() method of the Array class. It implements the hasNext()
    // and next() methods.
    class ArrayIterator implements Iterator<T> {
        int current = 0;  // the current element we are looking at

        // return whether or not there are more elements in the array that
        // have not been iterated over.
        public boolean hasNext() {
            if (current < Array.this.values.length) {
                return true;
            } else {
                return false;
            }
        }

        // return the next element of the iteration and move the current
        // index to the element after that.
        public T next() {
            if (!hasNext()) {
                throw new NoSuchElementException();
            }
            return values[current++];
        }
    }

    // Return the value at a given index
    public T get(int index) {
        return values[index];
    }

    // Set the value at a given index
    public void set(int index, T value) {
        values[index] = value;
    }

    // Return the length of the array
    public int length() {
        return values.length;
    }

    // Return an iterator over the elements in the array. This is generally not
    // called directly, but is called by Java when used in a "simple" for loop.
    public Iterator<T> iterator() {
        return new ArrayIterator();
    }

    // This is just a sample program that can be run to show how the Array
    // class might be used.
    public static void main(String[] args) {
        // create an array of strings
        String[] strings = new String[]{"Hello", "World"};

        // create a new array to hold these strings
        Array<String> array = new Array<String>(strings);

        // get and print the first values (prints "Hello")
        System.out.println(array.get(0));

        // set the second value
        array.set(1, "Javaland!");

        // iterate over the array, printing "Hello\nJavaland!"
        for (String s : array) {
            System.out.println(s);
        }
    }
}
```
