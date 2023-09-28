import {navbar} from "vuepress-theme-hope";

//导航栏图标配置指南：https://theme-hope.vuejs.press/zh/guide/interface/icon.html
export default navbar([
    "/",
    // "/home",
    // { text: "使用指南", icon: "creative", link: "/guide/" },
    {
        text: "财富自由之路",
        icon: "free",
        prefix: "/financialFreedom/",
        children: [
            {
                text: "认知迭代",
                icon: "light",
                prefix: "/financialFreedom/cognitiveIteration",
                link: "cognitiveIteration/"
            },
            {
                text: "读懂财报",
                icon: "diagram",
                prefix: "/financialFreedom/financialStatements",
                link: "financialStatements/"
            },
            {
                text: "杂记",
                icon: "others",
                prefix: "/financialFreedom/others",
                link: "others/"
            }
        ]
    },
    {
        text: "技术专栏",
        icon: "stack",
        prefix: "/topics/",
        children: [
            {
                text: "技术文章推荐专栏",
                icon: "news",
                prefix: "/topics/recommendedArticles/",
                link: "recommendedArticles/"
            },
            {
                text: "dubbo",
                icon: "ability",
                prefix: "/topics/dubbo/",
                link: "dubbo/"
            },
            {
                text: "LeetCode",
                icon: "ability",
                prefix: "/topics/leetcode/",
                link: "leetcode/"
            }
        ]
    },
    // {
    //     text: "读书笔记",
    //     icon: "book",
    //     prefix: "/readingNotes/",
    //     children: [
    //         {
    //             text: "精准努力",
    //             icon: "book",
    //             prefix: "/readingNotes/jingzhunnuli/",
    //             link: "jingzhunnuli/"
    //         }
    //     ]
    // },
    {
        text: "公众号文章",
        icon: "command",
        link: "/gzh/"
    },
    {
        text: "方法论",
        icon: "light",
        link: "/methodology/"
    },
    // {
    //   text: "博文",
    //   icon: "edit",
    //   prefix: "/posts/",
    //   children: [
    //     {
    //       text: "文章 1-4",
    //       icon: "edit",
    //       prefix: "article/",
    //       children: [
    //         { text: "文章 1", icon: "edit", link: "article1" },
    //         { text: "文章 2", icon: "edit", link: "article2" },
    //         "article3",
    //         "article4",
    //       ],
    //     },
    //     {
    //       text: "文章 5-12",
    //       icon: "edit",
    //       children: [
    //         {
    //           text: "文章 5",
    //           icon: "edit",
    //           link: "article/article5",
    //         },
    //         {
    //           text: "文章 6",
    //           icon: "edit",
    //           link: "article/article6",
    //         },
    //         "article/article7",
    //         "article/article8",
    //       ],
    //     },
    //     { text: "文章 9", icon: "edit", link: "article9" },
    //     { text: "文章 10", icon: "edit", link: "article10" },
    //     "article11",
    //     "article12",
    //   ],
    // },
    {
        text: "关于",
        icon: "profile",
        link: "/about/"
    },
    // {
    //     text: "站内搜索",
    //     icon: "search",
    //     link: "https://wenchao.ren/search.html"
    // },
]);

