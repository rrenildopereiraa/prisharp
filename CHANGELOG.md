# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/rrenildopereiraa/prisharp/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/rrenildopereiraa/prisharp/releases/tag/v1.0.0
