# Murasaki

Windows 98 风格的 React 组件库 — [`@murasaki/react98`](https://www.npmjs.com/package/@murasaki/react98)

- [Playground](https://zixing8284.github.io/murasaki/) · [文档](https://zixing8284.github.io/murasaki/programs/docs/)

## 这是什么

Murasaki 是一个忠实还原 Windows 98 美学的 React 组件库。它以 `@murasaki/react98` 发布到 npm，并驱动这个 Playground —— 一个完全运行在浏览器中的交互式 Windows 98 桌面。

## 为什么做这个

千禧年包裹着我童年的回忆。那些厚重的像素、经典的桌面、熟悉的开机音效，我想用 React 把它们复刻出来。
life is hard. 做这个项目本身让我很开心。

## 项目结构

- `packages/ui` — `@murasaki/react98` 组件库
- `packages/playground` — 演示
- `packages/docs` — 组件文档
- `packages/next-fixture` — Next.js 集成测试

## 本地跑起来

```bash
pnpm install          # 1. 安装依赖
pnpm ui:build:docs    # 2. 构建组件库、文档，并嵌入 playground
pnpm play             # 3. 启动 playground
```

文档单独开发：`pnpm docs:dev` → `http://localhost:3000/programs/docs/`

## 代码参考

源代码托管在 [GitHub](https://github.com/zixing8284/murasaki)。项目采用 pnpm workspace，包含四个包：UI 组件库、Playground 演示、Nextra 文档站，以及一个 Next.js 集成测试。

## 致谢

- [98.css](https://jdan.github.io/98.css/) — 样式来源
- [winclassic](https://github.com/tpenguinltg/winclassic) — 主题变量定义
- [React95](https://github.com/react95-io/React95) — 组件设计参考
- [daedalOS](https://github.com/DustinBrett/daedalOS) — 代码组织和设计
- [win99.dev](https://win99.dev/) — UI 样式参考
- [classic-stylesheets](https://github.com/nielssp/classic-stylesheets) — 主题资源

## License

MIT
