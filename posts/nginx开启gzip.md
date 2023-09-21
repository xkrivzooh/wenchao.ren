---
icon: page
author: xkrivzooh
date: 2019-02-27
category:
  - post
tag:
  - nginx
---

# nginx开启gzip

前几天看到一个nginx的文章，突然想到我还没有为我的博客的nginx开启gzip压缩呢。所以今天就弄了一下。

下面是我在nginx配置中增加的开启gzip相关的配置：

## nginx增加gzip配置

```bash
  #gzip
  gzip on;
  gzip_min_length 1k;
  gzip_buffers 4 32k;
  gzip_comp_level 4;
  gzip_types text/plain application/javascript application/x-javascript text/javascript text/xml text/css;
  gzip_vary on;
  gzip_disable "MSIE [1-6]\.";
```

然后重新使得nginx加载配置:

```bash
/usr/sbin/nginx -s reload
```

### gzip指令描述

- `gzip on` 这个指令用来控制开启或者关闭gzip模块，默认值为`gzip off`代表默认不开启gzip压缩
- `gzip_min_length 1k` 置允许压缩的页面最小字节数，页面字节数从header头中的`Content-Length`中进行获取。默认值: 0 ，不管页面多大都压缩
- `gzip_buffers 4 32k`  设置系统获取几个单位的缓存用于存储gzip的压缩结果数据流。 例如 `4 4k` 代表以4k为单位，按照原始数据大小以4k为单位的4倍申请内存。 `4 8k` 代表以8k为单位，按照原始数据大小以8k为单位的4倍申请内存默认值: `gzip_buffers 4 4k/8k` 如果没有设置，默认值是申请跟原始数据相同大小的内存空间去存储gzip压缩结果。
- `gzip_comp_level 4` gzip压缩级别，压缩级别 1-9，级别越高压缩率越大，当然压缩时间也就越长（传输快但比较消耗cpu）。默认值：1
- `gzip_types text/plain application/javascript application/x-javascript text/javascript text/xml text/css` 压缩类型，匹配MIME类型进行压缩.默认值: `gzip_types text/html` 也就是默认不对js/css文件进行压缩。需要注意的是此处不能使用通配符，比如:`text/*`,无论是否指定`text/html`, 这种类型的都会被压缩。
- `gzip_vary on` 和http头有关系，加个vary头，给代理服务器用的，有的浏览器支持压缩，有的不支持，所以避免浪费不支持的也压缩，所以根据客户端的HTTP头来判断，是否需要压缩
- `gzip_disable "MSIE [1-6]\."` 禁用IE6的gzip压缩，为了确保其它的IE6版本不出问题，所以建议加上gzip_disable的设置
- `gzip_proxied off | expired | no-cache | no-store | private | no_last_modified | no_etag | auth | any ...` 我没有配置这个选项。这个指令一般是Nginx作为反向代理的时候启用，根据某些请求和应答来决定是否在对代理请求的应答启用gzip压缩，是否压缩取决于请求头中的`Via`字段，指令中可以同时指定多个不同的参数，意义如下：
    - `expired` - 启用压缩，如果header头中包含 "Expires" 头信息
    - `no-cache` - 启用压缩，如果header头中包含 "Cache-Control:no-cache" 头信息
    - `no-store` - 启用压缩，如果header头中包含 "Cache-Control:no-store" 头信息
    - `private` - 启用压缩，如果header头中包含 "Cache-Control:private" 头信息
    - `no_last_modified` - 启用压缩,如果header头中不包含 "Last-Modified" 头信息
    - `no_etag` - 启用压缩 ,如果header头中不包含 "ETag" 头信息
    - `auth` - 启用压缩 , 如果header头中包含 "Authorization" 头信息
    - `any` - 无条件启用压缩


## 检测是否gzip生效

可以使用chrome的开发者试图中的`network`窗口看具体资源的请求，检查其中的response中的`Content-Encoding`。

或者使用`curl`命令来检测，一个样例：

```bash
~ » curl -I -H "Accept-Encoding: gzip, deflate" https://wenchao.ren
HTTP/1.1 200 Connection established

HTTP/1.1 200 OK
Server: nginx/1.12.2
Date: Wed, 27 Feb 2019 02:59:36 GMT
Content-Type: text/html
Last-Modified: Fri, 22 Feb 2019 12:58:41 GMT
Connection: keep-alive
Vary: Accept-Encoding
ETag: W/"5c6ff201-1cf51"
Content-Encoding: gzip
```


## 参考资料

- [Module ngx_http_gzip_module](http://nginx.org/en/docs/http/ngx_http_gzip_module.html)

<!-- @include: ../scaffolds/post_footer.md -->
