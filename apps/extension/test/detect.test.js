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

test("Yumma UI follows from Yumma CSS and Base UI together", () => {
	const yumma = { css: ".d\\:f{display:flex}", classes: ["d:f", "ai:c"] };
	assert.ok(!names(detect(page(yumma), technologies)).includes("Yumma UI"));

	const attrPrefix = ["data-base-ui-"];
	const found = names(detect(page({ ...yumma, attrPrefix }), technologies));
	assert.ok(found.includes("Yumma UI"));
	assert.ok(found.includes("Base UI"));
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

test("Yumma UI shows from its config on a dev server", () => {
	const found = names(
		detect(page({ file: ["/yummaui.json"] }), technologies, categories),
	);
	assert.deepEqual(found, ["Yumma UI", "Base UI", "Yumma CSS"]);
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
			dom: { "svg[width='15'][height='15'][viewBox='0 0 15 15']|": true },
		}),
		["Radix Icons"],
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
