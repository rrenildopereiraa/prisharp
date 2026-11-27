// Writes the svgl logos Prisharp ships into icons/tech, so the popup draws
// them from the extension itself. A technology without one here falls back
// to its site's favicon. Run `pnpm icons` after adding a technology.

import { writeFile } from "node:fs/promises";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const svgl = await import("@ridemountainpig/svgl-react");
const simple = await import("simple-icons");

// Icon name, then its Simple Icons mark, drawn in the brand's own color. The
// marks share one 24px grid, so they sit alike in the popup's boxes.
const marks = {
	adyen: "siAdyen",
	algolia: "siAlgolia",
	alpinejs: "siAlpinedotjs",
	amp: "siAmp",
	angular: "siAngular",
	antdesign: "siAntdesign",
	apache: "siApache",
	apple: "siApple",
	astro: "siAstro",
	auth0: "siAuth0",
	backbonedotjs: "siBackbonedotjs",
	"base-ui": "siBaseui",
	blazor: "siBlazor",
	bootstrap: "siBootstrap",
	braintree: "siBraintree",
	bulma: "siBulma",
	buysellads: "siBuysellads",
	chakraui: "siChakraui",
	clerk: "siClerk",
	cloudflare: "siCloudflare",
	daisyui: "siDaisyui",
	datadog: "siDatadog",
	deno: "siDeno",
	docusaurus: "siDocusaurus",
	dotnet: "siDotnet",
	drupal: "siDrupal",
	eleventy: "siEleventy",
	elm: "siElm",
	ember: "siEmberdotjs",
	envoyproxy: "siEnvoyproxy",
	express: "siExpress",
	fastly: "siFastly",
	fathom: "siFathom",
	figma: "siFigma",
	firebase: "siFirebase",
	fly: "siFlydotio",
	fontawesome: "siFontawesome",
	framer: "siFramer",
	gatsby: "siGatsby",
	ghost: "siGhost",
	godaddy: "siGodaddy",
	github: "siGithub",
	"google-analytics": "siGoogleanalytics",
	google: "siGooglefonts",
	googlesignin: "siGoogle",
	googletagmanager: "siGoogletagmanager",
	gsap: "siGsap",
	gumroad: "siGumroad",
	headlessui: "siHeadlessui",
	helpscout: "siHelpscout",
	heroui: "siHeroui",
	hexo: "siHexo",
	hostinger: "siHostinger",
	hotjar: "siHotjar",
	hotwire: "siHotwire",
	htmx: "siHtmx",
	hubspot: "siHubspot",
	hugo: "siHugo",
	inertia: "siInertia",
	intercom: "siIntercom",
	jekyll: "siJekyll",
	joomla: "siJoomla",
	jquery: "siJquery",
	jsdelivr: "siJsdelivr",
	kinsta: "siKinsta",
	klarna: "siKlarna",
	laravel: "siLaravel",
	lemonsqueezy: "siLemonsqueezy",
	lit: "siLit",
	livewire: "siLivewire",
	lodash: "siLodash",
	lucide: "siLucide",
	mantine: "siMantine",
	matomo: "siMatomo",
	meta: "siMeta",
	meteor: "siMeteor",
	mobx: "siMobx",
	mui: "siMui",
	netlify: "siNetlify",
	newrelic: "siNewrelic",
	nextjs: "siNextdotjs",
	nextra: "siNextra",
	nginx: "siNginx",
	nuxt: "siNuxt",
	okta: "siOkta",
	paddle: "siPaddle",
	paypal: "siPaypal",
	phoenixframework: "siPhoenixframework",
	phosphor: "siPhosphoricons",
	platformdotsh: "siPlatformdotsh",
	plausibleanalytics: "siPlausibleanalytics",
	posthog: "siPosthog",
	preact: "siPreact",
	qwik: "siQwik",
	radix: "siRadixui",
	railway: "siRailway",
	rails: "siRubyonrails",
	"react-router": "siReactrouter",
	react: "siReact",
	remix: "siRemix",
	render: "siRender",
	replit: "siReplit",
	rolldown: "siRolldown",
	sanity: "siSanity",
	sentry: "siSentry",
	shadcn: "siShadcnui",
	shopify: "siShopify",
	solidjs: "siSolid",
	square: "siSquare",
	squarespace: "siSquarespace",
	stimulus: "siStimulus",
	stripe: "siStripe",
	styledcomponents: "siStyledcomponents",
	supabase: "siSupabase",
	svelte: "siSvelte",
	swiper: "siSwiper",
	tailwindcss: "siTailwindcss",
	tanstack: "siTanstack",
	threejs: "siThreedotjs",
	tiktok: "siTiktok",
	umami: "siUmami",
	underscoredotjs: "siUnderscoredotjs",
	unpkg: "siUnpkg",
	v0: "siV0",
	vercel: "siVercel",
	vite: "siVite",
	vue: "siVuedotjs",
	webawesome: "siWebawesome",
	webflow: "siWebflow",
	webpack: "siWebpack",
	wikipedia: "siWikipedia",
	wix: "siWix",
	wordpress: "siWordpress",
};

