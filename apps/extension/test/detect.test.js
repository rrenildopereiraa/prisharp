import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "vite-plus/test";
import { detect, probes } from "../src/detect.js";
import { categories, technologies } from "../src/technologies.js";

const page = (overrides = {}) => ({
	url: "https://example.com/",
	js: {},
	jsPrefix: [],
	dom: {},
	domKey: [],
	attrPrefix: [],
	classes: [],
	resources: [],
	meta: {},
	headers: {},
	html: "",
	css: "",
	script: {},
	file: [],
	...overrides,
});

const names = (found) =>
	found.map((tech) => [tech.name, tech.version].filter(Boolean).join(" "));

// what the collector finds when the page loaded these scripts
const scripts = (...texts) => {
	const hits = {};
	for (const { source, flags } of probes(technologies).script) {
		const match = texts
			.map((text) => new RegExp(source, flags).exec(text))
			.find(Boolean);
		if (match) hits[`${source}/${flags}`] = match[1] ?? true;
	}
	return hits;
};

test("every technology is well formed", () => {
	const ids = new Set(technologies.map((tech) => tech.id));
	assert.equal(ids.size, technologies.length, "ids are unique");
	for (const tech of technologies) {
		assert.ok(categories.includes(tech.category), `${tech.id} has a category`);
		assert.ok(new URL(tech.website), `${tech.id} has a website`);
		for (const id of [...(tech.implies ?? []), ...(tech.requires ?? [])]) {
			assert.ok(ids.has(id), `${tech.id} points at ${id}, which exists`);
		}
	}
});

test("probes ask the page only for what signals need", () => {
	const asked = probes(technologies);
	assert.ok(asked.js.includes("next.version"));
	assert.ok(asked.jsPrefix.includes("__sveltekit_"));
	assert.ok(asked.domKey.includes("__reactFiber$"));
	assert.ok(asked.dom.some((probe) => probe.attr === "ng-version"));
});

test("Next.js reads its version and implies React", () => {
	const found = detect(
		page({
			js: { "next.version": "16.4.2", TURBOPACK: true },
			headers: { "x-vercel-id": "gru1::x" },
		}),
		technologies,
		categories,
	);
	assert.deepEqual(names(found), [
		"Next.js 16.4.2",
		"React",
		"Turbopack",
		"Vercel",
	]);
});

test("each finding carries the evidence that matched", () => {
	const found = detect(
		page({
			js: { "next.version": "16.4.2" },
			headers: { "x-vercel-id": "gru1::x" },
		}),
		technologies,
		categories,
	);
	const evidence = (id) => found.find((tech) => tech.id === id).evidence;
	assert.deepEqual(evidence("nextjs"), [
		{ kind: "Global", text: "window.next.version", value: "16.4.2" },
	]);
	assert.deepEqual(evidence("react"), [
		{ kind: "Comes with", text: "Next.js" },
	]);
	assert.deepEqual(evidence("vercel"), [
		{ kind: "Header", text: "x-vercel-id", value: "gru1::x" },
	]);
});

test("a weak signal alone is not enough", () => {
	const html =
		'<script type="module" crossorigin src="/assets/index-XFbPZZqc.js"></script>';
	assert.deepEqual(names(detect(page({ html }), technologies)), []);

	const script = scripts(
		"(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return",
	);
	assert.deepEqual(names(detect(page({ html, script }), technologies)), [
		"Vite",
		"Rolldown",
	]);
});

test("Tailwind CSS reads its version from the banner", () => {
	const css =
		"/*! tailwindcss v4.3.3 | MIT License | https://tailwindcss.com */";
	assert.deepEqual(names(detect(page({ css }), technologies)), [
		"Tailwind CSS 4.3.3",
	]);
});

test("Yumma CSS shows from its stylesheet or its classes", () => {
	const css = ".ai\\:c{align-items:center}.d\\:f{display:flex}";
	assert.deepEqual(names(detect(page({ css }), technologies)), ["Yumma CSS"]);
	assert.deepEqual(
		names(detect(page({ classes: ["d:f", "jc:sb"] }), technologies)),
		["Yumma CSS"],
	);
	assert.deepEqual(names(detect(page({ classes: ["d:f"] }), technologies)), []);
});

test("versions come from attributes, sets and generators", () => {
	const found = detect(
		page({
			dom: { "[ng-version]|ng-version": "20.1.0" },
			js: { "__svelte.v": "5" },
			meta: { generator: "Astro v6.4.8" },
		}),
		technologies,
		categories,
	);
	assert.deepEqual(names(found), [
		"Astro 6.4.8",
		"Svelte 5",
		"Angular 20.1.0",
		"Vite",
	]);
});

