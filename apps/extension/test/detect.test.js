import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "vite-plus/test";
import { detect, probes } from "../src/detect.js";
import { markdown } from "../src/markdown.js";
import { categories, technologies } from "../src/technologies.js";
import { README, render } from "../scripts/readme.mjs";
import { CHANGELOG, notes } from "../scripts/notes.mjs";

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

test("UI kits, from the classes, variables and banners they ship", () => {
	const found = names(
		detect(
			page({
				dom: { "style[data-css-hash]|": true },
				classes: ["ant-btn", "ant-layout", "mat-mdc-button", "cds--btn"],
				attrPrefix: ["data-kb-"],
				js: { initFlowbite: true },
				css: [
					"/*! bulma.io v1.0.4 | MIT License | github.com/jgthms/bulma */",
					"/*! 🌼 daisyUI 5.8.1 - MIT License */ :root{--radius-selector:.5rem}",
					":root{--el-color-primary:#409eff;--mat-sys-primary:#005cbb}",
					".cds--btn{display:flex}",
					":root{--heroui-radius-medium:12px}",
				].join("\n"),
			}),
			technologies,
		),
	);
	for (const name of [
		"Ant Design",
		"Element Plus",
		"Angular Material",
		"Carbon",
		"HeroUI",
		"Kobalte",
		"daisyUI 5.8.1",
		"Flowbite",
		"Bulma 1.0.4",
	]) {
		assert.ok(found.includes(name), `${name} in ${found.join(", ")}`);
	}
});

test("HeroUI's button and card slots alone are not shadcn/ui", () => {
	const found = names(
		detect(
			page({
				dom: { "[data-slot='button'], [data-slot='card']|": true },
				css: ".list-box-item__indicator{opacity:0} --tw-shadow:0 0 #0000",
			}),
			technologies,
		),
	);
	assert.ok(found.includes("HeroUI"), found.join(", "));
	assert.ok(!found.includes("shadcn/ui"), found.join(", "));
});

test("shadcn/ui shows from its own slots, or a button slot and its theme", () => {
	const tw = "--tw-shadow:0 0 #0000";
	for (const overrides of [
		{
			dom: {
				"[data-slot='dropdown-menu-trigger'], [data-slot='dialog-content'], [data-slot='sidebar-provider'], [data-slot='navigation-menu']|": true,
			},
			css: tw,
		},
		{
			dom: { "[data-slot='button'], [data-slot='card']|": true },
			css: `${tw} :root{--popover-foreground:oklch(0.1 0 0)}`,
		},
	]) {
		assert.ok(
			names(detect(page(overrides), technologies)).includes("shadcn/ui"),
		);
	}
});

