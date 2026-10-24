// Scores a page snapshot from `collect` against the technologies. Pure, so
// it runs the same in the popup and in tests.

const threshold = 100;

const domKey = ({ dom, attr, prop }) => `${dom}|${attr ?? prop ?? ""}`;
const scriptKey = (regex) => `${regex.source}/${regex.flags}`;

// What the collector should look for: the parts of each signal that can only
// be read inside the page.
export function probes(technologies) {
	const found = {
		js: new Set(),
		jsPrefix: new Set(),
		domKey: new Set(),
		attrPrefix: new Set(),
		classes: new Set(),
	};
	const dom = new Map();
	const script = new Map();
	const file = new Map();
	for (const { signals } of technologies) {
		for (const signal of signals) {
			if (signal.js) found.js.add(signal.js);
			if (signal.jsPrefix) found.jsPrefix.add(signal.jsPrefix);
			if (signal.domKey) found.domKey.add(signal.domKey);
			if (signal.attrPrefix) found.attrPrefix.add(signal.attrPrefix);
			if (signal.file) {
				file.set(signal.file, {
					path: signal.file,
					source: signal.content.source,
					flags: signal.content.flags,
				});
			}
			if (signal.script) {
				script.set(scriptKey(signal.script), {
					source: signal.script.source,
					flags: signal.script.flags,
				});
			}
			if (signal.classes)
				for (const name of signal.classes) found.classes.add(name);
			if (signal.dom) {
				dom.set(domKey(signal), {
					selector: signal.dom,
					attr: signal.attr,
					prop: signal.prop,
				});
			}
		}
	}
	return {
		js: [...found.js],
		jsPrefix: [...found.jsPrefix],
		domKey: [...found.domKey],
		attrPrefix: [...found.attrPrefix],
		classes: [...found.classes],
		dom: [...dom.values()],
		script: [...script.values()],
		file: [...file.values()],
	};
}

const version = (value) =>
	typeof value === "string" && /\d/.test(value)
		? value.replace(/^v/i, "")
		: undefined;

const test = (regex, text) => {
	const match = typeof text === "string" ? regex.exec(text) : null;
	return match && { version: version(match[1]), text: match[0] };
};

// One line of a signal that matched, for the popup to show as evidence:
// what kind of trace it is, the trace itself, and the value it read.
const clip = (text, max = 60) => {
	const line = String(text).replace(/\s+/g, " ").trim();
	return line.length > max ? `${line.slice(0, max - 1)}…` : line;
};

// A regex source, readable: without the escapes.
const plain = (source) => source.replace(/\\(.)/g, "$1");

function describe(signal, hit, page, byId) {
	if (signal.js)
		return { kind: "Global", text: `window.${signal.js}`, value: hit.version };
	if (signal.jsPrefix) return { kind: "Global", text: `${signal.jsPrefix}…` };
	if (signal.domKey) return { kind: "Element", text: `${signal.domKey}…` };
	if (signal.attrPrefix)
		return { kind: "Attribute", text: `${signal.attrPrefix}…` };
	if (signal.file) return { kind: "File", text: signal.file };
	if (signal.dom)
		return { kind: "Element", text: signal.dom, value: hit.version };
	if (signal.classes)
		return { kind: "Classes", text: signal.classes.slice(0, 3).join(" ") };
	if (signal.script) {
		return {
			kind: "Script",
			text: signal.label ?? clip(plain(signal.script.source)),
		};
	}
	if (signal.found)
		return {
			kind: "Found with",
			text: signal.found.map((id) => byId.get(id)?.name ?? id).join(", "),
		};
	if (signal.meta)
		return {
			kind: "Meta tag",
			text: `<meta name="${signal.meta[0]}">`,
			value: clip(page.meta[signal.meta[0]]),
		};
	if (signal.header)
		return {
			kind: "Header",
			text: signal.header[0],
			value: clip(page.headers[signal.header[0]]),
		};
	const kinds = {
		resource: "Resource",
		html: "HTML",
		css: "Stylesheet",
		url: "URL",
	};
	const kind = Object.keys(kinds).find((key) => signal[key]);
	return { kind: kinds[kind] ?? "Signal", text: clip(hit.text ?? "") };
}

// `false` when the signal is absent, `{ version, text }` when it is present,
// `text` being what a regex matched.
function match(signal, page) {
	if (signal.js) {
		const value = page.js[signal.js];
		return (
			value !== undefined && {
				version: signal.version ? version(value) : undefined,
			}
		);
	}
	if (signal.jsPrefix) return page.jsPrefix.includes(signal.jsPrefix) && {};
	if (signal.domKey) return page.domKey.includes(signal.domKey) && {};
	if (signal.file) return page.file.includes(signal.file) && {};
	if (signal.attrPrefix) {
		return page.attrPrefix.includes(signal.attrPrefix) && {};
	}
	if (signal.script) {
		const value = page.script[scriptKey(signal.script)];
		return value !== undefined && { version: version(value) };
	}
	if (signal.dom) {
		const value = page.dom[domKey(signal)];
		return value !== undefined && { version: version(value) };
	}
	if (signal.classes) {
		const count = signal.classes.filter((name) =>
			page.classes.includes(name),
		).length;
		return count >= (signal.min ?? 1) && {};
	}
	if (signal.resource) {
		for (const url of page.resources) {
			const hit = test(signal.resource, url);
			if (hit) return hit;
		}
		return false;
	}
	if (signal.meta)
		return test(signal.meta[1], page.meta[signal.meta[0]]) || false;
	if (signal.header)
		return test(signal.header[1], page.headers[signal.header[0]]) || false;
	for (const kind of ["html", "css", "url"]) {
		if (signal[kind]) return test(signal[kind], page[kind]) || false;
	}
	return false;
}

export function detect(page, technologies, categories = []) {
	const byId = new Map(technologies.map((tech) => [tech.id, tech]));
	const position = new Map(technologies.map((tech, index) => [tech.id, index]));
	const found = new Map();

	const score = (tech) => {
		let total = 0;
		let firstVersion;
		const evidence = [];
		for (const signal of tech.signals) {
			const hit = signal.found
				? signal.found.every((id) => found.has(id)) && {}
				: match(signal, page);
			if (!hit) continue;
			total += signal.weight ?? 100;
			firstVersion ??= hit.version;
			evidence.push(describe(signal, hit, page, byId));
		}
		if (total >= threshold) {
			found.set(tech.id, { tech, version: firstVersion, evidence });
		}
	};

	// Page evidence first, then what other findings add up to.
	for (const tech of technologies) score(tech);
	for (const tech of technologies) {
		if (!found.has(tech.id) && tech.signals.some((signal) => signal.found)) {
			score(tech);
		}
	}

	// A technology may imply one that implies another, so repeat until
	// nothing changes.
	let changed = true;
	while (changed) {
		changed = false;
		for (const [id, { tech }] of found) {
			if (tech.requires?.some((required) => !found.has(required))) {
				found.delete(id);
				changed = true;
				continue;
			}
			for (const implied of tech.implies ?? []) {
				if (!found.has(implied) && byId.has(implied)) {
					found.set(implied, {
						tech: byId.get(implied),
						version: undefined,
						evidence: [{ kind: "Comes with", text: tech.name }],
					});
					changed = true;
				}
			}
		}
	}

	const order = (tech) => {
		const index = categories.indexOf(tech.category);
		return index === -1 ? categories.length : index;
	};
	return [...found.values()]
		.map(({ tech, version, evidence }) => ({ ...tech, version, evidence }))
		.sort(
			(a, b) => order(a) - order(b) || position.get(a.id) - position.get(b.id),
		);
}
