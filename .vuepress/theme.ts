import {hopeTheme} from "vuepress-theme-hope";
import navbar from "./navbar.js";
import sidebar from "./sidebar.js";

export default hopeTheme({
  hostname: "https://wenchao.ren",

  author: {
    name: "xkrivzooh",
    url: "https://wenchao.ren",
  },

  //https://vuepress-theme-hope.gitee.io/v2/zh/guide/interface/icon.html#iconfont
  iconAssets: "iconfont",

  logo: "/logo.svg",

  repo: "xkrivzooh/wenchao.ren",

  docsDir: "demo/src",

  // navbar
  navbar: navbar,

  // sidebar
  sidebar: sidebar,

  footer: "<a href=\"https://beian.miit.gov.cn/\" target=\"_blank\">京ICP备2022013263号-1</a>",

  displayFooter: true,

  pageInfo: ["Author", "Original", "Date", "Category", "Tag", "ReadingTime"],

  blog: {
    description: "我如同永不老去的时光,奔腾不停,只渴望在某一天能找到属于自己的辉煌,如同蜗牛终将爬上金字塔的塔顶,欣赏大地第一缕阳光,沐浴人间第一丝温暖",
    intro: "/aboutMe.html",
    medias: {
      // Baidu: "https://example.com",
      // Bitbucket: "https://example.com",
      // Dingding: "https://example.com",
      // Discord: "https://example.com",
      // Dribbble: "https://example.com",
      // Email: "https://example.com",
      // Evernote: "https://example.com",
      // Facebook: "https://example.com",
      // Flipboard: "https://example.com",
      // Gitee: "https://example.com",
      GitHub: "https://github.com/xkrivzooh",
      // Gitlab: "https://example.com",
      // Gmail: "https://example.com",
      // Instagram: "https://example.com",
      // Lines: "https://example.com",
      // Linkedin: "https://example.com",
      // Pinterest: "https://example.com",
      // Pocket: "https://example.com",
      // QQ: "https://example.com",
      // Qzone: "https://example.com",
      // Reddit: "https://example.com",
      // Rss: "https://example.com",
      // Steam: "https://example.com",
      // Twitter: "https://example.com",
      // Wechat: "https://example.com",
      Weibo: "https://weibo.com",
      // Whatsapp: "https://example.com",
      // Youtube: "https://example.com",
      Zhihu: "https://zhihu.com",
    },
  },

  encrypt: {
    config: {
      "/guide/encrypt.html": ["1234"],
    },
  },

  plugins: {
    blog: {
      autoExcerpt: true,
    },

    // 如果你不需要评论，可以直接删除 comment 配置，
    // 以下配置仅供体验，如果你需要评论，请自行配置并使用自己的环境，详见文档。
    // 为了避免打扰主题开发者以及消耗他的资源，请不要在你的正式环境中直接使用下列配置!!!!!
    comment: {
      /**
       * Using Giscus
       */
      provider: "Giscus",
      repo: "vuepress-theme-hope/giscus-discussions",
      repoId: "R_kgDOG_Pt2A",
      category: "Announcements",
      categoryId: "DIC_kwDOG_Pt2M4COD69",

      /**
       * Using Twikoo
       */
      // provider: "Twikoo",
      // envId: "https://twikoo.ccknbc.vercel.app",

      /**
       * Using Waline
       */
      // provider: "Waline",
      // serverURL: "https://vuepress-theme-hope-comment.vercel.app",
    },

    mdEnhance: {
      //https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/intro.html#%E5%90%AF%E7%94%A8-markdown-%E5%A2%9E%E5%BC%BA
      enableAll: false,

      // 添加选项卡支持
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/tabs.html
      tabs: true,

      // 添加代码块分组支持
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/code-tabs.html#%E9%85%8D%E7%BD%AE
      codetabs: true,

      // 添加支持图表
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/chart.html
      chart: false,
      // 添加echarts支持
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/echarts.html
      echarts: true,
      // 添加Mermaid支持，类似plantuml的东西
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/mermaid.html
      mermaid: true,
      // 支持流程图
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/flowchart.html
      flowchart: true,
      // 添加tex语法支持（数学符号相关）
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/tex.html
      tex: false,
      // 启用下角标
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/sup-sub.html#%E9%85%8D%E7%BD%AE
      sub: false,
      // 启用上角标
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/sup-sub.html#%E9%85%8D%E7%BD%AE
      sup: false,
      // 前端代码示例演示支持
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/demo.html
      demo: false,
      // 支持任务列表
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/tasklist.html
      tasklist: true,
      // 启用图片标记
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/image.html#%E9%85%8D%E7%BD%AE
      imageMark: true,
      // 启用图片大小
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/image.html#%E9%85%8D%E7%BD%AE
      imageSize: true,
      // 支持导入其他文件
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/include.html#%E9%85%8D%E7%BD%AE
      include: false,
      // Markdown 元素添加属性
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/attrs.html
      attrs: false,

      // 支持幻灯片
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/presentation.html
      presentation: false,
      //presentation.plugins 接收一个字符串数组，可以自由配置是否启用一些预设的插件。
      // presentation: {
      //   plugins: ["highlight", "math", "search", "notes", "zoom"],
      // },

      // 支持标记
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/mark.html
      mark: true,

      // 样式化
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/stylize.html
      stylize: [
        // 选项
      ],

      // Markdown 文件支持脚注
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/footnote.html
      footnote: false,

      // 添加提示、注释、信息、注意、警告和详情自定义容器的支持
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/container.html
      container: true,

      // 自定义对齐
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/align.html
      align: false,
    },

    // 组件
    // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/components.html
    components: [
        "Badge"
    ]
  },

  //主题色选择器 https://vuepress-theme-hope.gitee.io/v2/zh/guide/interface/theme-color.html#%E4%B8%BB%E9%A2%98%E8%89%B2%E9%80%89%E6%8B%A9%E5%99%A8
  themeColor: {
    blue: "#2196f3",
    red: "#f26d6d",
    green: "#3eaf7c",
    orange: "#fb9b5f",
  },

  //全屏按钮：https://vuepress-theme-hope.gitee.io/v2/zh/guide/interface/others.html#%E5%85%A8%E5%B1%8F%E6%8C%89%E9%92%AE
  fullscreen: true,

  //深色模式 https://vuepress-theme-hope.gitee.io/v2/zh/guide/interface/darkmode.html
  darkmode: "switch",

  //纯净模式 https://vuepress-theme-hope.gitee.io/v2/zh/guide/interface/pure.html
  pure: false
});
