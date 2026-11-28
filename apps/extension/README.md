# Prisharp

See what any site is built with, and the evidence for each. A Chromium extension drawn like one of Chrome's own panels: click the Prisharp mark in the toolbar for the list of technologies on the page, then open one to see what gave it away and to visit its site.

## Install

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and pick `apps/extension`.
3. Pin Prisharp, open a site and click it.

In Firefox 140 or later, run `pnpm zip`, open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on** and pick `prisharp-firefox-<version>.zip`. Firefox keeps it until it restarts.

Prisharp runs only when you click it. It asks for `activeTab` and `scripting` and no host permissions, so it reads only the tab you clicked on, and only then. The `offscreen` permission lets a hidden page follow the browser's light or dark mode, which a service worker can't do, so the toolbar icon matches it; that page reads nothing else. Firefox matches the icon to its theme by itself, so its build doesn't ask for `offscreen`.

### The count on the toolbar icon

The **Count on the toolbar icon** switch in the popup's settings puts the number of technologies on the icon as each page loads, before anyone clicks. It is off by default. Turning it on asks for access to every site, the manifest's one `optional_host_permissions` entry, because that is the only way to read a page nobody clicked on. Whether the count is on is whether Prisharp holds that access, so nothing is stored: turning the switch off gives the access back, and so does removing it in the browser's extension settings. [`src/count.js`](src/count.js) reads each page with the same `collect` and `detect` the popup uses, and nothing is sent anywhere. In Chrome it runs in the service worker; in Firefox it is the build's only background script.

## The popup

The popup is drawn in prisharp.com's own style, the same in Chrome and Firefox: Instrument Serif for the site and each technology's name, Geist Mono for the rest, the site's cool greys and its one cobalt accent, light and dark, with thin lines between parts and square corners. Its colors live in [`yummacss.config.mjs`](yummacss.config.mjs), copied from [`apps/web/yummacss.config.mjs`](../web/yummacss.config.mjs) under the same names. The two fonts ship in [`fonts`](fonts) (SIL Open Font License, Latin only), and its icons are [Tabler Icons](https://tabler.io/icons) (MIT), the set prisharp.com uses, in [`src/symbols.js`](src/symbols.js). The home page draws the popup's evidence page with the same classes and icons ([`apps/web/src/components/panel.tsx`](../web/src/components/panel.tsx)).

The popup opens on the site's address and how many technologies it is built with, the number large in the accent, then lists them one per row: logo, name and category. Opening one shows its version, category and what it brings in as tags, then every match Prisharp found in the page, the matched text in the accent, and a link to its site. Back or Escape returns to the list.

The settings page, from the gear, holds the count on the toolbar icon (above), whether to show the copy buttons (off by default), whether "Copy the list" writes plain text or Markdown, and the theme: Auto follows the browser, Light and Dark hold one. These are kept in the popup's own `localStorage` ([`src/settings.js`](src/settings.js)), so they need no permission.

The toolbar icon and the extension's icon on `chrome://extensions` are the Prisharp mark from prisharp.com ([`apps/web/public/icon.svg`](../web/public/icon.svg)): on light toolbars in the site's accent over the mark's sky, which holds up at 16px better than the sky alone, and on dark ones in the lighter tint the site uses in dark mode.

## How detection works

Every technology leaves evidence in what it ships to the browser: a global it defines, an attribute it writes, a path it serves its files from, a comment it keeps at the top of its CSS. Prisharp keeps those fingerprints as data in [`src/technologies.js`](src/technologies.js) and weighs them:

1. **Collect.** On click, [`src/collect.js`](src/collect.js) runs once in the page's own JavaScript world. It checks the globals, selectors and element properties the fingerprints ask for, lists loaded resources and `<meta>` tags, sends one `HEAD` request for the response headers, and reads the stylesheets and entry scripts as text. The browser has usually cached these already.
2. **Score.** [`src/detect.js`](src/detect.js) matches each technology's signals against that snapshot. A signal weighs 100 by default and a technology shows from 100, so one strong signal is enough and a weak one (50) needs a second. Every signal that matched is kept as evidence, which the popup lists under each technology.
3. **Relate.** `implies` adds what a technology is built on (Next.js gives React). `requires` drops one unless its partners were found too (Radix Icons needs Radix UI). `unless` rules one out (GitHub Pages is never github.com itself).

