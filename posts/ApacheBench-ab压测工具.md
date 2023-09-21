---
icon: page
author: xkrivzooh
date: 2019-01-17
sidebar: false
category:
  - post
tag:
  - linux
---

# ApacheBench ab压测工具

## ab简介
ApacheBench 是 Apache服务器自带的一个web压力测试工具，简称ab。ab又是一个命令行工具，根据ab命令可以创建很多的并发访问线程，模拟多个访问者同时对某一URL地址进行访问，因此可以用来测试目标服务器的负载压力。

## 安装ab

```bash
sudo apt-get install apache2-utils  
```

## 参数列表

```bash
Usage: ab [options] [http[s]://]hostname[:port]/path
Options are:
    -n requests     Number of requests to perform   //请求链接数
    -c concurrency  Number of multiple requests to make at a time   //表示并发数
    -t timelimit    Seconds to max. to spend on benchmarking
                    This implies -n 50000
    -s timeout      Seconds to max. wait for each response
                    Default is 30 seconds
    -b windowsize   Size of TCP send/receive buffer, in bytes
    -B address      Address to bind to when making outgoing connections
    -p postfile     File containing data to POST. Remember also to set -T
    -u putfile      File containing data to PUT. Remember also to set -T
    -T content-type Content-type header to use for POST/PUT data, eg.
                    'application/x-www-form-urlencoded'
                    Default is 'text/plain'
    -v verbosity    How much troubleshooting info to print
    -w              Print out results in HTML tables
    -i              Use HEAD instead of GET
    -x attributes   String to insert as table attributes
    -y attributes   String to insert as tr attributes
    -z attributes   String to insert as td or th attributes
    -C attribute    Add cookie, eg. 'Apache=1234'. (repeatable)
    -H attribute    Add Arbitrary header line, eg. 'Accept-Encoding: gzip'
                    Inserted after all normal header lines. (repeatable)
    -A attribute    Add Basic WWW Authentication, the attributes
                    are a colon separated username and password.
    -P attribute    Add Basic Proxy Authentication, the attributes
                    are a colon separated username and password.
    -X proxy:port   Proxyserver and port number to use
    -V              Print version number and exit
    -k              Use HTTP KeepAlive feature
    -d              Do not show percentiles served table.
    -S              Do not show confidence estimators and warnings.
    -q              Do not show progress when doing more than 150 requests
    -l              Accept variable document length (use this for dynamic pages)
    -g filename     Output collected data to gnuplot format file.
    -e filename     Output CSV file with percentages served
    -r              Don't exit on socket receive errors.
    -h              Display usage information (this message)
    -Z ciphersuite  Specify SSL/TLS cipher suite (See openssl ciphers)
    -f protocol     Specify SSL/TLS protocol
                    (SSL3, TLS1, TLS1.1, TLS1.2 or ALL)
```

## 基本使用

### GET 压测

```bash
ab -n 100 -c 10 http://www.baidu.com/
```

- -n表示请求数
- -c表示并发数

样例输出为：

```bash
This is ApacheBench, Version 2.3 <$Revision: 1430300 $>
Copyright 1996 Adam Twiss, Zeus Technology Ltd, http://www.zeustech.net/
Licensed to The Apache Software Foundation, http://www.apache.org/

Benchmarking www.baidu.com (be patient).....done


Server Software:        BWS/1.1
Server Hostname:        www.baidu.com
Server Port:            80


Document Path:          /      #测试页面
Document Length:        112439 bytes     #测试页面大小

Concurrency Level:      10     #并发数
Time taken for tests:   1.256 seconds    #整个测试话费的时间
Complete requests:      100    #完成请求的总量
Failed requests:        96     #失败的请求次数
   (Connect: 0, Receive: 0, Length: 96, Exceptions: 0)
Write errors:           0
Total transferred:      11348660 bytes    #传输数据总大小
HTML transferred:       11253726 bytes    #传输页面总大小
Requests per second:    79.62 [#/sec] (mean)    #平均每秒请求数
Time per request:       125.593 [ms] (mean)     #平均每次并发10个请求的处理时间
Time per request:       12.559 [ms] (mean, across all concurrent requests)   #平均每个请求处理时间，所有并发的请求加一起
Transfer rate:          8824.29 [Kbytes/sec] received  #平均每秒网络流量

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        4   20   7.7     18      38
Processing:    18   90  50.5     82     356
Waiting:        4   22   7.9     22      41
Total:         22  111  50.7    101     384
#花费在连接Connect，处理Processing，等待Waiting的时间的最小min，平均值mean，标准差[+/-sd]，中值median，最大表max的一个表。

Percentage of the requests served within a certain time (ms)
  50%    101   #50%请求的响应时间在101ms内
  66%    103   #66%请求的响应时间在103ms内
  75%    104   #...以此类推
  80%    105
  90%    111
  95%    267
  98%    311
  99%    384
 100%    384 (longest request)
```
### 带自定义header请求:

```bash
ab -n 100 -H “Cookie: Key1=Value1; Key2=Value2” http://test.com/
```

### POST请求

```bash
ab -n 1 -c 1 -p 'post.txt' -T 'application/x-www-form-urlencoded'   http://192.168.188.6:8080/distributeLock2
```

- -p 用来做post数据的文件，这里此文件保存在ab同级目录下 
- -T 设置content-type值

<!-- @include: ../scaffolds/post_footer.md -->
