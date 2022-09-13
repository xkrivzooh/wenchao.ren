---
icon: page
author: xkrivzooh
date: 2018-12-04
category:
  - post
tag:
  - java
---

# Java RSA非对称加密

最近的一个项目中，agent和master双方需要远程通信，但是需要双方认证以及传输的信息加密，因此就选择了RSA这个非对称加密算法实现了netty的handler。

##实现思路
简要的描述一下实现思路：


- 首先生成一对公钥和私钥
- 所有的master都使用这个私钥进行加密、解密
- 所有的agent都使用这个公钥进行加密和解密
- master发给agent的信息，使用私钥加密，master收到agent的信息，使用私钥解密
- agent发给master的信息，使用公钥加密，agent收到master的信息，使用公钥解密
- 无论是agent还是master，对收到的信息，只要解密失败，那么就丢弃

这样相当于实现了agent和master的认证，以及消息的加密传输。挺有意思的。
##生成公钥私钥

###使用java代码生成：
```java
   private static final String RSA = "RSA";
    public static KeyPair buildKeyPair() throws NoSuchAlgorithmException {
        final int keySize = 2048;
        KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance(RSA);
        keyPairGenerator.initialize(keySize);
        return keyPairGenerator.genKeyPair();
    }
    KeyPair keyPair = buildKeyPair();
    PublicKey pubKey = keyPair.getPublic();
    PrivateKey privateKey = keyPair.getPrivate();
```
###shell生成
我在这个项目实现中，是别生成了公钥文件和私钥文件，作为了工程的配置文件来用的，因此使用了shell的命令：

```bash
ssh-keygen -t rsa -b 2048 -C "any string"
openssl pkcs8 -topk8 -inform PEM -outform DER -in id_rsa -out private_key.der -nocrypt
openssl rsa -in id_rsa -pubout -outform DER -out public_key.der
```

命令解释：

- 第一条命令会生成2048位的rsa的公钥和私钥文件。这个2048可以自己修改，但是最小是1024，位数越大，加密越好，但是加密和解密的速度会更慢。在生成的过程中会询问你文件的路径，我是存放在了当前目录，因此当前目录下会有：<code>id_rsa</code>和<code>id_rsa.pub</code>这两个文件。
- 第二条命令生成java程序可用的私钥文件，其实就是将<code>id_rsa</code>转换为<code>PKCS#8</code>格式，这样java程序能够读取它
- 第三条命令生成java程序可用的公钥文件，其实以DER格式输出公钥部分，这样java程序可用读取它

