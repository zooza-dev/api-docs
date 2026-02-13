---
title: Zooza Integration Introduction
description: Guidelines on how to approach the integration, best practices and tips.
authors:
  - Martin Rapavý
date: 2025-10-05
updated: 2025-12-05
---

# Introduction to Widgets

**Zooza widgets are the primary way your customers interact with your services online. Seamless integration ensures a smooth experience for both you and your clients. Widgets can be added easily using a WordPress plugin, a Wix plugin, or by pasting a snippet of JavaScript code into your website.**

However, this is just the beginning—Zooza offers unparalleled customization for both the appearance and behavior of each widget, giving your business a unique edge.

## Installation

You can integrate Zooza widgets using one of our official plugins for WordPress or Wix for quick and simple setup, or you can embed them manually. But before you install any widget on your website, consider how you want to use it. This mainly concerns the booking process. Other aspects of the integration are typically very straightforward.

### Minimum system requirements

- Your content management system needs to either be able to install our plugins (Wix, WordPress), or you need to be able to insert plain unfiltered JavaScript into your pages. Most modern systems allow this, but be sure to consult this with your system of choice.
- If you can't use JavaScript, you need to have admin rights to be able to install our plugins.
- Other than that, you're good to go as long as your website is served via HTTPS.

### Cookies & LocalStorage

Zooza is considered a necessary cookie and as such should be added to exceptions, so that it stays active even if a user declines all cookies within the cookie consent manager. Being unable to read and write cookies will break your website's functionality — people won't be able to access their customer profile or book sessions, so it is crucial to allow Zooza to run at all times.

Zooza uses these cookies:

- `token` - Customer's unique token
- `token-legacy` - Customer's unique token

Zooza additionally stores logged-in customer's data in localStorage so that it is available for website developers to display to the customer if required:

- `zooza_user` - Contains information about the logged-in user: `id`, `first_name`, `last_name`, `email`, `phone`, `avatar`

### Customer journey scenarios

How Your Customers Navigate to a Booking:

Via map
: Your main focal point is a map, where customers search for an address first. From there, they select their class and proceed directly to booking.

Via calendar of activities
: You have either one central calendar or more smaller calendars based on location or activity, and from there customers discover your programs and go to bookings.

Via landing pages
: Your website is built around landing pages for each activity or location. You want to provide a booking form directly on these pages, pre-filtered so customers just fill in their information.

Via single central booking form
: You have a centralized booking form that has a listing of all available classes. Customers already know where they want to book, and you just provide them with a single point where they can quickly navigate to a class of their choosing.

All of the above
: Many websites combine these approaches to create multiple pathways to a booking based on customer preferences.

## Types of widgets

[**Registration/Booking Widget**](registration-widget.md)  
:   Allows users to register or book services directly from your website.

[**Calendar Widget**](calendar-widget.md)  
:   Displays available dates and times for your classes and sessions.

[**Map Widget**](map-widget.md)  
:   Shows locations where your services are available and allows customers to search for a class based on the location.

[**Profile Widget**](profile-widget.md)  
:   Lets users view and manage their personal information and bookings.

[**Video Widget**](video-widget.md)  
:   Embeds video content related to your services.

[**Checkout Widget**](checkout-widget.md)  
:   Handles purchases for digital products and service orders.

### Installation options

!!! warning "Important"
    Remember, you can install as many widgets as you want but there is one general rule: **Only one widget per page**.

#### WordPress

Ideal for quick and hassle-free integration. Just search for keyword Zooza in official plugin directory.
Read more about setup and configuration options.

#### Wix

Wix doesn't allow for embedding custom JavaScript code and generally doesn't work well with embedded widgets. Therefore using this plugin is your only way of integrating Zooza if you're on this platform.
Read more.

#### Manual Embedding

This option gives you most flexibility but is definitely targeted for more technically skilled persons although it does not necessarily require any coding.

## Customisation

### Appearance

Zooza widgets are embedded directly into your website, making them look and feel like a natural part of your site. You can further customize their appearance by overriding the default CSS directly on your website. This allows you to hide elements you don't need, change the appearance of buttons, or even adjust the order of certain elements.

The best way to override Zooza's default styles is to prefix your CSS selectors with anything that precedes Zooza's main `<div>` tag, which is prefixed with the class `.zooza`.

If you wish, you can even disable each widget's default CSS entirely.  

**Note:** Disabling the default CSS will remove all built-in styles, so you must ensure that you also provide styles for essential utility classes such as `.hidden`. You can turn off the CSS in the Zooza app: `Publish > Widget > [Widget type] > Use CSS`.

### Behaviour

Many widgets can have their behaviour configured generally in two ways:

- Via app settings
- By changing the initialisation parameters before the widget loads

Both ways are described in more depth in the individual widget's pages.

## Advanced

### Importance of a URL

Each widget's main configuration property is its URL. This is because you need to let Zooza know where on your website the widget is installed. Zooza will often point your customers between individual widgets — for example, from the Map widget to a Registration widget, or from the Profile widget to the Checkout form. Therefore it is crucial for Zooza to be informed where the **main instance** of your widget resides.

Main instance is simply the most general location on your website where the registration widget resides. 

:material-check: These are good examples:

- A page titled Registration (or Booking)
- A page without any title and without any other content on it apart from the form itself
- A page where user generally doesn't need to scroll to see the booking form

:material-alert-circle-outline: These are not good examples:

- A page for a specific course or program
- A page where there is other unrelated content and form does not appear in prominent page
- A page where the widget's default display settings are overridden or customised

### Installation on multiple websites

Technically speaking, all widget types form a **group** which share **same API key**. You can place as many instances of a widget on a page and those instances can use the same API key over and over again. You may even place the widgets with the same API keys on different domains however this is not recommended as per point made above about the importance of a URL.

However, if you have multiple websites or your website is huge and has distinct sections, perhaps even with distinct branding, then it is appropriate to create a new group of widgets in `Publish > Create` and install each set of widgets on a different domain. This way you will be able to keep track of which registration came through which channel (domain), as it will be listed next to every registration.

!!! info "If you are a franchise"
    If you are a Franchise and your website include a separate page for each individual Franchisee (and they don't have their own websites), then it is **NOT appropriate** to create a new widget group per franchisee. Each individual franchisee will have their own Zooza account thus will have their own separate widget group with a distinct API key.

    [Learn more about how to install Zooza on a franchise managed website]()
