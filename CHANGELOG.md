# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **[extension]** Detection of the ten most-used analytics and tracking tools Prisharp missed, by how many sites HTTP Archive finds them on: Facebook Pixel, Microsoft Clarity, Yandex Metrica, Snowplow, Matomo, TikTok Pixel, Hotjar, LinkedIn Insight Tag, New Relic and HubSpot Analytics, some with their versions.
- **[extension]** Detection of the ten most-used hosts, servers and CDNs Prisharp missed, by how many sites HTTP Archive finds them on: Amazon Web Services, cdnjs, jsDelivr, Google Hosted Libraries, GoDaddy, LiteSpeed, unpkg, Hostinger, IIS and Varnish, from the headers a site sends and the addresses it loads its files from. LiteSpeed, IIS and Varnish show their versions when the server gives them. Amazon CloudFront and Amazon S3 now come with Amazon Web Services.
- **[extension]** Detection of the next ten most-used libraries, by how many sites HTTP Archive finds them on: FancyBox, Lightbox, Owl Carousel, Isotope, Select2, Animate.css, PhotoSwipe, AOS, Flickity and Hammer.js, most with their versions. SelectWoo, WooCommerce's copy of Select2, is not mistaken for it.
- **[extension]** Detection of the ten most-used platforms and frameworks Prisharp missed, by how many sites HTTP Archive finds them on: Wix, Stimulus, Ruby on Rails, Drupal, Squarespace, AMP, AngularJS, Express and Joomla, with versions for Drupal, AMP, AngularJS and Stimulus. A Next.js site built with the App Router now shows "Next.js App Router" as well, so it can be told apart from one built with the Pages Router. Backdrop, a copy of Drupal, is not mistaken for it, and neither is a Cloudflare check page for AngularJS.
- **[extension]** Detection of the ten most-used video, map and cookie banner services Prisharp missed, by how many sites HTTP Archive finds them on: YouTube, Google Maps, Funding Choices (Google's cookie banner), CookieYes, Vimeo, Leaflet, Video.js, Cookiebot, iubenda and Didomi, with versions for Google Maps, Leaflet and Video.js. Videos and maps get groups of their own, Media and Maps, and the cookie banners join OneTrust under Privacy. A link to a video or a place, a thumbnail, or a link to one of these services' websites doesn't count as using it.

### Fixed

- **[extension]** jQuery's version no longer carries a list of modules on sites that use a custom jQuery build: jsDelivr showed "jQuery 3.6.3 -ajax,-ajax/jsonp,…" and now shows "jQuery 3.6.3".
- **[extension]** A custom Lodash build, like the one in GoDaddy's site builder, no longer shows as "Underscore.js 4.17.5". It now shows as Lodash, and Lodash shows its version too.

### Changed

- **[web]** The zip download on prisharp.com is named after the extension's version, like `prisharp-1.2.0.zip`, and clicking it opens a warning first, over a page gone black and white: the zip is the unreleased code on `main`, may be broken, won't update itself and isn't the Chrome Web Store version. The warning gives the steps to load it, and "Download anyway" saves it. Links to `/prisharp.zip` still work.

## [1.2.0] - 2026-11-23

### Added

- **[extension]** "Copy as Markdown" in the popup copies the list as a Markdown list, each technology linked to its site with its version, ready to paste into a README, an issue or a post.
- **[extension]** Detection of nine UI kits, each from evidence only it ships: Ant Design, Element Plus, Angular Material, Carbon, HeroUI, Kobalte, daisyUI and Flowbite, and Bulma with its version.
- **[extension]** Detection of six site generators from the generator tag they write, each with its version: Eleventy, Jekyll, Hexo, VuePress and Rspress. Nextra shows from its CSS variables.
- **[extension]** Detection of seven frameworks and libraries: Inertia.js, Meteor, Hydrogen, Elm, Datastar, and Backbone.js and Knockout.js with their versions.
- **[extension]** Detection of the ten most-used libraries Prisharp missed, by how many sites HTTP Archive finds them on: Swiper, jQuery UI, jQuery Migrate, Slick, Modernizr, LazySizes, Popper, Underscore.js, Moment.js and Preact, most with their versions.
- **[extension]** Detection of five hosts from the headers they send: Heroku, Deno Deploy, Platform.sh, Kinsta and Railway.
- **[extension]** Detection of four auth services from what they call: Auth.js, Okta, Amazon Cognito and Microsoft Entra ID.
- **[extension]** An AI Builder category, with v0, Lovable, Bolt, Replit and Base44, from the tags, scripts and hosting their projects ship with.
- **[web]** prisharp.com/chrome and prisharp.com/get open Prisharp on the Chrome Web Store, short links for posts.
- **[web]** Holding Shift turns "Add to Chrome" into "Download .zip", and Shift+A downloads it, to load the latest build unpacked or upload it to the store.

### Changed

- **[web]** The A and S shortcuts run on TanStack Hotkeys, which skips fields you type in and lets go of Shift when the window loses focus.

### Fixed

- **[extension]** shadcn/ui no longer shows from a `button` or `card` slot alone, which HeroUI writes too. It shows from the slots only it writes, or from those two with its theme.

## [1.1.0] - 2026-11-20

### Added

- **[extension]** Detection of Ghost, with its version from the generator tag, and its Portal and search scripts.
- **[extension]** Detection of Umami, Auth0 and Sanity, from the scripts, sign-in calls and image CDN each one uses.
- **[extension]** Detection of Crisp and Intercom, from their chat widgets.
- **[extension]** Detection of Cloudflare Turnstile, reCAPTCHA and hCaptcha, from the scripts they load. reCAPTCHA shows only from its own script, because hCaptcha defines `window.grecaptcha` too.
- **[extension]** Logos for core-js, Crisp, DataDome, _hyperscript, KaTeX, React Aria, StyleX, Polar, OneTrust, Prebid, Amazon Ads and OutSystems, each in a version for light and dark panels. Every technology now has its logo.

### Changed

- **[extension]** The list shows each technology's category, and its version only on its own page.
- **[extension]** A link to each technology's site appears on its row on hover or focus, so it opens without the details page.
- **[extension]** A technology's page names it beside its logo, with its category, version and what it brings in below.
- **[web]** The evidence card on prisharp.com shows the same.
- **[extension]** The extension's description reads "See every framework, library and host, with proof."

### Fixed

- **[extension]** A `0.0.0` version, which builds from source write in its place, no longer shows. Cloudflare's dashboard showed Tailwind CSS 0.0.0.

## [1.0.0] - 2026-11-13

The first stable release, on the [Chrome Web Store](https://chromewebstore.google.com/detail/prisharp-see-what-any-sit/ahjcmijihodolfhcdeapnbmpihkoolhn). Works in Chrome, Edge, Brave, Opera, Vivaldi and Arc.

### Added

- **[extension]** Detection of 124 technologies across 19 categories, from Framework and Platform to Payments, Analytics and Security. The full list is in the [README](https://github.com/rrenildopereiraa/prisharp#technologies).
- **[extension]** Evidence for every result: the global, header, script, stylesheet or element that gave each technology away.
- **[extension]** Versions read from the page itself, such as `window.next.version` or the banner at the top of Tailwind's CSS.
- **[extension]** Weak hints, such as a `wire:` attribute or an `x-powered-by: ASP.NET` header, need a second signal before a technology shows.
- **[extension]** `implies`, `requires` and `unless` relate technologies: Next.js brings React, Radix Icons needs Radix UI, and GitHub Pages is never github.com itself.
- **[extension]** A popup drawn like Chrome's own site information panel, in light and dark.
- **[extension]** A toolbar icon from the Prisharp logomark that follows the browser's light or dark theme.
- **[extension]** Logos for each technology, shipped inside the extension so the popup asks no other server for them.
- **[extension]** Runs only when clicked, on that tab only, with `activeTab`, `scripting` and `offscreen` and no host permissions.
- **[web]** prisharp.com, where the heading types well-known technologies and shows the popup's evidence for each, above a marquee of every logo.
- **[web]** A privacy policy at [prisharp.com/privacy](https://prisharp.com/privacy/).

[Unreleased]: https://github.com/rrenildopereiraa/prisharp/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/rrenildopereiraa/prisharp/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/rrenildopereiraa/prisharp/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/rrenildopereiraa/prisharp/releases/tag/v1.0.0
