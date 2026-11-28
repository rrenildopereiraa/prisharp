// Every technology Prisharp knows, as data. Nothing here runs: the collector
// reads the page, then `detect` scores each entry's signals against it.
//
// A signal is one piece of evidence. Its kind is the key it carries:
//
//   js        a global path exists:            { js: "next.version", version: true }
//             (`value` is a regex its value must match)
//   jsPrefix  a global name starts with this:  { jsPrefix: "webpackChunk" }
//   dom       a selector matches:              { dom: "[ng-version]", attr: "ng-version" }
//             (`attr` or `prop` reads the version off the element)
//   domKey    an element carries an expando:   { domKey: "__reactFiber$" }
//             (`exact` matches the whole key, not its start)
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
// `requires` drops it unless those were found too; `unless` lists signals
// that rule it out.

// The order the popup lists them in: what the site is built on first, then
// how it looks, where it runs, and what it plugs in.
export const categories = [
	"App framework",
	"Site generator",
	"Server framework",
	"Website builder",
	"CMS",
	"AI app builder",
	"UI framework",
	"JS library",
	"UI widget",
	"Component library",
	"CSS framework",
	"CSS-in-JS",
	"Icon set",
	"Font service",
	"Build tool",
	"Hosting",
	"CDN",
	"Web server",
	"Backend service",
	"Auth",
	"Payments",
	"Analytics",
	"Monitoring",
	"Ads & tags",
	"Search",
	"Video",
	"Maps",
	"Bot protection",
	"Cookie consent",
	"Customer support",
];