这3条命令执行以后，当前目录下会有4个文件：
```
id_rsa          id_rsa.pub      private_key.der public_key.der

```
我们程序中使用的是后面2个，将其放在代码的<code>resources</code>目录下。
###RSA实现
关于rsa的java实现，直接给出代码吧：
```java
package com.qunar.qcloudagent.common.encrypt;
import com.google.common.base.Throwables;
import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
public class RSAUtil {
    private static final String RSA = "RSA";
    private static final PrivateKey PRIVATE_KEY = readPrivateKey(
            RSAUtil.class.getResource("/").getPath().concat("private_key.der"));
    private static Cipher cipher;
    private final static PublicKey PUBLIC_KEY = readPublicKey(
            RSAUtil.class.getResource("/").getPath().concat("public_key.der"));
    static {
        try {
            cipher = Cipher.getInstance(RSA);
        } catch (Exception e) {
            throw Throwables.propagate(e);
        }
    }
    public static byte[] encryptWithPrivateKey(byte[] message) throws Exception {
        cipher.init(Cipher.ENCRYPT_MODE, PRIVATE_KEY);
        return blockCipher(message, Cipher.ENCRYPT_MODE);
    }
    public static byte[] decryptWithPrivateKey(byte[] encrypted) throws Exception {
        cipher.init(Cipher.DECRYPT_MODE, PRIVATE_KEY);
        return blockCipher(encrypted, Cipher.DECRYPT_MODE);
    }
    public static byte[] encryptWithPublicKey(byte[] message) throws Exception {
        cipher.init(Cipher.ENCRYPT_MODE, PUBLIC_KEY);
        return blockCipher(message, Cipher.ENCRYPT_MODE);
    }
    public static byte[] decryptWithPublicKey(byte[] encrypted) throws Exception {
        cipher.init(Cipher.DECRYPT_MODE, PUBLIC_KEY);
        return blockCipher(encrypted, Cipher.DECRYPT_MODE);
    }
    private static PublicKey readPublicKey(String filename) {
        try {
            byte[] keyBytes = Files.readAllBytes(Paths.get(filename));
            X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
            KeyFactory kf = KeyFactory.getInstance(RSA);
            return kf.generatePublic(spec);
        } catch (Exception e) {
            throw Throwables.propagate(e);
        }
    }
    private static PrivateKey readPrivateKey(String filename) {
        try {
            byte[] keyBytes = Files.readAllBytes(Paths.get(filename));
            PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
            KeyFactory kf = KeyFactory.getInstance(RSA);
            return kf.generatePrivate(spec);
        } catch (Exception e) {
            throw Throwables.propagate(e);
        }
    }
    /**
     * 具体为啥这么做，请看文章：{@see http://coding.westreicher.org/?p=23}
     */
    private static byte[] blockCipher(byte[] bytes, int mode) throws IllegalBlockSizeException, BadPaddingException {
        // string initialize 2 buffers.
        // scrambled will hold intermediate results
        byte[] scrambled = new byte[0];
        // toReturn will hold the total result
        byte[] toReturn = new byte[0];
        // if we encrypt we use 100 byte long blocks. Decryption requires 128 byte long blocks (because of RSA)
        int length = (mode == Cipher.ENCRYPT_MODE) ? 100 : 128;
        // another buffer. this one will hold the bytes that have to be modified in this step
        byte[] buffer = new byte[length];
        for (int i = 0; i < bytes.length; i++) {
            // if we filled our buffer array we have our block ready for de- or encryption
            if ((i > 0) && (i % length == 0)) {
                //execute the operation
                scrambled = cipher.doFinal(buffer);
                // add the result to our total result.
                toReturn = append(toReturn, scrambled);
                // here we calculate the length of the next buffer required
                int newlength = length;
                // if newlength would be longer than remaining bytes in the bytes array we shorten it.
                if (i + length > bytes.length) {
                    newlength = bytes.length - i;
                }
                // clean the buffer array
                buffer = new byte[newlength];
            }
            // copy byte into our buffer.
            buffer[i % length] = bytes[i];
        }
        // this step is needed if we had a trailing buffer. should only happen when encrypting.
        // example: we encrypt 110 bytes. 100 bytes per run means we "forgot" the last 10 bytes. they are in the buffer array
        scrambled = cipher.doFinal(buffer);
        // final step before we can return the modified data.
        toReturn = append(toReturn, scrambled);
        return toReturn;
    }
    private static byte[] append(byte[] toReturn, byte[] scrambled) {
        byte[] destination = new byte[toReturn.length + scrambled.length];
        System.arraycopy(toReturn, 0, destination, 0, toReturn.length);
        System.arraycopy(scrambled, 0, destination, toReturn.length, scrambled.length);
        return destination;
    }
}
```
关于上面的代码有一点需要指出的是：<strong>RSA加密明文最大长度117字节，解密要求密文最大长度为128字节，所以在加密和解密的过程中需要分块进行。 RSA加密对明文的长度是有限制的，如果加密数据过大会抛出如下异常：Exception in thread "main" javax.crypto.IllegalBlockSizeException: Data must not be longer than 117 bytes</strong>。因此上面的<code>blockCipher</code>是用来专门处理这种情况的。

##参考文章

- [http://coding.westreicher.org/?p=23](http://coding.westreicher.org/?p=23)


