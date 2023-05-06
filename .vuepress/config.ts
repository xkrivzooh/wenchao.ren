import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  lang: "zh-CN",
  title: "被遗忘的博客",
  description: "被遗忘的博客, 记录一些学习记录、编程知识、架构设计、职场工作等",

  head: [['script', {}, `
  var _hmt = _hmt || [];
    (function() {
      var hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?92056b950ab8ccf389c1ae384bf62091";
      var s = document.getElementsByTagName("script")[0]; 
      s.parentNode.insertBefore(hm, s);
    })();
  `]],

  base: "/",

  theme,
  shouldPrefetch: false,
  shouldPreload: false,
});
