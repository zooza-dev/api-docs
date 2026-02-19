import React from 'react';
import { useLocation } from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Head from '@docusaurus/Head';

// Schema.org JSON-LD injected on every documentation page.
// Provides TechArticle structured data for Google and BreadcrumbList for rich snippets.
export default function Root({ children }) {
  const { siteConfig } = useDocusaurusContext();
  const location = useLocation();

  const canonical = `${siteConfig.url}${location.pathname}`;

  const techArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    url: canonical,
    inLanguage: 'en',
    author: {
      '@type': 'Organization',
      name: 'Zooza',
      url: 'https://zooza.online',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Zooza',
      url: 'https://zooza.online',
    },
  };

  // Build breadcrumb from pathname segments
  const segments = location.pathname.replace(/\/$/, '').split('/').filter(Boolean);
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Docs',
      item: siteConfig.url + '/',
    },
    ...segments.map((seg, i) => ({
      '@type': 'ListItem',
      position: i + 2,
      name: seg.replace(/-/g, ' '),
      item: siteConfig.url + '/' + segments.slice(0, i + 1).join('/') + '/',
    })),
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  };

  return (
    <>
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(techArticleSchema)}
        </script>
        {segments.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify(breadcrumbSchema)}
          </script>
        )}
      </Head>
      {children}
    </>
  );
}