Some of the evidence the fingerprints use, all checked against the packages' own builds:

| Technology                  | Evidence                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Next.js                     | `window.next.version`, `self.__next_f`, `/_next/static/`                                                      |
| Turbopack                   | `globalThis.TURBOPACK`, `/_next/static/chunks/turbopack-*`                                                    |
| TanStack Start              | `window.__TSR_ROUTER__`, `self.$_TSR`                                                                         |
| SvelteKit                   | a `__sveltekit_<hash>` global, `/_app/immutable/`                                                             |
| Svelte                      | `window.__svelte.v`, the set of running Svelte versions                                                       |
| Solid                       | `_$HY` from hydration, `document._$DX_DELEGATE` from event delegation                                         |
| React                       | `__reactFiber$…` and `__reactContainer$…` on rendered elements                                                |
| Vue                         | `[data-v-app]`, whose `__vue_app__.version` gives the version                                                 |
| Astro                       | `<meta name="generator" content="Astro v…">`, `astro-island`, `/_astro/`                                      |
| Vite                        | its modulepreload polyfill at the top of the entry chunk                                                      |
| Rolldown                    | the same polyfill written with template literals, as Vite 8 builds with Rolldown and minifies with Oxc        |
| Tailwind CSS                | `/*! tailwindcss v4.3.3 \| MIT License */` at the top of its CSS                                              |
| Tailwind Plus               | the `<el-dropdown>`, `<el-dialog>`, `<el-menu>`… elements from `@tailwindplus/elements`                       |
| Yumma CSS                   | `.d\:f{display:flex}` in the stylesheet, or `d:f`, `ai:c`, `jc:sb` in the DOM                                 |
| Lucide, Tabler Icons        | the `lucide` and `tabler-icon` classes their components write on each `<svg>`                                 |
| Radix Icons                 | `<svg width="15" height="15" viewBox="0 0 15 15">`, the 15 grid only Radix draws on                           |
| Iconoir                     | `<svg width="1.5em" height="1.5em" color="currentColor">`                                                     |
| Phosphor Icons              | its React context, `size:"1em",weight:"regular",mirrored:!1`, which minifiers keep; or its `Phosphor` webfont |
| Hugeicons                   | `disableSecondaryOpacity`, a prop name its component keeps through minification                               |
| Vercel, Netlify, Cloudflare | `x-vercel-id`, `x-nf-request-id`, `cf-ray`                                                                    |

### What cannot be seen

A browser sees only what a site ships. Build tools and server code leave no trace unless the output carries one.

- **Vite+** builds with Vite and Rolldown, so its output is theirs. Prisharp shows Vite and Rolldown.
- **Static Astro** without islands or the generator tag can ship plain HTML and CSS, with no trace of Astro.
- **Base UI** writes its `data-base-ui-*` attributes only while a component is open. On a page at rest it can be invisible.

## Add a technology

Add an entry to `src/technologies.js`, using the signal kinds listed at the top of that file. Check the evidence against the package itself: install it, build a small app, and look for what reaches the browser. Then:

```bash
pnpm install
pnpm icons      # when svgl has a logo for it: add it to scripts/icons.mjs first
pnpm readme     # list it in the repository's README
pnpm test       # vp test run
```

A technology without a logo in `icons/tech` shows its first letter. The popup never asks another server for an icon.

## Develop

The popup is styled with [Yumma CSS](https://yummacss.com), in the colors and fonts of `apps/web/yummacss.config.mjs`. A color changed there changes here by hand.

```bash
pnpm build      # popup.css from the classes in popup.html and src
pnpm validate   # every class is one Yumma CSS generates
pnpm test       # the detection engine
pnpm zip        # prisharp-chrome-<version>.zip for the Chrome Web Store, prisharp-firefox-<version>.zip for addons.mozilla.org
```

The Firefox zip is the same extension with its own manifest, written by [`scripts/zip.mjs`](scripts/zip.mjs): no `offscreen` permission, a background script that only keeps the count, `theme_icons` for the toolbar icon, and the ID and data-collection statement addons.mozilla.org asks for.

Logos come from [svgl](https://svgl.app).
