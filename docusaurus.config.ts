import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const config: Config = {
  title: 'OpenAtom 铜锁/Tongsuo',
  tagline: '现代密码学算法和安全通信协议的开源基础密码库',
  favicon: 'img/logo-white.png',

  // Set the production url of your site here
  url: process.env.URL || 'https://tongsuo.net',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  // baseUrl: '/docs',
  baseUrl: process.env.BASEURL || '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Tongsuo-Project', // Usually your GitHub org/user name.
  projectName: 'Tongsuo', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-cn',
    locales: ['zh-cn', 'en'],
  },
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          // routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/Tongsuo-Project/docs/tree/main',
        },
        blog: {
          showReadingTime: true,
          blogSidebarTitle: 'All posts',
          blogSidebarCount: 'ALL',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/Tongsuo-Project/docs/tree/main',
        },
        // pages: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themes: [
    [
      "@easyops-cn/docusaurus-search-local",
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        hashed: true,
        language: ["en", "zh"],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      }),
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    announcementBar: {
      id: 'announcementBar-star', // Increment on change
      content: `⭐ 如果您正在使用铜锁/Tongsuo 那么请在 <a target="_blank" rel="noopener noreferrer" href="https://github.com/Tongsuo-Project/Tongsuo/issues/597">GitHub</a> 上告诉我们`,

    },
    navbar: {
      logo: {
        alt: 'Tongsuo Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: '📑 文档',
        },
        {to: '/blog', label: '🌐 博客', position: 'left'},
        {to: '/docs/minisuo', label: '铜锁迷你版', position: 'right'},
        {to: '/docs/eco', label: '生态合作', position: 'right'},
        {to: '/docs/release-note', label: '版本发布', position: 'right'},
        {to: '/docs/developers/community', label: '社区', position: 'right'},
        {href: 'https://www.yuque.com/tsdoc/api', label: 'API', position: 'right'},
        {
          href: 'https://github.com/Tongsuo-Project/Tongsuo',
          label: 'GitHub',
          position: 'right',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
        title: '文档',
        items: [{
            label: '📜 关于铜锁',
            to: '/docs',
        },{
            label: '🔖  文档贡献指南',
            to: '/docs/developers/docs-deployment',
        }],
      }, {
        title: '社区',
        items: [
        {
          html: `
            <a class="footer-link footer__link-item">
            📌 微信公众号 
              <img src="img/tongsuo-public-qr.jpg" class="footer-hover-image" />
            </a>
          `,
        },
        {
          label: '🔗 钉钉',
          href: 'https://qr.dingtalk.com/action/joingroup?code=v1,k1,xVyEWk6BdAnER48i9DR8r0C2im4bAF64/NyQW5fqOz0=&_dt_no_comment=1&origin=11? 郭旭东邀请你加入钉钉群聊铜锁社区交流群，点击进入查看详情',
        },],
      }, 
      {
        title: '更多',
        items: [{
          label: '🦀 RustyVault',
          href: `https://github.com/Tongsuo-Project/RustyVault`,
        }, {
          label: '📦 Crates',
          href: 'https://crates.io/crates/rusty_vault',
        }],
      },
    ],
    logo: {
      alt: 'OpenAtom Logo',
      src: 'img/atom-logo.svg',
      href: 'https://openatom.cn/',
      // width: 200,
    },
    copyright: `Copyright © 2021-${new Date().getFullYear()} OpenAtom Tongsuo Built with Docusaurus. <br/><a class="footer__link-item" href="https://beian.miit.gov.cn/">网站备案：京ICP备15032932号-36`,
    },
    prism: {
      additionalLanguages: [
        'java',
        'latex',
        'haskell',
        'matlab',
        'go',
        'bash',
        'diff',
        'json',
        'scss',
        'rust',
        'nginx',
        'php',
      ],
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
