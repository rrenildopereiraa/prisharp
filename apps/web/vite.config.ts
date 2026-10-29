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

const api = (): Plugin => ({
	name: "prisharp-api",
	configureServer(server) {
		server.middlewares.use(async (request, response, next) => {
			const url = new URL(request.url ?? "/", "http://localhost");
			if (url.pathname !== "/api/detect") return next();
			try {
				const { GET } = await server.ssrLoadModule("/api/detect.ts");
				const answer: Response = await GET(new Request(url));
				response.statusCode = answer.status;
				answer.headers.forEach((value, name) =>
					response.setHeader(name, value),
				);
				response.end(Buffer.from(await answer.arrayBuffer()));
			} catch (error) {
				response.statusCode = 500;
				response.setHeader("content-type", "application/json");
				response.end(
					JSON.stringify({
						error: error instanceof Error ? error.message : String(error),
					}),
				);
			}
		});
	},
});

const CATALOG = "virtual:catalog";

const catalog = (): Plugin => ({
	name: "prisharp-catalog",
	resolveId: (id) => (id === CATALOG ? `\0${CATALOG}` : undefined),
	load(id) {
		if (id !== `\0${CATALOG}`) return;
		const list = technologies.map(({ id, name, icon, website }) => ({
			id,
			name,
			icon,
			website,
		}));
		return `export const catalog = ${JSON.stringify(list)};`;
	},
});

export default defineConfig({
	resolve: {
		alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
	},
	plugins: [react(), yummacss(), catalog(), download(), api()],
});
