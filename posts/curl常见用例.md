---
icon: page
author: xkrivzooh
date: 2020-06-04
sidebar: false
category:
  - post
tag:
  - linux
---

# curl常见用例

整理一下curl的常见用法，避免我用到一些我没记住的用例时在去到处找.


## http method

curl -XGET http://www.baidu.com
curl -XGET 'http://www.baidu.com?a=b&c=d'
curl -XPOST http://www.baidu.com

### 常见POST

#### JSON POST

```bash
curl --header "Content-Type: application/json" \
  --X POST \
  -d '{"username":"xyz","password":"xyz"}' \
  http://localhost:3000/api/login
```
设置cookie

```bash
curl -i -H "Application/json" -H "Content-type: application/json" -v --cookie "userName=xxx" -XPOST 'http://domain.com' -d '
{
  "code":"typecode2",
  "name": "typename2",
  "remark":"remark",
  "structures":[
    {
      “dimensionType":2
    },
    {
      "dimensionType": 3
    }
  ]
}'
```

也可以吧body放置在文件中post
```bash
curl -d "@data.json" -X POST http://localhost:3000/data
```
然后data.json文件中写json，比如：
```json
{
  "key1":"value1",
  "key2":"value2"
}
```

#### FORM POST

`application/x-www-form-urlencoded` is the default:
```bash
curl -d "param1=value1&param2=value2" -X POST http://localhost:3000/data
curl -d "param1=value1&param2=value2" -H "Content-Type: application/x-www-form-urlencoded" -X POST http://localhost:3000/data
curl -d "@data.txt" -X POST http://localhost:3000/data
```


## 文件下载

使用-o保存文件，类似于 wget 命令，比如下载 README 文本保存为 readme.txt 文件。如果你需要自定义文件名，可以使用-O自定使用 url 中的文件名。

```bash
curl -o readme.txt https://mirrors.nju.edu.cn/kali/README
```

下载文件会显示下载状态，如数据量大小、传输速度、剩余时间等。可以使用-s参数禁用进度表。

```bash
curl -o readme.txt https://mirrors.nju.edu.cn/kali/README -s
```

也可以使用--process-bar参数让进度表显示为进度条。

```bash
 curl -o readme.txt https://mirrors.nju.edu.cn/kali/README --progress-bar
 ```

### 断点续传下载

 cURL 作为强大的代名词，断点续传自然手到擒来，使用-C -参数即可。下面是断点续传下载 ubuntu20.04 镜像的例子
 ```bash
$ curl -O https://mirrors.nju.edu.cn/ubuntu-releases/20.04/ubuntu-20.04-desktop-amd64.iso --progress-bar
##                                                                                               1.7%
^C
$ curl -C - -O https://mirrors.nju.edu.cn/ubuntu-releases/20.04/ubuntu-20.04-desktop-amd64.iso --progress-bar
###                                                                                              2.4%
^C
$ curl -C - -O https://mirrors.nju.edu.cn/ubuntu-releases/20.04/ubuntu-20.04-desktop-amd64.iso --progress-bar
###                                                                                               2.7%
^C
 ```

 ### 下载限速
 使用 `--limit-rate`

 ```bash
 curl -C - -O https://mirrors.nju.edu.cn/ubuntu-releases/20.04/ubuntu-20.04-desktop-amd64.iso --limit-rate 100k
```

### 从FTP下载

```bash
curl -u user:password -O ftp://ftp_server/path/to/file/
```

## 显示response header

使用 `-i` 参数显示 Response Headers 信息。使用 `-I` 可以只显示 Response Headers 信息。

```bash
$ curl -I http://wttr.in
HTTP/1.1 200 OK
Server: nginx/1.10.3
Date: Sat, 30 May 2020 09:57:03 GMT
Content-Type: text/plain; charset=utf-8
Content-Length: 8678
Connection: keep-alive
Access-Control-Allow-Origin: *
```

但是换是推荐使用`-v`，这样请求和响应的header都会有了

## 文件长传

```bash
curl -F profile=@portrait.jpg https://example.com/upload
curl -F 'file=@"localfile";filename="nameinpost"' example.com/upload
```

## 网址通配

cURL 可以实现多个网址的匹配，你可以使用 {} 结合逗号分割来标识使用 url 中的某一段，也可以使用 [] 来表示范围参数。
```bash
# 请求 www.baidu.com 和  pan.baidu.com 和 fanyi.baidu.com
$ curl http://{www,pan,fanyi}.baidu.com
# 虚构网址1-10开头的baidu.com，然后请求
$ curl http://[1-10].baidu.com
# 虚构网址a-z开头的baidu.com，然后请求
$ curl http://[a-z].baidu.com
```


## curl 常见参数

```shell
- -#, --progress-bar Make curl display a simple progress bar instead of the more informational standard meter.
- -b, --cookie <name=data> Supply cookie with request. If no =, then specifies the cookie file to use (see -c).
- -c, --cookie-jar <file name> File to save response cookies to.
- -d, --data <data> Send specified data in POST request. Details provided below.
- -f, --fail Fail silently (don't output HTML error form if returned).
- -F, --form <name=content> Submit form data.
- -H, --header <header> Headers to supply with request.
- -i, --include Include HTTP headers in the output.
- -I, --head Fetch headers only.
- -k, --insecure Allow insecure connections to succeed.
- -L, --location Follow redirects.
- -o, --output <file> Write output to . Can use --create-dirs in conjunction with this to create any directories specified in the -o path.
- -O, --remote-name Write output to file named like the remote file (only writes to current directory).
- -s, --silent Silent (quiet) mode. Use with -S to force it to show errors.
- -v, --verbose Provide more information (useful for debugging).
- -w, --write-out <format> Make curl display information on stdout after a completed transfer. See man page for more details on available variables. Convenient way to force curl to append a newline to - output: -w "\n" (can add to ~/.curlrc).
- -X, --request The request method to use.
```


<!-- @include: ../scaffolds/post_footer.md -->
