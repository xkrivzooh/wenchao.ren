---
icon: page
author: xkrivzooh
date: 2019-03-14
category:
  - post
tag:
  - java
---

# java中的zero copy

在web应用程序中，我们经常会在server和client之间传输数据。比如server发数据给client，server首先将数据从硬盘读出之后，然后原封不动的通过socket传输给client，大致原理如下：

```java
File.read(fileDesc, buf, len);
Socket.send(socket, buf, len);
```

下面的例子展示了传统的数据复制实现

```java
import java.io.DataOutputStream;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.Socket;
import java.net.UnknownHostException;

public class TraditionalClient {


	public static void main(String[] args) {

		int port = 2000;
		String server = "localhost";
		Socket socket = null;
		String lineToBeSent;

		DataOutputStream output = null;
		FileInputStream inputStream = null;
		int ERROR = 1;


		// connect to server
		try {
			socket = new Socket(server, port);
			System.out.println("Connected with server " +
					socket.getInetAddress() +
					":" + socket.getPort());
		}
		catch (UnknownHostException e) {
			System.out.println(e);
			System.exit(ERROR);
		}
		catch (IOException e) {
			System.out.println(e);
			System.exit(ERROR);
		}

		try {
			String fname = "sendfile/NetworkInterfaces.c";
			inputStream = new FileInputStream(fname);

			output = new DataOutputStream(socket.getOutputStream());
			long start = System.currentTimeMillis();
			byte[] b = new byte[4096];
			long read = 0, total = 0;
			while ((read = inputStream.read(b)) >= 0) {
				total = total + read;
				output.write(b);
			}
			System.out.println("bytes send--" + total + " and totaltime--" + (System.currentTimeMillis() - start));
		}
		catch (IOException e) {
			System.out.println(e);
		}

		try {
			output.close();
			socket.close();
			inputStream.close();
		}
		catch (IOException e) {
			System.out.println(e);
		}
	}
}
```


这种操作看起来可能不会怎么消耗CPU，但是实际上它是低效的。因为传统的 Linux 操作系统的标准 I/O 接口是基于数据拷贝操作的，即 I/O 操作会导致数据在操作系统内核地址空间的缓冲区和应用程序地址空间定义的缓冲区之间进行传输。如下图：


