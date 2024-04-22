---
sidebar_position: 1
---

# 文档贡献指南

## 本地开发

本文档站采用 [Docusaurus](https://docusaurus.io/) 构建。

### 要求

- [Node.js](https://nodejs.org/en/download/) 18.0 或更高版本（可以通过运行 `node -v` 来检查）。您可以使用 [nvm](https://github.com/nvm-sh/nvm) 在已安装的单台计算机上管理多个 Node 版本。

### 安装

```bash
yarn
```

### 本地开发

```bash
yarn start
```

该命令启动本地开发服务并打开浏览器窗口。大多数更改都会实时反映，无需重启服务器。

### 构建

```bash
yarn build
```

该命令会在 `build` 目录中生成静态内容，这些静态内容用户网站托管服务。

## 创建新文档

### 创建您的第一个文档

在 `docs/hello.md` 中创建一个 Markdown 文件：

```md title="docs/hello.md"
# Hello

This is my **first Docusaurus document**!
```

新页面就会在 [http://localhost:3000/docs/hello](http://localhost:3000/docs/hello) 中被看到。


### 配置侧边栏

Docusaurus 会自动从 `docs` 目录中**创建侧边栏**。

添加元数据以自定义侧边栏标签和位置：

```md title="docs/hello.md" {1-4}
---
sidebar_label: 'Hi!'
sidebar_position: 3
---

# Hello

This is my **first Docusaurus document**!
```

也可以在 `sidebars.js` 中显式创建侧边栏：

```js title="sidebars.js"
export default {
  tutorialSidebar: [
    'intro',
    // highlight-next-line
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
};
```

## 创建博客文章

Docusaurus 为每篇博文创建一个页面，还会自动创建一个**博客索引页面**、一个**标签系统**、一个 **RSS** feed...

### 创建您的第一篇博文

在 `blog` 中创建一个文件 `blog/2021-02-28-greetings.md`:

```md title="blog/2021-02-28-greetings.md"
---
slug: greetings
title: Greetings!
authors:
  - name: Joel Marcey
    title: Co-creator of Docusaurus 1
    url: https://github.com/JoelMarcey
    image_url: https://github.com/JoelMarcey.png
  - name: Sébastien Lorber
    title: Docusaurus maintainer
    url: https://sebastienlorber.com
    image_url: https://github.com/slorber.png
tags: [greetings]
---

Congratulations, you have made your first post!

Feel free to play around and edit this post as much as you like.
```

现在 http://localhost:3000/blog/greetings 上可以看到一篇新的博客文章。

## 翻译文档

本网站目前支持中英双语，通过以下步骤您可以帮助网站完成翻译工作。下面以翻译 `docs/intro.md` 文件为例：   

复制 `docs/intro.md` 文件到 `i18n/en` 文件夹：

```bash
mkdir -p i18n/en/docusaurus-plugin-content-docs/current/

cp docs/intro.md i18n/en/docusaurus-plugin-content-docs/current/intro.md
```

翻译 `i18n/fr/docusaurus-plugin-content-docs/current/intro.md` 文件为英语。

### 本地测试

运行以下命令启动英语本地化站点：

```bash
yarn run start -- --locale en
```

你的本地化站点现在可以在 [http://localhost:3000/en/](http://localhost:3000/en/) 访问，可以看到 `关于铜锁` 页面已经被翻译。

:::caution

开发环境下，只能启动一种语言的预览。

:::