export const technologies = [
	// App framework
	{
		id: "nextjs",
		name: "Next.js",
		website: "https://nextjs.org",
		category: "App framework",
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
		id: "nextjs-app-router",
		name: "Next.js App Router",
		website: "https://nextjs.org/docs/app",
		category: "App framework",
		icon: "nextjs",
		implies: ["nextjs"],
		// the queue its server components stream into, which only the App
		// Router writes: a Pages Router page carries __NEXT_DATA__ instead
		signals: [{ js: "__next_f" }],
	},
	{
		id: "tanstack-start",
		name: "TanStack Start",
		website: "https://tanstack.com/start",
		category: "App framework",
		icon: "tanstack",
		implies: ["tanstack-router"],
		signals: [{ js: "__TSR_ROUTER__" }, { js: "$_TSR" }],
	},
	{
		id: "react-router",
		name: "React Router",
		website: "https://reactrouter.com",
		category: "App framework",
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
		category: "App framework",
		implies: ["react"],
		signals: [{ js: "__remixContext" }, { js: "__remixManifest" }],
	},
	{
		id: "gatsby",
		name: "Gatsby",
		website: "https://www.gatsbyjs.com",
		category: "App framework",
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
		category: "App framework",
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
		category: "App framework",
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
		category: "App framework",
		implies: ["vite"],
		signals: [
			{ meta: ["generator", /^Astro v?([\d.]+)/i] },
			{ dom: "astro-island, astro-slot" },
			{ resource: /\/_astro\// },
		],
	},
	{
		id: "qwik",
		name: "Qwik",
		website: "https://qwik.dev",
		category: "App framework",
		signals: [{ dom: "[q\\:container]", attr: "q:version" }],
	},
	{
		id: "amp",
		name: "AMP",
		website: "https://amp.dev",
		category: "App framework",
		signals: [
			// the attribute every AMP page must carry, as a word or a bolt
			{ dom: "html[amp], html[\u26a1]" },
			// the release, which the runtime writes onto the page
			{ dom: "html[amp-version]", attr: "amp-version" },
			// the runtime itself; its components also load on pages that
			// aren't AMP, so only v0.js counts
			{ resource: /\/\/cdn\.ampproject\.org\/(?:lts\/)?v0\.m?js/ },
		],
	},
	{
		id: "blazor",
		name: "Blazor",
		website: "https://dotnet.microsoft.com/apps/aspnet/web-apps/blazor",
		category: "App framework",
		signals: [
			{ resource: /\/_framework\/blazor\.(?:web|webassembly|server)\.js/ },
			{ js: "Blazor" },
		],
	},
	{
		id: "inertia",
		name: "Inertia.js",
		website: "https://inertiajs.com",
		category: "App framework",
		signals: [
			// the page data Inertia renders into: on the root element before 3.0,
			// in a JSON script tag since
			{
				dom: "[data-page*='component'][data-page*='props'], script[data-page][type='application/json']",
			},
		],
	},
	{
		id: "meteor",
		name: "Meteor",
		website: "https://www.meteor.com",
		category: "App framework",
		signals: [{ js: "__meteor_runtime_config__" }],
	},
	{
		id: "hydrogen",
		name: "Hydrogen",
		website: "https://hydrogen.shop",
		category: "App framework",
		implies: ["shopify", "react"],
		signals: [{ header: ["powered-by", /Hydrogen/i] }],
	},
	{
		id: "elm",
		name: "Elm",
		website: "https://elm-lang.org",
		category: "App framework",
		signals: [
			// the key its virtual DOM sets on elements with events, which stays
			// after an Elm app replaces the page it was inlined in
			{ domKey: "elm_event_node_ref" },
			// the hint links its compiled code keeps, even optimized
			{ script: /github\.com\/elm\/core\/blob\/1\.0\.0\/hints/ },
			{ html: /github\.com\/elm\/core\/blob\/1\.0\.0\/hints/ },
			{ js: "Elm", weight: 50 },
		],
	},
	// Site generator
	{
		id: "starlight",
		name: "Starlight",
		website: "https://starlight.astro.build",
		category: "Site generator",
		icon: "astro",
		implies: ["astro"],
		signals: [{ meta: ["generator", /^Starlight v?([\d.]+)/i] }],
	},
	{
		id: "vitepress",
		name: "VitePress",
		website: "https://vitepress.dev",
		category: "Site generator",
		icon: "vite",
		implies: ["vue", "vite"],
		signals: [
			{ meta: ["generator", /^VitePress v?([\d.]+)/i] },
			{ js: "__VP_HASH_MAP__" },
		],
	},
	{
		id: "vuepress",
		name: "VuePress",
		website: "https://vuepress.vuejs.org",
		category: "Site generator",
		icon: "vue",
		implies: ["vue"],
		signals: [{ meta: ["generator", /^VuePress ([\w.-]+)/i] }],
	},
	{
		id: "rspress",
		name: "Rspress",
		website: "https://rspress.rs",
		category: "Site generator",
		implies: ["react"],
		signals: [{ meta: ["generator", /^Rspress v?([\w.-]+)/i] }],
	},
	{
		id: "nextra",
		name: "Nextra",
		website: "https://nextra.site",
		category: "Site generator",
		implies: ["nextjs"],
		signals: [{ css: /--nextra-(?:navbar-height|primary-hue|bg)/ }],
	},
	{
		id: "docusaurus",
		name: "Docusaurus",
		website: "https://docusaurus.io",
		category: "Site generator",
		implies: ["react"],
		signals: [{ meta: ["generator", /^Docusaurus v?([\d.]+)/i] }],
	},
	{
		id: "hugo",
		name: "Hugo",
		website: "https://gohugo.io",
		category: "Site generator",
		signals: [{ meta: ["generator", /^Hugo ([\d.]+)/i] }],
	},
	{
		id: "eleventy",
		name: "Eleventy",
		website: "https://www.11ty.dev",
		category: "Site generator",
		// Eleventy 4 writes "Eleventy (Build Awesome) v4.0.0", for its new name
		signals: [
			{
				meta: [
					"generator",
					/^(?:Eleventy|Build Awesome)(?: \([^)]*\))? v?([\d.]+)/i,
				],
			},
		],
	},
	{
		id: "jekyll",
		name: "Jekyll",
		website: "https://jekyllrb.com",
		category: "Site generator",
		// the tag jekyll-seo-tag writes, which GitHub Pages turns on
		signals: [{ meta: ["generator", /^Jekyll v?([\d.]+)/i] }],
	},
	{
		id: "hexo",
		name: "Hexo",
		website: "https://hexo.io",
		category: "Site generator",
		signals: [{ meta: ["generator", /^Hexo ([\d.]+)/i] }],
	},
	// Server framework
	{
		id: "aspnet",
		name: "ASP.NET",
		website: "https://dotnet.microsoft.com/apps/aspnet",
		category: "Server framework",
		icon: "dotnet",
		signals: [
			{ header: ["x-aspnet-version", /([\d.]+)/] },
			{ header: ["x-aspnetmvc-version", /([\d.]+)/] },
			{ dom: "input[name='__VIEWSTATE']" },
			// IIS sends this for any page it serves, ASP.NET or not
			{ header: ["x-powered-by", /asp\.net/i], weight: 50 },
		],
	},
	{
		id: "rails",
		name: "Ruby on Rails",
		website: "https://rubyonrails.org",
		category: "Server framework",
		signals: [
			// the name Rails gives its CSRF token, in the tag csrf_meta_tags
			// writes; Laravel and Phoenix write only the token
			{ meta: ["csrf-param", /^authenticity_token$/] },
			// where Active Storage serves uploaded files from
			{ resource: /\/rails\/active_storage\// },
			// what rails-ujs sets once it starts
			{ js: "_rails_loaded" },
		],
	},
	{
		id: "express",
		name: "Express",
		website: "https://expressjs.com",
		category: "Server framework",
		// the header Express adds to every response unless it is turned off
		signals: [{ header: ["x-powered-by", /^Express$/] }],
	},
	{
		id: "laravel",
		name: "Laravel",
		website: "https://laravel.com",
		category: "Server framework",
		signals: [],
	},
	{
		id: "livewire",
		name: "Livewire",
		website: "https://livewire.laravel.com",
		category: "Server framework",
		implies: ["laravel"],
		signals: [{ js: "Livewire" }, { attrPrefix: "wire:", weight: 50 }],
	},
	{
		id: "phoenix",
		name: "Phoenix",
		website: "https://www.phoenixframework.org",
		category: "Server framework",
		icon: "phoenixframework",
		signals: [],
	},
	{
		id: "phoenix-liveview",
		name: "Phoenix LiveView",
		website: "https://github.com/phoenixframework/phoenix_live_view",
		category: "Server framework",
		icon: "phoenixframework",
		implies: ["phoenix"],
		signals: [
			{ dom: "[data-phx-main], [data-phx-session]" },
			{ js: "liveSocket", weight: 50 },
		],
	},
	// Website builder
	{
		id: "framer",
		name: "Framer",
		website: "https://www.framer.com",
		category: "Website builder",
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
		category: "Website builder",
		signals: [{ url: /\.figma\.site\// }, { resource: /\.figma\.site\// }],
	},
	{
		id: "webflow",
		name: "Webflow",
		website: "https://webflow.com",
		category: "Website builder",
		signals: [
			{ dom: "html[data-wf-site]" },
			{ meta: ["generator", /^Webflow\b/i] },
		],
	},
	{
		id: "shopify",
		name: "Shopify",
		website: "https://www.shopify.com",
		category: "Website builder",
		signals: [{ js: "Shopify.shop" }, { resource: /cdn\.shopify\.com/ }],
	},
	{
		id: "wix",
		name: "Wix",
		website: "https://www.wix.com",
		category: "Website builder",
		signals: [
			{ meta: ["generator", /^Wix\.com Website Builder/] },
			// the bundles of Thunderbolt, the renderer every Wix site runs on
			{ jsPrefix: "webpackJsonp__wix_thunderbolt" },
			{ header: ["x-wix-request-id", /./] },
			// Wix's own file host, which a widget it sells can load elsewhere
			{ resource: /\/\/static\.parastorage\.com\//, weight: 50 },
		],
	},
	{
		id: "squarespace",
		name: "Squarespace",
		website: "https://www.squarespace.com",
		category: "Website builder",
		signals: [
			{ js: "Static.SQUARESPACE_CONTEXT" },
			{
				html: /<!-- This is Squarespace\. -->/,
				label: "<!-- This is Squarespace. -->",
			},
			// its image host, which any site can link to
			{ resource: /\/\/static1\.squarespace\.com\//, weight: 50 },
		],
	},
	{
		id: "outsystems",
		name: "OutSystems",
		website: "https://www.outsystems.com",
		category: "Website builder",
		signals: [
			// its runtime scripts, served from each app's own /scripts/
			{
				resource:
					/\/scripts\/OutSystems(?:ReactView|ReactWidgets|UI|ManifestLoader)?\.js/,
			},
			{ js: "OutSystemsDebugger", weight: 50 },
		],
	},
	// CMS
	{
		id: "wordpress",
		name: "WordPress",
		website: "https://wordpress.org",
		category: "CMS",
		signals: [
			{ meta: ["generator", /^WordPress ([\d.]+)/i] },
			{ resource: /\/wp-(content|includes)\// },
		],
	},
	{
		id: "ghost",
		name: "Ghost",
		website: "https://ghost.org",
		category: "CMS",
		signals: [
			{ meta: ["generator", /^Ghost ([\d.]+)/] },
			// Portal and search, which Ghost loads from jsDelivr
			{ resource: /cdn\.jsdelivr\.net\/ghost\/(?:portal|sodo-search)@/ },
		],
	},
	{
		id: "drupal",
		name: "Drupal",
		website: "https://www.drupal.org",
		category: "CMS",
		// Backdrop, a fork of Drupal 7, can answer to Drupal's name too
		unless: [{ js: "Backdrop.behaviors" }],
		signals: [
			// the major version, which Drupal writes to both
			{ meta: ["generator", /^Drupal (\d+)/] },
			{ header: ["x-generator", /^Drupal (\d+)/] },
			{ header: ["x-drupal-cache", /./] },
			{ header: ["x-drupal-dynamic-cache", /./] },
			{ js: "drupalSettings" },
			{ js: "Drupal.behaviors" },
			// what its form builder sets on each field, since Drupal 8
			{ dom: "[data-drupal-selector]" },
		],
	},
	{
		id: "joomla",
		name: "Joomla",
		website: "https://www.joomla.org",
		category: "CMS",
		signals: [
			{ meta: ["generator", /^Joomla!/] },
			{ js: "Joomla.getOptions" },
			// the options Joomla hands its scripts, since 3.7
			{ dom: "script.joomla-script-options" },
		],
	},
	{
		id: "aem",
		name: "Adobe Experience Manager",
		website:
			"https://business.adobe.com/products/experience-manager/adobe-experience-manager.html",
		category: "CMS",
		icon: "adobe",
		signals: [
			{ resource: /\/etc\.clientlibs\// },
			{ html: /["'(]\/content\/dam\//, weight: 50 },
		],
	},
	{
		id: "mediawiki",
		name: "MediaWiki",
		website: "https://www.mediawiki.org",
		category: "CMS",
		icon: "wikipedia",
		signals: [
			{ meta: ["generator", /^MediaWiki ([\d.]+)/] },
			{ js: "mw.config" },
		],
	},
	{
		id: "sanity",
		name: "Sanity",
		website: "https://www.sanity.io",
		category: "CMS",
		signals: [{ resource: /cdn\.sanity\.io\/(?:images|files)\// }],
	},
	// AI app builder
	{
		id: "v0",
		name: "v0",
		website: "https://v0.app",
		category: "AI app builder",
		// the generator its Next.js layout sets
		signals: [{ meta: ["generator", /^v0\.(?:app|dev)$/i] }],
	},
	{
		id: "lovable",
		name: "Lovable",
		website: "https://lovable.dev",
		category: "AI app builder",
		signals: [
			// the tags its template's index.html ships
			{ meta: ["author", /^Lovable$/] },
			{ meta: ["og:image", /lovable\.dev\/opengraph-image/] },
			{ meta: ["twitter:site", /^@lovable_dev$/] },
			{ resource: /cdn\.gpteng\.co\/gptengineer\.js/ },
			{
				url: /^https?:\/\/[\w-]+\.lovable\.app\//,
				label: "A site on lovable.app",
			},
		],
	},
	{
		id: "bolt",
		name: "Bolt",
		website: "https://bolt.new",
		category: "AI app builder",
		signals: [
			{ url: /^https?:\/\/[\w-]+\.bolt\.host\//, label: "A site on bolt.host" },
		],
	},
	{
		id: "replit",
		name: "Replit",
		website: "https://replit.com",
		category: "AI app builder",
		signals: [
			// the banner script its templates keep in production builds
			{ resource: /replit\.com\/public\/js\/replit-dev-banner\.js/ },
			{
				url: /^https?:\/\/[\w-]+\.replit\.app\//,
				label: "A site on replit.app",
			},
		],
	},
	{
		id: "base44",
		name: "Base44",
		website: "https://base44.com",
		category: "AI app builder",
		signals: [
			// its SDK calls the app's API on base44.app
			{ resource: /\/\/base44\.app\/api\// },
			{
				url: /^https?:\/\/[\w-]+\.base44\.app\//,
				label: "A site on base44.app",
			},
		],
	},
	// UI framework
	{
		id: "react",
		name: "React",
		website: "https://react.dev",
		category: "UI framework",
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
		category: "UI framework",
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
		category: "UI framework",
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
		category: "UI framework",
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
		id: "preact",
		name: "Preact",
		website: "https://preactjs.com",
		category: "UI framework",
		signals: [
			// the tree render() keeps on the element it renders into, under the
			// short name Preact's build gives `_children`
			{ domKey: "__k", exact: true },
			// Preact 8 kept each element's props under this key
			{ domKey: "__preactattr_" },
		],
	},
	{
		id: "angular",
		name: "Angular",
		website: "https://angular.dev",
		category: "UI framework",
		signals: [
			{ dom: "[ng-version]", attr: "ng-version" },
			{ js: "getAllAngularRootElements" },
		],
	},
	{
		id: "angularjs",
		name: "AngularJS",
		website: "https://angularjs.org",
		category: "UI framework",
		signals: [
			// AngularJS is 1.x; Angular, its successor, sets no such global
			{ js: "angular.version.full", value: /^1\./, version: true },
			{ dom: "[ng-app], [data-ng-app]", weight: 50 },
			// what it adds to the elements it binds, unless debug info is off
			{ classes: ["ng-scope", "ng-binding", "ng-isolate-scope"], weight: 50 },
		],
	},
	{
		id: "ember",
		name: "Ember",
		website: "https://emberjs.com",
		category: "UI framework",
		signals: [{ js: "Ember.VERSION", version: true }],
	},
	{
		id: "lit",
		name: "Lit",
		website: "https://lit.dev",
		category: "UI framework",
		signals: [
			{ js: "litElementVersions", version: true },
			{ js: "litHtmlVersions", version: true },
		],
	},
	{
		id: "alpinejs",
		name: "Alpine.js",
		website: "https://alpinejs.dev",
		category: "UI framework",
		signals: [
			{ js: "Alpine.version", version: true },
			{ dom: "[x-data]", weight: 50 },
		],
	},
	{
		id: "htmx",
		name: "htmx",
		website: "https://htmx.org",
		category: "UI framework",
		signals: [
			{ js: "htmx.version", version: true },
			{ attrPrefix: "hx-", weight: 50 },
		],
	},
	{
		id: "datastar",
		name: "Datastar",
		website: "https://data-star.dev",
		category: "UI framework",
		signals: [
			{
				resource: /starfederation\/datastar|\/datastar(?:-core)?(?:\.min)?\.js/,
			},
			{ attrPrefix: "data-signals", weight: 50 },
			{ attrPrefix: "data-on:", weight: 50 },
		],
	},
	{
		id: "backbone",
		name: "Backbone.js",
		website: "https://backbonejs.org",
		category: "UI framework",
		icon: "backbonedotjs",
		signals: [{ js: "Backbone.VERSION", version: true }],
	},
	{
		id: "knockout",
		name: "Knockout.js",
		website: "https://knockoutjs.com",
		category: "UI framework",
		signals: [{ js: "ko.version", version: true }],
	},
	{
		id: "hyperscript",
		name: "_hyperscript",
		website: "https://hyperscript.org",
		category: "UI framework",
		signals: [
			{ js: "_hyperscript" },
			{ resource: /_hyperscript(?:\.min)?\.js|hyperscript\.org@/ },
		],
	},
	{
		id: "turbo",
		name: "Turbo",
		website: "https://turbo.hotwired.dev",
		category: "UI framework",
		icon: "hotwire",
		signals: [
			{ js: "Turbo.session" },
			{ dom: "turbo-frame, turbo-stream-source" },
		],
	},
	{
		id: "stimulus",
		name: "Stimulus",
		website: "https://stimulus.hotwired.dev",
		category: "UI framework",
		signals: [
			{
				script: /Stimulus (\d+\.\d+\.\d+)\s+Copyright © \d{4} Basecamp/,
				label: "Stimulus banner",
			},
			// one of its errors, since 3.0
			{
				script: /Stimulus couldn't find a matching outlet\s+element/,
				label: "Stimulus outlet error",
			},
			// the Application the Rails generator puts on window
			{ js: "Stimulus.router" },
			// its action syntax: event->controller#method
			{ dom: "[data-action*='->'][data-action*='#']" },
		],
	},
	// JS library
	{
		id: "tanstack-router",
		name: "TanStack Router",
		website: "https://tanstack.com/router",
		category: "JS library",
		icon: "tanstack",
		signals: [{ js: "__TSR_ROUTER__" }],
	},
	{
		id: "jquery",
		name: "jQuery",
		website: "https://jquery.com",
		category: "JS library",
		signals: [{ js: "jQuery.fn.jquery", version: true }],
	},
	{
		id: "jquery-migrate",
		name: "jQuery Migrate",
		website: "https://github.com/jquery/jquery-migrate",
		category: "JS library",
		icon: "jquery",
		implies: ["jquery"],
		signals: [{ js: "jQuery.migrateVersion", version: true }],
	},
	{
		id: "threejs",
		name: "Three.js",
		website: "https://threejs.org",
		category: "JS library",
		signals: [{ js: "__THREE__", version: true }],
	},
	{
		id: "gsap",
		name: "GSAP",
		website: "https://gsap.com",
		category: "JS library",
		signals: [{ js: "gsap.version", version: true }],
	},
	{
		id: "mobx",
		name: "MobX",
		website: "https://mobx.js.org",
		category: "JS library",
		signals: [{ js: "__mobxGlobals" }, { js: "__mobxInstanceCount" }],
	},
	{
		id: "core-js",
		name: "core-js",
		website: "https://github.com/zloirock/core-js",
		category: "JS library",
		signals: [{ js: "__core-js_shared__.versions.0.version", version: true }],
	},
	{
		id: "prism",
		name: "Prism",
		website: "https://prismjs.com",
		category: "JS library",
		signals: [
			{ js: "Prism.languages" },
			{
				dom: "pre[class*='language-'] .token, code[class*='language-'] .token",
			},
		],
	},
	{
		id: "lodash",
		name: "Lodash",
		website: "https://lodash.com",
		category: "JS library",
		signals: [
			// Underscore has never left 1.x, so a `_.VERSION` of 2 or more is
			// Lodash, even a custom build without the functions below
			{ js: "_.VERSION", value: /^(?:[2-9]|\d{2,})\./, version: true },
			// flatMapDeep is Lodash's own: Underscore has no such function
			{ js: "_.flatMapDeep" },
		],
	},
	{
		id: "modernizr",
		name: "Modernizr",
		website: "https://modernizr.com",
		category: "JS library",
		signals: [{ js: "Modernizr._version", version: true }],
	},
	{
		id: "lazysizes",
		name: "LazySizes",
		website: "https://github.com/aFarkas/lazysizes",
		category: "JS library",
		signals: [
			{ script: /\/\*! lazysizes - v(\d+\.\d+\.\d+)/ },
			{ js: "lazySizes.cfg" },
			// the class it moves an image to once loaded, which other loaders
			// borrow
			{ classes: ["lazyloaded"], weight: 50 },
		],
	},
	{
		id: "popper",
		name: "Popper",
		website: "https://popper.js.org",
		category: "JS library",
		signals: [
			{ script: /@popperjs\/core v(\d+\.\d+\.\d+)/ },
			{ js: "Popper.createPopper" },
			// Popper 1
			{ js: "Popper.Defaults" },
			// on a tooltip or menu while it is open
			{ attrPrefix: "data-popper-" },
		],
	},
	{
		id: "underscore",
		name: "Underscore.js",
		website: "https://underscorejs.org",
		category: "JS library",
		icon: "underscoredotjs",
		// Lodash sets `_.VERSION` too, and has runInContext where Underscore
		// does not. A custom Lodash build may leave runInContext out, but
		// its version is 2 or more, and Underscore's has always been 1.x.
		unless: [{ js: "_.runInContext" }],
		signals: [{ js: "_.VERSION", value: /^1\./, version: true }],
	},
	{
		id: "moment",
		name: "Moment.js",
		website: "https://momentjs.com",
		category: "JS library",
		signals: [{ js: "moment.version", version: true }],
	},
	{
		id: "aos",
		name: "AOS",
		website: "https://michalsnik.github.io/aos/",
		category: "JS library",
		signals: [
			{ js: "AOS.refreshHard" },
			// the class it adds to each element it animates
			{ dom: "[data-aos].aos-init" },
		],
	},
	{
		id: "hammerjs",
		name: "Hammer.js",
		website: "https://hammerjs.github.io",
		category: "JS library",
		signals: [{ js: "Hammer.VERSION", version: true }],
	},
	{
		id: "katex",
		name: "KaTeX",
		website: "https://katex.org",
		category: "JS library",
		signals: [{ dom: ".katex" }, { css: /\.katex(?:-display)?\s*\{/ }],
	},
	// UI widget
	{
		id: "jquery-ui",
		name: "jQuery UI",
		website: "https://jqueryui.com",
		category: "UI widget",
		icon: "jquery",
		implies: ["jquery"],
		signals: [{ js: "jQuery.ui.version", version: true }],
	},
	{
		id: "slick",
		name: "Slick",
		website: "https://kenwheeler.github.io/slick/",
		category: "UI widget",
		implies: ["jquery"],
		signals: [
			{ js: "jQuery.fn.slick" },
			// the class it adds to each carousel it starts
			{ dom: ".slick-initialized" },
		],
	},
	{
		id: "swiper",
		name: "Swiper",
		website: "https://swiperjs.com",
		category: "UI widget",
		signals: [
			// the banner atop its scripts and stylesheets
			{
				script: /Swiper (\d+\.\d+\.\d+)\s+\*\s+Most modern mobile touch slider/,
			},
			{ css: /Swiper (\d+\.\d+\.\d+)\s+\*\s+Most modern mobile touch slider/ },
			// the class it adds to each slider it starts: `swiper-container-`
			// before Swiper 7
			{ dom: ".swiper-initialized, .swiper-container-initialized" },
			// Swiper Element, its web component
			{ dom: "swiper-container" },
		],
	},
	{
		id: "fancybox",
		name: "FancyBox",
		website: "https://fancyapps.com/fancybox/",
		category: "UI widget",
		signals: [
			// fancyBox 2 and 3, a jQuery plugin
			{ js: "jQuery.fancybox.version", version: true },
			// Fancybox 4 onwards, part of @fancyapps/ui
			{ js: "Fancybox.version", version: true },
			// its stylesheet, which a bundled Fancybox 4 onwards still ships
			{ css: /\.fancybox__container\b/ },
		],
	},
	{
		id: "lightbox",
		name: "Lightbox",
		website: "https://lokeshdhakar.com/projects/lightbox2/",
		category: "UI widget",
		implies: ["jquery"],
		signals: [
			{
				script: /Lightbox v(\d+\.\d+\.\d+)\s+\*\s+by Lokesh Dhakar/,
				label: "Lightbox banner",
			},
			{ js: "lightbox.imageCountLabel" },
			// the overlay it adds to every page it runs on, before any image
			// is opened
			{ dom: "#lightboxOverlay + #lightbox .lb-outerContainer" },
		],
	},
	{
		id: "owl-carousel",
		name: "Owl Carousel",
		website: "https://owlcarousel2.github.io/OwlCarousel2/",
		category: "UI widget",
		implies: ["jquery"],
		signals: [
			{
				script: /Owl Carousel v(\d+\.\d+\.\d+)\s+\*\s+Copyright 2013/,
				label: "Owl Carousel banner",
			},
			{ js: "jQuery.fn.owlCarousel" },
			// the class it adds to each carousel it starts, and the wrapper
			// Owl Carousel 1 built around the slides
			{ dom: ".owl-carousel.owl-loaded, .owl-wrapper-outer" },
		],
	},
	{
		id: "isotope",
		name: "Isotope",
		website: "https://isotope.metafizzy.co",
		category: "UI widget",
		signals: [
			{
				script: /Isotope PACKAGED v(\d+\.\d+\.\d+)/,
				label: "Isotope banner",
			},
			{ js: "Isotope.LayoutMode" },
			// Isotope 1, a jQuery plugin
			{ js: "jQuery.Isotope" },
		],
	},
	{
		id: "select2",
		name: "Select2",
		website: "https://select2.org",
		category: "UI widget",
		implies: ["jquery"],
		// SelectWoo, WooCommerce's fork, answers to the same plugin name and
		// writes the same classes
		unless: [{ js: "jQuery.fn.selectWoo" }],
		signals: [
			{
				script: /\/\*!\s*(?:\*\s*)?Select2 (\d+\.\d+\.\d+)/,
				label: "Select2 banner",
			},
			{ js: "jQuery.fn.select2.defaults" },
			// on each select it replaces, since Select2 4
			{ dom: "select.select2-hidden-accessible" },
		],
	},
	{
		id: "photoswipe",
		name: "PhotoSwipe",
		website: "https://photoswipe.com",
		category: "UI widget",
		signals: [
			// PhotoSwipe 5, its core and its lightbox
			{
				script:
					/PhotoSwipe(?: Lightbox)? (\d+\.\d+\.\d+) - https:\/\/photoswipe\.com/,
				label: "PhotoSwipe 5 banner",
			},
			// PhotoSwipe 4
			{
				script: /PhotoSwipe - v(\d+\.\d+\.\d+) - /,
				label: "PhotoSwipe 4 banner",
			},
			{ js: "PhotoSwipeUI_Default" },
			{ js: "PhotoSwipeLightbox" },
			// the sizes PhotoSwipe 5 needs on each link it opens, and the
			// template PhotoSwipe 4 needs in the page
			{ dom: "a[data-pswp-width], .pswp .pswp__scroll-wrap" },
		],
	},
	{
		id: "flickity",
		name: "Flickity",
		website: "https://flickity.metafizzy.co",
		category: "UI widget",
		signals: [
			{
				script: /Flickity PACKAGED v(\d+\.\d+\.\d+)/,
				label: "Flickity banner",
			},
			{ js: "Flickity.Cell" },
			// the class it adds to each carousel it starts
			{ dom: ".flickity-enabled" },
		],
	},
	// Component library
	{
		id: "tailwind-plus",
		name: "Tailwind Plus",
		website: "https://tailwindcss.com/plus",
		category: "Component library",
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
		category: "Component library",
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
		category: "Component library",
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
		category: "Component library",
		signals: [{ dom: "[data-headlessui-state], [id^='headlessui-']" }],
	},
	{
		id: "shadcn",
		name: "shadcn/ui",
		website: "https://ui.shadcn.com",
		category: "Component library",
		requires: ["tailwindcss"],
		signals: [
			// slot names only shadcn/ui writes
			{
				dom: "[data-slot='dropdown-menu-trigger'], [data-slot='dialog-content'], [data-slot='sidebar-provider'], [data-slot='navigation-menu']",
			},
			// HeroUI writes button and card slots too, so these need its theme
			{ dom: "[data-slot='button'], [data-slot='card']", weight: 50 },
			{ css: /--popover-foreground:/, weight: 50 },
		],
	},
	{
		id: "mui",
		name: "MUI",
		website: "https://mui.com",
		category: "Component library",
		implies: ["react"],
		signals: [
			{
				classes: [
					"MuiButtonBase-root",
					"MuiButton-root",
					"MuiSvgIcon-root",
					"MuiTypography-root",
					"MuiPaper-root",
					"MuiBox-root",
					"MuiStack-root",
					"MuiContainer-root",
				],
				min: 1,
			},
		],
	},
	{
		id: "chakra-ui",
		name: "Chakra UI",
		website: "https://chakra-ui.com",
		category: "Component library",
		icon: "chakraui",
		implies: ["react"],
		signals: [
			{ css: /--chakra-(?:colors|space|sizes|radii|fontSizes)-/ },
			{
				classes: [
					"chakra-button",
					"chakra-stack",
					"chakra-text",
					"chakra-heading",
					"chakra-container",
					"chakra-link",
					"chakra-icon",
				],
				min: 2,
			},
		],
	},
	{
		id: "mantine",
		name: "Mantine",
		website: "https://mantine.dev",
		category: "Component library",
		implies: ["react"],
		signals: [
			{ dom: "html[data-mantine-color-scheme]" },
			{ css: /--mantine-(?:color|spacing|radius|font-size)-/ },
		],
	},
	{
		id: "ant-design",
		name: "Ant Design",
		website: "https://ant.design",
		icon: "antdesign",
		category: "Component library",
		implies: ["react"],
		signals: [
			// the style tags its CSS-in-JS writes
			{ dom: "style[data-css-hash]" },
			{
				classes: [
					"ant-btn",
					"ant-layout",
					"ant-typography",
					"ant-space",
					"ant-input",
					"ant-menu",
					"ant-card",
					"ant-select",
					"ant-table",
					"ant-modal",
					"ant-form",
					"ant-dropdown",
				],
				min: 2,
			},
		],
	},
	{
		id: "element-plus",
		name: "Element Plus",
		website: "https://element-plus.org",
		category: "Component library",
		implies: ["vue"],
		signals: [{ css: /--el-color-primary:/ }],
	},
	{
		id: "angular-material",
		name: "Angular Material",
		website: "https://material.angular.dev",
		category: "Component library",
		implies: ["angular"],
		signals: [
			{ css: /--mat-sys-[a-z-]+:/ },
			{
				classes: [
					"mat-mdc-button",
					"mat-mdc-icon-button",
					"mat-mdc-form-field",
					"mat-mdc-card",
					"mat-mdc-tab",
					"mat-mdc-list",
					"mat-mdc-chip",
					"mat-mdc-menu-panel",
				],
				min: 1,
			},
		],
	},
	{
		id: "carbon",
		name: "Carbon",
		website: "https://carbondesignsystem.com",
		category: "Component library",
		signals: [
			{ css: /\.cds--[a-z]/ },
			{
				classes: [
					"cds--btn",
					"cds--header",
					"cds--side-nav",
					"cds--grid",
					"cds--text-input",
					"cds--list-box",
					"cds--modal",
					"cds--tabs",
				],
				min: 1,
			},
		],
	},
	{
		id: "heroui",
		name: "HeroUI",
		website: "https://www.heroui.com",
		category: "Component library",
		implies: ["react"],
		signals: [
			// HeroUI 3's stylesheet, by selectors only it writes
			{ css: /\.list-box-item__indicator|\.scroll-shadow--hide-scrollbar/ },
			// HeroUI 2, and NextUI as it was named before 2025
			{ css: /--(?:heroui|nextui)-(?:font-size|radius|background|primary)/ },
		],
	},
	{
		id: "kobalte",
		name: "Kobalte",
		website: "https://kobalte.dev",
		category: "Component library",
		implies: ["solid"],
		signals: [{ attrPrefix: "data-kb-" }],
	},
	{
		id: "daisyui",
		name: "daisyUI",
		website: "https://daisyui.com",
		category: "Component library",
		implies: ["tailwindcss"],
		signals: [
			{ css: /daisyUI ([\d.]+)/ },
			// a theme variable only daisyUI defines
			{ css: /--radius-selector:/ },
		],
	},
	{
		id: "flowbite",
		name: "Flowbite",
		website: "https://flowbite.com",
		category: "Component library",
		signals: [{ js: "initFlowbite" }, { js: "FlowbiteInstances" }],
	},
	{
		id: "react-aria",
		name: "React Aria",
		website: "https://react-spectrum.adobe.com/react-aria/",
		category: "Component library",
		implies: ["react"],
		signals: [{ attrPrefix: "data-react-aria-" }, { dom: "[data-rac]" }],
	},
	{
		id: "web-awesome",
		name: "Web Awesome",
		website: "https://webawesome.com",
		category: "Component library",
		icon: "webawesome",
		signals: [
			{
				dom: "wa-button, wa-icon, wa-input, wa-dialog, wa-dropdown, wa-tooltip, wa-card, wa-tab-group, wa-select, wa-switch",
			},
		],
	},
	// CSS framework
	{
		id: "yummacss",
		name: "Yumma CSS",
		website: "https://yummacss.com",
		category: "CSS framework",
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
		category: "CSS framework",
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
		category: "CSS framework",
		signals: [
			{ css: /Bootstrap\s+v([\d.]+)/ },
			{ js: "bootstrap.Tooltip.VERSION", version: true },
		],
	},
	{
		id: "bulma",
		name: "Bulma",
		website: "https://bulma.io",
		category: "CSS framework",
		signals: [
			{ css: /bulma\.io v([\d.]+)/ },
			{ css: /--bulma-(?:scheme|primary|control)-/ },
		],
	},
	{
		id: "animate-css",
		name: "Animate.css",
		website: "https://animate.style",
		category: "CSS framework",
		signals: [
			// the banner atop its stylesheet, under each of the sites it has had
			{
				css: /animate\.css -\s?https?:\/\/\S+\s+\*\s+Version - (\d+\.\d+\.\d+)/,
			},
			// the class every animation needs since Animate.css 4
			{ classes: ["animate__animated"] },
		],
	},
	// CSS-in-JS
	{
		id: "stylex",
		name: "StyleX",
		website: "https://stylexjs.com",
		category: "CSS-in-JS",
		signals: [
			// StyleX compiles every style to an atomic class named x and a hash,
			// so its elements carry runs of them
			{
				html: /class="(?:x[0-9a-z]{5,9} ){4,}x[0-9a-z]{5,9}"/,
				label: "Runs of atomic classes like x1n2onr6",
			},
		],
	},
	{
		id: "styled-components",
		name: "styled-components",
		website: "https://styled-components.com",
		category: "CSS-in-JS",
		icon: "styledcomponents",
		signals: [
			{ dom: "style[data-styled-version]", attr: "data-styled-version" },
			{ dom: "style[data-styled]" },
		],
	},
	{
		id: "emotion",
		name: "Emotion",
		website: "https://emotion.sh",
		category: "CSS-in-JS",
		signals: [{ dom: "style[data-emotion]" }],
	},
	// Icon set
	{
		id: "lucide",
		name: "Lucide",
		website: "https://lucide.dev",
		category: "Icon set",
		// lucide-react and the lucide package both write the icon's name as a class
		signals: [{ dom: "svg.lucide" }],
	},
	{
		id: "tabler-icons",
		name: "Tabler Icons",
		website: "https://tabler.io/icons",
		category: "Icon set",
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
		category: "Icon set",
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
		category: "Icon set",
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
		category: "Icon set",
		icon: "radix",
		// drawn on a 15 grid, which is Radix Icons' own, but any 15px icon is
		// too, so it counts only beside Radix UI
		requires: ["radix"],
		signals: [{ dom: "svg[width='15'][height='15'][viewBox='0 0 15 15']" }],
	},
	{
		id: "hugeicons",
		name: "Hugeicons",
		website: "https://hugeicons.com",
		category: "Icon set",
		// its markup is a plain 24px SVG; its component keeps this prop name
		signals: [
			{
				script: /disableSecondaryOpacity\s*[:=]/,
				label: "the disableSecondaryOpacity prop",
			},
		],
	},
	{
		id: "font-awesome",
		name: "Font Awesome",
		website: "https://fontawesome.com",
		category: "Icon set",
		icon: "fontawesome",
		signals: [
			{ css: /Font Awesome (?:Free|Pro) ([\d.]+)/ },
			{
				resource: /kit\.fontawesome\.com|use\.fontawesome\.com|font-?awesome/i,
			},
			{ dom: "svg.svg-inline--fa" },
		],
	},
	// Font service
	{
		id: "google-fonts",
		name: "Google Fonts",
		website: "https://fonts.google.com",
		icon: "google",
		category: "Font service",
		signals: [{ resource: /fonts\.(?:googleapis|gstatic)\.com/ }],
	},
	{
		id: "adobe-fonts",
		name: "Adobe Fonts",
		website: "https://fonts.adobe.com",
		category: "Font service",
		icon: "adobefonts",
		signals: [{ resource: /use\.typekit\.net\/|p\.typekit\.net\// }],
	},
	// Build tool
	{
		id: "vite",
		name: "Vite",
		website: "https://vite.dev",
		category: "Build tool",
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
		category: "Build tool",
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
		category: "Build tool",
		signals: [
			{ js: "TURBOPACK" },
			{ resource: /\/_next\/static\/chunks\/turbopack-/ },
		],
	},
	{
		id: "webpack",
		name: "Webpack",
		website: "https://webpack.js.org",
		category: "Build tool",
		signals: [{ jsPrefix: "webpackChunk" }, { js: "webpackJsonp" }],
	},
	{
		id: "parcel",
		name: "Parcel",
		website: "https://parceljs.org",
		category: "Build tool",
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
		// github.com sends the same server header as the sites it hosts
		unless: [{ url: /^https?:\/\/(?:[\w-]+\.)*github\.com\// }],
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
	{
		id: "heroku",
		name: "Heroku",
		website: "https://www.heroku.com",
		category: "Hosting",
		// its routers: vegur, the newer heroku-router, and Private Spaces'
		signals: [{ header: ["via", /\b(?:vegur|heroku-router|spaces-router)\b/] }],
	},
	{
		id: "deno-deploy",
		name: "Deno Deploy",
		website: "https://deno.com/deploy",
		icon: "deno",
		category: "Hosting",
		signals: [
			{ header: ["x-deno-trace-id", /./] },
			{ header: ["via", /deno-cluster\.net/] },
		],
	},
	{
		id: "platformsh",
		name: "Platform.sh",
		website: "https://upsun.com",
		icon: "platformdotsh",
		category: "Hosting",
		// Upsun, as it is now named, sends the same headers
		signals: [
			{ header: ["x-platform-router", /./] },
			{ header: ["x-platform-cluster", /./] },
		],
	},
	{
		id: "kinsta",
		name: "Kinsta",
		website: "https://kinsta.com",
		category: "Hosting",
		signals: [{ header: ["x-kinsta-cache", /./] }],
	},
	{
		id: "railway",
		name: "Railway",
		website: "https://railway.com",
		category: "Hosting",
		signals: [
			{ header: ["x-railway-request-id", /./] },
			{ header: ["x-railway-edge", /./] },
		],
	},
	{
		id: "aws",
		name: "Amazon Web Services",
		website: "https://aws.amazon.com",
		category: "Hosting",
		signals: [
			// Elastic Load Balancing names itself: awselb/2.0 for an
			// Application Load Balancer, awselb for a Classic one
			{ header: ["server", /^awselb(?:\/[\d.]+)?$/] },
			// API Gateway's request id
			{ header: ["x-amz-apigw-id", /./] },
		],
	},
	{
		id: "amazon-s3",
		name: "Amazon S3",
		website: "https://aws.amazon.com/s3",
		category: "Hosting",
		icon: "aws",
		implies: ["aws"],
		signals: [
			{ header: ["server", /^AmazonS3$/] },
			{ header: ["x-amz-bucket-region", /./] },
		],
	},
	{
		id: "hostinger",
		name: "Hostinger",
		website: "https://www.hostinger.com",
		category: "Hosting",
		// Hostinger's own CDN, in front of the sites it hosts
		signals: [
			{ header: ["server", /^hcdn$/] },
			{ header: ["x-hcdn-request-id", /./] },
		],
	},
	{
		id: "godaddy",
		name: "GoDaddy",
		website: "https://www.godaddy.com",
		category: "Hosting",
		// Websites + Marketing, GoDaddy's site builder, serves its images and
		// scripts from GoDaddy's own wsimg.com
		signals: [
			{ meta: ["generator", /Go Daddy Website Builder/] },
			{ resource: /^https:\/\/(?:img\d*|isteam)\.wsimg\.com\// },
		],
	},
	// CDN
	{
		id: "cloudfront",
		name: "Amazon CloudFront",
		website: "https://aws.amazon.com/cloudfront",
		category: "CDN",
		icon: "aws",
		implies: ["aws"],
		signals: [
			{ header: ["x-amz-cf-id", /./] },
			{ header: ["via", /cloudfront/i] },
		],
	},
	{
		id: "fastly",
		name: "Fastly",
		website: "https://www.fastly.com",
		category: "CDN",
		signals: [
			{ header: ["x-fastly-request-id", /./] },
			// the served-by name is Fastly's cache, the via its Varnish
			{ header: ["x-served-by", /^cache-[a-z0-9-]+$/i], weight: 50 },
			{ header: ["via", /varnish/i], weight: 50 },
		],
	},
	{
		id: "cdnjs",
		name: "cdnjs",
		website: "https://cdnjs.com",
		category: "CDN",
		signals: [{ resource: /^https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\// }],
	},
	{
		id: "jsdelivr",
		name: "jsDelivr",
		website: "https://www.jsdelivr.com",
		category: "CDN",
		signals: [{ resource: /^https:\/\/cdn\.jsdelivr\.net\// }],
	},
	{
		id: "unpkg",
		name: "unpkg",
		website: "https://unpkg.com",
		category: "CDN",
		signals: [{ resource: /^https:\/\/unpkg\.com\// }],
	},
	{
		id: "google-hosted-libraries",
		name: "Google Hosted Libraries",
		website: "https://developers.google.com/speed/libraries",
		category: "CDN",
		icon: "googlelogo",
		signals: [{ resource: /^https:\/\/ajax\.googleapis\.com\/ajax\/libs\// }],
	},
	// Web server
	{
		id: "nginx",
		name: "Nginx",
		website: "https://nginx.org",
		category: "Web server",
		signals: [{ header: ["server", /^nginx(?:\/([\d.]+))?/i] }],
	},
	{
		id: "apache",
		name: "Apache HTTP Server",
		website: "https://httpd.apache.org",
		category: "Web server",
		signals: [{ header: ["server", /^Apache(?:\/([\d.]+))?/] }],
	},
	{
		id: "envoy",
		name: "Envoy",
		website: "https://www.envoyproxy.io",
		category: "Web server",
		icon: "envoyproxy",
		signals: [
			{ header: ["server", /^envoy$/i] },
			{ header: ["x-envoy-upstream-service-time", /./] },
		],
	},
	{
		id: "litespeed",
		name: "LiteSpeed",
		website: "https://www.litespeedtech.com",
		category: "Web server",
		signals: [
			// "LiteSpeed", or "LiteSpeed/1.8.3 Open" from OpenLiteSpeed when it
			// shows its version
			{ header: ["server", /^LiteSpeed(?:\/([\d.]+))?/i] },
			// what its LSCache plugins send for a cached page
			{ header: ["x-litespeed-cache", /./] },
		],
	},
	{
		id: "iis",
		name: "IIS",
		website: "https://www.iis.net",
		category: "Web server",
		icon: "microsoft",
		signals: [{ header: ["server", /^Microsoft-IIS(?:\/([\d.]+))?/] }],
	},
	{
		id: "varnish",
		name: "Varnish",
		website: "https://varnish-cache.org",
		category: "Web server",
		// Fastly runs its own fork of Varnish and sends X-Varnish too
		unless: [
			{ header: ["x-fastly-request-id", /./] },
			{ header: ["x-served-by", /^cache-[a-z0-9-]+$/i] },
		],
		signals: [
			// "1.1 <host> (Varnish/6.0)", the Via it adds to each response
			{ header: ["via", /\(Varnish\/([\d.]+)\)/] },
			// the id of the request, and of the one that filled the cache
			{ header: ["x-varnish", /^\d+(?: \d+)?$/] },
		],
	},
	// Backend service
	{
		id: "supabase",
		name: "Supabase",
		website: "https://supabase.com",
		category: "Backend service",
		signals: [{ resource: /\.supabase\.co\// }],
	},
	{
		id: "firebase",
		name: "Firebase",
		website: "https://firebase.google.com",
		category: "Backend service",
		signals: [{ resource: /gstatic\.com\/firebasejs|\.firebaseapp\.com\// }],
	},
	// Auth
	{
		id: "clerk",
		name: "Clerk",
		website: "https://clerk.com",
		category: "Auth",
		signals: [
			{ js: "Clerk.version", version: true },
			{ resource: /clerk\.[\w.-]+\/npm\/@clerk/ },
		],
	},
	{
		id: "authjs",
		name: "Auth.js",
		website: "https://authjs.dev",
		category: "Auth",
		// the session its client fetches, at its default base path
		signals: [{ resource: /\/api\/auth\/session(?:\?|$)/ }],
	},
	{
		id: "okta",
		name: "Okta",
		website: "https://www.okta.com",
		category: "Auth",
		signals: [
			{
				resource:
					/\/\/[\w.-]+\.okta(?:preview|-emea)?\.com\/|global\.oktacdn\.com/,
			},
			{ resource: /okta-sign-in(?:\.min)?\.(?:js|css)/ },
		],
	},
	{
		id: "cognito",
		name: "Amazon Cognito",
		website: "https://aws.amazon.com/cognito",
		icon: "aws",
		category: "Auth",
		signals: [
			{
				resource:
					/cognito-idp\.[a-z0-9-]+\.amazonaws\.com|\.auth\.[a-z0-9-]+\.amazoncognito\.com/,
			},
		],
	},
	{
		id: "microsoft-entra",
		name: "Microsoft Entra ID",
		website:
			"https://www.microsoft.com/security/business/identity-access/microsoft-entra-id",
		icon: "microsoft",
		category: "Auth",
		signals: [
			{
				resource:
					/login\.microsoftonline\.com|aadcdn\.msauth\.net|alcdn\.msauth\.net/,
			},
		],
	},
	{
		id: "auth0",
		name: "Auth0",
		website: "https://auth0.com",
		category: "Auth",
		signals: [
			// a tenant's own domain, which the SDK calls to sign in and refresh
			{ resource: /\/\/[\w.-]+\.auth0\.com\// },
		],
	},
	{
		id: "google-sign-in",
		name: "Sign in with Google",
		website: "https://developers.google.com/identity/gsi/web",
		category: "Auth",
		icon: "googlesignin",
		signals: [{ resource: /accounts\.google\.com\/gsi\/client/ }],
	},
	{
		id: "apple-sign-in",
		name: "Sign in with Apple",
		website: "https://developer.apple.com/sign-in-with-apple",
		category: "Auth",
		icon: "apple",
		signals: [{ resource: /appleid\.cdn-apple\.com\/appleauth\// }],
	},
	// Payments
	{
		id: "stripe",
		name: "Stripe",
		website: "https://stripe.com",
		category: "Payments",
		signals: [{ resource: /js\.stripe\.com/ }],
	},
	{
		id: "paypal",
		name: "PayPal",
		website: "https://developer.paypal.com",
		category: "Payments",
		signals: [
			// the JavaScript SDK and the older checkout.js
			{ resource: /paypal\.com\/sdk\/js|paypalobjects\.com\/api\/checkout/ },
			{ js: "paypal.version", version: true },
			{ dom: "[data-paypal-button], .paypal-buttons" },
		],
	},
	{
		id: "lemon-squeezy",
		name: "Lemon Squeezy",
		website: "https://www.lemonsqueezy.com",
		category: "Payments",
		icon: "lemonsqueezy",
		signals: [
			{
				resource:
					/app\.lemonsqueezy\.com\/js\/lemon\.js|assets\.lemonsqueezy\.com\/lemon\.js/,
			},
			{ js: "LemonSqueezy" },
		],
	},
	{
		id: "paddle",
		name: "Paddle",
		website: "https://www.paddle.com",
		category: "Payments",
		signals: [
			{ resource: /cdn\.paddle\.com\/paddle\// },
			{ js: "Paddle.Checkout" },
		],
	},
	{
		id: "polar",
		name: "Polar",
		website: "https://polar.sh",
		category: "Payments",
		signals: [
			{ resource: /@polar-sh\/checkout|polar\.sh\/.*embed/ },
			{ dom: "[data-polar-checkout]" },
		],
	},
	{
		id: "gumroad",
		name: "Gumroad",
		website: "https://gumroad.com",
		category: "Payments",
		signals: [{ resource: /gumroad\.com\/js\/gumroad/ }],
	},
	{
		id: "braintree",
		name: "Braintree",
		website: "https://www.braintreepayments.com",
		category: "Payments",
		signals: [{ resource: /js\.braintreegateway\.com\// }],
	},
	{
		id: "adyen",
		name: "Adyen",
		website: "https://www.adyen.com",
		category: "Payments",
		signals: [{ resource: /checkoutshopper-[a-z]+\.adyen\.com\// }],
	},
	{
		id: "square",
		name: "Square",
		website: "https://squareup.com",
		category: "Payments",
		signals: [
			{
				resource:
					/web\.squarecdn\.com\/v1\/square\.js|sandbox\.web\.squarecdn\.com/,
			},
		],
	},
	{
		id: "klarna",
		name: "Klarna",
		website: "https://www.klarna.com",
		category: "Payments",
		signals: [{ resource: /js\.klarna\.com\/|x\.klarnacdn\.net\// }],
	},
	// Analytics
	{
		id: "google-analytics",
		name: "Google Analytics",
		website: "https://marketingplatform.google.com/about/analytics",
		category: "Analytics",
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
		category: "Analytics",
		signals: [{ resource: /plausible\.io\/(?:js|api)/ }],
	},
	{
		id: "umami",
		name: "Umami",
		website: "https://umami.is",
		category: "Analytics",
		signals: [
			{ js: "umami.track" },
			{ resource: /cloud\.umami\.is\/script\.js/ },
		],
	},
	{
		id: "posthog",
		name: "PostHog",
		website: "https://posthog.com",
		category: "Analytics",
		signals: [{ js: "posthog.__loaded" }, { resource: /\.posthog\.com\// }],
	},
	{
		id: "vercel-analytics",
		name: "Vercel Analytics",
		website: "https://vercel.com/analytics",
		category: "Analytics",
		icon: "vercel",
		signals: [
			{
				resource:
					/\/_vercel\/insights\/script\.js|va\.vercel-scripts\.com\/v1\/script/,
			},
		],
	},
	{
		id: "fathom",
		name: "Fathom",
		website: "https://usefathom.com",
		category: "Analytics",
		signals: [{ resource: /cdn\.usefathom\.com\// }],
	},
	{
		id: "cloudflare-web-analytics",
		name: "Cloudflare Web Analytics",
		website: "https://www.cloudflare.com/web-analytics",
		category: "Analytics",
		icon: "cloudflare",
		signals: [{ resource: /static\.cloudflareinsights\.com\/beacon/ }],
	},
	{
		id: "microsoft-clarity",
		name: "Microsoft Clarity",
		website: "https://clarity.microsoft.com",
		category: "Analytics",
		signals: [
			// the tag, then the script it loads, under a folder named for its version
			{ resource: /www\.clarity\.ms\/tag\// },
			{ resource: /scripts\.clarity\.ms\/(\d+\.\d+\.\d+[\w.-]*)\/clarity\.js/ },
		],
	},
	{
		id: "yandex-metrica",
		name: "Yandex Metrica",
		website: "https://metrica.yandex.com",
		category: "Analytics",
		signals: [
			// tag.js, and watch.js before it
			{ resource: /mc\.yandex\.[a-z.]+\/metrika\/(?:tag|watch)\w*\.js/ },
			{ js: "Ya.Metrika2" },
			{ js: "Ya.Metrika" },
		],
	},
	{
		id: "snowplow",
		name: "Snowplow",
		website: "https://snowplow.io",
		category: "Analytics",
		signals: [
			// where its snippet queues the name the tracker answers to
			{ js: "GlobalSnowplowNamespace" },
			// the banner atop sp.js, which sites mostly host themselves
			{
				script: /Web analytics for Snowplow v(\d+\.\d+\.\d+)/,
				label: "Web analytics for Snowplow",
			},
		],
	},
	{
		id: "matomo",
		name: "Matomo",
		website: "https://matomo.org",
		category: "Analytics",
		signals: [
			// the tracker, which still answers to Piwik, its old name
			{ js: "Matomo.getAsyncTrackers" },
			{ js: "Piwik.getAsyncTrackers" },
			{
				script:
					/\/\*!!\s*\*\s*(?:Matomo|Piwik) - free\/libre analytics platform/,
				label: "Matomo - free/libre analytics platform",
			},
			{ resource: /cdn\.matomo\.cloud\// },
			// the queue its snippet fills before the tracker loads, which
			// trackers forked from Piwik use too
			{ js: "_paq", weight: 50 },
		],
	},
	{
		id: "hotjar",
		name: "Hotjar",
		website: "https://www.hotjar.com",
		category: "Analytics",
		signals: [
			// its snippet's settings, then the site's own settings it loads
			{ js: "_hjSettings" },
			{ js: "hjSiteSettings" },
			{ resource: /static\.hotjar\.com\/c\/hotjar-|script\.hotjar\.com\// },
		],
	},
	{
		id: "hubspot-analytics",
		name: "HubSpot Analytics",
		website: "https://www.hubspot.com/products/marketing/analytics",
		category: "Analytics",
		icon: "hubspot",
		signals: [
			// the queue its tracking code reads
			{ js: "_hsq" },
			{
				resource:
					/js\.hs-scripts\.com\/\d+\.js|js\.hs-analytics\.net\/analytics\//,
			},
		],
	},
	// Monitoring
	{
		id: "sentry",
		name: "Sentry",
		website: "https://sentry.io",
		category: "Monitoring",
		signals: [
			{ js: "__SENTRY__" },
			{ resource: /browser\.sentry-cdn\.com|\.ingest\.(?:\w+\.)?sentry\.io/ },
		],
	},
	{
		id: "vercel-speed-insights",
		name: "Vercel Speed Insights",
		website: "https://vercel.com/docs/speed-insights",
		category: "Monitoring",
		icon: "vercel",
		signals: [
			{
				resource:
					/\/_vercel\/speed-insights\/script\.js|va\.vercel-scripts\.com\/v1\/speed-insights/,
			},
		],
	},
	{
		id: "datadog-rum",
		name: "Datadog RUM",
		website: "https://www.datadoghq.com/product/real-user-monitoring",
		category: "Monitoring",
		icon: "datadog",
		signals: [
			{ js: "DD_RUM.version", version: true },
			{ resource: /datadoghq-browser-agent\.com|browser-intake-datadoghq/ },
		],
	},
	{
		id: "new-relic",
		name: "New Relic",
		website: "https://newrelic.com/platform/browser-monitoring",
		category: "Monitoring",
		icon: "newrelic",
		signals: [
			// the agent and its loader both keep their state here
			{ js: "NREUM" },
			// the agent's own files carry its version, as nr-spa-1.324.1.min.js
			{
				resource:
					/js-agent\.newrelic\.com\/nr-[a-z-]*?(\d+\.\d+\.\d+)(?:\.min)?\.js/,
			},
			{
				resource:
					/js-agent\.newrelic\.com\/|\/\/bam(?:-cell)?\.(?:eu01\.)?nr-data\.net\//,
			},
		],
	},
	// Ads & tags
	{
		id: "google-tag-manager",
		name: "Google Tag Manager",
		website: "https://tagmanager.google.com",
		category: "Ads & tags",
		icon: "googletagmanager",
		signals: [
			{ resource: /googletagmanager\.com\/gtm\.js/ },
			{ js: "google_tag_manager" },
		],
	},
	{
		id: "adobe-launch",
		name: "Adobe Launch",
		website:
			"https://experienceleague.adobe.com/en/docs/experience-platform/tags/home",
		category: "Ads & tags",
		icon: "adobe",
		signals: [
			{ js: "_satellite.buildInfo.turbineVersion" },
			{ resource: /assets\.adobedtm\.com\// },
		],
	},
	{
		id: "buysellads",
		name: "BuySellAds",
		website: "https://www.buysellads.com",
		category: "Ads & tags",
		signals: [{ resource: /srv\.buysellads\.com|cdn\.carbonads\.com/ }],
	},
	{
		id: "google-publisher-tag",
		name: "Google Publisher Tag",
		website: "https://developers.google.com/publisher-tag",
		category: "Ads & tags",
		icon: "googlelogo",
		signals: [
			{
				resource:
					/securepubads\.g\.doubleclick\.net\/tag\/js\/gpt\.js|googletagservices\.com\/tag\/js\/gpt\.js/,
			},
			{ js: "googletag.apiReady" },
		],
	},
	{
		id: "prebid",
		name: "Prebid.js",
		website: "https://prebid.org",
		category: "Ads & tags",
		signals: [{ js: "pbjs.version", version: true }],
	},
	{
		id: "amazon-ads",
		name: "Amazon Ads",
		website: "https://advertising.amazon.com",
		category: "Ads & tags",
		signals: [{ resource: /c\.amazon-adsystem\.com\// }],
	},
	{
		id: "facebook-pixel",
		name: "Facebook Pixel",
		website: "https://www.facebook.com/business/tools/meta-pixel",
		category: "Ads & tags",
		icon: "meta",
		signals: [
			// fbevents.js writes its version over the snippet's 2.0
			{ js: "fbq.version", version: true },
			{
				resource:
					/connect\.facebook\.net\/[\w-]+\/fbevents\.js|connect\.facebook\.net\/signals\/config\//,
			},
		],
	},
	{
		id: "tiktok-pixel",
		name: "TikTok Pixel",
		website: "https://ads.tiktok.com/help/article/tiktok-pixel",
		category: "Ads & tags",
		icon: "tiktok",
		signals: [
			// the name its snippet keeps the queue under, which events.js reads
			{ js: "TiktokAnalyticsObject" },
			{ resource: /analytics\.tiktok\.com\/i18n\/pixel\// },
		],
	},
	{
		id: "linkedin-insight",
		name: "LinkedIn Insight Tag",
		website: "https://business.linkedin.com/marketing-solutions/insight-tag",
		category: "Ads & tags",
		icon: "linkedin",
		signals: [
			// the partner ids its snippet pushes for insight.min.js to read
			{ js: "_linkedin_data_partner_ids" },
			{ resource: /snap\.licdn\.com\/li\.lms-analytics\/insight/ },
		],
	},
	// Search
	{
		id: "algolia",
		name: "Algolia",
		website: "https://www.algolia.com",
		category: "Search",
		signals: [{ resource: /\.algolia(?:net)?\.(?:com|net)\// }],
	},
	{
		id: "docsearch",
		name: "Algolia DocSearch",
		website: "https://docsearch.algolia.com",
		category: "Search",
		icon: "algolia",
		implies: ["algolia"],
		signals: [
			{ dom: ".DocSearch-Button, .DocSearch" },
			{ css: /--docsearch-/ },
		],
	},
	// Video
	{
		id: "youtube",
		name: "YouTube",
		website: "https://www.youtube.com",
		category: "Video",
		signals: [
			// the player YouTube's embed code puts in an iframe, from either
			// of its domains; a link to a video only points at youtube.com/watch
			{
				dom: "iframe[src*='youtube.com/embed/'], iframe[src*='youtube-nocookie.com/embed/']",
			},
			{ resource: /\/\/www\.youtube(?:-nocookie)?\.com\/embed\// },
			// the IFrame Player API, and the script it loads
			{ js: "YT.Player" },
			{
				resource:
					/\/\/www\.youtube\.com\/(?:iframe_api|s\/player\/\w+\/www-widgetapi)/,
			},
		],
	},
	{
		id: "vimeo",
		name: "Vimeo",
		website: "https://vimeo.com",
		category: "Video",
		signals: [
			// the player Vimeo's embed code puts in an iframe
			{ dom: "iframe[src*='player.vimeo.com/video/']" },
			{ resource: /\/\/player\.vimeo\.com\/video\/\d/ },
			// its Player SDK, from player.vimeo.com/api/player.js or npm
			{ js: "Vimeo.Player" },
			{
				script: /\/\*! @vimeo\/player v\d+\.\d+\.\d+ \| \(c\) \d{4} Vimeo/,
				label: "@vimeo/player banner",
			},
		],
	},
	{
		id: "videojs",
		name: "Video.js",
		website: "https://videojs.com",
		category: "Video",
		signals: [
			{ js: "videojs.VERSION", version: true },
			{
				script: /\* Video\.js (\d+\.\d+\.\d+) <http:\/\/videojs\.com\/>/,
				label: "Video.js banner",
			},
			// what it puts on the player it builds around a <video>; a page
			// that only borrows its video-js class gets no control bar
			{ classes: ["video-js", "vjs-tech", "vjs-control-bar"], min: 2 },
		],
	},
	// Maps
	{
		id: "google-maps",
		name: "Google Maps",
		website: "https://mapsplatform.google.com",
		category: "Maps",
		icon: "googlemaps",
		signals: [
			// the release of the Maps JavaScript API the page loaded
			{ js: "google.maps.version", version: true },
			{ resource: /\/\/maps\.googleapis\.com\/maps\/api\/js\b/ },
			// a map embedded as an iframe; a link to a place only points at
			// google.com/maps
			{ dom: "iframe[src*='google.com/maps/embed']" },
			{ resource: /\/\/(?:www\.|maps\.)?google\.com\/maps\/embed\b/ },
		],
	},
	{
		id: "leaflet",
		name: "Leaflet",
		website: "https://leafletjs.com",
		category: "Maps",
		signals: [
			{
				script:
					/Leaflet (\d+\.\d+\.\d+)(?:\+[\w.-]+)?, a JS library for interactive maps/,
				label: "Leaflet banner",
			},
			// the global its build sets; L is a short name, so it counts only
			// with a version, and only as half
			{ js: "L.version", value: /^\d+\.\d+\.\d+/, version: true, weight: 50 },
			// what it puts on a map it draws; its stylesheet alone puts none
			{
				classes: ["leaflet-container", "leaflet-pane", "leaflet-map-pane"],
				min: 2,
			},
		],
	},
	// Bot protection
	{
		id: "datadome",
		name: "DataDome",
		website: "https://datadome.co",
		category: "Bot protection",
		signals: [
			{ resource: /js\.datadome\.co\/|captcha-delivery\.com/ },
			{ js: "ddjskey" },
		],
	},
	{
		id: "turnstile",
		name: "Cloudflare Turnstile",
		website:
			"https://www.cloudflare.com/application-services/products/turnstile/",
		icon: "cloudflare",
		category: "Bot protection",
		signals: [
			{ resource: /challenges\.cloudflare\.com\/turnstile\// },
			{ js: "turnstile.render" },
		],
	},
	{
		id: "recaptcha",
		name: "reCAPTCHA",
		website: "https://developers.google.com/recaptcha",
		icon: "googlesignin",
		category: "Bot protection",
		// only its script: hCaptcha defines window.grecaptcha too
		signals: [
			{
				resource:
					/(?:google\.com|recaptcha\.net)\/recaptcha\/|gstatic\.com\/recaptcha\//,
			},
		],
	},
	{
		id: "hcaptcha",
		name: "hCaptcha",
		website: "https://www.hcaptcha.com",
		category: "Bot protection",
		signals: [
			{ resource: /\/\/(?:js\.|newassets\.)?hcaptcha\.com\// },
			{ js: "hcaptcha.render" },
		],
	},
	// Cookie consent
	{
		id: "onetrust",
		name: "OneTrust",
		website: "https://www.onetrust.com",
		category: "Cookie consent",
		signals: [
			{ resource: /cdn\.cookielaw\.org\/|otSDKStub\.js|otBannerSdk\.js/ },
		],
	},
	{
		id: "funding-choices",
		name: "Funding Choices",
		website: "https://support.google.com/fundingchoices",
		category: "Cookie consent",
		icon: "googlelogo",
		signals: [
			// the consent messages Google serves for AdSense, Ad Manager and
			// AdMob, as Privacy & messaging
			{ resource: /\/\/fundingchoicesmessages\.google\.com\// },
			// what that script adds to the googlefc queue the tag sets up
			{ js: "googlefc.ConsentStatusEnum" },
		],
	},
	{
		id: "cookieyes",
		name: "CookieYes",
		website: "https://www.cookieyes.com",
		category: "Cookie consent",
		signals: [
			{ resource: /\/\/cdn-cookieyes\.com\// },
			// what its banner script sets, also from its WordPress plugin
			{ js: "getCkyConsent" },
			{ dom: ".cky-consent-container" },
		],
	},
	{
		id: "cookiebot",
		name: "Cookiebot",
		website: "https://www.cookiebot.com",
		category: "Cookie consent",
		signals: [
			{ resource: /\/\/consent\.cookiebot\.(?:com|eu)\// },
			{ js: "Cookiebot.renew" },
			{ dom: "#CybotCookiebotDialog" },
		],
	},
	{
		id: "iubenda",
		name: "iubenda",
		website: "https://www.iubenda.com",
		category: "Cookie consent",
		signals: [
			// its consent and policy scripts; a link to a policy on
			// iubenda.com loads none of them
			{ resource: /\/\/cdn\.iubenda\.com\// },
			{ js: "_iub.csConfiguration" },
			{ dom: "#iubenda-cs-banner" },
		],
	},
	{
		id: "didomi",
		name: "Didomi",
		website: "https://www.didomi.io",
		category: "Cookie consent",
		signals: [
			// the host its SDK loads from
			{ resource: /\/\/sdk\.privacy-center\.org\// },
			{ js: "Didomi.getUserStatus" },
			{ dom: "#didomi-host" },
		],
	},
	// Customer support
	{
		id: "help-scout",
		name: "Help Scout",
		website: "https://www.helpscout.com",
		category: "Customer support",
		icon: "helpscout",
		signals: [{ resource: /beacon-v2\.helpscout\.net/ }],
	},
	{
		id: "crisp",
		name: "Crisp",
		website: "https://crisp.chat",
		category: "Customer support",
		signals: [
			{ resource: /client\.crisp\.chat\// },
			{ js: "CRISP_WEBSITE_ID" },
		],
	},
	{
		id: "intercom",
		name: "Intercom",
		website: "https://www.intercom.com",
		category: "Customer support",
		signals: [
			{ resource: /widget\.intercom\.io\/widget\/|js\.intercomcdn\.com\// },
			{ js: "intercomSettings" },
		],
	},
];
