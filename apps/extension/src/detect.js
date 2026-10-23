// Scores a page snapshot from `collect` against the technologies. Pure, so
// it runs the same in the popup and in tests.

const threshold = 100;

const domKey = ({ dom, attr, prop }) => `${dom}|${attr ?? prop ?? ""}`;

// What the collector should look for: the parts of each signal that can only
// be read inside the page.
export function probes(technologies) {
	const found = {
		js: new Set(),
		jsPrefix: new Set(),
		domKey: new Set(),
		classes: new Set(),
	};
	const dom = new Map();
	for (const { signals } of technologies) {
		for (const signal of signals) {
			if (signal.js) found.js.add(signal.js);
			if (signal.jsPrefix) found.jsPrefix.add(signal.jsPrefix);
			if (signal.domKey) found.domKey.add(signal.domKey);
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
		classes: [...found.classes],
		dom: [...dom.values()],
	};
}

const version = (value) =>
	typeof value === "string" && /\d/.test(value)
		? value.replace(/^v/i, "")
		: undefined;

const test = (regex, text) => {
	const match = typeof text === "string" ? regex.exec(text) : null;
	return match && { version: version(match[1]) };
};

// `false` when the signal is absent, `{ version }` when it is present.
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
	for (const kind of ["html", "css", "script", "url"]) {
		if (signal[kind]) return test(signal[kind], page[kind]) || false;
	}
	return false;
}

export function detect(page, technologies, categories = []) {
	const byId = new Map(technologies.map((tech) => [tech.id, tech]));
	const found = new Map();

	for (const tech of technologies) {
		let score = 0;
		let firstVersion;
		for (const signal of tech.signals) {
			const hit = match(signal, page);
			if (!hit) continue;
			score += signal.weight ?? 100;
			firstVersion ??= hit.version;
		}
		if (score >= threshold) found.set(tech.id, { tech, version: firstVersion });
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
					found.set(implied, { tech: byId.get(implied), version: undefined });
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
		.map(({ tech, version }) => ({ ...tech, version }))
		.sort(
			(a, b) =>
				order(a) - order(b) ||
				technologies.indexOf(a) - technologies.indexOf(b),
		);
}
