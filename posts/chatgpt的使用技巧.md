---
icon: page
author: xkrivzooh
sidebar: false
date: 2023-08-31
category:
  - post
tag:
  - chatgpt
---

# Tree-of-Thought

来自普林斯顿大学和Google DeepMind研究人员提出了一种全新的语言模型推理框架——[「思维树」](https://arxiv.org/pdf/2305.10601.pdf)（ToT Tree-of-Thought）。
ToT将当前流行的「思维链」方法泛化到引导语言模型，并通过探索文本（思维）的连贯单元来解决问题的中间步骤。
"Tree of Thoughts"(ToT)，通过提供具有连贯性的文本单元("thoughts")的探索，使语言模型能够进行有意识的决策过程，
考虑多个不同的推理路径并自我评估选择以决定下一步行动。

在论文的实验案例里，ChatGPT解决问题的成功率从 4% 提升到了 74%。"Tree of Thoughts"(ToT)框架通过维护一棵思维树，
每个思维是一条连贯的语言序列，作为问题求解的中间步骤，实现语言模型的有意识推理过程。
通过与搜索算法(如广度优先搜索或深度优先搜索)结合，允许系统性地探索思维树并进行前瞻和回溯。

TOT的方法和我们日常工作中解决复杂问题的思路有异曲同工之处，都是将复杂的任务拆解为一个个细小的简单任务去解决，
TOT就是把大任务用推理的方式拆解成一颗颗连续原子化的任务树，然后交给 ChatGPT 求解。
<!-- @include: ../scaffolds/post_footer.md -->
