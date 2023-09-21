---
icon: page
author: xkrivzooh
sidebar: false
date: 2022-08-30
category:
  - post
tag:
  - 杂记
---

# "使用utterances作为hugo博客评论插件"

之前我的博客使用的是`disqus`来做评论插件的，但是disqus实际上在国内不挂梯子的情况下是不能访问的，所以即便是我自己，绝大多数的时候是看不到评论的（虽然平时也确实没什么人评论）。

今天中午在浏览自己的订阅新闻时，看到了`utterances`：

[utterances 官网](https://utteranc.es/)

> A lightweight comments widget built on GitHub issues. Use GitHub issues for blog comments, wiki pages and more!
> - Open source. 🙌
> - No tracking, no ads, always free. 📡🚫
> - No lock-in. All data stored in GitHub issues. 🔓
> - Styled with Primer, the css toolkit that powers GitHub. 💅
> - Dark theme. 🌘
> - Lightweight. Vanilla TypeScript. No font downloads, JavaScript frameworks or polyfills for evergreen browsers. 🐦🌲

我基本上第一时间就觉的它就是我要找的东西，它的展示样式我很喜欢，访问性能很好，国内访问很快，最棒的是恰好和github整合在一起，而我的博客其实是基于`hugo`，内容也是部署在github上的，这样就恰好可以把评论内容使用github的issue来管理，而utterances很方便的帮我做到了这件事情，基本上把我使用disqus的痛点都给我解决了。

我的博客是在hugo的`zozo`主题的基础上进行魔改的，默认的zozo主题不支持utterances，我自己修改了一下zozo的代码，是的他支持了utterances，算下来一共修改了4个文件，增加了一个`utterances_comments.html`文件，修改了hugo的`single.html`和`archives.html`文件，也修改了hugo的`config.toml`文件。具体的修改代码如下：


简单代码改动如下：

- [add file: themes/zozo/layouts/partials/utterances_comments.html](https://github.com/xkrivzooh/wenchao.ren/commit/d81d5ba06fed5001a19463f157d6ea6f9b642356)

```html
<!-- valine -->
<div class="doc_comments">
    <div class="comments_block_title">发表评论</div>
    <div id="vcomments"></div>
</div>

<!--https://utteranc.es/-->
<link rel="stylesheet" href="{{ "/css/comments.css" | absURL }}" />

<script src="https://utteranc.es/client.js"
        repo="{{ .Site.Params.utteranc.repo }}"
        issue-term="{{ .Site.Params.utteranc.issueTerm }}"
        theme="{{ .Site.Params.utteranc.theme }}"
        crossorigin="{{ .Site.Params.utteranc.crossorigin }}"
        label="{{ .Site.Params.utteranc.label }}"
        async>
</script>
```
- [Update config.toml](https://github.com/xkrivzooh/wenchao.ren/commit/f8468205fe5061e857fea54185814fd34155015d)
```yml
- disqusShortname = "rollenholt"  ## disqus配置
+ [params.utteranc]         # utteranc is a comment + system based on GitHub issues. see https://utteranc.+ es
+   enable = true
+   repo = "xkrivzooh/wenchao.ren"    # The repo to + store comments
+   issueTerm = "pathname"
+   theme = "github-light"
+   crossorigin = "anonymous"
+   label = "comment"
```

- [Update single.html](https://github.com/xkrivzooh/wenchao.ren/commit/374d6a73b288f50efeb25cbb8a2d878c743e33d1)
```html
                <!-- 评论系统 -->
                {{ if .Site.Params.valine.enable }}
                {{ partial "comments.html" . }}
                {{ else if .Site.Params.utteranc.enable }}
                {{ partial "utterances_comments.html" . }}
                {{ else }}
                <div class="doc_comments">{{ template "_internal/disqus.html" . }}</div>
                {{ end }}
@@ -48,4 +50,4 @@ <h1><a href='{{ .RelPermalink }}'>{{ .Title }}</a></h1>
    {{ partial "js.html" . }}
</body>
```

- [Update archives.html](https://github.com/xkrivzooh/wenchao.ren/commit/093da8293433b7fd240d7a2321897f71c93a4e9b)
```html
@@ -44,7 +44,8 @@ <h3>{{ .Key }}</h3>
            <!-- 评论系统 -->
            {{ if .Site.Params.valine.enable }}
            {{ partial "comments.html" . }}

            {{ else if .Site.Params.utteranc.enable }}
            {{ partial "utterances_comments.html" . }}
            {{ else }}
            <div class="doc_comments">{{ template "_internal/disqus.html" . }}</div>
            {{ end }}
@@ -56,4 +57,4 @@ <h3>{{ .Key }}</h3>
{{ partial "js.html" . }}
</body>

```

最终的效果大家可以看文章底部评论区就行。我感觉还是可以的。
至于这个`utterances`只支持github登录，这一点不是问题，因为访问我的博客的人基本也就是程序员，一般都会有github的账号，其他人也不会浏览到我的网站，所以这个不是问题。

最后推荐你也试试。

<!-- @include: ../scaffolds/post_footer.md -->
