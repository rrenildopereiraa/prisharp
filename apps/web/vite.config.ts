import react from "@vitejs/plugin-react";
import yummacss from "@yummacss/vite";
import { zipSync } from "fflate";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite-plus";
import { technologies } from "extension/technologies";

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

const zipExtension = () =>
	zipSync(
		Object.fromEntries(
			SHIPPED.flatMap((entry) => walk(join(extension, entry))).map((file) => [
				relative(extension, file),
				readFileSync(file),
			]),
		),
	);

/** Serves and builds /prisharp.zip, the extension ready to load unpacked. */
const download = (): Plugin => ({
	name: "prisharp-download",
	configureServer(server) {
		server.middlewares.use("/prisharp.zip", (_request, response) => {
			response.setHeader("content-type", "application/zip");
			response.end(zipExtension());
		});
	},
	generateBundle() {
		this.emitFile({
			type: "asset",
			fileName: "prisharp.zip",
			source: zipExtension(),
		});
	},
});

const CATALOG = "virtual:catalog";

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
	label?: string;
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
	return [];
}

const catalog = (): Plugin => ({
	name: "prisharp-catalog",
	resolveId: (id) => (id === CATALOG ? `\0${CATALOG}` : undefined),
	load(id) {
		if (id !== `\0${CATALOG}`) return;
		const names = new Map(technologies.map((tech) => [tech.id, tech.name]));
		const list = technologies.map((tech) => ({
			id: tech.id,
			name: tech.name,
			icon: tech.icon,
			category: tech.category,
			website: tech.website,
			implies: (tech.implies ?? []).map((id) => names.get(id) ?? id),
			evidence: (tech.signals as Signal[]).flatMap(evidence).slice(0, 3),
		}));
		// one with no trace of its own, like Laravel, shows what brings it in
		for (const entry of list) {
			if (entry.evidence.length > 0) continue;
			const by = technologies
				.filter((tech) => tech.implies?.includes(entry.id))
				.map((tech) => tech.name);
			entry.evidence = [{ kind: "Comes with", text: by.join(", ") }];
		}
		return `export const catalog = ${JSON.stringify(list)};`;
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
			},
		},
	},
});
