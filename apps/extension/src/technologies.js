// Every technology Prisharp knows, as data. Nothing here runs: the collector
// reads the page, then `detect` scores each entry's signals against it.
//
// A signal is one piece of evidence. Its kind is the key it carries:
//
//   js        a global path exists:            { js: "next.version", version: true }
//   jsPrefix  a global name starts with this:  { jsPrefix: "webpackChunk" }
//   dom       a selector matches:              { dom: "[ng-version]", attr: "ng-version" }
//             (`attr` or `prop` reads the version off the element)
//   domKey    an element carries an expando:   { domKey: "__reactFiber$" }
//   attrPrefix an attribute name starts with:  { attrPrefix: "data-base-ui-" }
//   resource  a script, stylesheet or loaded URL matches
//   html      the rendered document matches
//   script    the source of any script the page loaded matches
//   css       the page's stylesheets match
//   meta      [name, regex] against a <meta name> or <meta property>
//   header    [name, regex] against a response header of the page
//   classes   at least `min` of these class names are in the DOM
//   url       the page URL matches
//   file      on a dev server, a file at the root whose content matches:
//             { file: "/yumma.config.mjs", content: /yummacss/ }
//   found     these technologies were all found too
//
// A pattern too dense to read as evidence can carry a `label`, which the
// popup shows in its place.
//
// A regex with a capture group reads the version from it. Each signal weighs
// 100 unless it says otherwise: a technology shows at 100, so a weak signal
// (50) needs a second one. `implies` adds what a technology is built on;
// `requires` drops it unless those were found too.

export const categories = [
	"Framework",
	"Library",
	"Components",
	"Icons",
	"Styling",
	"Build",
	"Hosting",
	"Services",
];

