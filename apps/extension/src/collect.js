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

	const fetchText = async (url, init = {}) => {
		try {
			const response = await fetch(url, {
				cache: "force-cache",
				credentials: "same-origin",
				signal: AbortSignal.timeout(timeout),
				...init,
			});
			if (!response.ok) return "";
			return (await response.text()).slice(0, textLimit);
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

	// The entry scripts carry the bundler's runtime.
	const scripts = [
		...document.querySelectorAll('script[type="module"][src]'),
		...document.querySelectorAll("script[src]"),
	]
		.map((script) => script.src)
		.filter((src, index, all) => all.indexOf(src) === index)
		.slice(0, 6);

	const [css, script] = await Promise.all([
		Promise.all(stylesheets.map((href) => fetchText(href))),
		Promise.all(scripts.map((src) => fetchText(src))),
		headersRequest,
	]);

	return {
		url: location.href,
		js,
		jsPrefix,
		dom,
		domKey,
		classes: [...classes],
		resources: [...resources],
		meta,
		headers,
		html: document.documentElement.outerHTML.slice(0, textLimit * 2),
		css: [inlineStyles.slice(0, textLimit), ...css].join("\n"),
		script: script.join("\n"),
	};
}
