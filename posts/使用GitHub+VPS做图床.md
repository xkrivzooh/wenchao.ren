---
icon: page
author: xkrivzooh
date: 2020-11-02
sidebar: false
category:
  - post
tag:
  - 杂记
---

# "使用GitHub+VPS做图床"

早期我是使用七牛做图床的，使用其实还是比较ok的，但是随着chrome的升级发现之前的图片加载不出来了。原因是出现`ERR_SSL_VERSION_OR_CIPHER_MISMATCH`。但是七牛的图床默认是http的，如果使用https是需要收费的。

我分析了一下我的现状：
- 大量使用GitHub
- 有自己的vps
- 博客图片公开，不需要私密
- 图片不能丢，最好数据可以自己维护

基于这几个原因，我采样了使用GitHub做图床。突然通过`Picgo`上传到GitHub的特定仓库上，并且给Picgo安装了rename插件：
[https://github.com/liuwave/picgo-plugin-super-prefix#readme](https://github.com/liuwave/picgo-plugin-super-prefix#readme)
这个插件还是功能比较足够的，我的配置为：`img/{y}/{m}/{timestamp}-{hash}-{origin}`

这样我就可以通过picgo来自动的将剪贴板中的图片上传到GitHub上。然后我又自己为GitHub的这个图床仓库设置了`workflow`。这样当有图片文件
被push到这个仓库的时候，workflow流程会自动的将图片文件夹通过`rsync`命令同步到vps的指定目录下。

下面贴一下我的workflow的文件：

```yml
# This is a basic workflow to help you get started with Actions

name: sync to vps workflow

# Controls when the action will run. Triggers the workflow on push events
# but only for the master branch
on:
  push:
    branches:
      - main

# A workflow run is made up of one or more jobs that can run sequentially or in parallel
jobs:
  # This workflow contains a single job called "build"
  build:
    # The type of runner that the job will run on
    runs-on: ubuntu-latest

    # Steps represent a sequence of tasks that will be executed as part of the job
    steps:
      # Checks-out your repository under $GITHUB_WORKSPACE, so your job can access it
      - uses: actions/checkout@v2
        with:
          submodules: 'recursive'

      # Use ssh-agent to cache ssh keys
      - uses: webfactory/ssh-agent@v0.2.0
        with:
          ssh-private-key: |
            ${{ secrets.BLOG_DEPLOY_KEY }}
      - name: Scan public keys
        run: |
          ssh-keyscan 域名 >> ~/.ssh/known_hosts
      - name: sync imgs
        run: |
          rsync -av --delete img 用户名@域名:VPS路径
```


<!-- @include: ../scaffolds/post_footer.md -->
