---
icon: page
author: xkrivzooh
date: 2020-06-18
category:
  - post
tag:
  - leetcode
---

# leetcode-28 实现strStr()

题目描述:

给定一个 haystack 字符串和一个 needle 字符串，在 haystack 字符串中找出 needle 字符串出现的第一个位置 (从0开始)。如果不存在，则返回  -1。

来源：力扣（LeetCode）
链接：https://leetcode-cn.com/problems/implement-strstr
著作权归领扣网络所有。商业转载请联系官方授权，非商业转载请注明出处。

我的第一版答案：

```java
class Solution {
    public int strStr(String haystack, String needle) {
        if (haystack == null) return 0;
        if (needle == null) return 0;
        int haystackLength = haystack.length();
        int needleLength = needle.length();
        if (needleLength > haystackLength) {
            return -1;
        }
        
        for (int i = 0; i < (haystack.length() - needleLength + 1); i++) {
            int j =0;
            while(j < needleLength) {
                if (haystack.charAt(i + j) == needle.charAt(j)) {
                    j ++;
                } else {
                    break;
                }
            }
            if (j == needleLength) {
                return i;
            }
        }
        return -1;
    }
}
```

<!-- @include: ../scaffolds/post_footer.md -->
