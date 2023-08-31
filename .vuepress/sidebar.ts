import { sidebar } from "vuepress-theme-hope";

// 侧边栏的配置文档：https://vuepress-theme-hope.gitee.io/v2/zh/guide/layout/sidebar.html#%E4%BE%8B%E5%AD%90
export default sidebar({
    "/guide/": "structure",
    "/recommendedArticles/": "structure",
    "/topics/dubbo/": "structure",
    "/topics/leetcode/": "structure",
    // "/readingNotes/jingzhunnuli/": "structure",
    "/financialFreedom/financialStatements/": "structure",
    "/financialFreedom/others/": "structure",
    "/methodology/": "structure",

    // "/posts/": "structure",

    // fallback
    // "/": [
    //     "about" /* /about.html */,
    // ],

});