// Icon name, then the svgl component, for marks Simple Icons lacks: one for
// both themes, or a light and a dark one.
const icons = {
	adobe: "Adobe",
	adobefonts: "AdobeFonts",
	authjs: "Authjs",
	bolt: ["BoltLight", "BoltDark"],
	aws: ["AmazonWebServicesLight", "AmazonWebServicesDark"],
	flowbite: "Flowbite",
	googlelogo: "Google",
	heroku: "Heroku",
	linkedin: "LinkedIn",
	lovable: "Lovable",
	microsoft: "Microsoft",
	hcaptcha: "HCaptcha",
	parcel: "Parcel",
	polar: ["PolarLight", "PolarDark"],
	turbopack: ["TurbopackLight", "TurbopackDark"],
};

// Logos neither has, kept in icons/tech as files: whether each has a dark
// variant. Each is the project's own, and a mark drawn in black gets a
// second file in the panel's dark ink.
// - Yumma CSS: the Yumma mark from its brand page, the same in both themes.
// - Tabler Icons, Iconoir, Hugeicons: each project's mark from its icon set
//   (brand-tabler, iconoir, HugeiconsIcon; all MIT), in the panel's ink.
// - Emotion: its drawing from the Emotion repository, scaled to 64px.
// - Prism: its triangle from its repository, in the panel's ink.
// - KaTeX: its wordmark from the KaTeX repository, in the panel's ink.
// - React Aria: its favicon from the React Spectrum repository, in its own
//   purple for each theme.
// - _hyperscript: its editor icon from its repository, with the "_" drawn
//   as a shape rather than set in a font.
// - Prebid: the orange mark of its logo from prebid.github.io.
// - core-js: Devicon's mark; StyleX: the mark from the svg-logos set; Amazon
//   Ads: Amazon's mark from Simple Icons' earlier releases, in its orange.
// - Crisp, OneTrust, OutSystems: the marks from their own websites,
//   OneTrust's in the panel's ink.
// - Element Plus, Kobalte, Carbon: from their own repositories, Kobalte's
//   as its app icon PNG; Angular Material: its pinned-tab mark from the
//   angular/components repository, in the panel's ink.
// - Rspress: the icon rspress.rs itself uses, from assets.rspack.rs.
// - Hydrogen: the mark of its logo from Shopify/hydrogen, with a dark ink
//   for its black half. Datastar: the rocket data-star.dev uses, kept as
//   pixel art. Knockout: the wordmark knockoutjs.com shows, without its
//   shadow, in the panel's ink.
// - Base44: the icon base44.com uses, as a PNG.
// - DataDome: its app icon from its documentation, which publishes it only
//   as a 180px PNG, so the file wraps that PNG with its corners rounded.
// - Modernizr: the mark of its logo from Modernizr/modernizr-neue, the
//   repository of modernizr.com, without the wordmark. Popper: its logo from
//   popperjs/website, the repository of popper.js.org. Moment.js: the favicon
//   from moment/momentjs.com, which publishes it only as a 32px PNG.
// - Slick, LazySizes: neither project has ever published a logo, so each is
//   its initial, drawn for Prisharp in the panel's ink.
// - Microsoft Clarity: the favicon clarity.microsoft.com serves, which it
//   publishes only as a 32px icon. Snowplow: the favicon snowplow.io serves.
// - Yandex Metrica: its site answers automated requests with a captcha and
//   its tag's repository has no logo, so it is its initial, in the panel's
//   ink, until its own mark is added.
// - cdnjs: the favicon cdnjs.com serves. LiteSpeed: the icon
//   litespeedtech.com serves, and Varnish the one varnish-cache.org serves,
//   both published only as PNGs.
// - FancyBox: the favicon fancyapps.com serves. Isotope, Flickity: the
//   drawing of each that Metafizzy's own sites show. Owl Carousel: Mr. Owl
//   from its site's header; Select2: the logo select2.org shows; both
//   published only as PNGs. Hammer.js, PhotoSwipe, Animate.css: the favicons
//   their sites serve, published only as 32px and 16px PNGs, Animate.css's
//   black diamond in the panel's dark ink for the dark theme.
// - Lightbox, AOS: neither project has published a logo, so each is its
//   initial, in the panel's ink.
// - AngularJS: its shield from the angular/angular.js repository, drawn
//   from the PDF it ships, the same in both themes.
const local = {
	"amazon-ads": false,
	"angular-material": true,
	angularjs: false,
	"animate-css": true,
	aos: true,
	base44: false,
	carbon: false,
	cdnjs: false,
	"core-js": true,
	crisp: false,
	datadome: false,
	datastar: false,
	"element-plus": false,
	emotion: false,
	fancybox: false,
	flickity: false,
	hammerjs: false,
	hugeicons: true,
	hydrogen: true,
	hyperscript: false,
	iconoir: true,
	isotope: false,
	katex: true,
	knockout: true,
	kobalte: false,
	lazysizes: true,
	lightbox: true,
	litespeed: false,
	"microsoft-clarity": false,
	modernizr: false,
	moment: false,
	onetrust: true,
	outsystems: false,
	"owl-carousel": false,
	photoswipe: false,
	popper: false,
	prebid: false,
	prism: true,
	rspress: false,
	"react-aria": true,
	select2: false,
	slick: true,
	snowplow: false,
	stylex: false,
	"tabler-icons": true,
	varnish: false,
	"yandex-metrica": true,
	yummacss: false,
};

