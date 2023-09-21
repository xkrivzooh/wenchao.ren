import {defineUserConfig} from "vuepress";
import theme from "./theme.js";
import {docsearchPlugin} from "@vuepress/plugin-docsearch";
import { rewardPlugin } from '@vuepress-denaro/vuepress-plugin-reward'

export default defineUserConfig({
    lang: "zh-CN",
    title: "被遗忘的博客",
    description: "被遗忘的博客, 记录一些学习记录、编程知识、架构设计、职场工作等",

    head: [['script', {}, `
  var _hmt = _hmt || [];
    (function() {
      var hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?9f0b43ac69981155fb20824043dc0563";
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
        rewardPlugin({
            btnText : '打赏',
            title : '给作者赏一杯咖啡吧',
            subTitle : '您的支持将是我继续更新下去的动力',
            rewardOption : [
                {
                    text: '微信',
                    url: '/WeChatPay.png', // ddd your picture to docs/.vuepress/public
                },
                {
                    text: '支付宝',
                    url: '/AliPay.png', // ddd your picture to docs/.vuepress/public
                },
            ],
        }),
    ],
});



