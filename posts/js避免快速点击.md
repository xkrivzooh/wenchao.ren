---
icon: page
author: xkrivzooh
date: 2019-08-29
category:
  - post
tag:
  - js
---

# js避免快速点击

通过JavaScript避免按钮快速被点击，有一般都是通过修改状态，然后延迟恢复状态来弄的，demo如下：

```js
          onRefresh: function () {
                $("button[name='refresh']").attr('disabled', true);
                $('#jar-debug-table').bootstrapTable('removeAll');
                getAllClass();
                setTimeout(function () {
                    $("button[name='refresh']").attr('disabled', false);
                }, 3000);
            }
```
