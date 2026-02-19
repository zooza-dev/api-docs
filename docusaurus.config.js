// @ts-check
const { themes: prismThemes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Zooza Developer Docs',
  tagline: 'API and widget integration guides for the Zooza platform',
  favicon: 'img/favicon.ico',
  url: 'https://docs.zooza.online',
  baseUrl: '/',

  organizationName: 'zooza',
  projectName: 'api-docs',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          editUrl: undefined,
          docItemComponent: '@theme/ApiItem',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.7,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
      }),
    ],
  ],

  plugins: [
    [
      'docusaurus-plugin-openapi-docs',
      {
        id: 'zoozaApi',
        docsPluginId: 'classic',
        config: {
          zoozaApi: {
            specPath: 'static/zooza_api_v1.yaml',
            outputDir: 'docs/api/reference',
            sidebarOptions: {
              groupPathsBy: 'tag',
              categoryLinkSource: 'tag',
            },
          },
        },
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          { from: '/api/endpoints', to: '/api/reference' },
        ],
      },
    ],
  ],

  themes: ['docusaurus-theme-openapi-docs'],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/social-card.png',

      navbar: {
        title: 'Zooza Docs',
        logo: {
          alt: 'Zooza',
          src: 'img/logo.svg',
          srcDark: 'img/logo-dark.svg',
        },
        items: [
          { to: '/quickstart', label: 'Quickstart', position: 'left' },
          { to: '/widgets', label: 'Widgets', position: 'left' },
          { to: '/api', label: 'API', position: 'left' },
          {
            href: 'https://app.zooza.com',
            label: 'Go to app',
            position: 'right',
          },
        ],
      },

      footer: {
        style: 'dark',
        links: [
          {
            title: 'Documentation',
            items: [
              { label: 'Quickstart', to: '/quickstart' },
              { label: 'Concepts', to: '/concepts' },
              { label: 'Widgets', to: '/widgets' },
              { label: 'API Reference', to: '/api' },
              { label: 'Enums', to: '/enums' },
            ],
          },
          {
            title: 'More',
            items: [
              { label: 'Zooza App', href: 'https://app.zooza.com' },
              { label: 'Zooza Website', href: 'https://zooza.online' },
              { label: 'Support', href: 'mailto:support@zooza.com' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Zooza. All rights reserved.`,
      },

      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['bash', 'php', 'json'],
      },

      // Algolia search — update appId and apiKey after reconfiguring the crawler
      algolia: {
        appId: 'YOUR_APP_ID',
        apiKey: 'YOUR_SEARCH_API_KEY',
        indexName: 'zooza_docs',
        contextualSearch: true,
        searchPagePath: 'search',
      },

      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
    }),
};

module.exports = config;