![Traditional data copying approach](http://wenchao.ren/img/2020/11/20190314131146.png)

- 数据首先被从磁盘读取到内核的`read buffer`中
- 然后在从内核的`read buffer`中复制到应用程序的buffer中
- 然后在从应用程序的buffer中复制到内核的`socket buffer`中
- 最后在从内核的`socket buffer`中复制到网卡中


然后其中涉及了4次上下文切换：

![Traditional context switches](http://wenchao.ren/img/2020/11/20190314131533.png)

分析上面的描述，我们可以看到`kernel buffer`其实在这个过程中充当了一个`ahead cache`。之所以引入这个`kernel buffer`其实是在很多的情况下是可以减少磁盘 I/O 的操作，进而提升效率的。

- 比如对于读请求，如果我们所请求的数据的大小小于`kernel buffer`并且如果要读取的数据已经存放在操作系统的高速缓冲存储器中，那么就不需要再进行实际的物理磁盘 I/O 操作。直接从`kernel buffer`中读取就好了。
- 对于写请求：利用这个`ahead cache`可以实现异步写操作

但是没有银弹，这样会带来一个问题就是，如果当我们请求的数据量的大小远大于`kernel buffer`的大小的话，这种情况下`kernel buffer`的存在反而会导致数据在`kernel buffer`和`用户缓冲区`之间多次复制。

## java中的zero copy

如果我们想在java中使用zero copy，我们一般会用`java.nio.channels.FileChannel`类中的`transferTo()`方法。下面是它的描述：

```java
  /**
     * Transfers bytes from this channel's file to the given writable byte
     * channel.
     *
     * <p> An attempt is made to read up to <tt>count</tt> bytes starting at
     * the given <tt>position</tt> in this channel's file and write them to the
     * target channel.  An invocation of this method may or may not transfer
     * all of the requested bytes; whether or not it does so depends upon the
     * natures and states of the channels.  Fewer than the requested number of
     * bytes are transferred if this channel's file contains fewer than
     * <tt>count</tt> bytes starting at the given <tt>position</tt>, or if the
     * target channel is non-blocking and it has fewer than <tt>count</tt>
     * bytes free in its output buffer.
     *
     * <p> This method does not modify this channel's position.  If the given
     * position is greater than the file's current size then no bytes are
     * transferred.  If the target channel has a position then bytes are
     * written starting at that position and then the position is incremented
     * by the number of bytes written.
     *
     * <p> This method is potentially much more efficient than a simple loop
     * that reads from this channel and writes to the target channel.  Many
     * operating systems can transfer bytes directly from the filesystem cache
     * to the target channel without actually copying them.  </p>
     *
     * @param  position
     *         The position within the file at which the transfer is to begin;
     *         must be non-negative
     *
     * @param  count
     *         The maximum number of bytes to be transferred; must be
     *         non-negative
     *
     * @param  target
     *         The target channel
     *
     * @return  The number of bytes, possibly zero,
     *          that were actually transferred
     *
     * @throws IllegalArgumentException
     *         If the preconditions on the parameters do not hold
     *
     * @throws  NonReadableChannelException
     *          If this channel was not opened for reading
     *
     * @throws  NonWritableChannelException
     *          If the target channel was not opened for writing
     *
     * @throws  ClosedChannelException
     *          If either this channel or the target channel is closed
     *
     * @throws  AsynchronousCloseException
     *          If another thread closes either channel
     *          while the transfer is in progress
     *
     * @throws  ClosedByInterruptException
     *          If another thread interrupts the current thread while the
     *          transfer is in progress, thereby closing both channels and
     *          setting the current thread's interrupt status
     *
     * @throws  IOException
     *          If some other I/O error occurs
     */
    public abstract long transferTo(long position, long count,
                                    WritableByteChannel target)
        throws IOException;
```

`transferTo()`方法把数据从file channel传输到指定的writable byte channel。它需要底层的操作系统支持zero copy。在UNIX和各种Linux中，会执行系统调用`sendfile()`，该命令把数据从一个文件描述符传输到另一个文件描述符(Linux中万物皆文件)：

```c
#include <sys/socket.h>
ssize_t sendfile(int out_fd, int in_fd, off_t *offset, size_t count);
```

因此传统的方式中的

```java
File.read(fileDesc, buf, len);
Socket.send(socket, buf, len);
```

可以被`transferTo()`替代。下面的图展示了使用`transferTo()`, 也就是zero copy技术后的流程：


![ Data copy with transferTo()](http://wenchao.ren/img/2020/11/20190314134601.png)

![Context switching with transferTo()](http://wenchao.ren/img/2020/11/20190314134614.png)


- `transferTo()`方法使文件内容被DMA引擎复制到读缓冲区中。 然后，内核将数据复制到与输出套接字关联的内核缓冲区中。
- 第三个副本发生在DMA引擎将数据从内核套接字缓冲区传递到协议引擎时。

这是一个很明显的进步：我们把context switch的次数从4次减少到了2次，同时也把data copy的次数从4次降低到了3次(而且其中只有一次占用了CPU，另外两次由DMA完成)。但是，要做到zero copy，这还差得远。

如果网卡支持`gather operation`，我们可以通过kernel进一步减少数据的拷贝操作。在2.4及以上版本的linux内核中，开发者修改了`socket buffer descriptor`来适应这一需求。这个方法不仅减少了context switch，还消除了和CPU有关的数据拷贝。使用层面的使用方法没有变，但是内部原理却发生了变化：

![Data copies when transferTo() and gather operations are used](http://wenchao.ren/img/2020/11/20190314134919.png)

- `transferTo()`方法使文件内容被DMA引擎复制到内核缓冲区中。
- 没有数据被复制到套接字缓冲区中。 相反，只有具有有关数据位置和长度信息的描述符才会附加到套接字缓冲区。 DMA引擎将数据直接从内核缓冲区传递到协议引擎，从而消除了剩余的最终CPU副本。

下面这个例子展示了如何使用`transferTo()`：

```java
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.SocketAddress;
import java.nio.channels.FileChannel;
import java.nio.channels.SocketChannel;

public class TransferToClient {
	
	public static void main(String[] args) throws IOException{
		TransferToClient sfc = new TransferToClient();
		sfc.testSendfile();
	}
	public void testSendfile() throws IOException {
	    String host = "localhost";
	    int port = 9026;
	    SocketAddress sad = new InetSocketAddress(host, port);
	    SocketChannel sc = SocketChannel.open();
	    sc.connect(sad);
	    sc.configureBlocking(true);

	    String fname = "sendfile/NetworkInterfaces.c";
	    long fsize = 183678375L, sendzise = 4094;
	    
	    // FileProposerExample.stuffFile(fname, fsize);
	    FileChannel fc = new FileInputStream(fname).getChannel();
            long start = System.currentTimeMillis();
	    long nsent = 0, curnset = 0;
	    curnset =  fc.transferTo(0, fsize, sc);
	    System.out.println("total bytes transferred--"+curnset+" and time taken in MS--"+(System.currentTimeMillis() - start));
	    //fc.close();
	  }
}
```


## 参考资料

- [Linux 中的零拷贝技术，第 1 部分](<https://www.ibm.com/developerworks/cn/linux/l-cn-zerocopy1/index.html>)
- [Linux 中的零拷贝技术，第 2 部分](<https://www.ibm.com/developerworks/cn/linux/l-cn-zerocopy2/index.html>)
- [Efficient data transfer through zero copy](https://developer.ibm.com/articles/j-zerocopy/)

<!-- @include: ../scaffolds/post_footer.md -->
