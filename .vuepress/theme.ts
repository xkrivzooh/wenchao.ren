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

  logo: "/logo.jpg",

  repo: "xkrivzooh/wenchao.ren",

  docsDir: "demo/src",

  // navbar
  navbar: navbar,

  // sidebar
  sidebar: sidebar,

  footer: "<a href=\"https://beian.miit.gov.cn/\" target=\"_blank\">京ICP备2022013263号-1</a>",

  displayFooter: true,

  pageInfo: ["Original", "Date", "Category", "Tag", "ReadingTime"],

  blog: {
    name: "被遗忘的博客",
    avatar: "/logo.jpg",
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
    //默认每个分页的文章数
    //https://vuepress-theme-hope.gitee.io/v2/zh/guide/blog/intro.html#%E5%A4%9A%E8%AF%AD%E8%A8%80%E6%94%AF%E6%8C%81
    articlePerPage: 10
  },

  encrypt: {
    config: {
      "/guide/encrypt.html": ["1234"],
    },
  },

  plugins: {
    blog: {
      //https://theme-hope.vuejs.press/zh/config/plugins/blog.html
      //是否生成摘要。
      excerpt: true,
      excerptLength: 200
    },

    prismjs: {
      light: 'vs',
      dark: 'cb',
    },

    // 如果你不需要评论，可以直接删除 comment 配置，
    // 以下配置仅供体验，如果你需要评论，请自行配置并使用自己的环境，详见文档。
    // 为了避免打扰主题开发者以及消耗他的资源，请不要在你的正式环境中直接使用下列配置!!!!!
    comment: {
      /**
       * Using Giscus
       */
      provider: "Giscus",
      repo: "xkrivzooh/wenchao.ren",
      repoId: "MDEwOlJlcG9zaXRvcnkzODI1MTc3MTA",
      category: "Announcements",
      categoryId: "DIC_kwDOFszBzs4CRV8V",


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

    feed: {
      //https://vuepress-theme-hope.gitee.io/v2/zh/guide/advanced/feed.html
      rss: true
    },
    mdEnhance: {
      //https://plugin-md-enhance.vuejs.press/zh/config.html

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
      // https://plugin-md-enhance.vuejs.press/zh/config.html#katex
      katex: false,
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
      // 启用 figure
      //https://plugin-md-enhance.vuejs.press/zh/guide/image.html
      figure: true,
      // 启用图片懒加载
      //https://plugin-md-enhance.vuejs.press/zh/guide/image.html
      imgLazyload: true,
      // 启用图片标记
      // https://plugin-md-enhance.vuejs.press/zh/guide/image.html
      imgMark: true,
      // 启用图片大小
      // https://plugin-md-enhance.vuejs.press/zh/guide/image.html
      imgSize: true,
      // 支持导入其他文件
      //https://theme-hope.vuejs.press/zh/guide/markdown/include.html#%E9%85%8D%E7%BD%AE
      include: true,
      // Markdown 元素添加属性
      //https://plugin-md-enhance.vuejs.press/zh/guide/attrs.html
      attrs: false,

      // 支持幻灯片
      // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/presentation.html
      presentation: false,
      //presentation.plugins 接收一个字符串数组，可以自由配置是否启用一些预设的插件。
      // presentation: {
      //   plugins: ["highlight", "math", "search", "notes", "zoom"],
      // },

      // 支持标记
      //https://theme-hope.vuejs.press/zh/guide/markdown/mark.html
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
      // https://plugin-md-enhance.vuejs.press/zh/guide/align.html
      align: true,

      // 开启卡片支持
      //https://plugin-md-enhance.vuejs.press/zh/guide/card.html
      card: true,
    },

    // 组件
    // https://vuepress-theme-hope.gitee.io/v2/zh/guide/markdown/components.html
    components: {
      components: ["Badge", "Share"]
    },

    // 版权信息
    // https://theme-hope.vuejs.press/zh/guide/feature/copyright.html
    copyright: {
      global: true,
      license: "私有版权协议：本站点所有内容，版权私有，除非明确授权，否则禁止一切形式的转载",
      canonical: "https://wenchao.ren",
      author: "xkrivzooh(https://wenchao.ren)",
      triggerLength: 20
    }
  },

  //全屏按钮：https://vuepress-theme-hope.gitee.io/v2/zh/guide/interface/others.html#%E5%85%A8%E5%B1%8F%E6%8C%89%E9%92%AE
  fullscreen: true,

  //深色模式 https://vuepress-theme-hope.gitee.io/v2/zh/guide/interface/darkmode.html
  darkmode: "switch",

  //纯净模式 https://vuepress-theme-hope.gitee.io/v2/zh/guide/interface/pure.html
  pure: false,

  // 全局禁用是否展示编辑此页链接
  // https://vuepress-theme-hope.gitee.io/v2/zh/guide/feature/meta.html#%E5%9F%BA%E4%BA%8E-git-%E7%9A%84%E4%BF%A1%E6%81%AF
  editLink: false,

  //全局禁用是否显示页面贡献者
  // https://vuepress-theme-hope.gitee.io/v2/zh/guide/feature/meta.html#%E5%9F%BA%E4%BA%8E-git-%E7%9A%84%E4%BF%A1%E6%81%AF
  contributors: false
});