test("Base UI shows from a trigger at rest or from any chunk", () => {
	const trigger = page({ attrPrefix: ["data-base-ui-"] });
	assert.deepEqual(names(detect(trigger, technologies)), ["Base UI"]);

	const chunk = page({
		script: scripts(
			"var app=1;",
			'var ke=Oe("https://base-ui.com/production-error");',
		),
	});
	assert.deepEqual(names(detect(chunk, technologies)), ["Base UI"]);
});

test("Yumma CSS shows from its config on a dev server", () => {
	const found = names(
		detect(page({ file: ["/yumma.config.mjs"] }), technologies),
	);
	assert.deepEqual(found, ["Yumma CSS"]);
});

test("Tailwind CSS shows without its banner", () => {
	// as Next.js minifies Tailwind v4, and as Tailwind v3 resets its variables
	const v4 =
		'@layer properties{@supports ((-webkit-hyphens:none)){*{--tw-font-weight:initial;--tw-shadow:0 0 #0000}}}@property --tw-shadow{syntax:"*";inherits:false}';
	const v3 =
		"*,:after,:before{--tw-border-spacing-x:0;--tw-ring-offset-shadow:0 0 #0000}";
	assert.deepEqual(names(detect(page({ css: v4 }), technologies)), [
		"Tailwind CSS",
	]);
	assert.deepEqual(names(detect(page({ css: v3 }), technologies)), [
		"Tailwind CSS",
	]);
});

test("icon libraries, from the markup and scripts their packages ship", () => {
	const found = (overrides) => names(detect(page(overrides), technologies));

	assert.deepEqual(found({ dom: { "svg.lucide|": true } }), ["Lucide"]);
	assert.deepEqual(found({ dom: { "svg.tabler-icon|": true } }), [
		"Tabler Icons",
	]);
	assert.deepEqual(
		found({
			dom: {
				"svg[width='15'][height='15'][viewBox='0 0 15 15']|": true,
				"[data-radix-collection-item], [data-radix-popper-content-wrapper], [data-radix-scroll-area-viewport], [id^='radix-']|": true,
			},
		}),
		["Radix UI", "Radix Icons"],
	);
	assert.deepEqual(
		found({
			dom: {
				"svg[width='1.5em'][height='1.5em'][color='currentColor']|": true,
			},
		}),
		["Iconoir"],
	);
	assert.deepEqual(
		found({
			script: scripts(
				'const o=r({color:"currentColor",size:"1em",weight:"regular",mirrored:!1});',
			),
		}),
		["Phosphor Icons"],
	);
	assert.deepEqual(
		found({
			script: scripts(
				'({color:e="currentColor",size:t=24,secondaryColor:n,disableSecondaryOpacity:r=!1})',
			),
		}),
		["Hugeicons"],
	);
	// a 256 grid at 1em alone is only half the evidence for Phosphor
	assert.deepEqual(
		found({ dom: { "svg[viewBox='0 0 256 256'][width='1em']|": true } }),
		[],
	);
});

test("the list of fingerprints does not read as what it lists", () => {
	// a page that ships this file, as a site about Prisharp might, is built
	// with none of what it describes
	const source = readFileSync(
		new URL("../src/technologies.js", import.meta.url),
		"utf8",
	);
	assert.deepEqual(
		names(detect(page({ script: scripts(source) }), technologies)),
		[],
	);
});

test(".NET shows from its runtime, and IIS alone is not enough", () => {
	const found = (overrides) => names(detect(page(overrides), technologies));
	assert.deepEqual(found({ headers: { "x-aspnet-version": "4.0.30319" } }), [
		"ASP.NET 4.0.30319",
	]);
	assert.deepEqual(found({ dom: { "input[name='__VIEWSTATE']|": true } }), [
		"ASP.NET",
	]);
	// IIS sends this header for PHP and static sites too
	assert.deepEqual(found({ headers: { "x-powered-by": "ASP.NET" } }), []);
	assert.deepEqual(
		found({ resources: ["https://example.com/_framework/blazor.web.js"] }),
		["Blazor"],
	);
});

test("small libraries read their version from their global", () => {
	const found = names(
		detect(
			page({
				js: {
					"Alpine.version": "3.14.9",
					"htmx.version": "2.0.4",
					"gsap.version": "3.13.0",
				},
			}),
			technologies,
		),
	);
	assert.deepEqual(found.sort(), [
		"Alpine.js 3.14.9",
		"GSAP 3.13.0",
		"htmx 2.0.4",
	]);
});

