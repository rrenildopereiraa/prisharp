# Prisharp

See the tech behind any site, in one click. A Chromium extension that shows what a page is built with as a row of icons in a pill. Click an icon to open that technology's site.

## Install

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and pick `apps/extension`.
3. Pin Prisharp, open a site and click it.

Prisharp runs only when you click it. It asks for `activeTab` and `scripting` and no host permissions, so it reads only the tab you clicked on, and only then.

## How detection works

Every technology leaves evidence in what it ships to the browser: a global it defines, an attribute it writes, a path it serves its files from, a comment it keeps at the top of its CSS. Prisharp keeps those fingerprints as data in [`src/technologies.js`](src/technologies.js) and weighs them:

1. **Collect.** On click, [`src/collect.js`](src/collect.js) runs once in the page's own JavaScript world. It checks the globals, selectors and element properties the fingerprints ask for, lists loaded resources and `<meta>` tags, sends one `HEAD` request for the response headers, and reads the stylesheets and entry scripts as text. The browser has usually cached these already.
2. **Score.** [`src/detect.js`](src/detect.js) matches each technology's signals against that snapshot. A signal weighs 100 by default and a technology shows from 100, so one strong signal is enough and a weak one (50) needs a second.
3. **Relate.** `implies` adds what a technology is built on (Next.js gives React). `requires` drops one unless its partners were found too (Yumma UI needs Yumma CSS and Base UI).

Some of the evidence the fingerprints use, all checked against the packages' own builds:

| Technology                  | Evidence                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------ |
| Next.js                     | `window.next.version`, `self.__next_f`, `/_next/static/`                                               |
| Turbopack                   | `globalThis.TURBOPACK`, `/_next/static/chunks/turbopack-*`                                             |
| TanStack Start              | `window.__TSR_ROUTER__`, `self.$_TSR`                                                                  |
| SvelteKit                   | a `__sveltekit_<hash>` global, `/_app/immutable/`                                                      |
| Svelte                      | `window.__svelte.v`, the set of running Svelte versions                                                |
| Solid                       | `_$HY` from hydration, `document._$DX_DELEGATE` from event delegation                                  |
| React                       | `__reactFiber$…` and `__reactContainer$…` on rendered elements                                         |
| Vue                         | `[data-v-app]`, whose `__vue_app__.version` gives the version                                          |
| Astro                       | `<meta name="generator" content="Astro v…">`, `astro-island`, `/_astro/`                               |
| Vite                        | its modulepreload polyfill at the top of the entry chunk                                               |
| Rolldown                    | the same polyfill written with template literals, as Vite 8 builds with Rolldown and minifies with Oxc |
| Tailwind CSS                | `/*! tailwindcss v4.3.3 \| MIT License */` at the top of its CSS                                       |
| Tailwind Plus               | the `<el-dropdown>`, `<el-dialog>`, `<el-menu>`… elements from `@tailwindplus/elements`                |
| Yumma CSS                   | `.d\:f{display:flex}` in the stylesheet, or `d:f`, `ai:c`, `jc:sb` in the DOM                          |
| Vercel, Netlify, Cloudflare | `x-vercel-id`, `x-nf-request-id`, `cf-ray`                                                             |

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