export const technologies = [
	// Framework
	{
		id: "nextjs",
		name: "Next.js",
		website: "https://nextjs.org",
		category: "Framework",
		implies: ["react"],
		signals: [
			{ js: "next.version", version: true },
			{ js: "__NEXT_DATA__" },
			{ js: "__next_f" },
			{ resource: /\/_next\/static\// },
			{ header: ["x-powered-by", /next\.js/i] },
		],
	},
	{
		id: "tanstack-start",
		name: "TanStack Start",
		website: "https://tanstack.com/start",
		category: "Framework",
		icon: "tanstack",
		implies: ["tanstack-router"],
		signals: [{ js: "__TSR_ROUTER__" }, { js: "$_TSR" }],
	},
	{
		id: "react-router",
		name: "React Router",
		website: "https://reactrouter.com",
		category: "Framework",
		implies: ["react"],
		signals: [
			{ js: "__reactRouterContext" },
			{ js: "__reactRouterManifest" },
			{ js: "__reactRouterVersion", version: true },
		],
	},
	{
		id: "remix",
		name: "Remix",
		website: "https://remix.run",
		category: "Framework",
		implies: ["react"],
		signals: [{ js: "__remixContext" }, { js: "__remixManifest" }],
	},
	{
		id: "gatsby",
		name: "Gatsby",
		website: "https://www.gatsbyjs.com",
		category: "Framework",
		implies: ["react"],
		signals: [
			{ dom: "#___gatsby" },
			{ meta: ["generator", /^Gatsby ([\d.]+)/i] },
		],
	},
	{
		id: "nuxt",
		name: "Nuxt",
		website: "https://nuxt.com",
		category: "Framework",
		implies: ["vue"],
		signals: [
			{ js: "__NUXT__" },
			{ dom: "#__NUXT_DATA__" },
			{ dom: "#__nuxt" },
			{ resource: /\/_nuxt\// },
		],
	},
	{
		id: "sveltekit",
		name: "SvelteKit",
		website: "https://svelte.dev/docs/kit",
		category: "Framework",
		icon: "svelte",
		implies: ["svelte", "vite"],
		signals: [
			{ jsPrefix: "__sveltekit_" },
			{ resource: /\/_app\/immutable\// },
			{ dom: "[data-sveltekit-preload-data], [data-sveltekit-preload-code]" },
		],
	},
	{
		id: "astro",
		name: "Astro",
		website: "https://astro.build",
		category: "Framework",
		implies: ["vite"],
		signals: [
			{ meta: ["generator", /^Astro v?([\d.]+)/i] },
			{ dom: "astro-island, astro-slot" },
			{ resource: /\/_astro\// },
		],
	},
	{
		id: "starlight",
		name: "Starlight",
		website: "https://starlight.astro.build",
		category: "Framework",
		icon: "astro",
		implies: ["astro"],
		signals: [{ meta: ["generator", /^Starlight v?([\d.]+)/i] }],
	},
	{
		id: "qwik",
		name: "Qwik",
		website: "https://qwik.dev",
		category: "Framework",
		signals: [{ dom: "[q\\:container]", attr: "q:version" }],
	},
	{
		id: "vitepress",
		name: "VitePress",
		website: "https://vitepress.dev",
		category: "Framework",
		icon: "vite",
		implies: ["vue", "vite"],
		signals: [
			{ meta: ["generator", /^VitePress v?([\d.]+)/i] },
			{ js: "__VP_HASH_MAP__" },
		],
	},
	{
		id: "docusaurus",
		name: "Docusaurus",
		website: "https://docusaurus.io",
		category: "Framework",
		implies: ["react"],
		signals: [{ meta: ["generator", /^Docusaurus v?([\d.]+)/i] }],
	},
	{
		id: "hugo",
		name: "Hugo",
		website: "https://gohugo.io",
		category: "Framework",
		signals: [{ meta: ["generator", /^Hugo ([\d.]+)/i] }],
	},
	{
		id: "framer",
		name: "Framer",
		website: "https://www.framer.com",
		category: "Framework",
		signals: [
			{ meta: ["generator", /^Framer\b/i] },
			{ dom: "#__framer-badge-container" },
			{ resource: /framerusercontent\.com/ },
		],
	},
	{
		id: "figma",
		name: "Figma Sites",
		website: "https://www.figma.com/sites",
		category: "Framework",
		signals: [{ url: /\.figma\.site\// }, { resource: /\.figma\.site\// }],
	},
	{
		id: "webflow",
		name: "Webflow",
		website: "https://webflow.com",
		category: "Framework",
		signals: [
			{ dom: "html[data-wf-site]" },
			{ meta: ["generator", /^Webflow\b/i] },
		],
	},
	{
		id: "wordpress",
		name: "WordPress",
		website: "https://wordpress.org",
		category: "Framework",
		signals: [
			{ meta: ["generator", /^WordPress ([\d.]+)/i] },
			{ resource: /\/wp-(content|includes)\// },
		],
	},
	{
		id: "shopify",
		name: "Shopify",
		website: "https://www.shopify.com",
		category: "Framework",
		signals: [{ js: "Shopify.shop" }, { resource: /cdn\.shopify\.com/ }],
	},

	// Library
	{
		id: "react",
		name: "React",
		website: "https://react.dev",
		category: "Library",
		signals: [
			{ domKey: "__reactFiber$" },
			{ domKey: "__reactContainer$" },
			{ domKey: "_reactRootContainer" },
			// The same keys, as react-dom builds them in its bundle.
			{
				script: /["'`]__react(?:Fiber|Container)\$["'`]\s*\+/,
				label: "react-dom's __reactFiber$ key",
			},
			{ js: "React.version", version: true },
		],
	},
	{
		id: "vue",
		name: "Vue",
		website: "https://vuejs.org",
		category: "Library",
		signals: [
			{ dom: "[data-v-app]", prop: "__vue_app__.version" },
			{ js: "__VUE__" },
			{ domKey: "__vue_app__" },
			{
				script: /\.__vue_app__\s*=\s*[\w$]/,
				label: "app.__vue_app__ set on mount",
			},
			{ domKey: "__vue__" },
		],
	},
	{
		id: "svelte",
		name: "Svelte",
		website: "https://svelte.dev",
		category: "Library",
		signals: [
			{ js: "__svelte.v", version: true },
			// Every component adds its version to that set.
			{
				script:
					/__svelte(?:\?\?|\|\|)=\{\}\)\.v(?:\?\?|\|\|)=new Set\)\.add\([`'"]([\d.]+)/,
			},
		],
	},
	{
		id: "solid",
		name: "Solid",
		website: "https://www.solidjs.com",
		icon: "solidjs",
		category: "Library",
		signals: [
			// Hydration, and the event delegation every rendered app sets up.
			{ js: "_$HY" },
			{ js: "document._$DX_DELEGATE" },
			{ domKey: "$$click" },
			{
				script: /["'`]_\$DX_DELEGATE["'`]/,
				label: "solid-js/web's event delegation key",
			},
		],
	},
	{
		id: "angular",
		name: "Angular",
		website: "https://angular.dev",
		category: "Library",
		signals: [
			{ dom: "[ng-version]", attr: "ng-version" },
			{ js: "getAllAngularRootElements" },
		],
	},
	{
		id: "ember",
		name: "Ember",
		website: "https://emberjs.com",
		category: "Library",
		signals: [{ js: "Ember.VERSION", version: true }],
	},
	{
		id: "lit",
		name: "Lit",
		website: "https://lit.dev",
		category: "Library",
		signals: [{ js: "litElementVersions", version: true }],
	},
	{
		id: "tanstack-router",
		name: "TanStack Router",
		website: "https://tanstack.com/router",
		category: "Library",
		icon: "tanstack",
		signals: [{ js: "__TSR_ROUTER__" }],
	},
	{
		id: "jquery",
		name: "jQuery",
		website: "https://jquery.com",
		category: "Library",
		signals: [{ js: "jQuery.fn.jquery", version: true }],
	},
	{
		id: "threejs",
		name: "Three.js",
		website: "https://threejs.org",
		category: "Library",
		signals: [{ js: "__THREE__", version: true }],
	},

	// Components
	{
		id: "yumma-ui",
		name: "Yumma UI",
		website: "https://yummacss.com/ui",
		category: "Components",
		implies: ["yummacss", "base-ui"],
		signals: [
			{ file: "/yummaui.json", content: /"componentsDir"|"registry"/ },
			{ file: "/yummaui.config.mjs", content: /yummaui/ },
			// Copied into the project, it leaves no mark of its own in a build:
			// Base UI styled with Yumma CSS is the evidence.
			{ found: ["yummacss", "base-ui"] },
		],
	},
	{
		id: "tailwind-plus",
		name: "Tailwind Plus",
		website: "https://tailwindcss.com/plus",
		category: "Components",
		icon: "tailwindcss",
		implies: ["tailwindcss"],
		signals: [
			{
				dom: "el-dropdown, el-menu, el-dialog, el-popover, el-tab-group, el-select, el-autocomplete, el-command-palette, el-disclosure, el-copyable",
			},
			{ resource: /@tailwindplus\/elements/ },
		],
	},
	{
		id: "base-ui",
		name: "Base UI",
		website: "https://base-ui.com",
		category: "Components",
		signals: [
			// Triggers carry one at rest; open parts add more.
			{ attrPrefix: "data-base-ui-" },
			// What survives minifying: its error URL and its event helper.
			{
				script: /base-ui\.com\/production-error|preventBaseUIHandler\s*[:=(]/,
				label: "Base UI's error URL or event helper",
			},
		],
	},
	{
		id: "radix",
		name: "Radix UI",
		website: "https://www.radix-ui.com",
		category: "Components",
		signals: [
			{
				dom: "[data-radix-collection-item], [data-radix-popper-content-wrapper], [data-radix-scroll-area-viewport], [id^='radix-']",
			},
		],
	},
	{
		id: "headlessui",
		name: "Headless UI",
		website: "https://headlessui.com",
		category: "Components",
		signals: [{ dom: "[data-headlessui-state], [id^='headlessui-']" }],
	},
	{
		id: "shadcn",
		name: "shadcn/ui",
		website: "https://ui.shadcn.com",
		category: "Components",
		requires: ["tailwindcss"],
		signals: [
			{
				dom: "[data-slot='button'], [data-slot='card'], [data-slot='dropdown-menu-trigger'], [data-slot='dialog-content']",
			},
		],
	},

	// Icons
	{
		id: "lucide",
		name: "Lucide",
		website: "https://lucide.dev",
		category: "Icons",
		// lucide-react and the lucide package both write the icon's name as a class
		signals: [{ dom: "svg.lucide" }],
	},
	{
		id: "tabler-icons",
		name: "Tabler Icons",
		website: "https://tabler.io/icons",
		category: "Icons",
		signals: [
			{ dom: "svg.tabler-icon" },
			// the webfont: <i class="ti ti-home">
			{ dom: "i.ti[class*='ti-']" },
			{ css: /font-family:\s*["']?tabler-icons/ },
		],
	},
	{
		id: "phosphor",
		name: "Phosphor Icons",
		website: "https://phosphoricons.com",
		category: "Icons",
		signals: [
			// @phosphor-icons/react's default context, which minifiers keep
			{
				script:
					/size:\s*"1em",\s*weight:\s*"regular",\s*mirrored:\s*(?:!1|false)/,
				label: "IconContext: 1em, regular weight, not mirrored",
			},
			{ css: /font-family:\s*["']?Phosphor/ },
			// its icons are drawn on a 256 grid at 1em; others use 256 too
			{ dom: "svg[viewBox='0 0 256 256'][width='1em']", weight: 50 },
		],
	},
	{
		id: "iconoir",
		name: "Iconoir",
		website: "https://iconoir.com",
		category: "Icons",
		signals: [
			// iconoir-react: 1.5em with a color attribute, which few others set
			{
				dom: "svg[width='1.5em'][height='1.5em'][color='currentColor']",
			},
			// the CSS version: <i class="iconoir-home">
			{ dom: "[class^='iconoir-'], [class*=' iconoir-']" },
		],
	},
	{
		id: "radix-icons",
		name: "Radix Icons",
		website: "https://www.radix-ui.com/icons",
		category: "Icons",
		icon: "radix",
		// drawn on a 15 grid, which is Radix Icons' own
		signals: [{ dom: "svg[width='15'][height='15'][viewBox='0 0 15 15']" }],
	},
	{
		id: "hugeicons",
		name: "Hugeicons",
		website: "https://hugeicons.com",
		category: "Icons",
		// its markup is a plain 24px SVG; its component keeps this prop name
		signals: [
			{
				script: /disableSecondaryOpacity\s*[:=]/,
				label: "the disableSecondaryOpacity prop",
			},
		],
	},

	// Styling
	{
		id: "yummacss",
		name: "Yumma CSS",
		website: "https://yummacss.com",
		category: "Styling",
		signals: [
			{ file: "/yumma.config.mjs", content: /yummacss/ },
			{ file: "/yummacss.config.mjs", content: /yummacss/ },
			// Property initials, a colon, value initials: no other framework
			// generates `.d\:f{display:flex}`.
			{
				css: /\.(?:d\\:(?:f|g|b|if|none)\{display|ai\\:c\{align-items|jc\\:(?:sb|c)\{justify-content)/,
			},
			{
				classes: [
					"d:f",
					"d:g",
					"d:if",
					"ai:c",
					"jc:sb",
					"jc:c",
					"fd:c",
					"fw:500",
					"fw:600",
					"c:p",
					"w:100%",
					"td:none",
				],
				min: 2,
			},
		],
	},
	{
		id: "tailwindcss",
		name: "Tailwind CSS",
		website: "https://tailwindcss.com",
		category: "Styling",
		signals: [
			{ css: /tailwindcss v([\d.]+)/ },
			// Minifiers often drop the banner. What stays: Tailwind's reset of
			// its own variables, and in v4 an @property for each of them.
			{
				css: /@property --tw-|--tw-(?:ring-offset-shadow|shadow|border-spacing-x):/,
			},
			{ resource: /cdn\.tailwindcss\.com|@tailwindcss\/browser/ },
		],
	},
	{
		id: "bootstrap",
		name: "Bootstrap",
		website: "https://getbootstrap.com",
		category: "Styling",
		signals: [
			{ css: /Bootstrap\s+v([\d.]+)/ },
			{ js: "bootstrap.Tooltip.VERSION", version: true },
		],
	},

	// Build
	{
		id: "vite",
		name: "Vite",
		website: "https://vite.dev",
		category: "Build",
		signals: [
			{ resource: /\/@vite\/client/ },
			// Vite's modulepreload polyfill opens the entry chunk.
			{
				script:
					/relList;?\s*if\s*\(\s*[\w$]+\s*&&\s*[\w$]+\.supports\s*&&\s*[\w$]+\.supports\(\s*["'`]modulepreload/,
				label: "its modulepreload polyfill",
			},
			{
				html: /<script type="module" crossorigin src="[^"]*\/assets\/[\w.-]+-[\w-]{8}\.js"/,
				weight: 50,
			},
		],
	},
	{
		id: "rolldown",
		name: "Rolldown",
		website: "https://rolldown.rs",
		category: "Build",
		requires: ["vite"],
		// Vite 8 builds with Rolldown and minifies with Oxc, which writes the
		// same polyfill with template literals.
		signals: [
			{
				script: /createElement\(`link`\)\.relList/,
				label: "the polyfill, minified by Oxc",
			},
		],
	},
	{
		id: "turbopack",
		name: "Turbopack",
		website: "https://turbo.build/pack",
		category: "Build",
		signals: [
			{ js: "TURBOPACK" },
			{ resource: /\/_next\/static\/chunks\/turbopack-/ },
		],
	},
	{
		id: "webpack",
		name: "Webpack",
		website: "https://webpack.js.org",
		category: "Build",
		signals: [{ jsPrefix: "webpackChunk" }, { js: "webpackJsonp" }],
	},
	{
		id: "parcel",
		name: "Parcel",
		website: "https://parceljs.org",
		category: "Build",
		signals: [{ jsPrefix: "parcelRequire" }],
	},

	// Hosting
	{
		id: "vercel",
		name: "Vercel",
		website: "https://vercel.com",
		category: "Hosting",
		signals: [
			{ header: ["x-vercel-id", /./] },
			{ header: ["server", /^vercel$/i] },
		],
	},
	{
		id: "netlify",
		name: "Netlify",
		website: "https://www.netlify.com",
		category: "Hosting",
		signals: [
			{ header: ["x-nf-request-id", /./] },
			{ header: ["server", /^netlify$/i] },
		],
	},
	{
		id: "cloudflare",
		name: "Cloudflare",
		website: "https://www.cloudflare.com",
		category: "Hosting",
		signals: [
			{ header: ["cf-ray", /./] },
			{ header: ["server", /^cloudflare$/i] },
		],
	},
	{
		id: "github",
		name: "GitHub Pages",
		website: "https://pages.github.com",
		category: "Hosting",
		signals: [{ header: ["server", /^GitHub\.com$/i] }],
	},
	{
		id: "fly",
		name: "Fly.io",
		website: "https://fly.io",
		category: "Hosting",
		signals: [{ header: ["fly-request-id", /./] }],
	},
	{
		id: "render",
		name: "Render",
		website: "https://render.com",
		category: "Hosting",
		signals: [{ header: ["rndr-id", /./] }],
	},

	// Services
	{
		id: "google-analytics",
		name: "Google Analytics",
		website: "https://marketingplatform.google.com/about/analytics",
		category: "Services",
		signals: [
			{
				resource:
					/googletagmanager\.com\/gtag\/js|google-analytics\.com\/(?:analytics|g\/collect)/,
			},
		],
	},
	{
		id: "plausible",
		name: "Plausible",
		website: "https://plausible.io",
		icon: "plausibleanalytics",
		category: "Services",
		signals: [{ resource: /plausible\.io\/(?:js|api)/ }],
	},
	{
		id: "posthog",
		name: "PostHog",
		website: "https://posthog.com",
		category: "Services",
		signals: [{ js: "posthog.__loaded" }, { resource: /\.posthog\.com\// }],
	},
	{
		id: "sentry",
		name: "Sentry",
		website: "https://sentry.io",
		category: "Services",
		signals: [
			{ js: "__SENTRY__" },
			{ resource: /browser\.sentry-cdn\.com|\.ingest\.(?:\w+\.)?sentry\.io/ },
		],
	},
	{
		id: "stripe",
		name: "Stripe",
		website: "https://stripe.com",
		category: "Services",
		signals: [{ resource: /js\.stripe\.com/ }],
	},
	{
		id: "clerk",
		name: "Clerk",
		website: "https://clerk.com",
		category: "Services",
		signals: [
			{ js: "Clerk.version", version: true },
			{ resource: /clerk\.[\w.-]+\/npm\/@clerk/ },
		],
	},
	{
		id: "supabase",
		name: "Supabase",
		website: "https://supabase.com",
		category: "Services",
		signals: [{ resource: /\.supabase\.co\// }],
	},
	{
		id: "firebase",
		name: "Firebase",
		website: "https://firebase.google.com",
		category: "Services",
		signals: [{ resource: /gstatic\.com\/firebasejs|\.firebaseapp\.com\// }],
	},
	{
		id: "google-fonts",
		name: "Google Fonts",
		website: "https://fonts.google.com",
		icon: "google",
		category: "Services",
		signals: [{ resource: /fonts\.(?:googleapis|gstatic)\.com/ }],
	},
];