test("an attribute alone does not claim Alpine.js or htmx", () => {
	const found = names(
		detect(
			page({ dom: { "[x-data]|": true }, attrPrefix: ["hx-"] }),
			technologies,
		),
	);
	assert.deepEqual(found, []);
});

test("component libraries, from the classes and variables they ship", () => {
	const found = (overrides) => names(detect(page(overrides), technologies));
	assert.deepEqual(found({ classes: ["MuiButtonBase-root"] }), [
		"React",
		"MUI",
	]);
	assert.deepEqual(found({ css: ":root{--chakra-colors-gray-100:#f7fafc}" }), [
		"React",
		"Chakra UI",
	]);
	// one generic-looking class is not enough for Chakra
	assert.deepEqual(found({ classes: ["chakra-text"] }), []);
	assert.deepEqual(
		found({ dom: { "html[data-mantine-color-scheme]|": true } }),
		["React", "Mantine"],
	);
});

test("CSS-in-JS libraries, from the style tags they inject", () => {
	const found = (overrides) => names(detect(page(overrides), technologies));
	assert.deepEqual(
		found({
			dom: {
				"style[data-styled-version]|data-styled-version": "6.1.19",
				"style[data-styled]|": true,
			},
		}),
		["styled-components 6.1.19"],
	);
	assert.deepEqual(found({ dom: { "style[data-emotion]|": true } }), [
		"Emotion",
	]);
});

test("StyleX shows from runs of atomic classes, not from one", () => {
	const found = (html) => names(detect(page({ html }), technologies));
	assert.deepEqual(
		found('<div class="x1n2onr6 x1vjfegm x78zum5 xdt5ytf x1iyjqo2">'),
		["StyleX"],
	);
	assert.deepEqual(found('<div class="x1n2onr6 container">'), []);
	assert.deepEqual(found('<div class="xl xs xxl md lg">'), []);
});

test("Font Awesome reads its version from the stylesheet banner", () => {
	const css =
		"/*!\n * Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com";
	assert.deepEqual(names(detect(page({ css }), technologies)), [
		"Font Awesome 6.7.2",
	]);
});

test("Google Tag Manager and CloudFront, from what they load and send", () => {
	const found = names(
		detect(
			page({
				resources: ["https://www.googletagmanager.com/gtm.js?id=GTM-ABC123"],
				headers: {
					"x-amz-cf-id": "abc==",
					via: "1.1 abc.cloudfront.net (CloudFront)",
				},
			}),
			technologies,
		),
	);
	assert.deepEqual(found.sort(), ["Amazon CloudFront", "Google Tag Manager"]);
});

test("an Adobe stack: AEM, Launch, React Aria, MobX, core-js and S3", () => {
	const found = names(
		detect(
			page({
				resources: [
					"https://account.adobe.com/etc.clientlibs/account/clientlibs/main.js",
					"https://assets.adobedtm.com/abc/launch-123.min.js",
				],
				js: {
					"_satellite.buildInfo.turbineVersion": "29.0.0",
					__mobxGlobals: true,
					"__core-js_shared__.versions.0.version": "3.46.0",
				},
				attrPrefix: ["data-react-aria-"],
				headers: { server: "AmazonS3" },
			}),
			technologies,
		),
	);
	assert.deepEqual(found.sort(), [
		"Adobe Experience Manager",
		"Adobe Launch",
		"Amazon S3",
		"MobX",
		"React",
		"React Aria",
		"core-js 3.46.0",
	]);
});

test("a /content/dam/ path alone does not claim AEM", () => {
	const html = '<img src="/content/dam/photo.jpg">';
	assert.deepEqual(names(detect(page({ html }), technologies)), []);
});

test("Livewire brings Laravel, and LiveView brings Phoenix", () => {
	const found = (overrides) => names(detect(page(overrides), technologies));
	assert.deepEqual(found({ js: { Livewire: true } }).sort(), [
		"Laravel",
		"Livewire",
	]);
	assert.deepEqual(
		found({ dom: { "[data-phx-main], [data-phx-session]|": true } }).sort(),
		["Phoenix", "Phoenix LiveView"],
	);
	// wire: attributes alone are a hint, not proof
	assert.deepEqual(found({ attrPrefix: ["wire:"] }), []);
});

