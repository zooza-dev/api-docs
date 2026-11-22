// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  mainSidebar: [
    {
      type: 'doc',
      id: 'concepts',
      label: 'Concepts & glossary',
    },
    {
      type: 'doc',
      id: 'quickstart',
      label: 'Quickstart',
    },
    {
      type: 'doc',
      id: 'make-up-sessions',
      label: 'Make-up sessions',
    },
    {
      type: 'doc',
      id: 'ai-assistants',
      label: 'AI assistants & MCP',
    },
    {
      type: 'category',
      label: 'Examples',
      link: { type: 'doc', id: 'examples/index' },
      items: [
        'examples/design-gallery',
        'examples/multi-step-trial-booking',
        'examples/branded-booking-tiles',
        'examples/age-tabs',
        'examples/block-packages',
        'examples/parent-zone',
        'examples/contact-lead-forms',
        'examples/checkout-passes',
        'examples/calendar-designs',
        'examples/location-map',
        'examples/filtered-timetable',
        'examples/custom-catalogue',
        'examples/chatbot-logged-in-client',
        'examples/wordpress-plugin',
      ],
    },
    {
      type: 'category',
      label: 'Widgets',
      link: { type: 'doc', id: 'widgets/index' },
      items: [
        'widgets/embed-methods',
        'widgets/registration-widget',
        'widgets/calendar-widget',
        'widgets/map-widget',
        'widgets/profile-widget',
        'widgets/video-widget',
        'widgets/checkout-widget',
        'widgets/contact-widget',
        {
          type: 'category',
          label: 'Deprecated',
          collapsed: true,
          items: [
            'widgets/deprecated/checkout-widget-v2',
            'widgets/deprecated/map-widget-v2',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'API',
      link: { type: 'doc', id: 'api/index' },
      items: [
        'api/getting-started',
        'api/authentication',
        'api/access-and-rate-limits',
        'api/errors',
        'api/error-codes',
        'api/preflight-check',
        'api/keys',
        {
          type: 'category',
          label: 'Guides',
          collapsed: false,
          items: ['api/guides/find-registrations', 'api/guides/change-a-registration', 'api/guides/cancel-a-registration', 'api/guides/set-up-a-term'],
        },
        {
          // Rendered by Scalar from static/zooza_api_v3.json (see docusaurus.config.js).
          type: 'link',
          label: 'API reference',
          href: '/api/reference',
        },
      ],
    },
    {
      type: 'doc',
      id: 'enums',
      label: 'Enums reference',
    },
  ],
};

module.exports = sidebars;