const render = (name) => {
	const component = svgl[name];
	if (!component) throw new Error(`svgl has no ${name}`);
	return renderToStaticMarkup(
		createElement(component, { width: undefined, height: undefined }),
	);
};

/** How light a #rrggbb color is, 0 to 1. */
const lightness = (hex) => {
	const [r, g, b] = [0, 2, 4].map(
		(at) => Number.parseInt(hex.slice(at, at + 2), 16) / 255,
	);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const mark = (path, color) =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${color}" d="${path}"/></svg>`;

const manifest = { ...local };
for (const [icon, name] of Object.entries(marks)) {
	const found = simple[name];
	if (!found) throw new Error(`Simple Icons has no ${name}`);
	const { path, hex } = found;
	// a brand color that would vanish into Chrome's panel, light or dark,
	// draws in that panel's ink instead
	const light = lightness(hex);
	const brand = `#${hex}`;
	await writeFile(
		`icons/tech/${icon}.svg`,
		mark(path, light > 0.85 ? "#1f1f1f" : brand),
	);
	const variant = light < 0.25 || light > 0.85;
	if (variant) {
		await writeFile(
			`icons/tech/${icon}-dark.svg`,
			mark(path, light < 0.25 ? "#e3e3e3" : brand),
		);
	}
	manifest[icon] = variant;
}
for (const [icon, source] of Object.entries(icons)) {
	const [light, dark] = Array.isArray(source) ? source : [source];
	await writeFile(`icons/tech/${icon}.svg`, render(light));
	if (dark) await writeFile(`icons/tech/${icon}-dark.svg`, render(dark));
	manifest[icon] = Boolean(dark);
}

await writeFile(
	"src/icons.js",
	`// Generated by scripts/icons.mjs: icon name, and whether it has a dark variant.\n\nexport const icons = ${JSON.stringify(manifest, null, "\t")};\n`,
);
console.log(`Wrote ${Object.keys(manifest).length} icons.`);
