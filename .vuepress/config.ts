import {defineUserConfig} from "vuepress";
import theme from "./theme.js";
import {docsearchPlugin} from "@vuepress/plugin-docsearch";

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
    //https://v2.vuepress.vuejs.org/reference/config.html#shouldprefetch
    shouldPrefetch: false,
    //https://v2.vuepress.vuejs.org/reference/config.html#shouldpreload
    shouldPreload: true,

    plugins: [
        docsearchPlugin({
            appId: '0W1V1MB9B4',
            apiKey: 'c8d2cf79295f61543cbe0b9c220f0af2',
            indexName: 'wenchao'
        }),
    ],
});


