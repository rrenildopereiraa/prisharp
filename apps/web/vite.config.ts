import react from "@vitejs/plugin-react";
import yummacss from "@yummacss/vite";
import { strToU8, zipSync } from "fflate";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite-plus";
import { categories, technologies } from "extension/technologies";
import { icons as logoFiles } from "extension/icons";
import { CHROME_ONLY, firefox } from "extension/firefox";
import { icons as simpleMarks } from "./src/marks";
import { marquee, typed } from "./src/slices";

const extension = fileURLToPath(new URL("../extension", import.meta.url));

const SHIPPED = [
	"manifest.json",
	"popup.html",
	"offscreen.html",
	"popup.css",
	"src",
	"icons",
];

const walk = (path: string): string[] =>
	statSync(path).isDirectory()
		? readdirSync(path).flatMap((name) => walk(join(path, name)))
		: [path];

const shippedFiles = () =>
	Object.fromEntries(
		SHIPPED.flatMap((entry) => walk(join(extension, entry))).map((file) => [
			relative(extension, file).split("\\").join("/"),
			readFileSync(file),
		]),
	);

const zipExtension = () => zipSync(shippedFiles());

/** The Firefox build: the same files with its own manifest, as `pnpm zip` packs it. */
const zipFirefox = () => {
	const files: Record<string, Uint8Array> = Object.fromEntries(
		Object.entries(shippedFiles()).filter(
			([file]) => !CHROME_ONLY.includes(file),
		),
	);
	files["manifest.json"] = strToU8(
		`${JSON.stringify(firefox(MANIFEST), null, "\t")}\n`,
	);
	return zipSync(files);
};

const MANIFEST = JSON.parse(
	readFileSync(join(extension, "manifest.json"), "utf8"),
);

/** The extension's version, as the store upload is named. */
const VERSION: string = MANIFEST.version;

/** The downloads' names, with the version in them. */
const ZIP = `prisharp-chrome-${VERSION}.zip`;
const FIREFOX_ZIP = `prisharp-firefox-${VERSION}.zip`;

/**
 * Serves and builds the extension ready to load: for Chromium under its
 * versioned name and under /prisharp-<version>.zip and /prisharp.zip, which
 * older links point to, and
 * for Firefox under its own name.
 */
const download = (): Plugin => {
	const zips: [string[], () => Uint8Array][] = [
		[[ZIP, `prisharp-${VERSION}.zip`, "prisharp.zip"], zipExtension],
		[[FIREFOX_ZIP], zipFirefox],
	];
	return {
		name: "prisharp-download",
		configureServer(server) {
			for (const [names, build] of zips) {
				for (const name of names) {
					server.middlewares.use(`/${name}`, (_request, response) => {
						response.setHeader("content-type", "application/zip");
						response.end(build());
					});
				}
			}
		},
		generateBundle() {
			for (const [names, build] of zips) {
				const source = build();
				for (const fileName of names) {
					this.emitFile({ type: "asset", fileName, source });
				}
			}
		},
	};
};

const CATALOG = "virtual:catalog";

/** The docs' pages under /docs/, each its own HTML entry. "" is /docs/ itself. */
const DOC_PAGES = ["", "browsers", "technologies", "permissions"];

const clip = (text: string, max = 60) => {
	const line = text.replace(/\s+/g, " ").trim();
	return line.length > max ? `${line.slice(0, max - 1)}…` : line;
};
// a regex source, readable: without its escapes
const plain = (source: string) => source.replace(/\\(.)/g, "$1");

type Signal = {
	js?: string;
	jsPrefix?: string;
	domKey?: string;
	attrPrefix?: string;
	dom?: string;
	classes?: string[];
	meta?: [string, RegExp];
	header?: [string, RegExp];
	script?: RegExp;
	resource?: RegExp;
	css?: RegExp;
	html?: RegExp;
	url?: RegExp;
	label?: string;
	weight?: number;
};

/**
 * What a signal looks for, in the words the popup shows evidence in: the
 * kind of trace and the trace. The site has no page to read, so no values.
 * Dev-server files and findings made of other findings are left out.
 */
function evidence(signal: Signal): { kind: string; text: string }[] {
	const pattern = (value: RegExp) => signal.label ?? clip(plain(value.source));
	if (signal.js) return [{ kind: "Global", text: `window.${signal.js}` }];
	if (signal.jsPrefix) return [{ kind: "Global", text: `${signal.jsPrefix}…` }];
	if (signal.domKey) return [{ kind: "Element", text: `${signal.domKey}…` }];
	if (signal.attrPrefix) {
		return [{ kind: "Attribute", text: `${signal.attrPrefix}…` }];
	}
	if (signal.dom) return [{ kind: "Element", text: clip(signal.dom) }];
	if (signal.classes) {
		return [{ kind: "Classes", text: signal.classes.slice(0, 3).join(" ") }];
	}
	if (signal.meta) {
		const [name] = signal.meta;
		return [{ kind: "Meta tag", text: `<meta name="${name}">` }];
	}
	if (signal.header) {
		const [name] = signal.header;
		return [{ kind: "Header", text: name }];
	}
	if (signal.script) return [{ kind: "Script", text: pattern(signal.script) }];
	if (signal.resource) {
		return [{ kind: "Resource", text: pattern(signal.resource) }];
	}
	if (signal.css) return [{ kind: "Stylesheet", text: pattern(signal.css) }];
	if (signal.html) return [{ kind: "HTML", text: pattern(signal.html) }];
	if (signal.url) return [{ kind: "URL", text: pattern(signal.url) }];
	return [];
}

