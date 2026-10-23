// What the extension's collector reads inside a page, read from the server
// instead: the page as it arrives, before any of its JavaScript runs. Globals
// and element properties do not exist yet, so those signals come from the
// page's scripts as text.

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { parseHTML } from "linkedom";

interface Probes {
	js: string[];
	jsPrefix: string[];
	attrPrefix: string[];
	classes: string[];
	dom: { selector: string; attr?: string; prop?: string }[];
	script: { source: string; flags: string }[];
}

interface Options {
	/** Tests serve their pages from localhost. */
	allowPrivate?: boolean;
}

const TIMEOUT = 5000;
const PAGE_LIMIT = 2_000_000;
const ASSET_LIMIT = 2_000_000;

// loopback, private, link-local, carrier-grade NAT and unspecified ranges
const PRIVATE = [
	/^127\./,
	/^10\./,
	/^172\.(1[6-9]|2\d|3[01])\./,
	/^192\.168\./,
	/^169\.254\./,
	/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,
	/^0\./,
	/^::1?$/,
	/^f[cd]/i,
	/^fe80:/i,
	/^::ffff:/i,
];

async function assertPublic(url: URL, options: Options) {
	if (!/^https?:$/.test(url.protocol)) throw new Error("Only http and https.");
	if (options.allowPrivate) return;
	const host = url.hostname.replace(/^\[|\]$/g, "");
	const addresses = isIP(host)
		? [host]
		: await lookup(host, { all: true }).then(
				(entries) => entries.map((entry) => entry.address),
				() => {
					throw new Error("That site could not be found.");
				},
			);
	if (
		addresses.some((address) => PRIVATE.some((range) => range.test(address)))
	) {
		throw new Error("That address is not public.");
	}
}

// Reads at most `limit` bytes, so a huge file cannot hold the function.
async function readText(response: Response, limit: number) {
	if (!response.body) return "";
	const reader = response.body.getReader();
	const chunks: Uint8Array[] = [];
	let size = 0;
	while (size < limit) {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(value);
		size += value.length;
	}
	await reader.cancel().catch(() => {});
	return new TextDecoder().decode(Buffer.concat(chunks)).slice(0, limit);
}

// Follows redirects by hand, so every hop is checked before it is fetched.
async function get(url: URL, limit: number, options: Options) {
	let current = url;
	for (let hop = 0; hop < 5; hop++) {
		await assertPublic(current, options);
		const response = await fetch(current, {
			redirect: "manual",
			signal: AbortSignal.timeout(TIMEOUT),
			headers: {
				"user-agent": "Prisharp/0.1 (+https://prisharp.com)",
				accept: "text/html,*/*;q=0.8",
			},
		}).catch((error: Error) => {
			if (error.name === "TimeoutError") throw error;
			throw new Error("The page could not be reached.");
		});
		const location = response.headers.get("location");
		if (response.status >= 300 && response.status < 400 && location) {
			current = new URL(location, current);
			continue;
		}
		return { url: current, response, text: await readText(response, limit) };
	}
	throw new Error("Too many redirects.");
}

const getAsset = (url: URL, options: Options) =>
	get(url, ASSET_LIMIT, options)
		.then(({ response, text }) => (response.ok ? text : ""))
		.catch(() => "");

// An identifier rare enough that finding it in a script means the global.
const distinctive = (name: string) => /[_$]|^[A-Z]{4,}$/.test(name);

export async function snapshot(
	target: URL,
	probes: Probes,
	options: Options = {},
) {
	const { url, response, text } = await get(target, PAGE_LIMIT, options);
	if (!response.ok) throw new Error(`The page answered ${response.status}.`);
	const { document } = parseHTML(text);
	const elements = [...document.querySelectorAll("*")].slice(0, 5000);
	const resolve = (path: string) => {
		try {
			return new URL(path, url);
		} catch {
			return null;
		}
	};

	const dom: Record<string, string | true> = {};
	for (const { selector, attr, prop } of probes.dom) {
		let element: Element | null = null;
		try {
			element = document.querySelector(selector);
		} catch {}
		if (!element) continue;
		dom[`${selector}|${attr ?? prop ?? ""}`] =
			(attr && element.getAttribute(attr)) || true;
	}

	const attrPrefix = probes.attrPrefix.filter((prefix) =>
		elements.some((element) =>
			element.getAttributeNames().some((name) => name.startsWith(prefix)),
		),
	);

	const wanted = new Set(probes.classes);
	const classes = new Set<string>();
	for (const element of elements) {
		for (const name of element.classList ?? []) {
			if (wanted.has(name)) classes.add(name);
		}
	}

	const resources = [
		...[...document.querySelectorAll("script[src]")].map((element) =>
			element.getAttribute("src"),
		),
		...[...document.querySelectorAll("link[href]")].map((element) =>
			element.getAttribute("href"),
		),
	]
		.map((path) => path && resolve(path))
		.filter((link): link is URL => Boolean(link));

	const meta: Record<string, string> = {};
	for (const element of document.querySelectorAll(
		"meta[name], meta[property]",
	)) {
		const name = (
			element.getAttribute("name") ??
			element.getAttribute("property") ??
			""
		).toLowerCase();
		meta[name] ??= element.getAttribute("content") ?? "";
	}

	const headers: Record<string, string> = {};
	for (const [name, value] of response.headers) headers[name] = value;

	const stylesheets = [...document.querySelectorAll('link[rel~="stylesheet"]')]
		.map((element) => resolve(element.getAttribute("href") ?? ""))
		.filter((link): link is URL => Boolean(link))
		.slice(0, 8);
	const scripts = [
		...document.querySelectorAll('script[src], link[rel="modulepreload"]'),
	]
		.map((element) =>
			resolve(
				element.getAttribute("src") ?? element.getAttribute("href") ?? "",
			),
		)
		.filter((link): link is URL => Boolean(link))
		.slice(0, 20);
	const inline = [...document.querySelectorAll("script:not([src])")]
		.map((element) => element.textContent ?? "")
		.join("\n");
	const styles = [...document.querySelectorAll("style")]
		.map((element) => element.textContent ?? "")
		.join("\n");

	const [css, sources] = await Promise.all([
		Promise.all(stylesheets.map((link) => getAsset(link, options))),
		Promise.all(scripts.map((link) => getAsset(link, options))),
	]);
	const code = [inline, ...sources];

	const script: Record<string, string | true> = {};
	for (const { source, flags } of probes.script) {
		const regex = new RegExp(source, flags);
		for (const body of code) {
			const match = regex.exec(body);
			if (!match) continue;
			script[`${source}/${flags}`] = match[1] ?? true;
			break;
		}
	}

	// Globals do not exist before scripts run; a distinctive name assigned in
	// the page's code stands in for one.
	const js: Record<string, true> = {};
	for (const path of probes.js) {
		const root = path.split(".")[0] ?? path;
		if (
			path === root &&
			distinctive(root) &&
			code.some((body) => body.includes(root))
		) {
			js[path] = true;
		}
	}
	const jsPrefix = probes.jsPrefix.filter((prefix) =>
		code.some((body) => body.includes(prefix)),
	);

	return {
		url: url.href,
		js,
		jsPrefix,
		dom,
		domKey: [],
		attrPrefix,
		classes: [...classes],
		resources: resources.map((link) => link.href),
		meta,
		headers,
		html: text,
		css: [styles, ...css].join("\n"),
		script,
		file: [],
	};
}
