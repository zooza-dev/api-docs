import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function PathCard({ title, description, to, cta }) {
  return (
    <Link to={to} className={styles.pathCard}>
      <h2>{title}</h2>
      <p>{description}</p>
      <span className={styles.pathCardCta}>{cta} →</span>
    </Link>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title="Developer Docs"
      description="API and widget integration guides for the Zooza class management platform."
    >
      <main className={styles.homePage}>
        <div className={styles.homeHero}>
          <h1>Zooza Developer Documentation</h1>
          <p>
            Integrate Zooza into your website or build on top of the Zooza
            REST API. Choose your integration path below.
          </p>
        </div>

        <div className={styles.pathCards}>
          <PathCard
            title="Widgets"
            description="Embed booking forms, calendars, maps, and customer profiles directly on your website. No server code or authentication required — just a script tag."
            to="/widgets"
            cta="Get started with widgets"
          />
          <PathCard
            title="REST API"
            description="Full programmatic access to Zooza data. Build admin tools, custom customer journeys, automate workflows, or cache data to your site."
            to="/api"
            cta="Explore the API"
          />
        </div>

        <p className={styles.homeFootnote}>
          New to Zooza?{' '}
          <Link to="/quickstart">Read the quickstart guide</Link> — embed your
          first widget or make your first API call in minutes. Learn{' '}
          <Link to="/concepts">key concepts and terminology</Link> to understand
          how the platform works.
        </p>
      </main>
    </Layout>
  );
}
