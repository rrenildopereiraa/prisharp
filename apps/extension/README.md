# Prisharp

See what any site is built with, and the evidence for each. A Chromium extension drawn like one of Chrome's own panels: click the globe in the toolbar for the list of technologies on the page, then open one to see what gave it away and to visit its site.

## Install

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and pick `apps/extension`.
3. Pin Prisharp, open a site and click it.

Prisharp runs only when you click it. It asks for `activeTab` and `scripting` and no host permissions, so it reads only the tab you clicked on, and only then. The `offscreen` permission lets a hidden page follow the browser's light or dark mode, which a service worker can't do, so the toolbar icon matches it; that page reads nothing else.

## The popup

The popup copies the look of Chrome's site information panel: the system font, Chrome's light and dark surfaces, flat rows and [Material Symbols](https://fonts.google.com/icons) (Apache 2.0), the icon set Chrome draws its own panels with. Its colors live in [`yumma.config.mjs`](yumma.config.mjs). The toolbar icon is the same globe as the popup's "Open" row, rendered from [`scripts/glyph.svg`](scripts/glyph.svg) in Chrome's toolbar grey; the extension's icon on `chrome://extensions` is that globe on a white tile, from [`scripts/tile.svg`](scripts/tile.svg).

## How detection works

Every technology leaves evidence in what it ships to the browser: a global it defines, an attribute it writes, a path it serves its files from, a comment it keeps at the top of its CSS. Prisharp keeps those fingerprints as data in [`src/technologies.js`](src/technologies.js) and weighs them:

1. **Collect.** On click, [`src/collect.js`](src/collect.js) runs once in the page's own JavaScript world. It checks the globals, selectors and element properties the fingerprints ask for, lists loaded resources and `<meta>` tags, sends one `HEAD` request for the response headers, and reads the stylesheets and entry scripts as text. The browser has usually cached these already.
2. **Score.** [`src/detect.js`](src/detect.js) matches each technology's signals against that snapshot. A signal weighs 100 by default and a technology shows from 100, so one strong signal is enough and a weak one (50) needs a second. Every signal that matched is kept as evidence, which the popup lists under each technology.
3. **Relate.** `implies` adds what a technology is built on (Next.js gives React). `requires` drops one unless its partners were found too (Yumma UI needs Yumma CSS and Base UI).

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
- **Base UI** writes its `data-base-ui-*` attributes only while a component is open. On a page at rest it can be invisible, and so can Yumma UI, which needs it.

## Add a technology

Add an entry to `src/technologies.js`, using the signal kinds listed at the top of that file. Check the evidence against the package itself: install it, build a small app, and look for what reaches the browser. Then:

```bash
pnpm install
pnpm icons      # when svgl has a logo for it: add it to scripts/icons.mjs first
pnpm test       # vp test run
```

A technology without an svgl logo shows its site's favicon, then its first letter.

## Develop

The popup is styled with [Yumma CSS](https://yummacss.com), with Yumma UI's theme and recipes: its theme comes from `apps/web/yumma.config.mjs`, so the popup and prisharp.com always match.

```bash
pnpm build      # popup.css from the classes in popup.html and src
pnpm validate   # every class is one Yumma CSS generates
pnpm test       # the detection engine
pnpm zip        # prisharp.zip for the Chrome Web Store
```

Logos come from [svgl](https://svgl.app).
