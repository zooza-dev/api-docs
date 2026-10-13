import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const CAPABILITIES = [
  {
    title: 'Booking & registration',
    text: 'Booking forms for classes and programmes, trial classes, waiting lists and capacity handling.',
  },
  {
    title: 'Make-up sessions',
    text: 'Make-up bookings with entitlement, capacity and expiry rules enforced for you.',
  },
  {
    title: 'Installments & subscriptions',
    text: 'Payment plans and recurring billing with Stripe and GoCardless integrations.',
  },
  {
    title: 'Accounting & integrations',
    text: 'Connect accounting, local payment systems, your own CRM, ERP or SMS gateway.',
  },
  {
    title: 'Listings, schedules & maps',
    text: 'Show active classes with filters, live schedules and branch or franchise maps.',
  },
  {
    title: 'Franchises & networks',
    text: 'Run multiple companies and brands as one connected network.',
  },
];

function PathCard({ title, description, to, cta }) {
  return (
    <Link to={to} className={styles.pathCard}>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className={styles.pathCardCta}>{cta} →</span>
    </Link>
  );
}

// Brand signature: teal heading with an orange hand-drawn underline on one word
function Underlined({ children }) {
  return (
    <span className={styles.underlined}>
      {children}
      <svg viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden="true">
        <path d="M2 9 C 40 3, 90 2, 130 5 S 180 9, 198 4" />
      </svg>
    </span>
  );
}

export default function Home() {
  return (
    <Layout
      title="Booking, make-up & payment infrastructure for class businesses"
      description="Build booking forms, make-up sessions, trials, installments and subscriptions on the Zooza API and widgets instead of building them from scratch. Free account, self-serve API access."
    >
      <main className={styles.homePage}>
        <header className={styles.homeHero}>
          <span className={styles.eyebrow}>Zooza for developers</span>
          <h1>
            Build on Zooza instead of from <Underlined>scratch</Underlined>
          </h1>
          <p>
            Ready-made infrastructure for children's activity schools, studios
            and franchises — booking, make-ups, trials, payments and
            integrations. Build your own website, forms and apps on the Zooza
            REST API and widgets.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.buttonPrimary} href="https://signup.zooza.online">
              Create a free account
            </a>
            <Link className={styles.buttonSecondary} to="/quickstart">
              Read the quickstart
            </Link>
          </div>
        </header>

        <section className={styles.section}>
          <h2>What you don't have to build</h2>
          <ul className={styles.capabilityGrid}>
            {CAPABILITIES.map(({ title, text }) => (
              <li key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Choose your integration path</h2>
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
        </section>

        <section className={styles.getStarted}>
          <h2>Get started in three steps</h2>
          <ol className={styles.steps}>
            <li>
              <span className={styles.stepNumber}>1</span>
              <h3>Create an account</h3>
              <p>
                Sign up for free at{' '}
                <a href="https://signup.zooza.online">signup.zooza.online</a>.
              </p>
            </li>
            <li>
              <span className={styles.stepNumber}>2</span>
              <h3>Get your keys</h3>
              <p>
                Use your widget key from the admin, or{' '}
                <Link to="/api/authentication">request a REST API key</Link>.
              </p>
            </li>
            <li>
              <span className={styles.stepNumber}>3</span>
              <h3>Build</h3>
              <p>
                Write the code yourself, or hand{' '}
                <a href="/llms.txt">llms.txt</a> and the{' '}
                <a href="/zooza_api_v1.yaml">OpenAPI spec</a> to your AI coding
                agent.
              </p>
            </li>
          </ol>
        </section>

        <p className={styles.homeFootnote}>
          New to Zooza? Learn the{' '}
          <Link to="/concepts">key concepts and terminology</Link> to understand
          how the platform works.
        </p>
      </main>
    </Layout>
  );
}
