import react from "@vitejs/plugin-react";
import yummacss from "@yummacss/vite";
import { zipSync } from "fflate";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite-plus";

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

export default defineConfig({
	resolve: {
		alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
	},
	plugins: [react(), yummacss(), download()],
});