test("one ant- class is not Ant Design", () => {
	const found = names(detect(page({ classes: ["ant-btn"] }), technologies));
	assert.ok(!found.includes("Ant Design"));
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
	assert.deepEqual(found.sort(), [
		"Amazon CloudFront",
		"Amazon Web Services",
		"Google Tag Manager",
	]);
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
		"Amazon Web Services",
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

test("ten hosts and servers, from the headers they send", () => {
	const found = (headers) => names(detect(page({ headers }), technologies));
	// headers as dnnsoftware.com, varnish-cache.org, litespeedtech.com,
	// orchardcore.net and a site on Hostinger send them
	assert.deepEqual(found({ server: "awselb/2.0" }), ["Amazon Web Services"]);
	assert.deepEqual(found({ "x-amz-apigw-id": "abc=" }), [
		"Amazon Web Services",
	]);
	assert.deepEqual(
		found({ via: "1.1 varnish (Varnish/6.0)", "x-varnish": "3964200" }),
		["Varnish 6.0"],
	);
	assert.deepEqual(found({ "x-varnish": "32770 3" }), ["Varnish"]);
	assert.deepEqual(found({ server: "LiteSpeed" }), ["LiteSpeed"]);
	assert.deepEqual(found({ server: "LiteSpeed/1.8.3 Open" }), [
		"LiteSpeed 1.8.3",
	]);
	assert.deepEqual(found({ "x-litespeed-cache": "hit" }), ["LiteSpeed"]);
	assert.deepEqual(found({ server: "Microsoft-IIS/10.0" }), ["IIS 10.0"]);
	assert.deepEqual(
		found({ server: "hcdn", "x-hcdn-request-id": "40e2b2bd-phx-edge12" }),
		["Hostinger"],
	);
});

test("look-alike headers claim none of the ten", () => {
	const found = (headers) => names(detect(page({ headers }), technologies));
	// Fastly's Varnish fork sends X-Varnish and a plain varnish Via
	assert.deepEqual(
		found({
			"x-fastly-request-id": "abc",
			"x-varnish": "123 456",
			via: "1.1 varnish",
		}),
		["Fastly"],
	);
	// a load balancer that only borrows the word, a request id any app sends
	assert.deepEqual(found({ server: "my-awselb-proxy" }), []);
	assert.deepEqual(found({ "x-amzn-requestid": "abc" }), []);
	assert.deepEqual(found({ server: "Microsoft-HTTPAPI/2.0" }), []);
	assert.deepEqual(found({ server: "hcdn-proxy" }), []);
	assert.deepEqual(found({ "x-varnish": "cached" }), []);
});

test("GoDaddy, from its site builder's tag and CDN", () => {
	const found = (overrides) => names(detect(page(overrides), technologies));
	assert.deepEqual(
		found({
			meta: {
				generator: "Starfield Technologies; Go Daddy Website Builder 8.0.0000",
			},
		}),
		["GoDaddy"],
	);
	assert.deepEqual(
		found({ resources: ["https://img1.wsimg.com/isteam/ip/abc/logo.png"] }),
		["GoDaddy"],
	);
	// a wsimg path on someone else's host is not GoDaddy's CDN
	assert.deepEqual(
		found({ resources: ["https://img1.wsimg.com.example.com/a.png"] }),
		[],
	);
});

test("library CDNs, from the URLs a page loads its files from", () => {
	const found = (...resources) =>
		names(detect(page({ resources }), technologies));
	assert.deepEqual(
		found(
			"https://cdnjs.cloudflare.com/ajax/libs/fontsource-inter/5.2.8/index.min.css",
		),
		["cdnjs"],
	);
	assert.deepEqual(
		found("https://cdn.jsdelivr.net/npm/marked@15/marked.min.js"),
		["jsDelivr"],
	);
	assert.deepEqual(found("https://unpkg.com/htmx.org@2.0.4"), ["unpkg"]);
	assert.deepEqual(
		found("https://ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js"),
		["Google Hosted Libraries"],
	);
	// a CDN's address inside another URL, Google's other APIs on the same
	// host, and hosts that only start with the CDN's name
	assert.deepEqual(
		found(
			"https://example.com/proxy/https://unpkg.com/a.js",
			"https://example.com/?u=https://cdn.jsdelivr.net/npm/a",
			"https://ajax.googleapis.com/maps/api/js",
			"https://unpkg.com.example.com/a.js",
			"https://cdnjs.cloudflare.com.example.com/ajax/libs/a.js",
		),
		[],
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

test("a 0.0.0 banner from a build from source is no version", () => {
	const css =
		"/*! tailwindcss v0.0.0 | MIT License | https://tailwindcss.com */";
	assert.deepEqual(names(detect(page({ css }), technologies)), [
		"Tailwind CSS",
	]);
});

test("site generators read their version from the generator tag", () => {
	for (const [generator, expected] of [
		["Eleventy v3.1.2", "Eleventy 3.1.2"],
		["Eleventy (Build Awesome) v4.0.0", "Eleventy 4.0.0"],
		["Jekyll v4.3.4", "Jekyll 4.3.4"],
		["Hexo 7.3.0", "Hexo 7.3.0"],
		["VuePress 2.0.0-rc.24", "VuePress 2.0.0-rc.24"],
		["Rspress v2.1.4", "Rspress 2.1.4"],
	]) {
		const found = names(detect(page({ meta: { generator } }), technologies));
		assert.ok(found.includes(expected), `${expected} in ${found.join(", ")}`);
	}
});

test("Nextra, from its CSS variables", () => {
	const css = ":root{--nextra-navbar-height:64px;--nextra-primary-hue:212deg}";
	assert.ok(names(detect(page({ css }), technologies)).includes("Nextra"));
});

test("frameworks, from the data, headers and globals they leave", () => {
	const found = names(
		detect(
			page({
				dom: {
					"[data-page*='component'][data-page*='props'], script[data-page][type='application/json']|": true,
				},
				js: {
					__meteor_runtime_config__: true,
					"Backbone.VERSION": "1.6.1",
					"ko.version": "3.5.3",
				},
				headers: { "powered-by": "Shopify, Oxygen, Hydrogen" },
				html: '<script>throw Error("https://github.com/elm/core/blob/1.0.0/hints/"+n+".md")</script>',
				attrPrefix: ["data-signals", "data-on:"],
			}),
			technologies,
		),
	);
	for (const name of [
		"Inertia.js",
		"Meteor",
		"Hydrogen",
		"Elm",
		"Datastar",
		"Backbone.js 1.6.1",
		"Knockout.js 3.5.3",
	]) {
		assert.ok(found.includes(name), `${name} in ${found.join(", ")}`);
	}
});

test("Elm, from the key its virtual DOM sets", () => {
	const found = names(
		detect(page({ domKey: ["elm_event_node_ref"] }), technologies),
	);
	assert.ok(found.includes("Elm"));
});

test("a global named Elm alone is not Elm", () => {
	const found = names(detect(page({ js: { Elm: true } }), technologies));
	assert.ok(!found.includes("Elm"));
});

test("hosts, from the headers they send", () => {
	for (const { headers, name } of [
		{ headers: { via: "1.1 vegur" }, name: "Heroku" },
		{ headers: { via: "2.0 heroku-router" }, name: "Heroku" },
		{ headers: { via: "1.1 spaces-router (616cf2ff3f21)" }, name: "Heroku" },
		{ headers: { "x-deno-trace-id": "0953fe7b" }, name: "Deno Deploy" },
		{ headers: { "x-platform-router": "lwdpat4ar5ou" }, name: "Platform.sh" },
		{ headers: { "x-kinsta-cache": "HIT" }, name: "Kinsta" },
		{ headers: { "x-railway-edge": "ord1" }, name: "Railway" },
	]) {
		const found = names(detect(page({ headers }), technologies));
		assert.ok(found.includes(name), `${name} in ${found.join(", ")}`);
	}
});

test("auth services, from what they call", () => {
	const found = names(
		detect(
			page({
				resources: [
					"https://acme.com/api/auth/session",
					"https://acme.okta.com/oauth2/v1/authorize",
					"https://cognito-idp.eu-west-1.amazonaws.com/",
					"https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
				],
			}),
			technologies,
		),
	);
	for (const name of [
		"Auth.js",
		"Okta",
		"Amazon Cognito",
		"Microsoft Entra ID",
	]) {
		assert.ok(found.includes(name), `${name} in ${found.join(", ")}`);
	}
});

test("Better Auth's session path is not Auth.js", () => {
	const resources = ["https://acme.com/api/auth/get-session"];
	assert.ok(
		!names(detect(page({ resources }), technologies)).includes("Auth.js"),
	);
});

test("AI builders, from what their templates and hosting leave", () => {
	for (const { overrides, name } of [
		{ overrides: { meta: { generator: "v0.app" } }, name: "v0" },
		{ overrides: { meta: { author: "Lovable" } }, name: "Lovable" },
		{
			overrides: {
				meta: { "og:image": "https://lovable.dev/opengraph-image-p98pqg.png" },
			},
			name: "Lovable",
		},
		{ overrides: { url: "https://my-shop.lovable.app/" }, name: "Lovable" },
		{ overrides: { url: "https://my-shop.bolt.host/" }, name: "Bolt" },
		{
			overrides: {
				resources: ["https://replit.com/public/js/replit-dev-banner.js"],
			},
			name: "Replit",
		},
		{
			overrides: {
				resources: ["https://base44.app/api/apps/abc/entities/Task"],
			},
			name: "Base44",
		},
	]) {
		const found = names(detect(page(overrides), technologies));
		assert.ok(found.includes(name), `${name} in ${found.join(", ")}`);
	}
});

test("a site that only links to an AI builder is not built with it", () => {
	const html =
		'<a href="https://lovable.dev">Lovable</a> <a href="https://v0.app">v0</a>';
	const found = names(detect(page({ html }), technologies));
	assert.ok(!found.includes("Lovable") && !found.includes("v0"));
});

test("libraries, from the globals, classes and banners they leave", () => {
	const found = names(
		detect(
			page({
				js: {
					"jQuery.fn.jquery": "3.7.1",
					"jQuery.ui.version": "1.14.2",
					"jQuery.migrateVersion": "4.0.2",
					"jQuery.fn.slick": true,
					"Modernizr._version": "3.13.1",
					"lazySizes.cfg": true,
					"Popper.createPopper": true,
					"_.VERSION": "1.13.8",
					"moment.version": "2.31.0",
				},
				script: {
					[String.raw`Swiper (\d+\.\d+\.\d+)\s+\*\s+Most modern mobile touch slider/`]:
						"14.4.0",
					[String.raw`\/\*! lazysizes - v(\d+\.\d+\.\d+)/`]: "5.3.2",
					[String.raw`@popperjs\/core v(\d+\.\d+\.\d+)/`]: "2.11.8",
				},
				domKey: ["__k"],
			}),
			technologies,
		),
	);
	for (const name of [
		"jQuery UI 1.14.2",
		"jQuery Migrate 4.0.2",
		"Slick",
		"Swiper 14.4.0",
		"Modernizr 3.13.1",
		"LazySizes 5.3.2",
		"Popper 2.11.8",
		"Underscore.js 1.13.8",
		"Moment.js 2.31.0",
		"Preact",
	]) {
		assert.ok(found.includes(name), `${name} in ${found.join(", ")}`);
	}
});

test("Swiper and Slick, from the class each adds to a carousel it starts", () => {
	const found = names(
		detect(
			page({
				dom: {
					".swiper-initialized, .swiper-container-initialized|": true,
					".slick-initialized|": true,
				},
			}),
			technologies,
		),
	);
	assert.ok(found.includes("Swiper"));
	assert.ok(found.includes("Slick"));
});

test("Lodash's _.VERSION is not Underscore.js", () => {
	const found = names(
		detect(
			page({
				js: {
					"_.VERSION": "4.17.21",
					"_.runInContext": true,
					"_.flatMapDeep": true,
				},
			}),
			technologies,
		),
	);
	assert.ok(found.includes("Lodash"));
	assert.ok(!found.includes("Underscore.js"));
});

test("the lazyloaded class alone is not LazySizes", () => {
	const found = names(detect(page({ classes: ["lazyloaded"] }), technologies));
	assert.ok(!found.includes("LazySizes"));
});

test("a key that only starts like Preact's is not Preact", () => {
	const wanted = probes(technologies);
	assert.ok(wanted.domKeyExact.includes("__k"));
	assert.ok(!wanted.domKey.includes("__k"));
});

test("ten more libraries, from the globals and banners they leave", () => {
	const found = names(
		detect(
			page({
				js: {
					"jQuery.fn.jquery": "3.7.1",
					"jQuery.fancybox.version": "3.5.7",
					"lightbox.imageCountLabel": true,
					"jQuery.fn.owlCarousel": true,
					"Isotope.LayoutMode": true,
					"jQuery.fn.select2.defaults": true,
					PhotoSwipeUI_Default: true,
					"AOS.refreshHard": true,
					"Flickity.Cell": true,
					"Hammer.VERSION": "2.0.8",
				},
				script: scripts(
					"/*!\n * Lightbox v2.12.0\n * by Lokesh Dhakar",
					"/**\n * Owl Carousel v2.3.4\n * Copyright 2013-2018 David Deutsch",
					"/*!\n * Isotope PACKAGED v3.0.6\n *",
					"/*! Select2 4.1.0-rc.0 | https://github.com/select2/select2 */",
					"/*! PhotoSwipe - v4.1.3 - 2019-01-08",
					"/*!\n * Flickity PACKAGED v3.0.0\n * Touch, responsive, flickable carousels",
				),
				css: "/*!\n * animate.css - https://animate.style/\n * Version - 4.1.1\n",
			}),
			technologies,
		),
	);
	for (const name of [
		"FancyBox 3.5.7",
		"Lightbox 2.12.0",
		"Owl Carousel 2.3.4",
		"Isotope 3.0.6",
		"Select2 4.1.0",
		"Animate.css 4.1.1",
		"PhotoSwipe 4.1.3",
		"AOS",
		"Flickity 3.0.0",
		"Hammer.js 2.0.8",
	]) {
		assert.ok(found.includes(name), `${name} in ${found.join(", ")}`);
	}
});

test("Fancybox 4 onwards and PhotoSwipe 5, without jQuery", () => {
	const found = names(
		detect(
			page({
				js: { "Fancybox.version": "6.1.15" },
				script: scripts(
					"/*!\n  * PhotoSwipe Lightbox 5.4.4 - https://photoswipe.com\n  * (c) 2024",
				),
			}),
			technologies,
		),
	);
	assert.ok(found.includes("FancyBox 6.1.15"));
	assert.ok(found.includes("PhotoSwipe 5.4.4"));
	assert.ok(!found.includes("jQuery"));
});

test("carousels and widgets, from the markup and styles they leave", () => {
	const dom = Object.fromEntries(
		[
			"#lightboxOverlay + #lightbox .lb-outerContainer",
			".owl-carousel.owl-loaded, .owl-wrapper-outer",
			"select.select2-hidden-accessible",
			"a[data-pswp-width], .pswp .pswp__scroll-wrap",
			"[data-aos].aos-init",
			".flickity-enabled",
		].map((selector) => [`${selector}|`, true]),
	);
	const found = names(
		detect(
			page({
				dom,
				classes: ["animate__animated"],
				css: ".fancybox__container{direction:ltr}",
			}),
			technologies,
		),
	);
	for (const name of [
		"FancyBox",
		"Lightbox",
		"Owl Carousel",
		"Select2",
		"PhotoSwipe",
		"AOS",
		"Flickity",
		"Animate.css",
	]) {
		assert.ok(found.includes(name), `${name} in ${found.join(", ")}`);
	}
});

test("SelectWoo, WooCommerce's fork of Select2, is not Select2", () => {
	const found = names(
		detect(
			page({
				js: {
					"jQuery.fn.jquery": "3.7.1",
					"jQuery.fn.selectWoo": true,
					"jQuery.fn.select2.defaults": true,
				},
				dom: { "select.select2-hidden-accessible|": true },
				script: scripts("/*!\n * SelectWoo 1.0.11\n"),
			}),
			technologies,
		),
	);
	assert.ok(!found.includes("Select2"));
});

test("a stylesheet that only names its animations like Animate.css's is not it", () => {
	const found = names(
		detect(
			page({
				css: ".animated{animation-duration:1s}@keyframes bounce{}",
				classes: ["animated"],
			}),
			technologies,
		),
	);
	assert.ok(!found.includes("Animate.css"));
});

test("analytics and ad tags, from the globals their snippets set and the files they load", () => {
	const cases = [
		{
			name: "Facebook Pixel 2.9.441",
			js: { "fbq.version": "2.9.441" },
			resources: ["https://connect.facebook.net/en_US/fbevents.js"],
		},
		{
			name: "Microsoft Clarity 0.8.80-beta",
			resources: [
				"https://www.clarity.ms/tag/abcdefghij",
				"https://scripts.clarity.ms/0.8.80-beta/clarity.js",
			],
		},
		{
			name: "Yandex Metrica",
			js: { "Ya.Metrika2": true },
			resources: ["https://mc.yandex.ru/metrika/tag.js"],
		},
		{
			name: "Snowplow 4.10.3",
			js: { GlobalSnowplowNamespace: true },
			script: scripts(
				"/*!\n * Web analytics for Snowplow v4.10.3 (http://bit.ly/sp-js)\n */",
			),
		},
		{
			name: "Matomo",
			script: scripts(
				"/*!!\n * Matomo - free/libre analytics platform\n *\n * JavaScript tracking client",
			),
		},
		{ name: "Matomo", js: { "Piwik.getAsyncTrackers": true, _paq: true } },
		{
			name: "TikTok Pixel",
			js: { TiktokAnalyticsObject: "ttq" },
			resources: [
				"https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=C123&lib=ttq",
			],
		},
		{
			name: "Hotjar",
			js: { _hjSettings: true },
			resources: ["https://static.hotjar.com/c/hotjar-1000.js?sv=6"],
		},
		{
			name: "LinkedIn Insight Tag",
			js: { _linkedin_data_partner_ids: "1234567" },
			resources: ["https://snap.licdn.com/li.lms-analytics/insight.min.js"],
		},
		{
			name: "New Relic 1.324.1",
			js: { NREUM: true },
			resources: ["https://js-agent.newrelic.com/nr-spa-1.324.1.min.js"],
		},
		{
			name: "HubSpot Analytics",
			js: { _hsq: true },
			resources: ["https://js.hs-scripts.com/53.js"],
		},
	];
	for (const { name, ...overrides } of cases) {
		const found = names(detect(page(overrides), technologies));
		assert.ok(found.includes(name), `${name} in ${found.join(", ")}`);
	}
});

test("look-alikes of analytics and ad tags are not them", () => {
	const cases = [
		// Facebook's login and share SDK, not its pixel
		{
			name: "Facebook Pixel",
			resources: ["https://connect.facebook.net/en_US/sdk.js"],
		},
		// VMware's Clarity design system shares the name
		{
			name: "Microsoft Clarity",
			resources: ["https://unpkg.com/@cds/core/global.min.css"],
		},
		// Yandex Maps, not Metrica
		{
			name: "Yandex Metrica",
			resources: ["https://api-maps.yandex.ru/2.1/?lang=en_US"],
		},
		// a site's own global named after the tracker
		{ name: "Snowplow", js: { snowplow: true } },
		// Piwik PRO's tracker fills the same queue
		{ name: "Matomo", js: { _paq: true } },
		// a TikTok video embed
		{ name: "TikTok Pixel", resources: ["https://www.tiktok.com/embed.js"] },
		// a site's own `hj` helper
		{ name: "Hotjar", js: { hj: true } },
		// a LinkedIn profile badge
		{
			name: "LinkedIn Insight Tag",
			resources: ["https://platform.linkedin.com/badges/js/profile.js"],
		},
		{ name: "New Relic", js: { newrelic: true } },
		// HubSpot's forms, which load without its tracking code
		{
			name: "HubSpot Analytics",
			resources: ["https://js.hsforms.net/forms/embed/v2.js"],
		},
	];
	for (const { name, ...overrides } of cases) {
		const found = names(detect(page(overrides), technologies));
		assert.ok(
			!found.some((item) => item.startsWith(name)),
			`${name} not in ${found.join(", ")}`,
		);
	}
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
		"jsDelivr",
	]);
});

test("support, analytics, auth and content services, from what they load", () => {
	const found = names(
		detect(
			page({
				resources: [
					"https://client.crisp.chat/l.js",
					"https://widget.intercom.io/widget/abc123",
					"https://cloud.umami.is/script.js",
					"https://acme.eu.auth0.com/oauth/token",
					"https://cdn.sanity.io/images/abc123/production/photo-1200x800.jpg",
				],
			}),
			technologies,
		),
	);
	assert.deepEqual(found.sort(), [
		"Auth0",
		"Crisp",
		"Intercom",
		"Sanity",
		"Umami",
	]);
});

test("self-hosted Umami and Crisp, from their globals", () => {
	const js = { "umami.track": true, CRISP_WEBSITE_ID: "abc" };
	assert.deepEqual(names(detect(page({ js }), technologies)).sort(), [
		"Crisp",
		"Umami",
	]);
});

test("Ghost reads its version from the generator", () => {
	const found = names(
		detect(
			page({
				meta: { generator: "Ghost 6.76" },
				resources: [
					"https://cdn.jsdelivr.net/ghost/portal@~2.72/umd/portal.min.js",
				],
			}),
			technologies,
		),
	);
	assert.deepEqual(found, ["Ghost 6.76", "jsDelivr"]);
});

test("captchas, from the scripts they load", () => {
	const found = names(
		detect(
			page({
				resources: [
					"https://challenges.cloudflare.com/turnstile/v0/api.js",
					"https://www.google.com/recaptcha/api.js?render=explicit",
					"https://js.hcaptcha.com/1/api.js",
				],
			}),
			technologies,
		),
	);
	assert.deepEqual(found.sort(), [
		"Cloudflare Turnstile",
		"hCaptcha",
		"reCAPTCHA",
	]);
});

test("hCaptcha's grecaptcha does not claim reCAPTCHA", () => {
	const found = names(
		detect(
			page({
				resources: ["https://js.hcaptcha.com/1/api.js"],
				js: { grecaptcha: true, "hcaptcha.render": true },
				dom: { ".g-recaptcha|": true },
			}),
			technologies,
		),
	);
	assert.deepEqual(found, ["hCaptcha"]);
});

test("OutSystems, from its runtime scripts", () => {
	const resources = [
		"https://app.example.com/MyApp/scripts/OutSystemsReactView.js?abc",
	];
	assert.deepEqual(names(detect(page({ resources }), technologies)), [
		"OutSystems",
	]);
});

// Technologies whose logo neither Simple Icons nor svgl has, and that show
// their first letter until their own SVG is added to icons/tech. The list
// only shrinks: a new technology must ship with its logo.

test("every technology ships a logo", async () => {
	const { icons } = await import("../src/icons.js");
	const missing = technologies
		.filter((tech) => !((tech.icon ?? tech.id) in icons))
		.map((tech) => tech.id);
	assert.deepEqual(missing, []);
});

test("every logo the manifest names is a file", async () => {
	const { icons } = await import("../src/icons.js");
	for (const [name, dark] of Object.entries(icons)) {
		assert.ok(
			readFileSync(new URL(`../icons/tech/${name}.svg`, import.meta.url)),
			name,
		);
		if (dark) {
			assert.ok(
				readFileSync(
					new URL(`../icons/tech/${name}-dark.svg`, import.meta.url),
				),
				`${name}-dark`,
			);
		}
	}
});

test("the README lists every technology, as pnpm readme writes it", () => {
	const readme = readFileSync(README, "utf8");
	assert.equal(readme, render(readme), "run pnpm readme");
});

test("the CHANGELOG has a section for the manifest's version", () => {
	const { version } = JSON.parse(
		readFileSync(new URL("../manifest.json", import.meta.url), "utf8"),
	);
	assert.ok(
		notes(readFileSync(CHANGELOG, "utf8"), version),
		`add ## [${version}] to CHANGELOG.md`,
	);
});

test("the list copies as Markdown, in the popup's order, linked, with versions", () => {
	const found = detect(
		page({
			js: { "next.version": "16.4.6" },
			css: "/*! tailwindcss v4.3.5 | MIT License | https://tailwindcss.com */",
		}),
		technologies,
		categories,
	);
	const text = markdown("example.com", found);
	const lines = text.split("\n");
	assert.equal(lines[0], "**example.com** is built with:");
	assert.equal(lines[1], "");
	assert.equal(lines.length, found.length + 2);
	for (const [index, tech] of found.entries()) {
		assert.ok(lines[index + 2].startsWith(`- ${tech.category}: [`));
	}
	assert.ok(
		lines.includes("- Framework: [Next.js](https://nextjs.org) 16.4.6"),
	);
	assert.ok(
		lines.includes("- Styling: [Tailwind CSS](https://tailwindcss.com) 4.3.5"),
	);
});

test("Markdown leaves out a version it doesn't know and escapes brackets", () => {
	const text = markdown("example.com", [
		{ name: "A [B]", category: "Library", website: "https://a.dev" },
	]);
	assert.equal(
		text,
		"**example.com** is built with:\n\n- Library: [A \\[B\\]](https://a.dev)",
	);
});