/** Every technology, without its fingerprints, in the shape the site reads. */
function entries(all = false) {
	const names = new Map(technologies.map((tech) => [tech.id, tech.name]));
	const list = technologies.map((tech) => ({
		id: tech.id,
		name: tech.name,
		icon: tech.icon,
		category: tech.category,
		website: tech.website,
		implies: (tech.implies ?? []).map((id) => names.get(id) ?? id),
		evidence: (tech.signals as Signal[])
			.flatMap((signal) =>
				evidence(signal).map((line) =>
					all && (signal.weight ?? 100) < 100 ? { ...line, weak: true } : line,
				),
			)
			.slice(0, all ? undefined : 3),
	}));
	// one with no trace of its own, like Laravel, shows what brings it in
	for (const entry of list) {
		if (entry.evidence.length > 0) continue;
		const by = technologies
			.filter((tech) => tech.implies?.includes(entry.id))
			.map((tech) => tech.name);
		entry.evidence = [{ kind: "Comes with", text: by.join(", ") }];
	}
	return list;
}

const hasLogo = (icon: string) => icon in logoFiles;

/** Imports for these logos, each with its dark variant, and the map to them. */
function logoModule(icons: string[]) {
	const files = [...new Set(icons)]
		.filter(hasLogo)
		.flatMap((icon) =>
			(logoFiles as Record<string, boolean>)[icon]
				? [icon, `${icon}-dark`]
				: [icon],
		);
	const imports = files.map(
		(file, index) =>
			`import logo${index} from ${JSON.stringify(`${extension}/icons/tech/${file}.svg?url`)};`,
	);
	const logos = files.map(
		(file, index) => `${JSON.stringify(file)}: logo${index}`,
	);
	return { imports, logos: `{ ${logos.join(", ")} }` };
}

/**
 * The landing page's module: the count, the heading's names with their
 * evidence, the marquee's marks, and the logo files those need, and nothing
 * else, so the page doesn't grow with the catalog.
 */
function landing() {
	const list = entries();
	const named = typed(list);
	const marks = marquee(list, hasLogo).map(({ id, name, icon }) => ({
		id,
		name,
		icon: icon ?? id,
	}));
	// the marquee draws a Simple Icons mark when it has one, else the logo
	const pictured = [
		...named.map((tech) => tech.icon ?? tech.id),
		...marks.filter((mark) => !(mark.id in simpleMarks)).map((m) => m.icon),
	];
	const { imports, logos } = logoModule(pictured);
	return [
		...imports,
		`export const count = ${list.length};`,
		`export const zip = ${JSON.stringify(`/${ZIP}`)};`,
		`export const firefoxZip = ${JSON.stringify(`/${FIREFOX_ZIP}`)};`,
		`export const permissions = ${JSON.stringify(MANIFEST.permissions)};`,
		`export const firefoxPermissions = ${JSON.stringify(firefox(MANIFEST).permissions)};`,
		`export const hostPermissions = ${JSON.stringify(MANIFEST.optional_host_permissions ?? [])};`,
		`export const typed = ${JSON.stringify(named)};`,
		`export const marks = ${JSON.stringify(marks)};`,
		`export const logos = ${logos};`,
	].join("\n");
}

/**
 * The docs' technologies page: every technology with all of its evidence and
 * the categories in the popup's order, so the list can't fall out of date.
 * Each category's logos are a module of their own, loaded as it comes into
 * view, so the page doesn't wait for all of them.
 */
function docs() {
	const loaders = categories.map(
		(_, index) =>
			`() => import(${JSON.stringify(`${LOGOS}${index}`)}).then((m) => m.logos)`,
	);
	return [
		`export const catalog = ${JSON.stringify(entries(true))};`,
		`export const categories = ${JSON.stringify(categories)};`,
		`export const logoLoaders = [${loaders.join(", ")}];`,
	].join("\n");
}

/** One category's logo files, by file name. */
function categoryLogos(index: number) {
	const icons = technologies
		.filter((tech) => tech.category === categories[index])
		.map((tech) => tech.icon ?? tech.id);
	const { imports, logos } = logoModule(icons);
	return [...imports, `export const logos = ${logos};`].join("\n");
}

const ALL = `${CATALOG}/all`;
const DOCS = `${CATALOG}/docs`;
const LOGOS = `${DOCS}/logos/`;
const MODULES = [CATALOG, ALL, DOCS];

const catalog = (): Plugin => ({
	name: "prisharp-catalog",
	resolveId: (id) =>
		MODULES.includes(id) || id.startsWith(LOGOS) ? `\0${id}` : undefined,
	load(id) {
		if (id === `\0${CATALOG}`) return landing();
		if (id === `\0${ALL}`) {
			return `export const catalog = ${JSON.stringify(entries())};`;
		}
		if (id === `\0${DOCS}`) return docs();
		if (id.startsWith(`\0${LOGOS}`)) {
			return categoryLogos(Number(id.slice(LOGOS.length + 1)));
		}
	},
});

export default defineConfig({
	resolve: {
		alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
	},
	plugins: [react(), yummacss(), catalog(), download()],
	build: {
		rollupOptions: {
			input: {
				main: fileURLToPath(new URL("./index.html", import.meta.url)),
				privacy: fileURLToPath(
					new URL("./privacy/index.html", import.meta.url),
				),
				...Object.fromEntries(
					DOC_PAGES.map((page) => [
						`docs-${page || "index"}`,
						fileURLToPath(
							new URL(
								`./docs/${page ? `${page}/` : ""}index.html`,
								import.meta.url,
							),
						),
					]),
				),
			},
		},
	},
});
