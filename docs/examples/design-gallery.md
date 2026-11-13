---
title: Design gallery
description: See how Zooza widgets can look on your website — booking forms, parent zone, contact and lead forms, checkout, calendars and maps in playful, minimal and bold designs for three fictional businesses, each linked to copy-paste code.
sidebar_label: Design gallery
---

# Design gallery

Zooza widgets render inside your page and take on your design. Below, the same widgets are dressed for three **fictional** businesses, so you can see the range before you start. Every image links to the example with the code.

| Brand | Style | Business |
|---|---|---|
| **Little Movers** | Playful: plum and coral, rounded cards, soft shadows | Movement classes for babies and young children |
| **Studio Nord** | Minimal: off-white, serif headings, hairlines, square corners | Music and dance school |
| **Splash Academy** | Bold: navy and aqua, strong type, mobile first | Swim school with several pools |

export const Gallery = ({ items }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem', margin: '1rem 0 2rem' }}>
    {items.map((it) => (
      <a key={it.img} href={it.to} style={{ display: 'block', textDecoration: 'none', border: '1px solid var(--ifm-color-emphasis-200)', borderRadius: 8, overflow: 'hidden', background: 'var(--ifm-background-surface-color)' }}>
        <img src={it.img} alt={it.alt} loading="lazy" style={{ display: 'block', width: '100%', height: 'auto' }} />
        <span style={{ display: 'block', padding: '.6rem .8rem', fontWeight: 600, color: 'var(--ifm-font-color-base)' }}>{it.label}</span>
      </a>
    ))}
  </div>
);

## Parent zone (profile widget)

<Gallery items={[
  { img: '/img/examples/profile-dashboard-movers.png', to: '/examples/parent-zone/#variant-a-playful-dashboard-page', label: 'Playful dashboard · Little Movers', alt: 'Parent zone dashboard with child switcher, alerts, upcoming sessions and bookings' },
  { img: '/img/examples/profile-account-nord.png', to: '/examples/parent-zone/#variant-b-minimal-account-area-with-a-header-menu', label: 'Minimal account + header menu · Studio Nord', alt: 'Minimal account page with sidebar and header logout menu' },
  { img: '/img/examples/profile-mobile-splash.png', to: '/examples/parent-zone/#variant-c-mobile-first', label: 'Mobile first · Splash Academy', alt: 'Parent zone on a phone' },
]} />

## Contact and lead forms (contact widget)

<Gallery items={[
  { img: '/img/examples/contact-split-movers.png', to: '/examples/contact-lead-forms/#variant-a-split-landing-page-for-trial-enquiries', label: 'Split landing page · Little Movers', alt: 'Landing page with steps and an enquiry form card' },
  { img: '/img/examples/contact-footer-nord.png', to: '/examples/contact-lead-forms/#variant-b-minimal-footer-form', label: 'Minimal footer form · Studio Nord', alt: 'Dark footer with underline-only form' },
  { img: '/img/examples/contact-location-splash.png', to: '/examples/contact-lead-forms/#variant-c-one-form-per-venue-with-hidden-fields', label: 'Per-venue form + success state · Splash Academy', alt: 'Venue page with enquiry form and success message' },
]} />

## Booking forms (registration widget)

<Gallery items={[
  { img: '/img/examples/multi-step-trial-booking.png', to: '/examples/multi-step-trial-booking/', label: 'Multi-step trial booking', alt: 'Step tabs, age group tiles and trial sessions' },
  { img: '/img/examples/branded-booking-tiles.png', to: '/examples/branded-booking-tiles/', label: 'Branded course and class tiles', alt: 'Illustrated programme tiles and class tiles' },
  { img: '/img/examples/age-tabs.png', to: '/examples/age-tabs/', label: 'Age-group tabs', alt: 'Age tabs above classes' },
  { img: '/img/examples/block-packages.png', to: '/examples/block-packages/', label: 'Block packages with limits', alt: 'Blocks grouped by category with package switch' },
]} />

## Selling passes and vouchers (checkout widget)

<Gallery items={[
  { img: '/img/examples/checkout-pricing-movers.png', to: '/examples/checkout-passes/#variant-a-pricing-page-with-buy-buttons', label: 'Pricing page · Little Movers', alt: 'Three pricing cards with Buy buttons' },
  { img: '/img/examples/checkout-embedded-nord.png', to: '/examples/checkout-passes/#variant-b-product-page-with-the-checkout-embedded', label: 'Embedded checkout · Studio Nord', alt: 'Product page with an embedded checkout' },
  { img: '/img/examples/checkout-thankyou-splash.png', to: '/examples/checkout-passes/#variant-c-branded-thank-you-screen', label: 'Thank-you screen · Splash Academy', alt: 'Celebratory thank-you screen with next steps' },
]} />

## Timetables (calendar widget and REST API)

<Gallery items={[
  { img: '/img/examples/calendar-week-movers.png', to: '/examples/calendar-designs/#variant-a-colourful-week-view-with-filters', label: 'Week view with filters · Little Movers', alt: 'Colour-coded week view' },
  { img: '/img/examples/calendar-month-nord.png', to: '/examples/calendar-designs/#variant-b-classic-month-calendar', label: 'Month calendar · Studio Nord', alt: 'Classic month calendar with a cancelled session' },
  { img: '/img/examples/calendar-list-splash.png', to: '/examples/calendar-designs/#variant-c-one-venue-with-level-badges', label: 'One venue with level badges · Splash Academy', alt: 'Day-by-day pool timetable' },
  { img: '/img/examples/filtered-timetable.png', to: '/examples/filtered-timetable/', label: 'SEO timetable from the REST API', alt: 'Weekly timetable with filter chips' },
]} />

## Maps (map widget)

<Gallery items={[
  { img: '/img/examples/map-stacked-movers.png', to: '/examples/location-map/#design-variants', label: 'Stacked map · Little Movers', alt: 'Map with floating search and venue cards' },
  { img: '/img/examples/map-split-nord.png', to: '/examples/location-map/#design-variants', label: 'Split map and list · Studio Nord', alt: 'Monochrome map beside a studio list' },
  { img: '/img/examples/map-mobile-splash.png', to: '/examples/location-map/#design-variants', label: 'Mobile map · Splash Academy', alt: 'Map on a phone with venue details below' },
]} />

## More patterns

<Gallery items={[
  { img: '/img/examples/custom-catalogue.png', to: '/examples/custom-catalogue/', label: 'Custom catalogue on the REST API', alt: 'Programme catalogue with filters and class picker' },
  { img: '/img/examples/chatbot-logged-in-client.png', to: '/examples/chatbot-logged-in-client/', label: 'AI chatbot with the logged-in parent', alt: 'Parent zone with a chatbot' },
]} />

All brands, people and data on this page are fictional. The illustrations show how a page can be composed. Your widgets show your own programmes, prices and texts.
