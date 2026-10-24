import react from "@vitejs/plugin-react";
import yummacss from "@yummacss/vite";
import { zipSync } from "fflate";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite-plus";
import { technologies } from "extension/technologies";

const extension = fileURLToPath(new URL("../extension", import.meta.url));

// What Chrome loads: the same files as the extension's `pnpm zip`.
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

/**
 * The names and logos of what Prisharp detects, for the marquee. Only these
 * reach the browser: the fingerprints stay on the server, where a page that
 * shipped them would read as every technology they describe.
 */
const catalog = (): Plugin => ({
	name: "prisharp-catalog",
	resolveId: (id) => (id === CATALOG ? `\0${CATALOG}` : undefined),
	load(id) {
		if (id !== `\0${CATALOG}`) return;
		const list = technologies.map(({ id, name, icon }) => ({ id, name, icon }));
		return `export const catalog = ${JSON.stringify(list)};`;
	},
});

export default defineConfig({
	resolve: {
		alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
	},
	plugins: [react(), yummacss(), catalog(), download()],
});
