// Runs inside the page, in its own JavaScript world, when the popup opens.
// `chrome.scripting` serializes this function, so it cannot use anything
// from outside its body. It reads what the probes ask for and returns plain
// data; matching happens back in the popup.

export async function collect(probes) {
	const timeout = 2500;
	const textLimit = 400_000;

	const read = (from, path) => {
		let value = from;
		for (const key of path.split(".")) {
			if (value == null) return undefined;
			try {
				value = value[key];
			} catch {
				return undefined;
			}
		}
		return value;
	};

	// A version, when the value is one; `true` when it only exists.
	const plain = (value) => {
		if (typeof value === "string" || typeof value === "number") {
			return String(value);
		}
		if (Array.isArray(value) || value instanceof Set) {
			const first = [...value].find(
				(item) => typeof item === "string" || typeof item === "number",
			);
			return first === undefined ? true : String(first);
		}
		return true;
	};

	const fetchText = async (url, limit = textLimit) => {
		try {
			const response = await fetch(url, {
				cache: "force-cache",
				credentials: "same-origin",
				signal: AbortSignal.timeout(timeout),
			});
			if (!response.ok) return "";
			return (await response.text()).slice(0, limit);
		} catch {
			return "";
		}
	};

	const js = {};
	for (const path of probes.js) {
		const value = read(window, path);
		if (value != null && value !== false) js[path] = plain(value);
	}

	const globals = Object.getOwnPropertyNames(window);
	const jsPrefix = probes.jsPrefix.filter((prefix) =>
		globals.some((name) => name.startsWith(prefix)),
	);

	const dom = {};
	for (const { selector, attr, prop } of probes.dom) {
		let element = null;
		try {
			element = document.querySelector(selector);
		} catch {}
		if (!element) continue;
		const value = attr
			? element.getAttribute(attr)
			: prop
				? read(element, prop)
				: true;
		dom[`${selector}|${attr ?? prop ?? ""}`] = plain(value ?? true);
	}

	const elements = [...document.querySelectorAll("*")].slice(0, 3000);

	const domKey = [];
	const wantedKeys = new Set(probes.domKey);
	for (const element of elements) {
		if (wantedKeys.size === 0) break;
		for (const key of Object.keys(element)) {
			for (const prefix of wantedKeys) {
				if (key.startsWith(prefix)) {
					domKey.push(prefix);
					wantedKeys.delete(prefix);
				}
			}
		}
	}

	// Attribute names a library writes, some of them built at runtime.
	const attrPrefix = new Set();
	for (const element of elements) {
		for (const name of element.getAttributeNames()) {
			for (const prefix of probes.attrPrefix) {
				if (name.startsWith(prefix)) attrPrefix.add(prefix);
			}
		}
	}

	const wantedClasses = new Set(probes.classes);
	const classes = new Set();
	for (const element of elements) {
		for (const name of element.classList ?? []) {
			if (wantedClasses.has(name)) classes.add(name);
		}
	}

	const resources = new Set();
	for (const element of document.querySelectorAll("script[src], link[href]")) {
		resources.add(element.src || element.href);
	}
	for (const entry of performance.getEntriesByType("resource").slice(0, 500)) {
		resources.add(entry.name);
	}

	const meta = {};
	for (const element of document.querySelectorAll(
		"meta[name], meta[property]",
	)) {
		const name = (
			element.getAttribute("name") ?? element.getAttribute("property")
		).toLowerCase();
		meta[name] ??= element.getAttribute("content") ?? "";
	}

	const headers = {};
	const headersRequest = fetch(location.href, {
		method: "HEAD",
		cache: "force-cache",
		credentials: "same-origin",
		signal: AbortSignal.timeout(timeout),
	})
		.then((response) => {
			for (const [name, value] of response.headers) headers[name] = value;
		})
		.catch(() => {});

	// Comments such as `/*! tailwindcss v4 */` never reach the CSSOM, so read
	// the stylesheets as text.
	const stylesheets = [...document.querySelectorAll('link[rel~="stylesheet"]')]
		.map((link) => link.href)
		.slice(0, 8);
	const inlineStyles = [...document.querySelectorAll("style")]
		.map((style) => style.textContent)
		.join("\n");

	// Every script the page loaded: the entry carries the bundler's runtime,
	// and a library can sit in any chunk. The browser has them cached.
	const scripts = [
		...[...document.querySelectorAll('script[type="module"][src]')].map(
			(script) => script.src,
		),
		...[...document.querySelectorAll("script[src]")].map(
			(script) => script.src,
		),
		...[...document.querySelectorAll('link[rel="modulepreload"]')].map(
			(link) => link.href,
		),
		...performance
			.getEntriesByType("resource")
			.filter(
				(entry) =>
					entry.initiatorType === "script" || /\.m?js(\?|$)/.test(entry.name),
			)
			.map((entry) => entry.name),
	]
		.filter((src, index, all) => src && all.indexOf(src) === index)
		.slice(0, 40);

	const [css, sources] = await Promise.all([
		Promise.all(stylesheets.map((href) => fetchText(href))),
		Promise.all(scripts.map((src) => fetchText(src, 2_000_000))),
		headersRequest,
	]);

	// Scripts are matched here, so megabytes of code never leave the page.
	const script = {};
	for (const { source, flags } of probes.script) {
		const regex = new RegExp(source, flags);
		for (const text of sources) {
			const match = regex.exec(text);
			if (!match) continue;
			script[`${source}/${flags}`] = match[1] ?? true;
			break;
		}
	}

	return {
		url: location.href,
		js,
		jsPrefix,
		dom,
		domKey,
		attrPrefix: [...attrPrefix],
		classes: [...classes],
		resources: [...resources],
		meta,
		headers,
		html: document.documentElement.outerHTML.slice(0, textLimit * 2),
		css: [inlineStyles.slice(0, textLimit), ...css].join("\n"),
		script,
	};
}
