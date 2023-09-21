---
icon: page
author: xkrivzooh
sidebar: false
date: 2023-08-31
category:
  - post
tag:
  - 杂记
---

# 为Giscus增加邮件通知功能

我的Blog是基于VuePress搭建的，评论使用的是Giscus。而Giscus 是一个基于 GitHub Discussion 的评论系统，
目前我在使用Giscus时遇到的最大的问题是，当有人在我的博客上进行评论的时候，我作为博客拥有者，并不能够收到相关的通知，
即便我在Github上设置GitHub Discussion相关的通知，我也只能当用户为新的文章创建第一条评论的时候收到邮件通知，
后续的delete、edit等操作，经过我实际测试是收不到邮件通知的。不排除未来Github的功能改进，但是至少在现阶段没有解决这个问题。


于是通过和ChatGPT的通力合作，我发现可以基于Github的webhook功能来实现评论通知的功能。Webhooks 是一种机制，
可以在某个事件发生时向指定的 URL 发送 HTTP 请求，因此可以利用它来实现评论通知功能。

## 配置Github的webhook

以下是实现该功能的步骤：

- 创建一个接收评论通知的服务器或者使用已有的服务器。 
- 在 GitHub 上打开你的仓库，点击仓库设置。 
- 在左侧菜单中选择 Webhooks。 
- 点击 "Add webhook" 创建一个新的 webhook。 
- 在 "Payload URL" 中填入你接收评论通知的服务器的 URL。 
- 选择你希望接收的事件类型，这里选择 "Discussion comments"和"Discussions"。 
- 点击 "Add webhook" 完成创建。

当有人在我的博客上进行评论时，GitHub 将会向我指定的 URL 发送一个 HTTP 请求，我的web server可以在接收到请求后进行相应的处理，例如发送邮件通知给我。


## 搭建web server处理webhook请求

我是使用Python3编写了一个简单的web server来处理相关的请求，代码如下：

```python
from flask import Flask, request
import requests
import logging
import smtplib
from email.mime.text import MIMEText

# 日志配置
LOG_FILE = 'webhook.log'
logging.basicConfig(filename=LOG_FILE, level=logging.INFO,
                   format='%(asctime)s - %(levelname)s - %(message)s')

# 邮件配置（需要你看着修改为自己的）
SMTP_SERVER = 'smtp.qq.com'
SMTP_PORT = 587
SMTP_USERNAME = '你的账号'
SMTP_PASSWORD = '你的密码'
SENDER_EMAIL = '发件人邮箱'
RECIPIENT_EMAIL = '收件人邮箱'


app = Flask(__name__)

@app.route('/your-webhook-endpoint', methods=['POST'])
def webhook():
   event = request.headers.get('X-GitHub-Event')
   signature = request.headers.get('X-Hub-Signature')
   payload = request.json


   # 验证签名，确保请求来自 GitHub
   # 这里需要根据你的实际情况进行签名验证的实现，笔者的场景不需要太精确的鉴权。

   logging.debug('receive event: %s, signature: %s, payload:[%s]', event, signature, payload)

   if event == 'issue_comment' or event == 'discussion_comment':
       comment = payload.get('comment')
       body = comment.get('body')
       user = comment.get('user').get('login')

       # 发送邮件通知
       send_email(user, body)

   return 'OK'


def send_email(user, comment):
   # 发送邮件的逻辑代码
   try:
       # 发送邮件的逻辑代码

       # 构造邮件内容
       subject = f"你的博客有来自[{user}]的新评论了"
       body = f"From User: {user}\n\n博客评论: {comment}"
       msg = MIMEText(body)
       msg['Subject'] = subject
       msg['From'] = SENDER_EMAIL
       msg['To'] = RECIPIENT_EMAIL

       # 发送邮件
       with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
           server.starttls()
           server.login(SMTP_USERNAME, SMTP_PASSWORD)
           server.send_message(msg)
       logging.info("邮件发送成功！")
   except Exception as e:
       logging.error("邮件发送失败：" + str(e))

if __name__ == '__main__':
   app.run(host='0.0.0.0', port=9999)
```

然后使用如下命令运行：`sudo python3 blog_webhook.py`

程序的运行日志会输出在脚本同目录下的`webhook.log`中。

## 配置邮件服务器

我是使用QQ邮箱作为我的邮件服务器来使用的，关于QQ邮件服务器的配置见QQ邮箱文档：[如何设置POP3/SMTP的SSL加密方式？](https://service.mail.qq.com/detail/0/310)。

当然你也可以自行替换为自己的邮件服务器。

## 正式部署Python脚本

在生产环境中，我们通常会使用一些工具来管理和监控后台服务，以确保服务的稳定运行。以下是将命令`sudo python3 blog_webhook.py`替换为可在生产环境使用的命令的一种方式：

1. 使用一个进程管理工具，如Supervisor或Systemd，来启动和监控后台服务。这些工具可以在服务器启动时自动启动服务，并在服务意外退出时自动重启服务。
2. 首先，确保你已经安装了Supervisor或Systemd。你可以使用以下命令来安装Supervisor：

```
sudo apt-get update
sudo apt-get install supervisor
```

或者使用以下命令来安装Systemd：

```
sudo apt-get update
sudo apt-get install systemd
```

3. 创建一个Supervisor配置文件或Systemd服务单元文件来定义你的后台服务。假设你的服务名为"blog_webhook"，
4. 你可以创建一个名为"blog_webhook.conf"的Supervisor配置文件，或者创建一个名为"blog_webhook.service"的Systemd服务单元文件。

对于Supervisor，你可以使用以下命令创建配置文件：

```
sudo nano /etc/supervisor/conf.d/blog_webhook.conf
```

然后在文件中添加以下内容：

```
[program:blog_webhook]
command=/usr/bin/python3 /path/to/blog_webhook.py
directory=/path/to/your/project
user=your_username
autostart=true
autorestart=true
redirect_stderr=true
```

对于Systemd，你可以使用以下命令创建服务单元文件：

```
sudo nano /etc/systemd/system/blog_webhook.service
```

然后在文件中添加以下内容：

```
[Unit]
Description=Blog Webhook Service
After=network.target

[Service]
ExecStart=/usr/bin/python3 /path/to/blog_webhook.py
WorkingDirectory=/path/to/your/project
User=your_username
Restart=always

[Install]
WantedBy=multi-user.target
```

请确保将上述命令中的`/path/to/blog_webhook.py`替换为你实际的脚本路径，将`/path/to/your/project`替换为你实际的项目路径，将`your_username`"替换为你实际的用户名。

4. 保存并关闭文件后，使用以下命令重新加载Supervisor配置文件或Systemd服务单元文件：

对于Supervisor，使用以下命令重新加载配置文件：

```
sudo supervisorctl reread
sudo supervisorctl update
```

对于Systemd，使用以下命令重新加载服务单元文件：

```
sudo systemctl daemon-reload
```

5. 启动你的后台服务：

对于Supervisor，使用以下命令启动服务：

```
sudo supervisorctl start blog_webhook
```

对于Systemd，使用以下命令启动服务：

```
sudo systemctl start blog_webhook
```

现在，你的后台服务将在服务器启动时自动启动，并在服务意外退出时自动重启。你可以使用Supervisor或Systemd的其他命令来管理和监控你的后台服务。

<!-- @include: ../scaffolds/post_footer.md -->
