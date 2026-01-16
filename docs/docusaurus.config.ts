import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'BayarR',
  tagline: 'IDRX Paylink Mini-App',
  favicon: 'img/bayarr-logo.png',
  url: 'https://bayarr.app',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    image: 'img/bayarr-logo.png',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'BayarR',
      logo: {
        alt: 'BayarR logo',
        src: 'img/bayarr-logo.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/hafidluqman50/bayar-r',
        },
        {
          href: 'https://bayar-r.vercel.app/',
          label: 'Demo',
          position: 'right',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Project',
          items: [
            {
              label: 'Repository',
              href: 'https://github.com/hafidluqman50/bayar-r',
            },
            {
              label: 'Demo',
              href: 'https://bayar-r.vercel.app/',
        },
        {
          href: 'https://bayar-r.vercel.app/',
          label: 'Demo',
          position: 'right',
            },
          ],
        },
        {
          title: 'Build',
          items: [
            {
              label: 'Base Sepolia',
              href: 'https://sepolia.basescan.org',
            },
            {
              label: 'OnchainKit',
              href: 'https://docs.base.org/builderkits/onchainkit',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} BayarR`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
