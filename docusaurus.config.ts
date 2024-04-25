import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const config: Config = {
  title: '铜锁',
  tagline: 'Tongsuo are so cool',
  favicon: 'img/logo-white.png',

  // Set the production url of your site here
  url: process.env.URL || 'https://Tongsuo-Project.github.io/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  // baseUrl: '/docs',
  baseUrl: process.env.BASEURL || '/docs',

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
          routeBasePath: '/',
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
        pages: false,
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
          label: '文档',
        },
        {to: '/blog', label: '博客', position: 'left'},
        {to: '/release-note', label: '版本发布', position: 'right'},
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
      logo: {
        alt: 'OpenAtom Logo',
        src: 'img/atom-logo.svg',
        href: 'https://openatom.cn/',
        width: 200,
      },
      links: [
        {
            html: `
            <div style="text-align: center;">
            Tongsuo is a <a href="https://www.openatom.org/">OpenAtom Foundation</a> incubation project.
            <div>
              `,
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} OpenAtom Tongsuo Built with Docusaurus.`,
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
