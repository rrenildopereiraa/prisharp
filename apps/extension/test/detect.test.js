import assert from "node:assert/strict";
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
