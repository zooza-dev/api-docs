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

  trailingSlash: true,

  onBrokenLinks: 'throw',
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // Defensive gtag stub — prevents `window.gtag is not a function` when
  // googletagmanager.com is blocked (ad-blockers, tracking-protection) or
  // when the plugin's own bootstrap hasn't run (dev server, stale bundles).
  // Idempotent with @docusaurus/plugin-google-gtag's own snippet.
  headTags: [
    {
      tagName: 'script',
      attributes: {},
      innerHTML:
        "window.dataLayer = window.dataLayer || [];" +
        "if (typeof window.gtag !== 'function') {" +
        "  window.gtag = function () { window.dataLayer.push(arguments); };" +
        "}",
    },
  ],

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
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        gtag: {
          trackingID: 'G-96E3E87NS0',
          anonymizeIP: true,
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.7,
          ignorePatterns: ['/tags/**', '/search', '/search/'],
          filename: 'sitemap.xml',
        },
      }),
    ],
  ],

  plugins: [
    // /v3 API reference (DOC-20261118-001). Renders the generated /v3 document
    // (static/zooza_api_v3.json, made from openapi/ by `npm run api:generate`, spec DOC-20261120-001).
    [
      '@scalar/docusaurus',
      {
        label: 'API reference',
        route: '/api/reference',
        showNavLink: false,
        cdn: 'https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.76.4',
        configuration: {
          url: '/zooza_api_v3.json',
          hideTestRequestButton: true,
          hideClientButton: true,
          hideDownloadButton: false,
          documentDownloadType: 'json',
          hideModels: true,
          withDefaultFonts: false,
          telemetry: false,
          showDeveloperTools: 'never',
          showToolbar: 'never',
          agent: { disabled: true },
          mcp: { disabled: true },
          defaultHttpClient: { targetKey: 'shell', clientKey: 'curl' },
          hiddenClients: {
            c: true, clojure: true, csharp: true, dart: true, fsharp: true, go: true, http: true,
            java: true, js: true, kotlin: true, objc: true, ocaml: true, php: true, powershell: true,
            r: true, ruby: true, rust: true, swift: true,
            node: ['axios', 'ofetch', 'undici'],
            python: ['python3', 'httpx_sync', 'httpx_async'],
            shell: ['httpie', 'wget'],
          },
          customCss: `
            .scalar-app, .light-mode, .dark-mode {
              --scalar-font: 'DM Sans', system-ui, sans-serif;
              --scalar-radius: 5px;
              --scalar-radius-lg: 5px;
              --scalar-radius-xl: 5px;
            }
          `,
        },
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: [
          { from: '/api/endpoints', to: '/api/reference' },
          // Old reference pages (pre-/v3) → their /v3 operation, or the reference home.
          { from: '/api/reference/create-an-invoice-for-customer', to: '/api/reference#tag/invoices/POST/customer_invoices' },
          { from: '/api/reference/create-course', to: '/api/reference#tag/programmes/POST/courses' },
          { from: '/api/reference/create-new-events', to: '/api/reference#tag/sessions/POST/events' },
          { from: '/api/reference/create-new-extra-field', to: '/api/reference#tag/extra-fields/POST/extra_fields' },
          { from: '/api/reference/create-schedule', to: '/api/reference#tag/classes/POST/schedules' },
          { from: '/api/reference/events-for-given-date-range', to: '/api/reference#tag/calendar/GET/calendar' },
          { from: '/api/reference/get-agreement', to: '/api/reference#tag/agreements/GET/agreements/{ID}' },
          { from: '/api/reference/get-all-customer-invoices', to: '/api/reference#tag/invoices/GET/customer_invoices' },
          { from: '/api/reference/get-course-detail', to: '/api/reference#tag/programmes/GET/courses/{ID}' },
          { from: '/api/reference/get-customer-invoice', to: '/api/reference#tag/invoices/GET/customer_invoices/{ID}' },
          { from: '/api/reference/get-download-url-for-invoice', to: '/api/reference#tag/invoices/GET/customer_invoices/{ID}/download' },
          { from: '/api/reference/get-download-url-for-multiple-invoices-at-once', to: '/api/reference#tag/invoices/GET/customer_invoices/download' },
          { from: '/api/reference/get-event-detail-by-id', to: '/api/reference#tag/sessions/GET/events/{ID}' },
          { from: '/api/reference/get-list-events', to: '/api/reference#tag/sessions/GET/events' },
          { from: '/api/reference/get-list-of-courses', to: '/api/reference#tag/programmes/GET/courses' },
          { from: '/api/reference/get-list-of-schedules', to: '/api/reference#tag/classes/GET/schedules' },
          { from: '/api/reference/get-places-that-belong-to-a-company', to: '/api/reference#tag/company/GET/places' },
          { from: '/api/reference/get-schedules', to: '/api/reference#tag/classes/GET/schedules' },
          { from: '/api/reference/get-single-registration', to: '/api/reference#tag/registrations/GET/registrations/{ID}' },
          { from: '/api/reference/list-of-registrations', to: '/api/reference#tag/registrations/GET/registrations' },
          { from: '/api/reference/list-of-users', to: '/api/reference#tag/users/GET/users' },
          { from: '/api/reference/registration-detail', to: '/api/reference#tag/registrations/GET/registrations/{ID}' },
          { from: '/api/reference/registrations', to: '/api/reference#tag/registrations' },
          { from: '/api/reference/update-a-registrations-based-on-parameters-sent-in-body', to: '/api/reference#tag/registrations/PUT/registrations/{ID}' },
          { from: '/api/reference/update-course', to: '/api/reference#tag/programmes/PUT/courses/{ID}' },
          { from: '/api/reference/update-event', to: '/api/reference#tag/sessions/PUT/events/{ID}' },
          { from: '/api/reference/update-extra-field', to: '/api/reference#tag/extra-fields/PUT/extra_fields/{ID}' },
          { from: '/api/reference/update-schedule', to: '/api/reference#tag/classes/PUT/schedules/{ID}' },
          { from: '/api/reference/request-user-login-token', to: '/api/authentication' },
          ...['information-about-current-user', 'insert-payment', 'list-of-orders', 'order-detail', 'send-email-or-sms', 'zooza-api'].map((slug) => ({ from: `/api/reference/${slug}`, to: '/api/reference' })),
          { from: '/widgets/checkout-widget-v2', to: '/widgets/deprecated/checkout-widget-v2' },
        ],
      },
    ],
  ],

  themes: ['@docusaurus/theme-mermaid'],

  // Developer support chat: loads Intercom on click only (spec DOC-20261119-001)
  clientModules: ['./src/clientModules/supportChat.js'],

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
          { to: '/examples', label: 'Examples', position: 'left' },
          { to: '/widgets', label: 'Widgets', position: 'left' },
          { to: '/api', label: 'API', position: 'left' },
          {
            href: 'https://zooza.app',
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
              { label: 'Examples', to: '/examples' },
              { label: 'Widgets', to: '/widgets' },
              { label: 'API Reference', to: '/api' },
              { label: 'Enums', to: '/enums' },
            ],
          },
          {
            title: 'More',
            items: [
              { label: 'Zooza App', href: 'https://zooza.app' },
              { label: 'Zooza Website', href: 'https://zooza.online' },
              { label: 'Support', href: 'mailto:support@zooza.online' },
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

      algolia: {
        appId: 'G4L1X5YJDL',
        apiKey: '664f30b167ab43a3fe92115ab39c90b6',
        indexName: 'Zooza API Docs',
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