test("a 15px icon is Radix Icons only beside Radix UI", () => {
	const icon = { "svg[width='15'][height='15'][viewBox='0 0 15 15']|": true };
	assert.deepEqual(names(detect(page({ dom: icon }), technologies)), []);
});

test("servers and CDNs, from the headers they send", () => {
	const found = (headers) => names(detect(page({ headers }), technologies));
	assert.deepEqual(found({ server: "nginx/1.27.4" }), ["Nginx 1.27.4"]);
	assert.deepEqual(found({ server: "envoy" }), ["Envoy"]);
	assert.deepEqual(found({ "x-fastly-request-id": "abc" }), ["Fastly"]);
	// a Fastly-style name alone is a hint; with Fastly's Varnish it is proof
	assert.deepEqual(found({ "x-served-by": "cache-lis1490051-LIS" }), []);
	assert.deepEqual(
		found({ "x-served-by": "cache-lis1490051-LIS", via: "1.1 varnish" }),
		["Fastly"],
	);
});

test("ad, analytics and search services, from what they load", () => {
	const found = names(
		detect(
			page({
				js: {
					"pbjs.version": "v11.22.0",
					"DD_RUM.version": "6.21.0",
					litHtmlVersions: "1.1.2",
				},
				resources: [
					"https://nuxt.com/_vercel/insights/script.js",
					"https://use.typekit.net/abc.css",
					"https://cdn.cookielaw.org/scripttemplates/otSDKStub.js",
				],
				dom: { ".DocSearch-Button, .DocSearch|": true },
			}),
			technologies,
		),
	);
	assert.deepEqual(found.sort(), [
		"Adobe Fonts",
		"Algolia",
		"Algolia DocSearch",
		"Datadog RUM 6.21.0",
		"Lit 1.1.2",
		"OneTrust",
		"Prebid.js 11.22.0",
		"Vercel Analytics",
	]);
});

test("GitHub Pages shows for the sites GitHub hosts, not github.com", () => {
	const headers = { server: "GitHub.com" };
	const found = (url) => names(detect(page({ url, headers }), technologies));
	assert.deepEqual(found("https://yummacss.github.io/docs/"), ["GitHub Pages"]);
	assert.deepEqual(found("https://mantine.dev/"), ["GitHub Pages"]);
	assert.deepEqual(found("https://github.com/"), []);
	assert.deepEqual(found("https://gist.github.com/x"), []);
});

test("a version drops its build metadata", () => {
	const found = names(
		detect(
			page({ dom: { "[ng-version]|ng-version": "22.2.6+sha-2267937" } }),
			technologies,
		),
	);
	assert.deepEqual(found, ["Angular 22.2.6"]);
});

test("MediaWiki reads its version from the generator", () => {
	const meta = { generator: "MediaWiki 1.46.0-wmf.3" };
	assert.deepEqual(names(detect(page({ meta }), technologies)), [
		"MediaWiki 1.46.0",
	]);
});

test("PayPal, from its SDK", () => {
	const found = names(
		detect(
			page({
				resources: ["https://www.paypal.com/sdk/js?client-id=abc&currency=EUR"],
				js: { "paypal.version": "5.0.475" },
			}),
			technologies,
		),
	);
	assert.deepEqual(found, ["PayPal 5.0.475"]);
});

test("payment providers, from the checkout scripts they load", () => {
	const found = names(
		detect(
			page({
				resources: [
					"https://app.lemonsqueezy.com/js/lemon.js",
					"https://cdn.paddle.com/paddle/v2/paddle.js",
					"https://cdn.jsdelivr.net/npm/@polar-sh/checkout@0.1/dist/embed.global.js",
					"https://gumroad.com/js/gumroad.js",
					"https://js.braintreegateway.com/web/3.97.2/js/client.min.js",
					"https://checkoutshopper-live.adyen.com/checkoutshopper/sdk/5.0/adyen.js",
					"https://web.squarecdn.com/v1/square.js",
					"https://js.klarna.com/web-sdk/v1/klarna.js",
				],
			}),
			technologies,
		),
	);
	assert.deepEqual(found.sort(), [
		"Adyen",
		"Braintree",
		"Gumroad",
		"Klarna",
		"Lemon Squeezy",
		"Paddle",
		"Polar",
		"Square",
	]);
});

test("OutSystems, from its runtime scripts", () => {
	const resources = [
		"https://app.example.com/MyApp/scripts/OutSystemsReactView.js?abc",
	];
	assert.deepEqual(names(detect(page({ resources }), technologies)), [
		"OutSystems",
	]);
});
