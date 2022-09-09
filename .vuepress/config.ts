import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  lang: "zh-CN",
  title: "被遗忘的博客",
  description: "被遗忘的博客, 记录一些学习记录、编程知识、架构设计、职场工作等",

  base: "/",

  theme,
});
