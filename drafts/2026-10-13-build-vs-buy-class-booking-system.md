---
# DRAFT for zooza-web blog (handoff api-docs-to-zooza-web-20261013-001).
# zooza-web owns final edit, frontmatter fields, hero image and translations.
title: "Build or buy a class booking system? What developers underestimate"
description: "Planning a custom booking system for a kids' activity school, studio or franchise? Here is what's hiding behind 'just a booking form' — make-ups, trials, payment plans, waiting lists — and when building it yourself still makes sense."
locale: en
tags: [developers, booking-system, api, make-up-sessions]
---

# Build or buy a class booking system? What developers underestimate

Sooner or later, every growing activity school hears the same idea: *"We have a developer. Why don't we build our own booking system?"* Sometimes the developer suggests it. Sometimes it comes from frustration with a tool that almost fits.

It's a fair question. A booking form looks like a weekend project: a list of classes, a form, a payment button. The trouble is that booking for **recurring classes** is a different problem from booking a haircut or a hotel room. Most of the cost hides in rules that only show up after launch.

This article walks through those rules so you can estimate honestly, and shows the middle path most teams end up preferring.

## The weekend version

Here's what usually gets built first:

- a list of classes with times and venues,
- a sign-up form for the child and the parent,
- a card payment,
- a confirmation email,
- an admin table of who signed up.

Two to four weeks for a good developer. It works on launch day. Then term starts.

## What shows up in the first term

### Make-up sessions

A child misses Tuesday's class. The parent wants to make it up on Thursday. Now you need:

- a record of which session was missed, and whether it was cancelled **in time**,
- a limit on how many make-ups each booking gets, sometimes scaled to the length of the term,
- expiry, and what happens to unused make-ups when the term ends: carry over, expire, or keep,
- rules on **where** a make-up can be used: same class, same programme, any venue, or a chosen subset,
- seats for make-ups in classes that are full for new sign-ups,
- a waiting list when nothing is free,
- protection against two parents grabbing the last seat at the same moment,
- emails at every step.

This one feature is often bigger than everything in the weekend version combined, and it never stops changing as the business refines its policy.

### Trial classes

Most activity businesses sell through trials. A trial has its own price, often free. It needs its own capacity, and a follow-up that turns it into a regular booking with the right payment plan. You'll also want to know your trial-to-enrolment rate, because that's the number the owner actually manages.

### Payment plans, not payments

Parents rarely pay once. They pay monthly, per term, in instalments, or by direct debit. Somebody joins three weeks late and expects a pro-rated price. Somebody's card fails. Siblings get a discount. The second term is invoiced automatically. Every one of these needs to be correct and visible to both the parent and the office, with invoices that satisfy the local accountant.

### Changes after booking

Children move classes. Families pause. Instructors fall ill and a session is cancelled, which should be credited, not turned into a make-up. A booking is copied into a second class for a sibling. Each change has to keep the money, the make-ups and the attendance consistent.

### Many venues, many brands

When the business opens a second venue or a franchise, the data model has to handle per-venue pricing, staff who see only their venue, and reporting across all of them.

## A rough estimate

| Area | Weekend version | What the business needs after a year |
|---|---|---|
| Class catalogue & sign-up | ✔ | Filters, age groups, waiting lists, capacity per class and per make-up |
| Payments | One card payment | Payment plans, direct debit, pro-rating, failed payments, invoices |
| Trials | – | Trial pricing, capacity, follow-up, conversion tracking |
| Make-ups | – | Earning rules, limits, expiry, scope, extra capacity, waiting list |
| Parent account | – | Bookings, payments, make-ups, cancellations, documents |
| Staff tools | Admin table | Attendance, messaging, reports, permissions per venue |

The weekend version is perhaps 5–10% of the final system. The rest is ongoing work as the business changes its policies every term.

## When building it yourself makes sense

Building is the right call when:

- **booking *is* your product.** You're a platform company, and the scheduling logic is your competitive edge,
- your model is genuinely unusual and no existing system's rules come close,
- you have a team that will maintain it for years, not a single contractor.

If none of these apply, you're paying to rebuild something that doesn't differentiate you.

## The middle path: build the experience, not the engine

Most teams don't really want to build make-up rules. They want a booking flow that looks and feels like their brand, a parent area that fits their site, and data flowing into their own CRM or app.

That's possible without owning the engine. With a platform like Zooza:

- **Widgets** handle booking, trials, maps, timetables and the parent zone, and you style them to your brand, down to [custom course and session tiles](https://docs.zooza.online/examples/branded-booking-tiles/).
- **The REST API** lets you build your own [catalogue](https://docs.zooza.online/examples/custom-catalogue/), [timetable](https://docs.zooza.online/examples/filtered-timetable/) or app on live data, with server-side credentials.
- **Make-ups, trials, payment plans and waiting lists** are enforced by the platform, so your code can't sell something the business doesn't offer. See [how make-up sessions work](https://docs.zooza.online/make-up-sessions/).
- **AI tools** plug in: your [website chatbot can know the logged-in parent](https://docs.zooza.online/examples/chatbot-logged-in-client/), and staff can run day-to-day tasks from Claude through the [Zooza MCP server](https://docs.zooza.online/ai-assistants/).

You keep full control over design and the customer journey, and you skip years of edge cases.

## A quick checklist before you decide

Answer these with the business owner, not alone:

1. How do make-ups work today, and how often has the policy changed in the last two years?
2. How many payment models do you sell (term, monthly, pay-as-you-go, instalments)?
3. Do you run trials, and who follows up on them?
4. How many venues will you have in three years?
5. Who will maintain the system when your developer moves on?

If the answers are "it's complicated", "several", "yes", "more than now" and "not sure", start with a platform and build on top of it.

## Getting started

Create a free account at [signup.zooza.online](https://signup.zooza.online), request a REST API key, and start from the [integration examples](https://docs.zooza.online/examples/). Every example comes with copy-paste code and a prompt for your AI coding agent.
