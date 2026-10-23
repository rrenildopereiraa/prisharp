import { createServer, type Server } from "node:http";
import { detect, probes } from "extension/detect";
import { categories, technologies } from "extension/technologies";
import { afterAll, beforeAll, expect, it } from "vite-plus/test";
import { snapshot } from "./_snapshot";

const pages: Record<string, [string, string]> = {
	"/": [
		"text/html",
		`<!doctype html><html><head>
			<meta name="generator" content="Astro v6.4.8">
			<link rel="stylesheet" href="/app.css">
			<script type="module" src="/app.js"></script>
		</head><body><button data-base-ui-tooltip-trigger class="button">Hi</button></body></html>`,
	],
	"/app.css": ["text/css", "/*! tailwindcss v4.3.3 | MIT License */"],
	"/app.js": ["text/javascript", 'var k="__reactFiber$"+Math.random();'],
};

let server: Server;
let origin = "";

beforeAll(async () => {
	server = createServer((request, response) => {
		const [type, body] = pages[request.url ?? ""] ?? ["text/plain", ""];
		response.writeHead(body ? 200 : 404, {
			"content-type": type,
			"x-vercel-id": "gru1::test",
		});
		response.end(body);
	});
	await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
	const address = server.address();
	if (address && typeof address === "object") {
		origin = `http://127.0.0.1:${address.port}`;
	}
});

afterAll(() => {
	server.close();
});

it("reads a page the way the extension does", async () => {
	const page = await snapshot(new URL(origin), probes(technologies), {
		allowPrivate: true,
	});
	const found = detect(page, technologies, categories).map((tech) =>
		[tech.name, tech.version].filter(Boolean).join(" "),
	);
	expect(found).toEqual([
		"Astro 6.4.8",
		"React",
		"Base UI",
		"Tailwind CSS 4.3.3",
		"Vite",
		"Vercel",
	]);
});

it("refuses an address that is not public", async () => {
	await expect(snapshot(new URL(origin), probes(technologies))).rejects.toThrow(
		"That address is not public.",
	);
});
