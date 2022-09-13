---
icon: page
author: xkrivzooh
date: 2020-11-02
category:
  - post
tag:
  - 杂记
---

# "使用GitHub Actions自动化部署博客到vps"

GitHub的Actions可以用来协助我们做一些自动化的事情。比如当博客仓库有提交时，自动将生成的html文件部署到vps机器上。
我主要是参考了文章：[利用 GitHub Actions 自动部署 Hugo 博客到自建 VPS](https://medium.com/@yestyle/%E5%88%A9%E7%94%A8-github-actions-%E8%87%AA%E5%8A%A8%E9%83%A8%E7%BD%B2-hugo-%E5%8D%9A%E5%AE%A2%E5%88%B0%E8%87%AA%E5%BB%BA-vps-fa3ed89c8573)

下面贴一下我的workflow配置：

```yml
# This is a basic workflow to help you get started with Actions

name: deploy to vps workflow

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
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2

      - name: Build
        run: |
          hugo --minify
      - name: Deploy
        run: |
          rsync -av --delete docs 用户@域名:路径
```
