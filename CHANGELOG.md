# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **[extension]** Detection of nine UI kits, each from evidence only it ships: Ant Design, Element Plus, Angular Material, Carbon, HeroUI, Kobalte, daisyUI and Flowbite, and Bulma with its version.

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

[Unreleased]: https://github.com/rrenildopereiraa/prisharp/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/rrenildopereiraa/prisharp/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/rrenildopereiraa/prisharp/releases/tag/v1.0.0
