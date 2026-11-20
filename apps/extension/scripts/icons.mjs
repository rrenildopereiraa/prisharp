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
	angular: "siAngular",
	antdesign: "siAntdesign",
	apache: "siApache",
	apple: "siApple",
	astro: "siAstro",
	auth0: "siAuth0",
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
	docusaurus: "siDocusaurus",
	dotnet: "siDotnet",
	eleventy: "siEleventy",
	ember: "siEmberdotjs",
	envoyproxy: "siEnvoyproxy",
	fastly: "siFastly",
	fathom: "siFathom",
	figma: "siFigma",
	firebase: "siFirebase",
	fly: "siFlydotio",
	fontawesome: "siFontawesome",
	framer: "siFramer",
	gatsby: "siGatsby",
	ghost: "siGhost",
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
	hotwire: "siHotwire",
	htmx: "siHtmx",
	hugo: "siHugo",
	intercom: "siIntercom",
	jekyll: "siJekyll",
	jquery: "siJquery",
	klarna: "siKlarna",
	laravel: "siLaravel",
	lemonsqueezy: "siLemonsqueezy",
	lit: "siLit",
	livewire: "siLivewire",
	lodash: "siLodash",
	lucide: "siLucide",
	mantine: "siMantine",
	mobx: "siMobx",
	mui: "siMui",
	netlify: "siNetlify",
	nextjs: "siNextdotjs",
	nextra: "siNextra",
	nginx: "siNginx",
	nuxt: "siNuxt",
	paddle: "siPaddle",
	paypal: "siPaypal",
	phoenixframework: "siPhoenixframework",
	phosphor: "siPhosphoricons",
	plausibleanalytics: "siPlausibleanalytics",
	posthog: "siPosthog",
	qwik: "siQwik",
	radix: "siRadixui",
	"react-router": "siReactrouter",
	react: "siReact",
	remix: "siRemix",
	render: "siRender",
	rolldown: "siRolldown",
	sanity: "siSanity",
	sentry: "siSentry",
	shadcn: "siShadcnui",
	shopify: "siShopify",
	solidjs: "siSolid",
	square: "siSquare",
	stripe: "siStripe",
	styledcomponents: "siStyledcomponents",
	supabase: "siSupabase",
	svelte: "siSvelte",
	tailwindcss: "siTailwindcss",
	tanstack: "siTanstack",
	threejs: "siThreedotjs",
	umami: "siUmami",
	vercel: "siVercel",
	vite: "siVite",
	vue: "siVuedotjs",
	webawesome: "siWebawesome",
	webflow: "siWebflow",
	webpack: "siWebpack",
	wikipedia: "siWikipedia",
	wordpress: "siWordpress",
};

// Icon name, then the svgl component, for marks Simple Icons lacks: one for
// both themes, or a light and a dark one.
const icons = {
	adobe: "Adobe",
	adobefonts: "AdobeFonts",
	aws: ["AmazonWebServicesLight", "AmazonWebServicesDark"],
	flowbite: "Flowbite",
	googlelogo: "Google",
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
// - DataDome: its app icon from its documentation, which publishes it only
//   as a 180px PNG, so the file wraps that PNG with its corners rounded.
const local = {
	"amazon-ads": false,
	"angular-material": true,
	carbon: false,
	"core-js": true,
	crisp: false,
	datadome: false,
	"element-plus": false,
	emotion: false,
	hugeicons: true,
	hyperscript: false,
	iconoir: true,
	katex: true,
	kobalte: false,
	onetrust: true,
	outsystems: false,
	prebid: false,
	prism: true,
	rspress: false,
	"react-aria": true,
	stylex: false,
	"tabler-icons": true,
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
